import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const JoinedUsers = ({ route }) => {
  const { communityId } = route.params;
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJoinedUsers = async () => {
      setLoading(true);
      try {
        const communityDoc = await firestore()
          .collection('communityJoinedCount')
          .doc(communityId)
          .get();

        if (communityDoc.exists) {
          const { joinedUsers: userIds } = communityDoc.data();
          const userPromises = userIds.map(async (userId) => {
            const userDoc = await firestore()
              .collection('users') // Assuming you store user profiles in the 'users' collection
              .doc(userId)
              .get();

            return userDoc.exists
              ? { 
                  uid: userId, 
                  name: userDoc.data().displayName, 
                  photoURL: userDoc.data().photoURL || null // Fetch the profile photo URL
                }
              : { uid: userId, name: 'Unknown User', photoURL: null };
          });

          const users = await Promise.all(userPromises);
          setJoinedUsers(users);
        }
      } catch (error) {
        console.error('Error fetching joined users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedUsers();
  }, [communityId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Joined Users</Text>
      <FlatList
        data={joinedUsers}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Image
              source={item.photoURL ? { uri: item.photoURL } : require('../../assets/b.png')} // Provide a default image if no photoURL exists
              style={styles.userImage}
            />
            <Text style={styles.userText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userText: {
    color: '#FFA500',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default JoinedUsers;
