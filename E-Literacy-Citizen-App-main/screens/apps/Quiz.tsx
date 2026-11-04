import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../components/ThemeContext';
import TranslatedText from '../../components/TranslatedText';
import { supabase } from '../../config/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import NativeAd from '../../components/NativeAd';
import ProctorGate from '../../components/ProctorOverlay';

const Quiz = ({ navigation, route }: any) => {
  const { courseId, proctored } = route.params || {};
  const { colors, isDark } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showAd, setShowAd] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);

  const getQuestionsForCourse = (courseId: string) => {
    const questionSets: { [key: string]: any[] } = {
      '4': [ // CV Course Questions
        {
          question: "What is the ideal length for a professional CV?",
          options: ["1 page", "2-3 pages", "4+ pages", "No limit"],
          correct: 1,
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo94aOlDKPw6XtMFWsno0zeO5bQhmhYuN0PA&s",
        },
        {
          question: "Which section should appear first on your CV?",
          options: ["Work Experience", "Education", "Personal Information", "References"],
          correct: 2,
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo94aOlDKPw6XtMFWsno0zeO5bQhmhYuN0PA&s",
        },
        {
          question: "What should you avoid including in your CV?",
          options: ["Relevant skills", "Personal photo", "Work experience", "Contact information"],
          correct: 1,
          imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo94aOlDKPw6XtMFWsno0zeO5bQhmhYuN0PA&s",
        }
      ],
      'default': [ // Default Safety Questions
        {
          question: "What is the first step to stay safe online?",
          options: ["Share passwords", "Use strong passwords", "Click all links", "Ignore updates"],
          correct: 1,
          imageUrl: "https://webcdn.cfc.com/media/butnbcyr/stay-safe-online_resources_1600x900px-v4-01.png?width=1320&height=951&v=1daea641b7e1d50",
        },
        {
          question: "Which is a secure way to browse the internet?",
          options: ["HTTP websites", "HTTPS websites", "Any website", "Pop-up websites"],
          correct: 1,
          imageUrl: "https://aboutssl.org/wp-content/uploads/2019/01/browser-security.png",
        },
        {
          question: "What should you do with suspicious emails?",
          options: ["Open attachments", "Reply immediately", "Delete them", "Forward to friends"],
          correct: 2,
          imageUrl: "https://www.webroot.com/download_file/4112/0",
        }
      ]
    };
    return questionSets[courseId] || questionSets['default'];
  };

  const [questions, setQuestions] = useState<any[]>(getQuestionsForCourse(courseId));

  useEffect(() => {
    async function loadQuestionsFromSupabase() {
      try {
        const { data: dbModules } = await supabase
          .from('modules')
          .select('quiz, title')
          .eq('course_id', courseId);

        if (dbModules && dbModules.length > 0) {
          const loaded: any[] = [];
          for (const m of dbModules) {
            if (m.quiz && Array.isArray(m.quiz.questions)) {
              for (const q of m.quiz.questions) {
                loaded.push({
                  question: q.question,
                  options: q.options || [],
                  correct: q.correctIndex ?? 0,
                  explanation: q.explanation || '',
                  imageUrl: 'https://webcdn.cfc.com/media/butnbcyr/stay-safe-online_resources_1600x900px-v4-01.png?width=1320&height=951&v=1daea641b7e1d50',
                });
              }
            }
          }
          if (loaded.length > 0) {
            setQuestions(loaded);
          }
        }
      } catch (err) {
        console.log('Error loading questions from Supabase:', err);
      }
    }
    loadQuestionsFromSupabase();
  }, [courseId]);

  const handleAnswer = (selectedIndex: number) => {
    const newAnswers = [...userAnswers, selectedIndex];
    setUserAnswers(newAnswers);
    
    if (selectedIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowAd(true);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setShowAd(true);
    }
  }, [timeLeft, showResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setShowFinalResult(false);
    setShowAd(false);
    setTimeLeft(15 * 60);
    setUserAnswers([]);
  };

  const handleAdClose = () => {
    setShowAd(false);
    setShowResult(true);
    setShowFinalResult(true);
  };

  // Persist the finished quiz attempt to Supabase (quiz_attempts table) so the
  // Admin Dashboard > Reports tab shows real data. Best-effort: failures are
  // logged but never block the result screen.
  useEffect(() => {
    if (!showFinalResult) return;
    (async () => {
      try {
        let userId: string | null = null;
        try {
          const raw = await AsyncStorage.getItem('user');
          const cached = raw ? JSON.parse(raw) : null;
          if (cached?.id) userId = cached.id;
          if (!userId && cached?.email) {
            const { data } = await supabase.from('users').select('id').eq('email', cached.email).maybeSingle();
            userId = data?.id ?? null;
          }
        } catch {}
        if (!userId) return;
        const total = questions.length || 1;
        const scorePct = Math.round((score / total) * 100);
        await supabase.from('quiz_attempts').insert({
          user_id: userId,
          course_id: courseId ?? null,
          score: scorePct,
          passed: scorePct >= 70,
        });
      } catch (err) {
        console.log('Failed to save quiz attempt:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFinalResult]);

  if (showResult && showFinalResult) {
    return (
      <SafeAreaView style={{ alignItems: "center",  flex: 1, padding: 20,backgroundColor: isDark ? '#1c1c1e' : colors.background }}>
        <View style={styles.resultContainer}>
          <Image 
            source={require('../../assets/trophy.gif')} 
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
          <TranslatedText style={[styles.resultTitle, { color: "#E67012" }]}>
            Quiz Complete!
          </TranslatedText>
          <Text style={[styles.scoreText, { color: colors.primary }]}>
            {score}/{questions.length}
          </Text>
          
          {userAnswers.map((answer, index) => {
            const question = questions[index];
            const isCorrect = answer === question.correct;
            if (isCorrect) return null;
            
            return (
              <View key={index} style={[styles.wrongAnswerContainer, { backgroundColor: isDark ? '#444' : '#ffebee' }]}>
                <TranslatedText style={[styles.wrongQuestionText, { color: colors.text }]}>
                  Q{index + 1}: {question.question}
                </TranslatedText>
                <TranslatedText style={styles.wrongAnswerText}>
                  Your answer: {question.options[answer]}
                </TranslatedText>
                <TranslatedText style={styles.correctAnswerText}>
                  Correct answer: {question.options[question.correct]}
                </TranslatedText>
              </View>
            );
          })}
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: "#00AA00" }]}
            onPress={resetQuiz}
          >
            <TranslatedText style={styles.buttonText}>Try Again</TranslatedText>

          </TouchableOpacity >
          <TouchableOpacity onPress={() => navigation.navigate('ResumeCourse', { courseId })} style={{ marginTop: 15, paddingHorizontal: 0 }}>
            <LinearGradient
                          colors={['#FF9800', '#FF6D00']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
                        />
                        <TranslatedText style={[styles.buttonText, {paddingHorizontal: 40, paddingVertical: 12}]}>Return to Course Menu</TranslatedText>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <ProctorGate active={proctored !== false}>
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TranslatedText style={[styles.headerTitle, { color: colors.primary }]}>
          Digital Safety Quiz
        </TranslatedText>
        <TouchableOpacity onPress={() => setShowQuitModal(true)}>
          <FontAwesome5 name="door-open" size={20} color={'#FF0000'} style={{ marginRight: 15 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: timeLeft <= 5 * 60 ? '#FF0000' : '#00AA00' }]}>
          Time Left: {formatTime(timeLeft)}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: colors.muted }]}>
          {currentQuestion + 1} of {questions.length}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.muted + '30' }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${((currentQuestion + 1) / questions.length) * 100}%`
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Image source={{ uri: questions[currentQuestion]?.imageUrl || 'https://webcdn.cfc.com/media/butnbcyr/stay-safe-online_resources_1600x900px-v4-01.png?width=1320&height=951&v=1daea641b7e1d50' }} style={styles.questionImage} />
        <TranslatedText style={[styles.questionText, { color: colors.text }]}>
          {questions[currentQuestion].question}
        </TranslatedText>
        
        {questions[currentQuestion].options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, { borderColor: colors.primary, backgroundColor:  'rgba(255, 129, 26, 0.56)' }]}
            onPress={() => handleAnswer(index)}
          >
            <TranslatedText style={[styles.optionText, { color: '#E67012' }]}>
              {option}
            </TranslatedText>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={showQuitModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <TranslatedText style={[styles.modalTitle, { color: colors.text }]}>
              Are you sure you want to quit?
            </TranslatedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowQuitModal(false)}
              >
                <TranslatedText style={styles.modalButtonText}>No</TranslatedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#FF0000' }]}
                onPress={() => {
                  setShowQuitModal(false);
                  // Fill remaining answers as -1 (unanswered)
                  const remainingAnswers = Array(questions.length - userAnswers.length).fill(-1);
                  setUserAnswers([...userAnswers, ...remainingAnswers]);
                  setShowAd(true);
                }}
              >
                <TranslatedText style={styles.modalButtonText}>Yes</TranslatedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <NativeAd 
        visible={showAd} 
        onClose={handleAdClose}
      />
    </SafeAreaView>
    </ProctorGate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 115,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 30,
    lineHeight: 26,
    textAlign: 'center',
  },
  questionImage:{
    width: '100%',
    objectFit: 'contain',
    height: 180,
    marginBottom: 20,
    borderRadius: 10,
  },
  optionButton: {
    padding: 16,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: '#E67012',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 129, 26, 0.56)',
  },
  optionText: {
    fontSize: 16,
    color: '#E67012',
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  wrongAnswerContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    width: '100%',
  },
  wrongQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  wrongAnswerText: {
    fontSize: 12,
    color: '#d32f2f',
    marginBottom: 2,
  },
  correctAnswerText: {
    fontSize: 12,
    color: '#388e3c',
  },
});

export default Quiz;