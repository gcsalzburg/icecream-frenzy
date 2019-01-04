// CORE VARS
var game = {
    w: 812,
    h: 375
}

var NUM_LANES = 3;
var LANES_Y = [2,96,191];
var TRUCK_LANES_Y = [65,171];

var truck = {
    src: null,
    left: 20,
    lane: 0,
    render: function(){
        ctx.drawImage(this.src,this.left,TRUCK_LANES_Y[this.lane]);
    },
    lane_change: function(dir){
        this.lane = this.lane+dir;
        if(this.lane<0){
            this.lane = 0;
        }else if(this.lane>=TRUCK_LANES_Y.length){
            this.lane = TRUCK_LANES_Y.length-1;
        }

    }
}

var road = {
    src: null,

    is_starting_up: true,  // Are we doing the initial acceleration or not

    speed: 0,           // current speed in pixels per second
    accel: 100,         // pixels per second^2
    target_speed: 300,  // desired road speed

    pos: 0,
    render: function(){
        // Draw road, and one road behind
        // TODO: Programmatically generate this terrain
        ctx.drawImage(this.src,this.pos,0);
        ctx.drawImage(this.src,this.pos+this.src.width,0);
    },
    update: function(modifier){

        // Accelerate to desired speed (if necessary)
        if(this.target_speed > this.speed){
            this.speed += this.accel*modifier;
        }
        if(this.speed > this.target_speed){
            this.speed = this.target_speed;
            if(this.is_starting_up){
                // Finished starting up, so trigger something!
                Customers.add();
                this.is_starting_up = false;
            }
        }

        // Advance position of road
        this.pos -= this.speed*modifier;
        if(this.pos < -this.src.width){
            this.pos = this.pos + this.src.width;
        }
    }
}

// Create customers array
var Customers = new Customers();

// Queue image assets
var ASS_MANAGER = new AssetManager();
ASS_MANAGER.setDefaultPath("assets/");
ASS_MANAGER.queueDownloads(
    'bg.png',
    'truck.png',
    'car.png',
    'cone-strawberry.png',
    'cone-vanilla.png'
)

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = game.w;
canvas.height = game.h;
document.body.appendChild(canvas);

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;

// Handle keyboard controls
var keysDown = {};
var keysUp = {};

// for fps measurement
var times = [];
var fps;

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
    keysUp[e.keyCode] = true;
}, false);

// Reset the game when the player catches a monster
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

var add_customer = function(){
    customers.push(new Customer());
}


// Update game objects
var update = function (modifier) {

    if(38 in keysDown){         // UP
        delete keysDown[38];
        truck.lane_change(-1);
    }else if(40 in keysDown){   // DOWN
        delete keysDown[40];
        truck.lane_change(1);
    }

    for (var i = 0; i < customers.length; i++) {
        customers[i].update(modifier);
    }

    road.update(modifier);

	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		reset();
	}
};

// Draw everything
var render = function () {
    ctx.drawImage(ASS_MANAGER.getAsset('cone-strawberry.png'), hero.x, hero.y);
    ctx.drawImage(ASS_MANAGER.getAsset('cone-vanilla.png'), monster.x, monster.y);

    road.render();
    truck.render();
    
    for (var i = 0; i < customers.length; i++) {
        customers[i].render();
    }
    
	// FPS
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "8px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "bottom";
    ctx.fillText("FPS: " + fps, 802, 365);    
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

    then = now;
    
    // Measure FPS performance
    var now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;

	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var then;

// Let's play this game!
// Load in assets
ASS_MANAGER.downloadAll(function() {

    road.src = ASS_MANAGER.getAsset('bg.png');
    truck.src = ASS_MANAGER.getAsset('truck.png');
    for (var i = 0; i < customers.length; i++) {
        customers[i].src = ASS_MANAGER.getAsset('car.png');
    }

    then = Date.now();
    reset();
    main();
});