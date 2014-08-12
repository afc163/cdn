require('shelljs/global');
var fs = require('fs');
var path = require('path');
var async = require('async');
var program = require('commander');
var download = require('download');
var TYPES = require('./TYPES');
var CheckUrl = require('./checkUrl');
var tempfile = require('tempfile');
var client = require('./client');

var FileHandler = function(files, onComplete, isQuiet) {
    this.start = Date.now();
    var that = this;
    this.Files = {};
    this.copyUrls = [];
    this.onComplete = onComplete || function() {};
    this.isQuiet = isQuiet;

    if (typeof files === 'string') {
        files = [files];
    }

    files.forEach(function(file) {
        that.Files[file] = {};
        that.Files[file].path = file;
        that.Files[file].key = file;
        that.Files[file].name = require('./fileName').parse(file);
    });
};

FileHandler.prototype = {

    info: function(msg) {
        if (!this.isQuiet) {
            console.info(msg);
        }
    },

    each: function(fn, callback) {
        var that = this;
        async.forEachSeries(Object.keys(this.Files).sort(), function(item, done) {
            fn(that.Files[item], done);
        }, function(err) {
            // exit!!!
            if (that.length() <= 0) {
                console.error(('  Something bad happended.').red);
                console.log();
                program.emit('--help');
                that.onComplete(err);
                return;
            }
            callback && callback();
        });
    },

    error: function(msg, file) {
        console.error(('  ' + file.name + ': ' + msg).red);
        delete this.Files[file.key];
    },

    length: function() {
        return Object.keys(this.Files).length;
    },

    strLength: function() {
        var len = this.length();
        if (len === 1) {
            return 'one file';
        } else {
            return len + ' files';
        }
    },

    checkSource: function() {
        this.info('Start checking files.');
        this.each(function(file, done) {
            var urlReg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
            if (urlReg.test(file.path)) {
                file.webSource = true;
            }
            done();
        });
    },

    checkValidType: function() {
        var that = this;
        this.each(function(file, done) {
            file.type = TYPES.check(file.name);
            if (!file.type) {
                that.error('Invalid! Accept types: ' + TYPES.ACCEPTS.join(' '), file);
            }
            done();
        });
    },

    checkExist: function(callback) {
        var that = this;
        this.each(function(file, done) {
            if (!file.webSource) {
                if (!test('-e', file.path)) {
                    that.error('It is not existed!', file);
                } else if (test('-d', file.path)) {
                    that.error('It is a folder!', file);
                } else if (!test('-f', file.path)) {
                    that.error('It is not a regular file!', file);
                }
                done();
            } else {
                CheckUrl(file.path, function() {
                    var temp = tempfile(path.extname(file.path));
                    var stream = download({
                        url: file.path,
                        name: path.basename(temp)
                    }, path.dirname(temp));
                    var downloaded = function() {
                        file.path = temp;
                        stream.removeListener('close', downloaded);
                        done();
                    };
                    stream.on('close', downloaded);
                }, function(err) {
                    that.error('Can\'t access this web source.', file);
                    done(err);
                });
            }
        }, callback);
    },

    showInfo: function(callback) {
        var that = this;
        this.info('Ready to upload ' + this.strLength() + ':');

        this.each(function(file, done) {
            fs.readFile(file.path, function(err, data) {
                var str = '  ' + file.name.cyan;
                var str2 = ' @ ' + file.type;
                str2 += ' ' + (data.length/1024.0).toFixed(2) + ' KB';

                // swf file can't read info
                if (file.type.indexOf('flash') === -1) {
                    var info = require('imageinfo')(data);
                    if (info.type === 'image') {
                        str2 += ' ' + info.width + 'x' + info.height;
                    }
                }
                that.info(str + str2.magenta);
                done();
            });
        }, callback);
    },

    prepareUpload: function() {
        var that = this;
        this.each(function(file, done) {
            // 压缩 css 和 js 文件
            file = compress(file);
            file.buffer = fs.readFileSync(file.path);
            file.cdnName = md5(file.buffer.toString()).slice(0, 8) + path.extname(file.name);
            done();
        });
    },

    upload: function(callback) {
        var that = this;

        if (!this.isQuiet) {
            process.stdout.write('Busy in uploading ☕  ...');
            var inter = setInterval(function() {
                process.stdout.write(".");
            }, 300);
        }

        this.each(function(file, done) {
            client.upload(file, function(err) {
                if (inter) {
                    clearInterval(inter);
                    inter = null;
                    console.log();
                }
                if (!err) {
                    that._postOneFileUpload(file, done);
                } else {
                    done(err);
                }
            });
        }, callback);
    },

    _postOneFileUpload: function(file, done) {
        var that = this;
        var hostUrl = client.url + '/' + file.cdnName;
        this.info('  ➜  '.red + hostUrl.green + ' ~ ' + file.name.cyan);
        this.copyUrls.push(hostUrl);
        CheckUrl(hostUrl, function() {
            done();
        }, function(err) {
            that.error('Can\'t access cdn url:', file);
            that.error('Maybe something wrong, or check your web.', file);
            done(err);
        });
    },

    postUpload: function() {
        this.info('👍  Uploaded ' + this.strLength() + ' to ' + client.serverName +
                  ' in ' + (Date.now() - this.start)/1000.0 + 's!');
        // copy to clipborad
        require('cliparoo')(this.copyUrls.join('\\n'), function() {});

        var url = this.copyUrls.length === 1 ? this.copyUrls[0] : this.copyUrls;
        this.onComplete(null, url);
    }

};

module.exports = FileHandler;

function compress(file) {
    var UglifyJS = require("uglify-js");
    var extname = path.extname(file.name);
    if (/^\.(js|css)$/.test(extname)) {
        var result = UglifyJS.minify(file.path);
        var temp = tempfile(extname);
        fs.writeFileSync(temp, result.code);
        file.path = temp;
    }
    return file;
}

function md5(str) {
    var hash = require('crypto').createHash('md5');
    return hash.update(str.toString()).digest('hex');
}
