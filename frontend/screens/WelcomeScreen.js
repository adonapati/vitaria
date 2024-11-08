import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: "VITARIA",
    subtitle: "WELCOME TO",
    tagline: "Unlock Your Healthiest Self",
    features: [
      "• Personalized Meal Plans",
      "• Nutrient Tracking",
      "• Expert Guidance"
    ],
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2653&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    title: "NUTRITION\nEXPERTISE",
    subtitle: "LEVERAGE OUR",
    tagline: "Achieve Your Wellness Goals",
    features: [
      "• Evidence-Based Advice",
      "• Dietary Customization",
      "• Lifestyle Integration"
    ],
    image: "https://images.unsplash.com/photo-1546552916-985b466ffbec?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdlbGxuZXNzfGVufDB8fDR8fHww"
  },
  {
    title: "HOLISTIC\nWELLNESS",
    subtitle: "EMBRACE",
    tagline: "Nourish Mind, Body, and Soul",
    features: [
      "• Mindfulness Practices",
      "• Stress Management",
      "• Habit Building"
    ],
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80"
  }
];

export default function WelcomeScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const nextSlide = () => {
    if (currentIndex < slides.length - 1) {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
        opacityAnim.setValue(1); // Reset opacity for the next slide
      });
    } else {
      navigation.navigate('Dashboard');
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex - 1);
        opacityAnim.setValue(1); // Reset opacity for the previous slide
      });
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: currentSlide.image }}
        style={[styles.background, { width: width }]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
          style={styles.overlay}
        >
          <View style={styles.content}>
            <Animated.View style={{ opacity: opacityAnim }}>
              <View style={styles.headerContainer}>
                <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
                <Text style={styles.title}>{currentSlide.title}</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.tagline}>{currentSlide.tagline}</Text>
              <View style={styles.featureContainer}>
                {currentSlide.features.map((feature, index) => (
                  <Text key={index} style={styles.featureText}>{feature}</Text>
                ))}
              </View>
            </Animated.View>
            <TouchableOpacity
              style={styles.button}
              onPress={nextSlide}
            >
              <Text style={styles.buttonText}>
                {currentIndex === slides.length - 1 ? "GET STARTED" : "NEXT"}
              </Text>
            </TouchableOpacity>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={prevSlide}
              >
                <Text style={styles.secondaryButtonText}>PREVIOUS</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index ? styles.paginationDotActive : null,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFF',
    letterSpacing: 5,
    marginBottom: 10,
  },
  divider: {
    width: 150,
    height: 2,
    backgroundColor: '#FFD700',
    marginBottom: 30,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '400',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  featureContainer: {
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  featureText: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderColor: '#FFD700',
    borderWidth: 2,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  secondaryButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#FFD700',
  },
});