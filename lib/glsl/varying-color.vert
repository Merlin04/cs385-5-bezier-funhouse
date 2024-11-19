//
// vs-varying-color.c
//
// Reed College CSCI 385 Computer Graphics Speing 2022
//
// Simple vertex shader that preprocesses per-vertex information for a
// fragment shader. It expects the color information to vary amongst
// the vertices of the object.
//
// It calculates a position using the supplied vertex positions and the two
// standard WebGL transforation matrices.
//
// It sends the (interpolated) color information to the fragment shader.
//
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 color;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    color = aVertexColor;
}