import { useState, useEffect } from 'react';
import calculateBearing from '../utils/calculateBearing';
import getCompassPosition from '../utils/getCompassPosition';

/**
 * useArrowPosition hook
 * @param location
 * @param destination
 * @param heading
 * @param canvasSize
 * @returns {{x: number, y: number}}
 */

const useArrowPosition = (location, destination, heading, canvasSize) => {
    const [arrowPosition, setArrowPosition] = useState({
        x: canvasSize / 2,
        y: canvasSize / 2,
    });

    useEffect(() => {
        if (location && destination) {
            const destinationBearing = calculateBearing(
                location.latitude,
                location.longitude,
                destination.latitude,
                destination.longitude
            );
            const relativeHeading = (destinationBearing - heading + 360) % 360;

            const { x, y } = getCompassPosition(canvasSize, relativeHeading);
            setArrowPosition({ x, y });
        }
    }, [location, destination, heading, canvasSize]);

    return arrowPosition;
};

export default useArrowPosition;