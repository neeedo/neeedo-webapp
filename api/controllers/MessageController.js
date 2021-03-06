var util = require('util');

module.exports = {
  create: function (req, res) {
    /*
     * ---------- callbacks ----------
     */
    var onSuccessCallback = function(createdMessage) {
      FlashMessagesService.setSuccessMessage('Your message was sent successfully.', req, res);

      if (!UrlService.redirectToLastRedirectUrl(req, res)) {
        res.redirect('/dashboard');
      }
    };

    var onErrorCallback = function(errorModel) {
      ApiClientService.logMessages(errorModel);
      ApiClientService.addFlashMessages(req, res, errorModel);
      ApiClientService.addFlashMessagesForValidationMessages(req, res, errorModel);

      if (!UrlService.redirectToLastRedirectUrl(req, res)) {
        res.redirect('/dashboard');
      }
    };

    /*
     * ---------- functionality ----------
     */
    if ("POST" == req.method) {
      MessageService.create(req, res, onSuccessCallback, onErrorCallback);
    } else {
      onErrorCallback(ApiClientService.newError("Attempt to do GET on Message::create action", "Your message couldn't be sent."));
    }
  },

  ajaxGetUnreadMessagesCount: function(req, res){
      var onSuccessCallback = function(numberOfUnreadMsg) {
       res.json(numberOfUnreadMsg);
      };
      var onErrorCallback = function(errorModel) {
        res.status(400);
      };

      MessageService.getNumberOfUnreadConversations(req, onSuccessCallback, onErrorCallback);
  },

  mailbox: function(req, res) {
    var onSuccessCallback = function(readConversationList, unreadConversationList) {
      if (0 == unreadConversationList.getConversations().length
        &&  0 == readConversationList.getConversations().length) {
        FlashMessagesService.setSuccessMessage(
          "You didn't recieve any message yet. Have a look at the most recent offers below or create a demand in order to contact the offerors.",
          req, res);
        res.redirect('/dashboard');
      } else {
        res.view('message/mailbox', {
          locals: {
            readConversationList: readConversationList,
            unreadConversationList: unreadConversationList
          }
        });
      }
    };
    var onErrorCallback = function(errorModel) {
      ApiClientService.logMessages(errorModel);
      ApiClientService.addFlashMessages(req, res, errorModel);

      if (!UrlService.redirectToLastRedirectUrl(req, res)) {
        res.redirect('/dashboard');
      }
    };

    MessageService.getAllConversations(req, onSuccessCallback, onErrorCallback);
  },

  ajaxLoadMessagesByConversation: function(req, res) {
    var onSuccessCallback = function(messageList) {
      MessageService.sendMessageListJsonResponse(req, res, messageList);
    };
    var onErrorCallback = function(errorModel) {
      MessageService.sendErrorJsonResponse(res, errorModel);
    };

    MessageService.loadMessagesFromConversation(req, res, onSuccessCallback, onErrorCallback);
  },

  viewMessage: function(req, res) {
    var onSuccessCallback = function(messageList) {
      res.view('message/viewMessage', {
        locals: {
          conversationPartner : MessageService.getConversationPartner(req, messageList),
          messageList : messageList
        }
      });
    };

    var onErrorCallback = function(errorModel) {
      ApiClientService.logMessages(errorModel);
      ApiClientService.addFlashMessages(req, res, errorModel);

      if (!UrlService.redirectToLastRedirectUrl(req, res)) {
        res.redirect('/dashboard');
      }
    };

    MessageService.loadMessagesFromConversationAndMarkAsRead(req, res, onSuccessCallback, onErrorCallback);
  }
};
