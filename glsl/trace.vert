//
// trace-vs.c
//
// Reed College CSCI 385 Computer Graphics Spring 2024
//
// This is a vertex shader that is used for rendering a simple
// ray-traced scene of some spheres and a mirrored object sitting
// in a room.
//
// Most of the ray tracing is performed in its companion fragment shader
// `trace-fs.c`. The code below basically sends info of the four corners
// of a quadrilateral so that they can be used as the virtual screen for
// our ray tracing.
//

attribute vec4 corner;

varying vec2  ray_offset;           // Value in [-1,1]^2 for the ray offset.

uniform vec4  eyePosition;      // Information about the viewer.
uniform vec4  intoDirection;
uniform vec4  rightDirection;
uniform vec4  upDirection;

uniform vec3  lightColor;       // Color of the light.
uniform vec4  lightPosition;    // Position of the light.

uniform int   curvedMirror;     // mirror shape (0 = sphere; 1 = curved)
uniform float sphereData[70];   // Position/size/color of spheres.
uniform int   numSpheres;       // Number of valid spheres in the above. (0-10)

uniform float controlPoints[6]; // Control points of the Beziér mirror.

void main(void) {
    // Place in right half of WebGL viewport coordinates.
    gl_Position = vec4(corner.x+0.5, corner.y*2.0, 0.0, 1.0);

    // Jitter the cast ray by uniform grid of vectors \in [-1,1]^2.
    ray_offset = vec2(corner.x, corner.y);
}