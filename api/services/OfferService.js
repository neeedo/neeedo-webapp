var apiClient = require('neeedo-api-nodejs-client'),
    util = require('util');

var Offer = apiClient.models.Offer;
var OfferService = apiClient.services.Offer;

module.exports = {
  /**
   * Query a given user.
   *
   * @param tags
   * @param latitude
   * @param longitude
   * @param price
   * @param onSuccessCallback will be called by the registered user instance delivered from neeedo API
   * @param onErrorCallBack will be called with an HTTP response object on error
   */
  createOffer: function(tags, latitude, longitude, price, user, onSuccessCallback, onErrorCallBack) {
    try {
      var offerModel = new Offer();
      offerModel.setTags(ApiClientService.toTagArray(tags))
        .setLocation(ApiClientService.newLocation(parseFloat(latitude), parseFloat(longitude)))
        .setPrice(parseFloat(price))
        .setUser(user);

      var offerService = new OfferService();
      offerService.createOffer(offerModel, onSuccessCallback, onErrorCallBack);
    } catch (e) {
      onErrorCallBack(ApiClientService.newError("createOffer:" + e.message, 'Your inputs were not valid.'));
    }
  }
};
