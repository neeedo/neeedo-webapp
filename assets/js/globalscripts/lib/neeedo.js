/* ##############################################
 *
 *              AJAX functions
 *
 * #############################################
 */


var Offers = function(ajaxEndpoint) {
  this.ajaxEndpoint = ajaxEndpoint;

  this.buildQueryString = function(criteria) {
      var queryParameters = [];

      if ("limit" in criteria) {
         queryParameters.push("limit=" + criteria["limit"]);
      }

      if ("page" in criteria) {
         queryParameters.push("page=" + criteria["page"]);
      }

      if ("lat" in criteria) {
         queryParameters.push("lat=" + criteria["lat"]);
      }

      if ("lng" in criteria) {
         queryParameters.push("lng=" + criteria["lng"]);
      }

      if ("getHtml" in criteria) {
         queryParameters.push("getHtml=1");
      }

      if ("displayFavorite" in criteria) {
         queryParameters.push("displayFavorite=" + criteria['displayFavorite']);
      }

      return "?" + queryParameters.join("&");
  };
};

Offers.prototype.getOffersByCriteria = function(criteria, onLoadSuccessCallback) {
  var requestUrl = this.ajaxEndpoint + this.buildQueryString(criteria);

  $.get(requestUrl)
    .done(function( data ) {
      onLoadSuccessCallback(data);
    })
};

Offers.prototype.getOffersByUrl = function(requestUrl, onLoadSuccessCallback) {
  $.get(requestUrl)
    .done(function( data ) {
      onLoadSuccessCallback(data);
    })
};

var Demands = function(ajaxEndpoint) {
  this.ajaxEndpoint = ajaxEndpoint;

  this.buildQueryString = function(criteria) {
    var queryParameters = [];

    if ("limit" in criteria) {
      queryParameters.push("limit=" + criteria["limit"]);
    }

    if ("page" in criteria) {
      queryParameters.push("page=" + criteria["page"]);
    }

    if ("lat" in criteria) {
      queryParameters.push("lat=" + criteria["lat"]);
    }

    if ("lng" in criteria) {
      queryParameters.push("lng=" + criteria["lng"]);
    }

    if ("getHtml" in criteria) {
      queryParameters.push("getHtml=1");
    }

    return "?" + queryParameters.join("&");
  };
};

Demands.prototype.getDemandsByCriteria = function(criteria, onLoadSuccessCallback) {
  var requestUrl = this.ajaxEndpoint + this.buildQueryString(criteria);

  $.get(requestUrl)
    .done(function( data ) {
      onLoadSuccessCallback(data);
    })
};


var DemandsMatching = function(ajaxEndpoint) {
  this.ajaxEndpoint = ajaxEndpoint;

  this.buildQueryString = function(criteria) {
    var queryParameters = [];

    if ("limit" in criteria) {
      queryParameters.push("limit=" + criteria["limit"]);
    }

    if ("page" in criteria) {
      queryParameters.push("page=" + criteria["page"]);
    }

    if ("getHtml" in criteria) {
      queryParameters.push("getHtml=1");
    }

    return "?" + queryParameters.join("&");
  };
};

DemandsMatching.prototype.getMatchingOffers = function(criteria, onLoadSuccessCallback) {
  var requestUrl = this.ajaxEndpoint + this.buildQueryString(criteria);

  $.get(requestUrl)
    .done(function( data ) {
      onLoadSuccessCallback(data);
    })
};

var Messages = function() {
  this.ajaxEndpoint = '/messages/ajax-load-messages-by-conversation';

  this.buildQueryString = function(criteria) {
    var queryParameters = [];

    // senderId of the user who sent the message (coming from conversation object)
    if ("senderId" in criteria) {
      queryParameters.push("senderId=" + criteria["senderId"]);
    }

    if ("isRead" in criteria) {
      queryParameters.push("isRead=" + criteria["isRead"]);
    }

    return "?" + queryParameters.join("&");
  };
};

Messages.prototype.getMessagesFromSenderAndCurrentlyLoggedIn = function(criteria, onLoadSuccessCallback) {
  var requestUrl = this.ajaxEndpoint + this.buildQueryString(criteria);

  $.get(requestUrl)
    .done(function( data ) {
      onLoadSuccessCallback(data);
    })
};

var Favorites = function() {
  this.ajaxEndpoint = '/favorites/toggle';

  this.buildQueryString = function(criteria) {
    var queryParameters = [];

    // senderId of the user who sent the message (coming from conversation object)
    if ("offerId" in criteria) {
      queryParameters.push("offerId/" + criteria["offerId"]);
    }

    return "/" + queryParameters.join("/");
  };
};

Favorites.prototype.toggleFavorite = function(criteria, onLoadSuccessCallback) {
  var requestUrl = this.ajaxEndpoint + this.buildQueryString(criteria);

  $.get(requestUrl)
    .done(function( data ) {
      onLoadSuccessCallback(data);
    })
};

var Neeedo = function()
{

};

Neeedo.prototype.getApiHttpUrl = function() {
  return $("body").data("apiurlhttp");
};

Neeedo.prototype.getApiHttpsUrl = function() {
  return $("body").data("apiurlhttps");
};

Neeedo.prototype.deg2rad = function deg2rad(deg) {
  return deg * (Math.PI/180)
};

/**
 * Implementation of haversine formula to get the great circle distances between two points.
 * @param position1
 * @param position2
 * @return distance in kilometers
 */
Neeedo.prototype.getDistanceBetweenTwoCoordinatesInKm = function (position1, position2) {
  var EQUATOR_RADIUS = 6378.137;

  var latitude1 = position1.latitude,
      longitude1 = position1.longitude,
      latitude2 = position2.latitude,
      longitude2 = position2.longitude;

  var latitude1Rad = this.deg2rad(latitude1),
      longitudeRad = this.deg2rad(longitude1),
      latitude2Rad = this.deg2rad(latitude2),
      longitude2Rad = this.deg2rad(longitude2)
    ;

  return EQUATOR_RADIUS * Math.acos(Math.sin(latitude1Rad) * Math.sin(latitude2Rad)
      + Math.cos(latitude1Rad) * Math.cos(latitude2Rad) * Math.cos(longitude2Rad - longitudeRad)
    );
};

Neeedo.prototype.filterImageUrl = function(originalUrl) {
  // make use of http instead of https to get the image
  return originalUrl.replace(neeedo.getApiHttpsUrl(), neeedo.getApiHttpUrl());
};

Neeedo.prototype.getGeolocation = function(callback) {
  var failureCallback = function(error) {
    // user didn't allow geoloc, request timed out or other error
    callback(false);
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(callback, failureCallback);
  } else {
    // feature is not available
    callback(false);
  }
};

Neeedo.prototype.getLocation = function(onLocationCallback) {
  var geoCallback = function(position) {
    if (false === position) {
      // TODO fallback to other solution
      onLocationCallback(false);
    } else {
      onLocationCallback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    }
  }

  neeedo.getGeolocation(geoCallback);
};

Neeedo.prototype.formatTimestamp = function (timestampInMilliSeconds) {
  var date = new Date(timestampInMilliSeconds);

  return date.getDate() + "." + (date.getMonth() + 1)  + "." + date.getFullYear()
    + " - " + date.getHours() + ":" + date.getMinutes();
};

var neeedo = new Neeedo();
