//
// room-funhouse.js
//
// Author: Jim Fix
// CSCI 385: Computer Graphics, Reed College, Spring 2022
//
// Editor that allows its user to construct a scene consisting of some
// spheres and a mirrored surface. It renders a 3D view of the scene
// using hardware-accelerated ray tracing.
//

import {
    gl,
    GL_COLOR_BUFFER_BIT,
    GL_DEPTH_BUFFER_BIT,
    GL_DEPTH_TEST,
    GL_LIGHT0,
    GL_LIGHTING,
    GL_MODELVIEW,
    GL_POSITION,
    GL_PROJECTION,
    GL_SCISSOR_TEST,
    glBeginEnd,
    glClear,
    glClearColor,
    glColor3f,
    glDisable,
    glEnable,
    glFlush,
    glLightfv,
    glLoadIdentity,
    glMatrixMode,
    glOrtho,
    glPopMatrix,
    glPushMatrix,
    glRun,
    glScalef,
    glScissor,
    glTranslatef,
    GLUT_DEPTH,
    GLUT_DOWN,
    GLUT_LEFT_BUTTON,
    GLUT_MIDDLE_BUTTON,
    GLUT_RGB,
    GLUT_SINGLE,
    GLUT_UP,
    glutCreateWindow,
    glutDisplayFunc,
    glutInitDisplayMode,
    glutInitWindowPosition,
    glutInitWindowSize,
    glutKeyboardFunc,
    glutMainLoop,
    glutMotionFunc,
    glutMouseFunc,
    glutPassiveMotionFunc,
    glutPostRedisplay,
    glViewport,
    KeyboardFunc,
    loadShaderProgram,
    MotionFunc,
    MouseFunc
} from "./lib/legacy-opengl";
import { Point3d, Vector3d } from "./lib/geometry-3d";
import { Curve } from "./curve";
import { Sphere } from "./lib/sphere";
import vs_trace from "./glsl/trace.vert";
import fs_trace from "./glsl/trace.frag";
import {
    makePath,
    makeSphere,
    makeSphereWireframe,
    makeSquare
} from "./lib/objects";
import { mouseToSceneCoords } from "./lib/utils";
import {
    EDITING_THRESHOLD,
    EditMode,
    EYE_POSITION,
    gFLOOR_COLOR0,
    gFLOOR_COLOR1,
    gHeight,
    gSceneBounds,
    gSPHERE_SELECT_COLOR,
    gWidth,
    INTO_DIRECTION,
    LIGHT_COLOR,
    LIGHT_POSITION,
    RIGHT_DIRECTION,
    UP_DIRECTION
} from "./constants";

let gTraceShader: {
    program: WebGLProgram;
    cornersBuffer: WebGLBuffer;
    corners: GLint;
    lightColor: WebGLUniformLocation;
    lightPosition: WebGLUniformLocation;
    eyePosition: WebGLUniformLocation;
    intoDirection: WebGLUniformLocation;
    rightDirection: WebGLUniformLocation;
    upDirection: WebGLUniformLocation;
    curvedMirror: WebGLUniformLocation;
    sphereData: WebGLUniformLocation;
    numSpheres: WebGLUniformLocation;
    controlPoints: WebGLUniformLocation;
} = null!;

// Support for the sphere material library.
//
const INITIAL_COLOR_NAME = "adriatic"; // Starting color for a placed sphere.
//
const gColorLibrary = new Map();
gColorLibrary.set("adriatic", { r: 0.125, g: 0.25, b: 0.375 });
gColorLibrary.set("travertine", { r: 0.6, g: 0.57, b: 0.52 });
gColorLibrary.set("jade", { r: 0.18, g: 0.38, b: 0.27 });
gColorLibrary.set("amethyst", { r: 0.4, g: 0.3, b: 0.5 });
gColorLibrary.set("fireball", { r: 0.55, g: 0.2, b: 0.22 });
//
let gNextColor = gColorLibrary.get(INITIAL_COLOR_NAME);

function chooseColor(colorName: string) {
    gNextColor = gColorLibrary.get(colorName);
}

//
// Controls which type of mirror gets used.
//
let gCurved = 0; // Spherical mirror (1); curved funhouse mirror (0).

function sphericalMirror(makeSpherical: boolean) {
    //
    // Controls whether the display uses a spherical, or curved
    // funhouse, mirror.
    //
    gCurved = makeSpherical ? 0 : 1;
}

// globals

