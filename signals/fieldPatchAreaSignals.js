import {signal} from "@preact-signals/safe-react";

const points = signal([])
const area = signal({ha: 0, sqm: 0})
const error = signal(null)

export {points, area, error}