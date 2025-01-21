import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import React, {useState, useEffect} from 'react';
import colorScheme from "../styles/colorScheme";
import {Canvas, Circle, Group, Text as SkiaText, matchFont, Line, rotate} from "@shopify/react-native-skia";
import useCompass from "../hooks/useCompass";
import renderDegreeMarkers from "../utils/renderDegreeMarkers";
import CustomMapView from "../components/CustomMapView";
import BottomBar from "../components/BottomBar";
import useLocationForCompass from "../hooks/useLocationForCompass";
import getCompassPosition from "../utils/getCompassPosition";
import getRadius from "../utils/getRadiusForCompass";
import useHeadingForCompass from "../hooks/useHeadingForCompass";
import useArrowPosition from "../hooks/useArrowPositionForCompass";
import {showCompassRim, zoomLevel, calibrationDataVisible} from "../signals/compassSignals";
import magnetometer from "expo-sensors/src/Magnetometer";


const fontFamily = Platform.select({ ios: "Helvetica", default: "sans-serif" });
const fontStyle = {
    fontFamily,
    fontSize: 60,
    fontStyle: "normal",
    fontWeight: "normal",
};
const font = matchFont(fontStyle);
const windowDimensions = Dimensions.get('window');
const textXOffset = 0.15 * windowDimensions.width;
const textYOffset = 20;
//const canvasSize = windowDimensions.width * 0.9;
/**
 * CompassScreen component
 * @description
 * This component displays a compass that shows the current heading of the device.
 * The compass also shows the direction to a destination if one is set.
 * The user can set a destination by tapping on the map.
 * The compass will then show the direction to the destination.
 * The compass also shows the current location on the map.
 * The user's location is updated in real-time.
 * The compass is implemented using the react-native-skia library.
 * @returns {JSX.Element}
 * @constructor
 */
const CompassScreen = () => {
    const canvasSize = windowDimensions.width * 0.9;
    const styles = createStyles(canvasSize);

    const compassData = useCompass();
    const heading = useHeadingForCompass(compassData);
    const location = useLocationForCompass()

    const [rimRotation, setRimRotation] = useState({rotation: 0})

    useEffect(() => {
        const rad = -(heading * Math.PI / 180)
        setRimRotation(() => ({
                rotation: rad
        }))
    }, [heading]);

    const [destination, setDestination] = useState(null);
    const arrowPosition = useArrowPosition(location, destination, heading, canvasSize);

    const [cameraLocked, setCameraLocked] = useState(true);
    const [camera, setCamera] = useState({
        center: { latitude:65.01333178773747, longitude: 25.464694270596162 },
        pitch: 90,
            zoom: 15,
        heading: 0
    });

    useEffect(() => {
        if (cameraLocked) {
            setCamera({
                center: {
                    latitude: location?.latitude??65.01333178773747,
                    longitude: location?.longitude??25.464694270596162,
                },
                pitch: 90,
                zoom: zoomLevel.value,
                heading,
            })
        } else {
            setCamera(null);
        }
    }, [cameraLocked, heading, location]);

    const { x, y } = getCompassPosition(canvasSize, Number(heading));

    return (
        <>
            {/* Map and Compass Container */}
            <View style={styles.canvasContainer}>
                <CustomMapView
                    camera={camera}
                    destination={destination}
                    onMapPress={(e) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setDestination({ latitude, longitude });
                    }}
                />

                {calibrationDataVisible.value &&
                    <View style={styles.meta}>
                        <Text style={styles.metaText}>x: {compassData.meta.x}</Text>
                        <Text style={styles.metaText}>y: {compassData.meta.y}</Text>
                        <Text style={styles.metaText}>xMax: {compassData.meta.xMax}</Text>
                        <Text style={styles.metaText}>xMin: {compassData.meta.xMin}</Text>
                        <Text style={styles.metaText}>yMax: {compassData.meta.yMax}</Text>
                        <Text style={styles.metaText}>yMin: {compassData.meta.yMin}</Text>
                    </View>
                }

                {showCompassRim.value &&
                <Canvas style={styles.canvas}>
                    <Group>
                        {/* Ring*/}
                        <Circle
                            cx={canvasSize / 2}
                            cy={canvasSize / 2}
                            r={getRadius(canvasSize) + 10}
                            color={colorScheme.accent}
                            style = "stroke"
                            strokeWidth={30}
                        />
                        <Group transform={[{rotate: Number(rimRotation.rotation)}]}
                               origin={{x: canvasSize/2, y: canvasSize/2}}>
                            {renderDegreeMarkers(canvasSize)}
                        </Group>
                        {destination && (
                            <Line
                                p1={{ x: canvasSize / 2, y: canvasSize / 2 }}
                                p2={arrowPosition}
                                strokeWidth={4}
                                color="red"
                            />
                        )}
                    </Group>
                    <SkiaText
                        x={canvasSize / 2 - 0.15 * canvasSize}
                        y={canvasSize / 2 + 20}
                        text={`${Math.round(heading)}°`}
                        font={font}
                        color="black"
                    />
                </Canvas>}
            </View>

            {/* BottomBar */}
            {/*<View style={styles.footerBanner}>*/}

            {/*</View>*/}
            <BottomBar/>
    </>
    );
};

const createStyles = (canvasSize) =>
    StyleSheet.create({
        meta: {
            flex: 1,
            position: 'absolute',
            left: 20,
            top: 40,
            zIndex: 20
        },
        metaText: {
            fontSize: 20,
        },
        safeArea: {
            flex: 1,
            backgroundColor: colorScheme.background,
        },
        banner: {
            backgroundColor: colorScheme.primary,
            width: "100%",
            alignItems: "center",
        },
        bannerText: {
            fontSize: 32,
            color: colorScheme.lightText,
            padding: 16,
            textAlign: 'center',
        },
        canvasContainer: {
            flex: 1,
            position: 'relative',
        },
        map: {
            ...StyleSheet.absoluteFillObject,
        },
        canvas: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [
                { translateX: -canvasSize / 2 },
                { translateY: -canvasSize / 2 },
            ],
            width: canvasSize,
            height: canvasSize,
        },
        footerBanner: {
            backgroundColor: colorScheme.primary,
            width: "100%",
            alignItems: "center",
        },
    });

export default CompassScreen;