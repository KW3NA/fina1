import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { TranslatedText } from '../../components/TranslatedText';
import { useTheme } from '../../components/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import ProctorGate from '../../components/ProctorOverlay';

// Mock questions data - replace with actual data from your state management
const mockQuestions = {
  1: [ // Digital Literacy Basics
    {
      id: 1,
      type: 'multiple_choice',
      question: 'What does "URL" stand for?',
      options: ['Universal Resource Locator', 'Uniform Resource Locator', 'United Resource Link', 'Universal Reference Link'],
      correctAnswer: 1,
    },
    {
      id: 2,
      type: 'true_false',
      question: 'A web browser is required to access the internet.',
      correctAnswer: true,
    },
    {
      id: 3,
      type: 'fill_blank',
      question: 'The _____ is the main screen area that you see after you turn on your computer.',
      correctAnswer: 'desktop',
    },
    {
      id: 4,
      type: 'multiple_choice',
      question: 'Which of the following is NOT an operating system?',
      options: ['Windows', 'macOS', 'Chrome', 'Linux'],
      correctAnswer: 2,
    },
    {
      id: 5,
      type: 'fill_blank',
      question: 'To save a file, you typically use the keyboard shortcut Ctrl + _____.',
      correctAnswer: 'S',
    },
  ],
  2: [ // Online Safety
    {
      id: 1,
      type: 'true_false',
      question: 'It is safe to use the same password for all your online accounts.',
      correctAnswer: false,
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: 'What is phishing?',
      options: ['A type of computer virus', 'Fraudulent attempt to obtain sensitive information', 'A way to speed up internet', 'A social media feature'],
      correctAnswer: 1,
    },
    {
      id: 3,
      type: 'fill_blank',
      question: 'A strong password should contain at least _____ characters.',
      correctAnswer: '8',
    },
    {
      id: 4,
      type: 'multiple_choice',
      question: 'Which of these is a sign of a secure website?',
      options: ['HTTP in the URL', 'HTTPS in the URL', 'No lock icon', 'Pop-up advertisements'],
      correctAnswer: 1,
    },
  ],
  3: [ // Intro to Email & Messaging
    { id: 1, type: 'multiple_choice', question: 'What does "CC" stand for in an email?', options: ['Carbon Copy', 'Computer Call', 'Central Contact', 'Confidential Chat'], correctAnswer: 0 },
    { id: 2, type: 'true_false', question: 'Writing in ALL CAPS in an email is considered shouting and unprofessional.', correctAnswer: true },
    { id: 3, type: 'fill_blank', question: 'To attach a document or photo to an email, click the _____ icon.', correctAnswer: 'paperclip' },
    { id: 4, type: 'multiple_choice', question: 'Which of the following is a secure way to access your email?', options: ['Two-Factor Authentication', 'Leaving it open in a public cafe', 'Using password123', 'Sharing your password with coworkers'], correctAnswer: 0 },
  ],
  4: [ // Content Creation Toolkit
    { id: 1, type: 'multiple_choice', question: 'Which format is best for transparent digital graphics and logos?', options: ['.PNG', '.JPEG', '.TXT', '.MP3'], correctAnswer: 0 },
    { id: 2, type: 'true_false', question: 'You can freely use any image found on Google without checking for copyright or license.', correctAnswer: false },
    { id: 3, type: 'fill_blank', question: 'The visual balance and arrangement of elements in a design is called the _____.', correctAnswer: 'layout' },
    { id: 4, type: 'multiple_choice', question: 'What is the main goal of a content creation thumbnail?', options: ['Catch audience interest honestly', 'Crash the viewer phone', 'Hide what the video is about', 'Make the file as big as possible'], correctAnswer: 0 },
  ],
  5: [ // Digital Banking & Finance
    { id: 1, type: 'true_false', question: 'Your bank will frequently call you asking for your confidential ATM PIN.', correctAnswer: false },
    { id: 2, type: 'multiple_choice', question: 'What is an OTP in digital banking?', options: ['One-Time Password / PIN', 'Online Tax Payment', 'Official Transfer Paper', 'Optional Tech Protection'], correctAnswer: 0 },
    { id: 3, type: 'fill_blank', question: 'A digital _____ lets you pay for goods using your smartphone without touching a physical card.', correctAnswer: 'wallet' },
  ],
  6: [ // E-Government Services
    { id: 1, type: 'multiple_choice', question: 'Which official portal in South Africa is zero-rated on mobile networks for young job seekers?', options: ['SA Youth (sayouth.mobi)', 'Facebook', 'Twitter', 'Amazon'], correctAnswer: 0 },
    { id: 2, type: 'true_false', question: 'South African citizens can renew vehicle licenses and apply for smart IDs through official government online portals.', correctAnswer: true },
    { id: 3, type: 'fill_blank', question: 'The South African Revenue Service online portal is called SARS _____.', correctAnswer: 'eFiling' },
  ],
};

