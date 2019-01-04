
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

// Score keeping
var score = {
    orders_placed: 0,
    orders_served: 0,
    icecream_served: 0,
    icecream_wasted: 0
}

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
    'cone-vanilla.png',
    'cone-chocolate.png',
    'speech-bubble.png',
    'truck-frames/0.png',
    'truck-frames/1.png',
    'truck-frames/2.png',
    'truck-frames/3.png',
    'truck-frames/4.png',
    'truck-frames/5.png',
    'truck-frames/6.png',
    'truck-frames/7.png',
    'truck-frames/8.png',
    'truck-frames/9.png',
    'truck-frames/10.png',
    'truck-frames/12.png',
    'truck-frames/13.png',
    'truck-frames/14.png',
    'truck-frames/15.png',
    'truck-frames/16.png',
    'truck-frames/17.png'
);
ASS_MANAGER.downloadAll(function() {
    ROAD.src =                      ASS_MANAGER.getAsset('bg.png');
    TRUCK.src =                     ASS_MANAGER.getAsset('truck.png');
    CUSTOMERS.src_car =             ASS_MANAGER.getAsset('car.png');
    CUSTOMERS.src_speech_bubble =   ASS_MANAGER.getAsset('speech-bubble.png');

    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-vanilla.png'));
    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-chocolate.png'));
    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-strawberry.png'));


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
document.getElementById("game_holder").prepend(canvas);

// For game loop
var then;

// for fps measurement
// Taken from: https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
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
    if(49 in keysDown){ // NUMBER 1
        delete keysDown[49];
        if(CUSTOMERS.serve(TRUCK.lane,0)){
            score.icecream_served++;
        }else{
            score.icecream_wasted++;
        }
    }
    if(50 in keysDown){ // NUMBER 2
        delete keysDown[50];
        if(CUSTOMERS.serve(TRUCK.lane,1)){
            score.icecream_served++;
        }else{
            score.icecream_wasted++;
        }
    }
    if(51 in keysDown){ // NUMBER 3
        delete keysDown[51];
        if(CUSTOMERS.serve(TRUCK.lane,2)){
            score.icecream_served++;
        }else{
            score.icecream_wasted++;
        }
    }

    // Update loops for objects
    CUSTOMERS.update(modifier);
    ROAD.update(modifier);

};

// /////////////////////////////////
// // RENDER                      //
// /////////////////////////////////
var render = function () {

    ROAD.render();
    CUSTOMERS.render_below(TRUCK.lane);
    TRUCK.render();
    CUSTOMERS.render_above(TRUCK.lane);

    // Scores
	ctx.fillStyle = "rgb(58, 61, 62)";
    ctx.font = "22px VT323";
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
    ctx.fillText("Orders served: " + score.orders_served + "/" + score.orders_placed, 802, 370);  
 //   ctx.fillText("Ice creams delivered: " + score.icecream_served + "/" + score.icecream_wasted, 802, 349);    
    ctx.fillText("Ice cream efficiency: " + Math.round(1000*(score.icecream_served / (score.icecream_served+score.icecream_wasted)))/10 + "%" , 802, 349);   

	// FPS
	ctx.font = "8px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
    ctx.fillText("FPS: " + fps, 807, 13);    
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