import getRadius from "./getRadiusForCompass";

/**
 * @typedef {Object} CompassPosition
 * @property {number} x - The x-coordinate of the compass indicator.
 * @property {number} y - The y-coordinate of the compass indicator.
 */

/**
 * Calculate the position of the compass indicator based on the size of the compass and the relative heading.
 * @param {number} size - The size of the compass.
 * @param {number} relativeHeading - The relative heading in degrees.
 * @returns {CompassPosition} The x and y coordinates of the compass indicator.
 */

export const getCompassPosition = (size, relativeHeading) => {
    if (typeof size !== 'number' || typeof relativeHeading !== 'number') {
        //console.log('Invalid inputs:', { size, relativeHeading });
        //console.error('Invalid inputs to getCompassPosition:', { size, relativeHeading });
        return { x: size / 2, y: size / 2 }; // Default to center
    }

    const compassRadius = getRadius(size);
    const indicatorRadius = size / 20;
    const effectiveRadius = compassRadius + 10 - indicatorRadius;

    const adjustedHeading = (relativeHeading - 90 + 360) % 360;
    const radians = (adjustedHeading * Math.PI) / 180;

    const xVal = Math.cos(radians) * effectiveRadius;
    const yVal = Math.sin(radians) * effectiveRadius;

    return { x: size / 2 + xVal, y: size / 2 + yVal };
};

export default getCompassPosition;
