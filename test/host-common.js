// Code shared between frame and worker test hosts.

/* globals load, sendMessage */
/* exported test */

var report = {
    start: function(id) {
        sendMessage(['start', id]);
    },
    progress: function(id, succeeded, failed, total) {
        sendMessage(['progress', id, succeeded, failed, total]);
    },
    complete: function(id) {
        sendMessage(['complete', id]);
    },
    error: function(id, message) {
        sendMessage(['error', id, message]);
    }
};


var tests = {};
var total = 0;
var succeeded = 0;
var failed = 0;

function updateProgress() {
    report.progress(self.id, succeeded, failed, total);
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
        console.log('SUCCESS', self.id, name);
        updateProgress();
    }).catch(function(error) {
        failed++;
        console.log('FAIL', self.id, name, error);
        updateProgress();
    });
}


self.onmessage = function onmessage(event) {
    self.id = event.data[0];

    load(event.data[1], function() {
        for (var name in tests) {
            if (!tests.hasOwnProperty(name)) {
                continue;
            }
            runTest(name);
        }
    });
};
