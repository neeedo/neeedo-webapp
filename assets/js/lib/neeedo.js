var menuLeft = document.getElementById( 'cbp-spmenu-s1' ),
				body = document.body;

showLeft.onclick = function() {
  classie.toggle( this, 'active' );
  classie.toggle( menuLeft, 'cbp-spmenu-open' );
};

function toggle_visibility(id) {
  var e = document.getElementById(id);
  if(e.style.display == 'none')
    e.style.display = 'block';
  else
    e.style.display = 'none';
}

/* ##############################################
 *
 *              IMAGE UPLOAD
 *
 * #############################################
 */
var files, uploadTargetUrl, errorMessageTarget;

var validate = function() {
  // TODO
  return true;
};

var prepareImages = function(event) {
  // store in files array
  files = event.target.files;
};

var uploadImages = function(event, data) {
  console.log('uploading images...' + util.inspect(files));

  event.stopPropagation();
  event.preventDefault();

  if (validate()) {
    var data = new FormData();

    $.each(files, function (key, value) {
      data.append(key, value);
    });

    $.ajax({
      url: uploadTargetUrl,
      type: 'POST',
      data: data,
      cache: false,
      dataType: 'json',
      processData: false,
      contentType: false,
      success: function (data, textStatus, jqXHR) {
        console.log(data);
        errorMessageTarget.html('<p>' + data.message + '</p>');
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log('Upload error: ' + errorThrown);
        errorMessageTarget.html('<p>Error - unable to upload file. Please contact Neeedo customer care.</p>');
      }
    });
  } else {
    errorMessageTarget.html('<p>Error - unable to upload file.</p>');
  }
};

var deleteImage = function(event) {
  var _this = $(this);

  var imageName = _this.attr('data-imageName');

  // remove from hidden input fields
  $("input[value='" + imageName + "']").remove();

  // remove from display list
  _this.parent().remove();
};


$(document).ready(function () {
  var inputFiles = $('#fileupload-input');
  var fileuploadForm = $('#fileupload');
  errorMessageTarget = $('#fileupload-messages');
  var deleteFileButtons = $('.fileupload-deleteImage');

  uploadTargetUrl = fileuploadForm.attr('action');

  inputFiles.on('change', prepareImages);
  fileuploadForm.on('submit', uploadImages);
  deleteFileButtons.on('click', deleteImage);
});


/* ##############################################
 *
 *              CONTENT ELEMENTS
 *
 * #############################################
 */

$(document).ready(function() {
  $(document).ready(function() {
    $("#lightSliderOffer").lightSlider({
      item:4,
      loop:true,
      slideMove:2,
      easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
      speed:600,
      responsive : [
        {
          breakpoint:800,
          settings: {
            item:3,
            slideMove:1,
            slideMargin:6
          }
        },
        {
          breakpoint:480,
          settings: {
            item:2,
            slideMove:1
          }
        }
      ],
      onSliderLoad: function() {
        $('#lightSliderOffer').removeClass('cS-hidden');
      }
    });
    $("#lightSliderDemand").lightSlider({
      item:4,
      loop:true,
      slideMove:2,
      easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
      speed:600,
      responsive : [
        {
          breakpoint:800,
          settings: {
            item:3,
            slideMove:1,
            slideMargin:6
          }
        },
        {
          breakpoint:480,
          settings: {
            item:2,
            slideMove:1
          }
        }
      ],
      onSliderLoad: function() {
        $('#lightSliderDemand').removeClass('cS-hidden');
      }
    });

  });});

