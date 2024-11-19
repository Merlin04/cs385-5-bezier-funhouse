//
// geometry-3d.ts
//
// Author: Jim Fix, B Smith
// MATH 385, Reed College, Fall 2024
//
// This defines two classes:
//
//    Point3d:  a class of locations in 3-space
//    Vector3d: a class of offsets between points within 3-space
//
// The two classes are designed based on Chapter 3 of "Coordinate-Free
// Geometric Programming" (UW-CSE TR-89-09-16) by Tony DeRose.
//

import { glNormal3f, glVertex3f } from "./legacy-opengl";

const EPSILON3D = 0.00000001;

// class Point3d
//
// Description of 3-D point objects and their methods.
//
export class Point3d {
    x: number;
    y: number;
    z: number;

    /*
     * Construct a new point instance from its coordinates.
     */
    constructor(_x: number, _y: number, _z: number) {
        this.x = _x;
        this.y = _y;
        this.z = _z;
    }

    /*
     * Return the components as an array.
     */
    components(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    /*
     * Issues a glVertex3f call with the coordinates of this.
     */
    glVertex3fv() {
        glVertex3f(this.x, this.y, this.z);
    }

    /*
     * Computes a point-vector sum, yielding a new point.
     */
    plus(offset: Vector3d) {
        return new Point3d(
            this.x + offset.dx,
            this.y + offset.dy,
            this.z + offset.dz
        );
    }

    /*
     * Computes point-point subtraction, yielding a vector.
     *   or else
     * Computes point-vector subtraction, yielding a point.
     */
    minus<T extends Point3d | Vector3d>(
        other: T
    ): T extends Point3d ? Vector3d : Point3d {
        if (other instanceof Point3d) {
            return new Vector3d(
                this.x - other.x,
                this.y - other.y,
                this.z - other.z
            ) as any;
        } else if (other instanceof Vector3d) {
            return new Point3d(
                this.x - other.dx,
                this.y - other.dy,
                this.z - other.dz
            ) as any;
        } else {
            // return this;
            throw new Error(
                "minus passed other value that is not Point3d or Vector3d"
            );
        }
    }

    /*
     * Computes the squared distance between this and other.
     */
    dist2(other: Point3d) {
        return this.minus(other).norm2();
    }

    /*
     * Computes the distance between this and other.
     */
    dist(other: Point3d) {
        return this.minus(other).norm();
    }

    /*
     * Computes the affine combination of this with other
     * according to
     *
     *       (1-scalar)*this + scalar*other
     */
    combo(scalar: number, other: Point3d) {
        return this.plus(other.minus(this).times(scalar));
    }

    /*
     * Computes the affine combination of this with other.
     */
    combos(scalars: number[], others: Point3d[]) {
        let P: Point3d = this;
        const n = Math.min(scalars.length, others.length);
        for (let i = 0; i < n; i++) {
            P = P.plus(others[i].minus(this).times(scalars[i]));
        }
        return P;
    }

    /*
     * Componentwise maximum of two points' coordinates.
     */
    max(other: Point3d) {
        return new Point3d(
            Math.max(this.x, other.x),
            Math.max(this.y, other.y),
            Math.max(this.z, other.z)
        );
    }

    /*
     * Componentwise minimum of two points' coordinates.
     */
    min(other: Point3d) {
        return new Point3d(
            Math.min(this.x, other.x),
            Math.min(this.y, other.y),
            Math.min(this.z, other.z)
        );
    }

    /*
     * Construct a point from an array.
     */
    static withComponents(cs: [number, number, number]) {
        return new Point3d(...cs);
    }
}

// class Vector3d
//
// Description of 3-D vector objects and their methods.
//
export class Vector3d {
    dx: number;
    dy: number;
    dz: number;

    /*
     * Construct a new vector instance.
     */
    constructor(_dx: number, _dy: number, _dz: number) {
        this.dx = _dx;
        this.dy = _dy;
        this.dz = _dz;
    }

    /*
     * Issues a glVertex3f call with the coordinates of this.
     */
    glNormal3fv() {
        glNormal3f(this.dx, this.dy, this.dz);
    }

    /*
     * This vector's components as a list.
     */
    components(): [number, number, number] {
        return [this.dx, this.dy, this.dz];
    }

    /*
     * Sum of this and other.
     */
    plus(other: Vector3d) {
        return new Vector3d(
            this.dx + other.dx,
            this.dy + other.dy,
            this.dz + other.dz
        );
    }

    /*
     * Vector that results from subtracting other from this.
     */
    minus(other: Vector3d) {
        return this.plus(other.neg());
    }

    /*
     * Same vector as this, but scaled by the given value.
     */
    times(scalar: number) {
        return new Vector3d(
            scalar * this.dx,
            scalar * this.dy,
            scalar * this.dz
        );
    }

    /*
     * Additive inverse of this.
     */
    neg() {
        return this.times(-1.0);
    }

    /*
     * Dot product of this with other.
     */
    dot(other: Vector3d) {
        return this.dx * other.dx + this.dy * other.dy + this.dz * other.dz;
    }

    /*
     * Cross product of this with other.
     */
    cross(other: Vector3d) {
        return new Vector3d(
            this.dy * other.dz - this.dz * other.dy,
            this.dz * other.dx - this.dx * other.dz,
            this.dx * other.dy - this.dy * other.dx
        );
    }

    /*
     * Length of this, squared.
     */
    norm2() {
        return this.dot(this);
    }

    /*
     * Length of this.
     */
    norm() {
        return Math.sqrt(this.norm2());
    }

    /*
     * Unit vector in the same direction as this.
     */
    unit() {
        const n = this.norm();
        if (n < EPSILON3D) {
            return new Vector3d(1.0, 0.0, 0.0);
        } else {
            return this.times(1.0 / n);
        }
    }

    /*
     * Defines v / a as v * 1/a
     */
    div(scalar: number) {
        return this.times(1.0 / scalar);
    }

    /*
     * Construct a vector from an array.
     */
    static withComponents(cs: [number, number, number]) {
        return new Vector3d(...cs);
    }

    /*
     * Construct a random unit vector
     */
    static randomUnit() {
        //
        // This method is adapted from
        //    http://mathworld.wolfram.com/SpherePointPicking.html
        //
        const phi = Math.random() * Math.PI * 2.0;
        const theta = Math.acos(2.0 * Math.random() - 1.0);
        return new Vector3d(
            Math.sin(theta) * Math.cos(phi),
            Math.sin(theta) * Math.sin(phi),
            Math.cos(theta)
        );
    }
}

export function ORIGIN3D() {
    return new Point3d(0.0, 0.0, 0.0);
}
export function X_VECTOR3D() {
    return new Vector3d(1.0, 0.0, 0.0);
}
export function Y_VECTOR3D() {
    return new Vector3d(0.0, 1.0, 0.0);
}
export function Z_VECTOR3D() {
    return new Vector3d(0.0, 0.0, 1.0);
}
