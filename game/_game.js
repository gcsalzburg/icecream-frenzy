
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
    distance_scale: 50,   // pixels -> metres conversion (can be anything, just should be sensible and consistent)

    mode:           0,
    
    can_start:      false,
    start_time:     0,

    speed:          0,  // current speed in pixels per second
    target_speed:   600,  // desired road speed

    accel:          300,  // pixels per second^2

    is_muted:       false,
    is_playing:     false,

    is_over:        false,  // Used for end game cones
    game_over_time: 0
}

const CRAZY_MODE_DURATION = 60; // in seconds

const NUM_LANES = 4;
const TRUCK_LANES = 3;

// Score keeping
const score = {
    lives: 3,
    orders_placed: 0,
    orders_served: 0,
    orders_not_served: 0,
    icecream_served: 0,
    icecream_wasted: 0,
    dollars: 0
}

// Background music & sounds
let bg_music = null;
let bg_music_vol = 0.5;
const bg_music_endgame_scaler = 0.65; //to reduce volume of end game clip compared to main clip
const sounds = {
    served:     null,
    dumped:    null,
    lane:       null,
    hurrah:     null,
    new_order:  null
}
let bg_music_end = null;

// End game cones
let end_cone_srcs = [];

// Handling for game progression events
const distance_triggers = [
    [
        // Normal mode game triggers
        {
            distance:       1000,
            has_triggered:  false,
            trigger:        function(){
                // Open for serving!
                CUSTOMERS.is_open_for_customers = true;
            }
        },
        {
            distance:       5000,
            has_triggered:  false,
            trigger:        function(){
                // Decrease interval between customers
                CUSTOMERS.customer_interval = 2000;
            }
        },
        {
            distance:       10000,
            has_triggered:  false,
            trigger:        function(){
                // Introduce mid-sized cars
                CUSTOMERS.set_weighting(2,1);
            }
        },
        {
            distance:       15000,
            has_triggered:  false,
            trigger:        function(){
                // Add a second flavour
                CUSTOMERS.number_flavours = 2;
            }
        },
        {
            distance:       20000,
            has_triggered:  false,
            trigger:        function(){
                // Decrease interval between customers
                CUSTOMERS.customer_interval = 1500;
            }
        },
        {
            distance:       30000,
            has_triggered:  false,
            trigger:        function(){
                // Add a third flavour
                CUSTOMERS.number_flavours = 3;
            }
        },
        {
            distance:       40000,
            has_triggered:  false,
            trigger:        function(){
                // Add large cars
                CUSTOMERS.set_weighting(3,1);
            }
        },
        {
            distance:       50000,
            has_triggered:  false,
            trigger:        function(){
                // Decrease interval between cars
                CUSTOMERS.customer_interval = 1000;
            }
        },
        {
            distance:       60000,
            has_triggered:  false,
            trigger:        function(){
                // Remove smallest car
                CUSTOMERS.set_weighting(0,0);
            }
        },
        {
            distance:       100000,
            has_triggered:  false,
            trigger:        function(){
                // Increase game speed
                game.target_speed += 50;
            }
        },
        {
            distance:       110000,
            has_triggered:  false,
            trigger:        function(){
                // Increase game speed
                game.target_speed += 50;
            }
        },
        {
            distance:       120000,
            has_triggered:  false,
            trigger:        function(){
                // Increase game speed
                game.target_speed += 50;
            }
        }
    ],[
        // Crazy mode game triggers
        {
            distance:       1000,
            has_triggered:  false,
            trigger:        function(){
                CUSTOMERS.is_open_for_customers = true;     // Open for serving!
                CUSTOMERS.customer_interval = 150;          // Reduce interval
                CUSTOMERS.number_flavours = 3;              // Add all flavours
                CUSTOMERS.set_weighting(3,1);               // Enable large cars
            }
        }
    ]
];

// /////////////////////////////////
// // CREATE GAME OBJECTS         //
// /////////////////////////////////

