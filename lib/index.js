var async = require('async');
var FileHandler = require('./fileHandler');

require('colorful').toxic();

function main(files, onComplete, isQuiet) {

    var fileHandler = new FileHandler(files, onComplete, isQuiet);

    async.series([
        function(callback) {
            fileHandler.checkSource();
            fileHandler.checkValidType();
            fileHandler.checkExist(callback);
        },
        function(callback) {
            fileHandler.showInfo(callback);
        },
        function(callback) {
            fileHandler.prepareUpload();
            fileHandler.upload(callback);
        },
        function(callback) {
            fileHandler.postUpload();
        }
    ]);
}

module.exports = main;
