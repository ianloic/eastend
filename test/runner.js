// test configurations

/* eslint-env es6 */

var testRuns = new Map();

var booleans = [false, true];

booleans.forEach(function(compiled) {
    booleans.forEach(function(polyfill) {
        booleans.forEach(function(worker) {
            var id = (worker ? 'worker' : 'frame') + '-' +
                (polyfill ? 'polyfill' : 'native') + '-' +
                (compiled ? 'compiled' : 'source');
            var urls = [];
            if (polyfill) {
                urls.push('https://cdn.rawgit.com/inexorabletash/polyfill/v0.1.16/polyfill.min.js');
            }
            urls.push('../' + (compiled?'dist':'src') +
                '/eastend' + (worker?'-worker':'') +
                (compiled?'.min':'') + '.js');
            urls.push('tests.js');
            testRuns.set(id, {
                id: id,
                urls: urls,
                worker: worker,
                started: false,
                element: null,
                elements: {},
                numTests: 0,
                success: [],
                failure: [],
                failures: {}
            });
        });
    });
});

var report = {
    // test run {id} starts
    startRun: function(run, numTests) {
        run.started = true;
        run.numTests = numTests;
    },

    testCaseSuccess: function(run, testCase) {
        run.success.push(testCase);
        run.elements.success.textContent = run.success.length;
    },

    testCaseFailure: function(run, testCase, message) {
        console.error('testCaseFailure', run, testCase, message);
        run.failure.push(testCase);
        run.elements.failure.textContent = run.failure.length;
        logError(run, testCase, message);
    }
};

var tbody = document.getElementById('tbody');
var errors = document.getElementById('errors');

function logError(run, testCase, message) {
    var error = document.createElement('div');
    if (run) {
        var runName = document.createElement('span');
        runName.className = 'runName';
        runName.textContent = run.id;
        error.appendChild(runName);
    }
    if (testCase) {
        var testCaseName = document.createElement('span');
        testCaseName.className = 'testCaseName';
        testCaseName.textContent = testCase;
        error.appendChild(testCaseName);
    }
    error.appendChild(document.createTextNode(message));
    errors.appendChild(error);
}

testRuns.forEach(function(testRun) {
    runTests(testRun);
});

function runTests(testRun) {
    testRun.elements.tr = document.createElement('tr');
    testRun.element = document.createElement('div');
    testRun.element.className = 'testRun';
    testRun.element.id = testRun.id;

    testRun.elements.name = document.createElement('td');
    testRun.elements.name.textContent = testRun.id;
    testRun.elements.name.className = 'name';
    testRun.elements.tr.appendChild(testRun.elements.name);

    testRun.elements.progress = document.createElement('td');
    testRun.elements.progress.className = 'progress';
    testRun.elements.tr.appendChild(testRun.elements.progress);

    testRun.elements.success = document.createElement('div');
    testRun.elements.success.className = 'success';
    testRun.elements.success.textContent = '0';
    testRun.elements.progress.appendChild(testRun.elements.success);

    testRun.elements.failure = document.createElement('div');
    testRun.elements.failure.className = 'failure';
    testRun.elements.failure.textContent = '0';
    testRun.elements.progress.appendChild(testRun.elements.failure);

    tbody.appendChild(testRun.elements.tr);

    (testRun.worker?workerTest:frameTest)(testRun.id, testRun.urls);
}

function handleMessage(data) {
    var message = data.shift();
    data[0] = testRuns.get(data[0]);
    report[message].apply(window, data);
}

function frameTest(id, urls) {
    var iframe = document.createElement('iframe');
    iframe.src='frame-host.html';
    iframe.onload = function() {
        iframe.contentWindow.postMessage([id, urls], location.origin);
    };
    iframe.onerror = function(event) {
        logError(id, null, event.toString());
        console.error('frame error for', id, event);
    };
    document.body.appendChild(iframe);
    return iframe;
}
window.onmessage = function(event) {
    if (event.origin !== location.origin) {
        console.error('postMessage origin mismatch', event.origin, location.origin);
        return;
    }
    handleMessage(event.data);
};

function workerTest(id, urls) {
    var worker = new Worker('worker-host.js');
    worker.onmessage = function(event) {
        handleMessage(event.data);
    };
    worker.onerror = function(event) {
        logError(id, null, event.toString());
        console.error('worker error', event);
    };
    worker.postMessage([id, urls]);
}