// Create game objects
const CUSTOMERS = new Customers();
const TRUCK = new Truck();
const ROAD = new Road();

// Generate life icons array
let LIVES = [];
for(let i=0; i<score.lives; i++){
    LIVES.push(new Life(10 + i*30));
}

// Create the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = game.w;
canvas.height = game.h;

// For game loop
let then = 0;

// for fps measurement
// Taken from: https://www.growingwiththeweb.com/2017/12/fast-simple-js-fps-counter.html
const fps = {
    current: 0,
    times: []
}


// //////////////////////////////////
// // ASSET & GAME OBJECTS LOADING //
// //////////////////////////////////

// Queue image assets
const ASS_MANAGER = new AssetManager();
ASS_MANAGER.setDefaultPath("assets/");
ASS_MANAGER.queueDownloads(

    'ui/life.png',
    'ui/stats-cones.png',
    'ui/stats-dropped.png',
    'ui/stats-road.png',

    'end/death-chocolate.png',
    'end/death-strawberry.png',
    'end/death-vanilla.png',

    'customers/biker.png',
    'customers/2ppl.png',
    'customers/4ppl.png',
    'customers/6ppl.png',

    'orders/cone-strawberry.png',
    'orders/cone-vanilla.png',
    'orders/cone-chocolate.png',
    'orders/drop_vanilla.png',
    'orders/drop_chocolate.png',
    'orders/drop_strawberry.png',
    
    'truck/truck-sprite.png',
    'truck/dollar_up.png',
    'truck/dollar_down.png',

    'orders/bubble.png',
    'orders/bubble_order.png',

    'sounds/bg_109bpm.mp3',
    'sounds/customer_served.mp3',
    'sounds/dropped.mp3',
    'sounds/lane_change.mp3',
    'sounds/new_order.mp3',
    'sounds/serve.mp3',
    'sounds/endgame.mp3',

    'bg/road.png',
    'bg/cactus_1.png',
    'bg/cactus_2.png',
    'bg/cactus_3.png',
    'bg/cactus_4.png',
    'bg/cactus_5.png',
    'bg/crack_1.png',
    'bg/crack_2.png',
    'bg/crack_3.png',
    'bg/crack_4.png',
    'bg/cloud_1.png',
    'bg/cloud_2.png',
    'bg/cloud_3.png',
    'bg/cloud_4.png',
    'bg/tumbleweed.png'
);

