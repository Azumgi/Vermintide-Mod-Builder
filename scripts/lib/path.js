const path = Object.assign({}, require('path'));
const normalizePath = require('normalize-path');
const isWsl = require('is-wsl');

// Converts C:\typical\windows\path to /mnt/c/wsl/path
path.convert_to_wsl = function(pth) {
    if (!path.posix.isAbsolute(pth)) {
        pth = `/mnt/${pth.substr(0, 1).toLowerCase()}/${pth.substr(3).replace(/\\/g, '/')}`;
    }
    return pth;
};

path.convert_to_win = function(pth) {
    if (path.posix.isAbsolute(pth)) {
        pth = `${pth.substr(5, 1).toUpperCase()}:/${pth.substr(7)}`;
    }
    return pth;
};

path.fix = function(pth) {
    return normalizePath(path.normalize(pth));
};

// Normalizes path after joining
path.combine = function(...args) {
    return path.fix(path.join(...args));
};

path.absolutify = function(pth, dirname) {
    if (!(path.win32.isAbsolute(pth) || isWsl && path.posix.isAbsolute(pth))) {
        pth = path.combine(dirname || process.cwd(), pth);
    }
    if (isWsl) {
        pth = path.convert_to_wsl(pth);
    }
    return pth;
};

module.exports = path;
