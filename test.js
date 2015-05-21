var rl = require('./launcher.js');

rl.launch();
setInterval(function() {
    rl.launch();
}, 10000)