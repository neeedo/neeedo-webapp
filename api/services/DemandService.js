var apiClient = require('neeedo-api-nodejs-client'),
    util = require('util');

var Demand = apiClient.models.Demand;
var DemandList = apiClient.models.DemandList;
var ClientDemandService = apiClient.services.Demand;
var DemandListService = apiClient.services.DemandList;
var MatchingService = apiClient.services.Matching;

module.exports = {
  newDemandListService: function() {
    return new DemandListService();
  },

  /**
   * Load the currently logged in user's demands.
   * @param req
   * @param onSuccessCallback
   * @param onErrorCallback
   */
  loadUsersDemands: function(req, onSuccessCallback, onErrorCallback) {
    try {
      var demandListService = this.newDemandListService();

      var limit = req.param("limit", PaginatorService.getDefaultLimit());
      var pageNumber = req.param("page", PaginatorService.getFirstPageNumber());
      var offset = PaginatorService.calculateOffset(limit, pageNumber);

      demandListService.loadByUser(LoginService.getCurrentUser(req), offset, limit, onSuccessCallback, onErrorCallback);
    } catch (e) {
      onErrorCallback(ApiClientService.newError("loadUsersDemands:" + e.message, 'Your inputs were not valid.'));
    }
  },

  /**
   * Load the most recent demands.
   * @param req
   * @param onSuccessCallback
   * @param onErrorCallback
   */
  loadMostRecentDemands: function(req, onSuccessCallback, onErrorCallback) {
    try {
      var limit = req.param("limit", PaginatorService.getDefaultLimit());
      var pageNumber = req.param("page", PaginatorService.getFirstPageNumber());
      var offset = PaginatorService.calculateOffset(limit, pageNumber);

      var demandListService = this.newDemandListService();
      demandListService.loadMostRecent(offset, limit, onSuccessCallback, onErrorCallback);
    } catch (e) {
      onErrorCallback(ApiClientService.newError("loadMostRecentDemands:" + e.message, "The demands couldn't be loaded. Please contact Neeedo customer care."));
    }
  },

  /**
   * Create a new demand. See neeedo API documentation for the meaning of the parameters.
   *
   * @see https://github.com/neeedo/neeedo-api#create-demand
   * @param mustTags
   * @param shouldTags
   * @param latitude
   * @param longitude
   * @param distance
   * @param minPrice
   * @param maxPrice
   * @param user
   * @param onSuccessCallback
   * @param onErrorCallBack
   */
  createDemand: function(mustTags, shouldTags, latitude, longitude, distance, minPrice, maxPrice, user, onSuccessCallback, onErrorCallBack) {
    try {
      var demandModel = this.newDemand();

      demandModel.setMustTags(ApiClientService.toTagArray(mustTags))
        .setShouldTags(ApiClientService.toTagArray(shouldTags))
        .setLocation(ApiClientService.newLocation(parseFloat(latitude), parseFloat(longitude)))
        .setPrice(ApiClientService.newDemandPrice(parseFloat(minPrice), parseFloat(maxPrice)))
        .setDistance(parseInt(distance))
        .setUser(user);

      var demandService = this.newClientDemandService();
      demandService.createDemand(demandModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      sails.log.error(e);
      onErrorCallBack(ApiClientService.newError("createDemand:" + e.message, 'Your inputs were not valid.'));
    }
  },

  newDemand: function() {
    return new Demand();
  },

  newClientDemandService: function() {
    return new ClientDemandService();
  },

  updateDemand: function(demandModel, mustTags, shouldTags, latitude, longitude, distance, minPrice, maxPrice, onSuccessCallback, onErrorCallBack) {
    try {
      demandModel.setMustTags(ApiClientService.toTagArray(mustTags))
        .setShouldTags(ApiClientService.toTagArray(shouldTags))
        .setLocation(ApiClientService.newLocation(parseFloat(latitude), parseFloat(longitude)))
        .setPrice(ApiClientService.newDemandPrice(parseFloat(minPrice), parseFloat(maxPrice)))
        .setDistance(parseInt(distance));

      var demandService = this.newClientDemandService();
      demandService.updateDemand(demandModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("updateDemand:" + e.message, 'Your inputs were not valid.'));
    }
  },

  deleteDemand: function(demandModel, onSuccessCallback, onErrorCallBack) {
    try {
      var demandService = new ClientDemandService();
      demandService.deleteDemand(demandModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("deleteDemand:" + e.message, 'Your inputs were not valid.'));
    }
  },

  matchOffers: function(demandModel, req, onSuccessCallback, onErrorCallback) {
    try {
      var limit = req.param("limit", PaginatorService.getDefaultLimit());
      var pageNumber = req.param("page", PaginatorService.getFirstPageNumber());
      var offset = PaginatorService.calculateOffset(limit, pageNumber);

      var matchingService = new MatchingService();
      matchingService.matchDemand(demandModel, offset, limit, onSuccessCallback, onErrorCallback);
    } catch (e) {
      onErrorCallback(ApiClientService.newError("matchOffers:" + e.message, 'Your inputs were not valid.'));
    }
  },

  storeInSession: function(req, demandModel) {
    var demandId = demandModel.getId();

    if (! ("demands" in req.session)) {
      req.session.demands = {};
    }

    req.session.demands[demandId] = demandModel;
  },

  storeListInSession: function(req, demandListModel) {
    for (var i=0; i < demandListModel.getDemands().length; i++) {
      DemandService.storeInSession(req, demandListModel.getDemands()[i]);
    }
  },

   removeFromSession: function(req, demandModel) {
     var demandId = demandModel.getId();
     if (this.isInSession(req, demandModel.getId())) {
       req.session.demands[demandId] = undefined;
     }
   },

  loadDemand: function(req, demandId, onLoadCallback, onErrorCallback) {
    if (this.isInSession(req, demandId)) {
      try {
        sails.log.info('Attempt to restore demand with ID ' + demandId + " from session.");

        var demand = new Demand();
        demand.loadFromSerialized(req.session.demands[demandId]);

        onLoadCallback(demand);
      } catch (e) {
        onErrorCallBack(ApiClientService.newError("loadDemand:" + e.message, 'Could not restore demand from session.'));
      }
    } else {
      // load via API
      sails.log.info('Attempt to load demand with ID ' + demandId + " via API.");

      var demandService = new ClientDemandService();
      demandService.load(demandId, LoginService.getCurrentUser(req), onLoadCallback, onErrorCallback);
    }
  },

  isInSession: function(req, demandId) {
    return "demands" in req.session && demandId in req.session.demands && undefined != req.session.demands[demandId];
  },

  getEditUrl: function(demandModel) {
    if (undefined == demandModel.getId()) {
      return '/';
    }

    return 'demands/edit/demandId/' + demandModel.getId();
  },

  getMatchingUrl: function(demandModel) {
    if (undefined == demandModel.getId()) {
      return '/';
    }

    return 'matching/demandId/' + demandModel.getId();
  },

  getDeleteUrl: function(demandModel) {
    if (undefined == demandModel.getId()) {
      return '/';
    }

    return 'demands/delete/demandId/' + demandModel.getId();
  },

  getOverviewUrl: function(demandModel) {
   return '/dashboard';
  },

  belongsToCurrentUser: function(req, demand) {
    return LoginService.userIsLoggedIn(req)
      && undefined !== demand.getUser()
      && LoginService.getCurrentUser(req).getId() == demand.getUser().getId();
  }


};
