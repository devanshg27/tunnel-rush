var glm = require('gl-matrix');
var buffers;

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
								width, height, border, srcFormat, srcType,
								pixel);

	const image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
									srcFormat, srcType, image);

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			 // Yes, it's a power of 2. Generate mips.
			 gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			 // No, it's not a power of 2. Turn of mips and set
			 // wrapping to clamp to edge
			 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
var texture;
function initBuffers(gl) {

	// Create a buffer for the cube's vertex positions.

	const positionBuffer = gl.createBuffer();
	texture = loadTexture(gl, 'assets/wood_texture.jpg');

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

	const texCods = [
		// Front
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Back
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Top
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Bottom
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Right
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Left
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
	];

	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCods), gl.STATIC_DRAW);

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
		textureCoord: textureCoordBuffer,
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

	glm.mat4.translate(modelViewMatrix,     // destination matrix
								 modelViewMatrix,     // matrix to translate
								 [0, cubeInfo.displaced, 0]);  // amount to translate

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

	{
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.textureCoord);
	}

	// Tell WebGL which indices to use to index the vertices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	// Tell WebGL to use our program when drawing

	gl.uniformMatrix4fv(
			programInfo.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix);

	// Tell WebGL we want to affect texture unit 0
	gl.activeTexture(gl.TEXTURE0);

	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Tell the shader we bound the texture to texture unit 0
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

	{
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
}

function makeCube(_position, _dirVector, _type) {

	this.position = _position;

	if(_type == 0) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 1, 1];
		this.angularSpeed = 0;
		this.displaced = 0;
	}
	else if(_type == 1) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 1, 1];
		this.angularSpeed = Math.PI/4;
		this.displaced = 0;
	}
	else if(_type == 2) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 4, 1];
		this.angularSpeed = 0;
		this.displaced = -2 + Math.random() * 4;
	}
	else if(_type == 3) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 4, 1];
		this.angularSpeed = Math.PI/4;
		this.displaced = -2 + Math.random() * 4;
	}

	this.dirVector = _dirVector;

	this.rotVector1 = glm.vec3.fromValues(0, -1, 0);
	this.rotAngle1 = Math.atan2(_dirVector[2], _dirVector[0]) + Math.PI/2;
	if(Math.abs(_dirVector[0]) + Math.abs(_dirVector[2]) < 0.01) {
		this.rotAngle1 = 0;
	}

	this.rotVector2 = glm.vec3.fromValues(-1, 0, 0);
	this.rotAngle2 = Math.acos(_dirVector[1]/glm.vec3.length(_dirVector)) - Math.PI/2;
}

function inBetween(a, b, c) {
	return Math.min(a, b) <= c && Math.max(a, b) >= c;
}

function isColliding(_camPos, _curCentre, _forwardDir, cubeInfo) {
	var tempRot = glm.mat4.create();
	glm.mat4.translate(tempRot,     // destination matrix
								 tempRot,     // matrix to translate
								 cubeInfo.position);  // amount to translate

	glm.mat4.rotate(tempRot,  // destination matrix
							tempRot,  // matrix to rotate
							cubeInfo.rotAngle1,     // amount to rotate in radians
							cubeInfo.rotVector1);       // axis to rotate around (Z)

	glm.mat4.rotate(tempRot,  // destination matrix
							tempRot,  // matrix to rotate
							cubeInfo.rotAngle2,     // amount to rotate in radians
							cubeInfo.rotVector2);       // axis to rotate around (Z)

	glm.mat4.scale(tempRot, tempRot, cubeInfo.scale);
	glm.mat4.translate(tempRot,     // destination matrix
								 tempRot,     // matrix to translate
								 [0, cubeInfo.displaced, 0]);  // amount to translate

	var bottomLeft = glm.vec3.fromValues(-1, -1, -1);
	var topRight = glm.vec3.fromValues(1, 1, 1);
	glm.vec3.transformMat4(bottomLeft, bottomLeft, tempRot);
	glm.vec3.transformMat4(topRight, topRight, tempRot);

	tempRot = glm.mat4.create();
	const tempVec = glm.vec3.create();
	glm.vec3.negate(tempVec, cubeInfo.position);
	glm.mat4.translate(tempRot,     // destination matrix
								 tempRot,     // matrix to translate
								 cubeInfo.position);  // amount to translate

	glm.mat4.rotate(tempRot,  // destination matrix
							tempRot,  // matrix to rotate
							-cubeInfo.rotation,     // amount to rotate in radians
							cubeInfo.dirVector);       // axis to rotate around (Z)

	glm.mat4.translate(tempRot,  // destination matrix
							tempRot,  // matrix to rotate
							tempVec);
	glm.vec3.transformMat4(_camPos, _camPos, tempRot);

	if(inBetween(bottomLeft[0], topRight[0], _camPos[0]) && inBetween(bottomLeft[1], topRight[1], _camPos[1]) && inBetween(bottomLeft[2], topRight[2], _camPos[2])) {
		return true;
	}
	else {
		return false;
	}
}

module.exports = {
	initBuffers,
	makeCube,
	draw,
	isColliding,
}