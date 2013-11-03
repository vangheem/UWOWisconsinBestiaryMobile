
function AudioCaptureView(mainView) {
  var self = this;
  self.mainView = mainView;
  self.application = self.mainView.application;

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
    top: '18%',
    title: 'Record',
    height: self.application.largeButtonHeight,
    width: self.application.buttonWidth
  }));
  self.selectBtn = Ti.UI.createButton(self.mainView.buttonOptions({
    title: 'Or select audio from device',
    bottom: '18%',
    height: self.application.largeButtonHeight,
    width: self.application.buttonWidth
  }));


  self.view.add(self.recordBtn);
  self.view.add(self.selectBtn);
  self.win.add(self.view);
  self.mainView.addHeader(self.win);


  self.recordBtn.addEventListener('click', function(e){
  });

  self.selectBtn.addEventListener('click', function(e){
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
