var Database = require('ui/common/Database');
var PictureView = require('ui/common/PictureView');
var ProgressIndicator = require('ui/common/ProgressIndicator');
var AudioCaptureView = require('ui/common/AudioCaptureView');
var Form = require('ui/common/submit/Form');

Ti.include('/ui/common/settings.js');


function SubmitView(mainView, data, blob) {
  var self = this;
  self.mainView = mainView;
  self.application = mainView.application;
  self.data = data;
  self.blob = blob;

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

  self.audioBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: "Add audio",
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

  self.submitBtn.addEventListener('click', function(e){
    self.form.submit();
  });

  self.audioBtn.addEventListener('click', function(e){
    var view = new AudioCaptureView(self.mainView);
    view.open();
  });

  self.loadForm = function(html){

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

    var imageViewView = Ti.UI.createView({
      width: 200,
      height: 200
    });
    self.view.add(imageViewView);
    var imageView = Ti.UI.createImageView({
      width: 'auto',
      height: 200,
      canScale : true,
      image: self.blob
    });
    imageViewView.add(imageView);
    imageView.addEventListener('click', function(e){
      var pictureView = new PictureView(self.mainView, self.blob);
      pictureView.open();
    });
    /* XXX do not add audio btn right now */
    self.view.add(self.audioBtn);

    self.form.load();
    // finally, add buttons
    self.view.add(self.discardBtn);
    self.view.add(self.submitBtn);

    /* set some initial data */
    if(self.data.longitude){
      /* hide the input if already set */
      self.form.fields.logitude.widget.setValue(self.data.longitude);
      self.form.fields.altitude.widget.setValue(self.data.altitude);
      self.form.fields.latitude.widget.setValue(self.data.latitude);
    }
    var db = new Database();
    var userData = db.getUserData();
    if(userData){
      self.form.fields['first-name'].widget.setValue(userData.first);
      self.form.fields['last-name'].widget.setValue(userData.last);
      self.form.fields.replyto.widget.setValue(userData.email);
      db = null;
    }
  };

  self.reload = function(){
    self.view.removeAllChildren();
    self.loadForm();
  };

  self.discardBtn.addEventListener('click', function(e){
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

