import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';

const CommunityEdit = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { community } = route.params;

  const [communityName, setCommunityName] = useState(community.communityName);
  const [description, setDescription] = useState(community.description);
  const [isPrivate, setIsPrivate] = useState(community.isPrivate);
  const [imageUrl, setImageUrl] = useState(community.imageUrl);
  const [newImage, setNewImage] = useState(null); // To store the new image data

  // Select and crop image from the gallery
  const selectAndCropImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true, // Enables cropping
    })
      .then((image) => {
        const selectedImage = {
          uri: image.path,
          fileName: image.filename || image.path.split('/').pop(),
        };
        setNewImage(selectedImage);
      })
      .catch((error) => {
        if (error.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', 'Failed to select an image.');
        }
      });
  };

  // Upload image to Firebase Storage
  const uploadImage = async () => {
    if (!newImage) return null;

    const filename = newImage.fileName;
    const storageRef = storage().ref(`communityImages/${filename}`);

    await storageRef.putFile(newImage.uri);

    // Get the URL of the uploaded image
    const uploadedImageUrl = await storageRef.getDownloadURL();
    return uploadedImageUrl;
  };

  // Handle save/update
  const handleUpdate = async () => {
    try {
      let updatedImageUrl = imageUrl;
  
      // If there is a new image, upload it and get the new URL
      if (newImage) {
        updatedImageUrl = await uploadImage();
      }
  
      // Ensure none of the fields are undefined before updating Firestore
      const communityRef = firestore()
        .collection('communities')
        .doc(community.category)
        .collection('communityList')
        .doc(community.communityId);
  
      const updatedData = {
        communityName: communityName || community.communityName,  // Default to existing value if undefined
        description: description || community.description,
        isPrivate: typeof isPrivate === 'boolean' ? isPrivate : community.isPrivate, // Ensure it's a boolean
      };
  
      // Only add imageUrl if it's defined
      if (updatedImageUrl) {
        updatedData.imageUrl = updatedImageUrl;
      }
  
      await communityRef.update(updatedData);
  
      Alert.alert('Success', 'Community updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update community');
      console.error('Error updating community:', error);
    }
  };

  // Handle delete community
const handleDelete = async () => {
  Alert.alert(
    'Delete Community',
    'Are you sure you want to delete this community? This action cannot be undone.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            // Delete community image from Firebase Storage
            if (imageUrl) {
              const storageRef = storage().refFromURL(imageUrl);
              await storageRef.delete();
            }

            // Delete the community document from Firestore
            const communityRef = firestore()
              .collection('communities')
              .doc(community.category)
              .collection('communityList')
              .doc(community.communityId);
              
            await communityRef.delete();

            Alert.alert('Success', 'Community deleted successfully');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete community');
            console.error('Error deleting community:', error);
          }
        },
      },
    ],
    { cancelable: false }
  );
};

  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={selectAndCropImage}>
        <Image
          source={{ uri: newImage ? newImage.uri : imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
        <Text style={styles.imageText}>Tap to change image</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Community Name:</Text>
      <TextInput
        style={styles.input}
        value={communityName}
        onChangeText={(text) => {
            if (text.length <= 10) {
              setCommunityName(text);
            } else {
              Alert.alert('Error', 'Community name cannot exceed 10 characters');
            }
          }}
        placeholder="Enter Community Name"
      />

      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter Description"
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Private Community:</Text>
        <TouchableOpacity onPress={() => setIsPrivate(!isPrivate)}>
          <Text style={styles.switchText}>{isPrivate ? 'Yes' : 'No'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Update Community</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
  <Text style={styles.deleteButtonText}>Delete Community</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.deleteButton1} onPress={()=>navigation.goBack()}>
<Image source={require('../../assets/arrow-left-button.png')} style={[styles.backicon]}/>
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1F1B24',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageText: {
    color: '#00FFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#FFF',
    marginBottom: 8,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF4C4C',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  input: {
    borderBottomColor: '#FFF',
    borderBottomWidth: 1,
    marginBottom: 20,
    color: '#FFF',
    padding: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchText: {
    color: '#FFF',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#00FFFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#1E1E1E',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backicon:{
    width:54,
    height:54,
    
  },
  deleteButton1: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default CommunityEdit;
