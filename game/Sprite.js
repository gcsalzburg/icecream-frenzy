// Convert sprites using
// https://ezgif.com/gif-to-sprite


class Sprite {
    constructor(src, frames, cols, rows, framerate, loop = true) {
        this.src    = src;
        this.frames = frames;
        this.cols   = cols;
        this.rows   = rows;
        this.w      = src.width/cols;
        this.h      = src.height/rows;  

        this.framerate = framerate;
        
        
        this.loop = loop; // boolean
    }

    draw(elapsed_ms,x,y) {

        // First time called, we start the animation
        if(!this._start_ms){
            this._start_ms = elapsed_ms;
        }

        // Calculate the frame of the animation
        if(this.loop){
            var curr_frame = Math.floor(((elapsed_ms-this._start_ms)/this.framerate)%this.frames);
        }else{
            var curr_frame = Math.floor(((elapsed_ms-this._start_ms)/this.framerate)/this.frames);
            if(curr_frame >= this.frames){
                curr_frame = this.frames-1;
            }
        }

        // Get co-ordinates for this sprite frame
        var x_c = Math.floor(curr_frame%this.cols)*this.w;
        var y_c = Math.floor(curr_frame/this.cols)*this.h;

        // Draw to canvas
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        ctx.drawImage(
            this.src,
            x_c,    y_c,    this.w,     this.h, // Source inside sprite
            x,      y,      this.w,     this.h  // Destination inside canvas
        );    
    }
}