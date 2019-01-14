// Taken from:
// https://www.html5rocks.com/en/tutorials/games/assetmanager/

function AssetManager() {
    this.defaultPath = "";
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = {};
    this.debug = false;
    this.downloadQueue = [];
}

AssetManager.prototype.setDefaultPath = function(path){
    if(path != ""){
        this.defaultPath = path;
    }
}
AssetManager.prototype.setDebug = function(debug){
    this.debug = debug;
}

AssetManager.prototype.queueDownload = function(path) {
    this.downloadQueue.push(this.defaultPath + path);
}

AssetManager.prototype.queueDownloads = function(){
    for (var i = 0; i < arguments.length; i++) {
        this.downloadQueue.push(this.defaultPath + arguments[i]);
    }
}

AssetManager.prototype.downloadAll = function(downloadCallback) {
    if (this.downloadQueue.length === 0) {
        downloadCallback();
    }
    for (var i = 0; i < this.downloadQueue.length; i++) {

        // Check type of downloaded file
        var path = this.downloadQueue[i];
        if(path.slice(-3) == "png"){
            var img = new Image();
            var that = this;
            img.addEventListener("load", function() {
                if(that.debug){
                    console.log(this.src + ' is loaded');
                }
                that.successCount += 1;
                if (that.isDone()) {
                    downloadCallback();
                }
            }, false);
            img.addEventListener("error", function() {
                if(that.debug){
                    console.log("ERROR:" + this.src + 'was NOT loaded');
                }
                that.errorCount += 1;
                if (that.isDone()) {
                    downloadCallback();
                }
            }, false);
            img.src = path;
            this.cache[path] = img;

        }else if(path.slice(-3) == "mp3"){

            var audio = new Audio();
            audio.addEventListener('canplaythrough', function(){
                if(that.debug){
                    console.log(this.src + ' is loaded');
                }
                that.successCount += 1;
                if (that.isDone()) {
                    downloadCallback();
                }
            }, false);
            audio.addEventListener('error', function(){
                if(that.debug){
                    console.log("ERROR:" + this.src + 'was NOT loaded');
                }
                that.errorCount += 1;
                if (that.isDone()) {
                    downloadCallback();
                }
            }, false);
            audio.src = path;
        }else{
            console.log("Unknown file type: " + path);
        }
    }
}

AssetManager.prototype.isDone = function() {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}

AssetManager.prototype.getAsset = function(path) {
    return this.cache[this.defaultPath + path];
}