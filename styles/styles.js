import {StyleSheet} from "react-native";
import colorScheme from "./colorScheme";

/**
 * Common styles among the various screens.
 */
export default StyleSheet.create({
    padding: {
        height: 20,
    },
    banner: {
        backgroundColor: colorScheme.primary,
        width: "100%",
        alignItems: "center",
    },
    bannerText: {
        fontSize: 32, // Increase the font size
        color: colorScheme.lightText, // Set the text color
        padding: 16,
        width: "100%",
        textAlign: 'center',
    },
    bannerTextError: {
        fontSize: 32, // Increase the font size
        color: colorScheme.error, // Set the text color
        padding: 16,
        width: "100%",
        textAlign: 'center',
    },
    safeArea: {
        height: '100%',
        backgroundColor: colorScheme.background
    },
    container:  {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colorScheme.background,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
    },
    bottomBarWithChildren: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: "60",
        width: "100%",
        flexDirection: 'row',
        backgroundColor: colorScheme.primary,
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 0,
        padding: 0,
    },
    navigationButton: {
        flex: 1,
        margin: 20,
        width: "75%",
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colorScheme.innerCircle,
        borderRadius: 28,
        padding: 0,
        borderColor: colorScheme.accent,
        borderWidth: 3,
    },
    demoButton: {
        margin: 10,
        width: "30%",
        height: "10%",
        justifyContent: 'center',
        backgroundColor: colorScheme.primary,
        borderRadius: 28,
        padding: 0,
        borderColor: colorScheme.innerCircle,
        borderWidth: 3,
    },
    startButton: {
        marginTop: 40,
        width: "25%",
        height: "8%",
        justifyContent: 'center',
        backgroundColor: colorScheme.primary,
        borderRadius: 28,
        padding: 0,
        borderColor: colorScheme.innerCircle,
        borderWidth: 3,
    },
    buttonText: {
        fontSize: 20, // Adjust font size as needed
        color: colorScheme.text, // Text color
        textAlign: 'center',
    },
    lightButtonText: {
        fontSize: 20, // Adjust font size as needed
        color: colorScheme.lightText, // Text color
        textAlign: 'center',
    },
    bottomBarButton: {
        margin: 5,
        width: "45%",
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        left: 0,
        bottom: 0,
        flex: 1,
        height: "100%",
        width: '100%',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    bigText: {
        fontSize: 60,
        fontWeight: 'bold',
        marginBottom: 20,
    }
});
