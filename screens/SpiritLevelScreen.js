import {View, Dimensions, Platform} from 'react-native';
import React, {useMemo, useState} from 'react';
import colorScheme from "../styles/colorScheme";
import {
    Skia,
    Canvas,
    Circle,
    Group,
    Text as SkiaText,
    matchFont,
    vec,
    TextPath,
} from "@shopify/react-native-skia";
import useSpiritLevel from "../hooks/useSpiritLevel";
import styles from "../styles/styles";
import slStylesFactory from "../styles/spiritLevelStyles"
import BottomBar from "../components/BottomBar";

const fontFamily = Platform.select({ios: "Helvetica", default: "sans-serif"});
const fontStyle = {
    fontFamily,
    fontSize: 60,
    fontStyle: "normal",
    fontWeight: "normal",
};
const font = matchFont(fontStyle);

const windowDimensions = Dimensions.get('window');

const textXOffset = 0.2 * windowDimensions.width;
const textYOffset = 25;

const size = 200;

const slStyles = slStylesFactory(windowDimensions.width);

const SpiritLevelScreen = () => {
    const [planeLocked, setPlaneLocked] = useState(false);
    const slopeAndDirection = useSpiritLevel(planeLocked);

    const getRadius = (width, height) => {
        return Math.min(width, height) / 2.5;
    }

    const path = Skia.Path.Make();
    path.moveTo(windowDimensions.width / 2 - textYOffset, windowDimensions.width / 2 - textXOffset);
    path.lineTo(windowDimensions.width / 2 - textYOffset, windowDimensions.width / 2 - textXOffset + 300);

    /**
     * Calculate small indicator circle coordinates from direction given by useSpiritLevel-hook.
     * @param width width of the canvas
     * @param height height of the canvas
     * @returns {{x: number, y: number}}
     */
    const getPositionUsingCurrentDirection = (width, height) => {

        const direction = slopeAndDirection.direction; //direction in radians
        const r = getRadius(width, height);
        const xVal = Math.cos(direction) * r;
        const yVal = Math.sin(direction) * r;
        return {x: width / 2 + xVal, y: height / 2 + yVal};
    }

    const {x, y} = getPositionUsingCurrentDirection(windowDimensions.width, windowDimensions.width);
    return (
        <>
            <View style={styles.padding}/>
            <Canvas style={slStyles.canvas}>
                <Group>
                    <Circle  // Rim
                        cx={windowDimensions.width / 2}
                        cy={windowDimensions.width / 2}
                        r={getRadius(windowDimensions.width, windowDimensions.width) + 10}
                        color={colorScheme.accent}
                    />
                    <Circle  // Inner circle
                        cx={windowDimensions.width / 2}
                        cy={windowDimensions.width / 2}
                        r={getRadius(windowDimensions.width, windowDimensions.width) - 10}
                        color={colorScheme.innerCircle}
                    />
                    <Circle // Indicator circle
                        cx={x}
                        cy={y}
                        r={windowDimensions.width / 20}
                        color={colorScheme.primary}
                    />
                </Group>
                {slopeAndDirection.useCase !== "taulu" ? <SkiaText
                        x={windowDimensions.width / 2 - textXOffset}
                        y={windowDimensions.width / 2 + textYOffset}
                        text={(slopeAndDirection.slope ?? "unreadable") + "°"} font={font}
                    /> :
                    <Group transform={[{rotate: -0 * Math.PI}]} origin={vec(size, size)}>
                        <TextPath font={font} path={path} text={(slopeAndDirection.slope ?? "unreadable") + "°"}
                                  font={font}/>
                    </Group>}
            </Canvas>
            <View style={styles.padding}/>
            <BottomBar
                text={slopeAndDirection.error ?? slopeAndDirection.useCase}
                isError={slopeAndDirection.error} />
        </>
    );
};

export default SpiritLevelScreen;