import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/helpers/common';
import { second, radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function Gallery() {
  const router = useRouter();
  const { images, captions } = useLocalSearchParams();
  // images: comma-separated URLs, captions: comma-separated captions
  const imageList = images ? decodeURIComponent(images as string).split(',') : [];
  const captionList = captions ? decodeURIComponent(captions as string).split(',') : [];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={28} color={second.text} />
      </TouchableOpacity>
      <FlatList
        data={imageList}
        keyExtractor={(_, idx) => idx.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
            {captionList[index] ? (
              <Text style={styles.caption}>{captionList[index]}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: hp(4),
    right: wp(4),
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
  },
  imageWrapper: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(10),
  },
  image: {
    width: width * 0.9,
    height: hp(50),
    borderRadius: radius.xl,
    marginBottom: 12,
  },
  caption: {
    color: '#fff',
    fontSize: hp(2),
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
