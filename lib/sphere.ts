import { Point3d } from "./geometry-3d";
import {
    GL_LIGHT0,
    GL_LIGHTING,
    glBeginEnd,
    glColor3f,
    glDisable,
    glEnable,
    glPopMatrix,
    glPushMatrix,
    glScalef,
    glTranslatef
} from "./legacy-opengl";
import { Bounds, ColorObj } from "./utils";

const MINIMUM_PLACEMENT_SCALE = 0.1; // Smallest sphere we can place.

/**
 * The placement and sizing of a sphere in the scene.
 */
export class Sphere {
    color: ColorObj;
    position: Point3d;
    radius: number;

    constructor(color: ColorObj, position0: Point3d) {
        //
        // `position`, `radius`: a `point` and number,
        //  representing the location and size of a
        //  sphere placed in the scene.
        //
        this.color = color;
        this.position = position0;
        this.radius = MINIMUM_PLACEMENT_SCALE;
    }

    resize(scale: number, bounds: Bounds) {
        //
        // Resize the sphere.  Some checks prevent growing it beyond
        // the scene bounds.
        //
        scale = Math.max(scale, MINIMUM_PLACEMENT_SCALE);
        scale = Math.min(scale, bounds.right - this.position.x);
        scale = Math.min(scale, bounds.top - this.position.y);
        scale = Math.min(scale, this.position.x - bounds.left);
        scale = Math.min(scale, this.position.y - bounds.bottom);
        this.radius = scale;
    }

    moveTo(position: Point3d, bounds: Bounds) {
        //
        // Relocate the sphere.  Some checks prevent the object from
        // being placed outside the scene bounds.
        //
        position.x = Math.max(position.x, bounds.left + this.radius);
        position.y = Math.max(position.y, bounds.bottom + this.radius);
        position.x = Math.min(position.x, bounds.right - this.radius);
        position.y = Math.min(position.y, bounds.top - this.radius);
        this.position = position;
    }

    includes(queryPoint: Point3d) {
        //
        // Checks whether the `queryPoint` lives within its footprint.
        //
        const distance = this.position.dist2(queryPoint);
        return distance < this.radius * this.radius;
    }

    draw(highlightColor: ColorObj | null, _drawBase: unknown, drawShaded: boolean) {
        //
        // Draws the sphere within the current WebGL/opengl context.
        //
        glPushMatrix();
        glTranslatef(this.position.x, this.position.y, this.position.z);
        glScalef(this.radius, this.radius, this.radius);
        //
        // draw
        if (drawShaded) {
            // Turn on lighting.
            glEnable(GL_LIGHTING);
            glEnable(GL_LIGHT0);
        }
        glColor3f(this.color.r, this.color.g, this.color.b);
        glBeginEnd("sphere");
        if (drawShaded) {
            // Turn on lighting.
            glDisable(GL_LIGHT0);
            glDisable(GL_LIGHTING);
        }

        // draw with highlights
        if (highlightColor != null) {
            glColor3f(highlightColor.r, highlightColor.g, highlightColor.b);
            //
            // Draw its wireframe.
            glBeginEnd("sphere-wireframe");
        }

        glPopMatrix();
    }
}
