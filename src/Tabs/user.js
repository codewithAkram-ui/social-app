import React,{useState,useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert,Image,FlatList, RefreshControl,ScrollView} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation,useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import EditProfile from '../pages/editprofile';
import Yourpost from '../pages/user/yourpost';
import Settings from '../pages/user/settings';
import Channels from '../pages/user/channels';
import Help from '../pages/user/help';
import Video from 'react-native-video';  

import FollowingScreen from './community/folllowingscreen';
import FollowersScreen from './community/followerscreen';
import Placeholderimage from "../assets/appplaceholder1.png"

const User = () => {
const navigation=useNavigation()
const route = useRoute();
const [communities, setCommunities] = useState([]);
const [user, setUser] = useState(null);
const [followerCount, setFollowerCount] = useState(0);
const [followingCount, setFollowingCount] = useState(0);
const [posts, setPosts] = useState([]);
const [refreshing, setRefreshing] = useState(false);



useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  const currentUser = auth().currentUser;
  if (currentUser) {
    // Fetch user data, followers, following, posts, and communities

    const userRef = firestore().collection('users').doc(currentUser.uid);
    const doc = await userRef.get();
    if (doc.exists) {
      setUser(doc.data());
    }

    const followersRef = firestore().collection('users').doc(currentUser.uid).collection('followers');
    const followersSnapshot = await followersRef.get();
    setFollowerCount(followersSnapshot.size);

    const followingRef = firestore().collection('users').doc(currentUser.uid).collection('following');
    const followingSnapshot = await followingRef.get();
    setFollowingCount(followingSnapshot.size);

  
    try {
      console.log('Fetching posts for user:', currentUser.uid);
      const categories = [
        'Technology and IT', 'Creative and Arts', 'Business and Management', 
        'Communication and Media', 'Education and Training', 'Science and Research', 
        'Healthcare and Wellness', 'Legal and Regulatory', 'Social Science and Humanities',
        'Sports and Physical Activity', 'Crafts and Trades', 'Travel and Adventure', 
        'Religious and Spiritual',  'Home and Lifestyle'
      ];

      let postsData = [];
      for (const category of categories) {
        const categoryRef = firestore().collection('posts').doc(category).collection('posts');
        const postsSnapshot = await categoryRef.where('uid', '==', currentUser.uid).get();
        postsSnapshot.forEach(doc => {
          postsData.push({ id: doc.id, ...doc.data() });
        });
      }
      setPosts(postsData);
      console.log('Fetched posts:', postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }


    const categories = [
      'Technology and IT', 'Creative and Arts', 'Business and Management', 
      'Communication and Media', 'Education and Training', 'Science and Research', 
      'Healthcare and Wellness', 'Legal and Regulatory', 'Social Science and Humanities',
      'Sports and Physical Activity', 'Crafts and Trades', 'Travel and Adventure', 
      'Religious and Spiritual',  'Home and Lifestyle'
    ];

    let communityList = [];
    for (const category of categories) {
      const categoryRef = firestore().collection('communities').doc(category).collection('communityList');
      const communitySnapshot = await categoryRef.where('createdBy', '==', currentUser.uid).get();
      communitySnapshot.forEach(doc => {
        communityList.push(doc.data());
      });
    }
    setCommunities(communityList);
  }
};




 // ... existing code ...

const handleLogout = async () => {
  Alert.alert(
    'Confirm Logout',
    'Are you sure you want to logout?',
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Logout cancelled'),
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            // Check if user has a previous sign-in
            const hasPreviousSignIn = await GoogleSignin.hasPreviousSignIn();
            console.log('hasPreviousSignIn:', hasPreviousSignIn);

            if (hasPreviousSignIn) {
              try {
                // Sign out from Google
                await GoogleSignin.signOut();

                // Revoke access so that the user has to choose an account again
                await GoogleSignin.revokeAccess();
              } catch (error) {
                if (error.code === statusCodes.SIGN_IN_REQUIRED) {
                  console.log("User is not signed in to Google, skipping Google Sign-Out.");
                } else {
                  throw error; // Re-throw other errors
                }
              }
            }

            // Sign out from Firebase
            await auth().signOut();

            Alert.alert('Logged out', 'You have been logged out successfully.');
          } catch (error) {
            Alert.alert('Logout Error', error.message);
            console.error('GoogleSignin error:', error);
          }
        },
      },
    ],
    { cancelable: false }
  );
};

const handleHelpFeedback = () => {
  Alert.alert('Updating soon', 'This feature will be available soon.');
};



  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();  // Refetch all data
    setRefreshing(false);
  };

  const renderPostItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Postedit', { post: item })}>
    <View style={styles.communityItem1}> 
      {item.mediaType === 'video' ? (
        <Video
          source={{ uri: item.mediaUrl }}
          style={styles.communityImage}  
          resizeMode="cover"
          paused={true}  
          controls
        />
      ) : (
        <Image
        source={item.mediaUrl ? { uri: item.mediaUrl } : Placeholderimage}
        style={styles.communityImage}
      />
      
      )}
      
    </View></TouchableOpacity>
  );
  
  

  const renderCommunity = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('CommunityEdit', { community: item })}>
    <View style={styles.communityItem}>
      <Image  source={item.imageUrl ? { uri: item.imageUrl } : Placeholderimage}  style={styles.communityImage} />
      <Text style={styles.communityName}>{item.communityName}</Text>
    </View>
    </TouchableOpacity>
  );
  


  return (
    <ScrollView
    contentContainerStyle={styles.container}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }
  >
    <View style={styles.header}>
      
      <View style={styles.profileContainer}>
      <Image
  source={user?.photoURL ? { uri: user.photoURL } : Placeholderimage}
  style={styles.profileImage}
