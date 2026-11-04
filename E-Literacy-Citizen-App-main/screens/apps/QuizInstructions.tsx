import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';
import {LinearGradient} from 'expo-linear-gradient';

const QuizInstructions = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const { courseId } = route.params || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color={colors.primary} style={{ marginLeft: 15 }} />
        </TouchableOpacity>
        <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>
          Quiz Instructions
        </TranslatedText>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="clipboard-list" size={60} color={colors.primary} />
        </View>

        <TranslatedText style={[styles.title, { color: colors.text }]}>
          Digital Safety Assessment
        </TranslatedText>

        <TranslatedText style={[styles.overview, { color: colors.muted }]}>
          Test your knowledge of digital safety and cybersecurity best practices. This quiz covers essential topics including password security, safe browsing, email safety, and protecting personal information online.
        </TranslatedText>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="clock" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              15 minutes time limit
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="question-circle" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              Multiple choice questions
            </TranslatedText>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome5 name="trophy" size={20} color={colors.primary} />
            <TranslatedText style={[styles.infoText, { color: colors.text }]}>
              Score will be calculated at the end
            </TranslatedText>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('Quiz', { courseId })}
        >
             <LinearGradient
                        colors={['#FF9800', '#FF6D00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
                      />
          <TranslatedText style={styles.startButtonText}>Start Quiz</TranslatedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    marginRight: 100,
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
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    textAlign: 'center',
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

export default QuizInstructions;