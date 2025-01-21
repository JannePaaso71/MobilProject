import React from 'react';
import { useSpeedometerDemo } from '../utils/speedometerDemo';

const SpeedometerScreen = () => {
    const { speed, changingColor, startDemo } = useSpeedometerDemo();

    return (
        <div>
            <div style={{ color: changingColor }}>
                Speed: {speed}
            </div>
            <button onClick={startDemo}>Start</button>
        </div>
    );
};

export default SpeedometerScreen;