/>

        <View style={styles.userInfo}>
          <Text style={styles.profileName}>{user?.displayName || 'Ski.io'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Ski.io@gmail.com'}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate(EditProfile)}>
  <View style={styles.editButtonContent}>
    <Image
      source={require('../assets/user-pen.png')} // Adjust the path as per your folder structure
      style={styles.editIcon}
    />
    <Text style={styles.edit}>Edit profile</Text>
  </View>
</TouchableOpacity>

        </View>
      </View>
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate(Settings)}>
        <Text style={styles.settingsIcon}>⚙</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.followerFollowingContainer}>
        <TouchableOpacity
          style={styles.followerBox}
          onPress={() => navigation.navigate(FollowersScreen)}
        >
          <Text style={styles.followerCount}>{followerCount}</Text>
          <Text style={styles.followerLabel}>Followers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.followingBox}
          onPress={() => navigation.navigate(FollowingScreen)}
        >
          <Text style={styles.followingCount}>{followingCount}</Text>
          <Text style={styles.followingLabel}>Following</Text>
        </TouchableOpacity>
      </View>
    <View style={styles.content}>
    <Text style={styles.sectionTitle1}>Your post</Text>
        <FlatList
          data={posts}
          horizontal={true}
          renderItem={renderPostItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
          ListEmptyComponent={() => (
            <View style={styles.placeholderContainer}>
              <Image source={Placeholderimage} style={styles.placeholderImage1} />
            </View>
          )}
     
        />



      <Text style={styles.sectionTitle}>Communities</Text>
      {communities.length > 0 ? (
 <FlatList
 data={communities}
 renderItem={renderCommunity}
 keyExtractor={item => item.communityId}
 numColumns={3}
 contentContainerStyle={styles.communitiesList}

/>
) : (
  <Image source={Placeholderimage} style={styles.placeholderImage} />
)}


    </View>

    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerButton} onPress={handleLogout}>
        <Text style={styles.footerText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton} onPress={handleHelpFeedback}>
        <Text style={styles.footerText}>Help & Feedback</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1B24',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  communitiesList: {
    paddingBottom: 20,
    justifyContent: 'space-between',
    
  },
  communityItem1: {
    marginHorizontal: 10,  // Horizontal margin to ensure spacing between items
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#00FFFF',
    borderWidth: 1,
    width: 100,
    height: 120,
  },
  communityItem: {
    flex: 1,
    margin: 8, // Reduced margin
    backgroundColor: '#333',
    
    borderRadius: 10,
    padding: 5, // Reduced padding
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#00FFFF',
    borderWidth: 1,
    width: 100, // Adjusted width to fit 3 items
    height: 120, // Adjusted height
  },
  communityImage: {
    width: 80, // Smaller image size to fit the smaller box
    height: 80, 
    borderRadius: 10,
    marginBottom: 5, // Reduced margin between image and text
  },
  communityName: {
    color: 'white',
    fontSize: 14, // Reduced font size
    textAlign: 'center',
  },
  postsList: {
    paddingBottom:100,  // Adds space below the posts list
  },



  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,  // Space above placeholder
  },
  placeholderImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
  placeholderImage1: {
    width: 150,
    height: 150,
     marginTop:100
  },
  

  profileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#FF6F61',
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  userInfo: {
    marginLeft: 15,
  },
  profileName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#CCC',
    fontSize: 14,
  },
  editButtonContent: {
    flexDirection: 'row', // Ensures the icon and text are side by side
    alignItems: 'center',
  },
  editIcon: {
    width: 18, // Adjust the size of the icon as needed
    height: 18,
    marginRight: 8, // Adds spacing between the icon and the text
  },
  editButton: {
    marginTop: 8,
    backgroundColor: '#00FFFF',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  edit: {
    color: '#1E1E1E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingsButton: {
    marginLeft: 10,
  },
  settingsIcon: {
    fontSize: 24,
    color: '#00FFFF',
  },
  followerFollowingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  followerBox: {
    backgroundColor: '#00FFFF',
    flex: 1,
    marginRight: 20,
    paddingVertical: 2, // Reduced from 20
    paddingHorizontal: 10, // Reduced from 20
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingBox: {
    backgroundColor: '#00FFFF',
    flex: 1,
    marginLeft: 10,
    paddingVertical: 2, // Reduced from 20
    paddingHorizontal: 10, // Reduced from 20
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followerCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },
  followerLabel: {
    fontSize: 16,
    color: '#1E1E1E',
  },
  followingCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },
  followingLabel: {
    fontSize: 16,
    color: '#1E1E1E',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    
    fontWeight: 'bold',
    marginBottom: 10,   // Space between title and content below
    marginTop: 30,  // Adjust the spacing between the title and content below
  
  },
  sectionTitle1: {
    color: 'white',
    fontSize: 20,
    
    fontWeight: 'bold',
    marginBottom: 10,   // Space between title and content below
     
  
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  gridItem: {
    width: 90,
    height: 90,
    backgroundColor: '#333',
    borderRadius: 10,
    borderColor: '#00FFFF',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  footerButton: {
    backgroundColor: '#00FFFF',
    paddingVertical: 10,
    paddingHorizontal:30,
    borderRadius: 20,
  },
  footerText: {
    color: '#1E1E1E',
    fontWeight: 'bold',
  },
});

export default User;