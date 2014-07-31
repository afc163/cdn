var fs = require('fs');
var path = require('path');
var configFile = path.join(process.env.HOME, '.cdn_config');
var config;

try {
  config = JSON.parse(fs.readFileSync(configFile));
  config.default.toString();
} catch (e) {
  config = {
    "default": "qiniu",
    "qiniu": {
      "bucketname": "cdn-qiniu",
      "access_key": "IL61PpD3ZtyDKvrwaQfwTn2o79oryfU31urq1Ph0",
      "secret_key":"XROyHp6FFbNXbwEiRs98LRQPqwvWCFyPTkXgTRft",
      "url": "http://cdn-qiniu.qiniudn.com"
    },
    "upyun": {
      "bucketname": "cdn-upyun",
      "username": "pianyoupianyou",
      "password":"pianyoupianyou",
      "url": "http://cdn-upyun.b0.upaiyun.com"
    }
  };
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

module.exports = config;