const gCPs: [Point3d, Point3d, Point3d] = [
    new Point3d(-0.75, 0.2, 0.0),
    new Point3d(-0.5, 0.75, 0.0),
    new Point3d(0.5, 1.25, 0.0)
];
const gCurve = new Curve(gCPs);
const gSpheres = [
    new Sphere({ r: 0.9, g: 0.9, b: 0.9 }, new Point3d(0.0, 1.0, 0.0))
];
let gEditMode: EditMode = EditMode.EDITING_NOTHING;
let gEditing: Sphere | null = null;
let gWhichCP = -1;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

   SUPPORT FOR SPHERE AND CURVE PLACEMENT

   The code below is used for placing spheres in the scene.

   ---

   Placement editing by mouse events:

   * Mouse clicks either select a nearby object or place a new clone
   from the object library.  Subsequent dragging motion can be used to
   resize and reorient the object until the mouse is released, but
   this behavior only gets engaged if the drag extends a certain
   radius from the initial click.

   * A quick click (with no significant drag) instead puts the
   program in "object placement" mode, where the user can instead
   place the object somewhere else. A subsequent click drops
   the object in that spot.

*/

function removeSelectedSphere() {
    /*
     * Removes the current sphere placement from the scene.
     */

    //
    // Scan the placements, remove the one that's selected.
    for (let index = 1; index < gSpheres.length; index++) {
        if (gSpheres[index] == gEditing) {
            gSpheres.splice(index, 1);
            // No placement is selected as a result.
            gEditing = null;
            gEditMode = EditMode.EDITING_NOTHING;
            return;
        }
    }
}

function selectOrCreateSphere(mouseXY: { x: number; y: number }) {
    /*
     * Chooses which placement the user wants to edit, given a
     * location of the mouse pointer.
     */

    let click = new Point3d(mouseXY.x, mouseXY.y, 0.0);

    //
    // See if we clicked on some sphere.
    let selected = null;
    for (let sphere of gSpheres) {
        if (sphere.includes(click)) {
            selected = sphere;
        }
    }

    //
    // If not, make a new sphere at that place.
    if (selected == null) {
        selected = new Sphere(gNextColor, click);
        gSpheres.push(selected);
    }

    //
    // Return selected or created sphere.
    return selected;
}

