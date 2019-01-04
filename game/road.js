
var road = {
    src: null,

    is_starting_up: true,  // Are we doing the initial acceleration or not

    speed: 200,           // current speed in pixels per second -> TODO: set to 0 for production
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
                CUSTOMERS.add();
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