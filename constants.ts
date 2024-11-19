//
// Width/height of the canvas in pixels.
//
import { Point3d, Vector3d } from "./lib/geometry-3d";

export const gHeight = 512;
export const gWidth = 1024; // This MUST be double gHeight.
//
//
export const gSceneBounds = {
    //
    left: -1.0,
    right: 1.0,
    //
    bottom: 0.0,
    top: 2.0
};
//
export const gSPHERE_SELECT_COLOR = { r: 0.95, g: 0.9, b: 0.5 }; // Yellow.
export const gCURVE_COLOR = { r: 0.325, g: 0.575, b: 0.675 }; // Chalk blue.
export const gPOINT_COLOR = { r: 0.825, g: 0.475, b: 0.175 }; // Chalk orange.
export const gFLOOR_COLOR0 = { r: 0.125, g: 0.175, b: 0.25 };
export const gFLOOR_COLOR1 = { r: 0.125, g: 0.25, b: 0.175 };
//
export const LIGHT_COLOR = { r: 0.9, g: 0.88, b: 0.84 };
export const LIGHT_POSITION = new Point3d(0.0, 1.0, 0.0);
//
export const EYE_POSITION = new Point3d(0.0, 1.0, -2.0);
export const INTO_DIRECTION = new Vector3d(0.0, 0.0, 1.0);
export const RIGHT_DIRECTION = new Vector3d(1.0, 0.0, 0.0);
export const UP_DIRECTION = new Vector3d(0.0, 1.0, 0.0);
//

export enum EditMode {
    EDITING_NOTHING = 0,
    EDITING_CONTROL_POINT = 1,
    EDITING_VIEW = 2,
    EDITING_SPHERE = 3,
    EDITING_SPHERE_POSITION = 4,
    EDITING_SPHERE_SIZE = 5
}

export const EDITING_THRESHOLD = 1.1;
