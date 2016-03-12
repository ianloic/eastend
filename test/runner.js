// test configurations

var testConfig = [];

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
            urls.push('../../' + (compiled?'dist':'src') +
                '/eastend' + (worker?'-worker':'') +
                (compiled?'.min':'') + '.js');
            urls.push('tests.js');
            testConfig.push({
                id: id,
                urls: urls,
                worker: worker
            });
        });
    });
});


var report = {
    start: function(config) {
        console.log('start', config);
    },
    progress: function(config, succeeded, failed, total) {
        var e = document.getElementById(config);
        e.textContent = '' + succeeded + ' / ' + failed + ' / ' + total;
    },
    complete: function(config) {
        console.log('complete', config);
    },
    error: function(config, message) {
        console.error(config, message);
    }
};

var tbody = document.getElementById('tbody');

testConfig.forEach(function(config) {
    runTests(config);
});

function runTests(config) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    tr.appendChild(td);
    td.textContent = config.id;
    td = document.createElement('td');
    td.id = config.id;
    tr.appendChild(td);
    tbody.appendChild(tr);
    td = document.createElement('td');
    tr.appendChild(td);

    (config.worker?workerTest:frameTest)(config.id, config.urls);
}

function handleMessage(data) {
    var message = data.shift();
    report[message].apply(window, data);
}

function frameTest(id, urls) {
    var iframe = document.createElement('iframe');
    iframe.src='frame-host.html';
    iframe.onload = function() {
        iframe.contentWindow.postMessage([id, urls], document.origin);
    };
    iframe.onerror = function(event) {
        console.error('frame error for', id, event);
    };
    document.body.appendChild(iframe);
    return iframe;
}
window.onmessage = function(event) {
    if (event.origin !== document.origin) {
        console.error('postMessage orgin mismatch', event.origin, document.origin);
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
        console.error('worker error', event);
    };
    worker.postMessage([id, urls]);
}

