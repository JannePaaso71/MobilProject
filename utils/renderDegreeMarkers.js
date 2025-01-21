import React from 'react';
import { Line, Text as SkiaText, matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';
import colorScheme from '../styles/colorScheme'; // Adjust the import path as needed

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

const renderDegreeMarkers = (size) => {
    const markers = [];
    const compassRadius = size / 2.5;
    const tickLength = 10;

    for (let degree = 0; degree <= 360; degree += 10) {
        const radians = ((degree - 90) * Math.PI) / 180;
        const isMajorTick = degree % 20 === 0;
        const currentTickLength = isMajorTick ? tickLength + 5 : tickLength;

        const outerX = size / 2 + (compassRadius + 10) * Math.cos(radians);
        const outerY = size / 2 + (compassRadius + 10) * Math.sin(radians);
        const innerX = size / 2 + (compassRadius + 10 - currentTickLength) * Math.cos(radians);
        const innerY = size / 2 + (compassRadius + 10 - currentTickLength) * Math.sin(radians);

        markers.push(
            <Line
                key={`tick-${degree}`}
                p1={{ x: innerX, y: innerY }}
                p2={{ x: outerX, y: outerY }}
                strokeWidth={2}
                color={colorScheme.lightText}
            />
        );

        if (isMajorTick && degree !== 360) {
            const textRadius = compassRadius + 20;
            const textX = size / 2 + textRadius * Math.cos(radians);
            const textY = size / 2 + textRadius * Math.sin(radians) + 10;

            markers.push(
                <SkiaText
                    key={`label-${degree}`}
                    x={textX - 10}
                    y={textY}
                    text={`${degree}°`}
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

export default renderDegreeMarkers;
