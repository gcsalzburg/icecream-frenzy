

var CUSTOMER_DIMS = {
    lanes: [2,96,191]
}

function Customer(src_img){
    this.lane = Math.floor((Math.random()*NUM_LANES));
    this.src = src_img;

    this.pos = game.w;
    this.speed = 100 + (Math.random()*10)+(this.lane*70);

    this.is_ordering = false;
    this.is_fed = false;

    this.is_finished = false; 

    this.orders = [];
    this.create_order();
}

function Order(){
    this.type = Math.floor((Math.random()*3)); // three types of ice cream
    this.is_served = false;
}

Customer.prototype.render = function(){
    ctx.drawImage(this.src,this.pos,CUSTOMER_DIMS.lanes[this.lane]);

    if(this.is_ordering & !this.is_fed){
        ctx.drawImage(CUSTOMERS.src_speech_bubble,this.pos+25,CUSTOMER_DIMS.lanes[this.lane]-20);
        for(var i=0; i<this.orders.length; i++){
            var o = this.orders[i];
            if(!o.is_served){
                ctx.drawImage(CUSTOMERS.src_cones[o.type],this.pos+33+(i*15),CUSTOMER_DIMS.lanes[this.lane]-15);
            }
        }
    }
}

Customer.prototype.update = function(modifier){
    this.pos -= this.speed*modifier;

    if(this.pos <= -this.src.width){
        this.is_finished = true;
    }

    if( (this.pos <= game.w-this.src.width) && (!this.is_ordering)){
        this.is_ordering = true;
        score.orders_placed ++;
    }
}

Customer.prototype.create_order = function(){
    var num_orders = Math.floor((Math.random()*3))+1; // between 1 and 3 orders per car
    for(var i=0; i<num_orders; i++){
        this.orders.push(new Order());
    }
}

Customer.prototype.check_order = function(){
    if(!this.is_fed){
        var is_fed = true;
        for(var i=0; i<this.orders.length; i++){
            is_fed &= this.orders[i].is_served;
        }
        this.is_fed = is_fed;
        if(this.is_fed){
            score.orders_served ++;
        }
    }
}