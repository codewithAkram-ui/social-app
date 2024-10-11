import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, Alert, Modal, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import storage from '@react-native-firebase/storage';
// Import icons
import clipIcon from '../assets/attach.png';
import sendIcon from '../assets/paper-plane.png';
import backIcon from '../assets/arrow.png'; // Import the back arrow icon
import deleteIcon from '../assets/delete.png'; // Import the delete icon

const ChatScreen = ({ route, navigation }) => {
  const { friendId, friendName, friendPhotoURL } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]); // State for selected messages
  const currentUser = auth().currentUser;
  const chatDocId = currentUser.uid < friendId ? `${currentUser.uid}-${friendId}` : `${friendId}-${currentUser.uid}`;
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchChatMessages = async () => {
      try {
        const messagesSnapshot = await firestore()
          .collection('chats')
          .doc(chatDocId)
          .collection('messages')
          .orderBy('createdAt', 'asc')
          .get();

        const historicalMessages = messagesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id, // Use Firestore document ID
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          };
        });

        setMessages(historicalMessages);
        setLoading(false);

        const unsubscribe = firestore()
          .collection('chats')
          .doc(chatDocId)
          .collection('messages')
          .orderBy('createdAt', 'asc')
          .onSnapshot(snapshot => {
            const newMessages = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id, // Use Firestore document ID
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
              };
            });

            setMessages(prevMessages => {
              const mergedMessages = [...prevMessages];
              newMessages.forEach(newMsg => {
                if (!mergedMessages.some(msg => msg.id === newMsg.id)) {
                  mergedMessages.push(newMsg);
                }
              });
              return mergedMessages;
            });
          });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        setLoading(false);
      }
    };

    fetchChatMessages();
  }, [chatDocId]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

// ... existing code ...
const handleSendMessage = async (media = null, mediaType = '') => {
  if (newMessage.trim() || media) {
    try {
      const newMessageData = {
        text: newMessage,
        media,
        mediaType,
        createdAt: new Date(),
        senderId: currentUser.uid,
        receiverId: friendId,
      };

      setNewMessage('');

      await firestore()
        .collection('chats')
        .doc(chatDocId)
        .collection('messages')
        .add({
          ...newMessageData,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
};

// ... existing code ...
const selectMedia = async () => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'mixed', // Allows both images and videos
      videoQuality: 'low',
    });

    if (!result.didCancel) {
      const { type, uri, duration } = result.assets[0];

      if (type.includes('video') && duration > 60) {
        Alert.alert('Error', 'You can only send videos up to 1 minute.');
      } else {
        const downloadURL = await uploadMediaToStorage(uri, type);
        handleSendMessage(downloadURL, type.includes('image') ? 'image' : 'video');
      }
    }
  } catch (error) {
    console.error('Error selecting media:', error);
  }
};

  const handleImageClick = (uri) => {
    setSelectedImage(uri); // Set the image to display in full screen
  };

  const closeImageModal = () => {
    setSelectedImage(null); // Close the modal
  };

  const uploadMediaToStorage = async (uri, mediaType) => {
    const fileName = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = storage().ref(`chat_media/${chatDocId}/${fileName}`);
    await storageRef.putFile(uri);
    return await storageRef.getDownloadURL();
  };
  const handleLongPress = (messageId) => {
    setSelectedMessages(prevSelected => {
      if (prevSelected.includes(messageId)) {
        return prevSelected.filter(id => id !== messageId);
      } else {
        return [...prevSelected, messageId];
      }
    });
  };

  const handlePress = (messageId) => {
    if (selectedMessages.length > 0) {
      handleLongPress(messageId);
    }
  };

  const handleDeleteMessages = async () => {
    try {
      const batch = firestore().batch();
      selectedMessages.forEach(messageId => {
        const messageRef = firestore()
          .collection('chats')
          .doc(chatDocId)
          .collection('messages')
          .doc(messageId);
        console.log('Deleting message with ID:', messageId); // Debugging log
        batch.delete(messageRef);
      });
      await batch.commit();
      setMessages(prevMessages => prevMessages.filter(msg => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
      console.log('Messages deleted successfully');
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
      
        <Image source={{ uri: friendPhotoURL }} style={styles.profileImage} />
        <Text style={styles.friendName}>{friendName}</Text>
        {selectedMessages.length > 0 && (
          <TouchableOpacity onPress={handleDeleteMessages} style={styles.deleteButton}>
            <Image source={deleteIcon} style={styles.deleteIcon} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleLongPress(item.id)}
            onPress={() => handlePress(item.id)}
            style={[
              styles.messageContainer,
              item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage,
              selectedMessages.includes(item.id) && styles.selectedMessage,
            ]}
          >
            {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
            {item.media && item.mediaType === 'image' && (
              <TouchableOpacity onPress={() => handleImageClick(item.media)}>
                <Image source={{ uri: item.media }} style={styles.media} />
              </TouchableOpacity>
            )}
            {item.media && item.mediaType === 'video' && (
              <Video
                source={{ uri: item.media }}
                style={styles.media}
                controls
              />
            )}
            <Text style={styles.timestamp}>{item.createdAt.toLocaleTimeString()}</Text>
          </TouchableOpacity>
        )}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          style={styles.input}
        />
        <TouchableOpacity onPress={selectMedia} style={styles.iconButton}>
          <Image source={clipIcon} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSendMessage()} style={styles.iconButton}>
          <Image source={sendIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Modal for displaying image in full screen */}
      {selectedImage && (
        <Modal visible={true} transparent={true} onRequestClose={closeImageModal}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalClose} onPress={closeImageModal}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Dark background
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00FFFF', // Cyan color
  },
  backButton: {
    marginRight: 8,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#00FFFF', // Cyan color
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteIcon: {
    width: 20,
    height: 20,
    tintColor: '#FF0000', // Red color for delete icon
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  friendName: {
    fontSize: 16,
    color: '#00FFFF', // Cyan color
    fontWeight: 'bold',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 3,
  },
  myMessage: {
    backgroundColor: '#00796B',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: '#37474F',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  selectedMessage: {
    backgroundColor: '#4FC3F7', // Light blue color for selected message
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  timestamp: {
    color: '#B0BEC5',
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#263238',
    borderRadius: 20,
    marginTop: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 8,
    fontSize: 14,
  },
  iconButton: {
    marginLeft: 8,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#00FFFF', // Cyan color
  },
  media: {
    width: 180,
    height: 180,
    marginVertical: 4,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 30,
    right: 16,
    zIndex: 1,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default ChatScreen;