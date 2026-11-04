import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';
import { LinearGradient } from 'expo-linear-gradient';
import ProctorGate from '../../components/ProctorOverlay';

const AssessmentInstructions = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const assessment = route?.params?.assessment;
  const [proctored, setProctored] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={20} color={colors.primary} style={{ marginLeft: 18 }} />
        </TouchableOpacity>
        <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>
          Assessment Instructions
        </TranslatedText>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome6 name="clipboard-check" size={60} color={colors.primary} />
        </View>

        <TranslatedText style={[styles.title, { color: colors.text }]}>
          {assessment?.title || 'Assessment'}
        </TranslatedText>

        <TranslatedText style={[styles.overview, { color: colors.muted }]}>
          Test your knowledge and skills in this comprehensive assessment. Read each question carefully and select the best answer. Your performance will help evaluate your current skill level.
        </TranslatedText>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <FontAwesome6 name="clock" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              {assessment?.duration || '30 minutes'} time limit
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="clipboard" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              {assessment?.questions || 25} multiple choice questions
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="trophy" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              Score will be calculated at the end
            </TranslatedText>
            
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="star" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              Get an average of 80% to receive your certificate of completion.
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome6 name="video" size={20} color="#FF5252" />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              This assessment is PROCTORED — your camera and microphone must stay ON for the entire test. You cannot answer any question without an active camera session.
            </TranslatedText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setProctored(true)}
        >
          <LinearGradient
            colors={['#FF9800', '#FF6D00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
          <TranslatedText style={styles.startButtonText}>Start Assessment</TranslatedText>
        </TouchableOpacity>

        {/* Mandatory camera + mic proctor gate — blocks the assessment until live */}
        {proctored && (
          <ProctorGate>
            <AssessmentProctoredView
              assessment={assessment}
              onNavigate={(navProps: any) => navigation.navigate('Assessment', navProps)}
            />
          </ProctorGate>
        )}
      </View>
    </SafeAreaView>
  );
};

// Small inner screen shown inside the proctor overlay once camera+mic are live.
const AssessmentProctoredView = ({ assessment, onNavigate }: any) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <FontAwesome6 name="shield-halved" size={44} color="#4CAF50" style={{ marginBottom: 16 }} />
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
        Proctor session is LIVE
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
        Your camera and microphone are recording. Do not cover the camera or leave this screen during the assessment.
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: '#4CAF50', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 }}
        onPress={() => onNavigate({ assessment, proctored: true })}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Begin Proctored Assessment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 80,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
    
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  infoContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,

  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 20,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  startButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AssessmentInstructions;