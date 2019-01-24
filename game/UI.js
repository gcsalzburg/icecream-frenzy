//
// Start button
//
var el = document.getElementById('play');
// attach anonymous function to click event
el.addEventListener('click', function(e){
    e.preventDefault();
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
        new Sound(sounds.lane).play();
    }else if(40 in keysDown){   // DOWN
        delete keysDown[40];
        TRUCK.change_lane(1);
        new Sound(sounds.lane).play();
    }
    if(49 in keysDown){ // NUMBER 1
        delete keysDown[49];
        if(CUSTOMERS.serve(TRUCK.getLane(),0)){
            ic_served();
        }else{
            ic_wasted();
        }
    }
    if(50 in keysDown){ // NUMBER 2
        delete keysDown[50];
        if(CUSTOMERS.serve(TRUCK.getLane(),1)){
            ic_served();
        }else{
            ic_wasted();
        }
    }
    if(51 in keysDown){ // NUMBER 3
        delete keysDown[51];
        if(CUSTOMERS.serve(TRUCK.getLane(),2)){
            ic_served();
        }else{
            ic_wasted();
        }
    }

    if(77 in keysUp){ // LETTER M
        delete keysUp[77];
        toggle_music();
    }

}