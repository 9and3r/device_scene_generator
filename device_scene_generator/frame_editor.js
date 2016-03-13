
window.onload=onLoad;

var framesLoaded = 0;
var screensLoaded = 0;



var selected = undefined;
var canvas;
var ctx;

var zoomControl;

var newFrameScreenLoaded;



function onLoad() {

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  sceneHolder = new SceneHolder(1920, 1080);
  new Nexus5XFrame();
  new Nexus6PFrame();
  new WearRoundFrame();
  new WearSquareFrame();

  document.getElementById("device_add").addEventListener("click", function(){
    var list = document.getElementById("device_select");
    sceneHolder.addHolder(new DeviceFrameHolder(SceneHolder.allTypeDeviceFrames[list.options[list.selectedIndex].getAttribute("value")]));
    draw();
  });

  document.getElementById("canvas_width").addEventListener('input', function(){
    var newWidth = document.getElementById("canvas_width").value;
    if (newWidth < 10){
        newWidth = 10;
    }
    sceneHolder.canvas.width = newWidth;
    onZoomChanged();
  }, false);
  document.getElementById("canvas_width").value = sceneHolder.canvas.width;

  document.getElementById("canvas_height").addEventListener('input', function(){
    var newHeight = document.getElementById("canvas_height").value;
    if (newHeight < 10){
      newHeight = 10;
    }
    sceneHolder.canvas.height = newHeight;
    onZoomChanged();
    
  }, false);
  document.getElementById("canvas_height").value = sceneHolder.canvas.height;

  var dragScreen = document.getElementById("screens");
  dragScreen.addEventListener("dragover", function(event){}, false);
  dragScreen.addEventListener("dragleave", function(event){}, false);
  dragScreen = addEventListener("drop", uploadScreens, false);


  zoomControl = document.getElementById("canvas_zoom");
  zoomControl.value = 100;

  document.getElementById("base_ppi").value = BASE_PPI;

  onZoomChanged();


  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseleave', onMouseUp, false);
  window.addEventListener("keyup", onKeyPress, false);
  window.addEventListener("keypress", onKeyPress, false);
}

function onNewScreenImageChanged(files){
  if(files.length>0) {
    var file = files[0];
    var imageType = /^image\//;
    
    if (imageType.test(file.type)) {
        var reader = new FileReader();
      reader.onload = function(a){
        document.getElementById("new_device_screen_image").src = a.currentTarget.result;
        newFrameScreenLoaded = true;
       };
    newFrameScreenLoaded = false;
    reader.readAsDataURL(file);
    }
    
  }
}

function createNewFrame(){
  var name = document.getElementById("frame_name").value;
  var width = document.getElementById("frame_width").value;
  var height = document.getElementById("frame_height").value;
  var ppi = document.getElementById("frame_ppi").value;
  var leftPadding = document.getElementById("frame_left_padding").value;
  var topPadding = document.getElementById("frame_top_padding").value;
  var imageSrc = document.getElementById("new_device_screen_image").src;

  if (name != undefined && name.length > 0 && width > 0 && height > 0 && ppi > 0 && leftPadding > 0 && topPadding > 0 && newFrameScreenLoaded){
    new DeviceFrame(name, 0, ppi, leftPadding, topPadding, width, height, imageSrc);
    document.getElementById("new_frame_panel").classList.add('invisible');
    document.getElementById("frame_name").value = "";
    document.getElementById("new_device_screen_image").src = "";
  }
}

function stopPropagation(e){
  e.stopPropagation();
}

function changeBasePPI(value){
  if (value > 100){
    SceneHolder.changeBasePPI(value);
    draw();
  }
}

function fitZoom(){
  var width = document.getElementById("main_container").clientWidth - 80;
  var height = document.getElementById("main_container").clientHeight - 80;
  console.log(height);
  console.log(width);
  var widthZoom = width * 100 / sceneHolder.canvas.width;
  var heightZoom = height * 100 / sceneHolder.canvas.height;
  console.log(widthZoom);
  if (widthZoom > heightZoom){
    setZoomValue(heightZoom);
  }else{
    setZoomValue(widthZoom);
  }
}

function downloadPNG(element){
  console.log("Hemen nao");
    var download = sceneHolder.canvas.toDataURL('image/png');
    window.open(download);
}

function getElementInPos(x, y){
  for (i=sceneHolder.deviceFrameHolders.length-1; i>=0; i--){
    if (sceneHolder.deviceFrameHolders[i].isPointInside(x, y)){
      return sceneHolder.deviceFrameHolders[i];
    }
  }
  return undefined;
}



function uploadScreens(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var imageType = /^image\//;
    
    if (!imageType.test(file.type)) {
      continue;
    }
    var reader = new FileReader();
    reader.onload = function(a){
      SceneHolder.addScreenImages(0, [a.currentTarget.result]);
    };
    reader.readAsDataURL(file);
  }
}

function onMouseDown(event){
  var new_selected = getElementInPos(normalizeToZoomValue(event.layerX), normalizeToZoomValue(event.layerY));
  if (selected != undefined && new_selected != undefined && selected == new_selected){
    canvas.addEventListener('mousemove', onMouseMove, false);
  }
  selectedChange(new_selected);
  draw();
}

function onMouseUp(event){
  canvas.removeEventListener('mousemove', onMouseMove, false);
}

