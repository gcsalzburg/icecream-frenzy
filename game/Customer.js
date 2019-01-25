// /////////////////////////////////
// // CUSTOMER                    //
// // Each vehicle that arrives   //
// /////////////////////////////////

class Customer{

    constructor(src_ani,lane,speed,dims){

        this._src_ani = src_ani;
        this._lane = lane;
        this._speed = speed;
        this._dims = dims;

        this.serving_pos = {
            start:  114,
            end:    -this._src_ani.width()+40
        };
    
        this._pos = game.w;
    
        this._is_ordering   = false;
        this._is_fed        = false;
        this._is_finished   = false; 

        this._b_dims = {
            segs: [18,26,17],
            size: {
                w: 61,
                h: 56
            },
            offset: this._dims.bubble_offset,
            mid_width: 7,      // starting width of the centre of bubble
            mid_width_inc: 18, // each ice cream adds 18px to the width
            ice_offset: {      // from bubble
                x: 14,
                y: 6
            },
            b_min_x: 10,
            b_buffer_right: 30,
            scroll_bubble: this._dims.scroll_bubble
        }

        // Create the order for this customer
        this.orders = [];
        this.create_order( rand_int(this._dims.cones[1]-this._dims.cones[0]) + this._dims.cones[0]);
    }

    // Getters
    isFinished(){
        return this._is_finished;
    }
    isFed(){
        return this.is_fed;
    }
    isServing(){
        return ((this._pos > this.serving_pos.end) && (this._pos < this.serving_pos.start));
    }
    getLane(){
        return this._lane;
    }
    getPos(){
        return this._pos;
    }
    
    render(elapsed){
    
        this._src_ani.draw(elapsed,this._pos,this._dims.lane);
    
        if(this._is_ordering & !this._is_fed){
            this.render_order();
        }
    }

    render_order(){

        var orders = 0;
        for(var i=0; i<this.orders.length; i++){
            if(!this.orders[i].is_served){
                orders++;
            }
        }

        // Bubble section widths and start co-ordinates
        var widths = [
            this._b_dims.segs[0],
            this._b_dims.mid_width + ((orders-1)*this._b_dims.mid_width_inc),
            this._b_dims.segs[2]
        ];
        var starts = [
            0,
            this._b_dims.segs[0],
            this._b_dims.segs[0]+this._b_dims.segs[1]
        ];
        var src = (this.isServing() ? CUSTOMERS.src_bubbles[1] : CUSTOMERS.src_bubbles[0]);

        // See if we should adjust bubble to stay in view
        let b_start = this._pos+this._b_dims.offset.x;
        if(this._dims.scroll_bubble){
            if(b_start < this._b_dims.b_min_x){
                b_start = this._b_dims.b_min_x;
            }
    
            let b_width = widths[0]+widths[1]+widths[2]+this._b_dims.b_buffer_right;
            if(b_start+b_width > this._pos+this._src_ani.width()){
                b_start = this._pos+this._src_ani.width()-b_width;
            }
        }

        // Draw three parts of the bubble
        var width_so_far = 0;
        for(var i=0; i<3; i++){
            ctx.drawImage(
                src,
                starts[i],                                    0,                                                  this._b_dims.segs[i], this._b_dims.size.h, // Source
                b_start+width_so_far, this._dims.lane+this._b_dims.offset.y, widths[i],            this._b_dims.size.h  // Destination
            );  
            width_so_far += widths[i];  
        }
        // Draw cones
        var offset = 0;
        for(var i=0; i<this.orders.length; i++){
            var o = this.orders[i];
            if(!o.is_served){
                ctx.drawImage(
                    CUSTOMERS.src_cones[o.type],
                    b_start + this._b_dims.ice_offset.x + offset,
                    this._dims.lane + this._b_dims.offset.y + this._b_dims.ice_offset.y
                );
                offset += this._b_dims.mid_width_inc;
            }
        }
    }
    
    update(modifier){

        // Fetch game speed and adjust based upon this
        this._pos += (this._speed-game.speed)*modifier;
    
        if(this._pos <= -this._src_ani.w){
            this._is_finished = true;
        }
    
        if( (this._pos <= this._dims.ordering_pos) && (!this._is_ordering)){
            this._is_ordering = true;
            new Sound(sounds.new_order).play();
            score.orders_placed ++;
        }
    }
    
    create_order(num_orders){
        for(var i=0; i<num_orders; i++){
            this.orders.push(new Order());
        }
    }
    
    check_order(){
        if(!this._is_fed){
            var is_fed = true;
            for(var i=0; i<this.orders.length; i++){
                is_fed &= this.orders[i].is_served;
            }
            this._is_fed = is_fed;
            if(this._is_fed){
                score.orders_served ++;
                new Sound(sounds.hurrah).play();
            }
        }
    }

}