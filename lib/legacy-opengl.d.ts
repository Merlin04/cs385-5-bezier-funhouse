export const gl: WebGLRenderingContext;

export function loadShader(type: GLenum, source: string): WebGLShader;
export function loadShaderProgram(vsSrc: string, fsSrc: string): WebGLProgram;

// Loads resources, calls glInit, then runs your main function
// there's no reason you can't just give an empty main function then do
// `await glRun(...); myMainFunction();` (it doesn't do anything special with it)
export function glRun(
    mainFunction: () => void,
    embedded?: boolean
): Promise<void>;

// initialize internal GL state and add some listeners
export function glInit(): void;
// export function _GLresizeCanvas(): void;
export function glButtonAsKey(key: string): void;

export type KeyboardFunc = (key: string, x: number, y: number) => void;
export function glutKeyboardFunc(keyPressHandler: KeyboardFunc): void;
export function glutDisplayFunc(displayHandler: () => void): void;
export type ReshapeFunc = (x: number, y: number) => void;
export function glutReshapeFunc(reshapeHandler: ReshapeFunc): void;
export type MouseFunc = (b: number, s: number, x: number, y: number) => void;
export function glutMouseFunc(mouseHandler: MouseFunc): void;
// handler for `mousemove` event when mouse is down
export type MotionFunc = (x: number, y: number) => void;
export function glutMotionFunc(motionHandler: MotionFunc): void;
// handler for `mousemove` event when mouse isn't down
export function glutPassiveMotionFunc(passiveMotionHandler: MotionFunc): void;

// request animation frame to run the display callback
export function glutPostRedisplay(): void;

// request animation frame to run your display func in a loop
export function glutMainLoop(): void;

export function glGetFloatv(parameter: GLenum, m: any): void;
export function glGetIntegerv(parameter: GLenum, array: any): void;

// start recording
export function glBegin(
    what: number,
    name: string,
    saveColors?: boolean,
    computeNormals?: boolean
): void;

// push vertex
export function glVertex3f(x: number, y: number, z: number): void;
export function glVertex3fv(p: [number, number, number]): void;

// set normal
export function glNormal3f(dx: number, dy: number, dz: number): void;
export function glNormal3fv(v: [number, number, number]): void;

// set color
export function glColor3f(r: number, g: number, b: number): void;
export function glColor4f(r: number, g: number, b: number, a: number): void;

// stop recording, create normals, make buffers, save, etc
export function glEnd(): void;

// ???
export function glBeginEnd(name: string): void;

// wrapper for gl.clearColor
export function glClearColor(
    r: GLclampf,
    g: GLclampf,
    b: GLclampf,
    a: GLclampf
): void;

// wrapper for gl.clearDepth
export function glClearDepth(amount: GLclampf): void;

// set depth func then pass through to gl.clear
export function glClear(options: GLbitfield): void;

// assert that there is no matrix data still left on the stacks
export function glFlush(): void;

export function glLoadIdentity(): void;

// set matrix mode (when not recording)
export function glMatrixMode(
    mode: typeof GL_PROJECTION | typeof GL_MODELVIEW
): void;

// push the current matrix onto the internal matrix stack
export function glPushMatrix(): void;
// pop from the internal matrix stack onto the current matrix
export function glPopMatrix(): void;

// rotate the current matrix
export function glRotatef(
    angle: number,
    axis_x: number,
    axis_y: number,
    axis_z: number
): void;
// scale the current matrix
export function glScalef(sx: number, sy: number, sz: number): void;
// translate the current matrix
export function glTranslatef(tx: number, ty: number, tz: number): void;
// ortho and multiply (?) the current matrix
export function glOrtho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
): void;
// frustum and multiply (?) the current matrix
export function glFrustum(
    left: number,
    right: number,
    bottom: number,
    top: number,
    near: number,
    far: number
): void;
// perspective and multiply (?) the current matrix
export function gluPerspective(
    fovy: number,
    aspect: number,
    zNear: number,
    zFar: number
): void;

export function gluLookAt(
    eye: { x: number; y: number; z: number },
    center: { x: number; y: number; z: number },
    up: { dx: number; dy: number; dz: number }
): void;

