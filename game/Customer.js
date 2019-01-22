

class Customer{

    constructor(src_ani){
        this._lane = Math.floor((Math.random()*NUM_LANES));
        this._src_ani = src_ani;
    
        this._pos = game.w;
        this._speed = 100 + (Math.random()*10)+(this._lane*70);
    
        this._is_ordering   = false;
        this._is_fed        = false;
        this._is_finished   = false; 

        this._dims = {
            lanes: [180,278,379,464],
            bubble_segments: [18,26,17]
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
    getLane(){
        return this._lane;
    }
    getPos(){
        return this._pos;
    }
    
    render(elapsed){
    
        this._src_ani.draw(elapsed,this._pos,this._dims.lanes[this._lane]);
    
        if(this._is_ordering & !this._is_fed){
            ctx.drawImage(CUSTOMERS.src_speech_bubble,this._pos+25,this._dims.lanes[this._lane]-20);
            for(var i=0; i<this.orders.length; i++){
                var o = this.orders[i];
                if(!o.is_served){
                    ctx.drawImage(CUSTOMERS.src_cones[o.type],this._pos+33+(i*15),this._dims.lanes[this._lane]-15);
                }
            }
        }
    }
    
    update(modifier){
        this._pos -= this._speed*modifier;
    
        if(this._pos <= -this._src_ani.w){
            this._is_finished = true;
        }
    
        if( (this._pos <= game.w-this._src_ani.w) && (!this._is_ordering)){
            this._is_ordering = true;
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
            }
        }
    }

}