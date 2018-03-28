import vertShaderSource from 'shaders/vertex_shader.glsl';
import fragShaderSource from 'shaders/fragment_shader.glsl';

var shaders = require('./shader.js');
var glm = require('gl-matrix');
var cubeHelper = require('./cube.js');
var cube1, cube2;

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
			vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		},
	};

	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	cubeHelper.initBuffers(gl);
	cube1 = new cubeHelper.makeCube([0, 0, -6], 0);
	cube2 = new cubeHelper.makeCube([1, 1, -6], 0);

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

var cubeRotation = 0;

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

	const fieldOfView = 45 * Math.PI / 180;   // in radians
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

	glm.mat4.lookAt(tempMatrix, [0, 0, cubeRotation], [0,0,1], [0,1,0]);
	glm.mat4.multiply(projectionMatrix, projectionMatrix, tempMatrix);

	gl.useProgram(programInfo.program);

	// Set the shader uniforms

	gl.uniformMatrix4fv(
			programInfo.uniformLocations.projectionMatrix,
			false,
			projectionMatrix);

	cubeHelper.draw(gl, programInfo, cube1);
	cubeHelper.draw(gl, programInfo, cube2);

	// Update the rotation for the next draw

	cubeRotation += deltaTime;
}