export type Light = typeof GL_LIGHT0 | typeof GL_LIGHT1 | typeof GL_LIGHT2;
// set light parameters
export function glLightfv(
    which: Light,
    what:
        | typeof GL_POSITION
        | typeof GL_DIFFUSE
        | typeof GL_SPECULAR
        | typeof GL_AMBIENT,
    values: [number, number, number, number] | [number, number, number]
): void;

// enable lighting/a light
export function glEnable(mode: typeof GL_LIGHTING | Light): void;
export function glDisable(mode: typeof GL_LIGHTING | Light): void;

// wrapper for gl.blendFunc
export function glBlendFunc(arg1: GLEnum, arg2: GLEnum): void;

// wrapper for gl.viewport
export function glViewport(
    top: GLint,
    left: GLint,
    bottom: GLsizei,
    right: GLsizei
): void;

// wrapper for gl.scissor
export function glScissor(
    x: GLint,
    y: GLint,
    width: GLsizei,
    height: GLsizei
): void;

// noop
export function glutInitDisplayMode(ignored_option_bits: any): void;
// noop
export function glutInitWindowPosition(
    ignored_left: any,
    ignored_top: any
): void;

// creates canvas
export function glutInitWindowSize(w: number, h: number): void;

// show canvas and set html document title, for some reason?
export function glutCreateWindow(title: string): void;

// Unused, but available for compatability.
export const GLUT_SINGLE: 0;
export const GLUT_RGB: 0;
export const GLUT_DEPTH: 0;

// Mouse button constants.
export const GLUT_UP: 0;
export const GLUT_DOWN: 1;
export const GLUT_LEFT_BUTTON: 0;
export const GLUT_MIDDLE_BUTTON: 1;
export const GLUT_RIGHT_BUTTON: 2;

// Alpha blending configuration constants.
// wrappers for gl.*
export const GL_SRC_ALPHA: typeof WebGLRenderingContext.SRC_ALPHA;
export const GL_ONE_MINUS_SRC_ALPHA: typeof WebGLRenderingContext.ONE_MINUS_SRC_ALPHA;

// OpenGL rendering modes. Rely on WebGL analogues.
// wrappers for gl.*
export const GL_BLEND: typeof WebGLRenderingContext.BLEND;
export const GL_CULL_FACE: typeof WebGLRenderingContext.CULL_FACE;
export const GL_DEPTH_TEST: typeof WebGLRenderingContext.DEPTH_TEST;
export const GL_DITHER: typeof WebGLRenderingContext.DITHER;
export const GL_POLYGON_OFFSET_FILL: typeof WebGLRenderingContext.POLYGON_OFFSET_FILL;
export const GL_SAMPLE_ALPHA_TO_COVERAGE: typeof WebGLRenderingContext.SAMPLE_ALPHA_TO_COVERAGE;
export const GL_SAMPLE_COVERAGE: typeof WebGLRenderingContext.SAMPLE_COVERAGE;
export const GL_COLOR_BUFFER_BIT: typeof WebGLRenderingContext.COLOR_BUFFER_BIT;
export const GL_DEPTH_BUFFER_BIT: typeof WebGLRenderingContext.DEPTH_BUFFER_BIT;

// Old OpenGL constants, now defunct in WebGL. Used to
// enable Phong shading and to configure a single light
// in the scene.
export const GL_LIGHTING: 1001; // "What to set this to???" - Jim Fix
export const GL_LIGHT0: 1002;
export const GL_POSITION: 1003;

// Used for the world/canvas transformations.
export const GL_PROJECTION: 0;
export const GL_MODELVIEW: 1;
// wrapper for gl.VIEWPORT
export const GL_VIEWPORT: typeof WebGLRenderingContext.VIEWPORT;
export const GL_PROJECTION_MATRIX: typeof GL_PROJECTION;
export const GL_MODELVIEW_MATRIX: typeof GL_MODELVIEW;

// Different geometric primitives that can be sent to GLSL.
// wrappers for gl.*
export const GL_LINES: typeof WebGLRenderingContext.LINES;
export const GL_TRIANGLES: typeof WebGLRenderingContext.TRIANGLES;
export const GL_TRIANGLE_STRIP: typeof WebGLRenderingContext.TRIANGLE_STRIP;
export const GL_TRIANGLE_FAN: typeof WebGLRenderingContext.TRIANGLE_FAN;
export const GL_SCISSOR_TEST: typeof WebGLRenderingContext.SCISSOR_TEST;
