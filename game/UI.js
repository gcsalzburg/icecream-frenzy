
// /////////////////////////////////
// // UI BUTTON HANDLING          //
// /////////////////////////////////


// Start button

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

// Special buttons

var crazy = document.getElementById('crazy_mode').addEventListener('click',function(e){
    e.preventDefault();
    console.log("Enabled crazy mode!");
    CUSTOMERS.customer_interval = 100;
});

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
        if(!game.is_over){
            if(CUSTOMERS.serve(TRUCK.getLane(),0)){
                ic_served();
            }else{
                ic_wasted();
            }
        }
    }
    if(50 in keysDown){ // NUMBER 2
        delete keysDown[50];
        if(!game.is_over){
            if(CUSTOMERS.serve(TRUCK.getLane(),1)){
                ic_served();
            }else{
                ic_wasted();
            }
        }
    }
    if(51 in keysDown){ // NUMBER 3
        delete keysDown[51];
        if(!game.is_over){
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
    fetch_highscores();

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
        iceream_wasted: score.icecream_wasted,
        mode: 0,
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
            console.log(data);
            try{
                var json = JSON.parse(data);
                if(!json.error){
                    var form = document.getElementById('score_form');
                    form.parentNode.removeChild(form);
                    fetch_highscores();
                }
            }catch{
                console.log("Score response parse error");
            }
        }
    );
}


var fetch_highscores = function(){
    getCORS('https://scores.designedbycave.co.uk/f/iCPF6psu6iZULoMYKnZq/', function(request){
        var data = request.currentTarget.response || request.target.responseText;
        try{
            var json = JSON.parse(data);
            document.getElementById("score_table").innerHTML = '';
            json.scores.forEach(row => {
                document.getElementById("score_table").innerHTML += `<div class="entry"><span class="name">${row.user}</span><span class="score">$${row.score}</span></div>`;
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