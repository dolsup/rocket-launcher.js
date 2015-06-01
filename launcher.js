/*
 * -----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * dolsup(Jiwon Choi)<1890mah@gmail.com> wrote this file. As long as you retain
 * this notice you can do whatever you want with this stuff. If we meet some day,
 * and you think this stuff is worth it, you can buy me a beer in return.
 * -----------------------------------------------------------------------------
 */


var fs = require('fs');
var figlet = require('figlet');

// variables
var cols = process.stdout.columns;
var rows = process.stdout.rows;
var buf = new Array(rows);
for(var i=0; i<rows; i++) {
    buf[i] = new Array(cols);
}
var objects = [];
var colors = ['\u001B[31m','\u001B[33m'];
var cend = "\u001B[0m";


// rocket prototype
var Rocket = function(fire) {
    this.lines = [];
    this.state = ""; //launched, exploded, crashed
    this.step = 0;
    this.fire = fire;
};

// figlet text prototype
var Figlet = function(text, ms) {
    this.lines = figlet.textSync(text).split('\n');
    this.life = ms;
};


// rocket subset into screen buffer
// WHAT A DIRTY CODE
var bufRocket = function(r) {
    //clear();
    var data = r.lines;
    var lineNum = r.step++;
    var offset = Math.floor(cols/3 + Math.random()*3);
    var fireStroke = false;
    for(var j=0; j<lineNum; j++) {
        if(data[j] != undefined && rows-lineNum+j>0) {
            for(var k=0; k<data[j].length+1; k++) {
                if(data[j][k]) {
                    if(data[j][k] !== ' ') {
                        if(data[j][k] == r.fire) {
                            if(!fireStroke) {
                                buf[rows-lineNum+j][k+offset] = colors[r.step%2] + data[j][k];
                                fireStroke = true;
                            } else buf[rows-lineNum+j][k+offset] = data[j][k];
                        } else if(fireStroke) {
                            buf[rows-lineNum+j][k+offset] = cend + data[j][k];
                            fireStroke = false;
                        } else buf[rows-lineNum+j][k+offset] = data[j][k];
                    }
                } else if(fireStroke && k!==data[j].length+1) {
                    buf[rows-lineNum+j][k+offset] = cend;
                    fireStroke = false;
                }
            }
        }
    }
};

var bufFiglet = function(f) {
    for(var i=0; i<f.lines.length; i++) {
        for(var j=0; j<f.lines[i].length; j++) {
            buf[i+2][j] = f.lines[i][j];
        }
    }
};

// if not empty, print and clear the screen buffer
var printBuf = function(bf) {
    var empty = true;
    var t = "";
    for(var r=0; r<rows; r++) {
        for(var c=0; c<cols; c++) {
            if(bf[r][c]) {
                empty = false;
                t += bf[r][c];
            } else {
                t += ' ';
            }
            bf[r][c] = null;
        }
        t += '\n';
    }    
    if(!empty)
        process.stdout.write(t.toString('utf8')+'\n');
};


var tick = function(objs) {
    for(var i=0; i<objs.length; i++) {
        if(objs[i] instanceof Figlet) {
            if(--objs[i].life < 0) {
                objs.splice(i, 1);
                break;
            }
            bufFiglet(objs[i]);
        }
        if(objs[i] instanceof Rocket) {
            if(objs[i].step > objs[i].lines.length + rows) {
                // remove object when go outside
                objs.splice(i, 1);
                break;
            }
            bufRocket(objs[i]);
        }
        
    }
    printBuf(buf);
    setTimeout(function() {
        tick(objs);
    }, 60);
};

var launch = function(rocket) {
    rocket.state = 'launched';
    rocket.step = 0;
};

/*
var crash = function(rocket) {
    rocket.state = "crashed";
    rocket.lines = rocket.lines.join('\n')
                    .replace(new RegExp(rocket.fire, 'g'), '')
                    .replace(/\n\s*\n/g, '\n').split('\n').reverse();
    rocket.step = 0;
}
*/
var throwErr = function(msg) {
    console.error('＿人人人人人人人人人＿\n＞ ' + msg + ' ＜\n￣Y^Y^Y^Y^Y^Y^Y^Y^Y^￣');
} 


// ---- functions for external access

var LaunchRocket = function(path, fire) {
    fs.readFile((path)?path:(__dirname + '/rocket.txt'), 'utf8', function(err, data) {
        if(err) {
            throwErr('ROCKET NOT FOUND!');
        } else {
            var rocket = new Rocket((fire)?fire:'#');
            rocket.lines = data.split('\n');
            launch(rocket);
            objects.push(rocket);    
        }
        //setInterval(function() {launch(rocket);}, 3500);
    });
};

var makeFigletText = function(text, ms) {    
    var fig = new Figlet(text, ms);
    objects.push(fig);
};

var countDown = function(n) {
    var timer = setInterval(function() {
        makeFigletText(n--, 16);
        if(n < 0) {
            makeFigletText("FIRE", 16);
            clearInterval(timer);
        }
    }, 1000);
};

// entry point
tick(objects);

module.exports = {
    'launch': LaunchRocket,
    'type': makeFigletText,
    'count': countDown
};