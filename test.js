var rl = require('./launcher.js');



rl.type("     ROCKET\n      ROCKS!", 16);
setTimeout(function() {
    rl.count(3);
}, 1000)
setInterval(function() {
    rl.launch();
}, 5000)


// TO DO
/*
ms 단위로 글자 출력
체인 연결 기능능
*/