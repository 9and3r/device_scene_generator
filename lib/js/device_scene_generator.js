

const DEFAULT_PPI = 445;
var BASE_PPI = DEFAULT_PPI;


function pop(array, pos){
  var result = array[pos];
  array.splice(pos, 1 );
  return result;
}


// type map example [[0], [1,2]]
// the first position will be filled with 0 type devices
// the second position will be filled with devices of type 1 or 2
var SceneHolder = function(width, height, canvas){
  this.availableScreenImages = [[], [], []];
  this.center = null;
  this.left = null;
  this.right = null;
  if (canvas === undefined){
     this.canvas = document.createElement('canvas');
   }else{
    this.canvas = canvas;
   }
 
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext("2d");
  this.deviceFrameHolders = [];
}

SceneHolder.screenImages = [];
SceneHolder.deviceFrames = [];
SceneHolder.allTypeDeviceFrames = [];

SceneHolder.onDeviceFrameLoaded = function(frame){
  if (SceneHolder.deviceFrames[frame.type] == undefined){
      SceneHolder.deviceFrames[frame.type] = [];
  }
  SceneHolder.deviceFrames[frame.type].push(frame);
  SceneHolder.allTypeDeviceFrames.push(frame);
}

SceneHolder.onPreScreenLoaded = function(type){
  if (SceneHolder.screenImages[type] == undefined){
      SceneHolder.screenImages[type] = [];
  }
  console.log(this);
  console.log(type);
  SceneHolder.screenImages[type].push(this);
  if (typeof SceneHolder.onScreenLoaded == 'function'){
     SceneHolder.onScreenLoaded(this, type);
  }
}

SceneHolder.addScreenImages = function(type, images){
  for (i=0; i<images.length; i++){
    var image = new Image();
    image.onload = SceneHolder.onPreScreenLoaded.bind(image, type);
    image.src = images[i];
  }
}

SceneHolder.changeBasePPI = function(newBasePPI){
  if (newBasePPI > 100){
    BASE_PPI = newBasePPI;
    for (i=0; i<SceneHolder.allTypeDeviceFrames.length; i++){
      SceneHolder.allTypeDeviceFrames[i].calculateSizes();
    }
  }
}

SceneHolder.prototype.addHolder = function(holder){
  this.deviceFrameHolders.push(holder);
}

SceneHolder.prototype.removeHolder = function(holder){
  var pos = this.deviceFrameHolders.indexOf(holder);
  this.deviceFrameHolders.splice(pos, pos + 1);
}

SceneHolder.prototype.getHolderPosition = function(holder){
  return this.deviceFrameHolders.indexOf(holder);
}

SceneHolder.prototype.moveHolderPosition = function(holder, targetPos){
  var holderPos = this.getHolderPosition(holder);
  this.deviceFrameHolders.splice(targetPos, 0, this.deviceFrameHolders.splice(holderPos, 1)[0]);
}

SceneHolder.prototype.getHolder = function(pos){
  return this.deviceFrameHolders[pos];
}

SceneHolder.prototype.changeHolderDevice = function(pos, device){
  this.deviceFrameHolders[pos].deviceFrame = device;
  if (typeof SceneHolder.positionDeviceHolder == 'function'){
    SceneHolder.positionDeviceHolder(pos, this.canvas, this.deviceFrameHolders[pos], this.deviceFrameHolders[pos].deviceFrame.frameWidth, this.deviceFrameHolders[pos].deviceFrame.frameHeight);
  }
}

SceneHolder.prototype.changeHolderScreen = function(pos, screen){
  this.deviceFrameHolders[pos].screenImage = screen;
}

SceneHolder.prototype.update = function(){
  this.draw();
}

SceneHolder.prototype.draw = function(){
  if (this.backgroundColor == undefined){
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }else{
      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fill();
  }
  for (i=0; i<this.deviceFrameHolders.length; i++){
    this.deviceFrameHolders[i].draw(this.ctx);
  }
}



var DeviceFrameHolder = function(deviceFrame){
    this.x = 0;
    this.y = 0;
    this.deviceFrame = deviceFrame;
    this.screenImage = undefined;
}

DeviceFrameHolder.prototype.isPointInside = function(x, y){
  if (this.x < x && x < this.x + this.deviceFrame.frameWidth && this.y < y && y < this.y + this.deviceFrame.frameHeight){
    return true;
  }else{
    return false;
  }
}

