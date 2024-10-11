import React, { useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Dimensions, TouchableOpacity, Animated} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Login from './login';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const data = [
  {
    id: '1',
    title: 'Discover New Skills',
    description: 'Explore a wide range of skills based on your interests. From coding to cooking, find something new to learn every day.',
    image: require('../assets/discoverskill.jpeg'), // replace with your image path
  },
  {
    id: '2',
    title: 'Join a Community',
    description: 'Connect with like-minded individuals who share your passion. Collaborate, share insights, and grow together.',
    image: require('../assets/community.jpeg'), // replace with your image path
  },
  {
    id: '3',
    title: 'Daily Challenges',
    description: 'Enhance your skills with daily challenges. Stay motivated and track your progress as you complete tasks.',
    image: require('../assets/dailychallenges.jpeg'), // replace with your image path
  },
  {
    id: '4',
    title: 'Share Your Achievements',
    description: 'Showcase your skills and accomplishments. Inspire others by sharing your learning journey and achievements.',
    image: require('../assets/achievements.jpeg'), // replace with your image path
  },
  {
    id: '5',
    title: 'Get Started!',
    description: 'Ready to enhance your skills and join a vibrant community? Let’s get started on your learning journey!',
    image: require('../assets/getstart.jpeg'), // replace with your image path
  },
];

const CarouselItem = ({ item }) => (
  <View style={styles.item}>
    <Image source={item.image} style={styles.image} />
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.description}>{item.description}</Text>
  </View>
);

const Question = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={data}
        renderItem={({ item }) => <CarouselItem item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        bounces={false}
      />
      <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate(Login)}>
        <LinearGradient colors={['#6dd5fa', '#2980b9']} style={styles.gradient}>
          <Text style={styles.startButtonText}>Let's Start</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    width: width * 0.85, // Slightly smaller width for padding
    height: height * 0.75, // Adjust height to fit better
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: width * 0.075, // Center items with padding on sides
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 30, // Increased radius for a smoother look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 30,
    borderRadius: width * 0.35,
    borderWidth: 3,
    borderColor: '#2980b9',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2c3e50',
  },
  description: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  startButton: {
    position: 'absolute',
    bottom: 40,
    left: width * 0.1, // Center button with equal margins
    right: width * 0.1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  gradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Question;
