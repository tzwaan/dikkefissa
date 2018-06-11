//  Copyright (c) 2010-2015 Giulia Alfonsi <electric.g@gmail.com>
//  MIT license
//
//  Permission is hereby granted, free of charge, to any person
//  obtaining a copy of this software and associated documentation
//  files (the "Software"), to deal in the Software without
//  restriction, including without limitation the rights to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following
//  conditions:
//
//  The above copyright notice and this permission notice shall be
//  included in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
//  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//  OTHER DEALINGS IN THE SOFTWARE.
//  Simple example of using private variables
//
//  To start the stopwatch:
//      obj.start();
//
//  To get the duration in milliseconds without pausing / resuming:
//      var x = obj.time();
//
//  To pause the stopwatch:
//      var x = obj.stop(); // Result is duration in milliseconds
//
//  To resume a paused stopwatch
//      var x = obj.start();    // Result is duration in milliseconds
//
//  To reset a paused stopwatch
//      obj.stop();
//
var clsStopwatch = function() {
        // Private vars
        var startAt = 0;    // Time of last start / resume. (0 if not running)
        var lapTime = 0;    // Time on the clock when last stopped in milliseconds
        var diffTime = 0;    // Time since last diff check

        var now = function() {
                return (new Date()).getTime();
            };

        // Public methods
        // Start or resume
        this.start = function() {
                startAt = startAt ? startAt : now();
                diffTime = startAt;
            };

        // Stop or pause
        this.stop = function() {
                // If running, update elapsed time otherwise keep it
                lapTime = startAt ? lapTime + now() - startAt : lapTime;
                startAt = 0; // Paused
            };

        // Reset
        this.reset = function() {
                lapTime = startAt = 0;
            };

        // Duration
        this.time = function() {
                return lapTime + (startAt ? now() - startAt : 0);
            };

        this.lastTimeDiff = function() {
                var diff = now() - diffTime;
                diffTime = now();
                return diff;
            };
    };

var x = new clsStopwatch();
var $time;
var clocktimer;

function pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length - size);
}

function formatTime(time, hideMS, hideS, hideM) {
    var h = m = s = ms = 0;
    var newTime = '';

    h = Math.floor( time / (60 * 60 * 1000) );
    time = time % (60 * 60 * 1000);
    m = Math.floor( time / (60 * 1000) );
    time = time % (60 * 1000);
    s = Math.floor( time / 1000 );
    ms = time % 1000;

    newTime = pad(h, 2)
    if (hideM) {
        newTime += ' hours'
        return newTime;
    }
    newTime += ':' + pad(m, 2);
    if (hideS) {
        return newTime;
    }
    newTime += ':' + pad(s, 2);
    if (hideMS) {
        return newTime;
    }
    newTime += ':' + pad(ms, 3);
    return newTime;
}

function show() {
    $time = document.getElementById('time');
    update();
}

function update(elementID, time) {
    var element;
    if (!elementID) {
        element = $time;
    } else {
        element = document.getElementById(elementID);
    }
    if (!time) {
        time = x.time();
    }
    element.innerHTML = formatTime(time, true);
}

function start() {
    clocktimer = setInterval("update()", 1);
    x.start();
}

function stop() {
    x.stop();
    clearInterval(clocktimer);
}

function lastTimeDiff() {
    return x.lastTimeDiff();
}

function reset() {
    stop();
    x.reset();
    update();
}
