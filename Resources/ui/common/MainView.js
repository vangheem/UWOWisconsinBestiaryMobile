function MainView(application) {
  var self = this;
  self.application = application;


  /* common application setup */
  if (Titanium.Geolocation.locationServicesEnabled === false) {
    Ti.UI.createAlertDialog({
      title:'Location',
      message:'Your device has geo turned off - turn it on ' +
              'or location will not be detected for images.'
    }).show();
  } else {
    if (Titanium.Platform.name != 'android') {
      var authorization = Ti.Geolocation.locationServicesAuthorization;
      Ti.API.info('Authorization: ' + authorization);
      if (authorization == Ti.Geolocation.AUTHORIZATION_DENIED) {
        Ti.UI.createAlertDialog({
          title:'Location',
          message:'You have disallowed geolocation services. ' +
                  'Photos will not have locations with them.'
        }).show();
      } else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
        Ti.UI.createAlertDialog({
          title:'Location',
          message:'Your system has disallowed geolocation services.'
        }).show();
      }
    }
  }
  Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;


  /* setup main window components */
  self.view = Ti.UI.createView({
    backgroundColor:'white',
    zIndex: 1
  });

  self.captureBtn = Ti.UI.createButton({
    top: '15%',
    image: '/images/photo.png',
    title: 'Capture image',
    height: self.application.largeButtonHeight,
    width: self.application.buttonWidth
  });
  self.listingBtn = Ti.UI.createButton({
    title: 'View existing',
    bottom: '15%',
    image: '/images/disk.png',
    height: self.application.largeButtonHeight,
    width: self.application.buttonWidth
  });

  self.view.add(self.captureBtn);
  self.view.add(self.listingBtn);

  self.application.add(self.view);

  /* imports */
  var CaptureView = require('ui/common/CaptureView');
  var ExistingView = require('ui/common/ExistingView');

  /* register event listeners */
  self.captureBtn.addEventListener('click', function(e){
    var view = new CaptureView(self);
    self.application.openNew(view.win);
  });

  self.listingBtn.addEventListener('click', function(e){
    var view = new ExistingView(self);
    self.application.openNew(view.win);
  });

  self.addHeader = function(win){
    var headerView = Ti.UI.createView({
      width: '100%',
      height: 64,
      top: 0,
      left: 0,
      backgroundColor: '#DDDDDD',
      zIndex: 2
    });
    headerView.add(Ti.UI.createImageView({
        width: 'auto',
        height: 'auto',
        top: 0,
        left: 0,
        backgroundColor: '#DDDDDD',
        image: '/images/smallicon.png'
    }));
    headerView.add(Ti.UI.createLabel({
      width: 300,
      text: 'Wisconsin Bestiary',
      top: 10,
      left: 70,
      color: 'black',
      font: {
        fontSize: 32
      }
    }));

    win.add(headerView);
  };
  self.addHeader(self.application.win);


  return self;
}

module.exports = MainView;

