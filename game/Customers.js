
class Customers{
    constructor(){    
        this.src_bubbles = [];
        this.src_cones = [];
    
        this.num_customers = 0;
        this.customers = [];
    
        this.is_open_for_customers = false;
        this.last_customer_add = -10000; // Silly high so the first customer triggers correctly
        this.customer_interval = 3000;
        this.customer_variance = 200;

        this.lanes = [180,278,379,464];

        this.weightings = []; //Populated by another function 

        this.number_flavours = 1;
        
        this.customer_data = [
            {
                type: "bike",
                src: null,
                sprite_data: [37,5,8,30],
                cones: [1,1],
                enabled: true,
                weighting: 1, // Figure
                order_pos: 1000,
                scroll_bubble: false,
                bubble_offset: {
                    x: 0,
                    y: -20
                }      
            },
            {
                type: "small_car",
                src: null,
                sprite_data: [57,5,12,30],
                cones: [1,3],
                enabled: true,
                weighting: 1,
                order_pos: 1000,
                scroll_bubble: true,
                bubble_offset: {
                    x: 25,
                    y: -20
                }       
            },
             {
                type: "mid_car",
                src: null,
                sprite_data: [57,5,12,30],
                cones: [3,4],
                enabled: true,
                weighting: 0,
                order_pos: 1000,
                scroll_bubble: true,
                bubble_offset: {
                    x: 25,
                    y: -20
                }                       
            },
            {
                type: "large_car",
                src: null,
                sprite_data: [57,5,12,30],
                cones: [5,6],
                enabled: true,
                weighting: 0,
                order_pos: 1000,
                scroll_bubble: true,
                bubble_offset: {
                    x: 25,
                    y: -20
                }                       
            }
        ];
        this.lane_data = [
            {
                lane: 0,
                y: 180,
                speed: 500,         // Absolute speed. Initial speed of the game is 600
                speed_variance: 10

            },
            {
                lane: 1,
                y: 278,
                speed: 430,
                speed_variance: 10

            },
            {
                lane: 2,
                y: 379,
                speed: 360,
                speed_variance: 10

            },
            {
                lane: 3,
                y: 464,
                speed: 290,
                speed_variance: 10

            }
        ];
        
        this._calculate_weightings();
    }

    init(src_bubble, src_bubble_order){
        this.src_bubbles = [
            src_bubble,
            src_bubble_order
        ];
    }

    set_weighting(vehicle,weighting){
        this.customer_data[vehicle].weighting = weighting;
        this._calculate_weightings();

    }
    
    check_for_customers(){
        if(this.is_open_for_customers && !game.is_over){
            if(game.distance > (this.last_customer_add + this.customer_interval)){
                this.add();
            }
        }
    }
    
    add(){
        const weight = Math.random();
        for(let i=0; i<this.customer_data.length; i++){
            const c = this.customer_data[i];
            if(c.enabled && (this.weightings[i] >= weight)){
                // Prepare new customer data
                const sprite = new Sprite(
                    c.src,
                    c.sprite_data[0],
                    c.sprite_data[1],
                    c.sprite_data[2],
                    c.sprite_data[3]
                );
                const lane = rand_int(NUM_LANES);
                const speed = this.lane_data[lane].speed + rand_int(this.lane_data[lane].speed_variance);
                const dims = {
                    lane:           this.lanes[lane],
                    ordering_pos:   c.order_pos,
                    cones:          c.cones,
                    bubble_offset:  c.bubble_offset,
                    scroll_bubble:  c.scroll_bubble
                }

                this.customers.push( new Customer(sprite,lane,speed,dims) );
                this.last_customer_add = game.distance; 
                this.num_customers++;
                break;
            }
        }   
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
            if(c.isFinished() && !game.is_over){
                if(!c.isFed()){
                    // Didn't feed them all!
                    customer_not_fed();
                }
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

    _calculate_weightings(){
        let sum = 0;

        this.weightings = [];

        for(let i=0; i<this.customer_data.length; i++){
            if(this.customer_data[i].enabled){
                sum += this.customer_data[i].weighting;
            }
        }

        let so_far = 0;
        for(let i=0; i<this.customer_data.length; i++){
            if(this.customer_data[i].enabled){
                const _w = this.customer_data[i].weighting;
                this.weightings.push((_w+so_far)/sum);
                so_far += _w;
            }
        }
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