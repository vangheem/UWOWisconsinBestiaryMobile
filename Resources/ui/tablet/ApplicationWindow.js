function ApplicationWindow() {
  var self = this;
  self.ios = Ti.Platform.osname === 'ipad' ? true : false;
  self.andoird = Ti.Platform.osname !== 'ipad' ? false : true;
  self.largeButtonHeight = 300;
  self.buttonWidth = 500;
  self.buttonHeight = 140;
  self.headerLabelFont = {
    fontSize: 32
  };
  self.headerLabelTop = 15;
  self.buttonImages = true;
  self.previewImageHeight = 300;
  self.previewImageTop = '28%';


  //create object instance
  self.win = Ti.UI.createWindow({
    title:'Wisconsin Bestiary',
    exitOnClose:true,
    backgroundColor:'#ffffff',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
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
