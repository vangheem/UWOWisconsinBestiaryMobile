


function ProgressIndicator(mainView) {
  var self = this;
  self.mainView = mainView;
  self.application = self.mainView.application;

  self.win = Ti.UI.createWindow({
    backgroundColor: 'white',
    fullscreen: true
  });

  var style;
  if (Ti.Platform.name === 'iPhone OS'){
    style = Ti.UI.iPhone.ActivityIndicatorStyle.DARK;
  }
  else {
    style = Ti.UI.ActivityIndicatorStyle.DARK;
  }
  self.activityIndicator = Ti.UI.createActivityIndicator({
    color: 'green',
    font: {fontFamily:'Helvetica Neue', fontSize:26, fontWeight:'bold'},
    message: 'Loading...',
    style:style,
    top:10,
    left:10,
    height:Ti.UI.SIZE,
    width:Ti.UI.SIZE
  });

  self.win.add(self.activityIndicator);

  self.show = function(){
    self.win.open();
  };

  self.hide = function(){
    self.win.hide();
  };

  return self;
}

module.exports = ProgressIndicator;

