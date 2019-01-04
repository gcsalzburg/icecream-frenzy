
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