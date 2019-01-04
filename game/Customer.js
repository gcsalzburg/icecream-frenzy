
function Customer(src_img){
    this.lane = Math.floor((Math.random()*NUM_LANES));
    this.src = src_img;

    this.pos = game.w;
    this.speed = 100;
}

Customer.prototype.render = function(){
    ctx.drawImage(this.src,this.pos,LANES_Y[this.lane]);
}

Customer.prototype.update = function(modifier){
    this.pos -= this.speed*modifier;
}