import React, { useRef, useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { hp, wp } from '@/helpers/common';
import { radius, second } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import Avatar from '@/components/Avatar';
import RichTextEditor from '@/components/RichTextEditor';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { imageFile } from '@/services/ImageService';
import CustomActivityLoader from '@/components/CustomActivityLoader';
import { RichEditor } from 'react-native-pell-rich-editor';

export default function Create() {
  const router = useRouter();
  const { user } = useAuth() || {};
  const bodyRef = useRef('');
  const editorRef = useRef<RichEditor>(null);
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState<{ uri: string; caption: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pick multiple images
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => ({ uri: asset.uri, caption: '' }));
      setMediaList(prev => [...prev, ...newImages]);
    }
  };

  // Remove a single image
  const removeImage = (idx: number) => {
    setMediaList(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit post
  const handlePost = async () => {
    setError('');
    setSuccess('');
    if (!user || !user.id) {
      setError('You must be logged in to post.');
      return;
    }
    const body = (bodyRef.current || '').trim();
    if (!body && mediaList.length === 0) {
      setError('Post cannot be empty.');
      return;
    }

    console.log('=== Starting post creation ===');
    console.log('User ID:', user.id);
    console.log('Body:', body);
    console.log('Media list length:', mediaList.length);
    console.log('Media list:', mediaList);

    setLoading(true);
    try {
      // 1) Upload images (if any) to Supabase Storage and collect URLs
      const uploaded: { url: string; caption: string }[] = [];
      for (let i = 0; i < mediaList.length; i++) {
        const item = mediaList[i];
        console.log(`\n--- Uploading image ${i + 1}/${mediaList.length} ---`);
        console.log('Image URI:', item.uri);
        
        const res = await imageFile(`posts/${user.id}`, item.uri, true);
        console.log(`Image ${i + 1} upload result:`, res);
        
        if (!res.success || !res.data) {
          console.log(`Image ${i + 1} upload failed:`, res);
          throw new Error(`Failed to upload image ${i + 1}: ${res.msg || 'Unknown error'}`);
        }
        uploaded.push({ url: res.data, caption: item.caption || '' });
      }
      console.log('\n--- All images uploaded successfully ---');
      console.log('Uploaded images:', uploaded);

      // 2) Insert the post row
      console.log('\n--- Inserting post row ---');
      const postData = { user_id: user.id, body };
      console.log('Post data to insert:', postData);
      
      const { data: postInsert, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select('id')
        .single();

      console.log('Post insert result:', { postInsert, postError });
      if (postError) {
        console.log('Post error details:', postError);
        throw new Error(`Failed to create post: ${postError.message}`);
      }
      if (!postInsert) {
        throw new Error('Failed to create post: No data returned');
      }

      // 3) Insert post_images rows (if any)
      if (uploaded.length > 0) {
        console.log('\n--- Inserting post images ---');
        const imagesRows = uploaded.map((u) => ({ 
          post_id: postInsert.id, 
          image_url: u.url, 
          caption: u.caption 
        }));
        console.log('Images rows to insert:', imagesRows);
        
        const { error: imagesError } = await supabase.from('post_images').insert(imagesRows);
        console.log('Images insert result:', { imagesError });
        
        if (imagesError) {
          console.log('Images error details:', imagesError);
          throw new Error(`Failed to save images: ${imagesError.message}`);
        }
      }

      // 4) Reset UI and show success
      console.log('\n=== Post created successfully! ===');
      setSuccess('Post created successfully!');
      setMediaList([]);
      bodyRef.current = '';
      // Clear the rich text editor
      editorRef.current?.setContentHTML('');
      // Optionally navigate back to feed
      // router.replace('/(tabs)')
    } catch (e: any) {
      console.log('\n=== CREATE POST ERROR ===');
      console.log('Error object:', e);
      console.log('Error message:', e?.message || 'Unknown error');
      console.log('Error stack:', e?.stack);
      setError(`Failed to create post: ${e?.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Create Post" ShowBackButton={true} marginBottom={hp(2)} />
      <ScrollView contentContainerStyle={{ gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.Header}>
          <Avatar uri={user?.image} size={hp(6.5)} rounded={radius.xl} />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{user?.username || 'User'}</Text>
            <Text style={styles.publicText}>Public</Text>
          </View>
        </View>

        {/* Rich Text Editor */}
        <View style={styles.textEditor}>
          <RichTextEditor editorRef={editorRef} onChange={body => (bodyRef.current = body)} />
        </View>

        {/* Media Preview & Picker */}
        <View style={styles.mediaPickerSection}>
          <View style={styles.mediaGrid}>
            {mediaList.map((img, idx) => (
              <View key={idx} style={styles.mediaGridItem}>
                <Image source={{ uri: img.uri }} style={styles.mediaPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.deleteIcon} onPress={() => removeImage(idx)}>
                  {/* Ionicons should be imported if not already */}
                  <Text style={{ color: '#fff', fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
            {mediaList.length < 10 && (
              <TouchableOpacity style={styles.addMediaBtn} onPress={pickImages}>
                {/* Ionicons should be imported if not already */}
                <Text style={{ color: second.primary, fontSize: 28 }}>＋</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Error/Success */}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postBtn, loading && { opacity: 0.7 }]}
          onPress={handlePost}
          disabled={loading}
        >
          {loading ? <CustomActivityLoader size={25} /> : <Text style={styles.postBtnText}>Post</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title:{
    fontSize: hp(2.5),
    fontWeight: '400',
    color: second.text,
    textAlign: 'center',
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: second.darkLight,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: '500',
    color: second.text,
  },
  mediaPickerSection: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    gap: 10,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: hp(10),
  },
  mediaGridItem: {
    position: 'relative',
    marginBottom: 8,
  },
  mediaPreview: {
    width: wp(28),
    height: hp(13),
    borderRadius: radius.lg,
  },
  deleteIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#d00',
    borderRadius: 12,
    padding: 2,
    zIndex: 2,
  },
  addMediaBtn: {
    width: wp(28),
    height: hp(13),
    borderRadius: radius.lg,
    backgroundColor: '#f3f3f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: second.primary,
  },
  postBtn: {
    backgroundColor: second.primary,
    paddingVertical: 14,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginTop: 10,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: hp(2.1),
  },
  error: {
    color: '#d00',
    textAlign: 'center',
    marginTop: 4,
    fontSize: hp(1.8),
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginTop: 4,
    fontSize: hp(1.8),
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: '500',
    color: second.text,
  },
  textEditor: {
    //marginTop: 10
  }
});