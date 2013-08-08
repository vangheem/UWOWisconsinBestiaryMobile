function Database(){
  var self = this;
  self._dataFileName = 'bestiary.json';

  self.getDataFile = function(){
    return Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,
                                 self._dataFileName);
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
    return Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,
                                 filename);
  };

  self.add = function(data, blob){
    var allData = self.get();
    // generate filename to save to
    data.filename = 'image' + Math.floor((Math.random()*999999999)+1) + '.png';
    var fi = self.getFile(data.filename);
    fi.write(blob);
    allData.push(data);
    self.set(allData);
  };

  return self;
}
module.exports = Database;