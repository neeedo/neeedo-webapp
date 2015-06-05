var apiClient = require('neeedo-api-nodejs-client'),
    util = require('util');

var Offer = apiClient.models.Offer;
var OfferList = apiClient.models.OfferList;
var ClientOfferService = apiClient.services.Offer;
var OfferListService = apiClient.services.OfferList;

module.exports = {
  /**
   * Load the currently logged in user's offers.
   * @param req
   * @param onSuccessCallback
   * @param onErrorCallback
   */
  loadUsersOffers: function(req, onSuccessCallback, onErrorCallback) {
    try {
      var limit = req.param("limit", PaginatorService.getDefaultLimit());
      var pageNumber = req.param("page", PaginatorService.getFirstPageNumber());
      var offset = PaginatorService.calculateOffset(limit, pageNumber);

      var offerListService = new OfferListService();
      offerListService.loadByUser(LoginService.getCurrentUser(req), offset, limit, onSuccessCallback, onErrorCallback);
    } catch (e) {
      onErrorCallback(ApiClientService.newError("loadUsersOffers:" + e.message, 'Your inputs were not valid.'));
    }
  },

  /**
   * Load the most recent demands.
   * @param req
   * @param onSuccessCallback
   * @param onErrorCallback
   */
  loadMostRecentOffers: function(req, onSuccessCallback, onErrorCallback) {
    try {
      var limit = req.param("limit", PaginatorService.getDefaultLimit());
      var pageNumber = req.param("page", PaginatorService.getFirstPageNumber());
      var offset = PaginatorService.calculateOffset(limit, pageNumber);

       var offerListService = new OfferListService();
       offerListService.loadMostRecent(offset, limit, onSuccessCallback, onErrorCallback);
    } catch (e) {
      onErrorCallback(ApiClientService.newError("loadMostRecentOffers:" + e.message, "The offers couldn't be loaded. Please contact Neeedo customer care."));
    }
  },

  /**
   * Query a given user.
   *
   * @param req
   * @param onSuccessCallback will be called by the registered user instance delivered from neeedo API
   * @param onErrorCallBack will be called with an HTTP response object on error
   */
  createOffer: function(req, onSuccessCallback, onErrorCallBack) {
    try {
      var offerModel = ApiClientService.validateAndCreateNewOfferFromRequest(req);

      var offerService = new ClientOfferService();
      offerService.createOffer(offerModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createOffer:" + e.message, 'Your inputs were not valid.'));
    }
  },

  updateOffer: function(offerModel, req, onSuccessCallback, onErrorCallBack) {
    try {
      ApiClientService.validateAndSetOfferFromRequest(req, offerModel, offerModel.getUser(), onErrorCallBack);

      var offerService = new ClientOfferService();
      offerService.updateOffer(offerModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("updateOffer:" + e.message, 'Your inputs were not valid.'));
    }
  },

  deleteOffer: function(offerModel, onSuccessCallback, onErrorCallBack) {
    try {
      var offerService = new ClientOfferService();
      offerService.deleteOffer(offerModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("deleteOffer:" + e.message, 'Your inputs were not valid.'));
    }

  },

  storeInSession: function(req, offerModel) {
    var offerId = offerModel.getId();

    if (! ("offers" in req.session)) {
      req.session.offers = {};
    }

    req.session.offers[offerId] = offerModel;
  },

  storeListInSession: function(req, offersListModel) {
    for (var i=0; i < offersListModel.getOffers().length; i++) {
      OfferService.storeInSession(req, offersListModel.getOffers()[i]);
    }
  },

   removeFromSession: function(req, offerModel) {
     var offerId = offerModel.getId();
     if (this.isInSession(req, offerModel.getId())) {
       req.session.offers[offerId] = undefined;
     }
   },

  loadOffer: function(req, offerId, onLoadCallback, onErrorCallback) {
    if (this.isInSession(req, offerId)) {
      try {
        sails.log.info('Attempt to restore offer with ID ' + offerId + " from session: session centent " +
        util.inspect(req.session.offers[offerId], {
          showHidden: false,
            depth: null
        }));

        var offer = new Offer();
        offer.loadFromSerialized(req.session.offers[offerId]);

        onLoadCallback(offer);
      } catch (e) {
        onErrorCallback(ApiClientService.newError("loadOffer:" + e.message, 'Could not restore offer from session.'));
      }
    } else {
      // load via API
      sails.log.info('Attempt to load offer with ID ' + offerId + " via API.");

      var offerService = new ClientOfferService();
      offerService.load(offerId, LoginService.getCurrentUser(req), onLoadCallback, onErrorCallback);
    }
  },

  isInSession: function(req, offerId) {
    return "offers" in req.session && offerId in req.session.offers && undefined != req.session.offers[offerId];
  },

  getEditUrl: function(offerModel) {
    if (undefined == offerModel.getId()) {
      return '/';
    }

    return 'offers/edit/offerId/' + offerModel.getId();
  },

  getDeleteUrl: function(offerModel) {
    if (undefined == offerModel.getId()) {
      return '/';
    }

    return 'offers/delete/offerId/' + offerModel.getId();
  },

  getOverviewUrl: function(demandModel) {
    return '/dashboard';
  },

  belongsToCurrentUser: function(req, offer) {
    return (LoginService.userIsLoggedIn(req)
      && undefined != offer.getUser()
      && LoginService.getCurrentUser(req).getId() == offer.getUser().getId());
  },

  setBelongsToCurrentUser: function(req, res, offer)
  {
    if (this.belongsToCurrentUser(req, offer)) {
      offer.setUser(LoginService.getCurrentUser(req));
      return true;
    } else {
      FlashMessagesService.setErrorMessage('You cannot edit offers of other users.', req, res);
      return false;
    }
  },

  getFirstImage : function(offer)
  {
    if(offer.getImages().length > 0 ) {
      var firstImage = offer.getImages()[0];
      return FileService.filterGetImageUrl(firstImage.getUrl());
    } else {
      return "/images/Offer_Dummy.png";
    }
  }
};
