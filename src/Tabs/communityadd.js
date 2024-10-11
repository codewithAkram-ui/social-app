import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert,FlatList,ActivityIndicator} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import storage from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import Community from './community';




const Communityadd = () => {
  const [communityName, setCommunityName] = useState('');
  const [category, setCategory] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isImageInappropriate, setIsImageInappropriate] = useState(false); 
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();

  const forbiddenWords = [
    'sex', 'nude', 'porn', 'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 
    'pussy', 'cunt', 'whore', 'slut', 'faggot', 'nigger', 'nigga', 'cock', 'cum', 
    'rape', 'molest', 'suck', 'blowjob', 'handjob', 'dildo', 'vibrator', 'anal', 
    'fisting', 'fucker', 'motherfucker', 'tits', 'boobs', 'breasts', 'vagina', 
    'penis', 'ejaculate', 'orgasm', 'masturbate', 'hentai', 'incest', 'bestiality', 
    'zoophilia', 'necrophilia', 'pedophile', 'pedophilia', 'childporn', 'child porn'
  ];

  const containsForbiddenWords = (text) => {
    return forbiddenWords.some((word) => text.toLowerCase().includes(word));
  };

  const categories = [
    { label: 'Technology and IT', icon: require('../assets/cloud.png') },
    { label: 'Creative and Arts', icon: require('../assets/inspiration.png') },
    { label: 'Business and Management', icon: require('../assets/handshake.png') },
    { label: 'Communication and Media', icon: require('../assets/social-media.png') },
    { label: 'Education and Training', icon: require('../assets/teaching.png') },
    { label: 'Science and Research', icon: require('../assets/flask.png') },
    { label: 'Healthcare and Wellness', icon: require('../assets/healthcare.png') },
    { label: 'Legal and Regulatory', icon: require('../assets/auction.png') },
    { label: 'Social Science and Humanities', icon: require('../assets/help.png') },
    { label: 'Sports and Physical Activity', icon: require('../assets/ball.png') },
    { label: 'Crafts and Trades', icon: require('../assets/chart.png') },
    { label: 'Travel and Adventure', icon: require('../assets/plane-departure.png') },
    { label: 'Religious and Spiritual', icon: require('../assets/praying-hands.png') },
    
    { label: 'Home and Lifestyle', icon: require('../assets/people-roof.png') },
  ];


  const subdomains = {
    'Technology and IT': [
      'Programming and Development',
      'Data and Analytics',
      'IT and Networking',
      'Engineering',
    ],
    'Creative and Arts': [
      'Design',
      'Writing and Content Creation',
      'Art',
      'Music',
    ],
    'Business and Management': [
      'Management',
      'Marketing',
      'Finance',
      'Sales',
    ],
    'Communication and Media': [
      'Verbal Communication',
      'Written Communication',
      'Broadcasting',
      'Photography and Film',
    ],
    'Education and Training': [
      'Teaching',
      'Training and Development',
      'Coaching',
      'Personal Development',
    ],
    'Science and Research': [
      'Biological Sciences',
      'Physical Sciences',
      'Mathematics',
      'Environmental Science',
    ],
    'Healthcare and Wellness': [
      'Physical Health',
      'Nutrition',
      'Mental Health',
      'Psychology',
    ],
    'Legal and Regulatory': [
      'Legal Practice',
      'Regulatory Compliance',
      'Law Enforcement',
      'Security Operations',
    ],
    'Social Science and Humanities': [
      'History and Archaeology',
      'Political Science',
      'Cultural Studies',
      'Social Work',
    ],
    'Sports and Physical Activity': [
      'Team Sports',
      'Individual Sports',
      'Extreme Sports',
    ],
    'Crafts and Trades': [
      'Construction',
      'Automotive',
      'Craftsmanship',
      'Home Improvement',
    ],
    'Travel and Adventure': [
      'Survival Skills',
      'Travel Skills',
    ],
    'Religious and Spiritual': [
      'Religious Studies',
      'Spiritual Practices',
    ],
   
    'Home and Lifestyle': [
      'Cooking and Baking',
      'Gardening and Horticulture',
    ],
  };


  const apiKey = '';

  // Check if the uploaded image contains inappropriate content using Google Vision API
  const checkImageForInappropriateContent = async (imageUrl) => {
    try {
      const body = JSON.stringify({
        requests: [
          {
            features: [{ type: 'SAFE_SEARCH_DETECTION' }],
            image: { source: { imageUri: imageUrl } },
          },
        ],
      });

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
        }
      );

      const result = await response.json();
      const safeSearch = result.responses[0].safeSearchAnnotation;

      if (safeSearch) {
        const { adult, violence } = safeSearch;

        // Check if the content is inappropriate
        if (adult === 'LIKELY' || adult === 'VERY_LIKELY' || 
            violence === 'LIKELY' || violence === 'VERY_LIKELY') {
          setIsImageInappropriate(true);
          return true; // Image is inappropriate
        }
      }

      setIsImageInappropriate(false); // Image is appropriate
      return false;
    } catch (error) {
      console.error('Error checking image:', error);
      Alert.alert('Error', 'Something went wrong while checking the image.');
      return true; // Assume inappropriate if error occurs
    }
  };

  // Function to handle image picking and validation
  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
      },
      async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.error('ImagePicker Error: ', response.error);
        } else if (response.assets && response.assets.length > 0) {
          const selectedImageUri = response.assets[0].uri;
          setImage(selectedImageUri);
          setIsImageInappropriate(false);

          try {
            // Upload image to Firebase Storage and get its public URL
            const imageUrl = await uploadImage(selectedImageUri);

            if (imageUrl) {
              // Check the uploaded image for inappropriate content
              const isInappropriate = await checkImageForInappropriateContent(imageUrl);

              if (isInappropriate) {
                Alert.alert('Inappropriate Image', 'This image contains inappropriate content. Please select another image.');
                setImage(null); // Reset the image if inappropriate
              }
            } else {
              Alert.alert('Error', 'Failed to upload image.');
            }
          } catch (error) {
            console.error('Error during image handling:', error);
          }
        }
      }
    );
  };
  const uploadImage = async (uri) => {
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = storage().ref(`images/${filename}`);
    await storageRef.putFile(uri);
    const downloadURL = await storageRef.getDownloadURL();
    return downloadURL;
  };
  


  const createCommunity = async () => {
    if (communityName.trim() === '' || category.trim() === '' || subdomain.trim() === '' || description.trim() === '' || !image) {
      Alert.alert('Please fill in all fields.');
      return;
    }
    if (containsForbiddenWords(communityName) || containsForbiddenWords(description)) {
      Alert.alert('Inappropriate Content', 'Please remove any inappropriate words from the Community Name or Description.');
      return;
    }
    if (communityName.length > 10) {
      Alert.alert('Community Name Too Long', 'The community name should not exceed 10 characters.');
      return;
    }
  


    // Block if image is inappropriate
    if (isImageInappropriate) {
      Alert.alert('Inappropriate Image', 'Please upload a different image.');
      return;
    }
    setIsLoading(true);
    let imageUrl = '';
    if (image) {
      imageUrl = await uploadImage(image);
    }

    try {
      const communityRef = await firestore()
        .collection('communities')
        .doc(category)
        .collection('communityList')
        .add({
          communityName,
          category,
          subdomain,
          description,
          imageUrl,
          createdBy: auth.currentUser.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      await communityRef.update({
        communityId: communityRef.id,
      });

      Alert.alert('Community created successfully');
      navigation.navigate(Community, { refresh: true });
    } catch (error) {
      console.error('Error creating community: ', error);
      Alert.alert('Error creating community');
    }finally {
      setIsLoading(false); // Stop loading
    }
  };


  // Define a function to render each category
const renderCategory = ({ item }) => {
  return (
    <TouchableOpacity onPress={() => setCategory(item.label)}>
      <View style={styles.categoryItem}>
        <Image source={item.icon} style={styles.categoryIcon} />
        <Text style={styles.categoryLabel}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );
};


  return (
    <View style={styles.container}>
       
       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require('../assets/arrow.png')} style={styles.backIcon} />
      </TouchableOpacity>
      <Text style={styles.title}>Create a Community</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>Pick an image</Text>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        {isImageInappropriate && <Text style={styles.warning}>Inappropriate content detected, please select another image.</Text>}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Community Name"
        value={communityName}
        onChangeText={setCommunityName}
        
      />
 <Text style={styles.heading}>Select a Category</Text>
<FlatList
        data={categories}
        keyExtractor={(item) => item.label}
        renderItem={renderCategory}
      />
      {category ? <Text style={styles.selectedText}>Selected: {category}</Text> : null}

      {category && (
        <Picker
          selectedValue={subdomain}
          style={styles.input}
          onValueChange={(itemValue) => setSubdomain(itemValue)}
        >
          <Picker.Item label="Select Subdomain" value="" />
          {subdomains[category].map((sub, index) => (
            <Picker.Item key={index} label={sub} value={sub} />
          ))}
        </Picker>
      )}

      <TextInput
        style={styles. descriptionInput}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
      />

<TouchableOpacity
        style={[styles.createButton, isLoading && styles.disabledButton]}
        onPress={createCommunity}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Create</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e1e2f', // Darker background for contrast
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#00FFFF', // Gold color for the title
    marginBottom: 25,
    textAlign: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor:"cyan"

  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 16,
  },
  warning: {
    color: 'red',
  },

  descriptionInput: {
    height: 100, // Set the height to make it bigger
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    textAlignVertical: 'top', // Ensures text starts at the top of the box
  },
  input: {
    borderWidth: 1,
    borderColor: '#2c3e50', // Darker border color
    backgroundColor: '#2c2c3e', // Dark background for inputs
    color: '#f1f1f1', // Light text color
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#888', // Grey color for disabled state
  },
  categoryIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
    tintColor:"cyan"
  },
  categoryLabel: {
    fontSize: 16,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#2c3e50', // Dark background for image picker
    padding: 12,
    borderRadius: 10,
  },
  imagePickerText: {
    color: '#f9d342', // Gold text for image picker
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    marginTop: 15,
    borderRadius: 10,
    borderColor: '#f9d342', // Gold border for the image preview
    borderWidth: 2,
  },
  createButton: {
    backgroundColor: "rgba(0, 255, 255, 0.3)", // Red background for the create button
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff', // White text for the create button
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Communityadd;
