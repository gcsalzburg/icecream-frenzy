// Convert sprites using
// https://ezgif.com/gif-to-sprite

function Sprite(src,frames,cols,rows,framerate) {
    this.src = src;
    this.frames = frames;
    this.cols = cols;
    this.rows = rows;
    this.w = src.width/cols;
    this.h = src.height/rows;
    
    this.framerate = framerate;
}

Sprite.prototype.draw = function(elapsed_ms,x,y){

    // Calculate the frame of the animation
    var curr_frame = Math.floor((elapsed_ms/this.framerate)%this.frames);

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