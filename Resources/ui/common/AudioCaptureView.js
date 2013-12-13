/*global window, alert, decodeURIComponent, define, Ti, Titanium */

function AudioCaptureView(view, callback) {
  var self = this;
  self.view = view;
  self.mainView = self.view.mainView;
  self.application = self.mainView.application;
  if(!callback){
    self.callback = function(audio){
    };
  }else{
    self.callback = callback;
  }

  self.win = Ti.UI.createWindow({
    title: 'Capture Audio',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
  });

  self.view = Ti.UI.createView({
    backgroundColor:'white',
    zindex: 1,
    top: 64
  });

  self.recordBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    top: '35%',
    title: 'Record',
    height: self.application.largeButtonHeight,
    width: self.application.buttonWidth
  }));

  self.view.add(self.recordBtn);
  self.win.add(self.view);
  self.mainView.addHeader(self.win);

  var AndroidRecorder = function(){
    var rcd = this;
    var audioRecorder = require('titutorial.audiorecorder');

    //rcd.action = "android.provider.MediaStore.RECORD_SOUND";

    rcd.start = function(){
      audioRecorder.startRecording({
        outputFormat: audioRecorder.OutputFormat_MPEG_4,
        directoryName : "testdir",
        fileName : "testfile",
        success : function(e) {
          var audioDir = Titanium.Filesystem.getFile(Titanium.Filesystem.externalStorageDirectory, "testdir");
          var audioFile = Ti.Filesystem.getFile(audioDir.resolve(), e.fileName);
          self.callback(audioFile.read(), 'mp4');
          self.close();
        },
        error : function() {
          Ti.UI.createAlertDialog({
            title: 'Failure',
            message: 'There was an error attempting to record',
            buttonNames: ['OK']
          }).show();
          self.close();
        }
      });

      /*
      var intent = Ti.Android.createIntent({action: rcd.action});
      Ti.Android.currentActivity.startActivityForResult(intent, function(e){
        if (e.error){
          Ti.UI.createAlertDialog({
            title: 'Failure',
            message: 'There was an error attempting to record',
            buttonNames: ['OK']
          }).show();
        }else{
          if (e.resultCode === Ti.Android.RESULT_OK) {
            self.callback(Ti.Filesystem.getFile(e.intent.data).read());
            self.close();
          }else{
            Ti.UI.createAlertDialog({
              title: 'Failure',
              message: 'There was an error attempting to record',
              buttonNames: ['OK']
            }).show();
          }
        }
      });
      */
    };

    rcd.stop = function(){
      audioRecorder.stopRecording();
    };

    return rcd;
  };

  var IOSRecorder = function(){
    var rcd = this;
    rcd.recorder = Ti.Media.createAudioRecorder({
      format: Ti.Media.AUDIO_FILEFORMAT_WAVE
    });
    rcd.start = function(){
      rcd.recorder.start();
      self.recordBtn.setTitle('Stop and save');
    };

    rcd.stop = function(){
      self.callback(rcd.recorder.stop().read(), 'wav');
      self.close();
    };
  };

  if(self.application.ios){
    self.recorder = new IOSRecorder();
  }else{
    self.recorder = new AndroidRecorder();
  }

  self.recordBtn.addEventListener('click', function(){
    if(self.recordBtn.title === 'Stop and save'){
      self.recorder.stop();
    }else{
      self.recorder.start();
      self.recordBtn.setTitle('Stop and save');
    }
  });

  self.open = function(){
    self.application.openNew(self.win);
  };

  self.close = function(){
    self.application.close(self.win);
  };

  return self;
}

module.exports = AudioCaptureView;