DeviceFrameHolder.prototype.draw = function(ctx){
    if (this.deviceFrame.shadowImage != undefined && this.deviceFrame.shadowImage.complete){
      ctx.drawImage(this.deviceFrame.shadowImage, this.x, this.y, width=this.deviceFrame.frameWidth, height=this.deviceFrame.frameHeight);
    }
    if (this.screenImage != undefined && this.screenImage.complete){
      ctx.drawImage(this.screenImage, this.x + this.deviceFrame.leftPadding, this.y + this.deviceFrame.topPadding, width=this.deviceFrame.width, height=this.deviceFrame.height);
    }
    ctx.drawImage(this.deviceFrame.frameImage, this.x, this.y, width=this.deviceFrame.frameWidth, height=this.deviceFrame.frameHeight);
    if (this.deviceFrame.screenGlareImage != undefined && this.deviceFrame.screenGlareImage.complete){
      ctx.drawImage(this.deviceFrame.screenGlareImage, this.x, this.y, width=this.deviceFrame.frameWidth, height=this.deviceFrame.frameHeight);
    }
};

var DeviceFrame = function(name, type, ppi, leftPadding, topPadding, width, height, imageSrc, shadowImageSrc, screenGlareImageSrc){
    if (typeof BASE_PPI == 'undefined'){
      BASE_PPI = DEFAULT_PPI;
    }
    this.name = name;
    this.type = type;
    this.ppi = ppi;
    this.frameWidth = undefined;
    this.frameHeight = undefined;
    this.loaded = false;

    this.frameImage = new Image();
    this.frameImage.onload = onBaseDeviceFrameLoaded.bind(this);
    this.frameImage.src = imageSrc;

    

    this.preLeftPadding = leftPadding;
    this.preTopPadding = topPadding;
    this.preWidth = width;
    this.preHeight = height;

    if (shadowImageSrc != undefined){
      this.shadowImage = new Image();
      this.shadowImage.onload = shadowLoaded.bind(this);
      this.shadowImage.src = shadowImageSrc;
    }

    if (screenGlareImageSrc != undefined){
      this.screenGlareImage = new Image();
      this.screenGlareImage.onload = screenGlareLoaded.bind(this);
      this.screenGlareImage.src = screenGlareImageSrc;
    }
    this.calculateSizes();
};

DeviceFrame.prototype.calculateSizes = function(){
    this.leftPadding = Math.floor(this.preLeftPadding*BASE_PPI/this.ppi);
    this.topPadding = Math.floor(this.preTopPadding*BASE_PPI/this.ppi);
    this.width = Math.ceil(this.preWidth*BASE_PPI/this.ppi)+1;
    this.height = Math.ceil(this.preHeight*BASE_PPI/this.ppi)+1;
    if (this.frameImage.complete){
      this.frameWidth = Math.floor(this.frameImage.naturalWidth*BASE_PPI/this.ppi);
      this.frameHeight = Math.floor(this.frameImage.naturalHeight*BASE_PPI/this.ppi);
    }
}

DeviceFrame.prototype.isLoaded = function(){
  if (this.frameImage.complete && (this.shadowImage == undefined || this.shadowImage.complete) && (this.screenGlareImage == undefined || this.screenGlareImage.complete)){
    this.loaded = true;
    return true;
  }else{
    return false;
  }
}

var shadowLoaded = function(){
  preOnDeviceFramePortionLoaded(this);
}

var screenGlareLoaded = function(){
  preOnDeviceFramePortionLoaded(this);
}

var preOnDeviceFramePortionLoaded = function(deviceFrame){
  if (!deviceFrame.loaded){
    if (deviceFrame.isLoaded()){
    if (typeof DeviceFrame.onDeviceFrameLoaded == 'function'){
      DeviceFrame.onDeviceFrameLoaded(deviceFrame);
    }
  }else{
    if (typeof DeviceFrame.onDevicePortionLoaded == 'function'){
      DeviceFrame.onDevicePortionLoaded(deviceFrame);
    }
  }
  }
  
}

var onBaseDeviceFrameLoaded = function(){
  this.frameWidth = Math.floor(this.frameImage.naturalWidth*BASE_PPI/this.ppi);
  this.frameHeight = Math.floor(this.frameImage.naturalHeight*BASE_PPI/this.ppi);
  SceneHolder.onDeviceFrameLoaded(this);
  preOnDeviceFrameLoaded(this);
}

var preOnDeviceFrameLoaded = function(deviceFrame){
  if (!deviceFrame.loaded){
    if (deviceFrame.isLoaded()){
    if (typeof DeviceFrame.onDeviceFrameLoaded == 'function'){
      DeviceFrame.onDeviceFrameLoaded(deviceFrame);
    }
  }else{
    if (typeof DeviceFrame.onDeviceBaseLoaded == 'function'){
      DeviceFrame.onDeviceBaseLoaded(deviceFrame);
    }
  }
  }
  
}











