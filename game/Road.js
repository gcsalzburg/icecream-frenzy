
// ///////////////////////////////////////
// // ROAD                              //
// // Rolling road and graphics for it  //
// ///////////////////////////////////////

class Road{
    constructor(){
        this.src = null;
        this.cacti = [];
        this.cracks = [];
    
        this.has_populated_initial = false;
        this.pos = 0;
    
        // Measurement and calculation data for each set of graphics
        this.decor_data = [
            {   // Cacti top
                graphics: [],
                ani: false,
                speed: 1,          // percentage of game speed
                speed_variance: 0,
                last: 100,
                freq: (game.w/ 5), // average of 12 across width of screen at any time
                y_base: 105,
                y_variance: 50,
                x_variance: 200
            },
            {   // Cacti bottom
                graphics: [],
                ani: false,
                speed: 1,
                speed_variance: 0,
                last: 0,
                freq: (game.w/ 5),
                y_base: 550,
                y_variance: 70,
                x_variance: 200
            },
            {   // Road cracks
                graphics: [],
                ani: false,
                speed: 1,
                speed_variance: 0,
                last: 0,
                freq: (game.w/ 3),
                y_base: [239,322,425,521], // this variable can be an integer or array
                y_variance: 0,
                x_variance: 200
            },
            {   // Clouds
                graphics: [],
                ani: false,
                speed: 0.1,
                speed_variance: 0.1,
                last: 0,
                freq: (game.w/ 5),
                y_base: 10, // this variable can be an integer or array
                y_variance: 70,
                x_variance: 400
            },
            {   // Tumbleweed
                graphics: [],
                ani: true,
                speed: 0.4,
                speed_variance: 0.4,
                last: 1000,
                freq: game.w/0.5,
                y_base: [130,570], // this variable can be an integer or array
                y_variance: 25,
                x_variance: 800
            }
        ]
    
    
        this.cacti_y = [100,590];
        this.last_cacti = [0,0];
    
        this.cacti_freq = (game.w / 12);
        this.crack_freq = (game.w / 6);
    
        this.last_crack = 0;
    
        this.decors = []; 
    }

    render(elapsed){
        // Draw road, and one road behind
        ctx.drawImage(this.src,this.pos,0);
        ctx.drawImage(this.src,this.pos+this.src.width,0);
        
        // Update graphics
        for (var i = 0; i < this.decors.length; i++) {
            this.decors[i].render(elapsed);
        }
    }
    
    update(modifier, distance){
    
        // Initial fill for terrain
        if(!this.has_populated_initial){
            for (var i=0; i < this.decor_data.length; i++){
                var category = this.decor_data[i];
    
                for(var j=0; j <= game.w;){
                    var new_d = this._generate_decor(category,j-game.w,category.ani,category.speed);
                    this.decors.push(new_d);
                    j = new_d.getPos() + category.freq;
                }
            }
            this.has_populated_initial = true;
        }
    
        // Advance position of road
        this.pos = -distance%this.src.width;
    
        // Add decor
        for (var i=0; i < this.decor_data.length; i++){
            var category = this.decor_data[i];
            if(distance > (category.last + category.freq)){
                var new_d = this._generate_decor(category,distance,category.ani,category.speed+rand(category.speed_variance))
                this.decors.push(new_d);
                category.last = distance;
            }
        }
    
        // Update decors
        for (var i = 0; i < this.decors.length; i++) {
            var d = this.decors[i];
    
            // Set distance for decor
            d.setPos(d.getPos() - modifier *d.getSpeed()*game.speed);
    
            // Remove old decor
            if(d.getPos() < -d.getWidth()){
                this.decors.splice(i,1);
            }
        }
    }

    // Helper to return a new generated decor just off-screen based on the given distance
    _generate_decor(data,distance,is_ani=false, speed=1){
        var x_pos = distance+rand_int(data.x_variance)+game.w;
        if(data.y_base.constructor === Array){
            var y_pos = data.y_base[rand_int(data.y_base.length)]+rand_int(data.y_variance);
        }else{
            var y_pos = data.y_base+rand_int(data.y_variance);
        }
        return new Decor(data.graphics[rand_int(data.graphics.length)], x_pos, y_pos, is_ani, speed);
    }

}



class Decor{
    constructor(src, start, y, is_ani, speed=1){

        this._is_ani = is_ani;

        if(this._is_ani){
            this._src = new Sprite(src,9,9,1,100);
        }else{
            this._src = src;
        }
        this._y = y;
        this._speed = speed;
    
        this._pos = start;
    }

    // Getters
    getWidth(){
        return this._src.width;
    }
    getSpeed(){
        return this._speed;
    }
    getPos(){
        return this._pos;
    }
    setPos(new_pos){
        this._pos = new_pos 
    }

    // Render
    render(elapsed){
        if(this._is_ani){
            this._src.draw(elapsed,this._pos,this._y);
        }else{
            ctx.drawImage(this._src,this._pos,this._y);
        }
    }
}