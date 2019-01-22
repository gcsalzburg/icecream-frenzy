
// Cross-browser support for requestAnimationFrame
const w = window;
const requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// /////////////////////////////////
// // CORE PROGRAM VARIABLES      //
// // aka magic numbers           //
// /////////////////////////////////

const game = {
    w:              1180,
    h:              694,
    distance:       0,
    distance_scale: 50,   // divider to convert distance figure to metres.
    
    can_start:      false,

    speed:          50,  // current speed in pixels per second -> TODO: set to 0 for production
    target_speed:   600,  // desired road speed

    accel:          200,  // pixels per second^2
}

const NUM_LANES = 4;
const TRUCK_LANES = 3;

// Score keeping
const score = {
    orders_placed: 0,
    orders_served: 0,
    icecream_served: 0,
    icecream_wasted: 0,
    dollars: 0
}

// Background music
let bg_music = null;

// Handling for game progression events
const distance_triggers = [
    {
        distance:       800,
        has_triggered:  false,
        trigger:        function(){
            CUSTOMERS.is_open_for_customers = true;
        }
    }
];

// /////////////////////////////////
// // CREATE GAME OBJECTS         //
// /////////////////////////////////

// Create game objects
const CUSTOMERS = new Customers();
const TRUCK = new Truck();
const ROAD = new Road();

// Create the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = game.w;
canvas.height = game.h;

// For game loop
let then = 0;
let start_time = 0;

// for fps measurement
// Taken from: https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
let times = [];
let fps = 0;


// //////////////////////////////////
// // ASSET & GAME OBJECTS LOADING //
// //////////////////////////////////

// Queue image assets
const ASS_MANAGER = new AssetManager();
ASS_MANAGER.setDefaultPath("assets/");
ASS_MANAGER.queueDownloads(
    'truck/truck-sprite.png',

    'customers/2people.png',

    'cone-strawberry.png',
    'cone-vanilla.png',
    'cone-chocolate.png',

    'orders/drop_vanilla.png',
    'orders/drop_chocolate.png',
    'orders/drop_strawberry.png',
    
    'truck/dollar_up.png',
    'truck/dollar_down.png',

    'orders/bubble.png',
    'orders/bubble_order.png',

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

var assets_complete = function(){
    // Map all assets to their respective objects
    ROAD.src = ASS_MANAGER.getAsset('bg/road.png');
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


    TRUCK.init(
        ASS_MANAGER.getAsset('truck/truck-sprite.png'),
        ASS_MANAGER.getAsset('orders/drop_vanilla.png'),
        ASS_MANAGER.getAsset('orders/drop_chocolate.png'),
        ASS_MANAGER.getAsset('orders/drop_strawberry.png'),
        ASS_MANAGER.getAsset('truck/dollar_up.png'),
        ASS_MANAGER.getAsset('truck/dollar_down.png')
    );

    CUSTOMERS.init(
        ASS_MANAGER.getAsset('customers/2people.png'),
        ASS_MANAGER.getAsset('orders/bubble.png'),
        ASS_MANAGER.getAsset('orders/bubble_order.png')
    );

    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-vanilla.png'));
    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-chocolate.png'));
    CUSTOMERS.src_cones.push(ASS_MANAGER.getAsset('cone-strawberry.png'));

    bg_music = ASS_MANAGER.getAsset('sounds/bg_109bpm.mp3');

    // Can start game once assets are loaded
    game.can_start = true;
    enable_start();
}

var assets_loading = function(success,error,total){
    // Map loading progress onto error bar
    var bar = document.getElementById("bar");
    bar.style.width = (100*success/total) + "%";   
}



// /////////////////////////////////
// // UPDATE                      //
// /////////////////////////////////

var update = function (modifier) {

    // TODO: Check sequencing of functions in this update() call

    // Check keyboard
    check_keys();

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
    TRUCK.update(modifier);
    ROAD.update(modifier, game.distance);

};

// /////////////////////////////////
// // RENDER                      //
// /////////////////////////////////
var render = function (modifier, elapsed) {

    ROAD.render();

    CUSTOMERS.render_below(TRUCK.getLane(), elapsed);
    TRUCK.render(modifier, elapsed);
    CUSTOMERS.render_above(TRUCK.getLane(), elapsed);

    display_scores();
};

// /////////////////////////////////
// // SCORE                       //
// /////////////////////////////////

var icecream_served = function(){
    score.icecream_served++;
    TRUCK.dollar(0);
    score.dollars += 3;
}

var icecream_wasted = function(){
    score.icecream_served--;
    TRUCK.dollar(1);
    score.dollars -= 1;
}


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

 //   bg_music.volume = 0;
    bg_music.playbackRate = 1.0;
    bg_music.loop = true;
    bg_music.play();

    then = Date.now();
    start_time = then;
    main();
}

// Begin asset loading
ASS_MANAGER.downloadAll(assets_complete,assets_loading);


// Helper fns
function rand_int(max){
    return Math.floor(Math.random()*max);
}