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
    backgroundColor:'white'
  });

  //some dummy data for our table view
  var tableData = [];
  var db = Database();
  var data = db.get();
  for(var i=0; i<data.length; i++){
    var item = data[i];
    var date = new Date(item.date);
    tableData.push({
      title: 'Date: ' + date.getDate() + "/" + date.getMonth() + "/" +
             date.getFullYear() + " Time: " + date.getHours() + ":" +
             date.getMinutes(),
      filename: item.filename
    });
  }
  self.table = Ti.UI.createTableView({
    data:tableData
  });

  //add behavior
  self.table.addEventListener('click', function(e) {
    var db = Database();
    var item = db.getItem(e.rowData.filename);
    if(item === null){
      Ti.UI.createAlertDialog({
        title: 'Missing',
        message: 'Unexpected error, could not find data for existing item',
        buttonNames: ['OK']
      }).show();
      return;
    }
    var fi = db.getFile(item.filename);
    if(!fi.exists()){
      Ti.UI.createAlertDialog({
        title: 'Missing',
        message: 'Unexpected error, could not find photo associated with record',
        buttonNames: ['OK']
      }).show();
      return;
    }
    self.win.close();
    var view = new SubmitView(self.mainView, item, fi.read());
    view.open();
  });


  self.win.add(self.view);
  self.view.add(self.table);


  self.open = function(){
    self.application.openNew(self.win);
  };

  return self;
}

module.exports = ExistingView;
