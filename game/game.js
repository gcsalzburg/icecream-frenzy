
// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// /////////////////////////////////
// // CORE PROGRAM VARIABLES      //
// // aka magic numbers           //
// /////////////////////////////////

var game = {
    w: 812,
    h: 375
}

var NUM_LANES = 3;
var LANES_Y = [2,96,191];
var TRUCK_LANES_Y = [65,171];


// //////////////////////////////////
// // ASSET & GAME OBJECTS LOADING //
// //////////////////////////////////

// Queue image assets
var ASS_MANAGER = new AssetManager();
ASS_MANAGER.setDefaultPath("assets/");
ASS_MANAGER.queueDownloads(
    'bg.png',
    'truck.png',
    'car.png',
    'cone-strawberry.png',
    'cone-vanilla.png'
);
ASS_MANAGER.downloadAll(function() {
    ROAD.src = ASS_MANAGER.getAsset('bg.png');
    TRUCK.src = ASS_MANAGER.getAsset('truck.png');
    CUSTOMERS.src_car = ASS_MANAGER.getAsset('car.png');

    // Can start game once assets are loaded
    start_game();   
});

// Create game objects
var CUSTOMERS = new Customers();
var TRUCK = new Truck();
var ROAD = new Road();

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = game.w;
canvas.height = game.h;
document.body.appendChild(canvas);

// For game loop
var then;

// for fps measurement
var times = [];
var fps;

// /////////////////////////////////
// // KEYBOARD HANDLING           //
// /////////////////////////////////

var keysDown = {};
var keysUp = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
    keysUp[e.keyCode] = true;
}, false);


// /////////////////////////////////
// // UPDATE                      //
// /////////////////////////////////

var update = function (modifier) {

    // Handle key presses
    if(38 in keysDown){         // UP
        delete keysDown[38];
        TRUCK.change_lane(-1);
    }else if(40 in keysDown){   // DOWN
        delete keysDown[40];
        TRUCK.change_lane(1);
    }

    // Update loops for objects
    CUSTOMERS.update_all(modifier);
    ROAD.update(modifier);

};

// /////////////////////////////////
// // RENDER                      //
// /////////////////////////////////
var render = function () {

    ROAD.render();
    TRUCK.render();
    CUSTOMERS.render_all();
    
	// FPS
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "8px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
    ctx.fillText("FPS: " + fps, 802, 365);    
};

// /////////////////////////////////
// // GAME LOOP                   //
// /////////////////////////////////
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

    then = now;
    
    // Measure FPS performance
    var fps_now = performance.now();
    while (times.length > 0 && times[0] <= fps_now - 1000) {
        times.shift();
    }
    times.push(fps_now);
    fps = times.length;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// /////////////////////////////////
// // START                       //
// ///////////////////////////////// 
var start_game = function () {
    then = Date.now();
    main();
}