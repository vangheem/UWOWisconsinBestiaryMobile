function ApplicationWindow() {
  var self = this;
  self.largeButtonHeight = 90;
  self.buttonWidth = 300;
  self.buttonHeight = 40;
  self.labelFont = {
    fontSize: 18,
  };
  self.labelColor = 'black';

  //create object instance
  self.mainWin = Ti.UI.createWindow({
    backgroundColor:'#ffffff',
    orientationModes: [Ti.UI.PORTRAIT]
  });

  //create master view container
  self.masterContainer = Ti.UI.createWindow({
    title: 'Wisconsin Bestiary'
  });

  self.add = function(container){
    self.masterContainer.add(container);
  };

  //create iOS specific NavGroup UI
  self.navGroup = Ti.UI.iPhone.createNavigationGroup({
    window: self.masterContainer
  });
  self.mainWin.add(self.navGroup);

  self.open = function(){
    self.mainWin.open();
  };

  self.openNew = function(win){
    self.navGroup.open(win);
  };

  var MainView = require('ui/common/MainView');
  self.mainView = new MainView(self);

  return self;
}

module.exports = ApplicationWindow;
