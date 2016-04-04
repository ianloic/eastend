// Code shared between frame and worker test hosts.

/* globals load, sendMessage */
/* exported test */

// For compatibility with older IE.
var origin = location.origin || location.protocol + '//' + location.hostname;

var run;

var tests = {};
var numTests = 0;

function test(name, factory) {
    tests[name] = factory;
    numTests++;
}

function runTest(name) {
    //sendMessage('startTestCase', run, name);
    var promise = tests[name]();
    promise.then(function() {
        sendMessage('testCaseSuccess', run, name);
    }).catch(function(error) {
        sendMessage('testCaseFailure', run, name, error?error.toString():error);
    });
}


self.onmessage = function onmessage(event) {
    // For non-worker hosts, do a same-origin check.
    if (event.origin && event.origin !== origin) {
        console.error('postMessage origin mismatch', event.origin, origin);
        return;
    }

    var data = JSON.parse(event.data);

    run = data[0];

    load(data[1], function() {
        sendMessage('startRun', run, numTests);
        for (var name in tests) {
            if (!tests.hasOwnProperty(name)) {
                continue;
            }
            runTest(name);
        }
    });
};
