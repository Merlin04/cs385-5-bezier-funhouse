import { Point3d } from "./lib/geometry-3d";
import {
    glBeginEnd,
    glColor3f,
    glPopMatrix,
    glPushMatrix,
    glRotatef,
    glScalef,
    glTranslatef
} from "./lib/legacy-opengl";
import { gCURVE_COLOR, gPOINT_COLOR } from "./constants";

const MAX_SELECT_DISTANCE = 0.2; // Distance to select a control point.

const SMOOTHNESS = 500.0; // How smooth is our curve approx?
const EPSILON = 0.00000001;

/**
 * Class representing a controllable Bezier quadratic curve in a
 * scene.
 *
 * The control points array passed to the constructor can be
 * edited externally by a client. The client is required to call
 * the `update` method when any control point has been
 * edited. This will trigger a "recompiling" of the points of the
 * polyline used to render the Bezier curve.
 */
export class Curve {
    controlPoints: [Point3d, Point3d, Point3d];
    points: Point3d[];
    compiled: boolean;

    constructor(controlPoints: typeof this.controlPoints) {
        this.controlPoints = controlPoints; // Should be an array of 3 Point3d objects.
        //
        this.points = []; // The samples for the approximation of the curve.
        this.compiled = false; // Has `this.points` been computed?
    }

    // de Casteljau evaluation
    // didn't end up using but don't want to throw away (potentially) good code :)
    #evaluateAt(pos: number) {
        // [p_0, p_1, p_2, ..., p_n-1, p_n] => [[p_0, p_1], [p_1, p_2], ..., [p_n-1, p_n]]
        const pairs = <T>(vals: T[]): [T, T][] => vals.length <= 1 ? [] : Array.from({ length: vals.length - 1 }, (_, i) => [vals[i], vals[i + 1]]);
        // segment to new point
        let c = (seg: [Point3d, Point3d]) => seg[0].combo(pos, seg[1]);
        // recursively evaluate
        let f = (segments: [Point3d, Point3d][]): Point3d =>
            segments.length === 1 ? c(segments[0]) : f(pairs(segments.map(c)));
        return f(pairs(this.controlPoints));
    }

    compile() {
        //
        // Recompiles the polyline that is a smooth sampling of the
        // points on the Bezier curve. These curve points only need
        // to be recompiled if the curve was just created, or if the
        // control points have been moved.
        //
        // The result of this call is a computing of a list of
        // sample points, recorded in `this.points`.
        //

        if (!this.compiled) {
            const [p0, p1, p2] = this.controlPoints;

            const goodEnough = (p1.minus(p0).norm() + p2.minus(p1).norm()) / p2.minus(p0).norm() <= 1 + (1 / SMOOTHNESS);

            if(goodEnough) {
                this.points = this.controlPoints;
            } else {
                const c = (p0: Point3d, p1: Point3d) => p0.combo(0.5, p1);
                const p01 = c(p0, p1);
                const p12 = c(p1, p2);
                const p012 = c(p01, p12);
                const l = new Curve([p0, p01, p012]);
                const r = new Curve([p012, p12, p2]);
                l.compile(); r.compile();
                this.points = [...l.points, ...r.points];
            }

            this.compiled = true;
        }
    }

    update() {
        //
        // Invalidate `this.points` so that it gets recompiled
        // when the curve points need to be used (to draw, e.g.).
        //
        this.compiled = false;
    }

    chooseControlPoint(queryPoint: Point3d) {
        //
        // Returns the integer index (0, 1, or 2) of the closest
        // control point to the given `queryPoint`, or -1 if none
        // are close enough.
        //
        let which = -1;
        let distance2 = MAX_SELECT_DISTANCE * MAX_SELECT_DISTANCE;
        for (let i = 0; i <= 2; i++) {
            const d2 = queryPoint.minus(this.controlPoints[i]).norm2();
            if (d2 < distance2) {
                which = i;
                distance2 = d2;
            }
        }
        return which;
    }

    drawControls() {
        //
        // Renders the three control points of a quadratic
        // Bezier curve.
        //
        for (let i = 0; i <= 2; i++) {
            glPushMatrix();
            glTranslatef(this.controlPoints[i].x, this.controlPoints[i].y, 1.9);
            glScalef(0.02, 0.02, 0.02);
            const gc = gPOINT_COLOR;
            glColor3f(gc.r, gc.g, gc.b);
            glBeginEnd("square");
            glPopMatrix();
        }
    }

    drawCurve() {
        //
        // Renders the polyline specified as the array of points
        // `this.points`. These should give a smooth approximation
        // of the quadratic Bezier, and so as a result this code
        // draws the curve.
        //
        const cc = gCURVE_COLOR;
        for (let index = 1; index < this.points.length; index++) {
            //
            // Compute some info about this segment of the polyline.
            const p0 = this.points[index - 1];
            const p1 = this.points[index];
            const dir = p1.minus(p0).unit();
            const len = p0.dist(p1);
            const ang = (Math.atan2(dir.dy, dir.dx) * 180.0) / Math.PI;

            glPushMatrix();
            //
            // Perform the transformations to render this segment.
            glTranslatef(p0.x, p0.y, 1.5);
            glRotatef(ang, 0.0, 0.0, 1.0);
            glRotatef(90, 0.0, 1.0, 0.0);
            glScalef(0.01, 0.01, len);
            //
            // Render this segment of the curve.
            glColor3f(cc.r, cc.g, cc.b);
            glBeginEnd("path");
            //
            glPopMatrix();
        }
    }

    draw() {
        // Renders the curve control points and the actual
        // curve.
        //
        // If the control points have moved since the last
        // time the curve was drawn, then this recompiles
        // the curve from the control point info.
        //
        this.compile(); // Recomputes this.points.
        this.drawCurve(); // Uses this.points.
        //
        this.drawControls();
    }
}
