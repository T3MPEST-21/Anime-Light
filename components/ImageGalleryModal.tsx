import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { second } from '@/constants/theme';
import { useTheme } from '@/context/themeContext';
import { hp, wp } from '@/helpers/common';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageGalleryModalProps {
  visible: boolean;
  images: string[];
  captions: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageGalleryModal({
  visible,
  images,
  captions,
  initialIndex = 0,
  onClose,
}: ImageGalleryModalProps) {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      // Circle pop animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, initialIndex]);

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageSlide}>
      <Image
        source={{ uri: item }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );

  // Scroll to initial index when modal opens
  useEffect(() => {
    if (visible && flatListRef.current && images.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: initialIndex, 
          animated: false 
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  if (!visible || images.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor={isDark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.7)"} barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Semi-transparent overlay */}
      <Animated.View style={[styles.overlay, { opacity: opacityAnim, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)' }]}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        {/* Modal content */}
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            }
          ]}
        >
          {/* Close button */}
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)' }]} onPress={handleClose}>
            <Ionicons name="close" size={30} color={isDark ? "white" : "black"} />
          </TouchableOpacity>

          {/* Image counter */}
          {images.length > 1 && (
            <View style={[styles.counter, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)' }]}>
              <Text style={[styles.counterText, { color: isDark ? 'white' : 'black' }]}>
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* Image carousel */}
          <View style={styles.imageContainer}>
            <FlatList
              ref={flatListRef}
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(data, index) => ({
                length: screenWidth * 0.95,
                offset: screenWidth * 0.95 * index,
                index,
              })}
            />
          </View>

          {/* Caption */}
          {captions[currentIndex] && (
            <View style={[styles.captionContainer, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)' }]}>
              <Text style={[styles.captionText, { color: isDark ? 'white' : 'black' }]}>
                {captions[currentIndex]}
              </Text>
            </View>
          )}

          {/* Navigation dots */}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)' },
                    index === currentIndex && [styles.activeDot, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setCurrentIndex(index)}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    padding: 8,
  },
  counter: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterText: {
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSlide: {
    width: screenWidth * 0.95,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    borderRadius: 10,
    padding: 12,
  },
  captionText: {
    fontSize: hp(1.9),
    textAlign: 'center',
    lineHeight: hp(2.4),
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
