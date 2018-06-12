var current_index = 0
var music;
var storage = window.localStorage;
var randomTimeout;
var fluteCounter = Math.floor(Math.random() * 20);

// Load a specific fissa at index "index"  in the order array
function load(index, flute) {
    if (music)
        music.unload();
    var version = 'src';
    var gifversion = 'gif';
    if ('flutesrc' in songs[order[index]]) {
        fluteCounter++;
        if (fluteCounter % 20 == 0 || flute) {
            version = 'flutesrc';
            gifversion = 'flutegif';
        }
    }
    music = new Howl({
        src: ['/' + songs[order[index]][version]],
        loop: true,
        autoplay: true
    });
    var gif = document.getElementById('gif');
    gif.src = '/' + songs[order[index]][gifversion];
    var title = document.getElementById('title');
    title.textContent = songs[order[index]]['title'];
    var number = document.getElementById('number');
    number.textContent = "" + (current_index+1) + " / " + order.length;

    history.pushState({fissa: ""+ (current_index+1)}, "Fissa "+(current_index+1), "" + (current_index+1));

    if (storage.getItem('randomizerEnabled') == 'true') {
        setRandomizer();
    }
}

// Load the next fissa
function next() {
    current_index = (current_index + 1) % order.length;
    load(current_index);
}

// Load the previous fissa
function previous() {
    current_index = (current_index - 1 + order.length) % order.length;
    load(current_index);
}

// Load a random fissa
function random(not_current) {
    if (!not_current)
        current_index = Math.floor(Math.random() * order.length);
    else
        var not = current_index;
        while (current_index == not)
            current_index = Math.floor(Math.random() * order.length);
    load(current_index);
}

// Save local time statistics
function updateLocalTime() {
    var fissaTime = storage.getItem(order[current_index]);
    if (!fissaTime) {
        fissaTime = 0;
    }
    if (isNaN(fissaTime)) {
        fissaTime = 0;
    }
    fissaTime = parseInt(fissaTime);

    fissaTime += lastTimeDiff();
    storage.setItem(order[current_index], fissaTime);

    update('score', fissaTime);
}

function toggleRandomizer() {
    var randomizerEnabled = storage.getItem('randomizerEnabled');
    if (randomizerEnabled == 'true') {
        storage.setItem('randomizerEnabled', 'false');
    }
    else {
        storage.setItem('randomizerEnabled', 'true');
    }
    setRandomizer();
}

function setRandomizer() {
    var randomizerEnabled = storage.getItem('randomizerEnabled');
    var element = document.getElementById('randomizer');
    window.clearTimeout(randomTimeout);
    if (randomizerEnabled == 'true') {
        element.innerHTML = 'Randomizer enabled';
        randomTimeout = window.setTimeout(random, posRandNormal(70000, 60000), true);
    } else {
        element.innerHTML = 'Randomizer disabled';
    }
}

function loadAssets() {
    var images = {};
    var fluteImages = {};
    var howls = {};
    var fluteHowls = {};
    order.forEach(function(name) {
        images[name] = new Image();
        images[name].src = songs[name].gif;
        howls[name] = new Howl({
            src: ['/' + songs[name].src],
            loop: true,
            autoplay: false
        });
        if ('flutesrc' in songs[name]) {
            fluteImages[name] = new Image();
            fluteImages[name].src = songs[name].flutegif;
            fluteHowls[name] = new Howl({
                src: ['/' + songs[name].flutesrc],
                loop: true,
                autoplay: false
            });
        }
    });
}

function posRandNormal(mu, sigma) {
    result = 0;
    while (result <= 0) result = randNormal(mu, sigma);
    return result;
}
// Standard Normal variate using Box-Muller transform.
function randNormal(mu, sigma) {
    var u = 0, v = 0, normal;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mu + normal*sigma;
}

function updateStatistics() {
    var element = document.getElementById("statistics");
    var statistics = [];
    order.forEach(function(name) {
        statistics.push([name, parseInt(storage[name])]);
    });
    statistics.sort(function(a, b) {
        if (a[1] > b[1])
            return -1;
        if (a[1] < b[1])
            return 1;
        return 0;
    });
    var html = ""
    statistics.forEach(function(fissa) {
        html += "<dt>" + songs[fissa[0]].title + ": <dd>" + formatTime(fissa[1], true);
    });
    element.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function() {
    // Get the optional fissa-id from the url
    result = /.*\/(\d+)/.exec(document.URL);
    if (result) {
        current_index = result[1]-1;
    }
    if (current_index >= order.length || current_index < 0)
        current_index = 0;
    load(current_index);
    setRandomizer();

    // Load controls
    document.addEventListener('keydown', function(e) {
        if (e.keyCode == 37 || e.keyCode ==  38 || e.keyCode == 72 || e.keyCode == 75 || e.keyCode == 90 || e.keyCode == 65 || e.keyCode == 83) {
            previous();
        }
        else if (e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 74 || e.keyCode == 76 || e.keyCode == 67 || e.keyCode == 68 || e.keyCode == 87) {
            next();
        }
        else if (e.keyCode == 88 || e.keyCode == 82) {
            random(true);
        }
        else if (e.keyCode >= 48 && e.keyCode <= 57) {
            if (e.keyCode == 48)
                current_index = 9;
            else
                current_index = e.keyCode - 49;
            load(current_index);
        }
    });

    // Timer
    show();
    start();

    // Save the new time to localstorage every second
    var intervalID = window.setInterval(updateLocalTime, 1000);

    //Preload the music and images
    loadAssets();

    window.setInterval(updateStatistics, 1000);
});
