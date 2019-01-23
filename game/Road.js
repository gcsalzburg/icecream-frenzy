
function Road(){
    this.src = null;
    this.cacti = [];
    this.cracks = [];

    this.has_populated_initial = false;
    this.pos = 0;

    // Measurement and calculation data for each set of graphics
    this.decor_data = [
        {   // Cacti top
            graphics: [],
            last: 100,
            freq: (game.w/ 4), // average of 12 across width of screen at any time
            y_base: 105,
            y_variance: 50,
            x_variance: 200
        },
        {   // Cacti bottom
            graphics: [],
            last: 0,
            freq: (game.w/ 4),
            y_base: 550,
            y_variance: 70,
            x_variance: 200
        },
        {   // Road cracks
            graphics: [],
            last: 0,
            freq: (game.w/ 3),
            y_base: [239,322,425,521], // this variable can be an integer or array
            y_variance: 0,
            x_variance: 200
        },
        {   // Tumbleweed
            // TODO: Fix display of this tumbleweed (hidden for now)
            graphics: [],
            last: 0,
            freq: (game.w/ 5),
            y_base: 900, // this variable can be an integer or array
            y_variance: 0,
            x_variance: 200
        }
    ]


    this.cacti_y = [100,590];
    this.last_cacti = [0,0];

    this.cacti_freq = (game.w / 12);
    this.crack_freq = (game.w / 6);

    this.last_crack = 0;

    this.decors = [];
}

Road.prototype.render = function(){
    // Draw road, and one road behind
    ctx.drawImage(this.src,this.pos,0);
    ctx.drawImage(this.src,this.pos+this.src.width,0);
    
    // Update graphics
    for (var i = 0; i < this.decors.length; i++) {
        this.decors[i].render();
    }
}

Road.prototype.update = function(modifier, distance){

    // Initial fill for terrain
    if(!this.has_populated_initial){
        for (var i=0; i < this.decor_data.length; i++){
            var category = this.decor_data[i];

            for(var j=0; j <= game.w;){
                var new_d = generate_decor(category,j-game.w);
                this.decors.push(new_d);
                j = new_d.start + category.freq;
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
            this.decors.push(generate_decor(category,distance));
            category.last = distance;
        }
    }

    // Update decors
    for (var i = 0; i < this.decors.length; i++) {
        var d = this.decors[i];

        // Set distance for decor
        d.pos = d.start - distance;

        // Remove old decor
        if(d.pos < -d.src.width){
            this.decors.splice(i,1);
        }
    }
}


// A cactus, crack or other piece of street furniture
function Decor(src, start, y){
    this.src = src;
    this.start = start;
    this.y = y;

    this.pos = 0;
}

Decor.prototype.render = function(){
    ctx.drawImage(this.src,this.pos,this.y);
}

// Helper to return a new generated decor just off-screen based on the given distance
function generate_decor(data,distance){
    var x_pos = distance+rand_int(data.x_variance)+game.w;
    if(data.y_base.constructor === Array){
        var y_pos = data.y_base[rand_int(data.y_base.length)]+rand_int(data.y_variance);
    }else{
        var y_pos = data.y_base+rand_int(data.y_variance);
    }
    return new Decor(data.graphics[rand_int(data.graphics.length)],x_pos,y_pos);
}