varying highp vec2 vTextureCoord;
varying highp vec3 vVertexPos;
uniform highp float vColor;
uniform highp vec3 camPos;
uniform highp float vFlash;
uniform sampler2D uSampler;
uniform int grFlag;
void main(void) {
	gl_FragColor = texture2D(uSampler, vTextureCoord);
	highp float factor = 1.0/clamp(length(camPos - vVertexPos)/7.5, 0.8, 1000.0);
	gl_FragColor = vec4(gl_FragColor.r * factor, gl_FragColor.g * factor, gl_FragColor.b * factor, 1.0);
	gl_FragColor = gl_FragColor * vFlash;
	if(grFlag!=0) {
		lowp float gray = (0.2*gl_FragColor.r+0.7*gl_FragColor.g+0.07*gl_FragColor.b);
		gl_FragColor = vec4(gray, gray, gray, 1.0);
	}
}