var assets_complete = function(){

    // Map all assets to their objects

    // UI
    for(let i=0;i<LIVES.length;i++){
        LIVES[i].init(ASS_MANAGER.getAsset('ui/life.png'));
    }

    // End game cones
    end_cone_srcs[0] = ASS_MANAGER.getAsset('end/death-chocolate.png');
    end_cone_srcs[1] = ASS_MANAGER.getAsset('end/death-vanilla.png');
    end_cone_srcs[2] = ASS_MANAGER.getAsset('end/death-strawberry.png');

    // Road and decor
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
    ROAD.decor_data[3].graphics = [
        ASS_MANAGER.getAsset('bg/cloud_1.png'),
        ASS_MANAGER.getAsset('bg/cloud_2.png'),
        ASS_MANAGER.getAsset('bg/cloud_3.png'),
        ASS_MANAGER.getAsset('bg/cloud_4.png')
    ];
    ROAD.decor_data[4].graphics = [ASS_MANAGER.getAsset('bg/tumbleweed.png')];

    // Truck
    TRUCK.init(
        ASS_MANAGER.getAsset('truck/truck-sprite.png'),
        ASS_MANAGER.getAsset('orders/drop_vanilla.png'),
        ASS_MANAGER.getAsset('orders/drop_chocolate.png'),
        ASS_MANAGER.getAsset('orders/drop_strawberry.png'),
        ASS_MANAGER.getAsset('truck/dollar_up.png'),
        ASS_MANAGER.getAsset('truck/dollar_down.png')
    );

    // Customers
    CUSTOMERS.customer_data[0].src = ASS_MANAGER.getAsset('customers/biker.png');
    CUSTOMERS.customer_data[1].src = ASS_MANAGER.getAsset('customers/2ppl.png');
    CUSTOMERS.customer_data[2].src = ASS_MANAGER.getAsset('customers/4ppl.png');
    CUSTOMERS.customer_data[3].src = ASS_MANAGER.getAsset('customers/6ppl.png');
    CUSTOMERS.src_bubbles = [
        ASS_MANAGER.getAsset('orders/bubble.png'),
        ASS_MANAGER.getAsset('orders/bubble_order.png')
    ];
    CUSTOMERS.src_cones = [
        ASS_MANAGER.getAsset('orders/cone-vanilla.png'),
        ASS_MANAGER.getAsset('orders/cone-chocolate.png'),
        ASS_MANAGER.getAsset('orders/cone-strawberry.png')
    ];

    // Music
    bg_music = ASS_MANAGER.getAsset('sounds/bg_109bpm.mp3');
    sounds.served = ASS_MANAGER.getAsset('sounds/serve.mp3');
    sounds.dumped = ASS_MANAGER.getAsset('sounds/dropped.mp3');
    sounds.lane = ASS_MANAGER.getAsset('sounds/lane_change.mp3');
    sounds.new_order = ASS_MANAGER.getAsset('sounds/new_order.mp3');
    sounds.hurrah = ASS_MANAGER.getAsset('sounds/customer_served.mp3');
    bg_music_end = ASS_MANAGER.getAsset('sounds/endgame.mp3');

    // Can start game once assets are loaded
    game.can_start = true;
    enable_start();

    // FOR TESTING ONLY
 //   start_game(); 
 //   toggle_music();
}

var assets_loading = function(success,error,total){
    // Map loading progress onto error bar
    var bar = document.getElementById("bar");
    bar.style.width = (100*success/total) + "%";   
}



// /////////////////////////////////
// // UPDATE                      //
// /////////////////////////////////

var update = function (delta, elapsed) {

    // TODO: Check sequencing of functions in this update() call

    // Check if game is over
    if((game.mode === 1)&&(game.is_playing)){
        if(performance.now()-game.start_time > (CRAZY_MODE_DURATION*1000)){
            game_over();
        }
    }

    // Check keyboard
    check_keys();

    // Roll the road!
    if(Math.round(game.speed) != game.target_speed){
        game.speed = game.speed + (game.accel*delta*((game.target_speed-game.speed)/Math.abs(game.target_speed-game.speed)));
    }else{
        game.speed = Math.round(game.speed);
    }

    // Now calculate distance increase
    game.distance += game.speed*delta; // v = s/t

    // Check distance triggers
    for (var i = 0; i < distance_triggers[game.mode].length; i++) {
        var trigger = distance_triggers[game.mode][i];
        if(!trigger.has_triggered){
            if(game.distance > trigger.distance){
                trigger.trigger();
                trigger.has_triggered = true;
            }
        }
    }

    // Update loops for objects
    CUSTOMERS.update(delta);
    TRUCK.update(delta);
    ROAD.update(delta, game.distance);

};

// /////////////////////////////////
// // RENDER                      //
// /////////////////////////////////
var render = function (delta, elapsed) {

    ROAD.render(elapsed);

    CUSTOMERS.render_below(TRUCK.getLane(), elapsed);
    TRUCK.render(delta, elapsed);
    CUSTOMERS.render_above(TRUCK.getLane(), elapsed);

    display_scores(elapsed);

    if(game.is_over){
        render_end_cones(elapsed);
    }
};

