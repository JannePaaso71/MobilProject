import React from 'react';
import { Line, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';
import colorScheme from '../styles/colorScheme'; // Adjust the import path as needed

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

const renderSpeedMarkers = (origo, radius) => {
    const markers = [];
    const compassRadius = radius;
    const tickLength = -14;

    for (let speed = 0; speed <= 160; speed += 20) {
        const radians = ((speed - 160) * Math.PI) / 160;
        const isMajorTick = speed % 20 === 0;
        const currentTickLength = isMajorTick ? tickLength + 5 : tickLength;

        const outerX = origo.x + (compassRadius + 15) * Math.cos(radians);
        const outerY = origo.y + (compassRadius + 15) * Math.sin(radians);
        const innerX = origo.x + (compassRadius - currentTickLength) * Math.cos(radians);
        const innerY = origo.y + (compassRadius - currentTickLength) * Math.sin(radians);

        markers.push(
            <Line
                key={`tick-${speed}`}
                p1={{ x: innerX, y: innerY }}
                p2={{ x: outerX, y: outerY }}
                strokeWidth={2}
                color={colorScheme.text}
            />
        );

        if (isMajorTick && speed !== 360) {
            const textRadius = compassRadius + 35;
            const textX = origo.x + textRadius * Math.cos(radians);
            const textY = origo.y + textRadius * Math.sin(radians) + 10;

            markers.push(
                <SkiaText
                    key={`label-${speed}`}
                    x={textX - 9}
                    y={textY} 
                    text={`${speed}`}
                    font={matchFont({
                        fontFamily,
                        fontSize: 20,
                        fontStyle: 'normal',
                        fontWeight: 'bold',
                    })}
                    //>={colorScheme.lightText}
                    color="black"
                />
            );
        }
    }

    return markers;
};

export default renderSpeedMarkers;