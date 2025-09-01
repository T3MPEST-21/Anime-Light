import { StyleSheet, Text, TouchableOpacity, View, StyleProp, ViewStyle, TextStyle } from 'react-native'
import React from 'react'
import { radius, second } from '@/constants/theme'
import { hp, wp } from '../helpers/common'

import CustomActivityLoader from './CustomActivityLoader';

interface CustomButtonProps {
    buttonStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    title?: string;
    onPress?: () => void;
    hasShown?: boolean;
    loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    buttonStyle,
    textStyle,
    title = '',
    onPress = () => {},
    hasShown = false,
    loading = false,
}) => {

    const shadowStyle = {
        boxShadow: '0px 10px 8px rgba(0,0,0,0.2)',
        elevation: 4,
    }

    if (loading) {
        return (
            <View style={[styles.button, buttonStyle, { backgroundColor: second.white }]}> 
                <CustomActivityLoader size={60} />
            </View>
        );
    }
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle, hasShown && shadowStyle]}>
        <Text style={[styles.text, textStyle]}> {title} </Text>
    </TouchableOpacity>
  )
}

export default CustomButton

const styles = StyleSheet.create({  
    button: {
        backgroundColor: second.primary,
        height: hp(6.6),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.xl,
        borderCurve: 'continuous'
    },
    text: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        color: second.white,
    }
})