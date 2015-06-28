var apiClient = require('neeedo-api-nodejs-client');

var MessageService = apiClient.services.Message,
    MessageListService = apiClient.services.MessageList,
    ConversationListService = apiClient.services.ConversationList,
    ConversationQuery = apiClient.models.ConversationQuery
  ;

module.exports = {
  create: function (req, onSuccessCallback, onErrorCallBack) {
    try {
      var messageModel = ApiClientService.validateAndCreateNewMessageFromRequest(req, onErrorCallBack);

      var messageService = new MessageService();
      messageService.create(messageModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createMessage:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadReadConversations: function(req, onSuccessCallback, onErrorCallBack) {
    try {
      var _this = this;

      var readConversationsFromSession = this.loadReadConversationsFromSession(req);

      if (undefined !== readConversationsFromSession) {
        // loaded from session
        onSuccessCallback(readConversationsFromSession);
      } else {
        // load from API
        var onLoadedCallback = function (conversationList) {
          _this.storeReadConversationsInSession(req, conversationList);

          onSuccessCallback(conversationList);
        };

        var conversationService = new ConversationListService();
        var conversationQuery = ApiClientService.newConversationQueryForReadMessages();

        conversationService.loadBySender(LoginService.getCurrentUser(req), conversationQuery, onLoadedCallback, onErrorCallBack);
      }
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createMessage:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadUnReadConversations: function(req, onSuccessCallback, onErrorCallBack) {
    try {
      var conversationService = new ConversationListService();
      var conversationQuery = ApiClientService.newConversationQueryForUnreadConversations();

      // unread conversations need to be loaded by the API all the time
      conversationService.loadBySender(LoginService.getCurrentUser(req), conversationQuery, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("loadUnReadConversations:" + e.message, 'Your inputs were not valid.'));
    }
  },

  getNumberOfUnreadConversations: function(req, onSuccessCallback, onErrorCallback) {
    try {
      var onLoadedCallback = function(conversationList) {
        // the number of unread conversations is the actual size of the conversations array
        onSuccessCallback(conversationList.getConversations().length);
      };

      this.loadUnReadConversations(req, onLoadedCallback, onErrorCallback);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("getNumberOfUnreadConversations:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadMessageFromConversation: function(req, onSuccessCallback, onErrorCallBack) {
    try {
      var _this = this;

      var onLoadedCallback = function(messageList) {
        // first store the messages in the session, than continue
        _this.storeMessagesInSession(req, messageList);

        onSuccessCallback(messageList);
      };

      var conversation = ApiClientService.newConversationFromRequest(req);

      var messageListService = new MessageListService();
      messageListService.loadByConversation(conversation, onLoadedCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("loadMessageFromConversation:" + e.message, 'Your inputs were not valid.'));
    }
  },

  loadMessage: function (req, res, onLoadCallback, onErrorCallback) {
    var messageId = ApiClientService.newMessageIdFromRequest(req);

    var messageFromSession = this.loadMessageFromSession(req, messageId);

    if (undefined !== messageFromSession) {
      // message was loaded from session
      if (!this.setBelongsToCurrentUser(req, res, loadedMessage)) {
        onErrorCallback(ApiClientService.newError("loadMessage: attempt to load message with ID " + messageId + " that doesn't belong to user",
          "You cannot view messages of other users."));
      } else {
        // loaded from session
        onSuccessCallback(messageFromSession);
      }
    } else {
      // message needs to be loaded via API
      var _this = this;
      var onApiLoadedCallback = function(messageList) {
        _this.storeMessagesInSession(req, messageList);

        var message = _this.findMessageInList(messageId, messageList);

        if (undefined == message) {
          onErrorCallBack(ApiClientService.newError("loadMessage: message with ID " + messageId + " was not found", 'Your inputs were not valid.'))
        }

        if (!_this.setBelongsToCurrentUser(req, res, loadedMessage)) {
          onErrorCallback(ApiClientService.newError("loadMessage: attempt to load message with ID " + messageId + " that doesn't belong to user",
            "You cannot view messages of other users."));
        } else {
          // loaded via API
          onSuccessCallback(message);
        }
      };

      var conversation = ApiClientService.newConversationFromRequest(req);
      var messageService = new MessageService();
      messageService.loadBySender(conversation.getSender(), conversation, onApiLoadedCallback, onErrorCallback);
    }
  },

  findMessageInList: function(messageId, messageList) {
    for (var i=0; i < messageList.getMessages().length; i++) {
      var message = messageList.getMessages()[i];

      if (messageId == message.getId()) {
        return message;
      }
    }

    return undefined;
  },

  loadMessageAndToggleRead: function(req, res, onSuccessCallback, onErrorCallback) {
    var onLoadSuccessCallback = function (loadedMessage) {
      this.toggleRead(loadedMessage, req, onSuccessCallback, onErrorCallback);
    };

    this.loadMessage(req, onLoadSuccessCallback, onErrorCallback);
  },

  toggleRead: function(message, req, onSuccessCallback, onErrorCallback) {
    try {
      var _this = this;
      var onToggleSuccessCallback = function(toggledMessage) {
        if (toggledMessage.wasRead()) {
          var conversation = toggledMessage.getConversation();

          _this.addToReadConversationsInSession(req, conversation);
        }
      };

      var messageService = new MessageService();
      messageService.toggleRead(message, onToggleSuccessCallback, onErrorCallback);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createMessage:" + e.message, 'Your inputs were not valid.'));
    }
  },

  storeReadConversationsInSession: function (req, conversationList) {
    if (!("conversations" in req.session)) {
      req.session.conversations = {};
    }

    if (!("read" in req.session.conversations)) {
      req.session.conversations.read = [];
    }

    req.session.conversations.read = conversationList;
  },

  loadReadConversationsFromSession: function (req) {
    if (this.areReadConversationsInSession(req)) {
      return ApiClientService.newConversationList().loadFromSerialized(req.session.conversations.read);
    }

    return undefined;
  },

  areReadConversationsInSession: function (req) {
    return "conversations" in req.session && "read" in req.session.conversations;
  },

  addToReadConversationsInSession: function(req, conversation) {
    if (this.areReadConversationsInSession() && undefined !== this.loadReadConversationsFromSession(req)) {
      // only add the conversation to the read ones in the session if there are already some existing. Otherwise, the conversations need to be loaded via API again.
      var readConversationsList = this.loadReadConversationsFromSession(req);
      readConversationsList.addConversation(conversation);
      this.storeReadConversationsInSession(req, readConversationsList);
    }
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
      this.storeInSession(req, messageListModel.getMessages()[i]);
    }
  },

  loadMessageFromSession: function(req, messageId) {
    if (this.isMessageInSession(req, messageId)) {
      return ApiClientService.newMessage().loadFromSerialized(req.session.messages[messageId]);
    }

    return undefined;
  },

  isMessageInSession: function(req, messageId) {
    return "messages" in req.session && demandId in req.session.messages && undefined != req.session.messages[messageId];
  },

  getCreateUrl: function() {
    return UrlService.to('/messages/create');
  },

  getMailboxUrl: function() {
    return UrlService.to('/mailbox');
  },

  buildDefaultMessageForOffer: function(offer, req, res) {
    var msg = res.i18n("Hello %s", offer.getUser().getUsername())
        + ", \n"
        + res.i18n("I'm interested in your offer %s.",
          sails.getBaseurl() + OfferService.getViewUrl().replace("%%offerId%%", offer.getId()))
        + "\n"
        + res.i18n("Can you tell me something about it?")
        + "\n";

    if (LoginService.userIsLoggedIn(req)) {
      msg += res.i18n("Greetings, %s", LoginService.getCurrentUser(req).getUsername())
        + "\n";

    }

    return msg;
  },

  belongsToCurrentUser: function (req, message) {
    // currently logged in user needs to be either sender or  recipient of the message
    return LoginService.userIsLoggedIn(req)
      && ((undefined !== message.getSender()
      && LoginService.getCurrentUser(req).getId() == message.getSender().getId()
      )
      ||  (undefined !== message.getRecipient()
      && LoginService.getCurrentUser(req).getId() == message.getRecipient().getId()
      ));
  },

  currentUserIsSender: function(req, message) {
    return LoginService.userIsLoggedIn(req)
      && undefined !== message.getSender()
      && LoginService.getCurrentUser(req).getId() == message.getSender().getId();
  },

  currentUserIsRecipient: function(req, message) {
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
  }
};