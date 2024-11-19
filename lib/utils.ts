import { mat4, vec4 } from "gl-matrix";
import {
    GL_PROJECTION_MATRIX,
    GL_VIEWPORT,
    glGetFloatv,
    glGetIntegerv
} from "./legacy-opengl";

export type ColorObj = { r: number; g: number; b: number };
export type Bounds = {
    top: number;
    bottom: number;
    left: number;
    right: number;
};

export function mouseToSceneCoords(mousex: number, mousey: number) {
    /*
     * Convert mouse screen coordinates to scene coordinates.
     */

    //
    // A hack to adjust for the corner of the canvas.  There is a
    // javascript way of handling this probably.
    //
    mousex -= 10;
    mousey -= 10;

    //
    // Use the inverse of the GL_PROJECTION matrix to map from screen
    // coordinates to our scene coordinates.
    //
    const pj = mat4.create();
    glGetFloatv(GL_PROJECTION_MATRIX, pj);
    const pj_inv = mat4.create();
    mat4.invert(pj_inv, pj);
    const vp = [0, 0, 0, 0];
    glGetIntegerv(GL_VIEWPORT, vp);
    const mousecoords = vec4.fromValues(
        (2.0 * mousex) / vp[2] - 1.0,
        1.0 - (2.0 * mousey) / vp[3],
        0.0,
        1.0
    );
    //@ts-expect-error
    let location = [];
    //@ts-expect-error
    vec4.transformMat4(location, mousecoords, pj_inv);
    //@ts-expect-error
    return { x: location[0], y: location[1] };
}