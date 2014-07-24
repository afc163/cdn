var TYPES = {};

TYPES.ACCEPTS = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.swf',
             '.js', '.css', '.zip', '.pdf', '.flv', '.mp4'];

TYPES.CONTENTS = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.swf': 'application/x-shockwave-flash',
    '.js': 'application/x-javascript',
    '.css': 'text/css',
    '.zip': 'application/zip',
    '.pdf': 'application/pdf',
    '.flv': 'video/x-flv',
    '.mp4': 'video/mp4'
};

TYPES.check = function(fileName) {
    var type;
    TYPES.ACCEPTS.forEach(function(item) {
        var reg = new RegExp('\\' + item + '$', 'gi');
        var match = fileName.match(reg);
        if (match) {
            type = TYPES.CONTENTS[match[0]];
            return;
        }
    });
    return type;
};

module.exports = TYPES;
