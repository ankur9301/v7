import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Switch, Alert, TextInput, ActivityIndicator,
  StatusBarStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useTheme, lightTheme, darkTheme } from '../../context/ThemeContext';
import { useUserStore } from '@/store/useUserStore';
import { supabase } from '@/src/supabaseClient';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  const { user, setUser, clearUser } = useUserStore();
  
  const [username, setUsername] = useState('');
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Sync local state with user store whenever user changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setLocalImage(user.avatar_url || null);
    }
  }, [user]);

  // Fetch fresh profile data when screen comes into focus
  const fetchProfile = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (data && !error) {
      setUser(data);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [user?.id])
  );

  const pickImage = async () => {
    if (!editing) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const uploadImageToSupabase = async (uri: string) => {
    const ext = uri.split('.').pop() || 'jpg';
    if (!user) {
      throw new Error("User is not defined.");
    }
    const filename = `${user.id}_${Date.now()}.${ext}`;
    const base64 = await FileSystem.readAsStringAsync(uri, { 
      encoding: FileSystem.EncodingType.Base64 
    });
    const buffer = decode(base64);

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filename, buffer, {
        contentType: `image/${ext}`,
        cacheControl: '3600',
        upsert: true,
      });
      
    if (uploadErr) throw uploadErr;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filename);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found.');
      return;
    }
    
    setIsSaving(true);

    let avatar_url = user.avatar_url;
    if (localImage && !localImage.startsWith('http')) {
      try {
        avatar_url = await uploadImageToSupabase(localImage);
      } catch (err) {
        console.error('Upload failed', err);
        Alert.alert('Image Upload Failed', 'Profile updated without image.');
      }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, avatar_url })
        .eq('id', user.id);

      if (error) throw error;
      
      setUser({ ...user, username, avatar_url });
      Alert.alert('Success', 'Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      console.error('Profile update error', err);
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Logout error:', error);
            return;
          }
          clearUser();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const cancelEditing = () => {
    setEditing(false);
    setUsername(user?.username || '');
    setLocalImage(user?.avatar_url || null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as 'auto' | 'inverted' | 'light' | 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={editing ? pickImage : undefined} style={styles.avatarContainer}>
            {localImage ? (
              <Image source={{ uri: localImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>
                  {username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            {editing && (
              <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            {editing ? (
              <TextInput
                style={[styles.profileName, { color: colors.text, borderBottomWidth: 1, borderColor: colors.border }]}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                placeholderTextColor={colors.secondaryText}
              />
            ) : (
              <Text style={[styles.profileName, { color: colors.text }]}>{user?.username || 'Loading...'}</Text>
            )}
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.editIcon}>
                <Ionicons name="create-outline" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>{user?.email || 'Loading...'}</Text>

          {editing && (
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' },
                ]}
                onPress={cancelEditing}
                disabled={isSaving}
              >
                <Text style={{ color: isDarkMode ? '#FF7A7A' : '#F55353', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: '#4361ee' }]} 
                onPress={handleSave} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>12,500</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>KCAL</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>30</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Days Streak</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
                <Ionicons name="person" size={20} color={isDarkMode ? '#6E8AFA' : '#4361ee'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Personal Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={20} color={isDarkMode ? '#5AE875' : '#3CCF4E'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
                <Ionicons name="card" size={20} color={isDarkMode ? '#FF7A7A' : '#F55353'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
                <Ionicons name="notifications" size={20} color={isDarkMode ? '#6E8AFA' : '#4361ee'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e0e0e0', true: isDarkMode ? '#FF9500' : '#4361ee' }}
              thumbColor="#ffffff"
            />
          </View>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
                <Ionicons name="moon" size={20} color={isDarkMode ? '#FF9500' : '#3CCF4E'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e0e0e0', true: '#FF9500' }}
              thumbColor="#ffffff"
            />
          </View>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
                <Ionicons name="language" size={20} color={isDarkMode ? '#FF7A7A' : '#F55353'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Language</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemRightText, { color: colors.secondaryText }]}>English</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
                <Ionicons name="help-circle" size={20} color={isDarkMode ? '#6E8AFA' : '#4361ee'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color={isDarkMode ? '#5AE875' : '#3CCF4E'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Contact Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
                <Ionicons name="star" size={20} color={isDarkMode ? '#FF9500' : '#F55353'} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.text }]}>Rate the App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color={isDarkMode ? '#FF7A7A' : '#F55353'} />
          <Text style={[styles.logoutText, { color: isDarkMode ? '#FF7A7A' : '#F55353' }]}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.secondaryText }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontWeight: 'bold', fontSize: 24 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30 },
  profileSection: { alignItems: 'center', marginBottom: 24, padding: 20, borderRadius: 16 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  changePhotoButton: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#4361ee', borderRadius: 16 },
  changePhotoText: { color: '#fff', fontWeight: '500', fontSize: 12 },
  nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  profileName: { fontWeight: 'bold', fontSize: 20 },
  editIcon: { marginLeft: 8, padding: 4 },
  profileEmail: { fontWeight: '500', fontSize: 14, marginBottom: 16 },
  editButtons: { flexDirection: 'row', marginTop: 12, width: '100%', justifyContent: 'space-around' },
  editButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, minWidth: 120, alignItems: 'center' },
  statsSection: { flexDirection: 'row', borderRadius: 16, padding: 16, marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  statLabel: { fontWeight: '500', fontSize: 14 },
  statDivider: { width: 1, height: '80%' },
  section: { borderRadius: 16, padding: 16, marginBottom: 24 },
  sectionTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(240,240,240,0.3)' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuItemText: { fontWeight: '600', fontSize: 16 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  menuItemRightText: { fontWeight: '500', fontSize: 14, marginRight: 8 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 16, marginBottom: 16 },
  logoutText: { fontWeight: '600', fontSize: 16, marginLeft: 8 },
  versionText: { fontWeight: '500', fontSize: 14, textAlign: 'center' },
});

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Switch,
//   Alert,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';
// import * as FileSystem from 'expo-file-system';
// import { decode } from 'base64-arraybuffer';

// import { useTheme, lightTheme, darkTheme } from '../../context/ThemeContext';
// import { useUserStore } from '@/store/useUserStore';
// import { supabase } from '@/src/supabaseClient';
// import { useFocusEffect } from '@react-navigation/native';


// export default function ProfileScreen() {
//   const router = useRouter();
//   const { theme, isDarkMode, toggleTheme } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;
//   const { user } = useUserStore();

//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [editing, setEditing] = useState(false);
//   const [username, setUsername] = useState(user?.username ?? '');
//   const [image, setImage] = useState(user?.avatar_url || null);
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setUsername(user.username || '');
//       setImage(user.avatar_url || null);
//     }
//   }, [user]);


//   const fetchProfile = async () => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', user?.id || '')
//       .single();
//     if (!error && data) {
//       useUserStore.getState().setUser(data);
//       setUsername(data.username);
//       setImage(data.avatar_url);
//     }
//   };
  
//   useFocusEffect(
//     React.useCallback(() => {
//       fetchProfile();
//     }, [user?.id])
//   );
  
//   const pickImage = async () => {
//     if (!editing) return;
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const handleSave = async () => {
//     if (!user?.id) {
//       Alert.alert('Error', 'Cannot update profile. User not found.');
//       return;
//     }
//     setIsSaving(true);

//     let imageUrl = image;
//     if (image && !image.startsWith('http')) {
//       try {
//         const ext = image.split('.').pop() || 'jpg';
//         const filename = `${user.id}_${Date.now()}.${ext}`;
//         const base64 = await FileSystem.readAsStringAsync(image, {
//           encoding: FileSystem.EncodingType.Base64,
//         });
//         const buffer = decode(base64);

//         const { error: uploadErr } = await supabase.storage
//           .from('avatars')
//           .upload(filename, buffer, {
//             contentType: `image/${ext}`,
//             cacheControl: '3600',
//             upsert: true,
//           });
//         if (uploadErr) throw uploadErr;

//         const {
//           data: { publicUrl },
//         } = supabase.storage.from('avatars').getPublicUrl(filename);
//         imageUrl = publicUrl;
//       } catch (err) {
//         console.error('Upload error', err);
//         Alert.alert(
//           'Image Upload Failed',
//           'Profile will update without the new image.'
//         );
//         imageUrl = user.avatar_url || null;
//       }
//     }

//     try {
//       const { error } = await supabase
//         .from('profiles')
//         .update({ username, avatar_url: imageUrl })
//         .eq('id', user.id);
//       if (error) throw error;

//       useUserStore.getState().setUser({
//         ...user,
//         username,
//         avatar_url: imageUrl ?? undefined,
//       });
//       Alert.alert('Success', 'Profile updated successfully');
//       setEditing(false);
//     } catch (err) {
//       console.error('Profile update error', err);
//       Alert.alert('Error', 'Could not update profile. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleLogout = async () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         onPress: async () => {
//           const { error } = await supabase.auth.signOut();
//           if (error) console.error('Logout failed:', error.message);
//           else {
//             useUserStore.getState().clearUser();
//             router.replace('/auth/login');
//           }
//         },
//       },
//     ]);
//   };

//   const cancelEditing = () => {
//     setEditing(false);
//     setUsername(user?.username || '');
//     setImage(user?.avatar_url || null);
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <StatusBar style={colors.statusBar as any} />

//       <View style={styles.header}>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
//       </View>

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
//           <TouchableOpacity onPress={editing ? pickImage : undefined} style={styles.avatarContainer}>
//             {image ? (
//               <Image source={{ uri: image }} style={styles.profileImage} />
//             ) : (
//               <View style={[styles.profileImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
//                 <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>
//                   {username?.[0]?.toUpperCase() || '?'}
//                 </Text>
//               </View>
//             )}
//             {editing && (
//               <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
//                 <Text style={styles.changePhotoText}>Change Photo</Text>
//               </TouchableOpacity>
//             )}
//           </TouchableOpacity>

//           <View style={styles.nameContainer}>
//             {editing ? (
//               <TextInput
//                 style={[styles.profileName, { color: colors.text, borderBottomWidth: 1, borderColor: colors.border }]}
//                 value={username}
//                 onChangeText={setUsername}
//                 placeholder="Enter username"
//                 placeholderTextColor={colors.secondaryText}
//               />
//             ) : (
//               <Text style={[styles.profileName, { color: colors.text }]}>{user?.username || 'Loading...'}</Text>
//             )}
//             {!editing && (
//               <TouchableOpacity onPress={() => setEditing(true)} style={styles.editIcon}>
//                 <Ionicons name="create-outline" size={20} color={colors.secondaryText} />
//               </TouchableOpacity>
//             )}
//           </View>

//           <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>{user?.email || 'Loading...'}</Text>

//           {editing && (
//             <View style={styles.editButtons}>
//               <TouchableOpacity
//                 style={[
//                   styles.editButton,
//                   { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' },
//                 ]}
//                 onPress={cancelEditing}
//                 disabled={isSaving}
//               >
//                 <Text style={{ color: isDarkMode ? '#FF7A7A' : '#F55353', fontFamily: 'Montserrat-SemiBold' }}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.editButton, { backgroundColor: '#4361ee' }]} onPress={handleSave} disabled={isSaving}>
//                 {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontFamily: 'Montserrat-SemiBold' }}>Save Changes</Text>}
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>

//         {/* Stats */}
//         <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
//           </View>
//           <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>12,500</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>KCAL</Text>
//           </View>
//           <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>30</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Days Streak</Text>
//           </View>
//         </View>

//         {/* Account Section */}
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="person" size={20} color={isDarkMode ? '#6E8AFA' : '#4361ee'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Personal Information</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="shield-checkmark" size={20} color={isDarkMode ? '#5AE875' : '#3CCF4E'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy & Security</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="card" size={20} color={isDarkMode ? '#FF7A7A' : '#F55353'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Payment Methods</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//         </View>

//         {/* Preferences Section */}
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="notifications" size={20} color={isDarkMode ? '#6E8AFA' : '#4361ee'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
//             </View>
//             <Switch
//               value={notificationsEnabled}
//               onValueChange={setNotificationsEnabled}
//               trackColor={{ false: '#e0e0e0', true: isDarkMode ? '#FF9500' : '#4361ee' }}
//               thumbColor="#ffffff"
//             />
//           </View>
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="moon" size={20} color={isDarkMode ? '#FF9500' : '#3CCF4E'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
//             </View>
//             <Switch
//               value={isDarkMode}
//               onValueChange={toggleTheme}
//               trackColor={{ false: '#e0e0e0', true: '#FF9500' }}
//               thumbColor="#ffffff"
//             />
//           </View>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="language" size={20} color={isDarkMode ? '#FF7A7A' : '#F55353'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Language</Text>
//             </View>
//             <View style={styles.menuItemRight}>
//               <Text style={[styles.menuItemRightText, { color: colors.secondaryText }]}>English</Text>
//               <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//             </View>
//           </TouchableOpacity>
//         </View>

//         {/* Support Section */}
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="help-circle" size={20} color={isDarkMode ? '#6E8AFA' : '#4361ee'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Help Center</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="chatbubble-ellipses" size={20} color={isDarkMode ? '#5AE875' : '#3CCF4E'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="star" size={20} color={isDarkMode ? '#FF9500' : '#F55353'} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Rate the App</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity
//           style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}
//           onPress={handleLogout}
//         >
//           <Ionicons name="log-out" size={20} color={isDarkMode ? '#FF7A7A' : '#F55353'} />
//           <Text style={[styles.logoutText, { color: isDarkMode ? '#FF7A7A' : '#F55353' }]}>Logout</Text>
//         </TouchableOpacity>

//         <Text style={[styles.versionText, { color: colors.secondaryText }]}>Version 1.0.0</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: { paddingHorizontal: 20, paddingVertical: 16 },
//   headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24 },
//   scrollView: { flex: 1 },
//   scrollContent: { paddingHorizontal: 16, paddingBottom: 30 },
//   profileSection: { alignItems: 'center', marginBottom: 24, padding: 20, borderRadius: 16 },
//   avatarContainer: { position: 'relative', marginBottom: 16 },
//   profileImage: { width: 100, height: 100, borderRadius: 50 },
//   changePhotoButton: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#4361ee', borderRadius: 16 },
//   changePhotoText: { color: '#fff', fontFamily: 'Montserrat-Medium', fontSize: 12 },
//   nameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
//   profileName: { fontFamily: 'Montserrat-Bold', fontSize: 20 },
//   editIcon: { marginLeft: 8, padding: 4 },
//   profileEmail: { fontFamily: 'Montserrat-Medium', fontSize: 14, marginBottom: 16 },
//   editButtons: { flexDirection: 'row', marginTop: 12, width: '100%', justifyContent: 'space-around' },
//   editButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, minWidth: 120, alignItems: 'center' },
//   statsSection: { flexDirection: 'row', borderRadius: 16, padding: 16, marginBottom: 24 },
//   statItem: { flex: 1, alignItems: 'center' },
//   statValue: { fontFamily: 'Montserrat-Bold', fontSize: 18, marginBottom: 4 },
//   statLabel: { fontFamily: 'Montserrat-Medium', fontSize: 14 },
//   statDivider: { width: 1, height: '80%' },
//   section: { borderRadius: 16, padding: 16, marginBottom: 24 },
//   sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, marginBottom: 16 },
//   menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(240,240,240,0.3)' },
//   menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
//   menuItemIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
//   menuItemText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16 },
//   menuItemRight: { flexDirection: 'row', alignItems: 'center' },
//   menuItemRightText: { fontFamily: 'Montserrat-Medium', fontSize: 14, marginRight: 8 },
//   logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 16, marginBottom: 16 },
//   logoutText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, marginLeft: 8 },
//   versionText: { fontFamily: 'Montserrat-Medium', fontSize: 14, textAlign: 'center' },
// });


// import React, { useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image,
//   Switch,
//   Alert,
//   TextInput,
//   ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';

// import { useTheme, lightTheme, darkTheme } from '../../context/ThemeContext';
// import { useUserStore } from "@/store/useUserStore";
// import { supabase } from "@/src/supabaseClient";

// export default function ProfileScreen() {
//   const router = useRouter();
//   const { theme, isDarkMode, toggleTheme } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;
//   const { user } = useUserStore();

//   // State management
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [editing, setEditing] = useState(false);
//   const [username, setUsername] = useState(user?.username ?? '');
//   const [image, setImage] = useState(user?.avatar_url || null);
//   const [isSaving, setIsSaving] = useState(false);

//   // Update username and image states when user data changes
//   useEffect(() => {
//     if (user?.username) {
//       setUsername(user.username);
//     }
//     if (user?.avatar_url) {
//       setImage(user.avatar_url);
//     }
//   }, [user]);

//   const pickImage = async () => {
//     if (!editing) return;

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

// //   const handleSave = async () => {
// //     if (!user?.id) {
// //       Alert.alert("Error", "Cannot update profile. User not found.");
// //       return;
// //     }

// //     setIsSaving(true);
// //     try {
// //       let imageUrl = image;

// //       // Only upload new image if it's a local URI (not a URL)
// //       if (image && !image.startsWith('http') && !image.startsWith('https')) {
// //         const ext = image.split('.').pop();
// //         const filename = `${user.id}_${Date.now()}.${ext}`;
// // const path = filename; // ✅ no folder nesting

// // // Convert the image URI to a Blob
// // const res = await fetch(image);
// // const blob = await res.blob();

// // const { error: uploadErr } = await supabase.storage
// //   .from('avatars')
// //   .upload(path, blob, {
// //     cacheControl: '3600',
// //     upsert: true,
// //   });

// // if (uploadErr) throw uploadErr;

// // // Get public URL
// // const { data: publicUrlData } = supabase.storage
// //   .from('avatars')
// //   .getPublicUrl(path);

// // const imageUrl = publicUrlData.publicUrl;

// //         // const filename = `${user.id}_${Date.now()}.${ext}`;
// //         // const path = `avatars/${filename}`;

// //         // const res = await fetch(image);
// //         // const blob = await res.blob();

// //         // const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true });
// //         // if (uploadErr) throw uploadErr;

// //         // const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
// //         // imageUrl = publicUrlData.publicUrl;
// //       }

// //       // Update profile in database
// //       const { error } = await supabase
// //         .from('profiles')
// //         .update({ 
// //           username, 
// //           avatar_url: imageUrl 
// //         })
// //         .eq('id', user.id);

// //       if (error) throw error;

// //       // Update local user state
// //       useUserStore.getState().setUser({
// //         ...user,
// //         username,
// //         avatar_url: imageUrl ?? undefined,
// //       });

// //       Alert.alert("Success", "Profile updated successfully");
// //       setEditing(false);
// //     } catch (err) {
// //       console.error("Save failed:", err);
// //       Alert.alert("Error", "Could not update profile. Please try again.");
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };
// const handleSave = async () => {
//   if (!user?.id) {
//     Alert.alert("Error", "Cannot update profile. User not found.");
//     return;
//   }

//   setIsSaving(true);
//   try {
//     let updatedImageUrl = image; // Start with current image

//     // Only upload new image if it's a local URI (not a URL)
//     if (image && !image.startsWith('http') && !image.startsWith('https')) {
//       console.log("Local image detected, preparing to upload:", image);
      
//       // Extract file extension
//       const ext = image.split('.').pop();
//       const filename = `${user.id}_${Date.now()}.${ext}`;
//       const path = filename;
      
//       try {
//         // Debug the fetch operation
//         console.log("Fetching image from URI...");
//         const res = await fetch(image);
        
//         if (!res.ok) {
//           throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
//         }
        
//         // Convert to blob with explicit type
//         console.log("Converting to blob...");
//         const blob = await res.blob();
//         console.log("Blob created:", blob.size, "bytes, type:", blob.type);
        
//         if (blob.size === 0) {
//           throw new Error("Created blob has zero size");
//         }
        
//         // Upload with detailed error handling
//         console.log("Uploading to Supabase storage...");
//         const { data: uploadData, error: uploadErr } = await supabase.storage
//           .from('avatars')
//           .upload(path, blob, {
//             contentType: blob.type, // Explicitly set content type
//             cacheControl: '3600',
//             upsert: true,
//           });
        
//         if (uploadErr) {
//           console.error("Upload error:", uploadErr);
//           throw uploadErr;
//         }
        
//         console.log("Upload successful:", uploadData);
        
//         // Get public URL
//         const { data: publicUrlData } = supabase.storage
//           .from('avatars')
//           .getPublicUrl(path);
        
//         console.log("Got public URL:", publicUrlData);
        
//         // Update the image URL with the public URL
//         updatedImageUrl = publicUrlData.publicUrl;
//       } catch (uploadError) {
//         console.error("Image processing failed:", uploadError);
//         Alert.alert(
//           "Image Upload Failed", 
//           "There was a problem uploading your image. Profile info will be updated without the new image."
//         );
//         // Keep the previous image URL if upload fails
//         updatedImageUrl = user?.avatar_url || null;
//       }
//     }

//     // Update profile in database
//     console.log("Updating profile with image URL:", updatedImageUrl);
//     const { error } = await supabase
//       .from('profiles')
//       .update({ 
//         username, 
//         avatar_url: updatedImageUrl 
//       })
//       .eq('id', user.id);

//     if (error) throw error;

//     // Update local user state
//     useUserStore.getState().setUser({
//       ...user,
//       username,
//       avatar_url: updatedImageUrl ?? undefined,
//     });

//     Alert.alert("Success", "Profile updated successfully");
//     setEditing(false);
//   } catch (err) {
//     console.error("Save failed:", err);
//     Alert.alert("Error", "Could not update profile. Please try again.");
//   } finally {
//     setIsSaving(false);
//   }
// };

//   const handleLogout = async () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Logout",
//         onPress: async () => {
//           const { error } = await supabase.auth.signOut();

//           if (error) {
//             console.error("Logout failed:", error.message);
//           } else {
//             useUserStore.getState().clearUser();
//             router.replace("/auth/login");
//           }
//         },
//       },
//     ]);
//   };

//   const cancelEditing = () => {
//     setEditing(false);
//     // Reset to original values from user state
//     setUsername(user?.username || '');
//     setImage(user?.avatar_url || null);
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <StatusBar style={colors.statusBar as any} />

//       <View style={styles.header}>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
//       </View>

//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
//           <TouchableOpacity 
//             onPress={editing ? pickImage : undefined}
//             style={styles.avatarContainer}
//           >
//             {image ? (
//               <Image
//                 source={{ uri: image }}
//                 style={styles.profileImage}
//               />
//             ) : (
//               <View style={[styles.profileImage, { backgroundColor: "#ccc", justifyContent: 'center', alignItems: 'center' }]}>
//                 <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>
//                   {username?.[0]?.toUpperCase() || "?"}
//                 </Text>
//               </View>
//             )}
//             {editing && (
//               <TouchableOpacity 
//                 style={styles.changePhotoButton}
//                 onPress={pickImage}
//               >
//                 <Text style={styles.changePhotoText}>Change Photo</Text>
//               </TouchableOpacity>
//             )}
//           </TouchableOpacity>

//           <View style={styles.nameContainer}>
//             {editing ? (
//               <TextInput
//                 style={[styles.profileName, { color: colors.text, borderBottomWidth: 1, borderColor: colors.border }]}
//                 value={username}
//                 onChangeText={setUsername}
//                 placeholder="Enter username"
//                 placeholderTextColor={colors.secondaryText}
//               />
//             ) : (
//               <Text style={[styles.profileName, { color: colors.text }]}>
//                 {user?.username || "Loading..."}
//               </Text>
//             )}
            
//             {!editing && (
//               <TouchableOpacity onPress={() => setEditing(true)} style={styles.editIcon}>
//                 <Ionicons name="create-outline" size={20} color={colors.secondaryText} />
//               </TouchableOpacity>
//             )}
//           </View>

//           <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>
//             {user?.email|| "Loading..."}
//           </Text>

//           {editing && (
//             <View style={styles.editButtons}>
//               <TouchableOpacity
//                 style={[styles.editButton, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}
//                 onPress={cancelEditing}
//                 disabled={isSaving}
//               >
//                 <Text style={{ color: isDarkMode ? "#FF7A7A" : "#F55353", fontFamily: 'Montserrat-SemiBold' }}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.editButton, { backgroundColor: '#4361ee' }]}
//                 onPress={handleSave}
//                 disabled={isSaving}
//               >
//                 {isSaving ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={{ color: 'white', fontFamily: 'Montserrat-SemiBold' }}>Save Changes</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>

//         <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
//           </View>
//           <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>12,500</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>KCAL</Text>
//           </View>
//           <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>30</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Days Streak</Text>
//           </View>
//         </View>
        
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="person" size={20} color={isDarkMode ? "#6E8AFA" : "#4361ee"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Personal Information</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="shield-checkmark" size={20} color={isDarkMode ? "#5AE875" : "#3CCF4E"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy & Security</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="card" size={20} color={isDarkMode ? "#FF7A7A" : "#F55353"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Payment Methods</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//         </View>
        
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="notifications" size={20} color={isDarkMode ? "#6E8AFA" : "#4361ee"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
//             </View>
//             <Switch
//               value={notificationsEnabled}
//               onValueChange={setNotificationsEnabled}
//               trackColor={{ false: "#e0e0e0", true: isDarkMode ? "#FF9500" : "#4361ee" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="moon" size={20} color={isDarkMode ? "#FF9500" : "#3CCF4E"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
//             </View>
//             <Switch
//               value={isDarkMode}
//               onValueChange={toggleTheme}
//               trackColor={{ false: "#e0e0e0", true: "#FF9500" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="language" size={20} color={isDarkMode ? "#FF7A7A" : "#F55353"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Language</Text>
//             </View>
//             <View style={styles.menuItemRight}>
//               <Text style={[styles.menuItemRightText, { color: colors.secondaryText }]}>English</Text>
//               <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//             </View>
//           </TouchableOpacity>
//         </View>
        
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="help-circle" size={20} color={isDarkMode ? "#6E8AFA" : "#4361ee"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Help Center</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="chatbubble-ellipses" size={20} color={isDarkMode ? "#5AE875" : "#3CCF4E"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="star" size={20} color={isDarkMode ? "#FF9500" : "#F55353"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Rate the App</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//         </View>
        
//         <TouchableOpacity 
//           style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}
//           onPress={handleLogout}
//         >
//           <Ionicons name="log-out" size={20} color={isDarkMode ? "#FF7A7A" : "#F55353"} />
//           <Text style={[styles.logoutText, { color: isDarkMode ? "#FF7A7A" : "#F55353" }]}>Logout</Text>
//         </TouchableOpacity>
        
//         <Text style={[styles.versionText, { color: colors.secondaryText }]}>Version 1.0.0</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   headerTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 24,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   profileSection: {
//     alignItems: 'center',
//     marginBottom: 24,
//     padding: 20,
//     borderRadius: 16,
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginBottom: 16,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//   },
//   changePhotoButton: {
//     marginTop: 8,
//     paddingVertical: 4,
//     paddingHorizontal: 12,
//     backgroundColor: '#4361ee',
//     borderRadius: 16,
//     alignSelf: 'center',
//   },
//   changePhotoText: {
//     color: 'white',
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 12,
//   },
//   nameContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   profileName: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 20,
//   },
//   editIcon: {
//     marginLeft: 8,
//     padding: 4,
//   },
//   profileEmail: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   editButtons: {
//     flexDirection: 'row',
//     marginTop: 12,
//     width: '100%',
//     justifyContent: 'space-around',
//   },
//   editButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     minWidth: 120,
//     alignItems: 'center',
//   },
//   statsSection: {
//     flexDirection: 'row',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statValue: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//   },
//   statDivider: {
//     width: 1,
//     height: '80%',
//   },
//   section: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     marginBottom: 16,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(240, 240, 240, 0.3)',
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   menuItemText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//   },
//   menuItemRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemRightText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     marginRight: 8,
//   },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 12,
//     paddingVertical: 16,
//     marginBottom: 16,
//   },
//   logoutText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   versionText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// });



// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image,
//   Switch,
//   Alert,
//   TextInput
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useTheme, lightTheme, darkTheme } from '../../context/ThemeContext';
// import { useUserProfile } from "@/hooks/useUserProfile";
// import { supabase } from "@/src/supabaseClient";
// import { useUserStore } from "@/store/useUserStore";
// import * as ImagePicker from 'expo-image-picker';

// export default function ProfileScreen() {
//   const router = useRouter();
//   const { theme, isDarkMode, toggleTheme } = useTheme();
//   const [editing, setEditing] = useState(false);
//   const { user } = useUserStore();
//   const [username, setUsername] = useState(user?.username ?? '');
//   const [image, setImage] = useState<string | null>(null);

//   const colors = isDarkMode ? darkTheme : lightTheme;
  
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);


//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       quality: 1,
//     });
  
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };
  
//   const handleLogout = async () => {
//     Alert.alert("Logout", "Are you sure you want to logout?", [
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//       {
//         text: "Logout",
//         onPress: async () => {
//           const { error } = await supabase.auth.signOut();
  
//           if (error) {
//             console.error("Logout failed:", error.message);
//           } else {
//             useUserStore.getState().clearUser(); // ✅ Clear Zustand user
//             router.replace("/auth/login"); // ✅ Navigate to login screen
//           }
//         },
//       },
//     ]);
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <StatusBar style={colors.statusBar as any} />
      
//       <View style={styles.header}>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
//       </View>
      
//       <ScrollView 
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
//           {/* <Image 
//             source={require('../../assets/images/profile.jpg')} 
//             style={styles.profileImage}
//           /> */}
//           <TouchableOpacity onPress={editing ? pickImage : undefined}>
//   {image || user?.avatar_url ? (
//     <Image
//       source={{ uri: image || user?.avatar_url }}
//       style={styles.profileImage}
//     />
//   ) : (
//     <View style={[styles.profileImage, { backgroundColor: "#ccc", justifyContent: 'center', alignItems: 'center' }]}>
//       <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>
//         {username?.[0]?.toUpperCase() || "?"}
//       </Text>
//     </View>
//   )}
// </TouchableOpacity>

// <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
//   {editing ? (
//     <TextInput
//       style={[styles.profileName, { color: colors.text, borderBottomWidth: 1, borderColor: colors.border }]}
//       value={username}
//       onChangeText={setUsername}
//     />
//   ) : (
//     <Text style={[styles.profileName, { color: colors.text }]}>
//       {user?.username || "Loading..."}
//     </Text>
//   )}

//   <TouchableOpacity onPress={() => setEditing(prev => !prev)} style={{ marginLeft: 8 }}>
//     <Ionicons name="create-outline" size={20} color={colors.secondaryText} />
//   </TouchableOpacity>
// </View>

//           <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>
//             {user?.email}
//           </Text>
          
//           {/* <TouchableOpacity style={[styles.editProfileButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }]}>
//             <Text style={[styles.editProfileText, { color: colors.text }]}>Edit Profile</Text>
//           </TouchableOpacity> */}
//           <TouchableOpacity 
//   style={[styles.editProfileButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }]}
//   onPress={() => router.push("/subScreen/editProfile")}
// >
//   <Text style={[styles.editProfileText, { color: colors.text }]}>Edit Profile</Text>
// </TouchableOpacity>

//         </View>
        
//         <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>24</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts</Text>
//           </View>
//           <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>12,500</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>KCAL</Text>
//           </View>
//           <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
//           <View style={styles.statItem}>
//             <Text style={[styles.statValue, { color: colors.text }]}>30</Text>
//             <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Days Streak</Text>
//           </View>
//         </View>
        
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="person" size={20} color={isDarkMode ? "#6E8AFA" : "#4361ee"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Personal Information</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="shield-checkmark" size={20} color={isDarkMode ? "#5AE875" : "#3CCF4E"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Privacy & Security</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="card" size={20} color={isDarkMode ? "#FF7A7A" : "#F55353"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Payment Methods</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//         </View>
        
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="notifications" size={20} color={isDarkMode ? "#6E8AFA" : "#4361ee"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
//             </View>
//             <Switch
//               value={notificationsEnabled}
//               onValueChange={setNotificationsEnabled}
//               trackColor={{ false: "#e0e0e0", true: isDarkMode ? "#FF9500" : "#4361ee" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="moon" size={20} color={isDarkMode ? "#FF9500" : "#3CCF4E"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Dark Mode</Text>
//             </View>
//             <Switch
//               value={isDarkMode}
//               onValueChange={toggleTheme}
//               trackColor={{ false: "#e0e0e0", true: "#FF9500" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="language" size={20} color={isDarkMode ? "#FF7A7A" : "#F55353"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Language</Text>
//             </View>
//             <View style={styles.menuItemRight}>
//               <Text style={[styles.menuItemRightText, { color: colors.secondaryText }]}>English</Text>
//               <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//             </View>
//           </TouchableOpacity>
//         </View>
        
//         <View style={[styles.section, { backgroundColor: colors.card }]}>
//           <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(67, 97, 238, 0.2)' : 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="help-circle" size={20} color={isDarkMode ? "#6E8AFA" : "#4361ee"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Help Center</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(60, 207, 78, 0.2)' : 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="chatbubble-ellipses" size={20} color={isDarkMode ? "#5AE875" : "#3CCF4E"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="star" size={20} color={isDarkMode ? "#FF9500" : "#F55353"} />
//               </View>
//               <Text style={[styles.menuItemText, { color: colors.text }]}>Rate the App</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
//           </TouchableOpacity>
//         </View>
        
//         <TouchableOpacity 
//           style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(245, 83, 83, 0.2)' : 'rgba(245, 83, 83, 0.1)' }]}
//           onPress={handleLogout}
//         >
//           <Ionicons name="log-out" size={20} color={isDarkMode ? "#FF7A7A" : "#F55353"} />
//           <Text style={[styles.logoutText, { color: isDarkMode ? "#FF7A7A" : "#F55353" }]}>Logout</Text>
//         </TouchableOpacity>
        
//         <Text style={[styles.versionText, { color: colors.secondaryText }]}>Version 1.0.0</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   headerTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 24,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   profileSection: {
//     alignItems: 'center',
//     marginBottom: 24,
//     padding: 20,
//     borderRadius: 16,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   profileName: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 20,
//     marginBottom: 4,
//   },
//   profileEmail: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     marginBottom: 16,
//   },
//   editProfileButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   editProfileText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//   },
//   statsSection: {
//     flexDirection: 'row',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statValue: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//   },
//   statDivider: {
//     width: 1,
//     height: '80%',
//   },
//   section: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     marginBottom: 16,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(240, 240, 240, 0.3)',
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   menuItemText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//   },
//   menuItemRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemRightText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     marginRight: 8,
//   },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 12,
//     paddingVertical: 16,
//     marginBottom: 16,
//   },
//   logoutText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   versionText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// });

// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   ScrollView, 
//   TouchableOpacity, 
//   Image,
//   Switch,
//   Alert
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';

// export default function ProfileScreen() {
//   const router = useRouter();
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
//   const handleLogout = () => {
//     Alert.alert(
//       "Logout",
//       "Are you sure you want to logout?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         { 
//           text: "Logout", 
//           onPress: () => router.replace('/') 
//         }
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="dark" />
      
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Profile</Text>
//       </View>
      
//       <ScrollView 
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.profileSection}>
//           <Image 
//             source={require('../../assets/images/profile.jpg')} 
//             style={styles.profileImage}
//           />
//           <Text style={styles.profileName}>John Doe</Text>
//           <Text style={styles.profileEmail}>john.doe@example.com</Text>
          
//           <TouchableOpacity style={styles.editProfileButton}>
//             <Text style={styles.editProfileText}>Edit Profile</Text>
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.statsSection}>
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>24</Text>
//             <Text style={styles.statLabel}>Workouts</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>12,500</Text>
//             <Text style={styles.statLabel}>Calories</Text>
//           </View>
//           <View style={styles.statDivider} />
//           <View style={styles.statItem}>
//             <Text style={styles.statValue}>30</Text>
//             <Text style={styles.statLabel}>Days Streak</Text>
//           </View>
//         </View>
        
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Account</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="person" size={20} color="#4361ee" />
//               </View>
//               <Text style={styles.menuItemText}>Personal Information</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="shield-checkmark" size={20} color="#3CCF4E" />
//               </View>
//               <Text style={styles.menuItemText}>Privacy & Security</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="card" size={20} color="#F55353" />
//               </View>
//               <Text style={styles.menuItemText}>Payment Methods</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Preferences</Text>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="notifications" size={20} color="#4361ee" />
//               </View>
//               <Text style={styles.menuItemText}>Notifications</Text>
//             </View>
//             <Switch
//               value={notificationsEnabled}
//               onValueChange={setNotificationsEnabled}
//               trackColor={{ false: "#e0e0e0", true: "#4361ee" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <View style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="moon" size={20} color="#3CCF4E" />
//               </View>
//               <Text style={styles.menuItemText}>Dark Mode</Text>
//             </View>
//             <Switch
//               value={darkModeEnabled}
//               onValueChange={setDarkModeEnabled}
//               trackColor={{ false: "#e0e0e0", true: "#4361ee" }}
//               thumbColor="#ffffff"
//             />
//           </View>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="language" size={20} color="#F55353" />
//               </View>
//               <Text style={styles.menuItemText}>Language</Text>
//             </View>
//             <View style={styles.menuItemRight}>
//               <Text style={styles.menuItemRightText}>English</Text>
//               <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//             </View>
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Support</Text>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(67, 97, 238, 0.1)' }]}>
//                 <Ionicons name="help-circle" size={20} color="#4361ee" />
//               </View>
//               <Text style={styles.menuItemText}>Help Center</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(60, 207, 78, 0.1)' }]}>
//                 <Ionicons name="chatbubble-ellipses" size={20} color="#3CCF4E" />
//               </View>
//               <Text style={styles.menuItemText}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.menuItem}>
//             <View style={styles.menuItemLeft}>
//               <View style={[styles.menuItemIcon, { backgroundColor: 'rgba(245, 83, 83, 0.1)' }]}>
//                 <Ionicons name="star" size={20} color="#F55353" />
//               </View>
//               <Text style={styles.menuItemText}>Rate the App</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
//           </TouchableOpacity>
//         </View>
        
//         <TouchableOpacity 
//           style={styles.logoutButton}
//           onPress={handleLogout}
//         >
//           <Ionicons name="log-out" size={20} color="#F55353" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
        
//         <Text style={styles.versionText}>Version 1.0.0</Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   headerTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 24,
//     color: '#333',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   profileSection: {
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 16,
//   },
//   profileName: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 20,
//     color: '#333',
//     marginBottom: 4,
//   },
//   profileEmail: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//     marginBottom: 16,
//   },
//   editProfileButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 20,
//   },
//   editProfileText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//     color: '#333',
//   },
//   statsSection: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statValue: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#333',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//   },
//   statDivider: {
//     width: 1,
//     height: '80%',
//     backgroundColor: '#e0e0e0',
//   },
//   section: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#333',
//     marginBottom: 16,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   menuItemLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   menuItemText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#333',
//   },
//   menuItemRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   menuItemRightText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//     marginRight: 8,
//   },
//   logoutButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(245, 83, 83, 0.1)',
//     borderRadius: 12,
//     paddingVertical: 16,
//     marginBottom: 16,
//   },
//   logoutText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#F55353',
//     marginLeft: 8,
//   },
//   versionText: {
//     fontFamily: 'Montserrat-Medium',
//     fontSize: 14,
//     color: '#94a3b8',
//     textAlign: 'center',
//   },
// });

// import React, { useContext, useState } from 'react';
// import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
// import EquipmentsModal from '../../components/EquipmentsModal';
// import { supabase } from '../../utils/supabaseClient';
// import { useRouter } from "expo-router"; //  Import router for navigation

// const Profile = () => {
//   const router = useRouter(); //  Initialize router
//   const [EquipmentsModalVisible, setEquipmentsModalVisible] = useState(false);
//   const handleLogout = async () => {
//     console.log("📢 Logging out user...");

//     try {
//       const { error } = await supabase.auth.signOut();
      
//       if (error) {
//         console.error("❌ Logout Error:", error.message);
//         Alert.alert("⚠️ Logout failed", error.message);
//       } else {
//         console.log("✅ Logout Successful");
//         Alert.alert("✅ Logged out successfully!");
        
//         // ✅ Redirect user to login page
//         router.replace("/auth/login");
//       }
//     } catch (err) {
//       console.error("🚨 Unexpected Error:", err);
//       Alert.alert("⚠️ An unexpected error occurred.");
//     }
//   };
//   const accountItems = [
//     { id: '1', title: 'Email Address', value: 'ankurgyawali@gmail.com' },
//     { id: '13', title: 'Available Equipment', value: 'No Equipment' },
//     { id: '2', title: 'Subscribe to log unlimited workouts' },
//     { id: '3', title: 'View Workout Report' },
//     { id: '4', title: 'Log Out' },
//     { id: '5', title: 'Fitness question? Ask our trainer' },
//     { id: '6', title: 'Learn How Fitbod Works' },
//     { id: '7', title: 'View Your 2024 Workout Report' },
//     { id: '8', title: 'Health Profile' },
//     { id: '9', title: 'Unit of Measurement', value: 'Lb (pounds)' },
//     { id: '10', title: 'Export Workout Data' },
//     { id: '11', title: 'Apple Health', status: 'Connected' },
//     { id: '12', title: 'Strava', status: 'Not Connected' },
//   ];



//   const renderItem = ({ item }: { item: { id: string; title: string; value?: string; status?: string } }) => (
//     <TouchableOpacity 
//       style={styles.item} 
//       onPress={() => {
//         if (item.title === "Log Out") {
//           handleLogout(); // 🚀 Call handleLogout when "Log Out" is pressed
//         }
//       }}
//     >
//       <Text style={styles.itemTitle}>{item.title}</Text>
//       {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
//       {item.status && (
//         <Text style={[styles.itemStatus, item.status === 'Connected' ? styles.connected : styles.notConnected]}>
//           {item.status}
//         </Text>
//       )}
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.sectionHeader}>Account</Text>
//       <FlatList
//         data={accountItems}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         style={styles.section}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: '#121212',
//     padding: 20,
//     marginBottom: 0,
//   },
//   sectionHeader: {
//     color: '#000000',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginVertical: 40,
//     marginBottom: 15,
//   },
//   section: {
//     marginBottom: 0,
//   },
//   item: {
//     backgroundColor: '#ffffff',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   itemTitle: {
//     color: '#000000',
//     fontSize: 14,
//   },
//   itemValue: {
//     color: '#000000',
//     fontSize: 12,
//     marginTop: 5,
//   },
//   itemStatus: {
//     fontSize: 12,
//     marginTop: 5,
//   },
//   connected: {
//     color: '#00FF00',
//   },
//   notConnected: {
//     color: '#FF0000',
//   },
// });

// export default Profile;
