var Database = require('ui/common/Database');
var SubmittingView = require('ui/common/SubmittingView');
var ProgressIndicator = require('ui/common/ProgressIndicator');

Ti.include('/ui/lib/htmlparser.js');
Ti.include('/ui/lib/soupselect.js');
Ti.include('/ui/common/settings.js');

var cssselect = soupselect.select;

var ui = {};
ui.label = function(label){
  return Ti.UI.createLabel({
    text: label,
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
    width: '95%',
    color: 'black',
    font: {
      fontSize: 24
    }
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
    options: ['UW - Oshkosh', 'Other']
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
    options: ["ameba", "amphibians", "bird", "butterflies", "centipedes",
              "ciliates", "crustacean", "dragonflies", "fish", "flagellate",
              "hydrai", "leech", "mammal", "millpedes", "mussels", "reptile",
              "rotifer", "slug/snails", "sponge", "ticks/spiders", "unsure"]
  },{
    name: 'species',
    label: 'Species',
    required: false,
    type: TEXT
  },{
    name: 'ecosystem-type',
    label: 'Ecosystem Type',
    required: false,
    type: TEXTAREA
  },{
    name: 'observation-technique',
    label: 'Observation Technique',
    required: false,
    type: TEXTAREA
  },{
    name: 'behavioral-description',
    label: 'Behavioral Description',
    required: false,
    type: TEXTAREA
  },{
    name: 'specific-text-you-would-like-used-to-acknowledge-photograph-interesting-anecdote-submission',
    label: 'Additional Information about the submission',
    required: false,
    type: TEXTAREA
  },{
    name: 'logitude',
    label: 'Longitude',
    required: false,
    type: TEXT,
  },{
    name: 'latitude',
    label: 'Latitude',
    required: false,
    type: TEXT
  },{
    name: 'altitude',
    label: 'Altitude',
    required: false,
    type: TEXT
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
    height: 120
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


function Form(submitView) {
  var self = this;
  self.fields = [];
  self.req = null;
  self.submittingView = null;
  self.submitView = submitView;
  self.view = self.submitView.view;
  self.mainView = self.submitView.mainView;


  self.validate = function(){
    for(var fieldname in self.fields){
      var field = self.fields[fieldname];
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

  self.submit = function(){
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
    for(var fieldname in self.fields){
      var field = self.fields[fieldname];
      var data = field.data();
      for(var i2=0; i2<data.length; i2++){
        var val = data[i2];
        formData[val[0]] = val[1];
      }
    }
    formData['image-to-append_file'] = self.submitView.blob;


    /* add date/time of submission */
    var dateField = 'date-photo-was-taken';
    var date = new Date(self.submitView.data.date);
    formData[dateField + '_year'] = date.getFullYear();
    var month = date.getMonth() + '';
    if(month.length === 1){
      month = '0' + month;
    }
    formData[dateField + '_month'] = month;
    var day = date.getDate() + '';
    if(day.length === 1){
      day = '0' + day;
    }
    formData[dateField + '_day'] = day;
    var hour = date.getHours();
    var ampm = 'AM';
    if(hour > 12){
      hour = hour - 12;
      ampm = 'PM';
    }
    hour = hour + '';
    if(hour.length === 1){
      hour = '0' + hour;
    }
    formData[dateField + '_hour'] = hour;
    formData[dateField + '_ampm'] = ampm;
    var minutes = date.getMinutes() + '';
    if(minutes.length === 1){
      minutes = '0' + minutes;
    }
    formData[dateField + '_minute'] = minutes;


    self.submittingView = new SubmittingView(self.mainView);
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
            if(field.type !== 'invalid' && self.fields[field.name]){
              var ffield = self.fields[field.name];
              var errorBox = cssselect(error, '.fieldErrorBox');
              if(errorBox.length > 0){
                var errorMsg = '';
                try{
                  errorMsg = 'Error in form. Field: ' + ffield.field.label +
                             ', Error: ' + errorBox[0].children[0].raw +
                             '. Please fix the error and re-submit';
                }catch(e){
                  errorMsg = 'Unknown form data error. Contact support.';
                }

                Ti.UI.createAlertDialog({
                  title: 'Error',
                  message: errorMsg,
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
            var db = new Database();
            db.removeItem(self.submitView.data.filename);
            db.setUserData(
              self.fields['first-name'].widget.getValue(),
              self.fields['last-name'].widget.getValue(),
              self.fields.replyto.widget.getValue()
            );
            db = null;
            self.submitView.application.close(self.submitView.win);

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

  self.load = function(){
    self.fields = {};
    for(var i=0; i<FIELDS.length; i++){
      var field = FIELDS[i];
      if(field.type === TEXT){
        self.fields[field.name] = new TextField(field, self.view);
      } else if(field.type === SELECT){
        self.fields[field.name] = new Select(field, self.view);
      } else if(field.type === TEXTAREA){
        self.fields[field.name] = new TextArea(field, self.view);
      } else if(field.type === HIDDEN){
        self.fields[field.name] = new Hidden(field, self.view);
      }
    }
  };

  return self;
}

module.exports = Form;
