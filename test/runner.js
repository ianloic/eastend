function runTests(id, configName, host) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    tr.appendChild(td);
    td.textContent = id;
    td = document.createElement('td');
    td.id = id;
    tr.appendChild(td);
    tbody.appendChild(tr);
    td = document.createElement('td');
    tr.appendChild(td);

    var urls = testConfig[configName].slice();
    urls.push('tests.js');

    host(id, urls);
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
        console.log('frame error for', id, event);
    };
    document.body.appendChild(iframe);
    return iframe;
}
window.onmessage = function(event) {
    if (event.origin != document.origin) {
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
        console.log('worker error', event);
    };
    worker.postMessage([id, urls]);
}
