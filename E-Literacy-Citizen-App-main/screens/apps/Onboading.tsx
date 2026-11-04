import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StyleSheet,
  StatusBar,
  StyleProp,
  ViewStyle,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Removed: import { LinearGradient } from 'expo-linear-gradient'; // LinearGradient is not a core React Native component
import { FontAwesome6 } from '@expo/vector-icons'; // Import FontAwesome6 for icons
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook from React Navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useLanguage, getLanguageName, SupportedLanguage } from '../../components/LanguageContext';
import TranslatedText from '../../components/TranslatedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

type OnboardingStepOption = {
  name: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  popular: boolean;
};

type OnboardingStepTimeOption = {
  duration: string;
  description: string;
  recommended: boolean;
};

type OnboardingStep = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof FontAwesome6.glyphMap;
  colors: string[];
  options?: OnboardingStepOption[];
  timeOptions?: OnboardingStepTimeOption[];
};

const languageOptions: { code: SupportedLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'zu', label: 'Zulu' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'tn', label: 'Tswana' },
  { code: 've', label: 'Tshivenda' },
  { code: 'ts', label: 'Xitsonga' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'st', label: 'Sesotho' },
  { code: 'nr', label: 'Ndebele' },
  { code: 'ss', label: 'Swati' },
];

// Define the onboarding steps data
const onboardingSteps: OnboardingStep[] = [
  {
    id: 0,
    title: 'Select Your Language',
    subtitle: 'Choose the language you want to use the app in',
    description: 'You can change this later in your profile.',
    icon: 'language',
    colors: ['#E67012', '#f59e0b'],
  },
  {
    id: 1,
    title: "Welcome to E-Literacy",
    subtitle: "Master essential digital skills for the modern world",
    description:
      "Join thousands of learners developing crucial digital literacy skills.",
    icon: 'star-of-life', // 'sparkles' is not a valid FA6 icon, using a replacement
    colors: ['#E67012', '#f59e0b'], // Orange gradient (will use first color as solid)
  },
  {
    id: 2,
    title: "Choose Your Learning Path",
    subtitle: "What digital skills do you want to master?",
    description:
      "Select the digital literacy areas that interest you most.",
    icon: 'book-open', // FontAwesome6 icon name
    colors: ['#ea580c', '#ef4444'], // Red-orange gradient (will use first color as solid)
    options: [
      { name: "Basic Computer Skills", icon: 'brain', popular: true }, // FontAwesome6 icon name
      { name: "Internet & Email", icon: 'bullhorn', popular: false }, // Using 'bullhorn' for communication
      { name: "Digital Safety & Security", icon: 'briefcase', popular: true }, // Using 'briefcase' for security
      { name: "Social Media & Communication", icon: 'users', popular: false }, // FontAwesome6 icon name
      { name: "Online Banking & Shopping", icon: 'chart-simple', popular: false }, // Using 'chart-simple' for finance
      { name: "Digital Creativity", icon: 'palette', popular: false }, // Using 'palette' for creativity
    ],
  },
  {
    id: 3,
    title: "Learning Commitment",
    subtitle: "How much time can you dedicate to learning?",
    description:
      "Choose a learning pace that fits your lifestyle.",
    icon: 'hourglass-half', // FontAwesome6 icon name for commitment/time
    colors: ['#f59e0b', '#f97316'], // Orange gradient (will use first color as solid)
    timeOptions: [
      { duration: "Quick Sessions (15-30 min/day)", description: "Perfect for busy schedules", recommended: false },
      { duration: "Standard Learning (45-60 min/day)", description: "Most popular learning pace", recommended: true },
      { duration: "Intensive Learning (1-2 hours/day)", description: "Fast-track your digital skills", recommended: false },
      { duration: "Self-paced", description: "Learn at your own rhythm", recommended: false },
    ],
  },
  {
    id: 4,
    title: "Ready to Build Digital Confidence!",
    subtitle: "Start your digital literacy journey today",
    description:
      "Access interactive lessons, practical exercises, and real-world digital scenarios designed to make you confident and competent in the digital age.",
    icon: 'trophy', // FontAwesome6 icon name
    colors: ['#ef4444', '#ea580c'], // Red-orange gradient (will use first color as solid)
  },
];

