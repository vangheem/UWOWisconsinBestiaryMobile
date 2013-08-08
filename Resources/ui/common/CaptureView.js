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
    backgroundColor:'white'
  });

  self.captureBtn = Ti.UI.createButton({
    title: 'Take Picture',
    top: '10%'
  });
  self.detectCoordinatesBtn = Ti.UI.createButton({
    title: 'Get current coordinates',
    top: '15%',
    visible: false
  });
  self.imageView = Ti.UI.createImageView({
    top: '25%',
    visible: false
  });

  self.saveBtn = Ti.UI.createButton({
    title: 'Save for later',
    bottom: '25%',
    visible: false
  });
  self.submitBtn = Ti.UI.createButton({
    title: 'Submit',
    bottom: '10%',
    visible: false
  });


  self.win.add(self.view);
  self.view.add(self.captureBtn);
  self.view.add(self.imageView);
  self.view.add(self.saveBtn);
  self.view.add(self.submitBtn);


  self.detectCoordinates = function(){
    Ti.Geolocation.getCurrentPosition(function(e){
      if (!e.success || e.error) {
        alert('Could not detect coordinates. Make sure GPS is on and ' +
              'detecting you location and try again.');
        // XXX show a detect coordinates button
        self.detectCoordinatesBtn.setVisible(true);
        return;
      }

      self.longitude = e.coords.longitude;
      self.latitude = e.coords.latitude;
      self.altitude = e.coords.altitude;
    });
  };

  self.captureBtn.addEventListener('click', function(e){
    Ti.Media.showCamera({
      mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
      error: function(e){
        // create alert
        var a = Ti.UI.createAlertDialog({title:'Camera'});
        // set message
        if (e.code == Ti.Media.NO_CAMERA){
          a.setMessage('Phone does not have a camera');
        } else {
          a.setMessage('Unexpected error: ' + e.code);
        }
        // show alert
        a.show();
      },
      success: function(mediaItem){
        if(mediaItem.success){
          self.blob = mediaItem.media;
          self.detectCoordinates();
          self.saveBtn.setVisible(true);
          self.submitBtn.setVisible(true);
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
    });
  });

  self.saveBtn.addEventListener('click', function(e){
    var db = new Database();
    var data = self.getData();
    db.add(data, self.blob);
    self.win.close();
  });

  self.submitBtn.addEventListener('click', function(e){
    self.win.close();
    var data = self.getData();
    var view = new SubmitView(self.mainView, data, self.blob);
    self.application.openNew(view.win);
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
