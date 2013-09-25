function ApplicationWindow() {
  var self = this;
  self.ios = false;
  self.android = true;
  self.largeButtonHeight = '21%';
  self.buttonWidth = 300;
  self.headerLabelTop = 15;
  if(Ti.Platform.displayCaps.platformHeight > 500){
    self.buttonImages = true;
    self.headerLabelFont = {
      fontSize: 32
    };
    self.previewImageTop = '28%';
    self.buttonHeight = '14%';
  } else {
    self.buttonImages = false;
    self.headerLabelFont = {
      fontSize: 28
    };
    self.previewImageTop = '25%';
    self.buttonHeight = '12%';
  }
  self.previewImageHeight = '25%';

  //create object instance
  self.win = Ti.UI.createWindow({
    title:'Wisconsin Bestiary',
    exitOnClose:true,
    backgroundColor:'#ffffff',
    orientationModes: [Ti.UI.PORTRAIT]
  });

  self.add = function(container){
    self.win.add(container);
  };

  self.open = function(){
    self.win.open();
  };

  self.openNew = function(win){
    win.open();
  };

  self.close = function(win){
    win.close();
  };
  var MainView = require('ui/common/MainView');
  self.mainView = new MainView(self);

  return self;
}

module.exports = ApplicationWindow;
