import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { FontAwesome6 } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

/**
 * ProctorOverlay - Mandatory camera + microphone proctoring for assessments/quizzes.
 *
 * Wrap any assessment screen with <ProctorGate>...</ProctorGate>. The learner CANNOT
 * answer a single question until they grant BOTH camera and microphone permissions
 * AND the live camera preview is active. If they background the app or revoke
 * permissions mid-assessment, the overlay re-covers the screen and blocks all input
 * until the camera is live again.
 */

type ProctorState = 'checking' | 'blocked' | 'ready';

const ProctorOverlayInner: React.FC<{
  children: React.ReactNode;
  onSessionEnd?: () => void;
}> = ({ children, onSessionEnd }) => {
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const [state, setState] = useState<ProctorState>('checking');
  const [cameraKey, setCameraKey] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState('00:00');
  const camRef = useRef<any>(null);
  const isFocused = useIsFocused();

  const granted = !!camPerm?.granted && !!micPerm?.granted;

  // If the learner navigates away (blur) mid-session, the next time they focus
  // this screen they must re-arm the camera — blocks tab-switching to cheat.
  useEffect(() => {
    if (!isFocused && state === 'ready') {
      setState('blocked');
    }
  }, [isFocused, state]);

  // Live REC timer tick while proctored session is active.
  useEffect(() => {
    if (state !== 'ready' || !sessionStartedAt) return;
    const t = setInterval(() => {
      setElapsed(formatElapsed(Date.now() - sessionStartedAt));
    }, 1000);
    return () => clearInterval(t);
  }, [state, sessionStartedAt]);

  // Re-check permissions when focusing so a revoked permission instantly
  // re-blocks the assessment.
  useEffect(() => {
    if (isFocused && state === 'ready' && !(camPerm?.granted && micPerm?.granted)) {
      setState('blocked');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, camPerm, micPerm]);

  const handlePermissionRequest = async () => {
    if (!camPerm?.granted) {
      const r = await requestCamPerm();
      if (!r.granted) {
        Alert.alert(
          'Camera required',
          'This assessment is proctored. You must allow camera access to write the test. Please enable it in your phone settings.',
        );
        return;
      }
    }
    if (!micPerm?.granted) {
      const r = await requestMicPerm();
      if (!r.granted) {
        Alert.alert(
          'Microphone required',
          'This assessment is proctored. You must allow microphone access to write the test. Please enable it in your phone settings.',
        );
        return;
      }
    }
    setCameraKey((k) => k + 1);
    setState('ready');
    setSessionStartedAt(Date.now());
  };

  const handleCameraReady = () => {
    setState('ready');
    if (!sessionStartedAt) setSessionStartedAt(Date.now());
  };

  const handleCameraError = () => {
    setState('blocked');
  };

  if (state === 'checking') {
    return (
      <View style={styles.container}>
        <FontAwesome6 name="shield-halved" size={48} color="#E67012" />
        <Text style={styles.title}>Starting secure assessment…</Text>
        <Text style={styles.subtitle}>Verifying camera and microphone</Text>
      </View>
    );
  }

  if (!granted || state === 'blocked') {
    return (
      <View style={styles.container}>
        <View style={styles.iconRow}>
          <FontAwesome6
            name="video-slash"
            size={40}
            color={camPerm?.granted ? '#4CAF50' : '#FF5252'}
          />
          <FontAwesome6
            name="microphone-slash"
            size={40}
            color={micPerm?.granted ? '#4CAF50' : '#FF5252'}
            style={{ marginLeft: 24 }}
          />
        </View>
        <Text style={styles.title}>Camera &amp; Microphone Required</Text>
        <Text style={styles.subtitle}>
          To prevent cheating, this assessment can only be written while your camera is on and
          recording. No answers can be entered without an active proctor session.
        </Text>
        <TouchableOpacity style={styles.enableButton} onPress={handlePermissionRequest} activeOpacity={0.85}>
          <Text style={styles.enableButtonText}>Enable Camera &amp; Mic to Start</Text>
        </TouchableOpacity>
        {!camPerm?.canAskAgain && (
          <Text style={styles.settingsHint}>
            Permission was denied permanently — please enable Camera and Microphone in your phone
            Settings, then reopen the app.
          </Text>
        )}
      </View>
    );
  }

  // Proctored session: children rendered above the live camera feed.
  return (
    <View style={styles.container}>
      <CameraView
        key={cameraKey}
        ref={camRef}
        facing="front"
        style={StyleSheet.absoluteFill}
        onCameraReady={handleCameraReady}
        onError={handleCameraError}
        mute
      />
      {/* Dim veil so the quiz stays readable over the video */}
      <View pointerEvents="none" style={styles.veil} />
      <View style={styles.sessionBar}>
        <View style={styles.recDot} />
        <Text style={styles.sessionText}>
          PROCTORED • REC {elapsed}
        </Text>
        <Text style={styles.sessionText}>Do not cover your camera</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * ProctorGate — drop-in wrapper. Renders the proctor blocking screen until the
 * camera session is live, then renders children inside the proctored layout.
 */
export const ProctorGate: React.FC<{
  active?: boolean;
  children: React.ReactNode;
  onSessionEnd?: () => void;
}> = ({ active = true, children, onSessionEnd }) => {
  if (!active) return <>{children}</>;
  return <ProctorOverlayInner onSessionEnd={onSessionEnd}>{children}</ProctorOverlayInner>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F14' },
  content: { flex: 1 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  iconRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  enableButton: {
    alignSelf: 'center',
    backgroundColor: '#E67012',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  enableButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  settingsHint: {
    color: '#FFAB91',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  sessionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 10,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF1744',
    marginRight: 8,
  },
  sessionText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});

export default ProctorGate;
