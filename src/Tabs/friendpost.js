import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import Video from 'react-native-video';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import FriendsListScreen from './friendlist';
import Livepage from './livepage';
import { format } from 'date-fns';
import FastImage from 'react-native-fast-image';



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

const Friendpost = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [users, setUsers] = useState({});
  const [showReportOption, setShowReportOption] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigation = useNavigation();
  const user = auth().currentUser;

  useEffect(() => {
    fetchFollowingPosts();
  }, []);

// ... existing code ...

const fetchFollowingPosts = async () => {
  if (user) {
    try {
      const followingSnapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('following')
        .get();

      const followingUIDs = followingSnapshot.docs.map(doc => doc.id);

      if (followingUIDs.length > 0) {
        let allPosts = [];
        for (const category of categories) {
          const postsSnapshot = await firestore()
            .collection('posts')
            .doc(category)
            .collection('posts')
            .where('uid', 'in', followingUIDs)
            .orderBy('createdAt', 'desc')
            .get();

          const postsData = postsSnapshot.docs.map(doc => ({ postID: doc.id, category, ...doc.data() }));
          allPosts = [...allPosts, ...postsData];
        }

        allPosts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        setPosts(allPosts);

        const userPromises = allPosts.map(post => firestore().collection('users').doc(post.uid).get());
        const userSnapshots = await Promise.all(userPromises);

        const userMap = userSnapshots.reduce((acc, doc) => {
          if (doc.exists) {
            acc[doc.id] = doc.data();
          }
          return acc;
        }, {});
        setUsers(userMap);
      } else {
        setPosts([]); // No following users
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  }
};

const handleLike = async (postID, category) => {
  try {
    const postRef = firestore()
      .collection('posts')
      .doc(category)
      .collection('posts')
      .doc(postID);

    const postDoc = await postRef.get();

    if (postDoc.exists) {
      const postData = postDoc.data();
      const likes = postData.likes || [];

      if (likes.includes(user.uid)) {
        await postRef.update({
          likes: firestore.FieldValue.arrayRemove(user.uid),
          likesCount: firestore.FieldValue.increment(-1),
        });
        setLikedPosts(prev => {
          const updated = new Set(prev);
          updated.delete(postID);
          return updated;
        });
      } else {
        await postRef.update({
          likes: firestore.FieldValue.arrayUnion(user.uid),
          likesCount: firestore.FieldValue.increment(1),
        });
        setLikedPosts(prev => new Set(prev).add(postID));
      }

      setPosts(prevPosts => prevPosts.map(post =>
        post.postID === postID ? { ...post, likesCount: (postData.likesCount || 0) + (likes.includes(user.uid) ? -1 : 1) } : post
      ));
    }
  } catch (error) {
    console.error('Error handling like:', error);
  }
};

const handleBookmark = (postID) => {
  setBookmarkedPosts(prev => {
    const updated = new Set(prev);
    if (updated.has(postID)) {
      updated.delete(postID);
    } else {
      updated.add(postID);
    }
    return updated;
  });
};

const toggleReportOption = (postId) => {
  setShowReportOption((prev) => (prev === postId ? null : postId));
};

const handleReport = () => {
  Alert.alert('Report', `Report has been submitted`);
  setShowReportOption(null);
};

const renderPost = ({ item: post }) => {
  const userProfile = users[post.uid] || {};
  const hasLiked = likedPosts.has(post.postID);
  const hasBookmarked = bookmarkedPosts.has(post.postID);
  const showReport = showReportOption === post.postID; // Updated to use post.postID

  return (
    <View style={styles.postContainer}>
      <TouchableOpacity style={styles.postHeader} >
        <Image
          source={{ uri: userProfile.photoURL || 'https://via.placeholder.com/50' }}
          style={styles.userProfileImage}
        />
        <Text style={styles.userName}>{userProfile.displayName || 'Anonymous'}</Text>
      </TouchableOpacity>
      <View style={styles.threeDotContainer}>
        {showReport && (
          <TouchableOpacity style={styles.reportOption} onPress={() => handleReport(post.postID)}>
            <Image
              source={require('../assets/report-flag.png')} // Replace with your report icon path
              style={styles.reportIcon}
            />
            <Text style={styles.reportText}>Report</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.threeDotIcon} onPress={() => toggleReportOption(post.postID)}>
          <Image
            source={require('../assets/more.png')} // Replace with your three-dot icon path
            style={styles.threeDotImage}
          />
        </TouchableOpacity>
      </View>

      {post.mediaType === 'video' ? (
        <Video
          source={{ uri: post.mediaUrl || 'https://via.placeholder.com/100' }}
          style={styles.media}
          resizeMode="cover"
          controls
        />
      ) : (
        <Image
          source={{ uri: post.mediaUrl || 'https://via.placeholder.com/100' }}
          style={styles.media}
        />
      )}

      <Text style={styles.postTitle}>{post.title || "Untitled Post"}</Text>
      <Text style={styles.postInfo}>
        {post.skillCategory || "General"} • {format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy')}
      </Text>

      <View style={styles.interactionContainer}>
        <TouchableOpacity onPress={() => handleLike(post.postID, post.category)} style={styles.iconButton}>
          <Image
            source={hasLiked ? require('../assets/like.png') : require('../assets/like.png')}
            style={[styles.icon, hasLiked && styles.cyanIcon]}
          />
          <Text style={styles.interactionText}>({post.likesCount || 0})</Text>
        </TouchableOpacity>
        <View style={styles.rightIconsContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('CommentsScreen', { postId: post.postID, category: post.category })} style={styles.iconButton}>
            <Image
              source={require('../assets/comment.png')}
              style={[styles.icon, styles.cyanIcon]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleBookmark(post.postID)} style={[styles.iconButton, styles.bookmarkButton]}>
            <Image
              source={require('../assets/bookmark.png')}
              style={[styles.icon, hasBookmarked && styles.cyanIcon]}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ... existing code ...

// ... existing code ...

return (
  <View style={styles.container}>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.leftButton} onPress={() => navigation.navigate(Livepage)}>
        <FastImage source={require("../assets/live12.gif")} style={styles.addIcon} resizeMode={FastImage.resizeMode.contain} />
      </TouchableOpacity>
      <Text style={styles.title}>Ski.io</Text>
      <TouchableOpacity style={styles.rightButton} onPress={() => navigation.navigate(FriendsListScreen)}>
        <Image source={require("../assets/comments.png")} style={styles.addIcon2} />
      </TouchableOpacity>
    </View>

    {loading ? ( // Show loading indicator while fetching data
      <Text style={styles.loadingText}>Loading...</Text>
    ) : posts.length === 0 ? ( // Show message if no followed users
      <Text style={styles.noFollowText}>You haven't followed any user</Text>
    ) : (
      <FlatList
        data={posts}
        keyExtractor={item => item.postID}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />
    )}
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000', // Black background
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute buttons to the left and right
    marginBottom: 20,
  },
  noFollowText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#00FFFF', // Cyan color for text
    fontSize: 18,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  cyanIcon: {
    tintColor: '#00FFFF', // Cyan color for the icons
  },
  threeDotContainer: {
    position: 'absolute',
    right: 0, // Position the three-dot icon to the right side
  },
  threeDotIcon: {
    padding: 10, // Adjust padding as needed
  },
  threeDotImage: {
    width: 20, // Set the width of the three-dot icon
    height: 20,
    tintColor:"white" 
  },
  reportOption: {
    position: 'absolute',
    bottom:10,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Background color for the report option
    padding: 0,

  
   
    elevation: 5,
  },
  reportIcon: {
    width: 20, // Set the width of the report icon
    height: 20, // Set the height of the report icon
    marginRight: 5,
    tintColor:"red" // Space between icon and text
  },
  reportText: {
    color: '#FFF',
    right:8,
    bottom:1
      },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    marginLeft: 10, // Add space between comment and bookmark icons
  },
  leftButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  rightButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    width: 60,
    height: 50,
    
  },
  addIcon2: {
    width: 30,
    height: 30,
    
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00FFFF', // Cyan color for text
    textAlign: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
   
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#00FFFF', // Cyan border
    borderWidth: 2,
  },
  postContainer: {
    backgroundColor: '#1A1A1A', // Darker background for posts
    padding: 15,
    marginBottom: 20,
    borderRadius: 12,
    borderColor: '#00FFFF', // Cyan border
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderColor: '#00FFFF', // Cyan border
    borderWidth: 1,
  },
  userName: {
    fontSize: 16,
    color: '#00FFFF', // Cyan color for text
    fontWeight: '600',
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interactionText: {
    fontSize: 16,
    color: '#00FFFF', // Cyan color for text
  },
  liked: {
    color: '#FF4500', // Keep the liked color as is
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00FFFF', // Cyan color for text
    textAlign: 'center',
    flex: 1,
  },
});

export default Friendpost;