/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   GUI OBJECT DEFINTIONS FOR OPENGL
*/

import {
    GL_LINES,
    GL_TRIANGLES,
    glBegin,
    glEnd,
    glVertex3f
} from "../lib/legacy-opengl";

export function makeSquare() {
    glBegin(GL_TRIANGLES, "square");
    //
    glVertex3f(-1.0, -1.0, 0.0);
    glVertex3f(1.0, -1.0, 0.0);
    glVertex3f(1.0, 1.0, 0.0);
    //
    glVertex3f(-1.0, -1.0, 0.0);
    glVertex3f(1.0, 1.0, 0.0);
    glVertex3f(-1.0, 1.0, 0.0);
    //
    glEnd();
}

export function makeSphereWireframe() {
    const numSides = 24;
    const dangle = Math.PI / numSides;
    glBegin(GL_LINES, "sphere-wireframe");
    for (let i = 1; i < numSides; i++) {
        const angle0_ = (i - 1) * dangle;
        const angle1_ = i * dangle;
        const r0 = Math.cos(angle0_);
        const r1 = Math.cos(angle1_);
        for (let j = 1; j <= numSides * 2; j++) {
            const angle_0 = (j - 1) * dangle;
            const angle_1 = j * dangle;
            //
            glVertex3f(
                r0 * Math.cos(angle_0),
                r0 * Math.sin(angle_0),
                Math.sin(angle0_)
            );
            glVertex3f(
                r0 * Math.cos(angle_1),
                r0 * Math.sin(angle_1),
                Math.sin(angle0_)
            );
            glVertex3f(
                r1 * Math.cos(angle_1),
                r1 * Math.sin(angle_1),
                Math.sin(angle1_)
            );
            glVertex3f(
                r1 * Math.cos(angle_0),
                r1 * Math.sin(angle_0),
                Math.sin(angle1_)
            );
        }
    }
    glEnd();
}

export function makeSphere() {
    const numSides = 24;
    const dangle = Math.PI / numSides;
    glBegin(GL_TRIANGLES, "sphere");
    for (let i = 1; i < numSides; i++) {
        const angle0_ = (i - 1) * dangle;
        const angle1_ = i * dangle;
        const r0 = Math.sin(angle0_);
        const r1 = Math.sin(angle1_);
        for (let j = 1; j <= numSides * 2; j++) {
            const angle_0 = (j - 1) * dangle;
            const angle_1 = j * dangle;
            //
            glVertex3f(
                r0 * Math.cos(angle_0),
                r0 * Math.sin(angle_0),
                Math.cos(angle0_)
            );
            glVertex3f(
                r0 * Math.cos(angle_1),
                r0 * Math.sin(angle_1),
                Math.cos(angle0_)
            );
            glVertex3f(
                r1 * Math.cos(angle_1),
                r1 * Math.sin(angle_1),
                Math.cos(angle1_)
            );
            //
            glVertex3f(
                r0 * Math.cos(angle_0),
                r0 * Math.sin(angle_0),
                Math.cos(angle0_)
            );
            glVertex3f(
                r1 * Math.cos(angle_1),
                r1 * Math.sin(angle_1),
                Math.cos(angle1_)
            );
            glVertex3f(
                r1 * Math.cos(angle_0),
                r1 * Math.sin(angle_0),
                Math.cos(angle1_)
            );
        }
    }
    glEnd();
}

export function makePath() {
    const numSides = 8;
    const dangle = (2.0 * Math.PI) / numSides;
    glBegin(GL_LINES, "path");
    let angle = 0.0;
    for (let i = 0; i < numSides; i++) {
        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 0.0);
        glVertex3f(Math.cos(angle), Math.sin(angle), 1.0);
        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 0.0);
        glVertex3f(Math.cos(angle + dangle), Math.sin(angle + dangle), 0.0);
        //
        glVertex3f(Math.cos(angle), Math.sin(angle), 1.0);
        glVertex3f(Math.cos(angle + dangle), Math.sin(angle + dangle), 1.0);
        //
        angle += dangle;
    }
    glEnd();
}