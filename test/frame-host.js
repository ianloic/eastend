/* exported load, sendMessage */

window.onerror = function(message, source, lineno, colno, error) {
    var roots = document.getElementsByTagName('body') || document.getElementsByTagName('html');
    var root = roots[0];
    var pre = document.createElement('pre');
    pre.setAttribute('style', 'background:red;color:white');
    root.appendChild(pre);
    pre.appendChild(document.createTextNode(message + '\n' + source + ':' + lineno + ':' + colno + '\n'+error));
};

function importScript(url, callback) {
    var s = document.createElement('script');
    s.src = url;
    s.onload = function() {
        callback(true);
    };
    s.onerror = function() {
        callback(false);
    };
    document.head.appendChild(s);
}

function load(urls, callback) {
    if (urls.length === 0) {
        // All loaded.
        callback();
    } else {
        var url = urls.pop();
        importScript(url, function() {
            load(urls, callback);
        });
    }
}

function sendMessage(message) {
    window.parent.postMessage(message, document.origin);
}
