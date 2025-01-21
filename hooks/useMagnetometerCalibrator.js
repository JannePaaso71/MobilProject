
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState} from "react";
import LocalStorage from "@react-native-async-storage/async-storage/src";
import {resetCalibrationDataSignal} from "../signals/compassSignals"


/**
 * @returns {Promise<void>}
 */
const storeMagnetometerCalibrationData = async (data) => {
    await LocalStorage.setItem('magnetometerCalibrationRawData', JSON.stringify(data));
}

/**
 * Returned object has keys {`xMax`, `xMin`, `yMax`, `yMin`, `zMax`, `zMin`}.
 *
 * @returns {Promise<object|null>}
 */
const getMinMaxMagnetometerData = async () => {
    try {
        const value = await AsyncStorage.getItem('magnetometerCalibrationRawData');
        return value ? JSON.parse(value) : null
    } catch (e) {
        console.log(e)
        throw e
    }
}

/**
 * Calculate average between `a` and `b`.
 * @param a
 * @param b
 * @returns {number}
 */
const calculateAverage = (a, b) => {
    return (a + b) / 2
}

/**
 * Shift `min`, `max` and `val` towards 0 by average of `min` and `max`.
 * @param min Minimum value `val` has taken in history.
 * @param max Maximum value `val` has taken in history.
 * @param val Comes along for the shifting ride. If omitted, `val` of the returned object will be 0. **[optional]**
 * @returns {{val: number, min: number, max: number}}
 */
const shift = (min, max, val) => {
    const avg = calculateAverage(min, max)
    const shiftedMin = min - avg
    const shiftedMax = max - avg
    return {min: shiftedMin, max: shiftedMax, val: val??avg - avg}
}

/**
 * Scale `val` to [-1, 1] assuming it can take pre-scaled values from `min` to `max`.
 * @param min Minimum value `val` has taken in the past.
 * @param max Maximum value `val` has taken in the past.
 * @param val Value to be scaled
 * @returns {number}
 */
const scale = (min, max, val) => {
    if(max === min) return 0;
    const currentScale = max-min // Scale to [-1, 1]
    return val / currentScale
}

/**
 * Compare two floating point numbers, and return `<0, if a>b` and `>0, if b>a` and finally `0` if they're both
 * close enough to be within tolerance.
 *
 * Tolerance defaults to `0.5`.
 * @param a
 * @param b
 * @param tolerance
 * @returns {number}
 */
const floatCmp = (a,b, tolerance) => {
    if (a - b <= tolerance??0.5) {
        return 0
    }
    return a-b
}


/**
 * Calibrates raw data from magnetometer.
 *
 *  maxUpdateInterval is in milliseconds and *defaults to 200*.
 *
 * @param data {x: number, y: number, z: number}
 * @param maxUpdateInverval
 * @returns {{x, y, z}}
 */
const useMagnetometerCalibrator = (data, maxUpdateInverval) => {
    const [exportedCalibrationData, setExportedCalibrationData] = useState({
        x: data.x, y: data.y, z: data.z,  // Calibrated for export
    })
    const [privateCalibrationData, setPrivateCalibrationData] = useState({
        xMin: data.x, xMax: data.x,  // Updated for future calibrations
        yMin: data.y, yMax: data.y,
        zMin: data.z, zMax: data.z
    })
    const [canUpdate, setcanUpdate] = useState(true)
    const [initialDataFromLCLoaded, setInitialDataFromLCLoaded] = useState(false)

    useEffect(() => {
        if (resetCalibrationDataSignal.value === true) {
            const d = {
                xMin: data.x, xMax: data.x,
                yMin: data.y, yMax: data.y,
                zMin: data.z, zMax: data.z
            }
            storeMagnetometerCalibrationData(d)
                .catch(e => console.log(e))
                .then(lala => {
                    setPrivateCalibrationData(d)
                })
        }
        resetCalibrationDataSignal.value = false
    }, [resetCalibrationDataSignal.value]);

    if (!initialDataFromLCLoaded) {
        setInitialDataFromLCLoaded(true)
        getMinMaxMagnetometerData()
            .then((data) => {
                setExportedCalibrationData({
                    xMin: data.xMin < privateCalibrationData.xMin ? data.xMin : privateCalibrationData.xMin,
                    xMax: data.xMax > privateCalibrationData.xMax ? data.xMax : privateCalibrationData.xMax,
                    yMin: data.yMin < privateCalibrationData.yMin ? data.yMin : privateCalibrationData.yMin,
                    yMax: data.yMax > privateCalibrationData.yMax ? data.yMax : privateCalibrationData.yMax,
                    zMin: data.zMin < privateCalibrationData.zMin ? data.zMin : privateCalibrationData.zMin,
                    zMax: data.zMax > privateCalibrationData.zMax ? data.zMax : privateCalibrationData.zMax
                })
            })
    }

    useEffect(() => {
        getMinMaxMagnetometerData()
            .catch(e => {
                console.log(e)
                throw e
            })
            .then(v => {
                if (v !== null) {
                    updateCalibrationData(v)
                }
            })
    }, [])

    const minMaxChanged = (x, y, z) => {
        const changed = x < ((privateCalibrationData?.xMin)??(x+1)) || (x > (privateCalibrationData?.xMax)??(x-1)) ||
            (y < (privateCalibrationData?.yMin)??(y+1)) || (y > (privateCalibrationData?.yMax)??(z-1)) ||
            (z < (privateCalibrationData?.zMin)??(z+1)) || (z > (privateCalibrationData?.zMax)??(z-1))
        return changed
    }
    const updateCalibrationData = (data) => {
        const mmc = minMaxChanged(data.x, data.y, data.z)
        const [minX, maxX] = [
            Math.min(privateCalibrationData.xMin, data.x),
            Math.max(privateCalibrationData.xMax, data.x)
        ]
        const [minY, maxY] = [
            Math.min(privateCalibrationData.yMin, data.y),
            Math.max(privateCalibrationData.yMax, data.y)
        ]
        const [minZ, maxZ] = [
            Math.min(privateCalibrationData.zMin, data.z),
            Math.max(privateCalibrationData.zMax, data.z)
        ]
        const shiftedX = shift(minX, maxX, data.x)
        const shiftedY = shift(minY, maxY, data.y)
        const shiftedZ = shift(minZ, maxZ, data.z)
        const scaledX = scale(minX, maxX, shiftedX.val)
        const scaledY = scale(minY, maxY, shiftedY.val)
        const scaledZ = scale(minZ, maxZ, shiftedZ.val)
        const calibrated = {
            x: scaledX, y: scaledY, z: scaledZ,  // Calibrated for export
            xMin: minX, xMax: maxX,  // Updated for future calibrations
            yMin: minY, yMax: maxY,
            zMin: minZ, zMax: maxZ
        }
        if (mmc) {
            setPrivateCalibrationData({xMin: minX, xMax: maxX, yMin: minY, yMax: maxY, zMin: minZ, zMax: maxZ})
            storeMagnetometerCalibrationData(data)
                .catch((err) => {console.log(err)})
        }
        if (canUpdate || mmc) {
            setExportedCalibrationData({x: calibrated.x, y: calibrated.y, z: calibrated.z})
            setcanUpdate(false)
            setTimeout(() => {
                setcanUpdate(true)
            }, maxUpdateInverval??200)
        }
    }

    updateCalibrationData({x: data.x, y: data.y, z: data.z})

    return {...exportedCalibrationData, ...privateCalibrationData}
}

export default useMagnetometerCalibrator;
