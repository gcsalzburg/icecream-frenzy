

class Satisfaction{
    constructor(){
        this._bar_src = null;
        this._bar_bg_src = null;
        this._happy_src = null;
        this._sad_src = null;

        this._max_satisfaction = SATISFACTION_MAX;
        this._satisfaction = SATISFACTION_MAX;

        this._dims = {
            bar_x: 50,
            bar_y: 90,
            bar_s_w: 1000,  // Source size
            bar_s_h: 30,
            bar_d_w: 150,     // Destination size
            bar_d_h: 20,

            face_w: 20,
            face_sad_x: 20,
            face_happy_x: 210

        }
    }

    set_satisfaction(level){
        this._satisfaction = level;
    }
    
    init(srcs){
        this._bar_src = srcs[0];
        this._bar_bg_src = srcs[1];
        this._happy_src = srcs[2];
        this._sad_src = srcs[3];
    }

    render(){

        // Draw faces
        ctx.drawImage(this._sad_src,    this._dims.face_sad_x, this._dims.bar_y, this._dims.face_w, this._dims.face_w); 
        ctx.drawImage(this._happy_src,  this._dims.face_happy_x, this._dims.bar_y, this._dims.face_w, this._dims.face_w); 
        
        // Draw bg
        ctx.drawImage(this._bar_bg_src, this._dims.bar_x, this._dims.bar_y, this._dims.bar_d_w, this._dims.bar_d_h); 
        
        // Draw bar
        const percent = this._satisfaction/this._max_satisfaction;
        const bar_s_width = percent*this._dims.bar_s_w;
        const bar_d_width = percent*this._dims.bar_d_w;
        ctx.drawImage(
            this._bar_src,
            0,                  0,                  bar_s_width, this._dims.bar_s_h,
            this._dims.bar_x,   this._dims.bar_y,   bar_d_width, this._dims.bar_d_h
        );  
    }
}