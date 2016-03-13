//DeviceFrame(type, ppi, leftPadding, topPadding, width, height, imageSrc, shadowSrc, foregroundSrc)


var Nexus5XFrame = function(){
  DeviceFrame.call(this, "Nexus 5X - Black", 0, 424, 305, 485, 1080, 1920, 
    "../lib/images/nexus_5X/port_back.png",
    "../lib/images/nexus_5X/port_shadow.png",
    "../lib/images/nexus_5X/port_fore.png");
}
Nexus5XFrame.prototype = Object.create(DeviceFrame.prototype);
Nexus5XFrame.prototype.constructor = Nexus5XFrame;

var Nexus6PFrame = function(){
  DeviceFrame.call(this, "Nexus 6P - Black", 0, 560, 312, 579, 1440, 2560, 
    "../lib/images/nexus_6P/port_back.png",
    "../lib/images/nexus_6P/port_shadow.png",
    "../lib/images/nexus_6P/port_fore.png");
}
Nexus6PFrame.prototype = Object.create(DeviceFrame.prototype);
Nexus6PFrame.prototype.constructor = Nexus6PFrame;

var WearRoundFrame = function(){
  DeviceFrame.call(this, "Wear Round", 0, 224, 128, 134, 320, 320, 
    "../lib/images/wear_round/port_back.png");
}
WearRoundFrame.prototype = Object.create(DeviceFrame.prototype);
WearRoundFrame.prototype.constructor = WearRoundFrame;

var WearSquareFrame = function(){
  DeviceFrame.call(this, "Wear Square", 0, 224, 200, 214, 320, 320, 
    "../lib/images/wear_square/port_back.png");
}
WearSquareFrame.prototype = Object.create(DeviceFrame.prototype);
WearSquareFrame.prototype.constructor = WearSquareFrame;