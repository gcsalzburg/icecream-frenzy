
class Customers{
    constructor(){
        this.src_car = null;
    
        this.src_bubbles = [];
        this.src_cones = [];
    
        this.num_customers = 0;
        this.customers = [];
    
        this.is_open_for_customers = false;
        this.last_customer_add = 0;
        this.customer_interval = 3000;
        this.customer_variance = 200;
    }

    init(src_2pl, src_bubble, src_bubble_order){
        this.src_car = src_2pl;
        this.src_bubbles = [
            src_bubble,
            src_bubble_order
        ]
    }
    
    check_for_customers(){
        if(this.is_open_for_customers){
            if(performance.now() > (this.last_customer_add + this.customer_interval)){
                this.add();
            }
        }
    }
    
    add(){
        this.customers.push(new Customer(new Sprite(this.src_car,60,5,12,30)));
        this.num_customers++;
    
        this.last_customer_add = performance.now();
    }
    
    update(modifier){
        this.check_for_customers();
        this.update_customers(modifier);
    }
    
    update_customers(modifier){
        for (var i = 0; i < this.num_customers; i++) {
            var c = this.customers[i];
            c.update(modifier);
    
            // Remove customers we have finished with
            if(c.isFinished()){
                this.customers.splice(i,1);
                this.num_customers = this.customers.length;
            }
        }
    }
    
    serve(truck_lane,type){
    
        // Find someone to serve
        for (var i = 0; i < this.num_customers; i++) {
            var c = this.customers[i];
    
            if( (c.getLane() === truck_lane) || (c.getLane() === truck_lane+1) ){
                if(c.isServing() && !c.isFed()){
                    for(var j=0; j < c.orders.length; j++){
                        if( (c.orders[j].type === type) && (!c.orders[j].is_served)){
                            c.orders[j].is_served = true;
                            c.check_order();
                            return 1; // we only serve one order per button press!
                        }
                    }
                }
            }
        }
    
        // Otherwise dump an ice cream
        TRUCK.dump(type);
        return 0;
    }
    
    
    //
    // These two functions only render certain lanes, to preserve the draw order and keep the truck between the correct vehicles
    //

    _render_between(from,to,elapsed){
        // Inclusive of lane number
        for(var l = from; l < to; l++){
            for (var i = 0; i < this.num_customers; i++) {
                if(this.customers[i].getLane() == l){
                    this.customers[i].render(elapsed);
                }
            }
        }

    }

    render_below(lane, elapsed){
        // Inclusive of lane number
        this._render_between(0,lane+1,elapsed);
    }
    render_above(lane, elapsed){
        // Exclusive of lane number
        this._render_between(lane+1,NUM_LANES,elapsed);
    }
    render_all(){
        // All lanes
        this._render_between(0,NUM_LANES,elapsed);
    }    

}