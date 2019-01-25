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

AssetManager.prototype.downloadAll = function(downloadCallback, progressCallback) {
    if (this.downloadQueue.length === 0) {
        downloadCallback();
    }
    for (var i = 0; i < this.downloadQueue.length; i++) {

        // Check type of downloaded file
        var path = this.downloadQueue[i];

        var cache_obj = null;
        if(path.slice(-3) == "png"){
            cache_obj = new Image();
        }else if(path.slice(-3) == "mp3"){
            cache_obj = new Audio();
        }else if(this.debug){
            console.log("Unknown file type: " + path);
        }

        if(cache_obj){
            var that = this;

            ['load','canplaythrough'].forEach( function(evt) {
                cache_obj.addEventListener(evt, function(){
                    if(that.debug){
                        console.log(this.src + ' is loaded');
                    }
                    that.successCount += 1;
                    progressCallback(that.successCount, that.errorCount, that.downloadQueue.length);
                    if (that.isDone()) {
                        downloadCallback();
                    }
                }, false);
            });
            cache_obj.addEventListener("error", function() {
                if(that.debug){
                    console.log("ERROR:" + this.src + 'was NOT loaded');
                }
                that.errorCount += 1;
                progressCallback(that.successCount, that.errorCount, that.downloadQueue.length);
                if (that.isDone()) {
                    downloadCallback();
                }
            }, false);

            // Initiate load by setting the path
            cache_obj.src = path;

            // Save path to cache
            this.cache[path] = cache_obj;
        }else{
            this.errorCount += 1;
            if (this.isDone()) {
                downloadCallback();
            }
        }   
    }
}

AssetManager.prototype.isDone = function() {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}

AssetManager.prototype.getAsset = function(path) {
    return this.cache[this.defaultPath + path];
}