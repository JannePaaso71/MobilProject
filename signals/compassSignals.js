import {signal} from "@preact-signals/safe-react";

const showCompassRim = signal(true)
const mapLocked = signal(false)
const zoomLevel = signal(15)
const calibrationDataVisible = signal(false)

const resetCalibrationDataSignal = signal(false)

const zoomIn = () => zoomLevel.value = zoomLevel.value + 1
const zoomOut = () => zoomLevel.value = zoomLevel.value - 1

export {
    showCompassRim,
    zoomIn,
    zoomOut,
    mapLocked,
    zoomLevel,
    calibrationDataVisible,
    resetCalibrationDataSignal
}