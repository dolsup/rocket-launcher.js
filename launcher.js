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
var fps = 15;
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
var Rocket = function(data, fire) {
    this.lines = data.split('\n');
    this.state = ""; //launched, exploded, crashed
    this.step = 0;
    this.fire = fire;
};

// figlet text prototype
var Figlet = function(text, ms) {
    this.lines = figlet.textSync(text).split('\n');
    this.birthms = Date.now();
    this.life = ms;
};


// rocket subset into screen buffer
// WHAT A DIRTY CODE
var bufRocket = function(r) {
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


var preScreen;
// if not empty, print and clear the screen buffer
var printBuf = function(bf) {
    var emptyBuffer = true;
    var t = "";
    for(var r=0; r<rows; r++) {
        for(var c=0; c<cols; c++) {
            if(bf[r][c]) {
                emptyBuffer = false;
                t += bf[r][c];
            } else {
                t += ' ';
            }
            bf[r][c] = null;
        }
        t += '\n';
    };
    if(!emptyBuffer && preScreen != t) {
        process.stdout.write(t.toString('utf8')+'\n');
    }
    preScreen = t;
};


var tick = function(objs) {
    for(var i=0; i<objs.length; i++) {
        if(objs[i] instanceof Figlet) {
            if(objs[i].birthms + objs[i].life < Date.now()) {
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
    }, 1000/fps);
};

var launch = function(rocket) {
    rocket.state = 'launched';
    rocket.step = 0;
    return rocket;
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

var launchRocket = function(path, fire) {
/*    if(!data) {
        throwErr('ROCKET NOT FOUND!');
    }*/
    var rocket = launch(new Rocket((path)?path:(fs.readFileSync((path)?path:(__dirname + '/rocket.txt'), 'utf8')), (fire)?fire:'#'));
    objects.push(rocket);    
};

var makeFigletText = function(text, ms) {    
    var fig = new Figlet(text, ms);
    objects.push(fig);
};

var countDown = function(n) {
    var timer = setInterval(function() {
        makeFigletText(n--, 1000);
        if(n < 0) {
            makeFigletText("FIRE", 1000);
            clearInterval(timer);
        }
    }, 1000);
};

var setFrame = function(f) {
    fps = f;
};

// entry point
tick(objects);

// chain implementation
var rl = function() {
    var queue = [];
    var timer;
    this.delay = function(per) {
        timer = setTimeout(function() {
            timer = 0;
            var f;
            while (f = queue.shift()) f();
        }, per);
        return this;
    };
    this.addFunction = function(f) {
        if (timer) queue.push(f);
        else f();
        return this;
    };
    this.launch = function(path, fire) {
        if (timer) queue.push(launchRocket);
        else launchRocket;
        return this;
    };
    this.type = function(text, ms) {
        if (timer) queue.push(makeFigletText(text, ms));
        else makeFigletText(text, ms);
        return this;
    }
    this.count = function(n) {
        if (timer) queue.push(countDown(n));
        else countDown(n);
        return this.delay((n+1)*1000);
    }
    this.frame = function(f) {
        if (timer) queue.push(setFrame(f));
        else setFrame(f)
        return this;
    }
}

/*module.exports = {
    'launch': launchRocket,
    'type': makeFigletText,
    'count': countDown,
    'frame': setFrame,
    'rl': rl
};*/

module.exports = new rl();