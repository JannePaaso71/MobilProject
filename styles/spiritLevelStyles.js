import {StyleSheet} from "react-native";
import colorScheme from "./colorScheme";

/**
 * Style sheet factory for SpiritLevelScreen.
 * @param canvasWidth
 * @returns {{canvas: {backgroundColor: string, width, marginBottom: string, marginTop: string, height}}}
 */
export default (canvasWidth) => StyleSheet.create({
    canvas: {
        marginTop: "auto",
        marginBottom: "auto",
        backgroundColor: colorScheme.background,
        width: canvasWidth,
        height: canvasWidth,
    },
    speedometerCanvas: {
        marginTop: "auto",
        marginBottom: "auto",
        backgroundColor: colorScheme.background,
        width: canvasWidth,
        height: 1.2*canvasWidth,
    }
})