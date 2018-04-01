var glm = require('gl-matrix');
var buffers;
const ellipseRatio = 1, bigR = 50;

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

	const positions = new Array(12*8*20);
	const colors = new Array(16*8*20);
	const ang = (90*(Math.PI/180))/20;

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 8; j++) {
			positions[12*(i*8 + j) + 0] = 5*Math.cos((j*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 1] = bigR + (bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * i);
			positions[12*(i*8 + j) + 2] = -(ellipseRatio*bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * i);

			positions[12*(i*8 + j) + 3] = 5*Math.cos(((j+1)*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 4] = bigR + (bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * i);
			positions[12*(i*8 + j) + 5] = -(ellipseRatio*bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * i);

			positions[12*(i*8 + j) + 6] = 5*Math.cos(((j+1)*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 7] = bigR + (bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * (i + 1));
			positions[12*(i*8 + j) + 8] = -(ellipseRatio*bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * (i + 1));

			positions[12*(i*8 + j) + 9] = 5*Math.cos((j*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 10] = bigR + (bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * (i + 1));
			positions[12*(i*8 + j) + 11] = -(ellipseRatio*bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * (i + 1));


			colors[16*(i*8 + j) + 0] = ((i+j)%2);
			colors[16*(i*8 + j) + 1] = ((i+j)%2);
			colors[16*(i*8 + j) + 2] = ((i+j)%2);
			colors[16*(i*8 + j) + 3] = 1.0;

			colors[16*(i*8 + j) + 4] = ((i+j)%2);
			colors[16*(i*8 + j) + 5] = ((i+j)%2);
			colors[16*(i*8 + j) + 6] = ((i+j)%2);
			colors[16*(i*8 + j) + 7] = 1.0;

			colors[16*(i*8 + j) + 8] = ((i+j)%2);
			colors[16*(i*8 + j) + 9] = ((i+j)%2);
			colors[16*(i*8 + j) + 10] = ((i+j)%2);
			colors[16*(i*8 + j) + 11] = 1.0;

			colors[16*(i*8 + j) + 12] = ((i+j)%2);
			colors[16*(i*8 + j) + 13] = ((i+j)%2);
			colors[16*(i*8 + j) + 14] = ((i+j)%2);
			colors[16*(i*8 + j) + 15] = 1.0;
		}
	}

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Now set up the colors for the faces. We'll use solid colors
	// for each face.

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

	var indices = [];

	for (var i = 0; i < positions.length/3; i += 4) {
		indices.push(i+0, i+1, i+2, i+0, i+2, i+3);
	}

	// Now send the element array to GL

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices), gl.STATIC_DRAW);

	buffers = {
		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer,
		length: indices.length,
	};
}

function draw(gl, programInfo, tunnelInfo) {
	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = glm.mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.

	glm.mat4.translate(modelViewMatrix,     // destination matrix
								 modelViewMatrix,     // matrix to translate
								 tunnelInfo.position);  // amount to translate

	glm.mat4.rotate(modelViewMatrix,  // destination matrix
							modelViewMatrix,  // matrix to rotate
							tunnelInfo.rotation,     // amount to rotate in radians
							tunnelInfo.dirVector);       // axis to rotate around (Z)

	glm.mat4.rotate(modelViewMatrix,  // destination matrix
							modelViewMatrix,  // matrix to rotate
							tunnelInfo.rotAngle,     // amount to rotate in radians
							tunnelInfo.rotVector);       // axis to rotate around (Z)

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
		const vertexCount = buffers.length;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
}

function makeTunnel(_position, _dirVector) {
	this.position = _position;
	this.dirVector = _dirVector;
	this.rotation = Math.floor(Math.random()*8) * (Math.PI/4);

	this.rotVector = glm.vec3.create();
	glm.vec3.cross(this.rotVector, [0, 0, -1], _dirVector);
	if(glm.vec3.squaredLength(this.rotVector) < 0.01) {
		this.rotVector = glm.vec3.fromValues(1, 0, 0);
	}
	this.rotAngle = glm.vec3.angle([0, 0, -1], _dirVector);

	const tempRot = glm.mat4.create();
	glm.mat4.identity(tempRot);
	glm.mat4.rotate(tempRot, tempRot, this.rotation, this.dirVector);
	glm.mat4.rotate(tempRot, tempRot, this.rotAngle, this.rotVector);

	this.perDirVector = glm.vec3.fromValues(0, 1, 0);
	glm.vec3.transformMat4(this.perDirVector, this.perDirVector, tempRot);
}

function getPosition(tunnelInfo, ang) {
	var ans = glm.vec3.create();
	glm.vec3.scaleAndAdd(ans, tunnelInfo.position, tunnelInfo.dirVector, bigR*ellipseRatio*Math.sin(Math.PI/180*(ang)));
	glm.vec3.scaleAndAdd(ans, ans, tunnelInfo.perDirVector, bigR-bigR*Math.cos(Math.PI/180*(ang)));
	return ans;
}

module.exports = {
	initBuffers,
	makeTunnel,
	draw,
	getPosition,
}