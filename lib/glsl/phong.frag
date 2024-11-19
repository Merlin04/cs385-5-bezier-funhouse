//
// fs-phong.c
//
// Reed College CSCI 385 Computer Graphics Speing 2022
//
// Fragment shader that performs a variant of Phong shading.
//
// It is fed position, material color, and normal info from the vertex shader.
// It is also fed the following uniform information from the WebGL program:
//  * The color of the ambient light.
//  * Characteristics of a single light source (LIGHT0), namely:
//    + its color
//    + its position
//    + whether (the specular component of) that light is on/off
//  * The reflectance characteristics of the matrial, namely:
//    + how much of it is diffuse
//    + how much of it is specular
//    + how shiny the surface is ("shininess" as employed by the Phong model)
// It uses all this info to calculate the fragment color at its surface point.
//

precision highp float;

varying vec4 position;   // Fragment's surface position.
varying vec4 normal;     // Fragment's surface normal.
varying vec4 material;   // Fragment surface's material color.

varying vec4 place;

uniform int  uLight0Enabled;  // Is the light on?
uniform vec4 uLight0Position; // Location of the light.
uniform vec4 uLight0Color;    // Light color.

uniform vec4 uAmbientColor;    // Ambient light of environment.

uniform float uMaterialDiffuse;   // Portion of reflection that's diffuse.
uniform float uMaterialSpecular;  // Portion of reflection that's specular.
uniform float uMaterialShininess; // Specular highlight control.

void main() {

    vec4 light_color         = uLight0Color;
    vec4 ambient_light_color = uAmbientColor;

    float diffuse_amount  = uMaterialDiffuse;
    float specular_amount = uMaterialSpecular;
    float shininess       = uMaterialShininess;

    vec4 light = uLight0Position;
    vec4 eye   = vec4(0.0,0.0,10.0,1.0);

    vec4  l = normalize(light - position);
    vec4  e = normalize(eye - position);
    vec4  n = normalize(normal);
    vec4  r = normalize(-l + 2.0 * dot(l,n) * n);
    float p = pow(max(dot(e,r),0.0),shininess);

    vec4 ambient  = ambient_light_color * material;
    vec4 diffuse  = diffuse_amount * light_color * material * max(dot(l,n), 0.0);
    vec4 specular = specular_amount * light_color * p * max(dot(l,n), 0.0);

    if (dot(l,n) > 0.0) {
        if (uLight0Enabled == 1) {
            gl_FragColor = ambient + diffuse + specular;
        } else {
            gl_FragColor = ambient + diffuse;
        }
    } else {
        gl_FragColor = ambient;
    }
}