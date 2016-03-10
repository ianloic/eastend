// test configurations

var SOURCE="../../src/eastend.js";
var COMPILED="../../dist/eastend.min.js";
var POLYFILL="https://cdn.rawgit.com/inexorabletash/polyfill/v0.1.16/polyfill.min.js";

var testConfig = {
    'native-source': [SOURCE],
    'native-compiled': [COMPILED],
    'polyfill-source': [POLYFILL, SOURCE],
    'polyfill-compiled': [POLYFILL, COMPILED]
};