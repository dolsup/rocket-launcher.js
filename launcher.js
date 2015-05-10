/*
 * -----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * dolsup(Jiwon Choi)<1890mah@gmail.com> wrote this file. As long as you retain
 * this notice you can do whatever you want with this stuff. If we meet some day,
 * and you think this stuff is worth it, you can buy me a beer in return.
 * -----------------------------------------------------------------------------
 */


var fs = require('fs');

// rocket prototype
var Rocket = function(fire) {
    this.lines = [];
    this.state = ""; //launched, exploded, crashed
    this.step = 0;
    this.fire = fire;
};

var rocket = new Rocket('#');

// clear screen
var clear = function() {
    console.log("\u001B[2J");
}
// print rocket subset
var printUntil = function(data, lineNum) {
    clear();
    for(var j=0; j<lineNum; j++) {
        if(data[j] != undefined)
            console.log(data[j]);
        else console.log("");
    }
}
// switch fire color
var fireFlash = function(lines, fire, colors, step) {
    var data = lines.join('\n');
    if(fire && colors && data.indexOf(fire) != -1) {
        data = data.replace(new RegExp(fire, 'g'), function(x){return colors[step%2] + x + "\u001B[0m"});
    }
    return data.split('\n');
    
}

var tick = function(r) {
    if(r.state === 'launched')
        if(r.step < r.lines.length*2)
            printUntil( fireFlash(r.lines, r.fire, ['\u001B[31m','\u001B[33m'], r.step),
                        r.step++ - 10);
    if(r.state === 'crashed')
        if(r.step < r.lines.length*2)
            printUntil( fireFlash(r.lines, null, null, r.step),
                        r.step++ - 10);
        
    
    setTimeout(function() {
        tick(r);
    }, 60);
};

var launch = function(rocket) {
    rocket.state = 'launched';
    rocket.step = 0;
}
/*
var crash = function(rocket) {
    rocket.state = "crashed";
    rocket.lines = rocket.lines.join('\n')
                    .replace(new RegExp(rocket.fire, 'g'), '')
                    .replace(/\n\s*\n/g, '\n').split('\n').reverse();
    rocket.step = 0;
}
*/

// entry point
fs.readFile('./rocket.txt', 'utf8', function(err, data) {
    //'＿人人人人人人人人人＿\n＞ ROCKET NOT FOUND ＜\n￣Y^Y^Y^Y^Y^Y^Y^Y^Y^￣'
    rocket.lines = data.split('\n');
    tick(rocket);
    //setInterval(function() {launch(rocket);}, 3500);
});

var rocketLaunch = function() {
    launch(rocket);
};
module.exports = {
    'launch': rocketLaunch
};

