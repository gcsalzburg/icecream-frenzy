
function Customers(){
    this.src_car = null;

    this.num_customers = 0;
    this.customers = [];

    this.is_open_for_customers = false;
    this.last_customer_add = 0;
    this.customer_interval = 1000;
    this.customer_variance = 200;
}

Customers.prototype.check_for_customers = function(){
    if(this.is_open_for_customers){
        if(Date.now() > (this.last_customer_add + this.customer_interval)){
            this.add();
        }
    }
}

Customers.prototype.add = function(){
    this.customers.push(new Customer(this.src_car));
    this.num_customers++;

    this.last_customer_add = Date.now();
}

Customers.prototype.update = function(modifier){
    this.check_for_customers();
    this.update_customers(modifier);
}

Customers.prototype.update_customers = function(modifier){
    for (var i = 0; i < this.num_customers; i++) {
        this.customers[i].update(modifier);
    }
}

//
// These two functions only render certain lanes, to preserve the draw order and keep the truck between the correct vehicles
// Loop through lanes one by one and draw vehicles in each lane in turn
//
Customers.prototype.render_below = function(lane){
    // Inclusive of lane number
    for(var l = 0; l < lane+1; l++){
        for (var i = 0; i < this.num_customers; i++) {
            if(this.customers[i].lane == l){
                this.customers[i].render();
            }
        }
    }
}
Customers.prototype.render_above = function(lane){
    // Exclusive of lane number
    for(var l = lane+1; l < NUM_LANES; l++){
        for (var i = 0; i < this.num_customers; i++) {
            if(this.customers[i].lane == l){
                this.customers[i].render();
            }
        }
    }
}
Customers.prototype.render_all = function(){
    for (var i = 0; i < this.num_customers; i++) {
        this.customers[i].render();
    }
}