function handlePlaceSphere(
    mouseXY: { x: number; y: number },
    down: boolean,
    drag: boolean
) {
    /*
     * Handles a mouse click with the button pressed down or released,
     * and also a mouse drag with the button pressed or not, and
     * whenever the mouse movement should be interpreted for placing
     * spheres in the scene.
     *
     * When the mouse is first clicked, either a new sphere gets
     * placed in the scene, or else a nearby one is selected. This
     * puts the GUI in EDITING_SPHERE mode. If this is followed by a
     * dragging of the mouse, then this code checks to see whether the
     * movement extends beyond a certain radius. If so, it enters
     * EDITING_SPHERE_SIZE mode to resize it.  If not, and the mouse
     * button is released, it enters EDITING_SPHERE_POSITION mode so
     * it can be moved around. A later click in this mode places it
     * and de-selects it.
     *
     */

    const mouseLocation = new Point3d(mouseXY.x, mouseXY.y, 0.0);

    if (down && !drag) {
        //
        // Just clicked the mouse button...
        //

        if (gEditMode == EditMode.EDITING_SPHERE) {
            //
            // Relocate then deselect.
            gEditing!.moveTo(mouseLocation, gSceneBounds);
            //
            gEditing = null;
            gEditMode = EditMode.EDITING_NOTHING;

            //
            glutPostRedisplay();
        } else if (gEditMode == EditMode.EDITING_SPHERE_SIZE) {
            gEditing = null;
            gEditMode = EditMode.EDITING_NOTHING;

            //
            glutPostRedisplay();
        } else if (gEditMode == EditMode.EDITING_SPHERE_POSITION) {
            //
            // Relocate then deselect.
            gEditing!.moveTo(mouseLocation, gSceneBounds);
            //
            gEditing = null;
            gEditMode = EditMode.EDITING_NOTHING;

            //
            glutPostRedisplay();
        } else if (gEditMode == EditMode.EDITING_NOTHING) {
            //
            // Create or select a sphere.
            gEditing = selectOrCreateSphere(mouseLocation);
            gEditMode = EditMode.EDITING_SPHERE;
            //
            glutPostRedisplay();
        }
    } else if (!down && !drag) {
        //
        // Just released the mouse button...
        //

        if (gEditMode == EditMode.EDITING_SPHERE) {
            //
            // Haven't started resizing, so put in relocate mode.
            gEditMode = EditMode.EDITING_SPHERE_POSITION;
        } else {
            //
            // Done resizing, deselect.
            gEditing = null;
            gEditMode = EditMode.EDITING_NOTHING;
            //
            glutPostRedisplay();
        }
    } else if (down && drag) {
        // Dragging the mouse (with mouse button pressed)...
        //
        if (gEditMode == EditMode.EDITING_SPHERE) {
            //
            // Check if we should start resizing.
            const position = gEditing!.position;
            const distance = position.dist(mouseLocation);
            const radius = gEditing!.radius;
            if (distance > EDITING_THRESHOLD * radius) {
                gEditMode = EditMode.EDITING_SPHERE_SIZE;
            }
        }

        //
        // Resize the selected clone.
        if (gEditMode == EditMode.EDITING_SPHERE_SIZE) {
            const center = gEditing!.position;
            const distance = center.dist(mouseLocation);
            gEditing!.resize(distance, gSceneBounds);
            //
            glutPostRedisplay();
        }
    } else if (!down && drag) {
        // Moving the mouse (with mouse button released)...
        //
        if (gEditMode == EditMode.EDITING_SPHERE_POSITION) {
            //
            // Move the selected clone.
            gEditing!.moveTo(mouseLocation, gSceneBounds);
            //
            glutPostRedisplay();
        }
    }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

   MOUSE HANDLERS

*/

const handleMouseClick: MouseFunc = (button, state, x, y) => {
    /*
     * Records the location of a mouse click in object world coordinates.
     */

    const mouseXY = mouseToSceneCoords(x, y);

    //
    // Start tracking mouse for drags.
    if (state == GLUT_DOWN && button == GLUT_LEFT_BUTTON) {
        //
        // Handle dragging of an object within the scene.
        handlePlaceSphere(mouseXY, true, false);
    } else if (state == GLUT_UP && gEditMode >= EditMode.EDITING_SPHERE) {
        //
        // A quick click starts placement of an object.
        handlePlaceSphere(mouseXY, false, false);
    } else if (
        gEditMode == EditMode.EDITING_NOTHING &&
        state == GLUT_DOWN &&
        button == GLUT_MIDDLE_BUTTON
    ) {
        const click = new Point3d(mouseXY.x, mouseXY.y, 0.0);
        gWhichCP = gCurve.chooseControlPoint(click);
        if (gWhichCP >= 0) {
            gEditMode = EditMode.EDITING_CONTROL_POINT;
            gCPs[gWhichCP] = click;
            gCurve.update();
        }
    } else if (
        gEditMode == EditMode.EDITING_CONTROL_POINT &&
        state == GLUT_UP &&
        button == GLUT_MIDDLE_BUTTON
    ) {
        gCPs[gWhichCP] = new Point3d(mouseXY.x, mouseXY.y, 0.0);
        gCurve.update();
        gEditMode = EditMode.EDITING_NOTHING;
    }
};

const handleMouseDrag: MotionFunc = (x, y) => {
    /*
     * Handle the mouse movement resulting from a drag.
     */
    const mouseXY = mouseToSceneCoords(x, y);
    if (gEditMode >= EditMode.EDITING_SPHERE) {
        //
        // Moving a selected object's placement...
        handlePlaceSphere(mouseXY, true, true);
    } else if (gEditMode == EditMode.EDITING_CONTROL_POINT) {
        gCPs[gWhichCP] = new Point3d(mouseXY.x, mouseXY.y, 0.0);
        gCurve.update();
    }
};

const handleMouseMove: MotionFunc = (x, y) => {
    /*
     * Handle the mouse movement with the mouse button not pressed.
     */
    const mouseXY = mouseToSceneCoords(x, y);

    if (gEditMode >= EditMode.EDITING_SPHERE) {
        //
        // Only handle if placing a selected object.
        handlePlaceSphere(mouseXY, false, true);
    }
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

   SCENE TOP PREVIEW

   The functions below render the editable scene from above.

*/

function drawScene() {
    /*
     * Renders all the placed objects within the WebGL/opengl context.
     *
     * Uses Phong shading (set by GL_LIGHTING) illuminated by a single
     * light, GL_LIGHT0.
     *
     */

    //
    // Turn on lighting.
    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glLightfv(GL_LIGHT0, GL_POSITION, [
        LIGHT_POSITION.x,
        LIGHT_POSITION.z,
        LIGHT_POSITION.y
    ]);

    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            glPushMatrix();
            glTranslatef(-1.0 + r * 0.4 + 0.2, c * 0.4 + 0.2, 0.0);
            glScalef(0.2, 0.2, 0.2);
            if ((r + c) % 2 == 0) {
                glColor3f(gFLOOR_COLOR0.r, gFLOOR_COLOR0.g, gFLOOR_COLOR0.b);
            } else {
                glColor3f(gFLOOR_COLOR1.r, gFLOOR_COLOR1.g, gFLOOR_COLOR1.b);
            }
            glBeginEnd("square");
            glPopMatrix();
        }
    }

    //
    // Draw each sphere, highlighting any selected one.
    for (let sphere of gSpheres) {
        if (sphere != gSpheres[0] || gCurved == 0) {
            sphere.draw(
                sphere == gEditing ? gSPHERE_SELECT_COLOR : null,
                true,
                true
            );
        }
    }

    glDisable(GL_LIGHT0);
    glDisable(GL_LIGHTING);

    if (gCurved == 1) {
        gCurve.draw();
    }
}

