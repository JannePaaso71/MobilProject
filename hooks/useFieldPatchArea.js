import {useEffect, useState} from "react";
import {area, points, error} from "../signals/fieldPatchAreaSignals"

/**
 * Prior to entering
 *
 * @type {pushPoint} ({longitude, latitude}) => {}
 * @type {popPoint} () => point
 * @type {point} {longitude: number, latitude: number, ordinal: integer}
 * @type {area} {ha: number, sqm: number, numVertices: number}
 * @type {error} string
 * @return {pushPoint, popPoint, area, error}
 */
const useFieldPatchArea = () => {

    useEffect(() => {
        if(points.value.filter(a => !(a.longitude && a.latitude)).length > 0) {
            error.value = "invalid points"
            return
        }
        if (points.value.length > 3 && !areaIsContiguous(points.value)) {
            error.value = "Risteävät rajaviivat"
        } else if (points.value.length >= 3 && areaIsContiguous(points.value)) { // if (!points.filter(a => a.latitude === undefined)) {
            error.value = null
            const areaInSqm = calculateArea(points.value)
            area.value = {
                ha: areaInSqm / 10000,
                sqm: areaInSqm,
                numVertices: points.value.length
            }
        } else { // Less than 3 points cannot form area. Reset it to 0.
            area.value = {ha: 0, sqm: 0}
        }
    }, [points.value]);

    /**
     * Push a GPS point to the stack.
     *
     * @arg point Is an object like `{longitude: number, latitude: number}`
     */
    const pushPoint = (point) => {
        points.value = [...points.value, point]
    }

    /**
     * Pop a GPS point from the stack.
     *
     */
    const popPoint = () => {
        if (points.value.length > 0) {
            let lastPoint={...points.value[points.value.length-1], ordinal: points.value.length}
            points.value = [...points.value.slice(0, points.value.length - 1)]
            return lastPoint
        }
        return null
    }

    /**
     * Return state variable containing points.
     *
     * @returns {*[]}
     */
    const getPoints = () => {
        return points.value
    }

    /**
     * Calculate area delimited by the hook's line segments.
     *
     * @returns {number} Is in *m^2*
     */
    const calculateArea = (points) => {
        return _calculateArea([...points])
    }

    const _calculateArea = (areaPointsCopy) => {
        error.value = null
        const [a, b, c] = areaPointsCopy.slice(0, 3)
        if (a && b && c) { // areaPointsCopy is long enough to form an area.
            if (!areaPointsCopy  // Check for intersects
                .map((_item, i) => (
                    areaPointsCopy[i+1] !== undefined ?
                        isIntersect(a, c, areaPointsCopy[i], areaPointsCopy[i+1]) :
                        isIntersect(a, c, areaPointsCopy[i], areaPointsCopy[0])
                )).reduce((a, b) => a || b)) {
                // All conditions for calculating area at this point are met.
                const areaSum = triangleIsInsideArea([a, b, c], areaPointsCopy) ?
                    calculateAreaOfTriangle(a, b, c) : -calculateAreaOfTriangle(a, b, c)
                return _calculateArea(areaPointsCopy.toSpliced(1,1)) + areaSum
            } else {
                // All conditions for calculating area at this point are not met.
                areaPointsCopy.push(areaPointsCopy.shift())
                // TODO: I think this might be unreliably detecting contiguous areas.
                console.log("area WAS contiguous, is it now?", areaIsContiguous(areaPointsCopy))
                return _calculateArea(areaPointsCopy)
            }
        } else { // areaPointsCopy doesn't have enough points to form an area.
            return 0
        }
    }

    return {
        pushPoint: pushPoint,
        popPoint: popPoint,
        area,
        points,
        error,
    }
}

/**
 * Calculate area of a triangle defined by three GPS points.
 *
 * @param p1 Is an object like `{longitude: number, latitude: number}`
 * @param p2 Same as p1
 * @param p3 Same as p1
 * @returns {number} Is a value in sqm.
 */
const calculateAreaOfTriangle = (p1, p2, p3) => {
    const d1 = distanceBetween(p1, p2)
    const d2 = distanceBetween(p2, p3)
    const d3 = distanceBetween(p3, p1)
    const s = (d1 + d2 + d3) / 2
    const area = Math.sqrt(s*(s-d1)*(s-d2)*(s-d3))
    return area
}

/**
 * Return 0 if a and b are the same within tolerance.
 * Return >0 if b>a.
 * Return <0 if a>b.
 *
 * @param a
 * @param b
 * @param tolerance Defaults to 0.005
 * @returns {number}
 */
