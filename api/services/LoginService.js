var apiClient = require('neeedo-api-nodejs-client'),
    util = require('util');

var Login = apiClient.models.Login;
var LoginService = apiClient.services.Login;
var User = apiClient.models.User;
var OfferList = apiClient.models.OfferList;

module.exports = {
  newClientLoginService: function() {
    return new LoginService();
  },
  /**
   * Login by querying a given user.
   *
   * @param req
   * @param onSuccessCallback will be called by the registered user instance delivered from neeedo API
   * @param onErrorCallBack will be called with an error object
   */
  loginUser: function(req, res, onSuccessCallback, onErrorCallBack) {
    try {
      var _this = this;
      var onUserLoadedSuccess = function(user) {
        // delegate to LoginService to persist User (with his/her access token)
        _this.storeUserInSession(user, req);

        // load users favorites
        FavoritesService.loadUsersFavoriteOffers(
          req,
          res,
          function(favoriteOfferList) {
            onSuccessCallback(user);
          }, function(errorModel) {
            sails.log.error("Error while loading user's favorites: " + util.inspect(errorModel));
            onSuccessCallback(user);
        });
      };
      var loginModel = ApiClientService.validateAndCreateNewLoginFromRequest(req, res, onErrorCallBack);

      if (undefined !== loginModel) {
        var loginService = this.newClientLoginService();
        loginService.loginUser(loginModel, onUserLoadedSuccess, onErrorCallBack);
      }
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("queryUser:" + e.message, "login_internal_error"));
    }
  },

  logoutUser: function(req)
  {
    // invalidate complete session
    req.session.destroy();
  },

  storeUserInSession: function(user, req)
  {
    if (user === null || typeof user !== 'object') {
      throw new Error("Type of user must be object.");
    }

    req.session.user = user;
  },

  userIsLoggedIn: function(req) {
    if (undefined !== this.getCurrentUser(req)
      && false !== this.getCurrentUser(req).hasAccessToken()) {
      return true;
    }

    return false;
  },

  getCurrentUser: function(req) {
    if ("user" in req.session) {
      var user = new User();
      user.offerListConstructor = OfferList;

      return user.loadFromSerialized(req.session.user);
    }

    return undefined;
  },

  redirectToAfterLoginUrl: function(req, res) {
    return UrlService.redirectToLastRedirectUrl(req, res);
  },

  getLoginUrl: function(req) {
    return UrlService.to('/register');
  }
};
