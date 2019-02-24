
class Order{
    constructor(){
        this.type = Math.floor((Math.random()*CUSTOMERS.number_flavours)); // three types of ice cream
        this.is_served = false;
    }
}