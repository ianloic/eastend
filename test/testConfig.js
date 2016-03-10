// test configurations

function load(window, url) {
    window.document.write('<script src="'+url+'"></script>');
}

function loadSource(window) {
    load(window, "../../src/eastend.js");
}

function loadCompiled(window) {
    load(window, "../../dist/eastend.min.js");
}

function loadPolyfill(window) {
    load(window, "https://cdn.rawgit.com/inexorabletash/polyfill/v0.1.16/polyfill.min.js");
}

var testConfig = {
    'native-source': function(window) {
        loadSource(window);
    },
    'native-compiled': function(window) {
        loadCompiled(window);
    },
    'polyfill-source': function(window) {
        loadPolyfill(window);
        loadSource(window);
    },
    'polyfill-compiled': function(window) {
        loadPolyfill(window);
        loadCompiled(window);
    }
};