function draw() {
    /*
     * Issue GL calls to draw the scene.
     */

    //
    // Clear the rendering information.
    glClearColor(0.2, 0.2, 0.3, 1);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glEnable(GL_DEPTH_TEST);
    //
    // Set up the scene coordinates.
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    glViewport(0, 0, gWidth, gHeight);
    glOrtho(-1, 3, 0.0, 2.0, -10.0, 10.0);

    //
    // Clear the transformation stack.
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    //
    // Draw all the objects in the scene.
    glEnable(GL_SCISSOR_TEST);
    glScissor(0, 0, gWidth - gHeight, gHeight); // Limit the area where it's drawn.
    drawScene();
    glDisable(GL_SCISSOR_TEST);
    glEnable(GL_SCISSOR_TEST);
    glScissor(gHeight, 0, gHeight, gHeight); // Limit the area where it's drawn.
    renderTrace();
    glDisable(GL_SCISSOR_TEST);
    //
    glFlush();
}

function initTrace() {
    const prgm = loadShaderProgram(vs_trace, fs_trace);
    const cbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    const corners = [
        -1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0, 1.0, 0.0, 1.0, -1.0,
        -1.0, 0.0, 1.0, 1.0, -1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0
    ];

    const cornersArray = new Float32Array(corners);
    gl.bufferData(gl.ARRAY_BUFFER, cornersArray, gl.STATIC_DRAW);
    const cornersAttrib = gl.getAttribLocation(prgm, "corner");
    //
    const lightColorUniform = gl.getUniformLocation(prgm, "lightColor");
    const lightPositionUniform = gl.getUniformLocation(prgm, "lightPosition");
    //
    const eyePositionUniform = gl.getUniformLocation(prgm, "eyePosition");
    const intoDirectionUniform = gl.getUniformLocation(prgm, "intoDirection");
    const rightDirectionUniform = gl.getUniformLocation(prgm, "rightDirection");
    const upDirectionUniform = gl.getUniformLocation(prgm, "upDirection");
    //
    const curvedMirrorUniform = gl.getUniformLocation(prgm, "curvedMirror");
    const sphereDataUniform = gl.getUniformLocation(prgm, "sphereData");
    const numSpheresUniform = gl.getUniformLocation(prgm, "numSpheres");
    //
    const controlPointsUniform = gl.getUniformLocation(prgm, "controlPoints");
    //
    gTraceShader = {
        program: prgm,
        cornersBuffer: cbuf!,
        //
        corners: cornersAttrib,
        //
        lightColor: lightColorUniform!,
        lightPosition: lightPositionUniform!,
        //
        eyePosition: eyePositionUniform!,
        intoDirection: intoDirectionUniform!,
        rightDirection: rightDirectionUniform!,
        upDirection: upDirectionUniform!,
        //
        curvedMirror: curvedMirrorUniform!,
        sphereData: sphereDataUniform!,
        numSpheres: numSpheresUniform!,
        //
        controlPoints: controlPointsUniform!
    };
}

