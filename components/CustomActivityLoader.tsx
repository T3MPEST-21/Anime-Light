import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface CustomActivityLoaderProps {
  style?: ViewStyle;
  size?: number;
}

const CustomActivityLoader: React.FC<CustomActivityLoaderProps> = ({ style, size = 40 }) => {
  return (
    <View style={[styles.container, style]}> 
      <Image
        source={require('../assets/images/Pikachu.gif')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomActivityLoader;