const AssessmentScreen = ({ route, navigation }) => {
  const { assessment, proctored } = route.params;
  const { colors } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [questions] = useState(mockQuestions[assessment.id] || mockQuestions[1]);
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    Alert.alert(
      'Submit Assessment',
      'Are you sure you want to submit your assessment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: () => {
            // Calculate score and navigate to results
            navigation.navigate('AssessmentResults', { 
              assessment, 
              answers, 
              questions 
            });
          }
        }
      ]
    );
  };

  const handleQuitAssessment = () => {
    setShowQuitModal(false);
    navigation.goBack();
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </Text>
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => {
                const isSelected = currentAnswer === index;
                const isAnswered = currentAnswer !== undefined;
                
                if (isSelected) {
                  // Selected option with gradient
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.optionButton}
                      onPress={() => handleAnswer(question.id, index)}
                    >
                      <LinearGradient
                        colors={['#E67012', '#F4842B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.selectedOptionGradient}
                      >
                        <Text style={styles.selectedOptionText}>
                          {String.fromCharCode(65 + index)}. {option}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                } else {
                  // Unselected options
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: isAnswered ? '#E5E5E5' : colors.card,
                          borderColor: isAnswered ? '#D0D0D0' : '#E0E0E0',
                        }
                      ]}
                      onPress={() => handleAnswer(question.id, index)}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: isAnswered ? '#808080' : colors.text }
                      ]}>
                        {String.fromCharCode(65 + index)}. {option}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              })}
            </View>
          </View>
        );

      case 'true_false':
        return (
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </Text>
            <View style={styles.trueFalseContainer}>
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  {
                    backgroundColor: currentAnswer === true ? '#4CAF50' : colors.card,
                    borderColor: '#E0E0E0',
                  }
                ]}
                onPress={() => handleAnswer(question.id, true)}
              >
                <Text style={[
                  styles.trueFalseText,
                  { color: currentAnswer === true ? 'white' : colors.text }
                ]}>
                  True
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  {
                    backgroundColor: currentAnswer === false ? '#F44336' : colors.card,
                    borderColor: '#E0E0E0',
                  }
                ]}
                onPress={() => handleAnswer(question.id, false)}
              >
                <Text style={[
                  styles.trueFalseText,
                  { color: currentAnswer === false ? 'white' : colors.text }
                ]}>
                  False
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'fill_blank':
        return (
          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </Text>
            <TextInput
              style={[
                styles.fillBlankInput,
                {
                  backgroundColor: colors.card,
                  borderColor: '#E0E0E0',
                  color: colors.text,
                }
              ]}
              value={currentAnswer || ''}
              onChangeText={(text) => handleAnswer(question.id, text)}
              placeholder="Type your answer here..."
              placeholderTextColor={colors.muted}
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (!questions.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            No questions available for this assessment.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <ProctorGate active={!!proctored}>
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
       
        <Text style={styles.headerTitle}>{assessment.title}</Text>
        <TouchableOpacity onPress={() => setShowQuitModal(true)} style={styles.quitButton}>
          <FontAwesome6 name="xmark" size={20} color="#FF0000" />
        </TouchableOpacity>
      </View>

      {/* Timer - moved above progress bar */}
      <View style={styles.timerContainer}>
        
        <Text style={[styles.timerText, { color: timeRemaining <= 10 * 60 ? '#FF0000' : '#4CAF50' }]}>Time: {formatTime(timeRemaining)}</Text>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuestion(currentQuestion)}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { opacity: currentQuestionIndex === 0 ? 0.5 : 1 }
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAssessment}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.submitGradient}
            >
              <Text style={styles.submitButtonText}>Submit Assessment</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#FF9800', '#FF6D00']}
              style={styles.nextGradient}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Quit Modal */}
      <Modal
        visible={showQuitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Quit Assessment?
            </Text>
            <Text style={[styles.modalMessage, { color: colors.muted }]}>
              Are you sure you want to quit? Your progress will be lost.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowQuitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.quitModalButton]}
                onPress={handleQuitAssessment}
              >
                <Text style={styles.quitButtonText}>Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </ProctorGate>
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
    color: '#E67012',
    flex: 1,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  timerText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67012',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E67012',
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionContainer: {
    paddingVertical: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionGradient: {
    padding: 16,
    borderRadius: 8,
  },
  selectedOptionText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  trueFalseButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  trueFalseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fillBlankInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  navButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  nextGradient: {
    padding: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  quitButton: {
    padding: 5,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  quitModalButton: {
    backgroundColor: '#FF0000',
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AssessmentScreen;