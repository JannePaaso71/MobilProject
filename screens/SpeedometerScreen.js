import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import colorScheme from "../styles/colorScheme";
import styles from "../styles/styles";
import {
    Skia,
    Canvas,
    Circle,
    Group,
    Text as SkiaText,
    matchFont,
} from "@shopify/react-native-skia";

import {Button} from "react-native-paper"
import useSpiritLevel from "../hooks/useSpiritLevel";
import slStylesFactory from "../styles/spiritLevelStyles"
import BottomBar from "../components/BottomBar";
import renderSpeedMarkers from '../utils/renderSpeedMarkers';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import {useSpeedometerDemo} from '../utils/speedometerDemo';
import useLocation from "../hooks/useLocation";
import {TouchableOpacity} from 'react-native';


const fontFamily = Platform.select({ios: "Helvetica", default: "sans-serif"});
const fontStyle = {
    fontFamily,
    fontSize: 60,
    fontStyle: "normal",
    fontWeight: "normal",
};
const fontBig = matchFont(fontStyle);
const fontSmall = matchFont({...fontStyle, fontSize: 30});

const windowDimensions = Dimensions.get('window');

const textXOffset = 9 * windowDimensions.width/100;
const textYOffsetSpeed = 1//6 * windowDimensions.width/100;

const textXOffsetkmh = 10 * windowDimensions.width/100;
const textYOffsetKmh = 30 * windowDimensions.width/100;

const slStyles = slStylesFactory(windowDimensions.width);

const SpeedometerScreen = () => {
    const [planeLocked, setPlaneLocked] = useState(false);
    const slopeAndDirection = useSpiritLevel(planeLocked);
    const {speed, changingColor, startDemo} = useSpeedometerDemo();
    const [buttonColor, setButtonColor] = useState(changingColor);
    const {meta} = useLocation(400, 3, 1000)

    useEffect(() => {
        setButtonColor(changingColor);
    }, [changingColor]);

    const theSpeed = useCallback(() => {
        const sMocked = speed??0
        const sReal = meta?.speed??0
        return sMocked ? sMocked : sReal
    }, [speed, meta?.speed]);

    const getSpeed = () => {
        return Math.floor(theSpeed());
    }

    /**
     * Setting the centerpoint of circles to the middle of the screen.
     * @returns 
     */
    const getOrigo = () => {   
        return {x: windowDimensions.width/2 - 3*windowDimensions.width/100 / 2, y: windowDimensions.width/2 + 5*windowDimensions.width/100};
    }
    const getRadius = () => {
        return windowDimensions.width / 3;
    }

    const adjustTextPosition = (speed) => {
        const adjustX = 19*windowDimensions.width/400;
        const adjustY = 6*windowDimensions.width/100;
        const textPosition = {x: getOrigo().x - speed.toString().length*adjustX, y: getOrigo().y + adjustY};
        return textPosition

    }



    const path = Skia.Path.Make();
    path.moveTo(windowDimensions.width / 2 - textYOffsetSpeed, windowDimensions.width / 2 - textXOffset);
    path.lineTo(windowDimensions.width / 2 - textYOffsetSpeed, windowDimensions.width / 2 - textXOffset + 300);

    /**
     * Calculate small indicator circle coordinates from direction given by useSpiritLevel-hook.
     * @param width width of the canvas
     * @param height height of the canvas
     * @returns {{x: number, y: number}}
     */
    const getPositionUsingCurrentDirection = (width, height) => {

        const direction = speed/160*Math.PI - Math.PI ;
        const r = getRadius();
        const xVal = getOrigo().x + Math.cos(direction) * r;
        const yVal = getOrigo().y + Math.sin(direction) * r;
        return {x: xVal, y: yVal};
    }



    const {x, y} = getPositionUsingCurrentDirection(windowDimensions.width, windowDimensions.width);
    
    return (
        <View style={{height: "100%", flex:1, flexDirection: "column", alignItems:"center", backgroundColor: colorScheme.background}}>
            <View style={styles.padding}/>
            <Canvas style={slStyles.canvas}>
                <Group>
                    <Circle  // Rim
                        cx={getOrigo().x}
                        cy={getOrigo().y}
                        r={getRadius(windowDimensions.width, windowDimensions.width) + 15}
                        color={changingColor} // Ensure this is dynamic
                    />
                    <Circle  // Inner circle
                        cx={getOrigo().x}
                        cy={getOrigo().y}
                        r={getRadius(windowDimensions.width, windowDimensions.width) - 15}
                        color={colorScheme.innerCircle}
                    />

                    {renderSpeedMarkers (getOrigo(),getRadius())}
                    
                    <Circle // Indicator circle
                        cx={x}
                        cy={y}
                        r={windowDimensions.width / 20}
                        color={colorScheme.primary}
                    />
                </Group>
                <SkiaText
                    x={adjustTextPosition(getSpeed()).x}
                    y={adjustTextPosition(getSpeed()).y}
                    color={colorScheme.text} text={getSpeed().toString()} font={fontBig}
                />
                <SkiaText
                        x={windowDimensions.width / 2 - textXOffsetkmh}
                        y={windowDimensions.width / 2 + textYOffsetKmh}
                        text="km/h" font={fontSmall} color={colorScheme.text}
                    />

            </Canvas>

            <TouchableOpacity
                style={[styles.demoButton, {backgroundColor: buttonColor}]}
                onPress={startDemo}>
                <Text style={styles.buttonText}>Demo</Text>
            </TouchableOpacity>
            <View style={styles.padding}/>

            <BottomBar
                text={slopeAndDirection.error ?? " "}
                isError={slopeAndDirection.error} />
        </View>
    );
};

export default SpeedometerScreen;