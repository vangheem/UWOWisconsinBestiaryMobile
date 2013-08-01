Ti.include('/ui/lib/htmlparser.js');
Ti.include('/ui/lib/soupselect.js');
Ti.include('/ui/common/settings.js');

var cssselect = soupselect.select;

var ui = {};
ui.label = function(label){
  return Ti.UI.createLabel({
    text: label,
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
  });
};


var setRequestHeaders = function(req){
  req.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36');
  req.setRequestHeader('Pragma', 'no-cache');
  req.setRequestHeader('Cache-Control', 'no-cache');
};


function TextField(field, container){
  var self = this;
  self.field = field;
  self.container = container;
  self.label = ui.label(self.field.label);
  self.container.add(self.label);
  self.widget = Ti.UI.createTextField({
    borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
    width: Ti.UI.FILL,
    top: 10,
    left: 5,
    right: 5
  });
  self.container.add(self.widget);

  self.data = function(){
    return [[self.field.name, self.value()]];
  };
  self.value = function(){
    return self.widget.getValue();
  };

  self.enable = function(){
    self.widget.setEnabled(true);
  };

  self.disable = function(){
    self.widget.setEnabled(false);
  };

  return self;
}


function Select(field, container){
  var self = this;
  self.field= field;
  self.options = cssselect(self.field.node, 'option');
  self.container = container;
  self.label = ui.label(self.field.label);
  self.container.add(self.label);
  self._value = '';
  if(self.options.length > 0){
    self._value = self.options[0].attribs.value.replace('University of Wisconsin', 'UW');
  }

  self.widget = Ti.UI.createPicker({
    top: 10
  });

  for(var i=0; i<self.options.length; i++){
    var option = self.options[i];
    self.widget.add(Ti.UI.createPickerRow({
      title: option.attribs.value.replace('University of Wisconsin', 'UW')
    }));
  }
  self.widget.setSelectedRow(0, 0, false);
  self.widget.selectionIndicator = true;
  self.container.add(self.widget);

  self.widget.addEventListener('change', function(e){
    self._value = e.row.title.replace('UW', 'University of Wisconsin');
  });

  self.data = function(){
    return [[self.field.name, self.value()]];
  };
  self.value = function(){
    return self._value;
  };

  self.enable = function(){
    self.widget.setEnabled(true);
  };

  self.disable = function(){
    self.widget.setEnabled(false);
  };

  return self;
}


function TextArea(field, container){
  var self = this;
  self.field = field;
  self.container = container;
  self.label = ui.label(self.field.label);
  self.container.add(self.label);

  self.widget = Ti.UI.createTextArea({
    borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
    width: Ti.UI.FILL,
    borderWidth: 2,
    borderColor: '#bbb',
    borderRadius: 5,
    top: 10,
    left: 5,
    right: 5,
    height: 70
  });
  self.container.add(self.widget);

  self.data = function(){
    return [[self.field.name, self.value()]];
  };
  self.value = function(){
    return self.widget.getValue();
  };

  self.enable = function(){
    self.widget.setEnabled(true);
  };

  self.disable = function(){
    self.widget.setEnabled(false);
  };

  return self;
}


function Image(container){
  var self = this;
  self.altitude = '';
  self.longitude = '';
  self.latitude = '';
  self.field = { // fake field object to implement the interface
    required: false,
    label: 'Photograph to append'
  };
  self.label = Ti.UI.createLabel({
    text: self.field.label
  });
  self.pictureLabel = Ti.UI.createLabel({
    text: 'Picutre captured.',
    color: '#98000B',
    borderColor: '#000000',
    borderRadius: 5,
    visible: false
  });

  self.blob = null;
  container.add(self.label);
  container.add(self.pictureLabel);

  self.takePictureBtn = Ti.UI.createButton({
    title: "Take Picture",
    width: 150
  });

  self.enable = function(){
    self.takePictureBtn.setEnabled(true);
  };

  self.disable = function(){
    self.takePictureBtn.setEnabled(false);
  };

  var onSuccess = function(mediaItem){
    if(mediaItem.success){
      self.blob = mediaItem.media;
      // and get current location
      Ti.Geolocation.getCurrentPosition(function(e){
        if (!e.success || e.error) {
          alert('error ' + JSON.stringify(e.error));
          return;
        }

        self.longitude = e.coords.longitude;
        self.latitude = e.coords.latitude;
        self.altitude = e.coords.altitude;
        self.pictureLabel.setVisible(true);
      });
    }
  };

  self.takePictureBtn.addEventListener('click', function(e){
    Ti.Media.showCamera({
      mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO],
      error: function(e){
          // create alert
          var a = Ti.UI.createAlertDialog({title:'Camera'});
          // set message
          if (e.code == Ti.Media.NO_CAMERA){
              a.setMessage('Please run this test on device');
          } else {
              a.setMessage('Unexpected error: ' + e.code);
          }
          // show alert
          a.show();
      },
      success: onSuccess
    });
  });

  container.add(self.takePictureBtn);

  self.data = function(){
    if(self.blob === null){
      return [];
    }
    var values = [['image-to-append_file', self.blob]];
    if(self.altitude){
      values.push(['altitude', self.altitude]);
    }
    if(self.longitude){
      // XXX on purpose spelled wrong because the form is wrong
      values.push(['logitude', self.longitude]);
    }
    if(self.latitude){
      values.push(['latitude', self.latitude]);
    }
    return values;
  };
  self.value = function(){
    return self.blob;
  };

  return self;
}


