import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, View, Image } from 'react-native';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

// Import your image assets
import pencilIcon from '../assets/pencil.png';
import alignLeftIcon from '../assets/align-left.png';
import placeholderImage from '../assets/placeholder.png';
import videoIcon from '../assets/video.png';
import imageIcon from '../assets/image.png';

const categories = [
  'Technology and IT',
  'Creative and Arts',
  'Business and Management',
  'Communication and Media',
  'Education and Training',
  'Science and Research',
  'Healthcare and Wellness',
  'Legal and Regulatory',
  'Social Science and Humanities',
  'Sports and Physical Activity',
  'Crafts and Trades',
  'Travel and Adventure',
  'Religious and Spiritual',
  'Home and Lifestyle'
];

const hours = Array.from({ length: 24 }, (_, i) => i.toString());
const minutes = Array.from({ length: 60 }, (_, i) => i.toString());

const Post = ({navigation}) => {
  const [skillCategory, setSkillCategory] = useState(categories[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [resources, setResources] = useState('');
  const [location, setLocation] = useState('');
  const [goals, setGoals] = useState('');
  const [selectedHour, setSelectedHour] = useState('0');
  const [selectedMinute, setSelectedMinute] = useState('0');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);


  const [isLoading, setIsLoading] = useState(false);

  const handleMediaUpload = (type) => {
    if (type === 'image') {
      ImagePicker.openPicker({
        mediaType: 'photo',
      }).then(image => {
        if (image && image.path) {
          ImagePicker.openCropper({
            path: image.path,
            width: 300,
            height: 300,
          }).then(croppedImage => {
            setMedia({ uri: croppedImage.path, type: 'image' });
            setMediaType('image');
          }).catch(error => {
            console.error('Image Cropper Error:', error);
          });
        } else {
          console.error('Invalid image selected');
        }
      }).catch(error => {
        console.error('Image Picker Error:', error);
      });
    } else if (type === 'video') {
      ImagePicker.openPicker({
        mediaType: 'video',
      }).then(video => {
        if (video && video.duration <= 60000) { // 1 minute
          setMedia({ uri: video.path, type: 'video' });
          setMediaType('video');
        } else if (video) {
          Alert.alert(
            'Video too long',
            'Please select a video shorter than 1 minute.',
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
          );
        } else {
          console.error('Invalid video selected');
        }
      }).catch(error => {
        console.error('Video Picker Error:', error);
      });
    }
  };

  const handlePost = async () => {

    if (!title || !description  || !resources || !goals || !media) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }
  
    setIsLoading(true); // Set loading state to true
  
    const categoryRef = firestore().collection('posts').doc(skillCategory);
    const postRef = categoryRef.collection('posts').doc();
  
    let mediaUrl = null;
    if (media) {
      let mediaPath;
      if (mediaType === 'image') {
        mediaPath = `media/${user.uid}/${postRef.id}/images/${media.filename}`;
      } else if (mediaType === 'video') {
        mediaPath = `media/${user.uid}/${postRef.id}/videos/${media.filename}`;
      }
  
      const reference = storage().ref(mediaPath);
      await reference.putFile(media.uri);
      mediaUrl = await reference.getDownloadURL();
    }
  

  
    const postData = {
      skillCategory,
      title,
      description,
      tags,
      difficultyLevel,
      resources,
      location,
      goals,
      timeSpent: `${selectedHour} hours ${selectedMinute} minutes`,
      mediaUrl,
      mediaType,
      
     
      uid: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
      likes: [],
      likesCount: 0
    };
  
    try {
      await postRef.set(postData);
      console.log('Post uploaded successfully');
      setSkillCategory(categories[0]);
      setTitle('');
      setDescription('');
      setTags('');
      setDifficultyLevel('');
      setResources('');
      setLocation('');
      setGoals('');
      setSelectedHour('0');
      setSelectedMinute('0');
      setMedia(null);
      setMediaType(null);
      
    
    } catch (error) {
      console.error('Error uploading post:', error);
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Post Title</Text>
      <View style={styles.inputContainer}>
        <Image source={pencilIcon} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter post title"
          placeholderTextColor={"grey"}
        />
      </View>
      <Text style={styles.label}>Post Description</Text>
      <View style={styles.inputContainer}>
        <Image source={alignLeftIcon} style={styles.icon} />
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your post"
          placeholderTextColor={"grey"}
          multiline
        />
      </View>
      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={skillCategory}
        style={styles.picker}
        onValueChange={(itemValue) => setSkillCategory(itemValue)}
      >
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>
      <Text style={styles.label}>Upload Media</Text>
      <View style={styles.mediaContainer}>
        {media ? (
          <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
        ) : (
          <Image source={placeholderImage} style={styles.mediaPreview} />
        )}
        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity onPress={() => handleMediaUpload('image')} style={styles.mediaButton}>
            <Image source={imageIcon} style={styles.mediaIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleMediaUpload('video')} style={styles.mediaButton}>
            <Image source={videoIcon} style={styles.mediaIcon} />
          </TouchableOpacity>
        </View>
      </View>

   

      <Text style={styles.label}>Tags/Keywords</Text>
      <View style={styles.inputContainer}>
        <Image source={pencilIcon} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="e.g., #coding, #photography"
          placeholderTextColor={"grey"}
        />
      </View>

      <Text style={styles.label}>Difficulty Level</Text>
      <Picker
        selectedValue={difficultyLevel}
        style={styles.picker}
        onValueChange={(itemValue) => setDifficultyLevel(itemValue)}
      >
        <Picker.Item label="Beginner" value="beginner" />
        <Picker.Item label="Intermediate" value="intermediate" />
        <Picker.Item label="Advanced" value="advanced" />
      </Picker>

      <Text style={styles.label}>Resources/References</Text>
      <View style={styles.inputContainer}>
        <Image source={alignLeftIcon} style={styles.icon} />
        <TextInput
          style={styles.textArea}
          value={resources}
          onChangeText={setResources}
          placeholder="Enter any resources or references"
          placeholderTextColor={"grey"}
          multiline
        />
      </View>

      <Text style={styles.label}>Location</Text>
      <View style={styles.inputContainer}>
        <Image source={pencilIcon} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Optional: Enter location"
          placeholderTextColor={"grey"}
        />
      </View>

      <Text style={styles.label}>Skill Goals/Achievements</Text>
      <View style={styles.inputContainer}>
        <Image source={alignLeftIcon} style={styles.icon} />
        <TextInput
          style={styles.textArea}
          value={goals}
          onChangeText={setGoals}
          placeholder="Mention your goals or achievements"
          placeholderTextColor={"grey"}
          multiline
        />
      </View>

      <Text style={styles.label}>Time Spent</Text>
      <View style={styles.timePickerContainer}>
        <Picker
          selectedValue={selectedHour}
          style={styles.timePicker}
          onValueChange={(itemValue) => setSelectedHour(itemValue)}
        >
          {hours.map((hour, index) => (
            <Picker.Item key={index} label={hour} value={hour} />
          ))}
        </Picker>
        <Text style={styles.timePickerLabel}>hours</Text>
        <Picker
          selectedValue={selectedMinute}
          style={styles.timePicker}
          onValueChange={(itemValue) => setSelectedMinute(itemValue)}
        >
          {minutes.map((minute, index) => (
            <Picker.Item key={index} label={minute} value={minute} />
          ))}
        </Picker>
        <Text style={styles.timePickerLabel}>minutes</Text>
      </View>

   

  

      <TouchableOpacity
  style={[styles.postButton, isLoading && styles.disabledButton]}
  onPress={handlePost}
  disabled={isLoading}
>
  {isLoading ? (
    <Text style={styles.postButtonText}>Posting...</Text>
  ) : (
    <Text style={styles.postButtonText}>Post</Text>
  )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
 
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00bcd4', // Cyan border color
    backgroundColor: 'transparent', // Transparent background
    shadowColor: '#00bcd4', // Cyan shadow color for glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
  },
  backButtonText: {
    color: '#00bcd4', // Cyan text color
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: '#00bcd4', // Cyan text shadow color for glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#00bcd4', // Cyan text color
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderColor: '#00bcd4', // Cyan border color
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#1a1a1a', // Dark background for input
  },
  icon: {
    width: 20,
    height: 20,
    marginHorizontal: 10,
    tintColor: '#00bcd4', // Cyan icon color
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#00bcd4', // Cyan text color
  },
  textArea: {
    flex: 1,
    height: 80,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#00bcd4', // Cyan text color
    textAlignVertical: 'top',
  },
  picker: {
    height: 40,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#1a1a1a', // Dark background for picker
    color: '#00bcd4', // Cyan text color
  },
  mediaContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  mediaPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
    borderColor: '#00bcd4', // Cyan border color
    borderWidth: 1,
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  mediaButton: {
    marginHorizontal: 10,
  },
  mediaIcon: {
    width: 40,
    height: 40,
 
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#1a1a1a', // Dark background for document container
    padding: 10,
    borderRadius: 8,
  },
  documentText: {
    flex: 1,
    color: '#00bcd4', // Cyan text color
  },
  removeButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#00bcd4', // Cyan background
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#000000', // Black text color
    fontSize: 12,
  },
  documentButton: {
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#00bcd4', // Cyan background
    borderRadius: 8,
    alignItems: 'center',
  },
  documentButtonText: {
    color: '#000000', // Black text color
    fontSize: 14,
    fontWeight: '600',
  },
  postButton: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00bcd4', // Cyan border color
    backgroundColor: 'transparent', // Transparent background
    shadowColor: '#00bcd4', // Cyan shadow color for glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10, // For Android shadow
    alignItems: 'center',
    marginBottom: 50,
  },
  postButtonText: {
    color: '#00bcd4', // Cyan text color
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: '#00bcd4', // Cyan text shadow color for glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loadingContainer: {
    paddingVertical: 10,
    backgroundColor: '#00bcd4', // Cyan background
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    color: '#000000', // Black text color
    fontSize: 16,
    fontWeight: '600',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timePicker: {
    flex: 1,
    height: 40,
    backgroundColor: '#1a1a1a', // Dark background for picker
    color: '#00bcd4', // Cyan text color
  },
  timePickerLabel: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#00bcd4', // Cyan text color
  },
});

export default Post;