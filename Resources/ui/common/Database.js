/*global window, alert, decodeURIComponent, define, Ti, Titanium */

function Database(){
  var self = this;
  self._dataFileName = 'bestiary.json';
  self._userDataFileName = 'bestiaryuser.json';

  self.getBaseDirectory = function(){
    return Ti.Filesystem.applicationDataDirectory;
  };

  self.getDataFile = function(){
    return Ti.Filesystem.getFile(self.getBaseDirectory(), self._dataFileName);
  };

  self.get = function(){
    var df = self.getDataFile();
    if(!df.exists()){
      return [];
    }
    try{
      var blob = df.read();
      var result = JSON.parse(blob.text);
      blob = null;
      return result;
    }catch(e){
      return [];
    }
  };

  self.getItem = function(filename){
    var data = self.get();
    for(var i=0; i<data.length; i++){
      var item = data[i];
      if(item.filename === filename){
        return item;
      }
    }
    return null;
  };

  self.set = function(data){
    var df = self.getDataFile();
    df.write(JSON.stringify(data));
  };

  self.removeItem = function(filename_or_id){
    var data = self.get();
    for(var i=0; i<data.length; i++){
      var item = data[i];
      if(item.filename === filename_or_id || item.id == filename_or_id){
        data.splice(i, 1);
        // delete files if they exist
        self.set(data);
        self.removeFile(item.filename);
        self.removeFile(item.audio_filename);
        return true;
      }
    }
    return false;
  };

  self.removeFile = function(filename){
    var fi = self.getFile(filename);
    if(fi.exists()){
      return fi.deleteFile();
    }
    return false;
  };

  self.getFile = function(filename){
    return Ti.Filesystem.getFile(self.getBaseDirectory(), filename);
  };

  self.add = function(data, photo, audio, audio_ext){
    var allData = self.get();
    // generate filename to save to
    data.id = Math.floor((Math.random()*999999999)+1);
    var fi;
    if(photo){
      data.filename = 'image' + data.id + '.png';
      fi = self.getFile(data.filename);
      fi.write(photo);
    }
    if(audio){
      if(!audio_ext){
        audio_ext = 'wav';
      }
      data.audio_filename = 'audio' + data.id + '.' + audio_ext;
      fi = self.getFile(data.audio_filename);
      fi.write(audio);
    }

    allData.push(data);
    self.set(allData);
    return data.id;
  };

  self.getUserDataFile = function(){
    return Ti.Filesystem.getFile(self.getBaseDirectory(),
                                 self._userDataFileName);
  };

  self.getUserData = function(){
    var df = self.getUserDataFile();
    if(!df.exists()){
      return null;
    }
    try{
      var blob = df.read();
      var result = JSON.parse(blob.text);
      blob = null;
      return result;
    }catch(e){
      return null;
    }
  };

  self.setUserData = function(first, last, email){
    var data = {
      first: first,
      last: last,
      email: email
    };
    var df = self.getUserDataFile();
    df.write(JSON.stringify(data));
  };

  return self;
}
module.exports = Database;
