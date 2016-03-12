function load(urls, callback) {
    for (var i=0; i<urls.length; i++) {
        importScripts(urls[i]);
    }
    callback();
}

function sendMessage(message) {
    postMessage(message);
}

importScripts('host-common.js');
