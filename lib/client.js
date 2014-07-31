var config = require('./config');
var client = {};
var serverName = config.default;

if (serverName === 'qiniu') {
  config = config.qiniu;
  var qiniu = require('node-qiniu');
  qiniu.config({
    access_key: config.access_key,
    secret_key:  config.secret_key
  });
  client = qiniu.bucket(config.bucketname);
  client.upload = function(file, callback) {
    client.putFile(file.cdnName, file.path, callback);
  };
} else {
  config = config.upyun;
  var upyun = require('upyun');
  client = upyun(config.bucketname, config.username, config.password);
  client.upload = function(file, callback) {
    client.uploadFile(file.cdnName, file.buffer, callback);
  };
}

client.url = config.url;
client.serverName = serverName.toUpperCase();
module.exports = client;