function HtmlParser(html){
  var self = this;
  self.html = html;
  self.dom = null;
  self.error = null;

  self.handler = new htmlparser.DefaultHandler(function(err, dom) {
    self.error = err;
    self.dom = dom;
  });

  self.parser = new htmlparser.Parser(self.handler);
  self.parser.parseComplete(self.html);

  self.cssselect = function(selector){
    return cssselect(self.dom, selector);
  };

  return self;
}


function NodeField(node){
  // only 2 supported types right now, text and select
  var self = this;
  self.node = node;
  self.type = 'invalid';
  self.name = null;
  self.label = '';
  self.required = false;

  if(cssselect(node, '.plone_jscalendar').length === 0){
    var input = cssselect(node, 'input');
    if(input.length > 0 && input[0].attribs.type == 'text'){
      self.name = input[0].attribs.name;
      if(settings.blacklisted_fields.indexOf(self.name) === -1){
        self.type = 'text';
      }
    } else {
      var select = cssselect(node, 'select');
      if(select.length > 0){
        self.type = 'select';
        self.name = select[0].attribs.name;
      } else {
        var textarea = cssselect(node, 'textarea');
        if(textarea.length > 0){
          self.type = 'textarea';
          self.name = textarea[0].attribs.name;
        }
      }
    }
  }

  // check if it's required
  if(cssselect(node, 'span.required').length > 0){
    self.required = true;
  }

  if(self.type !== 'invalid'){
    var label = cssselect(self.node, 'label');
    if(label.length > 0){
      try{
        self.label = label[0].children[0].raw;
      }catch(e){
        self.label = '';
      }
    }
  }

  return self;
}


