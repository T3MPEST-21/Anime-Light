import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/helpers/common';
import { second, radius } from '@/constants/theme';
import CustomActivityLoader from '@/components/CustomActivityLoader';

const { width, height } = Dimensions.get('window');

// Skeleton loading component for gallery
const GallerySkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonCaption} />
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonCaptionShort} />
    <View style={styles.skeletonImage} />
    <CustomActivityLoader style={styles.loader} />
  </View>
);

export default function Gallery() {
  const router = useRouter();
  const { images, captions } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [imageList, setImageList] = useState<string[]>([]);
  const [captionList, setCaptionList] = useState<string[]>([]);

  useEffect(() => {
    // Process the images and captions
    let processedImages: string[] = [];
    let processedCaptions: string[] = [];
    
    if (images) {
      if (typeof images === 'string') {
        const decodedImages = decodeURIComponent(images);
        processedImages = decodedImages.split(',').filter(img => img.trim() !== '');
      } else if (Array.isArray(images)) {
        processedImages = images;
      }
    }
    
    if (captions) {
      if (typeof captions === 'string') {
        const decodedCaptions = decodeURIComponent(captions);
        processedCaptions = decodedCaptions.split(',');
      } else if (Array.isArray(captions)) {
        processedCaptions = captions;
      }
    }
    
    setImageList(processedImages);
    setCaptionList(processedCaptions);
    
    // Simulate loading time for skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [images, captions]);

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={second.text} />
        </TouchableOpacity>
        <GallerySkeleton />
      </View>
    );
  }

  if (imageList.length === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={second.text} />
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={60} color={second.gray} />
          <Text style={styles.emptyText}>No images to display</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={second.text} />
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {imageList.map((imageUri, index) => (
          <View key={index} style={styles.imageContainer}>
            {/* Test with explicit dimensions and different resizeMode */}
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image} 
              resizeMode="cover"
              onLoad={() => console.log(`✅ Image ${index + 1} rendered successfully`)}
              onError={(error) => console.log(`❌ Image ${index + 1} render error:`, error.nativeEvent)}
            />
            
            {/* Backup image with different approach 
            <Image 
              source={{ uri: imageUri }} 
              style={styles.backupImage} 
              resizeMode="contain"
            />*/}
            
            {captionList[index] ? (
              <View style={styles.captionContainer}>
                <Text style={styles.caption}>{captionList[index]}</Text>
              </View>
            ) : null} 
            
            {/* Image counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{index + 1} / {imageList.length}</Text>
            </View>
            
            {/* Debug info
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Image {index + 1}: {imageUri.substring(imageUri.lastIndexOf('/') + 1)}
              </Text>
            </View> */}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeBtn: {
    position: 'absolute',
    top: hp(4),
    right: wp(4),
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: hp(10), // More space for close button
    paddingBottom: hp(4),
  },
  imageContainer: {
    width: width,
    height: height * 0.8, // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    backgroundColor: '#111', // Debug background
    position: 'relative',
  },
  image: {
    width: width - 40,
    height: height * 0.6,
    backgroundColor: '#333',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#555',
  },
  backupImage: {
    position: 'absolute',
    width: width - 60,
    height: height * 0.5,
    backgroundColor: '#222',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#777',
    opacity: 0.5,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  caption: {
    color: '#fff',
    fontSize: hp(1.8),
    textAlign: 'center',
    lineHeight: hp(2.4),
  },
  imageCounter: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: hp(1.6),
    fontWeight: '600',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
    padding: 8,
  },
  debugText: {
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
  },
  emptyText: {
    color: '#fff',
    fontSize: hp(2),
    marginTop: 16,
    textAlign: 'center',
  },
  
  // Skeleton styles
  skeletonContainer: {
    flex: 1,
    paddingTop: hp(8),
    paddingHorizontal: wp(4),
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 99,
  },
  skeletonImage: {
    width: width * 0.92,
    height: height * 0.4,
    backgroundColor: '#333',
    borderRadius: radius.lg,
    marginBottom: hp(2),
    opacity: 0.6,
    alignSelf: 'center',
  },
  skeletonCaption: {
    width: width * 0.7,
    height: hp(2),
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: hp(4),
    opacity: 0.6,
    alignSelf: 'center',
  },
  skeletonCaptionShort: {
    width: width * 0.5,
    height: hp(2),
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: hp(4),
    opacity: 0.6,
    alignSelf: 'center',
  },
});