const floatCmp = (a, b, tolerance) => {
    if (a < b + (tolerance ?? 0.005) && a > b - (tolerance && 0.005)) {
        return 0
    }
    return a - b
}

/**
 * Line segments intersect.
 *
 * See defineLineSegment() to see how to get one of those.
 *
 * @param a line segment
 * @param b line segment
 * @returns {boolean}
 */
const segmentsIntersect = (a, b) => {
    if (floatCmp(a.k, b.k, 0.0005) !== 0) {
        const x = -(b.b-a.b) / (b.k-a.k)
        if (x > Math.max(a.xMin, b.xMin) && x < Math.min(a.xMax, b.xMax)) {
            return true
        }
    }
    return false
}


/**
 * Return `true` if lines from **points** *a1->a2* and *b1->b2* intersect.
 *
 * @param a1 Is an object like `{latitude: number, longitude: number}`
 * @param a2 Same as a1
 * @param b1 Same as a1
 * @param b2 Same as a1
 * @return boolean
 */
const isIntersect = (a1, a2, b1, b2) => {
    // Define line segments.
    const seg0 = defineLineSegment(a1, a2)
    const seg1 = defineLineSegment(b1, b2)
    const retVal = segmentsIntersect(seg0, seg1)
    return retVal
}

/**
 * Define constant `b` for a line going through point `x` and `y`, and having slope `k`
 * @param x
 * @param y
 * @param k
 * @returns {*}
 */
const bConstant = (x, y, k) => -k*x + y

/**
 * Define line segment using two points.
 *
 * `plotFunc` contained in the returned object gives y value on given x value.
 * @param p1 {latitude: number, longitude: number}, latitude being Y-component and longitude X-component.
 * @param p2
 * @returns {{b: number, plotFunc: ((function(*): (*|null))|*), k: number, xMax: number, xMin: number}}
 */
const defineLineSegment = (p1, p2) => {
    const deltaY = p1.latitude - p2.latitude
    const deltaX = p1.longitude - p2.longitude
    const k = deltaY / deltaX
    const b = bConstant(p1.longitude, p1.latitude, k)
    // Shorten the x-span to avoid floating point errors.
    const [xMin, xMax] = [Math.min(p1.longitude, p2.longitude) + 2e-9, Math.max(p1.longitude, p2.longitude) - 2e-9]
    return {
        k, b, xMin, xMax,
        plotFunc: (x) => {
            if (x > xMin && x < xMax) {
                return k*x + b
            }
            return null
        },
    }
}

/**
 * Check that area limiting border doesn't intersect with itself.
 *
 * @param areaPoints Is an array like `[{latitude: number, longitude: number}, ...]`
 * @returns {boolean}
 */
const areaIsContiguous = (areaPoints) => {
    let segments = []
    for (let i = 0; i < areaPoints.length - 1; i++) {
        segments.push(
            defineLineSegment(areaPoints[i], areaPoints[i+1])
        )
    }
    segments.push(defineLineSegment(areaPoints[areaPoints.length - 1], areaPoints[0]))

    for (let i = 0; i < segments.length - 3; i++) {
        for (let j = i+2; j < segments.length-1; j++) {
            if (segmentsIntersect(segments[i], segments[j])) {
                return false
            }
        }
    }
    return true
}

/**
 * Calculate distance GPS point1 and GPS point2 and return that in meters.
 *
 * @param point1 Is an object of form `{latitude: number, longitude: number}`
 * @param point2 Is an object of form `{latitude: number, longitude: number}`
 * @returns {number} Meters
 */
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

const distanceBetween = (point1, point2) => {
    const R = calculateLocalEarthRadius(point1.latitude) //about 6360000 metres
    const phi1 = point1.latitude * Math.PI/180; // φ, λ in radians
    const phi2 = point2.latitude * Math.PI/180;
    const deltaPhi = (point2.latitude-point1.latitude) * Math.PI/180;
    const deltaLambda = (point2.longitude-point1.longitude) * Math.PI/180;

    const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d
}

/**
 * Calculate local Earth radius at given latitude.  
 * @param latitude
 * @returns {number} in meters
 */
const calculateLocalEarthRadius = (latitude) => {
    const radiusEquator = 6378137.0 //  is the radius of Earth at the equator, approximately 6378137 m
    const radiusPolar = 6356752.3 // is the radius of Earth at the pole, approximately 6356752 m
    const phi = degreesToRadians(latitude) //latitude in degrees
    const numerator = (radiusEquator**2 * Math.cos(phi))**2 + (radiusPolar**2 * Math.sin(phi))**2
    const denominator = (radiusEquator * Math.cos(phi))**2 + (radiusPolar * Math.sin(phi))**2
    const localEarthRadius = Math.sqrt(numerator / denominator)
    return localEarthRadius //return localEarthRadius //6360000
}

