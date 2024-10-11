import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, Button, Modal } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const FriendsListScreen = ({ navigation }) => {
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const fetchFriendsList = async () => {
      try {
        const snapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('friends')
          .get();

        const friends = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriendsList(friends);
      } catch (error) {
        console.error('Error fetching friends list:', error);
      }
    };

    const fetchFriendRequests = async () => {
      try {
        const requestsSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('friendRequests')
          .get();

        const requests = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFriendRequests(requests);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
        Alert.alert('Error', 'Unable to fetch friend requests. Please try again later.');
      }
    };

    fetchFriendsList();
    fetchFriendRequests();
  }, []);

  const handleAcceptFriendRequest = async (requesterId, requesterName, requesterPhotoURL) => {
    try {
      // Add friend to current user's friends list
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('friends')
        .doc(requesterId)
        .set({
          name: requesterName,
          photoURL: requesterPhotoURL,
          addedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Add current user to requester's friends list
      await firestore()
        .collection('users')
        .doc(requesterId)
        .collection('friends')
        .doc(currentUser.uid)
        .set({
          name: currentUser.displayName,  // Assuming displayName is available
          photoURL: currentUser.photoURL,  // Assuming photoURL is available
          addedAt: firestore.FieldValue.serverTimestamp(),
        });

      // Remove friend request
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('friendRequests')
        .doc(requesterId)
        .delete();

      setFriendRequests(prevRequests => prevRequests.filter(request => request.id !== requesterId));
      Alert.alert('Friend Added', 'You have accepted the friend request.');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Unable to accept friend request. Please try again later.');
    }
  };

  const handleRejectFriendRequest = async (requesterId) => {
    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('friendRequests')
        .doc(requesterId)
        .delete();

      setFriendRequests(prevRequests => prevRequests.filter(request => request.id !== requesterId));
      Alert.alert('Request Rejected', 'You have rejected the friend request.');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Unable to reject friend request. Please try again later.');
    }
  };

  const handleFriendPress = (friend) => {
    navigation.navigate('ChatScreen', {
      friendId: friend.id,
      friendName: friend.name,
      friendPhotoURL: friend.photoURL,
    });
  };

  const handleMenuPress = (friend) => {
    if (selectedFriend?.id === friend.id && popupVisible) {
      setPopupVisible(false);
      setSelectedFriend(null);
    } else {
      setSelectedFriend(friend);
      setPopupVisible(true);
    }
  };
  

  const handleDeleteFriend = async () => {
    try {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('friends')
        .doc(selectedFriend.id)
        .delete();

      setFriendsList(prevFriends => prevFriends.filter(friend => friend.id !== selectedFriend.id));
      setPopupVisible(false);
      Alert.alert('Friend Deleted', 'You have deleted the friend.');
    } catch (error) {
      console.error('Error deleting friend:', error);
      Alert.alert('Error', 'Unable to delete friend. Please try again later.');
    }
  };

  const handleReportUser = () => {
    setPopupVisible(false);
    Alert.alert('User Reported', 'You have reported the user.');
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendContainer}>
      <TouchableOpacity onPress={() => handleFriendPress(item)} style={styles.friendInfo}>
        <Image source={{ uri: item.photoURL }} style={styles.friendImage} />
        <Text style={styles.friendText}>{item.name}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleMenuPress(item)} style={styles.menuIcon}>
        <Image source={require('../assets/more.png')} style={styles.menuImage} />
      </TouchableOpacity>
      {popupVisible && selectedFriend?.id === item.id && (
        <View style={styles.popupMenu}>
          <TouchableOpacity onPress={handleDeleteFriend} style={styles.popupMenuItem}>
            <Text style={styles.popupMenuText}>Delete Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReportUser} style={styles.popupMenuItem}>
            <Text style={styles.popupMenuText}>Report User</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Image source={{ uri: item.senderPhotoURL }} style={styles.profileImage} />
      <View style={styles.textContainer}>
        <Text style={styles.requestText}>
          {item.senderName} sent you a friend request.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Accept"
            onPress={() => handleAcceptFriendRequest(item.id, item.senderName, item.senderPhotoURL)}
            color="green"
          />
          <Button
            title="Reject"
            onPress={() => handleRejectFriendRequest(item.id)}
            color="red"
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Image source={require('../assets/arrow.png')} style={styles.backImage} />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {activeTab === 'friends' ? 'Friends List' : 'Friend Requests'}
        </Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={styles.tabText}>Friends List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={styles.tabText}>Friend Requests</Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'friends' ? (
      <>
        <FlatList
          data={friendsList}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          ListEmptyComponent={<Text style={styles.emptyText}>You have no friends yet.</Text>}
        />
      </>
    ) : (
      <>
        <FlatList
          data={friendRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No friend requests.</Text>}
        />
      </>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0A0A0A', // Darker background for contrast
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    padding: 10,
  },
  backImage: {
    width: 24,
    height: 24,
    tintColor:"white"
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginLeft: 10,
  },
  activeTab: {
    borderBottomColor: '#00FFFF', // Cyan color for active tab
  },
  tabText: {
    fontSize: 18,
    color: '#00FFFF', // Cyan color for tab text
  },
  heading: {
    fontSize: 24, // Slightly larger font size
    fontWeight: 'bold',
    color: '#00FFFF', // Cyan color for heading
    marginVertical: 15,
    textAlign: 'center',
  },
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1A1A1A', // Darker background for friend container
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00FFFF', // Cyan border color
    position: 'relative', // Required for absolute positioning of popup
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuIcon: {
    padding: 10,
  },
  menuImage: {
    width: 24,
    height: 24,
    tintColor:"white"
  },
  popupMenu: {
    position: 'absolute',
    top: 0,
     
    right: 50,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00FFFF',
    zIndex: 1,
    width: 150, // Ensure the popup has enough width
  },
  popupMenuItem: {
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#00FFFF',
  },
  popupMenuText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A', // Darker background for request item
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00FFFF', // Cyan border color
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  requestText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default FriendsListScreen;