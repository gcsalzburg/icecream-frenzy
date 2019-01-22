// /////////////////////////////////
// // TRUCK                       //
// // The ice cream truck itself  //
// /////////////////////////////////

class Truck{
    constructor(){

        this._lane = 0;
        this._truck_ani = null;
        this._drop_anis = [];
        this._dollar_anis = [];
        
        this._dims = {
            left: -39,
            lanes: [207,307,407]
        }

        this._dumps = [];
        this._dollars = [];
    }

    // Getters / setters
    getLane(){
        return this._lane;
    }

    init(src_1, src_2, src_3, src_4, src_5, src_6){
        this._truck_ani = new Sprite(src_1,59,10,6,18);
        this._drop_anis = [
            src_2,
            src_3,
            src_4
        ];
        this._dollar_anis = [
            src_5,
            src_6
        ];
    }

    update(modifier){
        // Remove old dumps
        for(var i=0; i<this._dumps.length;i++){
            if(this._dumps[i].isGone()){
                this._dumps.splice(i,1);
            }
        }

        // Remove old dollars
        for(var i=0; i<this._dollars.length;i++){
            if(this._dollars[i].isFinished()){
                this._dollars.splice(i,1);
            }
        }
        
    }

    // Display truck sprite animation frame
    render(modifier, elapsed){
        this._truck_ani.draw(elapsed,this._dims.left,this._dims.lanes[this._lane]);

        // Render dumped ice creams
        for(var i=0; i<this._dumps.length;i++){
            this._dumps[i].render(modifier, elapsed);
        }
        // Render dollars
        for(var i=0; i<this._dollars.length;i++){
            this._dollars[i].render(modifier, elapsed);
        }
    }

    change_lane(dir){
        this._lane = this._lane+dir;
        if(this._lane<0){
            this._lane = 0;
        }else if(this._lane>=TRUCK_LANES){
            this._lane = TRUCK_LANES-1;
        }

    }

    // Dispense an ice cream to the floor!
    dump(type){
        this._dumps.push(new Dump(this._drop_anis[type],this._dims.lanes[this._lane]));
    }

    // Add dollar
    dollar(type){
        this._dollars.push(new Dollar(this._dollar_anis[type],this._dims.lanes[this._lane]));
    }

}

// //////////////////////////////////////////
// // DUMPS                                //
// // Wasted ice cream dropped onto floor  //
// //////////////////////////////////////////

class Dump{
    constructor(src,y){

        this._dims = {
            x: 60,
            y: y + 22,
            framerate:  6,
            duration:   6*9 // frames * framerate
        }
        this._ani = new Sprite(src,9,9,1,this._dims.framerate, false);

        this._is_landed = false;
    }

    // getters
    isLanded(){
        return this._is_landed;
    }
    isGone(){
        return (this._dims.x < -100); // must be off the screen by now, lol. 
    }

    render(modifier, elapsed){

        if(this._ani.draw(elapsed,this._dims.x,this._dims.y) >= 5){
            this._is_landed = true;
        }

        if(this._is_landed){
            // Animate off the screen
            this._dims.x -= game.speed*modifier;
        }
    }
}

// //////////////////////////////////////////
// // MONEY                                //
// // $$$ floating in the sky              //
// //////////////////////////////////////////

class Dollar{
    constructor(src,y){

        this._dims = {
            x: 100 + rand_int(20),
            y: y + -20 + rand_int(20)
        }
        this._ani = new Sprite(src,14,14,1,3, false);
        this._is_finished = false;
    }

    // getters
    isFinished(){
        return this._is_finished;
    }

    render(modifier, elapsed){
        if(this._ani.draw(elapsed,this._dims.x,this._dims.y) >= 14){
            this._is_finished = true;
        }
    }
}