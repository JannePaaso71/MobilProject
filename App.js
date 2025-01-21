import {StyleSheet} from 'react-native';
import MenuScreen from "./screens/MenuScreen";
import SpiritLevelScreen from "./screens/SpiritLevelScreen";
import SpeedometerScreen from "./screens/SpeedometerScreen";
import {MD3LightTheme, PaperProvider} from "react-native-paper";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import colorScheme from "./styles/colorScheme";
import CompassScreen from "./screens/CompassScreen";
import FieldPatchAreaScreen from "./screens/FieldPatchAreaScreen";
import FieldPatchAreaMenu from "./components/FieldPatchAreaMenu";
import TapeMeasureScreen from "./screens/TapeMeasureScreen";
import 'react-native-gesture-handler';
import CompassMenu from "./components/CompassMenu";

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...colorScheme,
    }
}

const Stack = createStackNavigator();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Menu" screenOptions={
                    {headerStyle: [{backgroundColor: colorScheme.primary}] }}>
                    <Stack.Screen name="Menu" component={MenuScreen} />
                    <Stack.Screen name="Vatupassi" component={SpiritLevelScreen} />
                    <Stack.Screen name="Sarkalaskuri"
                                  component={FieldPatchAreaScreen}
                                  options={{
                                      headerRight: () => (
                                          <FieldPatchAreaMenu />
                                      ),
                                  }}
                    />
                    <Stack.Screen name="Nopeusmittari" component={SpeedometerScreen} />
                    <Stack.Screen name="Kompassi"
                                  component={CompassScreen}
                                  options={{
                                      headerRight: () => (
                                          <CompassMenu />
                                      ) }}/>
                    <Stack.Screen name="Metrimitta" component={TapeMeasureScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
