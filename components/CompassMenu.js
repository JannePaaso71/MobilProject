import * as React from 'react';
import { View } from 'react-native';
import {Button, Divider, Icon, Menu} from 'react-native-paper';
import {useState} from "react";
import {
    showCompassRim,
    zoomIn,
    zoomOut,
    mapLocked,
    calibrationDataVisible,
    resetCalibrationDataSignal
} from "../signals/compassSignals";

const CompassMenu = () => {
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'center',
            }}>
            <Menu
                style={{position: visible ? "absolute" : "static", top: 100}}
                visible={visible}
                onDismiss={closeMenu}
                anchor={<Button onPress={openMenu}><Icon size={30} source="menu"/></Button>}>
                <Menu.Item onPress={() => {
                    showCompassRim.value = !showCompassRim.value;
                }} title={showCompassRim.value ? "Piilota kehä" : "Näytä kehä"} />
                <Menu.Item onPress={() => {
                    mapLocked.value = !mapLocked.value
                }} title={mapLocked.value ? "Vapauta kartta" : "Lukitse kartta"}/>
                <Divider />
                <Divider />
                {mapLocked.value &&
                    <Menu.Item onPress={() => {
                        zoomIn()
                        }} title="Zoomaa lähemmäs" />}
                {mapLocked.value &&
                    <Menu.Item onPress={() => {
                        zoomOut()
                        }} title="Zoomaa kauemmas" />}
                <Divider />
                <Divider />
                <Menu.Item
                    onPress={() => {
                        calibrationDataVisible.value = !calibrationDataVisible.value
                    }}
                    title={calibrationDataVisible.value ? "Piilota kalibrointidata" : "Näytä kalibrointidata"} />
                <Menu.Item
                    onPress={() => {
                        resetCalibrationDataSignal.value = true
                    }}
                    title={"Kalibroi uudestaan"} />
            </Menu>
        </View>
    );
};

export default CompassMenu
