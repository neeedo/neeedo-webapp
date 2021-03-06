module.exports = {
  calculateOffset: function(limit, pageNumber) {
    return (pageNumber - this.getFirstPageNumber()) * limit;
  },
  getFirstPageNumber: function() {
    return sails.config.webapp.pagination.firstPageNumber;
  },
  getDefaultLimit: function() {
    return sails.config.webapp.pagination.defaultLimit;
  },
  getSettings: function() {
    return {
      limit : this.getDefaultLimit(),
      firstPageNumber : this.getFirstPageNumber()
    };
  }
};
