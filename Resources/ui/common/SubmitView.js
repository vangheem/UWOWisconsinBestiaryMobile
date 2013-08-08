var Database = require('ui/common/Database');
var SubmittingView = require('ui/common/SubmittingView');

Ti.include('/ui/lib/htmlparser.js');
Ti.include('/ui/lib/soupselect.js');
Ti.include('/ui/common/settings.js');

var cssselect = soupselect.select;

var ui = {};
ui.label = function(label){
  return Ti.UI.createLabel({
    text: label,
    textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
    font: { fontSize:25 }
  });
};


var setRequestHeaders = function(req){
  req.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36');
  req.setRequestHeader('Pragma', 'no-cache');
  req.setRequestHeader('Cache-Control', 'no-cache');
};

var TEXT = 'text';
var SELECT = 'select';
var TEXTAREA = 'textarea';
var HIDDEN = 'hidden';


var FIELDS = [
  {
    name: 'first-name',
    label: 'First Name',
    required: true,
    type: TEXT
  },{
    name: 'last-name',
    label: 'Last Name',
    required: true,
    type: TEXT
  },{
    name: 'replyto',
    label: 'Your E-Mail address',
    required: true,
    type: TEXT
  },{
    name: 'school-affiliation',
    label: 'Affiliation',
    required: false,
    type: SELECT,
    options: ['UW - Oshkosh', 'UW - Eau Claire', 'UW - Extension',
              'UW - Green Bay', 'UW - La Crosse', 'UW - Madison',
              'UW - Milwaukee', 'UW - Parkside', 'UW - Platteville',
              'UW - River Falls', 'UW - Stevens Point', 'UW - Stout',
              'UW - Superior', 'UW - Whitewater', 'Mosquito Hill Nature Center',
              'Other']
  },{
    name: 'county',
    label: 'County',
    required: false,
    type: SELECT,
    options: ["Adams", "Ashland", "Barron", "Bayfield", "Brown", "Buffalo",
              "Burnett", "Calumet", "Chippewa", "Clark", "Columbia", "Crawford",
              "Dane", "Dodge", "Door", "Douglas", "Dunn", "Eau Claire",
              "Florence", "Fond du Lac", "Forest", "Grant", "Green",
              "Green Lake", "Iowa", "Iron", "Jackson", "Jefferson", "Juneau",
              "Kenosha", "Kewaunee", "LaCrosse", "Lafayette", "Langlade",
              "Lincoln", "Manitowoc", "Marathon", "Marinette", "Marquette",
              "Menominee", "Milwaukee", "Monroe", "Oconto", "Oneida",
              "Outagamie", "Ozaukee", "Pepin", "Pierce", "Polk", "Portage",
              "Price", "Racine", "Richland", "Rock", "Rusk", "Saint Croix",
              "Sauk", "Sawyer", "Shawano", "Sheboygan", "Taylor", "Trempealeau",
              "Vernon", "Vilas", "Walworth", "Washburn", "Washington",
              "Waukesha", "Waupaca", "Waushara", "Winnebago", "Wood"]
  },{
    name: 'animal',
    label: 'Group/Phyla',
    type: SELECT,
    options: ["ameba", "amphibians", "bird", "centipedes", "crustacean",
              "fish", "flagellate", "hydrai", "insect", "leech", "mammal",
              "millpedes", "mussels", "reptile", "rotifer", "slug/snails",
              "sponge", "ticks/spiders", "unsure"]
  },{
    name: 'species',
    label: 'Species',
    required: false,
    type: TEXT
  },{
    name: 'specific-text-you-would-like-used-to-acknowledge-photograph-interesting-anecdote-submission',
    label: 'Additional Information about image',
    required: false,
    type: TEXTAREA
  }
];


var TYPES = {};


