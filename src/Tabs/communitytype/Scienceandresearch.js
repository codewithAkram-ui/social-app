import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

const  Scienceandresearch= () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const user = auth().currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const snapshot = await firestore()
          .collection('communities')
          .doc('Science and Research')
          .collection('communityList')
          .get();

        const communitiesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCommunities(communitiesList);

        // Fetch user's joined communities
        const userSnapshot = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();

        if (userSnapshot.exists) {
          setJoinedCommunities(userSnapshot.data().joinedCommunities || []);
        }
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoinCommunity = async (community) => {
    if (joinedCommunities.find(jc => jc.id === community.id)) {
      alert('You have already joined this community!');
      return;
    }
  
    try {
      // Add community to 'joined' collection in Firestore
      await firestore().collection('joined').add({
        userId: user.uid,
        communityId: community.id,
        communityName: community.communityName,
        imageUrl: community.imageUrl,
      });
  
      alert('You have successfully joined the community!');
  
      const communityRef = firestore().collection('communityJoinedCount').doc(community.id);
  
      // Increment the joinedCount field and update the joinedUsers array
      await communityRef.set(
        {
          communityId: community.id,
          communityName: community.communityName,
          imageUrl: community.imageUrl,
          joinedUsers: firestore.FieldValue.arrayUnion(user.uid),
          joinedCount: firestore.FieldValue.increment(1),  // Increment the joined count
        },
        { merge: true } // Use merge to avoid overwriting the whole document
      );
  
      // Update user's joined communities in the 'users' collection
      await firestore().collection('users').doc(user.uid).update({
        joinedCommunities: firestore.FieldValue.arrayUnion({
          id: community.id,
          communityName: community.communityName,
          imageUrl: community.imageUrl,
        }),
      });
  
      // Update local state
      setJoinedCommunities(prev => [...prev, community]);
    } catch (error) {
      console.error('Error joining community:', error);
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
    <ScrollView style={styles.container}>
       <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Science & Research</Text>
      </View>
      <View style={styles.communitiesContainer}>
        {communities.length > 0 ? (
          communities.map((community) => (
            <View key={community.id} style={styles.communityItem}>
              <TouchableOpacity
                onPress={() => navigation.navigate('CommunityDetails', {
                  communityId: community.id,
                  createdBy: community.createdBy,
                  communityName: community.communityName,
                  imageUrl: community.imageUrl
                })}
              >
                {community.imageUrl ? (
                  <Image source={{ uri: community.imageUrl }} style={styles.communityImage} />
                ) : (
                  <Image source={require('../../assets/placeholder.png')} style={styles.communityImage} />
                )}
                <Text style={styles.communityTitle}>{community.communityName}</Text>
                <Text style={styles.communityTitle1}>"{community.subdomain}"</Text>
              </TouchableOpacity>
              {!joinedCommunities.find(jc => jc.id === community.id) && (
              <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinCommunity(community)}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text>No communities created yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12, // Reduced padding for compact look
    backgroundColor: '#000', // Black background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  headerContainer: {
    backgroundColor: '#111111',
    paddingVertical: 8,
    marginBottom: 16,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row', // Set the direction to row
    alignItems: 'center', // Vertically center the items
    justifyContent: 'space-between', // Place items at both ends
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'cyan',
    textAlign: 'center',
    textTransform: 'uppercase',
    flex: 1, // Ensure the title takes the available space
     
  },
  backIcon: {
    width: 30,
    height: 30,
    tintColor:"white"
  },
  communitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  communityItem: {
    width: '48%', // Two communities in a row
    marginBottom: 16, // Reduced margin
    alignItems: 'center',
    backgroundColor: '#111', // Dark background for community items
    borderRadius: 12, // Rounded corners for a modern look
    padding: 10, // Less padding for compactness
    shadowColor: '#00ffff', // Cyan shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#00ffff', // Cyan border
  },
  communityImage: {
    width: 130, // Smaller square-shaped image
    height: 110,
    borderRadius: 10, // Rounded square
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#00ffff', // Cyan border
    backgroundColor: '#000', // Black background for image area
  },
  communityTitle: {
    textAlign: 'center',
    fontSize: 16, // Slightly smaller text
    fontWeight: 'bold',
    color: '#fff', // White text for contrast
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  communityTitle1: {
    textAlign: 'center',
    fontSize: 20, // Slightly smaller text
    fontWeight: 'bold',
    color: '#fff', // White text for contrast
    marginBottom: 6,
    textTransform: 'capitalize',
    textShadowColor: 'cyan', // Cyan glow color
    textShadowOffset: { width: 0, height: 0 }, // Centered shadow
    textShadowRadius: 10, // Increase radius for a stronger glow effect
  },
  
  communitySubdomain: {
    textAlign: 'center',
    fontSize: 14, // Smaller font for subdomain
    color: '#aaa', // Lighter color for subdomain text
    fontStyle: 'italic',
    marginBottom: 6,
  },
  joinButton: {
    backgroundColor: 'red', // Cyan color
    paddingVertical: 5, // Adjusted padding for a balanced look
    paddingHorizontal: 20,
    borderRadius: 25, // Round button
    marginTop: 12,
    shadowColor: '#00ffff', // Shadow with a cyan glow
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 6, // Elevation for Android shadow
    borderWidth: 2, // Border for extra highlight
    borderColor: '#000', // Black border for contrast
  },
  joinButtonText: {
    color: '#000', // Black text for high contrast
    fontWeight: 'bold',
    fontSize: 16, // Larger text size for emphasis
    textAlign: 'center',
    letterSpacing: 1.3,
    textTransform: 'uppercase', // Uppercase text for a bold look
  },


});



export default  Scienceandresearch;
