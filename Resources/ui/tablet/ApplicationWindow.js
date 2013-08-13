function ApplicationWindow() {
  var self = this;
  self.largeButtonHeight = 300;
  self.buttonWidth = 500;
  self.buttonHeight = 140;
  self.labelFont = {
    fontSize: 24,
  };
  self.labelColor = 'black';

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