function TextField(field, container){
  var self = this;
  self.field = field;
  self.container = container;
  self.label = ui.label(self.field.label);
  self.container.add(self.label);
  var keyboardType = Ti.UI.KEYBOARD_ASCII;
  if(field.name.indexOf('email') !== -1 ||
      field.name.indexOf('replyto') !== -1){
    keyboardType = Ti.UI.KEYBOARD_EMAIL;
  }
  self.widget = Ti.UI.createTextField({
    borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
    width: Ti.UI.FILL,
    top: 10,
    left: 5,
    right: 5,
    keyboardType: keyboardType
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
TYPES[TEXT] = TextField;


function Select(field, container){
  var self = this;
  self.field= field;
  self.container = container;
  self.options = self.field.options;
  self.label = ui.label(self.field.label);
  self.container.add(self.label);
  self._value = '';
  if(self.field.options.length > 0){
    self._value = self.options[0];
  }

  self.widget = Ti.UI.createPicker({
    top: 10
  });

  for(var i=0; i<self.options.length; i++){
    var option = self.options[i];
    self.widget.add(Ti.UI.createPickerRow({title: option}));
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
TYPES[SELECT] = Select;


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
TYPES[TEXTAREA] = TextArea;


function Hidden(field, container){
  var self = this;
  self.field = field;

  self.data = function(){
    return [[self.field.name, self.value()]];
  };
  self.value = function(){
    return self.field.value;
  };

  self.enable = function(){};
  self.disable = function(){};

  return self;
}
TYPES[HIDDEN] = Hidden;



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


function SubmitView(mainView, data, blob) {
  var self = this;
  self.mainView = mainView;
  self.application = mainView.application;
  self.data = data;
  self.blob = blob;
  self.submittingView = null;

  self.win = Ti.UI.createWindow({
    title: 'Submit photo',
    orientationModes: [Ti.UI.PORTRAIT],
    navBarHidden:false
  });
  self.view = Ti.UI.createScrollView({
    backgroundColor:'white',
    contentHeight: 'auto',
    layout: 'vertical'
  });

  self.win.add(self.view);

  self.open = function(){
    self.application.openNew(self.win);
  };


  self.req = null;
  self.formFields = {};

  self.submitBtn = Ti.UI.createButton({
    title: "Submit",
    height: self.application.buttonHeight,
    width: self.application.buttonWidth,
    image: '/images/check.png'
  });
  self.discardBtn = Ti.UI.createButton({
    title: "Discard",
    height: self.application.buttonHeight - 20,
    width: self.application.buttonWidth,
    image: '/images/delete.png'
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

    var formData = {}, i=0;
    for(var attrname in settings.form_data){
      formData[attrname] = settings.form_data[attrname];
    }
    for(var fieldname in self.formFields){
      var field = self.formFields[fieldname];
      var data = field.data();
      for(var i2=0; i2<data.length; i2++){
        var val = data[i2];
        formData[val[0]] = val[1];
      }
    }
    formData['image-to-append_file'] = self.blob;
    formData.altitude = self.data.altitude;
    formData.logitude = self.data.longitude;
    formData.latitude = self.data.latitude;
    var date = new Date(self.data.date);
    formData['date-photo-was-taken_year'] = date.getFullYear();
    var month = date.getMonth() + '';
    if(month.length === 1){
      month = '0' + month;
    }
    formData['date-photo-was-taken_month'] = month;
    var day = date.getDate() + '';
    if(day.length === 1){
      day = '0' + day;
    }
    formData['date-photo-was-taken_day'] = day;

    self.submittingView = new SubmittingView();
    self.submittingView.open();

    self.req = Ti.Network.createHTTPClient();
    setRequestHeaders(self.req);
    self.req.onload = function(resp){
      var handler = new htmlparser.DefaultHandler(function(err, dom) {
        self.submittingView.close();
        if (err) {
          alert('Error: ' + err);
        } else {
          // first check if there were form errors...

          var errors = cssselect(dom, 'div.error');
          for(var i=0; i<errors.length; i++){
            var error = errors[i];
            var field = new NodeField(error);
            if(field.type !== 'invalid' && self.formFields[field.name]){
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

            // XXX Success, close the form, clear the data
            //
            self.win.close();
            var db = new Database();
            db.removeItem(self.data.filename);
            db = null;

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
      self.submittingView.close();
      var alertDialog = Ti.UI.createAlertDialog({
        title: 'Failure',
        message: 'There was an unknown error submitting the form. ' +
                 'Please try again. If the problem persists, contact support.',
        buttonNames: ['OK']
      });
      alertDialog.show();
    };
    self.req.onsendstream = function(e){
      self.submittingView.updateProgress(Math.floor(e.progress*100));
    };
    self.req.open('POST', settings.submission_url);
    self.req.send(formData);
  };

  self.loadForm = function(html){

    self.view.add(Ti.UI.createLabel({
      text: 'Please fill out the form to finish the submission.',
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
        fontSize: 30
      } 
    }));

    self.view.add(Ti.UI.createImageView({
      height: 150,
      width: 'auto',
      canScale : true,
      image: self.blob
    }));

    self.formFields = {};
    for(var i=0; i<FIELDS.length; i++){
      var field = FIELDS[i];
      if(field.type === TEXT){
        self.formFields[field.name] = new TextField(field, self.view);
      } else if(field.type === SELECT){
        self.formFields[field.name] = new Select(field, self.view);
      } else if(field.type === TEXTAREA){
        self.formFields[field.name] = new TextArea(field, self.view);
      } else if(field.type === HIDDEN){
        self.formFields[field.name] = new Hidden(field, self.view);
      }
    }
    // finally, add buttons
    self.view.add(self.discardBtn);
    self.view.add(self.submitBtn);
  };

  self.reload = function(){
    self.view.removeAllChildren();
    self.loadForm();
  };

  self.discardBtn.addEventListener('click', function(e){
    var cfm = Ti.UI.createAlertDialog({
      title: 'Discard',
      message: 'Are you certain you want to discard this data? ' +
               'Discarding can not be undone.',
      buttonNames: ['Yes, discard', 'No'],
      cancel: 1
    });

    cfm.addEventListener('click', function(e){
      if (e.index === e.source.cancel){
        return;
      }
      self.win.close();
      var db = new Database();
      db.removeItem(self.data.filename);
      db = null;
    });
    cfm.show();
  });

  self.loadForm();

  return self;
}

module.exports = SubmitView;
