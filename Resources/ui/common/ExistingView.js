var Database = require('ui/common/Database');
var SubmitView = require('ui/common/SubmitView');


function ExistingView(mainView) {
  var self = this;
  self.mainView = mainView;
  self.application = mainView.application;

  self.win = Ti.UI.createWindow({
    title: 'Existing captures',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
  });
  self.view = Ti.UI.createView({
    backgroundColor:'white',
    zindex: 1,
    top: 64
  });

  //some dummy data for our table view
  var tableData = [];
  var db = Database();
  self.data = db.get();
  for(var i=0; i<self.data.length; i++){
    var item = self.data[i];
    var date = new Date(item.date);
    var text = 'Created on ' + date.getDate() + "/" + date.getMonth() + "/" +
               date.getFullYear();
    var row = Ti.UI.createTableViewRow();
    var label = Ti.UI.createLabel({
      text: text,
      textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
      width: '100%',
      color: 'black',
      font: {
        fontSize: 18
      },
      top: 18,
      left: 160
    });

    var imageViewView = Ti.UI.createView({
      width: 150,
      height: 150,
      top: 0,
      left: 5
    });
    var image = db.getFile(item.filename);
    imageViewView.add(Ti.UI.createImageView({
      width: 'auto',
      height: 150,
      canScale : true,
      image: image
    }));
    row.add(imageViewView);
    row.add(label);
    tableData.push(row);
  }
  self.table = Ti.UI.createTableView({
    data:tableData,
  });
  db = null;


  //add behavior
  self.table.addEventListener('click', function(e) {
    var item = self.data[e.index];
    if(item === null || item === undefined){
      Ti.UI.createAlertDialog({
        title: 'Missing',
        message: 'Unexpected error, could not find data for existing item',
        buttonNames: ['OK']
      }).show();
      return;
    }
    var db = Database();
    var fi = db.getFile(item.filename);
    if(!fi.exists()){
      Ti.UI.createAlertDialog({
        title: 'Missing',
        message: 'Unexpected error, could not find photo associated with record',
        buttonNames: ['OK']
      }).show();
      return;
    }
    self.view.remove(self.table);
    var loading = Ti.UI.createLabel({
      text: 'Loading...',
      color: 'black',
      font: {
        fontSize: 24
      }
    });
    self.view.add(loading);
    var view = new SubmitView(self.mainView, item, fi.read());
    // XXX self.win.close();
    view.open();
    self.application.close(self.win);

  });


  self.mainView.addHeader(self.win);
  self.win.add(self.view);
  self.view.add(self.table);


  self.open = function(){
    self.application.openNew(self.win);
  };

  return self;
}

module.exports = ExistingView;
