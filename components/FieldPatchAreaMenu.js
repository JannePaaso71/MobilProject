import * as React from 'react';
import { View } from 'react-native';
import {Button, Divider, Icon, Menu} from 'react-native-paper';
import {useState} from "react";
import {points, area, error} from "../signals/fieldPatchAreaSignals"

const FieldPatchAreaMenu = () => {
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
                    points.value = [...points.value.slice(0, points.value.length - 1)]
                }} title="Poista viimeisin piste" />
                <Menu.Item onPress={() => {
                    points.value = []
                }} title="Tyhjennä pisteet" />
            </Menu>
        </View>
    );
};

export default FieldPatchAreaMenu