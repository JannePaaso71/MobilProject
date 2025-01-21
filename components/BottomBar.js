import styles from "../styles/styles";
import {Text, View} from "react-native";
import React from "react";

export default ({text, isError, children}) => {
    return (
        <View style={styles.banner}>
            {text
                ? <Text style={isError ? styles.bannerTextError : styles.bannerText}>{text}</Text>
                : children}
        </View>
    )
}