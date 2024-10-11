import { useRoute } from '@react-navigation/native';
import React, { useState, useEffect,useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert,Modal ,Linking} from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import Moreoptions from "../../assets/more.png"
import storage from '@react-native-firebase/storage';
const CommunityDetails = ({ route,navigation}) => {
  const { communityId, createdBy, communityName, imageUrl } = route?.params || {};
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [joinedUsersCount, setJoinedUsersCount] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState(null);
  const scrollViewRef = useRef();
  const auth = getAuth();
  const userUID = auth.currentUser?.uid;

  const uploadMediaToStorage = async (media) => {
    const { uri, fileName } = media;
    const storageRef = storage().ref(`media/${fileName}`);
    await storageRef.putFile(uri);
    return await storageRef.getDownloadURL();
  };

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true); // Start loading when fetching begins
      try {
        if (!communityId) {
          throw new Error("Invalid community ID");
        }
  
        // Fetch joined user count (this seems fine)
        const communityJoinedDoc = await firestore()
          .collection('communityJoinedCount')
          .doc(communityId)
          .get();
  
        if (communityJoinedDoc.exists) {
          const communityData = communityJoinedDoc.data();
          const joinedUsers = communityData.joinedUsers || [];
          setJoinedUsersCount(joinedUsers.length);
        }
  
        // Fetch historical messages first
        const messagesSnapshot = await firestore()
          .collection('communities')
          .doc(communityId)
          .collection('messages')
          .orderBy('createdAt', 'asc') // Ensure the messages are ordered by timestamp
          .get();
  
        const historicalMessages = messagesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Fallback to current date if missing
          };
        });
  
        setMessages(historicalMessages); // Set messages to the state
        setLoading(false); // Stop loading once historical messages are fetched
        scrollViewRef.current?.scrollToEnd({ animated: true });
        // Firestore listener for real-time message updates
        const unsubscribe = firestore()
          .collection('communities')
          .doc(communityId)
          .collection('messages')
          .orderBy('createdAt', 'asc')
          .onSnapshot(
            (querySnapshot) => {
              const newMessages = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                };
              });
  
              setMessages(newMessages);
  
              // Scroll to the bottom when new messages arrive
              scrollViewRef.current?.scrollToEnd({ animated: true });
            },
            (error) => {
              console.error('Firestore error fetching messages:', error);
              Alert.alert('Error', 'Failed to fetch real-time messages.');
            }
          );
  
        // Clean up the listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching community data:', error);
        setLoading(false);
        Alert.alert('Error', 'Something went wrong while loading the community data.');
      }
    };
  
    fetchCommunityData();
  }, [communityId]);

  
  
  
  // Send a new message
  const sendMessage = async () => {
    if (newMessage.trim() || selectedMedia) {
      try {
        let mediaUrl = null;
        if (selectedMedia) {
          mediaUrl = await uploadMediaToStorage(selectedMedia);
        }

        const messageRef = firestore()
          .collection('communities')
          .doc(communityId)
          .collection('messages')
          .doc(); // Generate a new message document reference.

        const newMessageData = {
          type: selectedMedia ? (selectedMedia.type.includes('video') ? 'video' : 'image') : 'text',
          content: mediaUrl || newMessage, // Media URL or text
          createdBy: userUID,
          createdAt: firestore.FieldValue.serverTimestamp(), // Server timestamp
          text: newMessage || '', // Text message if available
        };
        await messageRef.set(newMessageData);

        // Clear input after sending
        setNewMessage('');
        scrollViewRef.current?.scrollToEnd({ animated: true });
        setSelectedMedia(null); // Clear selected media
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  
  const deleteSelectedMessages = async () => {
    try {
      // Optimistically update the local state to remove deleted messages
      setMessages((prevMessages) =>
        prevMessages.filter((message) => !selectedMessages.includes(message.id))
      );
      setSelectedMessages([]); // Clear selected messages
      setSelectionMode(false); // Exit selection mode
  
      // Perform the Firestore deletion for each selected message
      const deletePromises = selectedMessages.map((messageId) =>
        firestore()
          .collection('communities')
          .doc(communityId)
          .collection('messages')
          .doc(messageId)
          .delete() // Delete the message document from Firestore
      );
  
      await Promise.all(deletePromises); // Ensure all deletions are completed
    } catch (error) {
      console.error('Error deleting selected messages:', error);
      Alert.alert('Error', 'Failed to delete messages.');
    }
  };
  
  

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages((prevSelectedMessages) => {
      if (prevSelectedMessages.includes(messageId)) {
        return prevSelectedMessages.filter((id) => id !== messageId);
      } else {
        return [...prevSelectedMessages, messageId];
      }
    });
  };

  const handleMediaPick = async () => {
    const result = await launchImageLibrary({ mediaType: 'mixed' });
    if (result?.assets?.length) {
      const media = result.assets[0];
      setSelectedMedia(media); // Set selected image or video
    }
  };

  const removeSelectedMedia = () => {
    setSelectedMedia(null); // Clear selected media
  };

  const openImageModal = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setModalVisible(true);
  };
  
  // Function to close modal
  const closeModal = () => {
    setModalVisible(false);
  };
  const renderTextWithLinks = (text) => {
    const urlRegex = /((http|https):\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Text
            key={index}
            style={{ color: '#00FFFF', textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      }
      return part;
    });
  };


  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };



  const handleExit = async () => {
    if (userUID === createdBy) {
      // Show an alert if the user is the creator of the community
      Alert.alert("Exit", "You cannot exit the community you created.");
      return; // Stop further execution
    }
    Alert.alert("Exit", "Are you sure you want to exit this community?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Exit",
        onPress: async () => {
          try {
            const batch = firestore().batch(); // Start a batch to update multiple documents
  
            // Step 1: Remove user from 'communityJoinedCount' collection
            const communityRef = firestore().collection('communityJoinedCount').doc(communityId);
            const communityDoc = await communityRef.get();
  
            if (communityDoc.exists) {
              const communityData = communityDoc.data();
              const updatedUsers = communityData.joinedUsers || []; // Initialize as empty array if undefined
              const filteredUsers = updatedUsers.filter(uid => uid !== userUID);
  
              // Update the communityRef with the filteredUsers
              batch.update(communityRef, { joinedUsers: filteredUsers });
            }
  
            const userRef = firestore().collection('users').doc(userUID);
            const userDoc = await userRef.get();
  
            if (userDoc.exists) {
              const userData = userDoc.data();
              const updatedCommunities = userData.joinedCommunities
                ? userData.joinedCommunities.filter((comm) => comm.id !== communityId)
                : []; // Filter out the community based on its ID
  
              // Update the user document with the updated list of joined communities
              batch.update(userRef, { joinedCommunities: updatedCommunities });
            }          
              // Step 3: Remove user from the 'joined' collection
              const joinedCollection = firestore().collection('joined');
              const joinedSnapshot = await joinedCollection.where('userId', '==', userUID).where('communityId', '==', communityId).get();
    
              joinedSnapshot.forEach(async (doc) => {
                batch.delete(doc.ref); // Delete the document if userId and communityId match
              });
    
              // Step 4: Commit the batch
              await batch.commit();
    
              // Show success message and close modal or navigate away
              Alert.alert("Success", "You have exited the community.");
              setPopupVisible(false);  // Close modal or perform navigation if needed
              navigation.goBack();     // Navigate back or do any other UI updates
            } catch (error) {
              console.error("Error exiting community: ", error);
              Alert.alert("Error", "There was an issue exiting the community. Please try again.");
            }
          }
        }
      ]);
    };

  

  // Share community action
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out the community: ${communityName}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
    setPopupVisible(false);
  };

  // Report action
  const handleReport = () => {
    // Show the report options modal
    setReportModalVisible(true);
  };
  const submitReport = () => {
    if (submitReport) {
      // Here you would normally send the report reason to your backend for processing
      Alert.alert("Report Submitted", `You have reported this community for: ${selectedReportReason}`);
      setReportModalVisible(false);
      setSelectedReportReason(null); // Reset the selection after submission
    } else {
      Alert.alert("Error", "Please select a reason to report.");
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
          <Modal visible={isModalVisible} transparent={true} onRequestClose={closeModal}>
      <View style={styles.modalContainer}>
        <Image source={{ uri: selectedImageUrl }} style={styles.fullScreenImage} />
        <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
          <Text style={styles.closeModalText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>


      <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={require('../../assets/arrow.png')} style={styles.backIcon} />
      </TouchableOpacity>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.communityImage} />
        )}
        <Text style={styles.communityName}>{communityName}</Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => navigation.navigate('JoinedUsers', { communityId })}
        >
          <Text style={styles.joinButtonText}>{joinedUsersCount} Joined</Text>
        </TouchableOpacity>
        <TouchableOpacity  onPress={togglePopup}>
    <Image source={Moreoptions} style={styles.moreOptionsIcon} />
  </TouchableOpacity>
      </View>
      <Modal
        visible={isReportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.modalTitle}>Report Community</Text>
            <TouchableOpacity
              style={styles.reportOption}
              onPress={submitReport}
            >
              <Text style={styles.reportOptionText}>Inappropriate Content</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportOption}
              onPress={submitReport}
            >
              <Text style={styles.reportOptionText}>Spam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportOption}
              onPress={submitReport}
            >
              <Text style={styles.reportOptionText}>misleading content</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setReportModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
           
          </View>
        </View>
      </Modal>

      <Modal
  visible={isPopupVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setPopupVisible(false)}
