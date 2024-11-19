//
// fs-color.c
//
// Reed College CSCI 385 Computer Graphics Speing 2022
//
// Simple fragment shader that gets fed a color from the vertex shader.
// Nothing else is communicated to it from the WebGL program.
//
varying lowp vec4 color;

void main(void) {
    gl_FragColor = color;
}