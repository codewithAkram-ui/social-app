import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient'; 

const SplashScreen = () => {
  const navigation = useNavigation();

  const text = 'Ski.io'; // Define the text
  const letters = text.split(''); // Split the text into individual characters

  // Create an Animated.Value for each letter
  const [letterAnims] = useState(() =>
    letters.map(() => new Animated.Value(0))
  );

  useEffect(() => {
    // Calculate and start the animations for each letter
    const animations = letterAnims.map((anim, index) => {
      return Animated.sequence([
        // Delay based on the letter's index
        Animated.delay(index * 250),
        // Parallel animations for each letter
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: 800, // Duration of 800ms for each letter's animation
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.spring(anim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    // Start the staggered animation sequence
    Animated.stagger(100, animations).start(() => {
      // Navigate to the next screen after the animation ends
      // navigation.navigate('NextScreen'); // Replace with your target screen
    });
  }, [letterAnims, navigation]);

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298']} // Gradient background for a vibrant look
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        {letters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.letter,
              {
                opacity: letterAnims[index],
                transform: [
                  {
                    scale: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.5], // Scale effect from 0.5 to 1.5
                    }),
                  },
                  {
                    rotateX: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['90deg', '0deg'], // 3D rotateX effect
                    }),
                  },
                  {
                    rotateY: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['90deg', '0deg'], // 3D rotateY effect
                    }),
                  },
                  {
                    translateY: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0], // Translate from 50 to 0
                    }),
                  },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
  },
  letter: {
    fontSize: 42,
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 4, // Increased space between letters
  },
});

export default SplashScreen;
