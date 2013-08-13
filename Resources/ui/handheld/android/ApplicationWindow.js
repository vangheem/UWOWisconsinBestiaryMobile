function ApplicationWindow() {
  var self = this;
  self.largeButtonHeight = 100;
  self.buttonWidth = 300;
  self.buttonHeight = 90;
  self.headerLabelFont = {
    fontSize: 32
  };
  self.headerLabelTop = 15;

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

  var MainView = require('ui/common/MainView');
  self.mainView = new MainView(self);

  return self;
}

module.exports = ApplicationWindow;