/**
 * Return whether a triangle is inside of given area.
 *
 * - **NOTE!!** Assumes area and triangle integrity and contiguity.
 * - **NOTE2!!** Assumes the given triangle is *wholly* inside or outside.
 *
 * Reasoning for the note 2 is, that the area slicing algorithm forms triangles wholly inside or outside
 * the worked area. Thus, there is no need to know if a triangle is only partially inside.
 *
 * @param trianglePoints
 * @param areaPoints
 * @returns {boolean} True if inside, false if outside.
 */
const triangleIsInsideArea = (trianglePoints, areaPoints) => {
    // Calculate triangle mean point
    const meanPoint = trianglePoints
        .map(point => ({
            latitude: point.latitude / trianglePoints.length,
            longitude: point.longitude / trianglePoints.length
        }))
        .reduce((acc, point) => ({
                latitude: acc.latitude + point.latitude,
                longitude: acc.longitude + point.longitude
        }), {latitude: 0, longitude: 0})

    // Draw containing rectangle aka. container.
    const container = generateContainer(areaPoints)

    // Define line segment right from mean point along the latitude axis.
    const ray = defineLineSegment(
        meanPoint,
        {...meanPoint, longitude: container[container.length - 1].longitude},
    )
    // Define two colinear tolerance rays on both sides of `ray`.
    const rayHigh = defineLineSegment({
        latitude: meanPoint.latitude + 0.000002,
        longitude: meanPoint.longitude,
    }, {
        latitude: meanPoint.latitude + 0.000002,
        longitude: container[container.length - 1].longitude,
    })
    const rayLow = defineLineSegment({
        latitude: meanPoint.latitude - 0.000002,
        longitude: meanPoint.longitude,
    }, {
        latitude: meanPoint.latitude - 0.000002,
        longitude: container[container.length - 1].longitude,
    })
    const rays = [rayHigh, ray, rayLow]

    // Count intersecting area lines.
    let segments = []
    for (let i = 0; i < areaPoints.length-1; i++) {
        segments.push(
            defineLineSegment(areaPoints[i], areaPoints[i + 1])
        )
    }
    segments.push(
        defineLineSegment(areaPoints[areaPoints.length-1], areaPoints[0])
    )

    return segments.map((a) => ([
        segmentsIntersect(rays[0], a) ? 1 : 0,
        segmentsIntersect(rays[1], a) ? 1 : 0,
        segmentsIntersect(rays[2], a) ? 1 : 0
    ]))
        .reduce((acc, [high, mid, low]) => ([acc[0] + high, acc[1] + mid, acc[2] + low]),
             [0,0,0])
        .map(x => x % 2 === 1)
        .reduce((acc, x) => acc + x ? 1 : 0, 0) % 2 === 1
}

/**
 * Define a containing rectangle around specified area.
 *
 * @param areaPoints {[{latitude, longitude}]} List of points defining the area to be contained.
 * @returns {[{latitude, longitude}, {latitude, longitude}, {latitude, longitude}, {latitude, longitude}]}
 */
const generateContainer = (areaPoints) => {
    let minX = null
    let minY = null
    let maxX = null
    let maxY = null
    areaPoints.forEach((p) => {
        minX = (minX ?? p.longitude) <= p.longitude ? (minX ?? p.longitude) : p.longitude
        minY = (minY ?? p.latitude) <= p.latitude ? (minY ?? p.latitude) : p.latitude
        maxX = (maxX ?? p.longitude) >= p.longitude ? (maxX ?? p.longitude) : p.longitude
        maxY = (maxY ?? p.latitude) >= p.latitude ? (maxY ?? p.latitude) : p.latitude
    })
    minX -= 0.001
    minY -= 0.001
    maxX += 0.001
    maxY += 0.001
    const topLeft = {latitude: maxY, longitude: minX}
    const bottomLeft = {latitude: minY, longitude: minX}
    const bottomRight = {latitude: minY, longitude: maxX}
    const topRight = {latitude: maxY, longitude: maxX}
    return [topLeft, bottomLeft, bottomRight, topRight]
}


export default useFieldPatchArea
export {
    calculateAreaOfTriangle as __internal_calculateAreaOfTriangle,
    distanceBetween as __internal_distanceBetween,
    isIntersect as __internal_isIntersect,
    areaIsContiguous as __internal_areaIsContiguous,
    calculateLocalEarthRadius as __internal_calculateLocalEarthRadius,
    generateContainer as __internal_generateContainer,
    triangleIsInsideArea as __internal_triangleIsInsideArea,
}