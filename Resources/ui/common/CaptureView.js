/*global window, alert, decodeURIComponent, define, Ti, Titanium */

var Database = require('ui/common/Database');
var SubmitView = require('ui/common/submit/View');
var PictureView = require('ui/common/PictureView');


function CaptureView(mainView, callback) {
  var self = this;
  self.mainView = mainView;
  self.application = mainView.application;
  self.blob = null;
  self.longitude = null;
  self.latitude = null;
  self.altitude = null;
  self.pictureView = null;
  if(!callback){
    self.callback = function(photo){
    };
  }else{
    self.callback = callback;
  }

  self.win = Ti.UI.createWindow({
    title: 'Capture',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
  });
  self.view = Ti.UI.createView({
    backgroundColor:'white',
    zIndex: 1,
    top: 64
  });

  self.captureBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: 'Take Picture',
    top: '1%',
    image: '/images/photo.png'
  }));
  self.imageView = Ti.UI.createImageView({
    top: self.application.previewImageTop,
    visible: false,
    height: self.application.previewImageHeight,
    width: 'auto',
    canScale : true
  });

  self.saveBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: 'Finish',
    bottom: '1%',
    image: '/images/add.png',
    enabled: false
  }));


  self.win.add(self.view);
  self.view.add(self.captureBtn);
  self.view.add(self.imageView);
  self.view.add(self.saveBtn);
  self.mainView.addHeader(self.win);

  self.testImage = function(){
    self.blob = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + 'images/smallicon.png');
    self.saveBtn.setEnabled(true);
    self.imageView.setImage(self.blob);
    self.imageView.setVisible(true);
  };

  self.captureBtn.addEventListener('click', function(){
    var button = Titanium.UI.createButton({
      color : '#fff',
      bottom : '10%',
      width : '50%',
      height : '15%',
      font : {
        fontSize : 20,
        fontWeight : 'bold',
        fontFamily : 'Helvetica Neue'
      },
      title : 'Take Picture'
    });

    var overlay = Titanium.UI.createView();
    overlay.add(button);

    button.addEventListener('click', function() {
      Ti.Media.takePicture();
    });
    /*
     * XXX for debugging on iOS  */
    if(Ti.Platform.model === 'google_sdk' || Ti.Platform.model === 'Simulator') {
      self.testImage();
      return;
    }

    var cameraOptions = {
      mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
      error: function(e){
        // create alert
        var a = Ti.UI.createAlertDialog({title:'Camera'});
        // set message
        if (e.code === Ti.Media.NO_CAMERA){
          a.setMessage('Phone does not have a camera');
        } else {
          a.setMessage('Unexpected error using camera: ' + e.code);
        }
        // show alert
        a.show();
      },
      success: function(mediaItem){
        if(mediaItem.success){
          self.blob = mediaItem.media;
          self.saveBtn.setEnabled(true);
          self.imageView.setImage(self.blob);
          self.imageView.setVisible(true);
        } else {
          Ti.UI.createAlertDialog({
            title: 'Photo',
            message: 'No photo was captured'
          });
        }
      }
    };
    if(self.application.ios){
      cameraOptions.autohide = true;
      cameraOptions.showControls = true;
      cameraOptions.allowEditing = true;
      try{
        Ti.Media.switchCamera(Ti.Media.CAMERA_REAR);
      }catch(error){
        //
      }
    }else{
      if(Ti.Platform.version[0] == '4'){
        cameraOptions.overlay = overlay;
      }
    }
    Ti.Media.showCamera(cameraOptions);
  });

  self.saveBtn.addEventListener('click', function(){
    if(self.blob){
      self.callback(self.blob);
      self.application.close(self.win);
    }
  });

  self.imageView.addEventListener('click', function(){
    if(self.blob !== null){
      self.pictureView = new PictureView(self.mainView, self.blob);
      self.pictureView.open();
    }
  });

  self.getData = function(){
    return {
      longitude: self.longitude,
      latitude: self.latitude,
      altitude: self.altitude
    };
  };

  self.open = function(){
    self.application.openNew(self.win);
  };

  return self;
}

module.exports = CaptureView;
