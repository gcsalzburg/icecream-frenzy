
class EndCone{
    constructor(src, x, y, scale){

        this._src = src
        
        this._dims = {
            raw_w: 321,
            raw_h: 302,

            scale: scale,
            x: x,
            y: y,

            new_w: 321*scale,
            new_h: 302*scale
        };

    }

    render(){

        ctx.drawImage(
            this._src,
            0,0,this._dims.raw_w,this._dims.raw_h,
            this._dims.x,this._dims.y,this._dims.new_w,this._dims.new_h);
    }
}