display_scores = function(elapsed){

	ctx.fillStyle = "rgb(58, 61, 62)";

    // Stats icons 
    let efficiency = Math.round(1000*(score.icecream_served / (score.icecream_served+score.icecream_wasted)))/10;
    if(isNaN(efficiency)){
        efficiency = 100;
    }

    ctx.font = "22px VT323";
	ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.drawImage(ASS_MANAGER.getAsset('ui/stats-cones.png'),960,40);
    ctx.fillText(score.icecream_served, 985, 90); 

    ctx.drawImage(ASS_MANAGER.getAsset('ui/stats-dropped.png'),1025,40);
    ctx.fillText(`${efficiency}%` , 1050, 90); 

    ctx.drawImage(ASS_MANAGER.getAsset('ui/stats-road.png'),1090,40);
    ctx.fillText(`${Math.round(game.distance / game.distance_scale)}m` , 1115, 90); 

    // Lives
    if(game.mode === 0){
        for(let i=0; i<LIVES.length; i++){
            LIVES[i].render(elapsed);
        }
    }
    
    // Main score
    ctx.font = "70px VT323";
    ctx.textAlign = "left";
    var score_disp = `$${score.dollars}`;
    ctx.fillText(score_disp, 25,20);
    

	// FPS
	ctx.font = "8px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
    ctx.fillText(`FPS: ${fps.current}`, 1170, 10); 

    // Timer
    if(game.mode === 1){
        let timer_left = CRAZY_MODE_DURATION-Math.round((performance.now()-game.start_time)/10)/100;
        ctx.fillStyle = "rgb(12, 105, 182)";
        ctx.font = "35px VT323";
        if(timer_left < 5){
            ctx.fillStyle = "rgb(227, 51, 68)";
        }
        if(timer_left < 0){
            timer_left = 0;
        }
        ctx.textAlign = "left";
        var score_disp = `${timer_left.toFixed(2)}s`;
        ctx.fillText(score_disp, 25,90);
    }
   
}

// /////////////////////////////////
// // SCORE & RESPONSE            //
// /////////////////////////////////

var ic_served = function(){
    new Sound(sounds.served).play();
    score.icecream_served++;
    TRUCK.dollar(0);
    score.dollars += 3;
}

var ic_wasted = function(){
    new Sound(sounds.dumped).play();
    score.icecream_wasted++;
    TRUCK.dollar(1);
    score.dollars -= 1;
}

var customer_fed = function(){
    score.orders_served ++;
    new Sound(sounds.hurrah).play();
}

var customer_not_fed = function(){
    score.orders_not_served ++;
    life_lost();
}

var life_lost = function(){

    if(game.mode === 0){
        score.lives--;
        LIVES[score.lives].end();
    
        if(score.lives <= 0){
    
           game_over();
        }
    }
}


// /////////////////////////////////
// // END GAME SCENARIO           //
// /////////////////////////////////

let end_cones = []; // array to store end state cones in

var game_over = function(){
    // End game activity
    game.is_playing = false;

    generate_end_cones(); // Create the array of end cones we will show shortly

    // Slow game to a stop
    game.target_speed = 0;

    // Stop background music, play end music
    bg_music.pause();
    bg_music_end.volume = bg_music_vol*bg_music_endgame_scaler;
    bg_music_end.loop = false;
    bg_music_end.play();

    // Fetch highscores now
    fetch_highscores();

    // Trigger cones to show and highscore table
    setTimeout(function(){
        game.is_over = true;
    },3000);
    setTimeout(function(){
        show_highscore_table();
    },8000);   
}