const handleSkip = (navigation: OnboardingNavigationProp) => {
  navigation.navigate('Login'); // Changed 'Login_SignUp' to 'Login' based on App.js route name
};

type FloatingIconProps = {
  icon: keyof typeof FontAwesome6.glyphMap;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

// Component for floating background icons
const FloatingIcon = ({ icon, delay = 0, style = {} }: FloatingIconProps) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        // Animate vertical movement
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        // Animate opacity for fading in and out
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 0.2, // Fade in
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0, // Fade out
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Reset values and restart animation after a delay
        animatedValue.setValue(0);
        opacityValue.setValue(0);
        setTimeout(startAnimation, 2000); // Wait 2 seconds before repeating
      });
    };

    // Start the animation after an initial delay
    setTimeout(startAnimation, delay * 1000);
  }, []); // Empty dependency array means this effect runs once on mount

  // Interpolate translateY for floating effect
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -40], // Moves from 20px down to 40px up
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          opacity: opacityValue,
          transform: [{ translateY }],
        },
        style, // Apply any custom styles passed in props
      ]}
    >
     
      <Text>
        <FontAwesome6 name={icon} size={24} color="rgba(0, 0, 0, 0.2)" /> {/* FontAwesome6 icon */}
      </Text>
    </Animated.View>
  );
};

type ProgressBarProps = {
  progress: number;
};
// Component for the progress bar
const ProgressBar = ({ progress }: ProgressBarProps) => (
  <View style={styles.progressContainer}>
    <View
      // Replaced LinearGradient with solid background color
      style={[styles.progressFill, { width: `${progress}%`, backgroundColor: '#E67012' }]} // Solid orange for the fill
    />
  </View>
);

type BadgeProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
// Reusable Badge component
const Badge = ({ children, style = {} }: BadgeProps) => (
  <View style={[styles.badge, style]}>
    <Text style={styles.badgeText}>{children}</Text>
  </View>
);

type DisplayCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
// New DisplayCard component for non-clickable options (is a plain View)
const DisplayCard = ({ children, style = {} }: DisplayCardProps) => (
  <View
    style={[
      styles.card,
      styles.cardDefault, // Always use default styling as no selection
      style,
    ]}
  >
    {children}
  </View>
);

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingScreen'>;

