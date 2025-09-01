import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, second } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';

interface BackButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
  iconSize?: number;
  iconColor?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  iconSize = 20,
  iconColor = '#222',
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} activeOpacity={0.7}>
      <Ionicons name="chevron-back" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: wp(10),
    height: hp(5),
    borderRadius: radius.xl,
    backgroundColor: second.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
  elevation: 3,
    marginLeft: wp(1),
    marginTop: hp(1),
  },
});

export default BackButton;
