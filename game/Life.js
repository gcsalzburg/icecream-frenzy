// /////////////////////////////////
// // LIVES                       //
// // One life                    //
// /////////////////////////////////

class Life{
    constructor(){
        this._life_ani = null;
        this._is_alive = false;


        this._dims = {
            x: 50,
            y: 90
        }
    }

    init(src){
        this._life_ani = new Sprite(src,5,5,1,25,false,false);
    }

    render(elapsed){
        this._life_ani.draw(elapsed,this._dims.x,this._dims.y);
    }

    end(){
        this._life_ani.start();
    }
}