>
  <TouchableOpacity style={styles.modalOverlay} onPress={togglePopup}>
    <View style={styles.popupMenu}>
      <TouchableOpacity style={styles.popupMenuItem} onPress={handleExit}>
        <Text style={styles.popupMenuText}>Exit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.popupMenuItem} onPress={handleShare}>
        <Text style={styles.popupMenuText}>Share</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.popupMenuItem} onPress={handleReport}>
        <Text style={styles.popupMenuText}>Report</Text>
      </TouchableOpacity>
    
    </View>
  </TouchableOpacity>
</Modal>
<ScrollView
      contentContainerStyle={styles.messagesContainer}
      ref={scrollViewRef}
      onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
    >
      {messages.map((message, index) => (
        <TouchableOpacity
          key={index}
          onLongPress={() => {
            if (userUID === createdBy) {
              setSelectionMode(true);
              toggleMessageSelection(message.id);
            }
          }}
          onPress={() => {
            if (selectionMode && userUID === createdBy) {
              toggleMessageSelection(message.id);
            }
          }}
          style={[
            styles.messageContainer,
            selectedMessages.includes(message.id) && styles.selectedMessage,
          ]}
        >
            {message.type === 'deleted' ? (
            <Text style={styles.deletedMessageText}>This message was deleted</Text>
          ) : message.type === 'text' && message.text ? (
            <Text style={styles.messageText}>{renderTextWithLinks(message.text)}</Text>
          ) : message.type === 'image' ? (
            <TouchableOpacity style={styles.mediaAndText} onPress={() => openImageModal(message.content)}>
              <Image source={{ uri: message.content }} style={styles.media} />
              {message.text && <Text style={styles.messageTextBelowMedia}>{message.text}</Text>}
            </TouchableOpacity>
          ) : message.type === 'video' ? (
            <View style={styles.mediaAndText}>
              <Video source={{ uri: message.content }} style={styles.media} controls />
              {message.text && <Text style={styles.messageTextBelowMedia}>{message.text}</Text>}
            </View>
          ) : null}
        </TouchableOpacity>
      ))}
    </ScrollView>

  
      {selectionMode && userUID === createdBy && (
       <View style={styles.selectionBar}>
       <TouchableOpacity onPress={() => setSelectionMode(false)}>
         <Text style={styles.cancelButton}>Cancel</Text>
       </TouchableOpacity>
       <TouchableOpacity onPress={deleteSelectedMessages}>
         <Image source={require('../../assets/delete-document.png')} style={styles.deleteIcon} />
       </TouchableOpacity>
     </View>
   
      )}
  
      {selectedMedia && (
        <View style={styles.mediaPreviewContainer}>
          {selectedMedia.type.includes('image') ? (
            <Image source={{ uri: selectedMedia.uri }} style={styles.selectedMedia} />
          ) : (
            <Video source={{ uri: selectedMedia.uri }} style={styles.selectedMedia} controls />
          )}
           <TouchableOpacity onPress={removeSelectedMedia} style={styles.removeMediaButton}>
      <Image source={require('../../assets/cross.png')} style={styles.crossIcon} />
    </TouchableOpacity>
        </View>
      )}
  
      {userUID === createdBy && !selectionMode && (
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleMediaPick}>
            <Image source={require('../../assets/attach.png')} style={styles.icon} />
          </TouchableOpacity>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            style={styles.input}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Image source={require('../../assets/paper-plane.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}  


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor:"#00FFBB",
    marginRight:10

  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10, // Reduced padding for smaller header
    backgroundColor: "rgba(0, 255, 255, 0.5)",
    borderBottomWidth: 1,
    borderBottomColor: '#2C3E50',
  },

moreOptionsIcon: {
  width: 24,
  height: 24,
  marginLeft: 10,
  tintColor:"cyan"
},
  communityImage: {
    width: 50, // Smaller image
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderColor: '#00FFBB',
    borderWidth: 2,
  },
  communityName: {
    color: '#E0E0E0',
    fontSize: 18, // Smaller font size
    fontWeight: 'bold',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  closeModalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  closeModalText: {
    color: '#000',
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',  // Transparent white background
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.3)',  // Light border
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,  // Android shadow effect
    backdropFilter: 'blur(10px)',  // Glass/frosted effect
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 10, // Padding for full-width effect with margin
    paddingVertical: 5,
    backgroundColor: "rgba(0, 255, 255, 0.2)",
  },
  deletedMessageText: {
    color: '#888', // A muted color for deleted messages
    fontStyle: 'italic',
  },
  messageContainer: {
    flexDirection: 'column',
    padding: 15,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1F2A36',
    marginHorizontal: 10, // Ensures small margin on left and right
    alignSelf: 'stretch', // Full width of the container
  },
  messageText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  selectedMessage: {
    backgroundColor: "rgba(0, 255, 255, 0.2)", // Blue background for selected messages
    borderColor: '#00FFFF', // Optional: Add a border color for better visibility
    borderWidth: 2, // Optional: Make the border more visible
  },
  media: {
    width: '100%', // Full width media
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  messageTextBelowMedia: {
    color: '#E0E0E0',
    fontSize: 16,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#2C3E50',
    backgroundColor: '#1F2A36',
  },
  input: {
    flex: 1,
    backgroundColor: '#2C3E50',
    color: '#E0E0E0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginHorizontal: 10,
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  selectedMedia: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  removeMediaButton: {
    marginLeft: 15,
   
    borderRadius: 10,
    padding: 8,
  },
  removeMediaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectionBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 999, // Ensure it appears on top of other elements
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cancelButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: '#ff4d4d', // Red color for the delete icon
  },
  crossIcon: {
    width: 20,
    height: 20,
    tintColor: '#ff4d4d', // Optional: Adjust color as needed
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupMenu: {
    position: 'absolute', // Make the popup absolute
    top: 60, // Adjust the top to place it below the three dots
    right: 5, // Align it horizontally to the right side of the screen
    backgroundColor: '#2C3E50', // Grey background color
    borderRadius: 10,
    padding: 10,
    zIndex: 1000, // Ensure the popup stays on top
  },
  popupMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  popupMenuText: {
    fontSize: 16,
    color: '#fff', // Ensure text contrasts with grey background
  },
  reportModal: {
    backgroundColor: '#2C3E50',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  reportOption: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  reportOptionText: { fontSize: 16 },
  cancelButton: { padding: 10, marginTop: 10 },
  cancelButtonText: { textAlign: 'center', color: '#FF0000' },
 
});


export default CommunityDetails;
