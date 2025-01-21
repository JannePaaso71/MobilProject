import BottomBar from "../components/BottomBar";
import {Text, View} from "react-native";
import styles from "../styles/styles";
import MapView, {MapPolygon, Marker, Polyline} from "react-native-maps";
import useLocation from "../hooks/useLocation";
import useFieldPatchArea from "../hooks/useFieldPatchArea";
import React, {useState} from "react";
import {Button, Icon} from "react-native-paper";
import style from "../styles/styles";
import colorScheme from "../styles/colorScheme";

export default () => {
    const {location, meta, errorMsg} = useLocation();
    const {pushPoint, popPoint, points, area, error} = useFieldPatchArea()
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [markers, setMarkers] = useState([])
    const [mapPosLockedToUser, setMapPosLockedToUser] = useState(true)
    const [zoom, setZoom] = useState({latitudeDelta: 0.003, longitudeDelta: 0.003})
    return (
        <View style={styles.container}>
            <MapView initialRegion={{...location, ...zoom}}
                     onLongPress={(ev) => setSelectedPoint(ev.nativeEvent.coordinate)}
                     style={styles.map}
                     onPanDrag={(_ev) => {
                         setMapPosLockedToUser(false)
                     }}
                     onDoublePress={(_ev) => {
                         setMapPosLockedToUser(true)
                     }}
                     zoomTapEnabled={false}
                     zoomEnabled={true}
                     mapType="hybrid"
                     showsUserLocation={true}
                     userLocationAnnotationTitle="Moon täs"
            >
                    {selectedPoint !== null && <Marker
                        pinColor="green"
                        coordinate={selectedPoint}
                        title="Mun valittema piste"
                        onPress={() => setSelectedPoint(null)}
                    />}
                    {points.value.length >= 3 && <MapPolygon
                        coordinates={points.value}
                        strokeColor={colorScheme.accent}
                        fillColor={"rgba(255,216,71,0.25)"}
                        strokeWidth={3}
                    />}
                    {points.value.length <= 1 ?
                        (points.value[0] && <Marker key={0} coordinate={points.value[0]} title={"Eka aluepiste"}/>) :
                        points.value.length === 2 && <Polyline coordinates={points.value} strokeWidth={3} strokeColor={colorScheme.accent} /> }
                </MapView>
            <View style={{flex: 1, position: "absolute", bottom: 60, flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button style={style.navigationButton}
                        disabled={selectedPoint === null}
                        onPress={() => selectedPoint && pushPoint(selectedPoint)}
                >
                    <Icon size={22} source="map-outline" color={ selectedPoint ? colorScheme.text : "#aaa"} />
                    <Text style={selectedPoint ? style.buttonText : {...style.buttonText, color: "#aaa"}}>Karttapiste</Text>
                </Button>
                <Button style={style.navigationButton}
                        mode="contained"
                        onPress={() => {pushPoint(location)}}>
                    <Icon size={22} source="crosshairs-gps"/>
                    <Text style={style.buttonText}>GPS piste</Text>
                </Button>
            </View>

            <BottomBar text={errorMsg ? errorMsg : error.value} isError={error.value} >
                <View style={{...styles.bottomBarWithChildren, textAlign: "center", paddingLeft: 8, paddingRight: 8}}>
                    {area.value.ha > 0 && <Text style={style.buttonText}>
                        Pinta-ala: {area.value.ha.toFixed(2)}ha
                    </Text>}
                </View>
            </BottomBar>

        </View>
    )
}
