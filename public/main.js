$('#encrypt-file').each(function () {
  // Get the template HTML and remove it from the doument
  //var Dropzone = require("enyo-dropzone");
  Dropzone.autoDiscover = false;
  var previewNode = document.querySelector("#template");
  previewNode.id = "";
  var previewTemplate = previewNode.parentNode.innerHTML;
  previewNode.parentNode.removeChild(previewNode);

  var myParams = {}
  var myDropzone = new Dropzone(document.body, { // Make the whole body a dropzone
    url: "/encrypt/file/upload", // Set the url
    thumbnailWidth: 80,
    thumbnailHeight: 80,
    parallelUploads: 20,
    previewTemplate: previewTemplate,
    autoQueue: true, // Make sure the files aren't queued until manually added
    previewsContainer: "#previews", // Define the container to display the previews
    clickable: ".fileinput-button", // Define the element that should be used as click trigger to select files.
    params: myParams
  });

  $('#encrypt-file form input, #encrypt-file form select').change(function () {
    var params = $('#encrypt-file form').serializeArray()
    $.each(params, function (idx, param) {
      myParams[param.name] = param.value
    })
    console.log('myParams', myParams)
  });

  // Update the total progress bar
  myDropzone.on("totaluploadprogress", function(progress) {
    document.querySelector("#total-progress .progress-bar").style.width = progress + "%";
  });

  myDropzone.on("sending", function(file) {
    // Show the total progress bar when upload starts
    document.querySelector("#total-progress").style.opacity = "1";
    // And disable the start button
    $('#actions .cancel').show()
  });

  // Hide the total progress bar when nothing's uploading anymore
  myDropzone.on("queuecomplete", function(progress) {
    document.querySelector("#total-progress").style.opacity = "0";
    $('#actions .cancel').hide()
  });

  $('#actions .cancel').hide()

  myDropzone.on("success", function(file, resp) {
    if (!resp.path) $(file.previewElement).find('.download').html('<i class="glyphicon glyphicon-globe"></i><span>View Gist</span>')
    $(file.previewElement).find('.download').attr('href', resp.url).click(function () {
      myDropzone.removeFile(file)
    })
  });

  document.querySelector("#actions .cancel").onclick = function() {
    myDropzone.removeAllFiles(true);
  };
})