var should = require('should'),
    sinon = require('sinon'),
    apiClient = require('neeedo-api-nodejs-client'),
    demandController = require('../../api/controllers/DemandController'),
    req = require('../../node_modules/sails/node_modules/express/lib/request')
  ;

var User = apiClient.models.User;

var givenAPostRequestWithDemandParameters = function() {
  req.method = 'POST';

  // let's overwrite param function to return Demand request data
  req.param = function(paramName) {
    switch (paramName) {
      case 'mustTags' : return "tag1,tag2";
      case 'shouldTags' : return "tag3,tag4";
      case 'minPrice' : return 0;
      case 'maxPrice' : return 10;
      case 'lat' : return 55.555;
      case 'lng' : return 55.555;
      case 'distance' : return 10;
    }
  };

  return req;
};

var givenAGetRequest = function() {
  req.method = 'GET';

  return req;
};

var givenAResponse = function() {
  return sinon.stub({ view : function(path, variables) {}});
}

var givenADemandService = function() {
  return sinon.stub(sails.services.demandservice, 'createDemand');
};

var restoreDemandService = function() {
  sails.services.demandservice.createDemand.restore();
};

var givenAUserService = function() {
  return sinon.stub(sails.services.loginservice, 'getCurrentUser');
};

var restoreUserService = function() {
  sails.services.loginservice.getCurrentUser.restore();
};

//#############################
// TESTS
//#############################

describe('[UNIT TEST] DemandController', function() {

  describe('create action', function() {
    var stubbedReq, stubbedRes;

    before(function(done){
      stubbedReq = givenAGetRequest();

      stubbedRes = givenAResponse();
      done();
    });

    after(function(done){

      done();
    });

    it('should print default demand values on GET', function (done) {
      this.timeout(20000);

      demandController.create(stubbedReq, stubbedRes);

      stubbedRes.view.calledWith(
        'demand/create', {
          locals: {
            mustTags: "tag1, tag2,...",
            shouldTags: "tag1, tag2,...",
            minPrice: 0,
            maxPrice: 50,
            lat: 35.92516,
            lng: 12.37528,
            distance: 30,
            btnLabel: 'Create'
          }
        }
      ).should.be.True;

      done();
    });
  });

  describe('create action', function() {
      var stubbedReq, stubbedRes, demandService, userService;

      before(function(done){
        stubbedReq = givenAPostRequestWithDemandParameters();
        res = sinon.stub();
        demandService = givenADemandService();
        userService = givenAUserService();

        done();
      });

      after(function(done){
        restoreDemandService();
        restoreUserService();

        done();
      });

    it('should delegate to DemandService on POST', function (done) {
      this.timeout(20000);

      demandController.create(stubbedReq, stubbedRes);

      demandService.calledOnce.should.be.True;
      demandService.calledWith("tag1,tag2", "tag3,tag4", 55.555, 55.555, 10, 0, 10).should.be.True;

      userService.calledOnce.should.be.True;

      done();
    });
  });
});
