import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../navigation/types';
import TranslatedText from '../../components/TranslatedText';
import { useLanguage, SupportedLanguage } from '../../components/LanguageContext';

const notificationTones = [
  { label: 'Default', value: 'default' },
  { label: 'Chime', value: 'chime' },
  { label: 'Bell', value: 'bell' },
  { label: 'Alert', value: 'alert' },
];

const languageOptions = [
  { label: 'English', value: 'en' as SupportedLanguage },
  { label: 'Afrikaans', value: 'af' as SupportedLanguage },
  { label: 'Zulu', value: 'zu' as SupportedLanguage },
  { label: 'Xhosa', value: 'xh' as SupportedLanguage },
  { label: 'Tswana', value: 'tn' as SupportedLanguage },
  { label: 'Tshivenda', value: 've' as SupportedLanguage },
  { label: 'Xitsonga', value: 'ts' as SupportedLanguage },
  { label: 'Sepedi', value: 'nso' as SupportedLanguage },
  { label: 'Sesotho', value: 'st' as SupportedLanguage },
  { label: 'Ndebele', value: 'nr' as SupportedLanguage },
  { label: 'Swati', value: 'ss' as SupportedLanguage },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

import { useTheme } from '../../components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [notificationTone, setNotificationTone] = useState('default');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [useCellular, setUseCellular] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleToggleDarkMode = () => {
    toggleTheme();
    Alert.alert('Theme Changed', `Switched to ${!isDark ? 'Dark' : 'Light'} Mode`);
  };

  const handleToneChange = (value: string) => {
    setNotificationTone(value);
    Alert.alert('Notification Tone', `Tone set to ${value}`);
  };

  const handleLanguageChange = (value: SupportedLanguage) => {
    setLanguage(value);
    const selectedLang = languageOptions.find(lang => lang.value === value);
    Alert.alert('Language Changed', `Language set to ${selectedLang?.label}`);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: colors.card }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TranslatedText style={[styles.title, { color: colors.primary }]}>Settings</TranslatedText>
        <View style={{ width: 36 }} />
      </View>

      <View style={{padding: 24}}>
      
            <View style={[styles.itemRow, { borderBottomWidth: 1, borderBottomColor: isDark ? colors.muted : '#f0f0f0' , marginBottom: 25}]}>
              <View style={[styles.optionLeft,  { marginBottom: 25 }]}>
                <FontAwesome6 name="moon" size={18} color={colors.primary} style={styles.icon} />
                <TranslatedText style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Dark Mode</TranslatedText>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleToggleDarkMode}
                thumbColor={isDark ? '#E67012' : '#fff'}
                trackColor={{ false: '#ccc', true: '#333' }}
              />
            </View>
          {/* Additional settings */}

              <View style={[styles.itemRow, { borderBottomWidth: 1, borderBottomColor: isDark ? colors.muted : '#f0f0f0' }]}>
              <View style={[styles.optionLeft, { marginBottom: 25 }]}>
                <FontAwesome6 name="bell" size={18} color={'#E67012'} style={styles.icon} />
                <TranslatedText style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Enable Notifications</TranslatedText>
              </View>
              <Switch
                value={enableNotifications}
                onValueChange={(v) => setEnableNotifications(v)}
                thumbColor={enableNotifications ? '#E67012' : 'fff'}
                trackColor={{ false: '#ccc', true: '#333' }}
              />
            </View>
            <View style={[styles.itemRow, { borderBottomWidth: 1, borderBottomColor: isDark ? colors.muted : '#f0f0f0' }]}>
              <View style={styles.optionLeft}>
                <FontAwesome6 name="signal" size={18} color={'#E67012'} style={styles.icon} />
                <TranslatedText style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Use Cellular Data</TranslatedText>
              </View>
              <Switch
                value={useCellular}
                onValueChange={(v) => setUseCellular(v)}
                thumbColor={useCellular ? '#E67012' : '#fff'}
                trackColor={{ false: '#ccc', true: '#333' }}
              />
            </View>
            <View style={[styles.itemRow, { borderBottomWidth: 1, borderBottomColor: isDark ? colors.muted : '#f0f0f0' }]}>
              <View style={styles.optionLeft}>
                <FontAwesome6 name="link-slash" size={18} color={'#E67012'} style={styles.icon} />
                <TranslatedText style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Offline Mode</TranslatedText>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={(v) => setOfflineMode(v)}
                thumbColor={offlineMode ? '#E67012' :'#fff'}
                trackColor={{ false: '#ccc', true: '#333' }}
              />
            </View>
          <View style={styles.itemRow}>
            <TranslatedText style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Language</TranslatedText>
            <View style={[styles.pickerWrapper, { backgroundColor: isDark ? '#333' : '#fff', borderColor: isDark ? '#444' : '#e0e0e0' }]}> 
              <Picker
                selectedValue={language}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.text}
                itemStyle={{ color: colors.text }}
                onValueChange={handleLanguageChange}
              >
                {languageOptions.map(lang => (
                  <Picker.Item key={lang.value} label={lang.label} value={lang.value} color={colors.text} />
                ))}
              </Picker>
            </View>
          </View>
          <View style={styles.itemRow}>
            <TranslatedText style={[styles.label, { color: isDark ? '#fff' : '#000' }]}>Notification Tone</TranslatedText>
            <View style={[styles.pickerWrapper, { backgroundColor: isDark ? '#333' : '#fff', borderColor: isDark ? '#444' : '#e0e0e0' }]}> 
              <Picker
                selectedValue={notificationTone}
                style={[styles.picker, { color: colors.text }]}
                dropdownIconColor={colors.text}
                itemStyle={{ color: colors.text }}
                onValueChange={handleToneChange}
              >
                {notificationTones.map(tone => (
                  <Picker.Item key={tone.value} label={tone.label} value={tone.value} color={colors.text} />
                ))}
              </Picker>
            </View>
          </View>
        {/* Action buttons */}
        <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => {
              // Save changes placeholder
              Alert.alert('Saved', 'Your settings have been saved.');
            }}
            style={{ flex: 1, marginRight: 10 }}
          >
            <LinearGradient
              colors={[ '#FF9800', '#FF6D00' ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.actionButton, { borderWidth: 0 }]}
            >
              <TranslatedText style={[styles.actionText, { color: '#fff' }]}>Save Changes</TranslatedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // Cancel placeholder - navigate back
              navigation.goBack();
            }}
            style={{ flex: 1, marginLeft: 10 }}
          >
            <LinearGradient
              colors={[ '#E72020', '#D6593A' ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.actionButton, { borderWidth: 0 }]}
            >
              <TranslatedText style={[styles.actionText, { color: '#fff' }]}>Cancel</TranslatedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Add more settings here as needed */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  darkContainer: {
    backgroundColor: '#0b0b0c',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67012',
    marginBottom: 32,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  picker: {
    width: 150,
    color: '#000',
    height: 80,
  },
  pickerWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor set via inline theme
  },
  backButton: {
    padding: 8,
  },
  actionButton: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
});

export default SettingsScreen;