// Main Onboarding Screen component
export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>(); // Get the navigation object
  const { language, setLanguage, t } = useLanguage();

  // Skip onboarding entirely for returning users: once they have completed it
  // (or logged in) we jump straight to Login instead of replaying the slides.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet(['@onboarding_completed', 'token'])
      .then((entries) => {
        if (cancelled) return;
        const map = new Map(entries);
        if (map.get('@onboarding_completed') === 'true' || map.get('token')) {
          navigation.navigate('Login');
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [navigation]);

  const finishOnboarding = React.useCallback(() => {
    AsyncStorage.setItem('@onboarding_completed', 'true').catch(() => {});
    navigation.navigate('Login');
  }, [navigation]);

  const handleSkipPress = () => finishOnboarding();

  const [currentStep, setCurrentStep] = useState<number>(0); // State for current onboarding step
  const fadeAnim = useRef(new Animated.Value(1)).current; // Animated value for fade effect
  const slideAnim = useRef(new Animated.Value(0)).current; // Animated value for slide effect
  const scrollRef = useRef<ScrollView>(null); // Ref for ScrollView to scroll to top
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(language);

  // Add state for translated step text
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedSubtitle, setTranslatedSubtitle] = useState('');
  const [translatedDescription, setTranslatedDescription] = useState('');
  // For options and timeOptions
  const [translatedOptions, setTranslatedOptions] = useState<string[]>([]);
  const [translatedTimeDurations, setTranslatedTimeDurations] = useState<string[]>([]);
  const [translatedTimeDescriptions, setTranslatedTimeDescriptions] = useState<string[]>([]);
  const [translatedBadge, setTranslatedBadge] = useState('');
  const [translatedRecommended, setTranslatedRecommended] = useState('');

  // Get current step data
  const step = onboardingSteps[currentStep];

  useEffect(() => {
    // Translate main step text
    t(step.title).then(setTranslatedTitle);
    t(step.subtitle).then(setTranslatedSubtitle);
    t(step.description).then(setTranslatedDescription);
    // Translate options if present
    if (step.options) {
      Promise.all(step.options.map(opt => t(opt.name))).then(setTranslatedOptions);
      setTranslatedBadge('');
      t('High Demand').then(setTranslatedBadge);
    } else {
      setTranslatedOptions([]);
      setTranslatedBadge('');
    }
    // Translate timeOptions if present
    if (step.timeOptions) {
      Promise.all(step.timeOptions.map(opt => t(opt.duration))).then(setTranslatedTimeDurations);
      Promise.all(step.timeOptions.map(opt => t(opt.description))).then(setTranslatedTimeDescriptions);
      t('Most Popular').then(setTranslatedRecommended);
    } else {
      setTranslatedTimeDurations([]);
      setTranslatedTimeDescriptions([]);
      setTranslatedRecommended('');
    }
  }, [step, t]);

  // Function to navigate to the next step
  const nextStep = () => {
    if (currentStep === 0) {
      if (!selectedLanguage) return; // Block if not selected
      setLanguage(selectedLanguage);
    }
    if (currentStep < onboardingSteps.length - 1) {
      Animated.sequence([
        // Fade out current content
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        // Slide out current content to the left
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 0, // Instant change to prepare for next slide-in
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1); // Update step
        slideAnim.setValue(50); // Position new content off-screen to the right
        Animated.parallel([
          // Fade in new content
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          // Slide in new content from the right
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
        // Scroll to top after animation completes
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      });
    } else {
      // This is the last step, navigate to Login_SignUp
      // Changed 'Login_SignUp' to 'Login' based on App.js route name
      finishOnboarding();
    }
  };

  // Function to navigate to the previous step
  const prevStep = () => {
    if (currentStep > 0) {
      Animated.sequence([
        // Fade out current content
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        // Slide out current content to the right
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 0, // Instant change to prepare for next slide-in
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1); // Update step
        slideAnim.setValue(-50); // Position new content off-screen to the left
        Animated.parallel([
          // Fade in new content
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          // Slide in new content from the left
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            }),
        ]).start();
        // Scroll to top after animation completes
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 100);
      });
    }
  };

  // Calculate progress percentage
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        // Replaced LinearGradient with solid background color
        style={styles.container}
      >
        
        <StatusBar barStyle="light-content" />

        {/* Floating Background Icons */}
        <FloatingIcon icon="book-open" delay={0} style={{ top: 80, left: 80 }} />
        <FloatingIcon icon="brain" delay={1} style={{ top: 160, right: 128 }} />
        <FloatingIcon icon="bullseye" delay={2} style={{ bottom: 160, left: 128 }} />
        <FloatingIcon icon="star" delay={3} style={{ bottom: 80, right: 80 }} />
        <FloatingIcon icon="trophy" delay={4} style={{ top: 240, left: width / 2 }} />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            <TouchableOpacity  style={{marginLeft: "auto", marginBottom: 10}}onPress={handleSkipPress}>
          <TranslatedText style={{ color: '#E67012', fontWeight: 'bold', fontSize: 18 }}>Skip</TranslatedText>
        </TouchableOpacity>
            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <TranslatedText style={styles.progressText}>
                  Step {currentStep + 1} of {onboardingSteps.length}
                </TranslatedText>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
              <ProgressBar progress={progress} />
            </View>

            {/* Main Content Area with Animations */}
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim, // Apply fade animation
                  transform: [{ translateX: slideAnim }], // Apply slide animation
                  flexGrow: 1,
                },
              ]}
            >
                {/* Show logo only on the 'Welcome to E-Literacy' step, otherwise show the step icon */}
                {step.title === 'Welcome to E-Literacy' ? (
                  <Image
                    source={require('../../assets/logo.jpg')}
                    style={styles.welcomeImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={[styles.iconContainer, { backgroundColor: '#E67012' }]}
                  >
                    <Text>
                      <FontAwesome6 name={step.icon} size={40} color="white" />
                    </Text>
                  </View>
                )}

              {/* Title */}
              <Text style={styles.title}>{translatedTitle || step.title}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>{translatedSubtitle || step.subtitle}</Text>

              {/* Description */}
              <Text style={styles.description}>{translatedDescription || step.description}</Text>

              {/* Step-specific content: Language Options */}
              {step.id === 0 && (
                <View style={styles.languageOptions}>
                  {languageOptions.map((langOption) => (
                    <TouchableOpacity
                      key={langOption.code}
                      style={[
                        styles.languageCard,
                        selectedLanguage === langOption.code && styles.languageCardSelected,
                      ]}
                      onPress={() => setSelectedLanguage(langOption.code)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.languageContent}>
                        <Text style={[
                          styles.languageText,
                          selectedLanguage === langOption.code && styles.languageTextSelected
                        ]}>{langOption.label}</Text>
                        {selectedLanguage === langOption.code && (
                          <Text>
                            <FontAwesome6 name="check-circle" size={20} color="#E67012" />
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Step-specific content: Career Options (now non-clickable) */}
              {step.options && (
                <View style={styles.optionsGrid}>
                  {step.options.map((option, i) => (
                    <DisplayCard key={option.name} style={styles.optionCard}>
                      <View style={styles.optionContent}>
                        {option.popular && (
                          <Badge style={styles.popularBadge}>{translatedBadge || 'High Demand'}</Badge>
                        )}
                        {/* Wrapped FontAwesome6 in Text */}
                        <Text>
                          <FontAwesome6 name={option.icon} size={32} color="#ffaf1a" /> {/* FontAwesome6 icon */}
                        </Text>
                        <Text style={styles.optionText}>{translatedOptions[i] || option.name}</Text>
                        {/* Removed CheckCircle as there's no selection */}
                      </View>
                    </DisplayCard>
                  ))}
                </View>
              )}

              {/* Step-specific content: Time Commitment Options (now non-clickable) */}
              {step.timeOptions && (
                <View style={styles.timeOptions}>
                  {step.timeOptions.map((option, i) => (
                    <DisplayCard key={option.duration} style={styles.timeCard}>
                      <View style={styles.timeContent}>
                        <View style={styles.timeLeft}>
                          {/* Wrapped FontAwesome6 in Text */}
                          <Text>
                            <FontAwesome6 name="clock" size={20} color="#ffaf1a" /> {/* FontAwesome6 icon */}
                          </Text>
                          <View style={styles.timeTexts}>
                            <Text style={styles.timeDuration}>{translatedTimeDurations[i] || option.duration}</Text>
                            <Text style={styles.timeDescription}>{translatedTimeDescriptions[i] || option.description}</Text>
                          </View>
                        </View>
                        <View style={styles.timeRight}>
                          {option.recommended && (
                            <Badge style={styles.recommendedBadge}>{translatedRecommended || 'Most Popular'}</Badge>
                          )}
                          {/* Removed CheckCircle as there's no selection */}
                        </View>
                      </View>
                    </DisplayCard>
                  ))}
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
        {/* Footer always at the bottom */}
        <View style={styles.footer}>
          {/* Progress Dots - Centered */}
          <View style={styles.dotsContainer}>
            <View style={styles.dots}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          </View>
          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={prevStep}
              disabled={currentStep === 0}
              style={[
                styles.backButton,
                currentStep === 0 && styles.disabledButton, // Disable if on first step
              ]}
              activeOpacity={0.7}
            >
              <Text>
                <FontAwesome6 name="arrow-left" size={16} color="#E67012" />
              </Text>
              <TranslatedText style={styles.backButtonText}>Back</TranslatedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextStep}
              style={[styles.nextButton, currentStep === 0 && !selectedLanguage && styles.disabledButton]}
              activeOpacity={0.8}
              disabled={currentStep === 0 && !selectedLanguage}
            >
              <View
                style={[styles.nextButtonGradient, { backgroundColor: '#E67012' }]}
              >
                <TranslatedText style={styles.nextButtonText}>
                  {currentStep === onboardingSteps.length - 1 ? "Sign Up" : "Next"}
                </TranslatedText>
                <Text>
                  <FontAwesome6 name="arrow-right" size={16} color="white" />
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet for all component styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  container: {
    flex: 1,
    // backgroundColor: '#f97316', // Changed from LinearGradient to solid orange
  },
  scrollContainer: {
    flexGrow: 1,
    // Removed justifyContent: 'center' to allow natural scroll
    padding: 2,
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white background
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    flexGrow: 1,
  },
  progressSection: {
    marginBottom: 20, // Reduced from 32
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#E67012', // Semi-transparent orange
    fontWeight: '600',
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(249, 115, 22, 0.2)', // Light orange background for track
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressTrack: {
    flex: 1,
  },
  progressFill: {
    height: '100%',
    // Background color set inline in component for dynamic width
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 24,
    bottom: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 24,
    // Background color set inline in component
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#f97316', // Orange
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFAF1A', // Semi-transparent orange
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20, // Reduced from 32
  },
  optionCard: {
    width: '48%', // Two cards per row with some spacing
    marginBottom: 12,
  },
  optionContent: {
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  optionText: {
    color: '#ffaf1a', // Blue (complementary to orange)
    fontWeight: '600',
    marginTop: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -20,
    backgroundColor: '#E67012', // Darker blue
  },
  timeOptions: {
    width: '100%',
    marginBottom: 20, // Reduced from 32
  },
  timeCard: {
    marginBottom: 12,
  },
  timeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeTexts: {
    marginLeft: 12,
  },
  timeDuration: {
    color: '#ffaf1a', // Orange
    fontWeight: '600',
    fontSize: 16,
  },
  timeDescription: {
    color: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black
    fontSize: 14,
  },
  timeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendedBadge: {
    backgroundColor: '#E67012', // Orange
  },
  card: {
    borderRadius: 12,
    borderWidth: 2,
  },
  cardDefault: {
    backgroundColor: 'rgba(255, 175, 26, 0.4)', // Light orange background
    borderColor: '#ffaf1a', // Orange border
  },
  badge: {
    backgroundColor: '#1d4ed8', // Darker blue
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex:9,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsContainer: {
    alignItems: 'center',
    marginBottom: 5,
    paddingTop: 12, // Add some padding to the top
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#f97316', // Orange
  },
  inactiveDot: {
    backgroundColor: 'rgba(249, 115, 22, 0.3)', // Light orange
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#E67012', // Changed to solid orange
    marginLeft: 8,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.3, // Make button semi-transparent when disabled
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
    
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    // Always stick to bottom
    // Use background to match card if needed
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingBottom: 12,
  },
  welcomeImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  languageOptions: {
    width: '100%',
    marginBottom: 20,
  },
  languageCard: {
    backgroundColor: 'rgba(255, 175, 26, 0.4)',
    borderWidth: 2,
    borderColor: '#ffaf1a',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  languageCardSelected: {
    backgroundColor: 'rgba(255, 129, 26, 0.56)',
    borderColor: '#E67012',
    borderWidth: 2,
    color: '#E67012',
  },
  languageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffaf1a',
  },
  languageTextSelected: {
    color: '#E67012',
  },
});
