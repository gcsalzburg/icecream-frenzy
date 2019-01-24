
class Customers{
    constructor(){    
        this.src_bubbles = [];
        this.src_cones = [];
    
        this.num_customers = 0;
        this.customers = [];
    
        this.is_open_for_customers = false;
        this.last_customer_add = 0;
        this.customer_interval = 3000;
        this.customer_variance = 200;

        // Weighting should be a distribution such as:
        // 0.3 ... 0.6 ... 0.7 ... 1
        // Last one should always be 1
        this.customer_data = [
            {
                type: "bike",
                src: null,
                sprite_data: [0,0,0,0],
                cones: [1,1],
                enabled: false,
                weighting: 0         
            },
            {
                type: "small_car",
                src: null,
                sprite_data: [60,5,12,30],
                cones: [1,3],
                enabled: true,
                weighting: 1   
            },
             {
                type: "mid_car",
                src: null,
                sprite_data: [0,0,0,0],
                cones: [3,4],
                enabled: false,
                weighting: 1                   
            },
            {
                type: "large_car",
                src: null,
                sprite_data: [0,0,0,0],
                cones: [5,6],
                enabled: false,
                weighting: 1                   
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
        ]
    }

    init(src_bubble, src_bubble_order){
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
        const weight = Math.random();
        for(let i=0; i<this.customer_data.length; i++){
            const c = this.customer_data[i];
            if(c.enabled && (c.weighting >= weight)){
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

                this.customers.push( new Customer(sprite,lane,speed) );
                this.last_customer_add = performance.now(); 
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