
class EndCone{
    constructor(src, x, y, scale,rotation){

        this._src = src
        
        this._dims = {
            raw_w: 321,
            raw_h: 302,

            scale: scale,
            x: x,
            y: y,
            rotation: (rotation*Math.PI / 180),

            new_w: 321*scale,
            new_h: 302*scale
        };

        this.render_order = 0;

    }

    render(){

        ctx.save();
        ctx.translate(this._dims.x + (this._dims.new_w/2), this._dims.y + (this._dims.new_h/2));
        ctx.rotate(this._dims.rotation);
        ctx.drawImage(
            this._src,
            0,0,this._dims.raw_w,this._dims.raw_h,
            -(this._dims.new_w/2),-(this._dims.new_h/2),this._dims.new_w,this._dims.new_h);
        ctx.restore();
    
    }
}