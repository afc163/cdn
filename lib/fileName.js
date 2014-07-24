exports.parse = function(path) {

    if (path.indexOf('/') === -1) {
        return path;
    } else {
        return path.slice(path.lastIndexOf('/') + 1);
    }

};
