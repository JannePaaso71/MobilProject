import {useState, useEffect} from "react"
import * as Location from 'expo-location'

/**
 * Return and update current position.
 *
 * @returns {{location: {longitudeDelta: number, latitudeDelta: number, latitude: number, longitude: number}, errorMsg: string}}
 */
export default function useLocation(updateInterval, accuracy) {
    const [location, setLocation] = useState({
        latitude: 65.1,
        longitude: 25.5,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
    const [errorMsg, setErrorMsg] = useState("awaiting location");
    const [meta, setMeta] = useState(null);

    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Paikannusluvan pyytäminen epäonnistui!');
                return null;
            }

            setErrorMsg(null);
            const loc = await Location.getCurrentPositionAsync({
                accuracy: accuracy??5, // Defaults to most accurate
                mayShowUserSettingsDialog: false,
                distanceInterval: null,
                timeInterval: updateInterval??3000,
            })
            return loc
        }

        const intervalHandle = setInterval(() => {
            getCurrentLocation()
                .then((loc) => {
                    setLocation(loc.coords)
                    setMeta({mocked: loc.mocked, millisFromEpoch: loc.timestamp, accuracy: loc.coords.accuracy, speed: loc.coords.speed})
                })
        }, updateInterval??3500)

        return () => clearInterval(intervalHandle)
    }, []);

    return {location, meta, errorMsg};
}