import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Countdown from 'react-native-countdown-component';
import firestore from '@react-native-firebase/firestore'; 
import { Picker } from '@react-native-picker/picker';

const Goal = () => {
  const [answer, setAnswer] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [timerDuration, setTimerDuration] = useState(86400); // 24 hours in seconds
  const [selectedCategory, setSelectedCategory] = useState(''); // State for selected category
  const [question, setQuestion] = useState(''); // State for fetched question

  useEffect(() => {
    if (selectedCategory) {
      fetchQuestion(selectedCategory); // Fetch question when category is selected
    }

    // Fetch new question every 24 hours
    const interval = setInterval(() => {
      if (selectedCategory) {
        fetchQuestion(selectedCategory);
      }
    }, 86400000); // 24 hours in milliseconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [selectedCategory]);

  // Fetch question from the selected category in Firebase
  const fetchQuestion = async (category) => {
    try {
      const questionSnapshot = await firestore()
        .collection('goals')
        .doc(category) // Access the sub-collection (e.g., 'programming')
        .collection('questions') // Sub-collection of questions
        .limit(1)
        .get();

      if (!questionSnapshot.empty) {
        const questionData = questionSnapshot.docs[0].data();
        setQuestion(questionData.text); // Assuming the question field is named 'text'
      } else {
        Alert.alert('No Questions', 'No questions available in this category.');
      }
    } catch (error) {
      console.error('Error fetching question: ', error);
      Alert.alert('Error', 'Could not fetch question. Please try again later.');
    }
  };

  const handleMediaSelection = () => {
    launchImageLibrary({ mediaType: 'mixed' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const selectedUri = response.assets[0].uri;
        setSelectedMedia(selectedUri);
      }
    });
  };

  const handleSubmit = () => {
    if (!answer) {
      Alert.alert('Error', 'Please enter an answer');
      return;
    }
    // Submit logic here
    Alert.alert('Success', 'Your answer has been submitted');
  };

  return (
    <View style={styles.container}>
      {/* Category Selection */}
      <Text style={styles.categoryText}>Select a Category:</Text>
      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="Select Category" value="" />
        <Picker.Item label="Programming" value="programming" />
        <Picker.Item label="Gaming" value="gaming" />
        <Picker.Item label="Other" value="other" />
      </Picker>

      {/* Question & Timer Section */}
      {selectedCategory && question && (
        <View style={styles.topSection}>
          <Text style={styles.questionText}>
            🌟 Today's Question: {question} 🌟
          </Text>
          <Countdown
            until={timerDuration}
            size={20}
            onFinish={() => Alert.alert('Time Finished', 'You ran out of time!')}
            digitStyle={{ backgroundColor: '#1e1e1e' }}
            digitTxtStyle={{ color: '#fff' }}
            timeToShow={['H', 'M', 'S']}
            timeLabels={{ h: 'Hrs', m: 'Min', s: 'Sec' }}
          />
        </View>
      )}

      {/* Answer Input */}
      <TextInput
        style={styles.input}
        placeholder="Type your answer here..."
        value={answer}
        onChangeText={(text) => setAnswer(text)}
        placeholderTextColor="#888"
        multiline
      />

      {/* Media Preview */}
      {selectedMedia && (
        <Image source={{ uri: selectedMedia }} style={styles.mediaPreview} />
      )}

      {/* Upload Media Button */}
      <TouchableOpacity style={styles.mediaButton} onPress={handleMediaSelection}>
        <Text style={styles.mediaButtonText}>📷 Upload Image or Video</Text>
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>🚀 Submit Answer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#282c34',
  },
  topSection: {
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    height: 120,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#3a3a3a',
    textAlignVertical: 'top',
  },
  mediaButton: {
    backgroundColor: '#0d6efd',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  mediaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#3a3a3a',
  },
  categoryText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    color: '#fff',
    marginBottom: 20,
    backgroundColor: '#3a3a3a',
    borderRadius: 10,
  },
});

export default Goal;
