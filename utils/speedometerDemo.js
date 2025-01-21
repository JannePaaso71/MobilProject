import { useEffect, useState, useRef } from 'react';

const useSpeedometerDemo = () => {
    const [speed, setSpeed] = useState(0);
    const [changingColor, setChangingColor] = useState('rgb(0, 190, 50)');
    
    // Define color codes
    let codeRed = [0, 250, 255];
    let codeGreen = [200, 250, 0];
    let codeBlue = [50, 50, 0]; // 255, 255, 0 is yellow, 255, 0, 0 is red, 0, 255, 0 is green, 0, 0, 255 is blue

    // Function to return the sum of the color codes
    const getSumColor = (y, r, b) => {
        return `rgb(${y}, ${r}, ${b})`;
    };

    const timeoutRef = useRef(null); // Add a ref to store the timeout handle

    // Function to calculate the color based on speed
    const calculateColor = (speed) => {
        if (speed < 80) {
            let colorRatio = (80 - speed) / 80;
            let redRatio = colorRatio * codeRed[0] + (1 - colorRatio) * codeRed[1];
            let greenRatio = colorRatio * codeGreen[0] + (1 - colorRatio) * codeGreen[1];
            let blueRatio = colorRatio * codeBlue[0] + (1 - colorRatio) * codeBlue[1];
            setChangingColor(getSumColor(redRatio, greenRatio, blueRatio));

        } else {
            let colorRatio = 1 - ((speed - 80) / 80);
            let redRatio = colorRatio * codeRed[1] + (1 - colorRatio) * codeRed[2];
            let greenRatio = colorRatio * codeGreen[1] + (1 - colorRatio) * codeGreen[2];
            let blueRatio = colorRatio * codeBlue[1] + (1 - colorRatio) * codeBlue[2];
            setChangingColor(getSumColor(redRatio, greenRatio, blueRatio));
        }
    };

    // Function to adjust speed
    const adjustSpeed = () => {
        const force = 165;
        const airResistance = 1;

        setSpeed(prevSpeed => {
            const newSpeed = prevSpeed + (force - airResistance * prevSpeed) / 100;
            calculateColor(newSpeed); 
            if (newSpeed >= 160) {
                clearTimeout(timeoutRef.current);
                setChangingColor('rgb(0, 200, 50)');
                return 0;
            }
            return newSpeed;
        });
    };

    // Function to handle button click
    const handleButtonClick = () => {
        clearTimeout(timeoutRef.current); // Clear any existing timeout
        adjustSpeed();
        timeoutRef.current = setTimeout(handleButtonClick, 20); // Set a new timeout
    };

    // Return the speed, changingColor, and startDemo function
    return {
        speed,
        changingColor,
        startDemo: handleButtonClick
    };
};

export { useSpeedometerDemo };
