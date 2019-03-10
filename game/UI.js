
// /////////////////////////////////
// // UI BUTTON HANDLING          //
// /////////////////////////////////


// Start button

var play_btn = document.getElementById('play');
var play_crazy_btn = document.getElementById('play_crazy');
// attach anonymous function to click event
play_btn.addEventListener('click', function(e){
    e.preventDefault();
    if(game.can_start){
        start_game();   
    }
});
play_crazy_btn.addEventListener('click', function(e){
    e.preventDefault();
    if(game.can_start){
        game.mode = 1;
        start_game();   
    }
});

var enable_start = function(){
    play_btn.classList.remove("disabled");
    play_crazy_btn.classList.remove("disabled");
    play_btn.focus();
}

// Keyboard handling

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
        if(TRUCK.getLane() != TRUCK.change_lane(-1)){
            new Sound(sounds.lane).play();
        }
    }else if(40 in keysDown){   // DOWN
        delete keysDown[40];
        if(TRUCK.getLane() != TRUCK.change_lane(1)){
            new Sound(sounds.lane).play();
        }
    }
    if(86 in keysDown){ // LETTER V
        delete keysDown[86];
        if(game.is_playing){
            if(CUSTOMERS.serve(TRUCK.getLane(),0)){
                ic_served();
            }else{
                ic_wasted();
            }
        }
    }
    if(67 in keysDown){ // LETTER C
        delete keysDown[67];
        if(game.is_playing){
            if(CUSTOMERS.serve(TRUCK.getLane(),1)){
                ic_served();
            }else{
                ic_wasted();
            }
        }
    }
    if(83 in keysDown){ // LETTER S
        delete keysDown[83];
        if(game.is_playing){
            if(CUSTOMERS.serve(TRUCK.getLane(),2)){
                ic_served();
            }else{
                ic_wasted();
            }
        }
    }

    if(77 in keysUp){ // LETTER M
        delete keysUp[77];
        toggle_music();
    }
    if(76 in keysUp){ // LETTER L
        delete keysUp[76];
        life_lost();
    }

}


// /////////////////////////////////
// // HIGH SCORE TABLE            //
// /////////////////////////////////

var show_highscore_table = function(){
    document.getElementById("highscore_table").style.display = "block";
    document.getElementById("user_score").innerHTML = "$"+score.dollars;

    document.getElementById("score_form").addEventListener("submit",function(e){
        e.preventDefault();
        send_score();
    });
}

var send_score = function(){

    var stats = {
        orders_placed: score.orders_placed,
        orders_served: score.orders_served,
        orders_not_served: score.orders_not_served,
        icecream_served: score.icecream_served,
        icecream_wasted: score.icecream_wasted,
        mode: game.mode,
        distance: game.distance
    };

    postAjax(
        'https://scores.designedbycave.co.uk/a/iCPF6psu6iZULoMYKnZq/',
        {
            score: score.dollars,
            user: document.getElementById("name").value,
            stats: JSON.stringify(stats)
        },
        function(data){
            try{
                var json = JSON.parse(data);
                if(!json.error){
                    var form = document.getElementById('score_form');
                    document.getElementById('play_again').style.display = "block";
                    form.parentNode.removeChild(form);
                    fetch_highscores(parseInt(json.my_row));
                }
            }catch{
                console.log("Score response parse error");
            }
        }
    );
}


var fetch_highscores = function(my_row){
    getCORS('https://scores.designedbycave.co.uk/f/iCPF6psu6iZULoMYKnZq/?mode='+game.mode+'&stats=icecream_served,icecream_wasted,distance', function(request){
        var data = request.currentTarget.response || request.target.responseText;
        try{
            var json = JSON.parse(data);

            // Empty table first
            document.getElementById("score_table_tbl").getElementsByTagName('tbody')[0].innerHTML = "";
            json.scores.forEach(row => {
                
                let efficiency = Math.round(1000*(parseInt(row.icecream_served) / (parseInt(row.icecream_served)+parseInt(row.icecream_wasted))))/10;
                if(isNaN(efficiency)){
                    efficiency = 100;
                }
                let classname = "";
                if((my_row>0) && (my_row == parseInt(row.id))){
                    classname = "my_row";
                }
                document.getElementById("score_table_tbl").getElementsByTagName('tbody')[0].innerHTML += `<tr class="${classname}">
                    <td>${row.user}</td>
                    <td>$${row.score}</td>
                    <td>${row.icecream_served}</td>
                    <td>${efficiency}%</td>
                    <td>${Math.round(row.distance/game.distance_scale)}m</td>
                </tr>`;
            });
        }catch{
            console.log("Highscore table parse error");
        }
    });
}



function getCORS(url, success) {
    var xhr = new XMLHttpRequest();
    if (!('withCredentials' in xhr)) xhr = new XDomainRequest();
    xhr.open('GET', url);
    xhr.onload = success;
    xhr.send();
    return xhr;
}

function postAjax(url, data, success) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}