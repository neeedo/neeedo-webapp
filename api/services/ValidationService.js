var util = require('util'),
  IdValidator = require('../validators/Id'),
  TagsValidator = require('../validators/Tags'),
  SimplePriceValidator = require('../validators/SimplePrice'),
  DemandPriceValidator = require('../validators/DemandPrice'),
  LocationValidator = require('../validators/Location'),
  DistanceValidator = require('../validators/Distance'),
  ImageValidator = require('../validators/Image'),
  OfferValidator = require('../validators/chains/Offer'),
  DemandValidator = require('../validators/chains/Demand'),
  UsernameValidator = require('../validators/Username'),
  EmailValidator = require('../validators/Email'),
  PasswordValidator = require('../validators/Password'),
  MessageBodyValidator = require('../validators/MessageBody'),
  UserValidator = require('../validators/chains/User'),
  LoginValidator = require('../validators/chains/Login'),
  MessageValidator = require('../validators/chains/Message'),
  _ = require('underscore')
;

module.exports = {
  newIdValidator: function (translator) {
    return new IdValidator(translator);
  },

  newTagsValidator: function (translator, minTagCount, maxTagCount) {
    return new TagsValidator(translator, minTagCount, maxTagCount);
  },

  newDemandPriceValidator: function (translator, minAllowedPrice, maxAllowedPrice) {
    return new DemandPriceValidator(translator, minAllowedPrice, maxAllowedPrice);
  },

  newSimplePriceValidator: function (translator, minAllowedPrice, maxAllowedPrice) {
    return new SimplePriceValidator(translator, minAllowedPrice, maxAllowedPrice);
  },

  newLocationValidator: function (translator) {
    return new LocationValidator(translator);
  },

  newDistanceValidator: function (translator, maxDistance) {
    return new DistanceValidator(translator, maxDistance);
  },

  newOfferValidator: function (translator) {
    return new OfferValidator(translator, sails.config.webapp.validations.offer);
  },

  newDemandValidator: function (translator) {
    return new DemandValidator(translator, sails.config.webapp.validations.demand);
  },

  newUserValidator: function (translator) {
    return new UserValidator(translator, sails.config.webapp.validations.user);
  },

  newLoginValidator: function (translator) {
    return new LoginValidator(translator, sails.config.webapp.validations.user);
  },

  newMessageValidator: function (translator) {
    return new MessageValidator(translator, sails.config.webapp.validations.message);
  },

  newUsernameValidator: function (translator, minCount, maxCount) {
    return new UsernameValidator(translator, minCount, maxCount);
  },

  newEMailValidator: function (translator) {
    return new EmailValidator(translator);
  },

  newMessageBodyValidator: function (translator, maxLength) {
    return new MessageBodyValidator(translator, maxLength);
  },

  newPasswordValidator: function (translator, minCount, maxCount) {
    return new PasswordValidator(translator, minCount, maxCount);
  }
};
