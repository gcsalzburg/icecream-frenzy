

function Truck(){
    this.src = null;
    this.left = 700;
    this.lane = 0;
}

Truck.prototype.render = function(){
    ctx.drawImage(this.src,this.left,TRUCK_LANES_Y[this.lane]);
}

Truck.prototype.change_lane = function(dir){
    this.lane = this.lane+dir;
    if(this.lane<0){
        this.lane = 0;
    }else if(this.lane>=TRUCK_LANES_Y.length){
        this.lane = TRUCK_LANES_Y.length-1;
    }
}