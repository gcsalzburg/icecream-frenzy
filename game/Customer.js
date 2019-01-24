// /////////////////////////////////
// // CUSTOMER                    //
// // Each vehicle that arrives   //
// /////////////////////////////////

class Customer{

    constructor(src_ani,lane,speed){
        
        this._src_ani = src_ani;
        this._lane = lane;
        this._speed = speed;
    
        this._pos = game.w;
    
        this._is_ordering   = false;
        this._is_fed        = false;
        this._is_finished   = false; 

        this._dims = {
            lanes: [180,278,379,464],
            ordering_pos: 1000,
            serving_pos: {
                start: 114,
                end: -121
            }
        }  
        this._b_dims = {
            segs: [18,26,17],
            size: {
                w: 61,
                h: 56
            },
            offset: {
                x: 25,
                y: -20
            },
            mid_width: 7,      // starting width of the centre of bubble
            mid_width_inc: 18, // each ice cream adds 18px to the width
            ice_offset: {      // from bubble
                x: 14,
                y: 6
            }

        }

        // Create the order for this customer
        this.orders = [];
        this.create_order();
    }

    // Getters
    isFinished(){
        return this._is_finished;
    }
    isFed(){
        return this.is_fed;
    }
    isServing(){
        return ((this._pos > this._dims.serving_pos.end) && (this._pos < this._dims.serving_pos.start));
    }
    getLane(){
        return this._lane;
    }
    getPos(){
        return this._pos;
    }
    
    render(elapsed){
    
        this._src_ani.draw(elapsed,this._pos,this._dims.lanes[this._lane]);
    
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

        // Draw three parts of the bubble
        var width_so_far = 0;
        for(var i=0; i<3; i++){
            ctx.drawImage(
                src,
                starts[i],                                    0,                                                  this._b_dims.segs[i], this._b_dims.size.h, // Source
                this._pos+this._b_dims.offset.x+width_so_far, this._dims.lanes[this._lane]+this._b_dims.offset.y, widths[i],            this._b_dims.size.h  // Destination
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
                    this._pos + this._b_dims.offset.x + this._b_dims.ice_offset.x + offset,
                    this._dims.lanes[this._lane] + this._b_dims.offset.y + this._b_dims.ice_offset.y
                );
                offset += this._b_dims.mid_width_inc;
            }
        }
    }
    
    update(modifier){
        this._pos -= this._speed*modifier;
    
        if(this._pos <= -this._src_ani.w){
            this._is_finished = true;
        }
    
        if( (this._pos <= this._dims.ordering_pos) && (!this._is_ordering)){
            this._is_ordering = true;
            new Sound(sounds.new_order).play();
            score.orders_placed ++;
        }
    }
    
    create_order(){
        var num_orders = rand_int(2)+1; // between 1 and 3 orders per car
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