function onMouseMove(event){
  if (selected != undefined){
    selected.x += normalizeToZoomValue(event.movementX);
    selected.y += normalizeToZoomValue(event.movementY);
    draw();
  }
  //selected = getElementInPos(event.layerX, event.layerY);
}

function normalizeToZoomValue(i){
  return i * 100 / zoomControl.value;
}

function selectedChange(new_selected){
  if (new_selected != selected){
    selected = new_selected;
    if (selected != undefined){
        document.getElementById("current_device_panel").classList.remove('invisible');
    }else{
      document.getElementById("current_device_panel").classList.add('invisible');
    }
  }
}

function fitCanvasWidth(){
  var width = 10;
  for (i=0; i<sceneHolder.deviceFrameHolders.length; i++){
    if (width < sceneHolder.deviceFrameHolders[i].x + sceneHolder.deviceFrameHolders[i].deviceFrame.frameWidth){
      width = sceneHolder.deviceFrameHolders[i].x + sceneHolder.deviceFrameHolders[i].deviceFrame.frameWidth;
    }
  }
  width = Math.ceil(width);
  document.getElementById("canvas_width").value = width;
  sceneHolder.canvas.width = width;
  onZoomChanged();
}

function fitCanvasHeight(){
  var height = 10;
  for (i=0; i<sceneHolder.deviceFrameHolders.length; i++){
    if (height < sceneHolder.deviceFrameHolders[i].y + sceneHolder.deviceFrameHolders[i].deviceFrame.frameHeight){
      height = sceneHolder.deviceFrameHolders[i].y + sceneHolder.deviceFrameHolders[i].deviceFrame.frameHeight;
    }
  }
  height = Math.ceil(height);
  document.getElementById("canvas_height").value = height;
  sceneHolder.canvas.height = height;
  onZoomChanged();
}

function onPeviewSelected(preview){
  var pos = preview.getAttribute('data-pos');
  if(pos == -1){
    selected.screenImage = undefined;
  }else{
    selected.screenImage = SceneHolder.screenImages[0][pos];
  }
  document.getElementById("screens_panel").classList.add('invisible');
  draw();
}

DeviceFrame.onDeviceFrameLoaded = function(frame){
  //Check if a frame of each type has loaded
  var node = document.createElement("option"); 
  node.setAttribute("value", framesLoaded)        // Create a <li> node
  var textnode = document.createTextNode(frame.name);         // Create a text node
  node.appendChild(textnode);                              // Append the text to <li>
  document.getElementById("device_select").appendChild(node);
  framesLoaded++;
}

function openChangeScreen(){
  document.getElementById("screens_panel").classList.remove("invisible");
}



SceneHolder.onScreenLoaded = function(screen, type){ 
  var img = document.createElement("img");
  img.classList.add('preview');
  img.src = screen.src;
  img.setAttribute('onclick', 'onPeviewSelected(this);');
  img.setAttribute('data-pos', screensLoaded);
  screensLoaded++;
  document.getElementById("screens").appendChild(img);
}

function setZoomValue(value){
  zoomControl.value = parseInt(value);
  onZoomChanged();
}

function zoomChange(value){
  zoomControl.value = parseInt(zoomControl.value) + value;
  onZoomChanged();
}

function onZoomChanged(){
  canvas.width = sceneHolder.canvas.width * zoomControl.value / 100;
  canvas.height = sceneHolder.canvas.height * zoomControl.value / 100;
  draw();
}

function draw(){
  sceneHolder.draw();
  if (selected != undefined){
    sceneHolder.ctx.strokeStyle="#000000";
    sceneHolder.ctx.lineWidth=5;
    sceneHolder.ctx.beginPath();
    sceneHolder.ctx.rect(selected.x, selected.y, selected.deviceFrame.frameWidth, selected.deviceFrame.frameHeight);
    sceneHolder.ctx.stroke();
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(sceneHolder.canvas, 0, 0, width=canvas.width, height=canvas.height);
}

function backOrFront(front, maximun){
  var newPos;
  if (maximun){
    if (front){
      newPos = sceneHolder.deviceFrameHolders.length-1;
    }else{
      newPos = 0;
    }
  }else{
    newPos = sceneHolder.getHolderPosition(selected);
    if (front){
      newPos += 1;
    }else{
      newPos -= 1;
    }
  }
  if (newPos >= 0 && newPos < sceneHolder.deviceFrameHolders.length){
    sceneHolder.moveHolderPosition(selected, newPos);
    draw();
  }
}

function onKeyPress(event){
  if (selected != undefined){
    // SUPR
    switch(event.keyCode){
      case 46:
        sceneHolder.removeHolder(selected);
        selectedChange(undefined);
        draw();
        break;
      // S
      case 83:
        selected.y += 1;
        draw();
        break;
      // s
      case 115:
        selected.y += 1;
        draw();
        break;

      // W
      case 87:
        selected.y -= 1;
        draw();
        break;
      // w
      case 119:
        selected.y -= 1;
        draw();
        break;

      // A
      case 65:
        selected.x -= 1;
        draw();
        break;
      // a
      case 97:
        selected.x -= 1;
        draw();
        break;

      // D
      case 68:
        selected.x += 1;
        draw();
        break;
      // d
      case 100:
        selected.x += 1;
        draw();
        break;
    }
  }
  
}
