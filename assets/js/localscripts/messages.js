var triggered = false;

$(document).ready(function () {
  var nMC = $(".newMsgCount");

  var setUnreadMsgCount = function () {
    if (!triggered) {
      triggered = true;
      $.get("/messages/count")
        .done(function (count) {
          if (count == 0) {
            nMC.hide();
          } else {
            nMC.text(count);
            nMC.show();
          }
        }
      )
    }
  };

  setUnreadMsgCount();
});
