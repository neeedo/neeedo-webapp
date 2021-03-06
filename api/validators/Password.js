var _ = require('underscore');

function Password(translator, minCount, maxCount) {
  this.errorMessages = [];
  this.minCount = minCount;
  this.maxCount = maxCount;
  
  this.translator = translator;
}

Password.prototype.validateMinAndMax = function(givenPw) {
  if (givenPw.length < this.minCount ) {
    this.errorMessages.push(this.translator("The password must have at least %s characters", this.minCount));
    return false;
  }

  if (givenPw.length > this.maxCount) {
    this.errorMessages.push(this.translator("The password must not have more than %s characters", this.maxCount));
    return false;
  }

  return true;
};

Password.prototype.isValid = function(givenPw)
{
  if (!this.validateMinAndMax(givenPw)) {
    return false;
  }

  return true;
};

Password.prototype.getErrorMessages = function() {
  return this.errorMessages.join(', ');
};

module.exports = Password;
