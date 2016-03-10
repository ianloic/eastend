console.log('hello world from a worker');
console.log(this);

importScripts('../src/eastend.js');

console.log('imported eastend.');
console.log(require);

require('tests/a.js').then(function(a) {
   console.log('a', a);
});



