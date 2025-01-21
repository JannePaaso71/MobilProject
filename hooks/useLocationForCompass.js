import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

/**
* @typedef {Object} LocationCoords
* @property {number} latitude - Latitude in degrees.
* @property {number} longitude - Longitude in degrees.
* @property {number|null} altitude - Altitude in meters above sea level.
* @property {number|null} accuracy - Radius of uncertainty for the location, in meters.
* @property {number|null} altitudeAccuracy - Vertical accuracy of the location, in meters.
* @property {number|null} heading - Heading, in degrees.
* @property {number|null} speed - Speed of the device in meters per second.
*/

/**
 * useLocationForCompass hook
 * @description
 * This hook returns the current location of the device.
 * The location is updated in real-time.
 * @returns {LocationCoords|null}
 */

const useLocationForCompass = () => {
    const [location, setLocation] = useState(null);

    useEffect(() => {
        let locationSubscription;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 500,
                    distanceInterval: 0.5,
                },
                (newLocation) => {
                    setLocation(newLocation.coords);
                }
            );
        })();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    return location;
};

export default useLocationForCompass;
