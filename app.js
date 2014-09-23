window.onload = function() {

// Get a reference to the canvas object
var canvas = document.getElementById('papercanvas');

// Make canvas full width & (almost) full height
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

// Create an empty project and a view for the canvas:
paper.setup(canvas);

function masterArc (size) {
    // magic nums below are cos(45) and sin(45), respectively
    var arc = new paper.Path.Arc({
        from: [size, 0],
        through: [0.5253*size, 0.8509*size],
        to: [0, size],
        strokeWidth: 0
    });
    // add 90 deg apex point
    arc.join(new paper.Path({segments: [[size,0],[0,0],[0,size]]}));
    arc.strokeWidth = 0;
    arc.fillColor = '#ccc';
    return arc;
}

function buildGrid (arc,rows,cols,centerPoint) {
    var arcs = [];
    var arcSymbols = [];
    for (var x = 0; x < rings; x++) {
        arcs[x] = arc.clone();
        arcSymbols[x] = new paper.Symbol(arcs[x]);
    }
    arc.remove();
    var position,rotate,tlDist,trDist,llDist,lrDist;
    var scaleFactor = 1.0;

    for (var i = 0; i < cols; i++) {
        grid[i] = [];
        // directions[i] = [];
        for (var j = 0; j < rows; j++) {
            grid[i][j] = [];
            position = new paper.Point(i*arc.bounds.width+arc.bounds.width*0.5,
                                       j*arc.bounds.width+arc.bounds.width*0.5);
            rotate = Math.round(Math.random()*4)*90;
            for (var k = 0; k < rings; k++) {
                grid[i][j][k] = [];
                grid[i][j][k] = arcSymbols[k].place(position);

                grid[i][j][k].scale(1.0-(1.0/rings)*k,grid[i][j][k].bounds.topLeft);

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
                grid[i][j][k].rotate(rotate,position);
            }
        }
    }
    for (var y = 0; y < rings; y++) {
        arcSymbols[y].definition.fillColor = colors[y];
    }
}

function newLayout (centerPoint) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;

    // possible # of cols, ranked aesthetically
    if (canvas.width % 7 == 0) {
        cols = 7;
    } else if (canvas.width % 8 == 0) {
        cols = 8;
    } else if (canvas.width % 6 == 0) {
        cols = 6;
    } else if (canvas.width % 9 == 0) {
        cols = 9;
    } else if (canvas.width % 5 == 0) {
        cols = 5;
    } else if (canvas.width % 10 == 0) {
        cols = 10;
    } else if (canvas.width % 4 == 0) {
        cols = 4;
    } else if (canvas.width % 11 == 0) {
        cols = 11;
    } else {
        cols = 7;
    }
    cols += sizeMod;
    if (cols < 2) cols = 2;
    size = Math.floor(canvas.width/cols);
    rows = Math.floor(canvas.height/size);

    paper.project.activeLayer.removeChildren();
    buildGrid(masterArc(size),rows,cols,centerPoint);
    paper.view.draw();
}

function setColors() {
    var options = {};
    if (monochrome) {
        options.hue = "monochrome";
    } else { options.hue = ""; }
    if (dark) {
        options.luminosity = "dark";
    } else { options.luminosity = "bright"; }
    for (var i = 0; i < rings; i++) {
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
    if (elem == null || typeof(elem) == 'undefined') return;
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
addEvent(document.getElementById("png"), "click", function() {
});
addEvent(document.getElementById("svg"), "click", function() {
});
addEvent(document.getElementById("color"), "click", function() {
    monochrome = !monochrome;
    document.getElementById("color").textContent = monochrome ? "color" : "mono";
    setColors();
    newLayout();
});
addEvent(document.getElementById("luminosity"), "click", function() {
    dark = !dark;
    document.getElementById("luminosity").textContent = dark ? "light" : "dark";
    setColors();
    newLayout();
});
addEvent(document.getElementById("addring"), "click", function() {
    if (rings < 30) rings += 1;
    setColors();
    newLayout();
});
addEvent(document.getElementById("subtractring"), "click", function() {
    if (rings > 1) rings -= 1;
    setColors();
    newLayout();
});
addEvent(document.getElementById("smaller"), "click", function() {
    if (sizeMod < 50) sizeMod += 1;
    newLayout();
});
addEvent(document.getElementById("larger"), "click", function() {
    if (Math.abs(sizeMod) < cols) sizeMod -= 1;
    newLayout();
});

var grid = [];
var directions = [];
var colors = [];

var cols, rows, size;
var sizeMod = 0;
var monochrome, dark = false;
var rings = 3;

// view.onFrame = function (event) {
// };

interact = new paper.Tool();
interact.activate();
interact.onMouseDown = function onMouseUp(event) {
    setColors();
    newLayout(event.point);
}
interact.onKeyUp = function onKeyUp(event) {
    if (event.character == 'j' || event.character == 'J') {
        setColors();
        newLayout();
    }
}

setColors();
newLayout();

};
