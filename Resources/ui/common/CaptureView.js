var Database = require('ui/common/Database');
var SubmitView = require('ui/common/SubmitView');


function CaptureView(mainView) {
  var self = this;
  self.mainView = mainView;
  self.application = mainView.application;
  self.blob = null;
  self.longitude = null;
  self.latitude = null;
  self.altitude = null;
  self.captureDate = null;

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
  self.detectCoordinatesBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: 'Get current coordinates',
    top: '14%',
    visible: false,
    image: '/images/global.png'
  }));
  self.imageView = Ti.UI.createImageView({
    top: self.application.previewImageTop,
    visible: false,
    height: self.application.previewImageHeight,
    width: 'auto',
    canScale : true
  });


  self.coordinatesLabel = Ti.UI.createLabel({
    bottom: '30%',
    text: ''
  });

  self.saveBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: 'Save for later',
    bottom: '15%',
    image: '/images/disk.png',
    enabled: false
  }));
  self.submitBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: 'Submit',
    bottom: '1%',
    image: '/images/add.png',
    enabled: false
  }));


  self.win.add(self.view);
  self.view.add(self.captureBtn);
  self.view.add(self.detectCoordinatesBtn);
  self.view.add(self.coordinatesLabel);
  self.view.add(self.imageView);
  self.view.add(self.saveBtn);
  self.view.add(self.submitBtn);
  self.mainView.addHeader(self.win);


  self.detectCoordinates = function(){
    Ti.Geolocation.getCurrentPosition(function(e){
      if (!e.success || e.error) {
        alert('Could not detect coordinates. Make sure GPS is on and ' +
              'detecting you location and try again or manually input ' +
              'your coordinates in the next form.');
        // XXX show a detect coordinates button
        self.detectCoordinatesBtn.setVisible(true);
        self.coordinatesLabel.setText('No coordinates detected');
        return;
      } else {
        self.detectCoordinatesBtn.setVisible(false);
      }

      self.longitude = e.coords.longitude;
      self.latitude = e.coords.latitude;
      self.altitude = e.coords.altitude;
      self.coordinatesLabel.setText('Longitude: ' + self.longitude + '\n' +
        'Latitude: ' + self.latitude + '\n' +
        'Altitude: ' + self.altitude + '\n');
    });
  };

  self.captureBtn.addEventListener('click', function(e){
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

    var cameraOptions = {
      mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
      error: function(e){
        // create alert
        var a = Ti.UI.createAlertDialog({title:'Camera'});
        // set message
        if (e.code == Ti.Media.NO_CAMERA){
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
          self.detectCoordinates();
          self.saveBtn.setEnabled(true);
          self.submitBtn.setEnabled(true);
          self.captureDate = new Date();
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
      cameraOptions.overlay = overlay;
    }
    Ti.Media.showCamera(cameraOptions);
  });

  self.saveBtn.addEventListener('click', function(e){
    var db = new Database();
    var data = self.getData();
    db.add(data, self.blob);
    self.application.close(self.win);
  });

  self.submitBtn.addEventListener('click', function(e){
    // store it and then retrieve it for submission
    var db = new Database();
    var data = self.getData();
    var filename = db.add(data, self.blob);
    var fi = db.getFile(filename);
    data = db.getItem(filename);
    var view = new SubmitView(self.mainView, data, fi);
    view.open();
  });

  self.detectCoordinatesBtn.addEventListener('click', function(e){
    self.detectCoordinates();
  });

  self.getData = function(){
    return {
      longitude: self.longitude,
      latitude: self.latitude,
      altitude: self.altitude,
      date: self.captureDate
    };
  };

  self.open = function(){
    self.application.openNew(self.win);
  };

  return self;
}

module.exports = CaptureView;
