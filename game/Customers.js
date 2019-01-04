
function Customers(){
    this.src_car = null;

    this.num_customers = 0;
    this.customers = [];
}

Customers.prototype.add = function(){
    this.customers.push(new Customer(this.src_car));
    this.num_customers++;
}

Customers.prototype.update_all = function(modifier){
    for (var i = 0; i < this.num_customers; i++) {
        this.customers[i].update(modifier);
    }
}

Customers.prototype.render_all = function(){
    for (var i = 0; i < this.num_customers; i++) {
        this.customers[i].render();
    }
}

