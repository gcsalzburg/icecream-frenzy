// /////////////////////////////////
// // LIVES                       //
// // One life                    //
// /////////////////////////////////

class Life{
    constructor(x){
        this._life_ani = null;
        this._is_alive = false;


        this._dims = {
            _x: x,
            _y: 80
        }
    }

    init(src){
        this._life_ani = new Sprite(src,5,5,1,25,false,false);
    }

    render(elapsed){
        this._life_ani.draw(elapsed,this._dims._x,this._dims._y);
    }

    end(){
        this._life_ani.start();
    }
}