// Generator for random cone positions
var generate_end_cones = function(){

    // Cone raw size = 321 x 302 -> this is important for the magic numbers used below
    const num_cone_types = 3;
    const row_dims = [
        {
            n: 5,
            y: 150,
            y_var: 50,
            x: -250,
            x_inc: 300,
            x_var: 50,
            sf: 1.8
        },
        {
            n: 5,
            y: 140,
            y_var: 50,
            x: -250,
            x_inc: 250,
            x_var: 50,
            sf: 1.3
        },
        {
            n: 7,
            y: 70,
            y_var: 30,
            x: -250,
            x_inc: 200,
            x_var: 30,
            sf: 1.3
        },
        {
            n: 9,
            y: 0,
            y_var: 30,
            x: -250,
            x_inc: 150,
            x_var: 30,
            sf: 1.1
        },
        {
            n: 9,
            y: -100,
            y_var: 30,
            x: -270,
            x_inc: 150,
            x_var: 30,
            sf: 1.1
        },
        {
            n: 12,
            y: -200,
            y_var: 30,
            x: -250,
            x_inc: 100,
            x_var: 30,
            sf: 1.1
        }
    ];

    // Populate array of cones
    row_dims.forEach(row => {
        for(let i=0; i<row.n; i++){

            const this_y = row.y + rand_int(row.y_var); 
            const this_x = row.x + rand_int(row.x_var); 
            const this_rotation = rand(10)-5;
    
            end_cones.push(new EndCone(end_cone_srcs[rand_int(num_cone_types)],this_x,this_y,row.sf,this_rotation));
    
            row.x += row.x_inc;
        } 
    });

    
    // Create array to shuffle [0,1,2,3,4,5...x]
    const num_cones = end_cones.length;
    let order = Array.from(new Array(num_cones), (x,i) => i);

    // Randomise order
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }

    // Apply ordering
    for(let i=0; i<num_cones; i++){
        end_cones[i].render_order = order[i];
    }
} 

let cones_shown = 0;
let cones_show_interval = 150;
var render_end_cones = function(elapsed){

    if(game.game_over_time == 0){
        game.game_over_time = elapsed;
    }

    const to_show = (elapsed-game.game_over_time)/cones_show_interval;

    if(cones_shown <= end_cones.length){
        if(to_show > cones_shown){
            cones_shown = Math.ceil(to_show);
            new Sound(sounds.dumped).play();
            cones_show_interval -= 1;
            if(cones_show_interval < 100){
                cones_show_interval = 100;
            }
        }
    }
    end_cones.slice().reverse().forEach(c => {
        if(c.render_order <= to_show){
            c.render();
        }
    });
}


// /////////////////////////////////
// // GAME CONTROLS               //
// /////////////////////////////////

var toggle_music = function(){
    if(game.is_muted){
        bg_music.volume = bg_music_vol;
        for (let sound in sounds) {
            sounds[sound].volume = 1;
        }
    }else{
        bg_music.volume = 0;
        for (let sound in sounds) {
            sounds[sound].volume = 0;
        }
    }
    game.is_muted = !game.is_muted;
}

// /////////////////////////////////
// // GAME LOOP                   //
// /////////////////////////////////

var main = function () {
	const now = performance.now();
    const delta = (now - then)/1000; // num ms since last frame was rendered
    const elapsed = now - game.start_time;
    then = now;

    // Call main game loops
	update(delta, elapsed);
	render(delta, elapsed);

    // Measure FPS performance
    update_fps();

	// Request to do this again ASAP
	requestAnimationFrame(main);
};


const update_fps = function(){
    // Measure FPS performance
    var fps_now = performance.now();
    while (fps.times.length > 0 && fps.times[0] <= fps_now - 1000) {
        fps.times.shift();
    }
    fps.times.push(fps_now);
    fps.current = fps.times.length;
}

// /////////////////////////////////
// // START                       //
// ///////////////////////////////// 

var start_game = function () {

    document.getElementById("intro").style.display = "none";
    document.getElementById("keys").style.display = "none";

    bg_music.volume = bg_music_vol;
    bg_music.playbackRate = 1.0;
    bg_music.loop = true;
    bg_music.play();

    then = performance.now();
    game.start_time = then;
    game.is_playing = true;
    main();
}

// Begin asset loading
ASS_MANAGER.downloadAll(assets_complete,assets_loading);


// Helper fns
function rand_int(max){
    return Math.floor(Math.random()*max);
}
function rand(max){
    return Math.random()*max;
}