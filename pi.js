var RaspiCam = require("raspicam");
var express = require('express');
console.log("Initializing Express");
var app = express();
console.log("Initializing RaspiCam");
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

function monitor() {
	console.log("Start monitoring");
	var motionDetection = require('child_process').spawn(
		'python',
		// second argument is array of parameters, e.g.:
		["/home/pi/RaspberryCamera/app/scripts/picam.py"]
	);
	console.log("Child process created");
	motionDetection.stdout.on('data', function(data){
		console.log("From Node.js: " + data);
		camera.configureFor("video");
		camera.start();
	});
	motionDetection.on('close', function (code) { 
		console.log("From Node.js, on close: " + code);
	});
	motionDetection.stderr.on('data', function (data) {
		console.log('From Node stderr: ' + data);
	});
}

app.get('/photo', function(req, res){
	camera.configureFor("photo");
	//listen for the "read" event triggered when each new photo/video is saved
	camera.on("read", function(err, filename){ 
		if (err) {
			throw err;
		}
		camera.stop();
		res.write("200");
		res.end();
	});
	camera.start();
});

app.get('/video', function(req, res){
	camera.configureFor("video");
	//listen for the "read" event triggered when each new photo/video is saved
	camera.on("exit", function(err, filename){ 
		if (err) {
			throw err;
		}
		camera.stop();
		res.write("200");
		res.end();
	});
	camera.start();
});

app.listen(server.PORT, function() {
	console.log('Listening on port ' + server.PORT);
});
monitor();