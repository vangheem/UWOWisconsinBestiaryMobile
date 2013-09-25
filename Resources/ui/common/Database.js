function Database(){
  var self = this;
  self._dataFileName = 'bestiary.json';
  self._userDataFileName = 'bestiaryuser.json';

  self.getBaseDirectory = function(){
    if(self.ios){
      return Ti.Filesystem.applicationSupportDirectory;
    }else{
      return Ti.Filesystem.applicationDataDirectory;
    }
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

  self.removeItem = function(filename){
    var data = self.get();
    for(var i=0; i<data.length; i++){
      var item = data[i];
      if(item.filename === filename){
        data.splice(i, 1);
        self.set(data);
        return true;
      }
    }
    return false;
  };

  self.getFile = function(filename){
    return Ti.Filesystem.getFile(self.getBaseDirectory(), filename);
  };

  self.add = function(data, blob){
    var allData = self.get();
    // generate filename to save to
    data.filename = 'image' + Math.floor((Math.random()*999999999)+1) + '.png';
    var fi = self.getFile(data.filename);
    fi.write(blob);
    allData.push(data);
    self.set(allData);
    return data.filename;
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