function FormHandler(container){
  var self = this;
  self.container = container;
  self.req = null;
  self.formFields = {};
  self.parser = null;
  self.activity = new StatusIndicator(self);

  self.submitBtn = Ti.UI.createButton({
    title: "Submit",
    width: '100%',
    height: 100
  });

  self.submitBtn.addEventListener('click', function(e){
    self.submitForm();
  });

  self.validate = function(){
    for(var fieldname in self.formFields){
      var field = self.formFields[fieldname];
      if(field.field.required && !field.value()){
        Ti.UI.createAlertDialog({
          title: 'Field Required',
          message: 'The ' + field.field.label + ' is required. Please fix and submit again',
          buttonNames: ['OK']
        }).show();
        return false;
      }
      return true;
    }
  };

  self.submitForm = function(){
    if(!self.validate()){
      return;
    }
    if(!Ti.Network.online){
      Ti.UI.createAlertDialog({
        title: 'Network',
        message: 'No network connection detected. Please try submitting again later',
        buttonNames: ['OK']
      }).show();
      return;
    }
    self.activity.show();

    var formData = {}, i=0;
    for(var attrname in settings.form_data){
      formData[attrname] = settings.form_data[attrname];
    }
    var hiddens = self.parser.cssselect(settings.form_selector + ' input[type=hidden]');
    for(i=0; i<hiddens.length; i++){
      var hidden = hiddens[i];
      formData[hidden.attribs.name] = hidden.attribs.value;
    }

    for(var fieldname in self.formFields){
      var field = self.formFields[fieldname];
      var data = field.data();
      for(var i2=0; i2<data.length; i2++){
        var val = data[i2];
        formData[val[0]] = val[1];
      }
    }
    self.req = Ti.Network.createHTTPClient();
    setRequestHeaders(self.req);
    self.req.onload = function(resp){
      var handler = new htmlparser.DefaultHandler(function(err, dom) {
        self.activity.hide();
        if (err) {
          alert('Error: ' + err);
        } else {
          // first check if there were form errors...

          var errors = cssselect(dom, 'div.error');
          for(var i=0; i<errors.length; i++){
            var error = errors[i];
            var field = new NodeField(error);
            if(field.type === 'invalid' && self.formFields[field.name]){
              var ffield = self.formFields[field.name];
              var errorBox = cssselect(error, '.fieldErrorBox');
              if(errorBox.length > 0){
                Ti.UI.createAlertDialog({
                  title: 'Error',
                  message: 'Error in form. Field: ' + ffield.field.label +
                           ', Error: ' + errorBox.children[0].raw +
                           '. Please fix the error and re-submit',
                  buttonNames: ['OK']
                }).show();
                return;
              }
            }
          }
          var success = cssselect(dom, 'p.documentDescription');
          if(success.length > 0 &&
              success[0].children[0].raw.indexOf('Thanks for your input.') !== -1){
            Ti.UI.createAlertDialog({
              title: 'Success',
              message: 'Wisconsin Bestiary Submission Successful',
              buttonNames: ['OK']
            }).show();
            self.reload();
          } else {
            Ti.UI.createAlertDialog({
              title: 'Error',
              message: 'There was an undetected error. Please contact support ' +
                       'or try again.',
              buttonNames: ['OK']
            }).show();
          }
        }
      });
      var parser = new htmlparser.Parser(handler);
      parser.parseComplete(self.req.responseText);
    };
    self.req.onerror = function(resp){
      self.activity.hide();
      var alertDialog = Ti.UI.createAlertDialog({
        title: 'Failure',
        message: 'There was an error submitting the form',
        buttonNames: ['OK']
      });
      alertDialog.show();
    };
    self.req.open('POST', settings.submission_url);
    self.req.send(formData);
  };

  self.loadFormFromHTML = function(html){
    self.formFields = {};
    self.parser = HtmlParser(html);
    var fields = self.parser.cssselect('div.field');
    for(var i=0; i<fields.length; i++){
      var field = new NodeField(fields[i]);
      if(field.type === 'text'){
        self.formFields[field.name] = new TextField(field, self.container);
      } else if(field.type == 'select'){
        self.formFields[field.name] = new Select(field, self.container);
      } else if(field.type == 'textarea'){
        self.formFields[field.name] = new TextArea(field, self.container);
      }
    }
    // finally, add image selector
    self.formFields.image = new Image(self.container);
    self.container.add(self.submitBtn);
    self.activity.hide();
  };

  self.loadForm = function(){
    self.activity.show();
    if(Ti.Network.online){
      var req = Ti.Network.createHTTPClient();
      setRequestHeaders(req);
      req.onload = function(e){
        self.loadFormFromHTML(req.responseText);
      };
      req.onerror = function(e){
        self.loadFormFromHTML(settings.default_form_html);
      };
      req.open('GET', settings.submission_url);
      req.send();
    } else {
      self.loadFormFromHTML(settings.default_form_html);
    }
  };

  self.reload = function(){
    self.container.removeAllChildren();
    self.loadForm();
  };

  return self;
}


function DB(){
  var self = this;
  self.db = null;

  self.open = function(){
    self.db = Ti.Database.open('bestiary');
  };

  self.close = function(){
    self.db.close();
  };

  self.initialize = function(){
    self.db.execute('CREATE TABLE IF NOT EXISTS settings(' +
                   'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                   'name TEXT, value TEXT);');
    self.db.execute('CREATE TABLE IF NOT EXISTS saved(' +
                    'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                    'data TEXT, blob_path TEXT);');
    try{
      self.db.file.setRemoteBackup(false);
    }catch(e){
      //
    }
  };

  self.getHtml = function(){
    var htmlRS = self.db.execute(
        'SELECT id,name,value FROM settings WHERE name="html"');
    if(htmlRS.isValidRow()){
      return htmlRS.fieldByName('value');
    }
    return null;
  };

  self.setHtml = function(html){
    self.db.execute('INSERT INTO settings(name, value) VALUES (?,?)',
                    'html', html);
  };

  return self;
}


