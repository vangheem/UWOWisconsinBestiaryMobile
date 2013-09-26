function PictureView(mainView, image) {
  var self = this;
  self.mainView = mainView;
  self.application = self.mainView.application;
  self.image = image;
  self.timeoutId = null;
  self.closeLocked = false;
  self.lastScale = 1.0;
  self.currentScale = 1.0;
  self.lastX = null;
  self.lastY = null;

  self.win = Ti.UI.createWindow({
    title: 'Viewing image',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
  });

  self.view = Ti.UI.createImageView({
    image: self.image,
    width:'100%',
    height:'100%',
    top: 0,
    left: 0
  });

  self.win.add(self.view);
  self.mainView.addHeader(self.win);

  self.view.addEventListener('pinch', function(e) {
    var scale = e.scale;
    if(scale > 1.0){
      // this case we're zooming in
      if(self.lastScale < 1.0 || (self.lastScale - scale) > 0.25){
        // was previously zooming out, reset
        self.lastScale = 1.0;
      }
    }else{
      // this case we're zooming out
      if(self.lastScale > 1.0 || (scale - self.lastScale) > 0.25){
        // was previously zooming in, reset
        self.lastScale = 1.0;
      }
    }
    scale = self.currentScale + (scale - self.lastScale);
    self.currentScale = scale;
    self.lastScale = e.scale;
    Ti.API.info('scaled to: ' + scale);
    var t = Ti.UI.create2DMatrix().scale(scale);

    self.view.transform = t;
    self.closeLocked = true;
    if(self.timeoutId !== null){
      clearTimeout(self.timeoutId);
    }
    self.timeoutId = setTimeout(function(){
      self.closeLocked = false;
    }, 100);
  });

  self.view.addEventListener('swipe', function(e){
    var diff = 75;
    if(e.direction === 'left'){
      self.view.left = self.view.left - diff;
    }else if(e.direction === 'right'){
      self.view.left = self.view.left + diff;
    }else if(e.direction === 'up'){
      self.view.top = self.view.top - diff;
    }else{
      self.view.top = self.view.top + diff;
    }
  });

  self.view.addEventListener('click', function(e){
    if(!self.closeLocked){
      self.close();
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

module.exports = PictureView;
