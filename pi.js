var RaspiCam = require("raspicam");
var express = require('express');
var motionDetector = require("./MotionDetector");

var app = express();
var camera = new RaspiCam({
	mode: "photo",
	output: "/home/pi/RaspberryCamera/photos/picture.jpg"
});

var cameraOptions = {
	PHOTO: "photo",
	VIDEO: "video"
};
var PHOTO_FOLDER = "/home/pi/RaspberryCamera/photos/";
var VIDEO_FOLDER = "/home/pi/RaspberryCamera/videos/";
var server = {
	PORT : 3000
};

camera.configureFor = function (option) {
	var changed = false;
	switch (option) {
		case cameraOptions.PHOTO:
			if(camera.get("mode") !== cameraOptions.PHOTO){
				camera.set("mode", "photo");
				changed = true;
			}
			if(camera.get("output") !== PHOTO_FOLDER + "picture.jpg") {
				camera.set("output", PHOTO_FOLDER + "picture.jpg");
				changed = true;
			}
			break;
		case cameraOptions.VIDEO:
			if(camera.get("mode") !== cameraOptions.VIDEO){
				camera.set("mode", "video");
				changed = true;
			}
			if(camera.get("output") !== VIDEO_FOLDER + "video.h264") {
				camera.set("output", VIDEO_FOLDER + "video.h264");
				changed = true;
			}
			if(camera.get("timeout") !== 10000) {
				camera.set("timeout", 10000);
				changed = true;
			}
			break;
	}
	if(changed) {
		console.log("Changed camera configuration for " + option);
	}
}

app.get('/photo', function(req, res){
	camera.configureFor("photo");
	//listen for the "read" event triggered when each new photo/video is saved
	camera.on("read", function(err, date, filename){ 
		if (err) {
			throw err;
		}
		camera.stop();
		motionDetector.monitor();
		res.write("200");
		res.end();
	});
	if(motionDetector.isMonitoring()) {
		motionDetector.stopMonitoring();
	}
	camera.start();
});

app.get('/video', function(req, res){
	camera.configureFor("video");
	//listen for the "read" event triggered when each new photo/video is saved
	camera.on("exit", function(err, date, filename){ 
		if (err) {
			throw err;
		}
		camera.stop();
		motionDetector.monitor();
		res.write("200");
		res.end();
	});
	if(motionDetector.isMonitoring()) {
		motionDetector.stopMonitoring();
	}
	camera.start();
});

app.listen(server.PORT, function() {
	console.log('Listening on port ' + server.PORT);
});

motionDetector.monitor(function(){
	camera.configureFor("video");
	camera.start();
});