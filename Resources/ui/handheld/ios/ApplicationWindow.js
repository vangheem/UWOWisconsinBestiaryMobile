function ApplicationWindow() {
  var self = this;
  self.ios = true;
  self.android = false;
  self.largeButtonHeight = '15%';
  self.buttonWidth = 300;
  self.buttonHeight = '10%';
  self.headerLabelFont = {
    fontSize: 24
  };
  self.headerLabelTop = 20;
  self.buttonImages = false;
  self.previewImageHeight = 100;
  self.previewImageTop = '22%';


  //create object instance
  self.containerWin = Ti.UI.createWindow({
    backgroundColor:'#ffffff',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
  });

  //create master view container
  self.win = Ti.UI.createWindow({
    title: 'Wisconsin Bestiary'
  });

  self.add = function(container){
    self.win.add(container);
  };

  //create iOS specific NavGroup UI
  self.navGroup = Ti.UI.iPhone.createNavigationGroup({
    window: self.win
  });
  self.containerWin.add(self.navGroup);

  self.open = function(){
    self.containerWin.open();
  };

  self.openNew = function(win){
    self.navGroup.open(win);
  };

  self.close = function(win){
    self.navGroup.close(win);
  };

  var MainView = require('ui/common/MainView');
  self.mainView = new MainView(self);

  return self;
}

module.exports = ApplicationWindow;
