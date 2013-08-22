exports = {};

exports.submission_url = 'http://www.uwosh.edu/wisconsinbestiary/submissions';
exports.form_selector = 'div.pfg-form form';
exports.form_data = {
  'agreement:list': 'I agree',
  'topic': 'Bestiary Submission',
  'fieldset': 'default',
  'form.submitted': '1',
  'add_reference.field:record': '',
  'add_reference.type:record': '',
  'add_reference.destination:record': '',
  '_authenticator': '6b9ec1bdad9b1656f6ebf3720017d3c9118ed11f',
  'date-photo-was-taken': '',
  'date-photo-was-taken_hour': '00',
  'date-photo-was-taken_minute': '00',
  'date-photo-was-taken_ampm': '',
  'form_submit': 'Submit',
  'app-version': Ti.App.version,
  'device': Ti.Platform.osname + ' ' + Ti.Platform.version + ': ' + Ti.Platform.model
};

settings = exports;
