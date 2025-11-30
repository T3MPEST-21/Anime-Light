import Avatar from '@/components/Avatar';
import CustomActivityLoader from '@/components/CustomActivityLoader';
import Header from '@/components/Header';
import RichTextEditor from '@/components/RichTextEditor';
import { radius, second } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/context/themeContext';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/lib/supabase';
import { imageFile } from '@/services/ImageService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RichEditor } from 'react-native-pell-rich-editor';


export default function Create() {
  const router = useRouter();
  const { user } = useAuth() || {};
  const { theme } = useTheme();
  const bodyRef = useRef('');
  const editorRef = useRef<RichEditor>(null);
  const [loading, setLoading] = useState(false);
  const [mediaList, setMediaList] = useState<{ uri: string; caption: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captionModalVisible, setCaptionModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [tempCaption, setTempCaption] = useState('');

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

  // Open caption modal
  const openCaptionModal = (idx: number) => {
    setSelectedImageIndex(idx);
    setTempCaption(mediaList[idx]?.caption || '');
    setCaptionModalVisible(true);
  };

  // Save caption
  const saveCaption = () => {
    if (selectedImageIndex !== null) {
      setMediaList(prev => {
        const updated = [...prev];
        updated[selectedImageIndex].caption = tempCaption;
        return updated;
      });
    }
    setCaptionModalVisible(false);
    setTempCaption('');
    setSelectedImageIndex(null);
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
      setTimeout(() => {
        router.replace('/(tabs)')
      }, 900);
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Create Post" ShowBackButton={true} marginBottom={hp(2)} />
      <ScrollView contentContainerStyle={{ gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.Header}>
          <Avatar uri={user?.image} size={hp(6.5)} rounded={radius.xl} />
          <View style={{ gap: 2 }}>
            <Text style={[styles.username, { color: theme.text }]}>{user?.username || 'User'}</Text>
            <Text style={[styles.publicText, { color: theme.textSecondary }]}>Public</Text>
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
                
                {/* Caption indicator */}
                {img.caption && (
                  <View style={[styles.captionBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.captionBadgeText}>📝</Text>
                  </View>
                )}

                {/* Actions overlay */}
                <View style={styles.actionsOverlay}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => openCaptionModal(idx)}
                  >
                    <Ionicons name="pencil" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: theme.error }]}
                    onPress={() => removeImage(idx)}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {mediaList.length < 10 && (
              <TouchableOpacity style={[styles.addMediaBtn, { backgroundColor: theme.surface, borderColor: theme.primary }]} onPress={pickImages}>
                <Ionicons name="add" size={32} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Caption Modal */}
        <Modal
          visible={captionModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCaptionModalVisible(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Caption</Text>
              
              <Image 
                source={{ uri: mediaList[selectedImageIndex!]?.uri }} 
                style={styles.modalPreview}
                resizeMode="contain"
              />
              
              <TextInput
                style={[styles.captionInput, { 
                  backgroundColor: theme.inputBackground, 
                  borderColor: theme.inputBorder,
                  color: theme.text,
                }]}
                placeholder="Add a caption for this image..."
                placeholderTextColor={theme.placeholder}
                multiline
                maxLength={200}
                value={tempCaption}
                onChangeText={setTempCaption}
              />

              <Text style={[styles.captionCount, { color: theme.textSecondary }]}>
                {tempCaption.length}/200
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: theme.inputBackground }]}
                  onPress={() => setCaptionModalVisible(false)}
                >
                  <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  onPress={saveCaption}
                >
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Error/Success */}
        {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}
        {success ? <Text style={[styles.success, { color: theme.success }]}>{success}</Text> : null}

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
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
  captionBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  captionBadgeText: {
    fontSize: 12,
  },
  actionsOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    gap: 6,
    zIndex: 2,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  postBtn: {
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
    textAlign: 'center',
    marginTop: 4,
    fontSize: hp(1.8),
  },
  success: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: hp(1.8),
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: '500',
  },
  textEditor: {
    //marginTop: 10
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  modalContent: {
    borderRadius: radius.xl,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalPreview: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    marginBottom: 12,
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 12,
    minHeight: 80,
    fontSize: hp(1.8),
    textAlignVertical: 'top',
  },
  captionCount: {
    alignSelf: 'flex-end',
    fontSize: hp(1.6),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: hp(1.8),
    fontWeight: '600',
  },
});