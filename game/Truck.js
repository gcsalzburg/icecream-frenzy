
var TRUCK_DIMS = {
    left: -39,
    lanes: [207,307,407]
}

function Truck(){
    this.lane = 0;
    this.truck_ani = null;
}

Truck.prototype.init = function(src){
    truck_ani = new Sprite(src,59,10,6,18);
}

Truck.prototype.render = function(modifier, elapsed){
    // Display truck sprite animation frame
    truck_ani.draw(elapsed,TRUCK_DIMS.left,TRUCK_DIMS.lanes[this.lane]);
}

Truck.prototype.change_lane = function(dir){
    this.lane = this.lane+dir;
    if(this.lane<0){
        this.lane = 0;
    }else if(this.lane>=TRUCK_LANES){
        this.lane = TRUCK_LANES-1;
    }
}