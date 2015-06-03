module.exports = {
  /**
   * Method to be called via AJAX
   *
   * @param req
   * @param res
   */
  uploadAjax: function (req, res) {
    FileService.uploadFiles(req, res, FileService.sendSuccessResponse, FileService.sendErrorResponse);
  },

  upload: function (req, res) {
    var processError = function(res, message) {
      ApiClientService.addFlashMessages(req, res, message);

      if (!UrlService.redirectToLastRedirectUrl(req, res)) {
        res.redirect('/dashboard');
      }
    };

    var processSuccess = function(res, message, uploadedFiles) {
      FlashMessagesService.setSuccessMessage(message, req, res);

      if (!UrlService.redirectToLastRedirectUrl(req, res)) {
        res.redirect('/dashboard');
      }
    };

    FileService.uploadFiles(req, res, processSuccess, processError);
  }
}
