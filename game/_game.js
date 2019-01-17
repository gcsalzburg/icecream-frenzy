
// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// /////////////////////////////////
// // CORE PROGRAM VARIABLES      //
// // aka magic numbers           //
// /////////////////////////////////

var game = {
    w:              1180,
    h:              694,
    distance:       0,
    can_start:      false,

    speed:          200,  // current speed in pixels per second -> TODO: set to 0 for production
    accel:          200,  // pixels per second^2
    target_speed:   600,  // desired road speed
}

var NUM_LANES = 4;
var TRUCK_LANES = 3;

// Score keeping
var score = {
    orders_placed: 0,
    orders_served: 0,
    icecream_served: 0,
    icecream_wasted: 0
}

// Background music
var bg_music = null;

var distance_triggers = [
    {
        distance:       800,
        has_triggered:  false,
        trigger:        function(){
            CUSTOMERS.is_open_for_customers = true;
        }
    }
];

// //////////////////////////////////
// // ASSET & GAME OBJECTS LOADING //
// //////////////////////////////////

// Queue image assets
var ASS_MANAGER = new AssetManager();
ASS_MANAGER.setDefaultPath("assets/");
ASS_MANAGER.queueDownloads(
    'truck/truck-sprite.png',

    'customers/2people.png',

    'cone-strawberry.png',
    'cone-vanilla.png',
    'cone-chocolate.png',
    'speech-bubble.png',
    'truck-sprites.png',
    'sounds/bg_109bpm.mp3',

    'bg/road.png',
    'bg/cactus_1.png',
    'bg/cactus_2.png',
    'bg/cactus_3.png',
    'bg/cactus_4.png',
    'bg/cactus_5.png',
    'bg/crack_1.png',
    'bg/crack_2.png',
    'bg/crack_3.png',
    'bg/crack_4.png'
);
ASS_MANAGER.downloadAll(function() {
    ROAD.src =     ASS_MANAGER.getAsset('bg/road.png');
    ROAD.decor_data[0].graphics = [
        ASS_MANAGER.getAsset('bg/cactus_1.png'),
        ASS_MANAGER.getAsset('bg/cactus_2.png'),
        ASS_MANAGER.getAsset('bg/cactus_3.png'),
        ASS_MANAGER.getAsset('bg/cactus_4.png'),
        ASS_MANAGER.getAsset('bg/cactus_5.png')
    ];
    ROAD.decor_data[1].graphics = ROAD.decor_data[0].graphics;
    ROAD.decor_data[2].graphics = [
        ASS_MANAGER.getAsset('bg/crack_1.png'),
        ASS_MANAGER.getAsset('bg/crack_2.png'),
        ASS_MANAGER.getAsset('bg/crack_3.png'),
        ASS_MANAGER.getAsset('bg/crack_4.png')
    ];


    TRUCK.init(ASS_MANAGER.getAsset('truck/truck-sprite.png'));

    CUSTOMERS.init(ASS_MANAGER.getAsset('customers/2people.png'));

    CUSTOMERS.src_speech_bubble =   ASS_MANAGER.getAsset('speech-bubble.png');

    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-vanilla.png'));
    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-chocolate.png'));
    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-strawberry.png'));


    bg_music = ASS_MANAGER.getAsset('sounds/bg_109bpm.mp3');


    // Can start game once assets are loaded
    game.can_start = true;
    var bar = document.getElementById("play");
    if (bar.classList) bar.classList.remove("disabled");
    else bar.className = bar.className.replace(new RegExp('\\b'+ disabled+'\\b', 'g'), '');

}, function(success,error,total){
    var bar = document.getElementById("bar");
    bar.style.width = (100*success/total) + "%";
});


// Simple test of playing audio on click
var el = document.getElementById('play');
// attach anonymous function to click event
el.addEventListener('click', function(){
    if(game.can_start){
        start_game();   
    }
});


// Create game objects
var CUSTOMERS = new Customers();
var TRUCK = new Truck();
var ROAD = new Road();

// Create the canvas
// var canvas = document.createElement("canvas");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = game.w;
canvas.height = game.h;

// For game loop
var then;
var start_time;

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

    // TODO: Check sequencing of functions in this update() call

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

    // Roll the road!
    if(game.target_speed > game.speed){
        game.speed += game.accel*modifier;
    }
    if(game.speed > game.target_speed){
        game.speed = game.target_speed;
    }
    game.distance += game.speed*modifier;

    // Check distance triggers
    for (var i = 0; i < distance_triggers.length; i++) {
        var trigger = distance_triggers[i];
        if(!trigger.has_triggered){
            if(game.distance > trigger.distance){
                trigger.trigger();
                trigger.has_triggered = true;
            }
        }
    }

    // Update loops for objects
    CUSTOMERS.update(modifier);
    ROAD.update(modifier, game.distance);

};

// /////////////////////////////////
// // RENDER                      //
// /////////////////////////////////
var render = function (modifier, elapsed) {

    ROAD.render();

    CUSTOMERS.render_below(TRUCK.lane, elapsed);
    TRUCK.render(modifier, elapsed);
    CUSTOMERS.render_above(TRUCK.lane, elapsed);

    // Scores
	ctx.fillStyle = "rgb(58, 61, 62)";
    ctx.font = "22px VT323";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
    ctx.fillText("Orders served: " + score.orders_served + "/" + score.orders_placed, 1170, 40);    
    ctx.fillText("Ice cream efficiency: " + Math.round(1000*(score.icecream_served / (score.icecream_served+score.icecream_wasted)))/10 + "%" , 1170, 62);  
    
    ctx.font = "50px VT323";
    ctx.textAlign = "left";
    var score_disp = score.orders_served - (score.orders_placed-score.orders_served)*2;
    ctx.fillText(score_disp, 20,20);

	// FPS
	ctx.font = "8px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
    ctx.fillText("FPS: " + fps, 1170, 10);    
};

// /////////////////////////////////
// // GAME LOOP                   //
// /////////////////////////////////
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render(delta / 1000, now-start_time);

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

    document.getElementById("intro").style.display = "none";

    bg_music.volume = 0;
    bg_music.playbackRate = 1.0;
    bg_music.loop = true;
    bg_music.play();

    then = Date.now();
    start_time = then;
    main();
}



// Helper fns
function rand_int(max){
    return Math.floor(Math.random()*max);
}