var apiClient = require('neeedo-api-nodejs-client');

var MessageService = apiClient.services.Message,
  MessageListService = apiClient.services.MessageList,
  ConversationListService = apiClient.services.ConversationList,
  ConversationQuery = apiClient.models.ConversationQuery
  ;

module.exports = {
  newClientMessageService: function() {
    return new MessageService();
  },
  newClientConversationListService: function() {
    return new ConversationListService();
  },
  newClientMessageListService: function() {
    return new MessageListService();
  },
  create: function (req, res, onSuccessCallback, onErrorCallBack) {
    try {
      var messageModel = ApiClientService.validateAndCreateNewMessageFromRequest(req, res,onErrorCallBack);

      if (undefined !== messageModel) {
        var messageService = this.newClientMessageService();
        messageService.create(messageModel, onSuccessCallback, onErrorCallBack);
      }
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createMessage:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadReadConversations: function (req, onSuccessCallback, onErrorCallBack) {
    try {
      var _this = this;

      var readConversationsFromSession = this.loadReadConversationsFromSession(req);

      if (undefined !== readConversationsFromSession) {
        // loaded from session
        sails.log.info('attempt to load read conversations from session, user ID ' +
          (LoginService.userIsLoggedIn(req)
            ? LoginService.getCurrentUser(req).getId()
            : "not logged in")
        );

        onSuccessCallback(readConversationsFromSession);
      } else {
        // load from API
        sails.log.info('attempt to load read conversations from API, user ID ' +
          (LoginService.userIsLoggedIn(req)
            ? LoginService.getCurrentUser(req).getId()
            : "not logged in")
        );

        var onLoadedCallback = function (conversationList) {
          _this.storeReadConversationsInSession(req, conversationList);

          onSuccessCallback(conversationList);
        };

        var conversationService = this.newClientConversationListService();
        var conversationQuery = ApiClientService.newConversationQueryForReadConversations();

        conversationService.loadBySender(LoginService.getCurrentUser(req), conversationQuery, onLoadedCallback, onErrorCallBack);
      }
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createMessage:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadUnReadConversations: function (req, onSuccessCallback, onErrorCallBack) {
    try {
      var conversationService = this.newClientConversationListService();
      var conversationQuery = ApiClientService.newConversationQueryForUnreadConversations();

      // unread conversations need to be loaded by the API all the time
      conversationService.loadBySender(LoginService.getCurrentUser(req), conversationQuery, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("loadUnReadConversations:" + e.message, 'Your inputs were not valid.'));
    }
  },

  getAllConversations: function (req, onSuccessCallback, onErrorCallback) {
    var _this = this;
    var onReadConversationsLoadCallback = function (readConversationList) {
      var onUnreadConversationsLoadCallback = function (unreadConversationList) {
        onSuccessCallback(readConversationList, unreadConversationList);
      };

      _this.loadUnReadConversations(req, onUnreadConversationsLoadCallback, onErrorCallback);
    };

    this.loadReadConversations(req, onReadConversationsLoadCallback, onErrorCallback);
  },

  getNumberOfUnreadConversations: function (req, onSuccessCallback, onErrorCallback) {
    try {
      var onLoadedCallback = function (conversationList) {
        // the number of unread conversations is the actual size of the conversations array
        onSuccessCallback(conversationList.getConversations().length);
      };

      this.loadUnReadConversations(req, onLoadedCallback, onErrorCallback);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("getNumberOfUnreadConversations:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadMessagesFromConversation: function (req, res, onSuccessCallback, onErrorCallBack) {
    try {
      var _this = this;

      var onLoadedCallback = function (messageList) {
        // first store the messages in the session, than continue
        _this.storeMessageListInSession(req, messageList);

        var isRead = req.param("isRead", undefined);

        // if a new / unread conversation was toggled, add it to the read conversations in session
        if ("false" == isRead && 0 < messageList.messages.length) {
          var conversation = messageList.messages[0];
          _this.addToReadConversationsInSession(req, conversation);
        }

        onSuccessCallback(messageList);
      };

      var conversation = ApiClientService.validateAndCreateNewConversationFromRequest(req, res, onErrorCallBack);

      if (undefined !== conversation) {
        var messageListService = this.newClientMessageListService();
        messageListService.loadByConversation(conversation, onLoadedCallback, onErrorCallBack);
      }
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("loadMessagesFromConversation:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadMessage: function (req, res, onLoadCallback, onErrorCallback) {
    var messageId = ApiClientService.validateAndCreateNewMessageIdFromRequest(req, res);

    if (undefined !== messageId) {
      var messageFromSession = this.loadMessageFromSession(req, messageId);

      if (undefined !== messageFromSession) {
        // message was loaded from session
        if (!this.setBelongsToCurrentUser(req, res, messageFromSession)) {
          onErrorCallback(ApiClientService.newError("loadMessage: attempt to load message with ID " + messageId + " that doesn't belong to user",
            "You cannot view messages of other users."));
        } else {
          // loaded from session
          onLoadCallback(messageFromSession);
        }
      } else {
        // message needs to be loaded via API
        var _this = this;
        var onApiLoadedCallback = function (messageList) {
          _this.storeMessageListInSession(req, messageList);

          var message = _this.findMessageInList(messageId, messageList);

          if (undefined == message) {
            onErrorCallback(ApiClientService.newError("loadMessage: message with ID " + messageId + " was not found", 'Your inputs were not valid.'))
          }

          if (!_this.setBelongsToCurrentUser(req, res, loadedMessage)) {
            onErrorCallback(ApiClientService.newError("loadMessage: attempt to load message with ID " + messageId + " that doesn't belong to user",
              "You cannot view messages of other users."));
          } else {
            // loaded via API
            onLoadCallback(message);
          }
        };

        var conversation = ApiClientService.validateAndCreateNewConversationFromRequest(req, res, onErrorCallback);

        if (undefined !== conversation) {
          var conversationListService = this.newClientConversationListService();
          conversationListService.loadBySender(conversation.getSender(), conversation, onApiLoadedCallback, onErrorCallback);
        }
      }
    }
  },

  findMessageInList: function (messageId, messageList) {
    for (var i = 0; i < messageList.getMessages().length; i++) {
      var message = messageList.getMessages()[i];

      if (messageId == message.getId()) {
        return message;
      }
    }

    return undefined;
  },

  loadMessagesFromConversationAndMarkAsRead: function (req, res, onSuccessCallback, onErrorCallback) {
    var _this = this;

    var onConversationloadSuccess = function (messageList) {
      // let's mark the message as read asynchronously without waiting for the response
      _this.loadMessageAndToggleRead(req, res, function (message) {
      }, function (error) {
        sails.log.error("Couldn't mark message as read: " + util.inspect(error));
      });

      onSuccessCallback(messageList);
    };

    this.loadMessagesFromConversation(req, res, onConversationloadSuccess, onErrorCallback);
  },

  loadMessageAndToggleRead: function (req, res, onSuccessCallback, onErrorCallback) {
    var _this = this;

    var onLoadSuccessCallback = function (loadedMessage) {
      _this.toggleRead(loadedMessage, req, onSuccessCallback, onErrorCallback);
    };

    this.loadMessage(req, res, onLoadSuccessCallback, onErrorCallback);
  },

  toggleRead: function (message, req, onSuccessCallback, onErrorCallback) {
    try {
      var _this = this;
      var onToggleSuccessCallback = function (toggledMessage) {
        var conversation = toggledMessage.getConversation();

        //_this.addToReadConversationsInSession(req, conversation);
      };

      var messageService = new MessageService();
      messageService.toggleRead(LoginService.getCurrentUser(req), message, onToggleSuccessCallback, onErrorCallback);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createMessage:" + e.message, 'Your inputs were not valid.'));
    }
  },

  storeReadConversationsInSession: function (req, conversationList) {
    if ("conversations" in req.session) {
      delete req.session.conversations;
    }

    req.session.conversations = conversationList;
  },

  loadReadConversationsFromSession: function (req) {
    if (this.areReadConversationsInSession(req)) {
      return ApiClientService.newConversationList().loadFromSerialized(req.session.conversations.conversations);
    }

    return undefined;
  },

  areReadConversationsInSession: function (req) {
    return "conversations" in req.session && "conversations" in req.session.conversations;
  },

  addToReadConversationsInSession: function (req, conversation) {
    var readConversationsList;
    if (this.areReadConversationsInSession(req)) {
      readConversationsList = this.loadReadConversationsFromSession(req);
    } else {
      readConversationsList = ApiClientService.newConversationList();
    }

    readConversationsList.addConversation(conversation);
    this.storeReadConversationsInSession(req, readConversationsList);
  },

  storeMessageInSession: function (req, messageModel) {
    var messageId = messageModel.getId();

    if (!("messages" in req.session)) {
      req.session.messages = {};
    }

    req.session.messages[messageId] = messageModel;
  },

  storeMessageListInSession: function (req, messageListModel) {
    for (var i = 0; i < messageListModel.getMessages().length; i++) {
      this.storeMessageInSession(req, messageListModel.getMessages()[i]);
    }
  },

  loadMessageFromSession: function (req, messageId) {
    if (this.isMessageInSession(req, messageId)) {
      return ApiClientService.newMessage().loadFromSerialized(req.session.messages[messageId]);
    }

    return undefined;
  },

  isMessageInSession: function (req, messageId) {
    return "messages" in req.session && messageId in req.session.messages && undefined != req.session.messages[messageId];
  },

  getCreateUrl: function () {
    return UrlService.to('/messages/create');
  },

  getMailboxUrl: function () {
    return UrlService.to('/mailbox');
  },

  getViewUrl: function () {
    return UrlService.to('/messages/view/messageId/%%messageId%%/senderId/%%senderId%%');
  },

  buildDefaultMessageForOffer: function (offer, req, res) {
    var msg = res.i18n("Hello %s", offer.getUser().getUsername())
      + ", \n\n"
      + res.i18n("I'm interested in your offer %s.",
        UrlService.getBaseUrl() + OfferService.getViewUrl().replace("%%offerId%%", offer.getId()))
      + "\n"
      + res.i18n("Can you tell me something about it?")
      + "\n\n";

    if (LoginService.userIsLoggedIn(req)) {
      msg += res.i18n("Greetings, %s", LoginService.getCurrentUser(req).getUsername())
      + "\n";

    }

    return msg;
  },

  prepareMessageForView: function (res, message) {
    if (message.getSender().getId() === sails.config.webapp.notifications.user.id) {
      return this.parseOfferIdsAndSetHyperLinks(res, message.getBody());
    } else {
      return this.setHyperLinksInMessageBody(res, message.getBody());
    }
  },

  parseOfferIdsAndSetHyperLinks: function (res, messageBody) {
    var trimmedMessageBody = messageBody.trim();

    if (OfferService.isOfferId(res.i18n, trimmedMessageBody)) {
      var urlToOffer = UrlService.getBaseUrl() + OfferService.getViewUrl().replace("%%offerId%%", trimmedMessageBody);
      return  '<a href="' +  urlToOffer + '">'
        + res.i18n("View matched offer")+ '</a>';
    }

    return trimmedMessageBody;
  },

  /**
   * Replace URLs to offers in message body by hyperlinks.
   * @param res
   * @param messageBody
   * @returns {XML|string|void|*}
   */
  setHyperLinksInMessageBody: function (res, messageBody) {
    var urlToOffer = UrlService.getBaseUrl() + OfferService.getViewUrl().replace("%%offerId%%", "");

    var offerUrlRegex = new RegExp("(" + urlToOffer + OfferService.getOfferIdRegex() + ")");
    return messageBody.replace(offerUrlRegex, '<a href="$1">' + res.i18n("View Offer") + '</a>');
  },

  belongsToCurrentUser: function (req, message) {
    // currently logged in user needs to be either sender or  recipient of the message
    return LoginService.userIsLoggedIn(req)
      && ((undefined !== message.getSender()
      && LoginService.getCurrentUser(req).getId() == message.getSender().getId()
      )
      || (undefined !== message.getRecipient()
      && LoginService.getCurrentUser(req).getId() == message.getRecipient().getId()
      ));
  },

  currentUserIsSender: function (req, message) {
    return LoginService.userIsLoggedIn(req)
      && undefined !== message.getSender()
      && LoginService.getCurrentUser(req).getId() == message.getSender().getId();
  },

  currentUserIsRecipient: function (req, message) {
    return LoginService.userIsLoggedIn(req)
      && undefined !== message.getRecipient()
      && LoginService.getCurrentUser(req).getId() == message.getRecipient().getId();
  },

  setBelongsToCurrentUser: function (req, res, message) {
    if (this.currentUserIsSender(req, message)) {
      message.setSender(LoginService.getCurrentUser(req));
      return true;
    } else if (this.currentUserIsRecipient(req, message)) {
      message.setRecipient(LoginService.getCurrentUser(req));
      return true;
    } else {
      FlashMessagesService.setErrorMessage('You cannot view messages of other users.', req, res);
      return false;
    }
  },

  sendMessageListJsonResponse: function (req, res, messageList) {
    res.status(200);

    var _this = this;
    var isRead = (req.param('isRead') == 'true' ? true : false);

    if (!isRead) {
      this.filterForReadFlag(res, messageList, isRead);
    }

    this.prepareMessageBodiesInList(res, messageList);

    res.json({
      messageList: messageList,
      viewUrl: _this.getViewUrl(),
      maxCharacters: sails.config.webapp.mailbox.previewMaxCharacters,
      currentUser: LoginService.getCurrentUser(req)
    });
  },

  prepareMessageBodiesInList: function(res, messageList) {
    for (var i = 0; i < messageList.getMessages().length; i++) {
      var message = messageList.getMessages()[i];
      message.setBody(this.parseOfferIdsAndSetHyperLinks(res, message.getBody()));
    }
  },

  filterForReadFlag: function (res, messageList, isReadFlag) {
    var messages = [];
    for (var i = 0; i < messageList.getMessages().length; i++) {
      var message = messageList.getMessages()[i];

      if (isReadFlag == message.wasRead()) {
        messages.push(message);
      }
    }

    messageList.messages = messages;
  },
  /**
   * Iterate over each message in the given list and append the rendered HTML to the field 'html'.
   *
   * Use the partial demandsForList.js which are used in the sliders.
   *
   * @param messageList
   * @param req
   * @param res
   * @param callback
   */
  appendHtmlIfDesired: function (messageList, req, res, callback) {
    // check if getHtml parameter is given in request
    var getHtml = req.param('getHtml', undefined);

    if (getHtml && messageList.getMessages().length > 0) {
      var counter = 0;

      _.each(messageList.getMessages(), function (demand) {
          ViewService.renderView(
            "partials/demandsForList",
            {
              demand: demand,
              req: req,
              i18n: res.i18n
            },
            function (html) {
              counter++;

              demand.html = html;

              if (counter == messageList.getDemands().length) {
                // all demands were appended by rendered partial
                callback();
              }
            })
        }
      );
    } else {
      // do not append
      callback();
    }
  },
  /**
   * Send JSON error response.
   *
   * @param res
   * @param errorModel , see neeedo-api-nodejs-client
   */
  sendErrorJsonResponse: function (res, errorModel) {
    sails.log.error('MessageService:sendErrorJsonResponse(): ' + errorModel.getLogMessages()[0]);

    res.status(400);

    res.json({
      message: errorModel.getErrorMessages()[0]
    });
  },

  /**
   * Get user that the current user is having a conversation with by determining the given messageList (response of api client getMessageListByConversation).
   *
   * @param messageList
   * @returns {*}
   */
  getConversationPartner: function (req, messageList) {
    if (messageList.getMessages().length > 0) {
      var message = messageList.getMessages()[0];

      if (message.getSender().getId() == LoginService.getCurrentUser(req).getId()) {
        return message.getRecipient();
      }

      return message.getSender();
    }

    return undefined;
  }
}
;
