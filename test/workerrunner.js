console.log('I am worker runner');

importScripts('testConfig.js');

var report = {
    start: function(config) {
        postMessage(['start', config]);
    },
    progress: function(config, succeeded, failed, total) {
        postMessage(['progress', config, succeeded, failed, total]);
    },
    complete: function(config) {
        postMessage(['complete', config]);
    },
    error: function(config, message) {
        postMessage(['error', config, message]);
    }
};


var tests = {};
var total = 0;
var succeeded = 0;
var failed = 0;

function updateProgress() {
    report.progress(config, succeeded, failed, total);
}

function test(name, factory) {
    tests[name] = factory;
    total++;
    updateProgress();

}

function runTest(name) {
    var promise = tests[name]();
    promise.then(function() {
        succeeded++;
        updateProgress();
    }).catch(function(error) {
        failed++;
        console.log('FAIL', name);
        updateProgress();
    });
}

self.addEventListener('message', function(event) {
    console.log('message', event.data);
    self.config = event.data[0];
    var script = event.data[1];
    for (var i=0; i<testConfig[config].length; i++) {
        importScripts(testConfig[config][i]);
    }
    console.log('load', script);
    importScripts(script);
    for (var name in tests) {
        if (!tests.hasOwnProperty(name)) continue;
        runTest(name);
    }
});