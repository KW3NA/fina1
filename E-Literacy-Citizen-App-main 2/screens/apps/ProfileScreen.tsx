import * as React from 'react';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { requestAndFetchLocation, getLocationNameFromCoords } from '../../components/locationUtils';
import Constants from 'expo-constants';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useLanguage, getLanguageName, SupportedLanguage } from '../../components/LanguageContext';
import { useUser } from '../../components/UserContext';
import { useTheme } from '../../components/ThemeContext';
import { Modal as RNModal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatedText from '../../components/TranslatedText';
import { UserDTO, AuthMeResponse } from '../../src/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authGet, API_BASE } from '../../config/api';
import { authUpload } from '../../config/api';
import { authPost } from '../../config/api';
import { sendEmailOtp } from '../../config/api';
import { updateProfile } from '../../config/api';
import { useAuthGuard } from '../../src/hooks/useAuthGuard';

//import { ActivityIndicator } from 'react-native-paper';

// Helper function to convert relative path to full URL
const getFullImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove /api from API_BASE and append the path
  const baseUrl = API_BASE.replace('/api', '');
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  const fullUrl = `${baseUrl}${normalizedPath}`;
  console.log('🔗 Converting path to full URL:', { path, fullUrl });
  
  return fullUrl;
};


type UserData = {
  name: string;
  email: string;
  location: string;
  joinDate: string;
  completedCourses: number;
  currentLevel: string;
  profile_picture_url?: string;
  email_verified_at?: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen = ({ navigation }: Props) => {
  const { userData, setUserData } = useUser();
  const { language, setLanguage } = useLanguage();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isLocLoading, setIsLocLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const [pendingLang, setPendingLang] = useState(language);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const OPENCAGE_API_KEY =
    Constants.expoConfig?.extra?.OPENCAGE_API_KEY ||
    (Constants.manifest && 'extra' in Constants.manifest
      ? (Constants.manifest as any).extra?.OPENCAGE_API_KEY
      : '') ||
    '';

  // 🔹 Load profile (cached + backend refresh)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('user');
        if (cached && mounted) {
          const parsed: UserData = JSON.parse(cached);
          setUser(parsed);
          const cachedImageUrl = getFullImageUrl(parsed.profile_picture_url);
          console.log('📦 Cached profile image:', cachedImageUrl);
          setProfileImage(cachedImageUrl);
          setUserData(parsed);
        }

        const me = await authGet<{ user: UserData }>('/mobile/me');
        if (mounted) {
          console.log('👤 User data from /mobile/me:', me.user);
          console.log('🖼️ Raw profile picture URL from backend:', me.user.profile_picture_url);
          
          const fullImageUrl = getFullImageUrl(me.user.profile_picture_url);
          console.log('🖼️ Full profile image URL:', fullImageUrl);
          
          setUser(me.user);
          setProfileImage(fullImageUrl);
          setUserData(me.user);
          await AsyncStorage.setItem('user', JSON.stringify(me.user));
        }
      } catch (e) {
        await AsyncStorage.multiRemove(['token', 'user']);
        if (mounted) navigation.replace('Login');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigation, setUserData]);

  // 🔹 Refresh profile data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshProfile = async () => {
        try {
          // Only refresh if we don't have recent user data
          const lastRefresh = await AsyncStorage.getItem('lastProfileRefresh');
          const now = Date.now();
          
          // Don't refresh if it was refreshed less than 30 seconds ago
          // This prevents overriding location data set during login/signup
          if (lastRefresh && (now - parseInt(lastRefresh)) < 30000) {
            return;
          }

          const me = await authGet<{ user: UserData }>('/mobile/me');
          
          // Only update if the backend has more recent data
          if (me.user) {
            const refreshedImageUrl = getFullImageUrl(me.user.profile_picture_url);
            console.log('🔄 Refreshed profile image URL:', refreshedImageUrl);
            
            setUser(me.user);
            setProfileImage(refreshedImageUrl);
            setUserData(me.user);
            await AsyncStorage.multiSet([
              ['user', JSON.stringify(me.user)],
              ['lastProfileRefresh', now.toString()]
            ]);
          }
        } catch (e) {
          console.log('Failed to refresh profile:', e);
        }
      };
      refreshProfile();
    }, [setUserData])
  );

  // 🔹 Update location
  const handleUpdateLocation = async () => {
    setIsLocLoading(true);
    try {
      const loc = await requestAndFetchLocation();
      if (!loc || !loc.permission) {
        Alert.alert('Permission Needed', 'Location permission is required to update your location.');
        return;
      }
      const { latitude, longitude } = loc.coords;
      const locationName = await getLocationNameFromCoords(latitude, longitude, OPENCAGE_API_KEY);
      if (locationName) {
        // Update backend
        const response = await updateProfile({ location: locationName });
        
        // Update local state
        const updated = { ...(user ?? userData), location: locationName };
        setUser(updated);
        setUserData(updated);
        await AsyncStorage.setItem('user', JSON.stringify(updated));
        
        Alert.alert('Success', 'Location updated successfully!');
      } else {
        Alert.alert('Error', 'Could not fetch location name.');
      }
    } catch (e) {
      console.error('Location update error:', e);
      Alert.alert('Error', 'Failed to update location.');
    } finally {
      setIsLocLoading(false);
    }
  };

  // 🔹 Email Verification
  const handleEmailVerification = async () => {
    setIsEmailVerifying(true);
    try {
      const response = await sendEmailOtp();
      if (response.status === 'success') {
        Alert.alert(
          'OTP Sent',
          'A verification code has been sent to your email address.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('EmailVerification'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send verification code'
      );
    } finally {
      setIsEmailVerifying(false);
    }
  };

  // 🔹 Logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLogoutLoading(true);
            try {
              // Call logout API endpoint
              await authPost('/mobile/logout');
              console.log('✅ Logout API call successful');
            } catch (error) {
              console.log('⚠️ Logout API call failed:', error);
              // Continue with logout even if API call fails
            } finally {
              // Clear local storage
              await AsyncStorage.multiRemove(['token', 'user']);
              console.log('✅ Local storage cleared');
              
              // Reset navigation to login screen
              navigation.reset({ 
                index: 0, 
                routes: [{ name: 'Login' }] 
              });
              setIsLogoutLoading(false);
            }
          },
        },
      ]
    );
  };

  // 🔹 Pick new profile image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'We need photo library access.');
      return;
    }
    
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.92, // High quality (92%)
        base64: false,
        exif: false,
      });
      
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        
        // Validate file size (max 5MB)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Image Too Large', 'Please select an image smaller than 5MB.');
          return;
        }
        
        // Validate dimensions (optional - warn if too small)
        if (asset.width && asset.height && (asset.width < 100 || asset.height < 100)) {
          Alert.alert('Image Too Small', 'Please select an image at least 100x100 pixels.');
          return;
        }
        
        setTempImage(asset.uri);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSaveImage = async () => {
    if (!tempImage) {
      Alert.alert('Error', 'No image selected');
      return;
    }
    
    setIsUploadingImage(true);
    try {
      // Determine file type from URI
      const fileExtension = tempImage.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg';
      if (fileExtension === 'png') {
        mimeType = 'image/png';
      } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
        mimeType = 'image/jpeg';
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', {
        uri: tempImage,
        type: mimeType,
        name: `profile_picture.${fileExtension || 'jpg'}`,
      } as any);
      
      console.log('📤 Uploading profile picture:', {
        uri: tempImage,
        type: mimeType,
        name: `profile_picture.${fileExtension || 'jpg'}`
      });

      // Upload to backend
      const response = await authUpload<{ user: UserData }>('/mobile/profile/avatar', formData);
      console.log('✅ Upload successful:', response);
      
      // Validate response
      if (!response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Update local state with the new profile picture URL
      const rawProfileUrl = response.user.profile_picture_url;
      console.log('🖼️ Raw profile picture URL from upload response:', rawProfileUrl);
      
      const fullProfileUrl = getFullImageUrl(rawProfileUrl);
      console.log('🖼️ Full profile picture URL:', fullProfileUrl);
      
      setProfileImage(fullProfileUrl);
      setUser(response.user);
      setUserData(response.user);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      // Close modal first, then show success
      setIsModalVisible(false);
      setTempImage(null);
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('❌ Profile picture upload error:', error);
      
      // Determine error message
      let errorMessage = 'Failed to upload profile picture. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCancelImage = () => {
    setTempImage(null);
    setIsModalVisible(false);
  };

  // 🔹 Display user (fallback if not loaded yet)
  const displayUser = user ?? {
    name: userData.name || 'John Doe',
    email: userData.email || 'john.doe@example.com',
    location: userData.location || 'Unknown',
    joinDate: userData.joinDate || 'January 2024',
    completedCourses: userData.completedCourses || 0,
    currentLevel: userData.currentLevel || 'Beginner',
  };

  // 🔹 Stats
  const stats = [
    { title: 'Completed', value: displayUser.completedCourses, icon: 'checkmark-circle' },
    { title: 'Level', value: displayUser.currentLevel, icon: 'trophy' },
    { title: 'Member Since', value: displayUser.joinDate, icon: 'calendar' },
  ];

  // 🔹 Menu
  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profile', onPress: () => navigation.navigate('Edit Profile') },
    { icon: 'settings-outline', title: 'Settings', onPress: () => navigation.navigate('Settings') },
    { icon: 'shield-checkmark-outline', title: 'Privacy', onPress: () => navigation.navigate('Privacy') },
    { icon: 'help-circle-outline', title: 'Help & Support', onPress: () => navigation.navigate('Help&Support') },
    { 
      icon: isLogoutLoading ? 'refresh' : 'log-out-outline', 
      title: isLogoutLoading ? 'Logging out...' : 'Logout', 
      onPress: handleLogout,
      disabled: isLogoutLoading
    },
  ];

  // if (loading) {
  //   return (
  //     <View className="flex-1 justify-center items-center">
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  const { colors, isDark } = useTheme();

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
  <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#E67012" />
          </TouchableOpacity>
          <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>Profile</TranslatedText>
          <TouchableOpacity onPress={() => navigation.navigate('Edit Profile')}>
            <Ionicons name="create-outline" size={24} color="#E67012" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../assets/user.png')}
              style={styles.avatar}
              onError={(error) => {
                console.log('❌ Image load error:', error);
                console.log('Failed to load image URL:', profileImage);
                // Fallback to default image on error
                setProfileImage(null);
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', profileImage);
              }}
            />
            <TouchableOpacity style={styles.editAvatarButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{displayUser.name}</Text>
          <View style={styles.emailContainer}>
            <Text style={[styles.email, { color: colors.muted }]}>{displayUser.email}</Text>
            {displayUser.email_verified_at ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={handleEmailVerification}
                disabled={isEmailVerifying}
              >
                <Ionicons 
                  name={isEmailVerifying ? "refresh" : "mail-outline"} 
                  size={16} 
                  color="#E67012" 
                />
                <Text style={styles.verifyButtonText}>
                  {isEmailVerifying ? 'Sending...' : 'Verify Email'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={[styles.location, { color: colors.muted }]}>{displayUser.location || 'Location not set'}</Text>
            <TouchableOpacity 
              onPress={handleUpdateLocation} 
              disabled={isLocLoading}
            >
              <Ionicons 
                name={isLocLoading ? "refresh" : "refresh-outline"} 
                size={16} 
                color="#E67012" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: isDark ? '#1e1e1eff' : '#f8f8f8' }]}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={String(stat.icon)} size={24} color="#E67012" />
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#000' }]}>{stat.value}</Text>
              <TranslatedText style={styles.statTitle}>{stat.title}</TranslatedText>
            </View>
          ))}
        </View>

        {/* Language Selection */}
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}
            onPress={() => setIsLangModalVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="language-outline" size={22} color="#E67012" />
              <TranslatedText style={[{ marginLeft: 12, fontSize: 16, color: '#333' }, isDark && { color: '#666' }]}>Language</TranslatedText>
            </View>
            <Text style={{ color: '#E67012', fontWeight: 'bold' }}>{getLanguageName(language)}</Text>
          </TouchableOpacity>
        </View>
        {/* Language Modal */}
        <RNModal
          visible={isLangModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsLangModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={[{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' }, isDark && { backgroundColor: '#1e1e1e' }]}>
              <TranslatedText style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Select Language</TranslatedText>
              {['en', 'af', 'zu'].map((code) => {
                const active = pendingLang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => setPendingLang(code as SupportedLanguage)}
                    style={{ marginVertical: 6, width: '100%' }}
                  >
                    {active ? (
                      <LinearGradient
                        colors={['#FF9800', '#FF6D00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 12, padding: 14, alignItems: 'center' }}
                      >
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{getLanguageName(code as SupportedLanguage)}</Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          
                          borderColor: '#E67012',
                          borderWidth: 2,
                          borderRadius: 12,
                          padding: 14,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: '#E67012', fontWeight: 'bold', fontSize: 16 }}>{getLanguageName(code as SupportedLanguage)}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18, width: "100%", alignItems: "center" }}>
                <TouchableOpacity onPress={() => setIsLangModalVisible(false)} style={{ marginRight: 16 }}>
                  <TranslatedText style={{ color: '#7e7d7dff', fontWeight: '600' }}>Cancel</TranslatedText>
                </TouchableOpacity>
                <LinearGradient
                colors={['#FF9800', '#FF6D00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ borderRadius: 12, padding: 10, alignItems: 'center', width: "40%" }}
                >
                  <TouchableOpacity
                  onPress={() => {
                    setLanguage(pendingLang);
                    setIsLangModalVisible(false);
                  }}
                  
                >
                  <TranslatedText style={{ color: '#fff', fontWeight: 'bold' }}>Save</TranslatedText>
                </TouchableOpacity>
                </LinearGradient>
                
              </View>
            </View>
          </View>
        </RNModal>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: isDark ? colors.muted : '#f0f0f0' }]}
              onPress={item.onPress}
              disabled={item.disabled}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons 
                  name={String(item.icon)} 
                  size={24} 
                  color={
                    item.disabled 
                      ? '#ccc' 
                      : item.title.includes('Logout') 
                        ? '#FF3B30' 
                        : '#666'
                  } 
                />
                <TranslatedText style={[
                  styles.menuItemText, { color: isDark ? colors.muted : "#333" },
                  item.title.includes('Logout') && styles.logoutText,
                  item.disabled && styles.disabledText
                ]}>
                  {item.title}
                </TranslatedText>
              </View>

              {!item.disabled && <Ionicons name="chevron-forward" size={20} color="#E67012" />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={isUploadingImage ? undefined : handleCancelImage}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#2E2E2E' : 'white' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
                Preview Profile Picture
              </Text>
              {!isUploadingImage && (
                <TouchableOpacity onPress={handleCancelImage} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.modalImageContainer}>
              {tempImage && <Image
                source={{ uri: tempImage }}
                style={styles.modalImage}
                resizeMode="cover"
              />}
            </View>
            
            <Text style={[styles.modalText, { color: isDark ? '#ccc' : '#666' }]}>
              {isUploadingImage 
                ? 'Uploading your profile picture...' 
                : 'Do you want to update your profile picture?'}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, isUploadingImage && { opacity: 0.5 }]}
                onPress={handleCancelImage}
                disabled={isUploadingImage}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, isUploadingImage && { opacity: 0.7 }]}
                onPress={handleSaveImage}
                disabled={isUploadingImage}
              >
                {isUploadingImage && (
                  <Ionicons name="sync" size={16} color="#fff" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.saveButtonText}>
                  {isUploadingImage ? 'Uploading...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal:10,
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E67012',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#E67012',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E67012',
  },
  verifyButtonText: {
    fontSize: 12,
    color: '#E67012',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  logoutText: {
    color: '#FF3B30',
  },
  disabledText: {
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#E67012',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#E67012',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ProfileScreen; 