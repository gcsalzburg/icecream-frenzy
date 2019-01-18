// /////////////////////////////////
// // TRUCK                       //
// // The ice cream truck itself  //
// /////////////////////////////////

class Truck{
    constructor(){

        this._lane = 0;
        this._truck_ani = null;
        
        this._dims = {
            left: -39,
            lanes: [207,307,407]
        }
    }

    // Getters / setters
    getLane(){
        return this._lane;
    }

    init(src){
        this._truck_ani = new Sprite(src,59,10,6,18);
    }

    render(modifier, elapsed){
        // Display truck sprite animation frame
        this._truck_ani.draw(elapsed,this._dims.left,this._dims.lanes[this._lane]);
    }

    change_lane(dir){
        this._lane = this._lane+dir;
        if(this._lane<0){
            this._lane = 0;
        }else if(this._lane>=TRUCK_LANES){
            this._lane = TRUCK_LANES-1;
        }

    }

}