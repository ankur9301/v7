import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/src/supabaseClient';
import { useTheme, lightTheme, darkTheme } from '../../context/ThemeContext';
import { useUserStore } from '@/store/useUserStore';



export default function EditProfileScreen() {
  const { userData }: { userData: { id: string; email: string; username?: string; avatar_url?: string } | null } = useUserProfile();
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;

  const [username, setUsername] = useState(userData?.username ?? '');
  const [email, setEmail] = useState(userData?.email ?? '');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      let imageUrl = userData?.avatar_url;
  
      if (image) {
        const fileExt = image.split('.').pop();
        const fileName = `${userData?.id ?? 'default'}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
  
        const response = await fetch(image);
        const blob = await response.blob();
  
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
          });
  
        if (uploadError) throw uploadError;
  
        const { data: publicUrlData } = supabase
          .storage
          .from('avatars')
          .getPublicUrl(filePath);
  
        imageUrl = publicUrlData.publicUrl;
      }
  
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          email,
          avatar_url: imageUrl,
        })
        .eq('id', userData?.id ?? '');
  
      if (error) throw error;
  
      // ✅ Sync Zustand
      useUserStore.getState().setUser({
        id: userData?.id ?? '',
        email,
        username,
        avatar_url: imageUrl,
      });
  
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };
  

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
  {image || userData?.avatar_url ? (
    <Image
      source={{ uri: image || userData?.avatar_url }}
      style={styles.profileImage}
    />
  ) : (
    <View style={[styles.initialAvatar, { backgroundColor: '#ccc' }]}>
      <Text style={styles.initialText}>
        {userData?.username?.charAt(0).toUpperCase() || 'U'}
      </Text>
    </View>
  )}
  <Text style={[styles.changePhotoText, { color: colors.text }]}>Change Photo</Text>
</TouchableOpacity>


      <TextInput
        placeholder="Username"
        placeholderTextColor={colors.secondaryText}
        value={username}
        onChangeText={setUsername}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor={colors.secondaryText}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 12,
  },
  changePhotoText: {
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-Medium',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontFamily: 'Montserrat-Regular',
  },
  saveButton: {
    backgroundColor: '#4361ee',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  initialAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  
});
