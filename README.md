# CSCI 385 Project 5
B Smith and Connor Gilligan

# Step 1: Compiling the Editor Curve 

The editor curve is compiled using de Casteljau's subdivision scheme in `curve.ts`. It recursively calls the `compile` method on the `Curve` class; a `goodEnough` function uses the method described in lecture to determine if segments between the control points are a good enough approximation of the segments of the curve. If this isn't the case, it splits the curve into two (at the middle point, where t=0.5), compiles both halves, then sets the points array to be the concatenation of the respective arrays of the halves.

# Step 2: Ray Tracing a Polygonal Mirror

This is implemented in `./glsl/trace.frag`, with functions:

- `deCasteljau`: perform de Casteljau evaluation for a Bezier curve
- `deCasteljauVec4`: wrapper to return the point in 3D space (with Y set to 0)
- `bezierDerivative`: get the derivative (tangent) of the Bezier curve, given control points and a `t`. We used a section from the online book [A Primer on Bézier curves](https://pomax.github.io/bezierinfo/#pointvectors) as reference for the equation to implement.
- `bezierNormal`: get the tangent of the curve, then rotate it 90 degrees (to get the normal). This also checks to ensure the normal is facing the camera (prevents issues where certain positionings of control points on the X axis causes the mirror to not show up).
- `bezierNormalVec4`: wrapper to return the normal as a vector in 3D space
- `t_is_valid`: checks if a calculated `t` (value from 0 to 1 indicating location of intersection on the curve) is in bounds
- `isect_of_t`: given a `t` value, this ensures it's valid then uses `rayIntersectPlane` to get an `ISect` struct. It uses `deCasteljauVec4` to find the coordinates of the intersection point and provides that as the plane point, and uses `bezierNormalVec4` similarly for the plane normal. It ensures the resulting intersection is within the Y bounds of the mirror, then returns the struct.
- `rayIntersectBezier`: this is the main function doing intersection checking. We use a strategy involving algebraically solving for the intersection points by expressing the equation as a quadratic then using the quadratic formula. We used [this Math Stack Exchange post](https://math.stackexchange.com/a/2350431) as a reference for how to do some of the math (although we had to adapt it a fair bit to get it to work within the context of the larger problem we're trying to solve, with the inputs we were given, with quadratic Bezier curves, with the required output format, etc). Here are the steps it performs:
  - Get the ray line in the form of two points
  - Find that line's standard form coefficients, and use them to get the line in vector form
  - Solve for the `a, b, c` coefficients of the Bezier equation rearranged into   the standard form of a quadratic equation, with the ray line's components substituted in ($0=(B_{2}-2B_{1}+B_{0})t^{2}+(2B_{1}-2B_{0})t+(B_{0}-d)$ where $B_{x}=(A\cdot P_{x})$)
  - Evaluate the discriminant of the quadratic formula to determine how many solutions there are to the equation, then for each of them evaluate the solution then call `isect_of_t` to get the ISect struct if it is indeed a valid intersection
  - If there are multiple intersections, use `bestISect` to choose one

# Step 3: Shadows 

# Step 4: Raytracing the Funhouse Mirror 
At this point, no further work was necessary. Since the mirror was calculated algebraically for each ray, the approximation is already smooth. 
