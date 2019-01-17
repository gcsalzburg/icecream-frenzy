
var TRUCK_DIMS = {
    left: 2,
    source_w: 640,
    source_h: 300,
    target_w: 160,
    target_h: 75,
    lanes: [250,350,450]
}

function Truck(){
    this.src = null;
    this.lane = 0;

    this.elapsed_ms = 0;
    
}

Truck.prototype.render = function(modifier){
    
    // Calculate the frame of the animation
    this.elapsed_ms += (1000*modifier);
    var curr_frame = Math.floor((this.elapsed_ms/30)%18);

    var x_c = Math.floor(curr_frame%6);
    var y_c = Math.floor((curr_frame/3)%3);

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(
        this.src,
        TRUCK_DIMS.source_w*x_c,
        TRUCK_DIMS.source_h*y_c,
        TRUCK_DIMS.source_w,
        TRUCK_DIMS.source_h,
        TRUCK_DIMS.left,
        TRUCK_DIMS.lanes[this.lane],
        TRUCK_DIMS.target_w,
        TRUCK_DIMS.target_h
    );
}

Truck.prototype.change_lane = function(dir){
    this.lane = this.lane+dir;
    if(this.lane<0){
        this.lane = 0;
    }else if(this.lane>=TRUCK_LANES){
        this.lane = TRUCK_LANES-1;
    }
}