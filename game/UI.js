//
// Start button
//
var el = document.getElementById('play');
// attach anonymous function to click event
el.addEventListener('click', function(){
    if(game.can_start){
        start_game();   
    }
});

var enable_start = function(){
    var bar = document.getElementById("play");
    bar.classList.remove("disabled");
}

// /////////////////////////////////
// // KEYBOARD HANDLING           //
// /////////////////////////////////

var keysDown = {};
var keysUp = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
    keysUp[e.keyCode] = true;
}, false);


check_keys = function(){
    
    // Handle key presses
    if(38 in keysDown){         // UP
        delete keysDown[38];
        TRUCK.change_lane(-1);
    }else if(40 in keysDown){   // DOWN
        delete keysDown[40];
        TRUCK.change_lane(1);
    }
    if(49 in keysDown){ // NUMBER 1
        delete keysDown[49];
        if(CUSTOMERS.serve(TRUCK.getLane(),0)){
            score.icecream_served++;
            TRUCK.dollar(0);
        }else{
            score.icecream_wasted++;
            TRUCK.dollar(1);
        }
    }
    if(50 in keysDown){ // NUMBER 2
        delete keysDown[50];
        if(CUSTOMERS.serve(TRUCK.getLane(),1)){
            score.icecream_served++;
            TRUCK.dollar(0);
        }else{
            score.icecream_wasted++;
            TRUCK.dollar(1);
        }
    }
    if(51 in keysDown){ // NUMBER 3
        delete keysDown[51];
        if(CUSTOMERS.serve(TRUCK.getLane(),2)){
            score.icecream_served++;
            TRUCK.dollar(0);
        }else{
            score.icecream_wasted++;
            TRUCK.dollar(1);
        }
    }

}

display_scores = function(){
    
    // Data
	ctx.fillStyle = "rgb(58, 61, 62)";
    ctx.font = "22px VT323";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
    ctx.fillText(`Orders served: ${score.orders_served}/${score.orders_placed}`, 1170, 40);    
    let efficiency = Math.round(1000*(score.icecream_served / (score.icecream_served+score.icecream_wasted)))/10;
    if(isNaN(efficiency)){
        efficiency = 0;
    }
    ctx.fillText(`Ice cream efficiency: ${efficiency}%` , 1170, 62);  
    ctx.fillText(`Distance: ${Math.round(game.distance / game.distance_scale)}m` , 1170, 84);  
    
    // Main score
    ctx.font = "50px VT323";
    ctx.textAlign = "left";
    var score_disp = score.orders_served - (score.orders_placed-score.orders_served)*2;
    ctx.fillText(score_disp, 20,20);


	// FPS
	ctx.font = "8px Helvetica";
	ctx.textAlign = "right";
	ctx.textBaseline = "top";
    ctx.fillText(`FPS: ${fps}`, 1170, 10);    
}