/*global window, alert, decodeURIComponent, define, Ti, Titanium */
var SubmitView = require('ui/common/submit/View');
var ExistingView = require('ui/common/ExistingView');

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
    if (Titanium.Platform.name !== 'android') {
      var authorization = Ti.Geolocation.locationServicesAuthorization;
      Ti.API.info('Authorization: ' + authorization);
      if (authorization === Ti.Geolocation.AUTHORIZATION_DENIED) {
        Ti.UI.createAlertDialog({
          title:'Location',
          message:'You have disallowed geolocation services. ' +
                  'Photos will not have locations with them.'
        }).show();
      } else if (authorization === Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
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


  self.buttonOptions = function(opts){
    if(!opts.height){
      opts.height = self.application.buttonHeight;
    }
    if(!opts.width){
      opts.width = self.application.buttonWidth;
    }
    if(!self.application.buttonImages && opts.image){
      delete opts.image;
    }
    return opts;
  };

  self.newBtn = Ti.UI.createButton(self.buttonOptions({
    top: '18%',
    image: '/images/photo.png',
    title: 'Start new submission',
    height: self.application.largeButtonHeight,
    width: self.application.buttonWidth
  }));
  self.listingBtn = Ti.UI.createButton(self.buttonOptions({
    title: 'View existing',
    bottom: '18%',
    image: '/images/disk.png',
    height: self.application.largeButtonHeight,
    width: self.application.buttonWidth
  }));

  self.creditLabel = Ti.UI.createLabel({
    bottom: 0,
    width: '100%',
    font: {
      size: 12
    },
    text: 'A Wisconsin Bestiary Website/App was supported by the Faculty ' +
          'Development Program at the University of Wisconsin, Oshkosh',
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
  });

  self.view.add(Ti.UI.createLabel({
    text: 'Thank you for contributing to the Wisconsin Bestiary project',
    top: '5%',
    width: '100%',
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
  }));
  self.view.add(self.newBtn);
  self.view.add(self.listingBtn);
  self.view.add(self.creditLabel);

  self.application.add(self.view);

  /* register event listeners */
  self.newBtn.addEventListener('click', function(){
    var view = new SubmitView(self);
    view.open();
  });

  self.listingBtn.addEventListener('click', function(){
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
      top: self.application.headerLabelTop,
      left: 70,
      color: 'black',
      font: self.application.headerLabelFont
    }));

    win.add(headerView);
  };
  self.addHeader(self.application.win);


  return self;
}

module.exports = MainView;

