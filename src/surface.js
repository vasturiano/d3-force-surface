import constant from './constant';

export default function() {
    let nodes,
        surfaces = [],
        elasticity = 1,                         // 0 <= number <= 1
        radius = (node => 1),                   // accessor: number > 0
        from = (surface => surface.from),       // accessor: { x, y }
        to = (surface => surface.to),           // accessor: { x, y }
        oneWay = (surface => !!surface.oneWay), // accessor: boolean
        onImpact;                               // (node, surface) callback

    function force() {
        nodes.forEach(node => {
            const nodeRadius = radius(node),
                velVect = cart2Polar(node.vx, node.vy),
                lineToFuture = {
                    from: {x: node.x, y: node.y},
                    to: {x: node.x + node.vx, y: node.y + node.vy}
                };

            surfaces.forEach(surface => {
                const surfLine = { from: from(surface), to: to(surface) },
                    surfVect = cart2Polar(surfLine.to.x - surfLine.from.x, surfLine.to.y - surfLine.from.y),
                    inReverse = normalizeAngle(surfVect.a - velVect.a) < Math.PI; // true if the node is travelling in a direction of S>N relative to the from(W)>to(E) axis

                if (inReverse && oneWay(surface)) return; // Don't collide in reverse direction

                const nodeLine = translateLn(
                        lineToFuture,
                        polar2Cart(nodeRadius, surfVect.a + Math.PI/2 * (inReverse?-1:1)) // node radius offset facing the surface
                    ),
                    nodeBisect = {
                        from: translatePnt(node, polar2Cart(nodeRadius, surfVect.a - Math.PI/2)),
                        to: translatePnt(node, polar2Cart(nodeRadius, surfVect.a + Math.PI/2))
                    },
                    overlaps = intersect(surfLine, nodeBisect); // Whether the node is already overlapping with the surface

                if (!overlaps && !intersect(surfLine, nodeLine)) return; // No collision

                const velRel = polar2Cart(velVect.d, velVect.a - surfVect.a); // x is the velocity parallel to the surface, y is perpendicular

                // Invert velocity and absorb shock (elasticity) along the surface perpendicular
                velRel.y *= -elasticity;

                // Convert back to original plane
                ({ x: node.vx, y: node.vy } = rotatePnt(velRel, surfVect.a));

                if (overlaps && !oneWay(surface)) {
                    // In two-way mode, need to move node out of the way to prevent trapping
                    const nudgeOffset = polar2Cart(
                        rotatePnt(translatePnt(nodeLine.from, { x: -surfLine.from.x, y: -surfLine.from.y }), - surfVect.a).y, // How much overlap along the surface perpendicular
                        surfVect.a - Math.PI/2   // Backwards from surface, along its perpendicular
                    );

                    node.x += nudgeOffset.x; node.y += nudgeOffset.y;
                }

                onImpact && onImpact(node, surface);
            });
        });

        //

        function intersect(la, lb) {
            // overlap in both dimensions
            return overlap([la.from.x, la.to.x], [lb.from.x, lb.to.x]) &&
                overlap([la.from.y, la.to.y], [lb.from.y, lb.to.y]);

            function overlap(sega, segb) {
                return Math.max(...sega) >= Math.min(...segb) && Math.max(...segb) >= Math.min(...sega);
            }
        }

        function translatePnt({x, y}, {x: trX, y: trY}) {
            return { x: x + trX, y: y + trY };
        }

        function translateLn({from, to}, tr) {
            return { from: translatePnt(from, tr), to: translatePnt(to,tr) };
        }

        function rotatePnt({x, y}, a) {
            const vect = cart2Polar(x, y);
            return polar2Cart(vect.d, vect.a + a);
        }

        function cart2Polar(x, y) {
            x = x||0; // Normalize -0 to 0 to avoid -Infinity issues in atan
            return {
                d: Math.sqrt(x*x + y*y),
                a: (x === 0 && y === 0) ? 0 : Math.atan(y/x) + (x<0 ? Math.PI : 0) // Add PI for coords in 2nd & 3rd quadrants
            }
        }

        function polar2Cart(d, a) {
            return {
                x: d * Math.cos(a),
                y: d * Math.sin(a)
            }
        }

        function normalizeAngle(a) {
            const PI2 = Math.PI*2;
            while (a<0) a += PI2;
            while (a>PI2) a -= PI2;
            return a;
        }
    }

    function initialize() {}

    force.initialize = function(_) {
        nodes = _;
        initialize();
    };

    force.surfaces = function(_) {
        return arguments.length ? (surfaces = _, force) : surfaces;
    };

    force.elasticity = function(_) {
        return arguments.length ? (elasticity = _, force) : elasticity;
    };

    force.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), force) : radius;
    };

    force.from = function(_) {
        return arguments.length ? (from = _, force) : from;
    };

    force.to = function(_) {
        return arguments.length ? (to = _, force) : to;
    };

    force.oneWay = function(_) {
        return arguments.length ? (oneWay = typeof _ === "function" ? _ : constant(!!_), force) : oneWay;
    };

    force.onImpact = function(_) {
        return arguments.length ? (onImpact = _, force) : onImpact;
    };

    return force;
}