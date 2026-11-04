import React, { useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Alert, 
  SafeAreaView, 
  TouchableOpacity,
  Text 
} from 'react-native';
import { Camera } from 'expo-camera';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeContext';

const WebViewScreen = ({ route, navigation }) => {
  const { uri } = route.params;
  const { colors } = useTheme();
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasCameraPermission(false);
      }
    };

    requestCameraPermission();
  }, []);

  useEffect(() => {
    if (hasCameraPermission === false) {
      Alert.alert(
        "Camera Permission Required", 
        "Camera access is required for AR features to work properly.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Camera.requestCameraPermissionsAsync() }
        ]
      );
    }
  }, [hasCameraPermission]);

  const handleError = (errorMessage: string) => {
    setError(true);
    setLoading(false);
    Alert.alert("Error", errorMessage, [
      { text: "Retry", onPress: () => { setError(false); setLoading(true); }},
      { text: "Go Back", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={20} color="#E67012" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>AR Experience</Text>
        <View style={{ width: 40 }} />
      </View>

      

      {/* WebView */}
      {!error && (
        <WebView
          source={{ uri }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            handleError(`HTTP Error: ${nativeEvent.statusCode}`);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            handleError(`Error: ${nativeEvent.description || 'Something went wrong while loading the page.'}`);
          }}
          style={styles.webview}
          javaScriptEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={true}
          // Enable camera and microphone for AR
          mediaTypes="all"
          allowsProtectedMedia={true}
          // Additional AR-specific settings
          originWhitelist={['*']}
          mixedContentMode="compatibility"
          thirdPartyCookiesEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={true}
        />
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <FontAwesome6 name="exclamation-triangle" size={48} color="#E67012" />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Failed to load AR experience
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(false);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#E67012',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WebViewScreen;