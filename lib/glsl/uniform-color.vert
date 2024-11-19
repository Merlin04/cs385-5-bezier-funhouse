//
// vs-uniform-color.c
//
// Reed College CSCI 385 Computer Graphics Spring 2022
//
// Simple vertex shader that preprocesses per-vertex information for a
// fragment shader. It uses the same color information uniformly for
// all the vertices of the object.
//
// It calculates a position using the supplied vertex positions and the two
// standard WebGL transforation matrices.
//
// It sends the color information to the fragment shader.
//
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uColor;

varying vec4 color;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    color = uColor;
}