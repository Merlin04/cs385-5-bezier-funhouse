//
// vs-varying-material.c
//
// Reed College CSCI 385 Computer Graphics Speing 2022
//
// Vertex shader that preprocesses per-vertex information to be fed
// into a Phong fragment shader. It expects the material's color
// information to vary amongst the vertices of the object.
//
// It sends this (interpolated) information to the fragment shader:
// * The position of a fragment of a facet or line object defined by
//   several vertex positions.
// * The normal of that surface.
// * The color of the material.
//
// It is fed per-vertex information with attributes for:
// * vertex position
// * surface normal at that vertex
// * material color at that vertex
//
attribute vec4 aVertexPosition;   // Corner of some facet of the surface.
attribute vec4 aVertexNormal;     // Surface normal at that position.
attribute vec4 aVertexMaterial;   // Color of material at that position.

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec4 position;   // Fragment's surface position.
varying vec4 normal;     // Fragment's surface normal.
varying vec4 material;   // Fragment surface's material color.
varying vec4 place;

void main() {

    // Transform and interpolate vertex information.
    position   = uModelViewMatrix * aVertexPosition;
    normal     = uModelViewMatrix * aVertexNormal;
    material   = aVertexMaterial;

    // The output required by GLSL.
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    place = gl_Position;

}