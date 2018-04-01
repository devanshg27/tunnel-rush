var glm = require('gl-matrix');
var buffers;

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

	// Create a buffer for the cube's vertex positions.

	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Now create an array of positions for the cube.

	const positions = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,
	];

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Now set up the colors for the faces. We'll use solid colors
	// for each face.

	const faceColors = [
		[1.0,  0.0,  0.0,  1.0],    // Front face: white
		[1.0,  0.0,  0.0,  1.0],    // Back face: red
		[1.0,  0.0,  0.0,  1.0],    // Top face: green
		[1.0,  0.0,  0.0,  1.0],    // Bottom face: blue
		[1.0,  0.0,  0.0,  1.0],    // Right face: yellow
		[1.0,  0.0,  0.0,  1.0],    // Left face: purple
	];

	// Convert the array of colors into a table for all the vertices.

	var colors = [];

	for (var j = 0; j < faceColors.length; ++j) {
		const c = faceColors[j];

		// Repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c, c);
	}

	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	// Build the element array buffer; this specifies the indices
	// into the vertex arrays for each face's vertices.

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

	const indices = [
		0,  1,  2,      0,  2,  3,    // front
		4,  5,  6,      4,  6,  7,    // back
		8,  9,  10,     8,  10, 11,   // top
		12, 13, 14,     12, 14, 15,   // bottom
		16, 17, 18,     16, 18, 19,   // right
		20, 21, 22,     20, 22, 23,   // left
	];

	// Now send the element array to GL

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices), gl.STATIC_DRAW);

	buffers = {
		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer,
	};
}

function draw(gl, programInfo, cubeInfo) {
	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = glm.mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.

	glm.mat4.translate(modelViewMatrix,     // destination matrix
								 modelViewMatrix,     // matrix to translate
								 cubeInfo.position);  // amount to translate

	glm.mat4.rotate(modelViewMatrix,  // destination matrix
							modelViewMatrix,  // matrix to rotate
							cubeInfo.rotation,     // amount to rotate in radians
							cubeInfo.dirVector);       // axis to rotate around (Z)

	glm.mat4.rotate(modelViewMatrix,  // destination matrix
							modelViewMatrix,  // matrix to rotate
							cubeInfo.rotAngle1,     // amount to rotate in radians
							cubeInfo.rotVector1);       // axis to rotate around (Z)

	glm.mat4.rotate(modelViewMatrix,  // destination matrix
							modelViewMatrix,  // matrix to rotate
							cubeInfo.rotAngle2,     // amount to rotate in radians
							cubeInfo.rotVector2);       // axis to rotate around (Z)

	glm.mat4.scale(modelViewMatrix, modelViewMatrix, cubeInfo.scale);

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute
	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
		gl.vertexAttribPointer(
				programInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
		gl.enableVertexAttribArray(
				programInfo.attribLocations.vertexPosition);
	}

	// Tell WebGL how to pull out the colors from the color buffer
	// into the vertexColor attribute.
	{
		const numComponents = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
		gl.vertexAttribPointer(
				programInfo.attribLocations.vertexColor,
				numComponents,
				type,
				normalize,
				stride,
				offset);
		gl.enableVertexAttribArray(
				programInfo.attribLocations.vertexColor);
	}

	// Tell WebGL which indices to use to index the vertices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	// Tell WebGL to use our program when drawing

	gl.uniformMatrix4fv(
			programInfo.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix);

	{
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
}

function makeCube(_position, _dirVector, _rotation, _scale, _angularSpeed) {
    this.position = _position;
    this.rotation = _rotation;
    this.scale = _scale;
    this.angularSpeed = _angularSpeed;
    this.dirVector = _dirVector;

    this.rotVector1 = glm.vec3.fromValues(0, -1, 0);
	this.rotAngle1 = Math.atan2(_dirVector[2], _dirVector[0]) + Math.PI/2;
	if(Math.abs(_dirVector[0]) + Math.abs(_dirVector[2]) < 0.01) {
		this.rotAngle1 = 0;
	}

	this.rotVector2 = glm.vec3.fromValues(-1, 0, 0);
	this.rotAngle2 = Math.acos(_dirVector[1]/glm.vec3.length(_dirVector)) - Math.PI/2;
}

module.exports = {
	initBuffers,
	makeCube,
	draw,
}