function renderTrace() {
    gl.useProgram(gTraceShader.program);
    //
    gl.bindBuffer(gl.ARRAY_BUFFER, gTraceShader.cornersBuffer);
    gl.vertexAttribPointer(gTraceShader.corners, 4, gl.FLOAT, false, 0, 0);
    //
    const lightColor = [LIGHT_COLOR.r, LIGHT_COLOR.g, LIGHT_COLOR.b];
    gl.uniform3fv(gTraceShader.lightColor, lightColor);
    const lightPosition = [
        LIGHT_POSITION.x,
        LIGHT_POSITION.y,
        LIGHT_POSITION.z,
        1.0
    ];
    gl.uniform4fv(gTraceShader.lightPosition, lightPosition);
    //
    const eyePosition = [EYE_POSITION.x, EYE_POSITION.y, EYE_POSITION.z, 1.0];
    gl.uniform4fv(gTraceShader.eyePosition, eyePosition);
    const intoDirection = [
        INTO_DIRECTION.dx,
        INTO_DIRECTION.dy,
        INTO_DIRECTION.dz,
        0.0
    ];
    gl.uniform4fv(gTraceShader.intoDirection, intoDirection);
    const rightDirection = [
        RIGHT_DIRECTION.dx,
        RIGHT_DIRECTION.dy,
        RIGHT_DIRECTION.dz,
        0.0
    ];
    gl.uniform4fv(gTraceShader.rightDirection, rightDirection);
    const upDirection = [
        UP_DIRECTION.dx,
        UP_DIRECTION.dy,
        UP_DIRECTION.dz,
        0.0
    ];
    gl.uniform4fv(gTraceShader.upDirection, upDirection);
    //
    gl.uniform1i(gTraceShader.curvedMirror, gCurved);
    //
    const spheres = [];
    let index = 0;
    for (let sphere of gSpheres) {
        spheres.push(sphere.position.x);
        spheres.push(sphere.radius);
        spheres.push(sphere.position.y);
        spheres.push(sphere.radius);
        spheres.push(sphere.color.r);
        spheres.push(sphere.color.g);
        spheres.push(sphere.color.b);
        index++;
    }
    if (gSpheres.length > 0) {
        gl.uniform1fv(gTraceShader.sphereData, spheres);
    }
    gl.uniform1i(gTraceShader.numSpheres, gSpheres.length);
    //
    const controls = [
        gCPs[0].x,
        gCPs[0].y,
        gCPs[1].x,
        gCPs[1].y,
        gCPs[2].x,
        gCPs[2].y
    ];
    gl.uniform1fv(gTraceShader.controlPoints, controls);
    //
    gl.enableVertexAttribArray(gTraceShader.corners);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.disableVertexAttribArray(gTraceShader.corners);
}

const handleKey: KeyboardFunc = (key, _x, _y) => {
    const delta = 0.05;
    /*
     * Handle a keypress.
     */
    // Move the light/
    if (key == "i" && LIGHT_POSITION.y < 2.0 - delta) {
        LIGHT_POSITION.y += delta;
    }
    if (key == "k" && LIGHT_POSITION.y > delta) {
        LIGHT_POSITION.y -= delta;
    }
    if (key == "j" && LIGHT_POSITION.x > -1.0 + delta) {
        LIGHT_POSITION.x -= delta;
    }
    if (key == "l" && LIGHT_POSITION.x < 1.0 - delta) {
        LIGHT_POSITION.x += delta;
    }
    if (key == "a" && LIGHT_POSITION.z < 2.0 - delta) {
        LIGHT_POSITION.z += delta;
    }
    if (key == "z" && LIGHT_POSITION.z > delta) {
        LIGHT_POSITION.z -= delta;
    }

    //
    // Delete the selected object.
    if (key == "x") {
        if (gEditMode >= EditMode.EDITING_SPHERE) {
            // Delete selected object placement.
            removeSelectedSphere();
        }
    }

    glutPostRedisplay();
};

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   THE MAIN PROGRAM
*/
function editor() {
    /*
     * The main procedure, sets up OPENGL and loads the object library.
     */

    // set up GL/UT, its canvas, and other components.
    glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowPosition(0, 0);
    glutInitWindowSize(gWidth, gHeight);
    glutCreateWindow("the dream of the 80s is alive in Portland");

    // Drawn objects.
    makeSphere();
    makeSphereWireframe();
    makePath();
    makeSquare();

    // Rendered scene.
    initTrace();

    // Register interaction callbacks.
    glutKeyboardFunc(handleKey);
    glutDisplayFunc(draw);
    glutMouseFunc(handleMouseClick);
    glutMotionFunc(handleMouseDrag);
    glutPassiveMotionFunc(handleMouseMove);

    // Go!
    glutMainLoop();

    return 0;
}

[...document.getElementById("colors")!.children].forEach((el) => {
    el.addEventListener("click", () =>
        chooseColor((el as HTMLElement).dataset.color!)
    );
});

const mirrorSelect = document.getElementById("mirror-select")!;
mirrorSelect.addEventListener("click", () => {
    const status = mirrorSelect.innerText;
    if (status === "sphere -> bezier") {
        mirrorSelect.innerText = "bezier -> sphere";
        sphericalMirror(false);
    } else {
        mirrorSelect.innerText = "sphere -> bezier";
        sphericalMirror(true);
    }
});

// noinspection JSIgnoredPromiseFromCall
glRun(() => {
    editor();
}, true);
