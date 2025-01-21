import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import {zoomIn, zoomOut, mapLocked, zoomLevel} from "../signals/compassSignals";

/**
 *
 * @param destination
 * @param onMapPress
 * @param camera { center: {latLon}, pitch, zoom, heading } Camera to the map.
 * @returns {JSX.Element}
 * @constructor
 */
const CustomMapView = ({
                           destination,
                           onMapPress,
                           camera
                       }) => {
    return (
        <MapView
            style={styles.map}
            camera={mapLocked.value ? camera : null}
            initialCamera={{
                center: { latitude:65.01333178773747, longitude: 25.464694270596162 },
                pitch: 85,
                zoom: 15,
                heading: 180
            }}
            zoomTapEnabled={false}
            zoomEnabled={!mapLocked.value}
            mapType="standard"
            showsUserLocation={true}
            showsMyLocationPoint={false}
            onPress={onMapPress}
        >
            {destination && (
                <Marker
                    coordinate={{
                        latitude: destination.latitude,
                        longitude: destination.longitude,
                    }}
                    title="Destination"
                    description="This is the marker location"
                />
            )}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default CustomMapView;
