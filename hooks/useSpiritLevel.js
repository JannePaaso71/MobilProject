import {useState, useEffect} from 'react';
import {DeviceMotion} from 'expo-sensors';

/**
 * Return `slope` and `direction` polled from DeviceMotion. Slope is in degrees, while direction is in radians.
 *
 * Error contains possible error message, or `null` if none.
 *
 * @returns {{slope: number, direction: number, useCase: string|null, error: string}}
 */

const useSpiritLevel = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [error, setError] = useState("Need sensors to be available");
    const [orientation, setOrientation] = useState({slope: 0, direction: 0, useCase: null, error: error});

    let useCase = "";//floor, wall, frame, ceiling


    // Request permission to use DeviceMotion.
    useEffect(() => {
        const requestPermission = async () => {
            while(!(await DeviceMotion.isAvailableAsync())) {
            }
            setIsAvailable(true)
            const {status} = await DeviceMotion.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        requestPermission();
    }, []);

    // Subscribe to DeviceMotion.
    useEffect(() => {
        if (!hasPermission || !isAvailable) {
            return;
        }
        const listener = DeviceMotion.addListener((motionData) => {
            if (motionData.rotation) { // Added check for motionData.rotation
                const {alpha, beta, gamma} = motionData.rotation;
                const {x,y,z} = motionData.accelerationIncludingGravity;
                //console.log("alpha: ", alpha, "beta: ", beta, "gamma: ", gamma);

                if (Math.abs(beta) < Math.PI/4 && Math.abs(gamma) < Math.PI/4) {
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(combine(beta, gamma)).toFixed(2),
                        direction: toDirection(beta, -gamma),
                        useCase: "lattia",
                    });
                }
                else if (Math.abs(gamma) > 3*Math.PI/4 && Math.abs(beta) < Math.PI/4) {
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(Math.abs(combine(beta, gamma))).toFixed(2),
                        direction: toDirection(beta, gamma),
                        useCase: "katto",
                    });
                } 
                else if (Math.abs(beta) < Math.PI/4 && Math.abs(gamma) < 3*Math.PI/4) {
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(beta).toFixed(2),
                        direction: toDirection(beta, 0.1),
                        useCase: "taulu",
                    });
                }
                else if (Math.abs(beta) > Math.PI/4 ) {
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(Math.abs(beta - Math.PI/2)).toFixed(2),
                        direction: x < 0 ? Math.PI-beta : beta,
                        useCase: "seinä",
                    });
                } else {
                    useCase="unknown";
                    setOrientation({
                        ...orientation, 
                        slope:toDegrees(combine(beta, gamma)).toFixed(2),
                        direction: toDirection(beta, gamma),
                        error:"tuntematon asento"
                    });
                }
            }
        });

        DeviceMotion.setUpdateInterval(2000); // Set the update interval to 200ms
        if (!isAvailable) {
            setError("laite ei saatavilla")
        } else if (!hasPermission) {
            setError("puuttuvia oikeuksia")
        } else {
            setError(null)
        }
        return () => {
            listener.remove(); // Clean up the listener.
        };
    }, [hasPermission, isAvailable]);

    return {...orientation, error};
};

const toDegrees = (radians) => (radians * 180) / Math.PI;

const combine = (a, b) => Math.sqrt(Math.sin(a)**2 + Math.sin(b)**2).toFixed(2);
const toDirection = (a, b) => Math.atan2(Math.sin(a), Math.sin(-b));

export default useSpiritLevel;