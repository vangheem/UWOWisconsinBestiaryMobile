function ApplicationWindow() {
  var self = this;

  //create object instance
  self.mainWin = Ti.UI.createWindow({
    backgroundColor:'#ffffff',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
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
  self.mainWin.add(navGroup);

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
