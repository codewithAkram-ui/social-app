import React, { useState } from 'react';
import { View, Text, Image, TextInput, Alert, StyleSheet, TouchableOpacity} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import Placeholderimage from "../../assets/appplaceholder1.png";
import { ScrollView } from 'react-native-gesture-handler';

const Postedit = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { post } = route.params;

  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [location, setLocation] = useState(post.location);
  const [goals, setGoals] = useState(post.goals);
  const [tags, settags] = useState(post.tags);
  const [timeSpent, settimeSpent] = useState(post.timeSpent);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handleDelete = async () => {
    try {
      const categoryRef = firestore().collection('posts').doc(post.skillCategory);
      const postRef = categoryRef.collection('posts').doc(post.id);
      await postRef.delete();
      Alert.alert('Success', 'Post deleted successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting post: ', error);
      Alert.alert('Error', 'Failed to delete post.');
    }
  };

  const handleEdit = async () => {
    try {
      const categoryRef = firestore().collection('posts').doc(post.skillCategory);
      const postRef = categoryRef.collection('posts').doc(post.id);

      await postRef.update({
        title,
        description,
        location,
        goals,
        tags,
        timeSpent,
      });

      Alert.alert('Success', 'Post updated successfully.');
    } catch (error) {
      console.error('Error updating post: ', error);
      Alert.alert('Error', 'Failed to update post.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {post.mediaType === 'image' ? (
        <Image source={{ uri: post.mediaUrl }} style={styles.media} />
      ) : (
        <>
          {!videoLoaded ? (
            <TouchableOpacity onPress={() => setVideoLoaded(true)}>
              <Image source={Placeholderimage} style={styles.media} />
              <Text style={styles.loadVideoText}>Tap to load video</Text>
            </TouchableOpacity>
          ) : (
            <Video source={{ uri: post.mediaUrl }} style={styles.media} controls />
          )}
        </>
      )}

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        style={styles.input}
        multiline
      />
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Location"
        style={styles.input}
      />
      <TextInput
        value={goals}
        onChangeText={setGoals}
        placeholder="Goals"
        style={styles.input}
      />
      <TextInput
        value={tags}
        onChangeText={settags}
        placeholder="Tags"
        style={styles.input}
      />
      <TextInput
        value={timeSpent}
        onChangeText={settimeSpent}
        placeholder="Time Spent"
        style={styles.input}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleEdit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../../assets/arrow-left-button.png')} style={styles.backIcon} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000', // Black background
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00FFFF', // Cyan border for media
  },
  loadVideoText: {
    color: '#00FFFF', // Cyan text
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#00FFFF', // Cyan input borders
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#1C1C1E', // Dark input background
    color: '#FFFFFF', // White text for contrast
    fontSize: 16,
    shadowColor: '#00FFFF', // Cyan shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  submitButton: {
    backgroundColor: '#00FFFF', // Cyan button background
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#00FFFF', // Cyan shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#FF4C4C', // Red delete button
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 15,
    elevation: 3,
    shadowColor: '#FF4C4C', // Red shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backIcon: {
    width: 54,
    height: 54,
      },
  buttonText: {
    color: '#000000', // Black text
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Postedit;