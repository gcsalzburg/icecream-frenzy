
function Road(){
    this.src = null;
    this.cacti = [];
    this.cracks = [];

    this.is_starting_up = true; // Are we doing the initial acceleration or not

    this.speed = 200;           // current speed in pixels per second -> TODO: set to 0 for production
    this.accel = 200;           // pixels per second^2
    this.target_speed = 600;    // desired road speed

    this.pos = 0;

    this.cacti_freq = 8;
    this.crack_freq = 6;

    function Decor(){
        this.src = null;
        this.pos = 0;
        this.y = 0;
    }

    Decor.prototype.render = function(){
        ctx.drawImage(this.src,this.pos,this.y);
    }
 //   Decor.prototype.update = function()
}

Road.prototype.render = function(){
    // Draw road, and one road behind
    // TODO: Programmatically generate this terrain
    ctx.drawImage(this.src,this.pos,0);
    ctx.drawImage(this.src,this.pos+this.src.width,0);
}

Road.prototype.update = function(modifier, distance){
    // Advance position of road
    this.pos = -distance%this.src.width;
}