import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import LottieView from 'lottie-react-native';

interface CustomActivityLoaderProps {
  style?: ViewStyle;
  size?: number;
}

const CustomActivityLoader: React.FC<CustomActivityLoaderProps> = ({ style, size = 40 }) => {
  return (
    <View style={[styles.container, style]}>
      <LottieView
        source={require('../assets/lottie/Pikachu.json')}
        autoPlay
        loop
        style={{ width: size, height: size }}
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
