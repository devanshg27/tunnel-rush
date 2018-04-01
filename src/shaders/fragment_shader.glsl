varying highp vec2 vTextureCoord;
uniform highp float vColor;
uniform highp float vFlash;
uniform sampler2D uSampler;
uniform int grFlag;
void main(void) {
	gl_FragColor = texture2D(uSampler, vTextureCoord) * vFlash;
	if(grFlag!=0) {
		lowp float gray = (0.2*gl_FragColor.r+0.7*gl_FragColor.g+0.07*gl_FragColor.b);
		gl_FragColor = vec4(gray, gray, gray, 1.0);
	}
}