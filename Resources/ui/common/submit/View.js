/*global window, alert, decodeURIComponent, define, Ti, Titanium */

var Database = require('ui/common/Database');
var PictureView = require('ui/common/PictureView');
var ProgressIndicator = require('ui/common/ProgressIndicator');
var AudioCaptureView = require('ui/common/AudioCaptureView');
var Form = require('ui/common/submit/Form');
var CaptureView = require('ui/common/CaptureView');

Ti.include('/ui/common/settings.js');


function SubmitView(mainView, data, photo, audio) {
  var self = this;
  self.mainView = mainView;
  self.application = mainView.application;
  if(!data){
    self.data = {
      date: new Date()
    };
  }else{
    self.data = data;
  }
  if(!photo){
    self.photo = null;
  }else{
    self.photo = photo;
  }
  if(!audio){
    self.audio = null;
  }else{
    self.audio = audio;
  }
  self.audio_ext = 'wav';

  self.win = Ti.UI.createWindow({
    title: 'Submit photo',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
  });
  self.view = Ti.UI.createScrollView({
    backgroundColor:'white',
    contentHeight: 'auto',
    layout: 'vertical',
    top: 64
  });

  self.form = Form(self);

  self.win.add(self.view);
  self.mainView.addHeader(self.win);

  self.open = function(){
    self.application.openNew(self.win);
    self.loadForm();
  };

  self.photoBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: "Add photo",
    height: 130
  }));
  self.audioBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: "Add audio",
    height: 130
  }));
  self.audioLbl = Ti.UI.createLabel({
    text: ""
  });

  self.coordinatesLabel = Ti.UI.createLabel({
    text: ''
  });

  self.saveBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: "Save changes",
    height: 130
  }));
  self.submitBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: "Submit",
    image: '/images/check.png',
    height: 130
  }));
  self.discardBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: "Discard",
    image: '/images/delete.png',
    height: 100
  }));
  self.imageViewView = Ti.UI.createView({
    width: 150,
    height: 150
  });

  self.submitBtn.addEventListener('click', function(){
    self.form.submit(function(result){
      if(result.success){
        var db = new Database();
        var id = self.data.id;
        if(!id){
          id = self.data.filename;
        }
        db.removeItem(self.data.filename);
        db.setUserData(
          self.form.fields['first-name'].widget.getValue(),
          self.form.fields['last-name'].widget.getValue(),
          self.form.fields.replyto.widget.getValue()
        );
        db = null;
        self.application.close(self.win);
      }
    });
  });

  self.audioBtn.addEventListener('click', function(){
    var view = new AudioCaptureView(self, function(audio, ext){
      self.audio = audio;
      self.audio_ext = ext;
      self.setAudioLabel();
    });
    view.open();
  });

  self.photoBtn.addEventListener('click', function(){
    var view = new CaptureView(self.mainView, function(photo){
      self.photo = photo;
      self.data.date = new Date();
      self.detectCoordinates();
      self.showImage();
    });
    view.open();
  });

  self.saveBtn.addEventListener('click', function(){
    // save data to database here...
    var db = new Database();
    data = self.form.getRawData();
    var id = self.data.id;
    if(!id){
      id = self.data.filename;
    }
    if(id){
      // remove existing if there is one
      db.removeItem(id);
    }
    /* don't forget date.. */
    data.date = self.data.date;
    db.add(data, self.photo, self.audio, self.audio_ext);
    self.data = data;
    Ti.UI.createAlertDialog({
      title: 'Success',
      message: 'Data saved.',
      buttonNames: ['OK']
    }).show();
  });

  self.setAudioLabel = function(){
    if(self.audio){
      // XXX detect duration?
      self.audioLbl.setText('Audio file detected');
    }else{
      self.audioLbl.setText('No audio detected');
    }
  };

  self.showImage = function(){
    self.imageViewView.removeAllChildren();
    if(self.photo){
      var imageView = Ti.UI.createImageView({
        width: 'auto',
        height: 150,
        canScale : true,
        image: self.photo
      });
      self.imageViewView.add(imageView);
      imageView.addEventListener('click', function(){
        var pictureView = new PictureView(self.mainView, self.photo);
        pictureView.open();
      });
      self.imageViewView.setHeight(150);
    }else{
	  self.imageViewView.setHeight(0);
    }
  };

  self.detectCoordinates = function(){
    Ti.Geolocation.getCurrentPosition(function(e){
      if (!e.success || e.error) {
        alert('Could not detect coordinates. Make sure GPS is on and ' +
              'detecting you location and try again or manually input ' +
              'your coordinates in the next form.');
        self.coordinatesLabel.setText('No coordinates detected');
        return;
      }
      // Set the field data directly here
      //
      // mispelled on purppose here...
      // they have bad spelling in their form.
      self.form.fields.logitude.setValue(e.coords.longitude);
      self.form.fields.latitude.setValue(e.coords.latitude);
      self.form.fields.altitude.setValue(e.coords.altitude);
      self.data.logitude = e.coords.longitude;
      self.data.latitude = e.coords.latitude;
      self.data.altitude = e.coords.altitude;
      self.setCoordinatesLabel();
    });
  };

  self.setCoordinatesLabel = function(){
  	if(self.data.logitude){
  	  self.coordinatesLabel.setText('Longitude: ' + self.data.logitude + '\n' +
          'Latitude: ' + self.data.latitude + '\n' +
          'Altitude: ' + self.data.altitude + '\n');
    }
  };

  self.loadForm = function(){

    self.view.add(Ti.UI.createLabel({
      text: 'Please fill out the form to finish the submission.',
      width: 'auto',
      height: 'auto',
      color: 'black',
      textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
      top: 10,
      right: 10,
      left: 10,
      bottom: 10,
      font: {
        fontSize: 28
      } 
    }));

    self.view.add(self.photoBtn);
    self.showImage();
    self.view.add(self.imageViewView);

    self.view.add(self.audioBtn);
    self.view.add(self.audioLbl);
    self.setAudioLabel();

    self.view.add(self.coordinatesLabel);

    self.form.load();
    // finally, add buttons
    self.view.add(self.discardBtn);
    self.view.add(self.saveBtn);
    self.view.add(self.submitBtn);

    for(var fieldName in self.data){
      if(self.form.fields[fieldName]){
        // XXX might need to do something more tricky here...
        self.form.fields[fieldName].setValue(self.data[fieldName]);
      }
    }
    self.setCoordinatesLabel();
    /* XXX check wonky case... */
    if(self.data.longitude){
      self.form.fields.logitude.setValue(self.data.longitude);
    }
    var db = new Database();
    var userData = db.getUserData();
    if(userData){
      if(!self.form.fields['first-name'].value()){
        self.form.fields['first-name'].setValue(userData.first);
      }
      if(!self.form.fields['last-name'].value()){
        self.form.fields['last-name'].setValue(userData.last);
      }
      if(!self.form.fields.replyto.value()){
        self.form.fields.replyto.setValue(userData.email);
      }
      db = null;
    }
  };

  self.reload = function(){
    self.view.removeAllChildren();
    self.loadForm();
  };

  self.discardBtn.addEventListener('click', function(){
    var cfm = Ti.UI.createAlertDialog({
      title: 'Discard',
      message: 'Are you certain you want to discard this data? ' +
               'Discarding can not be undone.',
      buttonNames: ['Yes, discard', 'No'],
      cancel: 1
    });

    cfm.addEventListener('click', function(e){
      if (e.index === e.source.cancel){
        return;
      }
      var db = new Database();
      db.removeItem(self.data.filename);
      db = null;
      self.application.close(self.win);
    });
    cfm.show();
  });

  return self;
}

module.exports = SubmitView;

