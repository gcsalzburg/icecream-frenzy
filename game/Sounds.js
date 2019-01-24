
// ////////////////////////////////////
// // SOUNDS                         //
// // Base class for a sound effect  //
// ////////////////////////////////////

class Sound{
    constructor(sound, callback = function(){}){
        this.src = sound.cloneNode();

        // In case we want to trigger / cleanup after loop ended
        this.src.addEventListener("ended", function(){
            callback();
        });

        if(game.is_muted){
            this.src.volume = 0;
        }
    }

    // Play!
    play(){
        this.src.play();
    }

}