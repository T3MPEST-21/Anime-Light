import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import React from 'react'
import { hp } from '@/helpers/common'
import { radius, second } from '@/constants/theme'
import {Image} from 'expo-image'
import { getUserImage } from '@/services/ImageService'


interface AvatarProps {
    uri: string;
    size?: number;
    rounded?: number;
    style?: import("react-native").ImageStyle;
}

const Avatar: React.FC<AvatarProps> = ({
    uri,
    size=hp(45),
    rounded=radius.md,
    style={}
}) => {
  return (
    <View>
      <Image 
        source={getUserImage(uri)}
        style={[{ width: size, height: size, borderRadius: rounded }, style]}
      />
    </View>
  )
}

export default Avatar

const styles = StyleSheet.create({
    avatar: {
        borderCurve: 'continuous',
        borderColor: second.darkLight,
        borderWidth: 1
    }
})