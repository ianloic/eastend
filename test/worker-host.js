/* exported load, sendMessage */
/* eslint-env worker */

function load(urls, callback) {
    for (var i=0; i<urls.length; i++) {
        importScripts(urls[i]);
    }
    callback();
}

function sendMessage() {
    var args = Array.prototype.slice.call(arguments);
    self.postMessage(JSON.stringify(args));
}

importScripts('host-common.js');