function StatusIndicator(formHandler){
  var self = this;
  self.formHandler = formHandler;
  self.indicatorAdded = false;
  self.container = self.formHandler.container;
  self.osname = Ti.Platform.osname;

  self.isIos = (self.osname === 'iphone' || self.osname === 'ipad');
  self.isAndroid = (self.osname === 'android');

  self.sdkVersion = parseFloat(Ti.version);
  self.ActivityIndicatorStyle = null;
  if (self.isIos) {
    self.ActivityIndicatorStyle = Ti.UI.iPhone.ActivityIndicatorStyle;
  } else if (self.sdkVersion >= 3.0){
    self.ActivityIndicatorStyle = Ti.UI.ActivityIndicatorStyle;
  }
  self.actInd = Ti.UI.createActivityIndicator({
    bottom : 10,
    top: 10,
    height:  Ti.UI.FILL,
    width: Ti.UI.FILL,
    message: 'Loading...'
  });
  if (self.ActivityIndicatorStyle) {
    self.actInd.style = self.ActivityIndicatorStyle.PLAIN;
  }
  self.container.parent_window.add(self.actInd);
  self.actInd.hide();

  self.hide = function(){
    self.actInd.hide();
    for(var formname in self.formHandler.formFields){
      self.formHandler.formFields[formname].enable();
    }
    self.formHandler.submitBtn.setEnabled(true);
    self.container.setOpacity(1.0);
  };

  self.show = function(){
    self.actInd.show();
    for(var formname in self.formHandler.formFields){
      self.formHandler.formFields[formname].disable();
    }
    self.formHandler.submitBtn.setEnabled(false);
    self.container.setOpacity(0.8);
  };

  return self;
}


function ApplicationTabGroup(Window) {
  //create module instance
  var self = Ti.UI.createTabGroup();

  // initialize database
//  var db = new DB();
//  db.open();
//  db.initialize();
//  // set default html if not exists
//  if(db.getHtml() === null){
//    db.setHtml(settings.default_form_html);
//  }
//  db.close();

  if (Titanium.Geolocation.locationServicesEnabled === false) {
    Ti.UI.createAlertDialog({
      title:'Location',
      message:'Your device has geo turned off - turn it on ' +
              'or location will not be detected for images.'
    }).show();
  } else {
    if (Titanium.Platform.name != 'android') {
      var authorization = Ti.Geolocation.locationServicesAuthorization;
      Ti.API.info('Authorization: ' + authorization);
      if (authorization == Ti.Geolocation.AUTHORIZATION_DENIED) {
        Ti.UI.createAlertDialog({
          title:'Location',
          message:'You have disallowed geolocation services. ' +
                  'Photos will not have locations with them'
        }).show();
      } else if (authorization == Titanium.Geolocation.AUTHORIZATION_RESTRICTED) {
        Ti.UI.createAlertDialog({
          title:'Location',
          message:'Your system has disallowed geolocation services.'
        }).show();
      }
    }
  }
  Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;

  var winForm = new Window('Bestiary Form');
  var scrollView = Ti.UI.createScrollView({
    contentHeight: 'auto',
    layout: 'vertical'
  });
  winForm.add(scrollView);
  scrollView.parent_window = winForm;

  scrollView.add(Ti.UI.createLabel({
    text: 'Your submissions will help us in great ways. ' +
          'Please fill out the form below.',
    borderColor: '#000000',
    borderRadius: 5,
    width: 'auto',
    height: 'auto',
    backgroundPaddingLeft: 10,
    backgroundPaddingRight: 10,
    backgroundPaddingTop: 10,
    backgroundPaddingBottom: 10,
    top: 10,
    right: 10,
    left: 10,
    bottom: 10,
    font: {
      fontSize: 22
    } 
  }));

  var formHandler = new FormHandler(scrollView);
  formHandler.loadForm();

  var tab1 = Ti.UI.createTab({
    title: 'form',
    icon: '/images/plus@2x.png',
    window: winForm
  });
  winForm.containingTab = tab1;
  self.addTab(tab1);

  /*
  var winSaved = new Window('Previously saved forms');

  var tab2 = Ti.UI.createTab({
    title: 'saved',
    icon: '/images/folder@2x.png',
    window: winSaved
  });
  self.addTab(tab2);
*/

  return self;
}

module.exports = ApplicationTabGroup;
