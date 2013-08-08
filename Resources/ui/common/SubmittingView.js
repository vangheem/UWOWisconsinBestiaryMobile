

function SubmittingView() {
  var self = this;

  self.win = Ti.UI.createWindow({
    title: 'Submitting data...',
    orientationModes: [Ti.UI.PORTRAIT]
  });
  self.view = Ti.UI.createView({
    backgroundColor:'white'
  });

  self.ind = Titanium.UI.createProgressBar({
    width : 300,
    min : 0,
    max : 100,
    value : 0,
    height : 70,
    color : '#888',
    message : 'Submitting 0%',
    font : {
      fontSize : 14,
      fontWeight : 'bold'
    }
  });

  self.view.add(self.ind);
  self.win.add(self.view);

  self.open = function(){
    self.win.open();
  };

  self.close = function(){
    self.win.close();
  };

  self.updateProgress = function(amount){
    amount = Math.min(amount, 100);
    self.ind.setValue(amount);
    self.ind.setMessage('Submitting ' + amount + '%');
  };

  return self;
}

module.exports = SubmittingView;

