import vertShaderSource from 'shaders/vertex_shader.glsl';
import fragShaderSource from 'shaders/fragment_shader.glsl';

var shaders = require('./shader.js');
var glm = require('gl-matrix');
var tunnelHelper = require('./tunnel.js');
var cubeHelper = require('./cube.js');
var tunnel1, tunnel2;
var obstacle1, placedObstacle = false;
var Score = 0, Level = 1;

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (!gl) {
	alert('Unable to initialize WebGL. Your browser or machine may not support it.');
}
else {
	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const shaderProgram = shaders.initShaderProgram(gl, vertShaderSource, fragShaderSource);

	// Collect all the info needed to use the shader program.
	// Look up which attributes our shader program is using
	// for aVertexPosition, aVevrtexColor and also
	// look up uniform locations.
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
			grFlag: gl.getUniformLocation(shaderProgram, 'grFlag'),
			vFlash: gl.getUniformLocation(shaderProgram, 'vFlash'),
		},
	};

	// Here's where we call the routine that builds all the
	// objects we'll be drawing.

	tunnelHelper.initBuffers(gl);
	cubeHelper.initBuffers(gl);
	tunnel1 = new tunnelHelper.makeTunnel([0, 0, -6], glm.vec3.fromValues(0, 0, -1));
	tunnel2 = new tunnelHelper.makeTunnel(tunnelHelper.getPosition(tunnel1, 90), tunnel1.perDirVector);

	obstacle1 = new cubeHelper.makeCube([0, 0, 100], [0, 1, 0], 0, [7, 1, 1], 0, 0);

	// Draw the scene repeatedly
	var then = 0;
	function render(now) {
		now *= 0.001;  // convert to seconds
		const deltaTime = now - then;
		then = now;

		drawScene(gl, programInfo, deltaTime);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

var cameraPosition = 0, cameraAngle = 0, radius = 3.8, radiusVel = 0, cameraPosSpeed = 30;
var currentlyPressedKeys = {};
//
// Draw the scene.
//
function drawScene(gl, programInfo, deltaTime) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
	gl.clearDepth(1.0);                 // Clear everything
	gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = 90 * Math.PI / 180;   // in radians
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 1000.0;
	const projectionMatrix = glm.mat4.create();
	const tempMatrix = glm.mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	glm.mat4.perspective(projectionMatrix,
									 fieldOfView,
									 aspect,
									 zNear,
									 zFar);

	var curCentre = tunnelHelper.getPosition(tunnel1, cameraPosition);
	var nxtCentre = glm.vec3.create();
	var ForwardDir = glm.vec3.create();
	ForwardDir = tunnelHelper.getForwardDirection(tunnel1, cameraPosition);
	var RadialDir = tunnelHelper.getUpDirection(tunnel1, cameraPosition, cameraAngle);
	var cameraPos = glm.vec3.create();
	glm.vec3.scaleAndAdd(cameraPos, curCentre, RadialDir, radius);
	glm.vec3.add(nxtCentre, cameraPos, ForwardDir);
	glm.mat4.lookAt(tempMatrix, cameraPos, nxtCentre, [curCentre[0] - cameraPos[0], curCentre[1] - cameraPos[1], curCentre[2] - cameraPos[2]]);
	// glm.mat4.lookAt(tempMatrix, [0, 0, 300], [0, 0, -6], [0, 1, 0]);
	glm.mat4.multiply(projectionMatrix, projectionMatrix, tempMatrix);

	gl.useProgram(programInfo.program);

	// Set the shader uniforms

	gl.uniformMatrix4fv(
			programInfo.uniformLocations.projectionMatrix,
			false,
			projectionMatrix);

	if(currentlyPressedKeys[66]) {
		gl.uniform1i(programInfo.uniformLocations.grFlag, 1);
	}
	else {
		gl.uniform1i(programInfo.uniformLocations.grFlag, 0);
	}
	if(60 <= cameraPosition && cameraPosition <= 80) {
		gl.uniform1f(programInfo.uniformLocations.vFlash, 2 - Math.abs((cameraPosition-60))/20);
	}
	else {
		gl.uniform1f(programInfo.uniformLocations.vFlash, 1);
	}

	cubeHelper.draw(gl, programInfo, obstacle1);
	tunnelHelper.draw(gl, programInfo, tunnel1);
	tunnelHelper.draw(gl, programInfo, tunnel2);

	obstacle1.rotation += obstacle1.angularSpeed * deltaTime;
	// Update the rotation for the next draw

	if(cubeHelper.isColliding(cameraPos, curCentre, ForwardDir, obstacle1)) {
		cameraPosSpeed = 0;
	}

	cameraPosition += cameraPosSpeed*deltaTime;
	if(cameraPosition >= 90) {
		var tempDiff = glm.vec3.angle(tunnelHelper.getUpDirection(tunnel1, cameraPosition, cameraAngle), tunnelHelper.getUpDirection(tunnel2, cameraPosition-90, cameraAngle));
		if(glm.vec3.angle(tunnelHelper.getUpDirection(tunnel1, cameraPosition, cameraAngle), tunnelHelper.getUpDirection(tunnel2, cameraPosition-90, cameraAngle - tempDiff)) < glm.vec3.angle(tunnelHelper.getUpDirection(tunnel1, cameraPosition, cameraAngle), tunnelHelper.getUpDirection(tunnel2, cameraPosition-90, cameraAngle + tempDiff))) {
			cameraAngle -= tempDiff;
		}
		else {
			cameraAngle += tempDiff;
		}
		cameraPosition = cameraPosition - 90;
		tunnel1 = tunnel2;
		tunnel2 = new tunnelHelper.makeTunnel(tunnelHelper.getPosition(tunnel1, 90), tunnel1.perDirVector);
		placedObstacle = false;
		Score += 1;
		if(Score == Level * 5) {
			Level += 1;
			if(Level == 5) Level = 4;
		}
	}
	if(!placedObstacle && cameraPosition >= 2) {
		placedObstacle = true;
		obstacle1 = new cubeHelper.makeCube(tunnelHelper.getPosition(tunnel1, 90), tunnel1.perDirVector, Math.floor(Math.random()*Level));
		document.getElementById("info").innerHTML = 'Score: ' + Score + '<br/>Level:' + Level;
	}
	radius += radiusVel;
	radiusVel += 0.02;
	if(radius >= 3.8) radius = 3.8;
	if (cameraPosSpeed > 1 && currentlyPressedKeys[37]) {
		// Left cursor key
		cameraAngle -= -0.02;
    }
    if (cameraPosSpeed > 1 && currentlyPressedKeys[39]) {
		// Right cursor key
		cameraAngle += -0.02;
    }
}

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
	if (event.keyCode == 32 && radius >= 3.8) {
		radiusVel = -0.3;
	}
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}
