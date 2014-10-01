window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);

window.onload = function() {


var settings = {
    cols: 1,
    rows: 1,
    size: 1,
    sizeMod: 0,
    monochrome: false,
    dark: false,
    rings: 3
};
var grid = [];
var colors = [];
var canvas = document.getElementById('papercanvas');


function masterArc (size) {
    // magic nums below are cos(45) and sin(45), respectively
    var arc = new paper.Path.Arc({
        from: [size, 0],
        through: [0.5253*size, 0.8509*size],
        to: [0, size],
        strokeWidth: 0
    });
    // add 90 deg apex point
    arc.join(new paper.Path({segments: [[size,0], [0,0], [0,size]]}));
    arc.strokeWidth = 0;
    arc.fillColor = '#cccccc';
    return arc;
}

function buildGrid (arc, rows, cols, centerPoint) {
    var arcs = [];
    var arcSymbols = [];
    for (var x = 0; x < settings.rings; x++) {
        arcs[x] = arc.clone();
        arcSymbols[x] = new paper.Symbol(arcs[x]);
    }
    arc.remove();
    var position, rotate, tlDist, trDist, llDist, lrDist;

    for (var i = 0; i < cols; i++) {
        grid[i] = [];
        for (var j = 0; j < rows; j++) {
            grid[i][j] = [];
            position = new paper.Point(i*arc.bounds.width+arc.bounds.width*0.5,
                                       j*arc.bounds.width+arc.bounds.width*0.5);
            rotate = Math.round(Math.random()*4)*90;
            for (var k = 0; k < settings.rings; k++) {
                grid[i][j][k] = [];
                grid[i][j][k] = arcSymbols[k].place(position);

                grid[i][j][k].scale(1.0-(1.0/settings.rings)*k, grid[i][j][k].bounds.topLeft);

                if (centerPoint) {
                    tlDist = grid[i][j][0].bounds.topLeft.getDistance(centerPoint);
                    trDist = grid[i][j][0].bounds.topRight.getDistance(centerPoint);
                    llDist = grid[i][j][0].bounds.bottomLeft.getDistance(centerPoint);
                    lrDist = grid[i][j][0].bounds.bottomRight.getDistance(centerPoint);
                    if ( tlDist < trDist && tlDist < llDist && tlDist < lrDist ) {
                        rotate = 0;
                    } else if ( trDist < tlDist && trDist < llDist && trDist < lrDist ) {
                        rotate = 90;
                    } else if ( llDist < tlDist && llDist < trDist && llDist < lrDist ) {
                        rotate = 270;
                    } else {
                        rotate = 180;
                    }
                }
                grid[i][j][k].rotate(rotate, position);
            }
        }
    }
    for (var y = 0; y < settings.rings; y++) {
        arcSymbols[y].definition.fillColor = colors[y];
    }
}

function newLayout (centerPoint) {
    paper.view.viewSize.width = window.innerWidth;
    paper.view.viewSize.height = window.innerHeight - 100;

    // possible # of cols, ranked aesthetically
    if (paper.view.viewSize.width % 7 == 0) {
        settings.cols = 7;
    } else if (paper.view.viewSize.width % 8 == 0) {
        settings.cols = 8;
    } else if (paper.view.viewSize.width % 6 == 0) {
        settings.cols = 6;
    } else if (paper.view.viewSize.width % 9 == 0) {
        settings.cols = 9;
    } else if (paper.view.viewSize.width % 5 == 0) {
        settings.cols = 5;
    } else if (paper.view.viewSize.width % 10 == 0) {
        settings.cols = 10;
    } else if (paper.view.viewSize.width % 4 == 0) {
        settings.cols = 4;
    } else if (paper.view.viewSize.width % 11 == 0) {
        settings.cols = 11;
    } else {
        settings.cols = 7;
    }
    settings.cols += settings.sizeMod;
    if (settings.cols < 2) { settings.cols = 2; }
    settings.size = Math.floor(paper.view.viewSize.width/settings.cols);
    settings.rows = Math.floor(paper.view.viewSize.height/settings.size);

    paper.project.activeLayer.removeChildren();
    buildGrid(masterArc(settings.size), settings.rows, settings.cols, centerPoint);
    paper.view.draw();
}

function setColors() {
    var options = {};
    if (settings.monochrome) {
        options.hue = "monochrome";
    } else { options.hue = ""; }
    if (settings.dark) {
        options.luminosity = "dark";
    } else { options.luminosity = "bright"; }
    for (var i = 0; i < settings.rings; i++) {
        colors[i] = randomColor(options);
    }
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

var addEvent = function(elem, type, eventHandle) {
    if (elem == null || typeof(elem) == 'undefined') { return; }
    if (elem.addEventListener) {
        elem.addEventListener(type, eventHandle, false);
    } else if (elem.attachEvent) {
        elem.attachEvent("on" + type, eventHandle);
    } else {
        elem["on"+type]=eventHandle;
    }
};
addEvent(window, "resize", function() {
    delay(newLayout, 250);
});
addEvent(document.getElementById("jumble"), "click", function() {
    setColors();
    newLayout();
});
// addEvent(document.getElementById("png"), "click", function() {
// });
// addEvent(document.getElementById("svg"), "click", function() {
// });
addEvent(document.getElementById("color"), "click", function() {
    settings.monochrome = !settings.monochrome;
    document.getElementById("color").textContent = settings.monochrome ? "color" : "mono";
    setColors();
    newLayout();
});
addEvent(document.getElementById("luminosity"), "click", function() {
    settings.dark = !settings.dark;
    document.getElementById("luminosity").textContent = settings.dark ? "light" : "dark";
    setColors();
    newLayout();
});
addEvent(document.getElementById("addring"), "click", function() {
    if (settings.rings < 30) { settings.rings += 1; }
    setColors();
    newLayout();
});
addEvent(document.getElementById("subtractring"), "click", function() {
    if (settings.rings > 1) { settings.rings -= 1; }
    setColors();
    newLayout();
});
addEvent(document.getElementById("smaller"), "click", function() {
    if (settings.sizeMod < 50) { settings.sizeMod += 1; }
    newLayout();
});
addEvent(document.getElementById("larger"), "click", function() {
    if (Math.abs(settings.sizeMod) < settings.cols) { settings.sizeMod -= 1; }
    newLayout();
});
addEvent(document.getElementById("info"), "click", function() {
    document.getElementById("slide").className = "show-nav";
});
addEvent(document.getElementById("closeinfo"), "click", function() {
    document.getElementById("slide").className = "";
});

// view.onFrame = function (event) {
// };

interact = new paper.Tool();
interact.activate();
interact.onMouseDown = function onMouseUp(event) {
    setColors();
    newLayout(event.point);
};
interact.onKeyUp = function onKeyUp(event) {
    if (event.character == 'j' || event.character == 'J') {
        setColors();
        newLayout();
    }
};


paper.setup(canvas);
setColors();
newLayout();


};
