/*global window, alert, decodeURIComponent, define, Ti, Titanium */

var Database = require('ui/common/Database');
var SubmitView = require('ui/common/submit/View');


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

  var db = Database();

  //some dummy data for our table view
  var tableData = [];
  self.data = db.get();
  for(var i=0; i<self.data.length; i++){
    var item = self.data[i];
    var date = new Date(item.date);
    var text = date.getDate() + "/" + date.getMonth() + "/" +
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
      left: 130
    });

    if(item.filename){
      var fi = db.getFile(item.filename);
      if(fi.exists()){
        var imageViewView = Ti.UI.createView({
          width: 120,
          height: 120,
          top: 0,
          left: 5
        });
        imageViewView.add(Ti.UI.createImageView({
          width: 'auto',
          height: 120,
          canScale : true,
          image: fi
        }));
        row.add(imageViewView);
      }
    }
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
    self.view.remove(self.table);
    var loading = Ti.UI.createLabel({
      text: 'Loading...',
      color: 'black',
      font: {
        fontSize: 24
      }
    });
    self.view.add(loading);
    var db = Database();
    var photo;
    if(item.filename){
      photo = db.getFile(item.filename);
      if(photo.exists()){
        photo = photo.read();
      }
    }
    var audio;
    if(item.audio_filename){
      audio = db.getFile(item.audio_filename);
      if(audio.exists()){
        audio = audio.read();
      }
    }
    var view = new SubmitView(self.mainView, item, photo, audio);
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
