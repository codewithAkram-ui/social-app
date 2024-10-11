import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,Alert, FlatList, ActivityIndicator } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import Postdetailscreen from './community/postdetailscreen';
import Goal from './goal';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native'; // Import LottieView

const categories = [
  'All',
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

const PAGE_SIZE = 10; // Number of posts to fetch per page

const Home = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const navigation = useNavigation(); 
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [users, setUsers] = useState({}); // Store user details by uid
  const [postComments, setPostComments] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showReportOption, setShowReportOption] = useState(null); // State to manage report option visibility
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const user = auth().currentUser;
  const [isModalVisible, setModalVisible] = useState(false);
  const [playingVideos, setPlayingVideos] = useState(new Set());

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
      try {
        const snapshot = await firestore()
          .collection('joined')
          .where('userId', '==', user.uid)
          .get();
    
        const communitiesList = snapshot.docs.map(doc => ({
          id: doc.data().communityId,
          name: doc.data().communityName,
          imageUrl: doc.data().imageUrl,
        }));
    
        setJoinedCommunities(communitiesList);
      } catch (error) {
        console.error('Error fetching joined communities:', error);
      }
    };
    
    fetchJoinedCommunities();
  
  }, []);

  useEffect(() => {
    fetchInitialPosts(selectedCategory);
    setLoading(false);
  }, [selectedCategory]);

  const fetchInitialPosts = async (category) => {
    setLoading(true);
    try {
      let postsList = [];
      let lastVisiblePost = null;
      if (category === 'All') {
        const allCategories = categories.filter(cat => cat !== 'All');
        const allPostsPromises = allCategories.map(async (cat) => {
          const postsSnapshot = await firestore()
            .collection('posts')
            .doc(cat)
            .collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(PAGE_SIZE)
            .get();
  
          if (!lastVisiblePost) {
            lastVisiblePost = postsSnapshot.docs[postsSnapshot.docs.length - 1];
          }
  
          return postsSnapshot.docs.map(doc => ({
            id: doc.id,
            category: cat,
            ...doc.data(),
            likesCount: doc.data().likesCount || 0,
            comments: doc.data().comments || [],
          }));
        });
  
        const allPosts = await Promise.all(allPostsPromises);
        postsList = allPosts.flat();
      } else {
        const postsSnapshot = await firestore()
          .collection('posts')
          .doc(category)
          .collection('posts')
          .orderBy('createdAt', 'desc')
          .limit(PAGE_SIZE)
          .get();
  
        lastVisiblePost = postsSnapshot.docs[postsSnapshot.docs.length - 1];
  
        postsList = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          category,
          ...doc.data(),
          likesCount: doc.data().likesCount || 0,
          comments: doc.data().comments || [],
        }));
      }
  
      // Shuffle the postsList to display randomly
      postsList = postsList.sort(() => Math.random() - 0.5);
  
      setPosts(postsList);
      setLastVisible(lastVisiblePost);
      setLoading(false);
  
      // Initialize comments state
      const commentsMap = postsList.reduce((acc, post) => {
        acc[post.id] = post.comments || [];
        return acc;
      }, {});
      setPostComments(commentsMap);
  
      // Initialize liked posts
      const likedPostsSet = new Set(postsList.flatMap(post => post.likes || []).filter(id => id === user.uid));
      setLikedPosts(likedPostsSet);
  
      // Fetch user details for each post
      const userPromises = postsList.map(post => firestore().collection('users').doc(post.uid).get());
      const userSnapshots = await Promise.all(userPromises);
  
      const userMap = userSnapshots.reduce((acc, doc) => {
        if (doc.exists) {
          acc[doc.id] = doc.data();
        }
        return acc;
      }, {});
      setUsers(userMap);
  
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };
  

  const fetchMorePosts = async () => {
    if (isFetchingMore || !lastVisible) return;
    setIsFetchingMore(true);
    try {
      let postsList = [];
      let lastVisiblePost = null;
      if (selectedCategory === 'All') {
        const allCategories = categories.filter(cat => cat !== 'All');
        const allPostsPromises = allCategories.map(async (cat) => {
          const postsSnapshot = await firestore()
            .collection('posts')
            .doc(cat)
            .collection('posts')
            .orderBy('createdAt', 'desc')
            .startAfter(lastVisible)
            .limit(PAGE_SIZE)
            .get();

          if (!lastVisiblePost) {
            lastVisiblePost = postsSnapshot.docs[postsSnapshot.docs.length - 1];
          }

          return postsSnapshot.docs.map(doc => ({
            id: doc.id,
            category: cat,
            ...doc.data(),
            likesCount: doc.data().likesCount || 0,
            comments: doc.data().comments || [],
          }));
        });

        const allPosts = await Promise.all(allPostsPromises);
        postsList = allPosts.flat();

        // Shuffle the postsList to fetch randomly
        postsList = postsList.sort(() => Math.random() - 0.5);
      } else {
        const postsSnapshot = await firestore()
          .collection('posts')
          .doc(selectedCategory)
          .collection('posts')
          .orderBy('createdAt', 'desc')
          .startAfter(lastVisible)
          .limit(PAGE_SIZE)
          .get();

        lastVisiblePost = postsSnapshot.docs[postsSnapshot.docs.length - 1];

        postsList = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          category: selectedCategory,
          ...doc.data(),
          likesCount: doc.data().likesCount || 0,
          comments: doc.data().comments || [],
        }));
      }

      setPosts(prevPosts => [...prevPosts, ...postsList]);
      setLastVisible(lastVisiblePost);
      setIsFetchingMore(false);

      // Initialize comments state
      const commentsMap = postsList.reduce((acc, post) => {
        acc[post.id] = post.comments || [];
        return acc;
      }, {});
      setPostComments(prevComments => ({ ...prevComments, ...commentsMap }));

      // Initialize liked posts
      const likedPostsSet = new Set(postsList.flatMap(post => post.likes || []).filter(id => id === user.uid));
      setLikedPosts(prevLikedPosts => new Set([...prevLikedPosts, ...likedPostsSet]));

      // Fetch user details for each post
      const userPromises = postsList.map(post => firestore().collection('users').doc(post.uid).get());
      const userSnapshots = await Promise.all(userPromises);

      const userMap = userSnapshots.reduce((acc, doc) => {
        if (doc.exists) {
          acc[doc.id] = doc.data();
        }
        return acc;
      }, {});
      setUsers(prevUsers => ({ ...prevUsers, ...userMap }));

    } catch (error) {
      console.error('Error fetching more posts:', error);
      setIsFetchingMore(false);
    }
  };

  const handleLike = async (postId, category) => {
    try {
      const postRef = firestore()
        .collection('posts')
        .doc(category)
        .collection('posts')
        .doc(postId);
      const userId = user.uid;
      const postDoc = await postRef.get();
  
      if (postDoc.exists) {
        const postData = postDoc.data();
        const likes = postData.likes || [];
  
        if (likes.includes(userId)) {
          await postRef.update({
            likes: firestore.FieldValue.arrayRemove(userId),
            likesCount: firestore.FieldValue.increment(-1),
          });
          setLikedPosts(prev => {
            const updated = new Set(prev);
            updated.delete(postId);
            return updated;
          });
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === postId ? { ...post, likesCount: post.likesCount - 1 } : post
            )
          );
        } else {
          await postRef.update({
            likes: firestore.FieldValue.arrayUnion(userId),
            likesCount: firestore.FieldValue.increment(1),
          });
          setLikedPosts(prev => new Set(prev).add(postId));
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === postId ? { ...post, likesCount: post.likesCount + 1 } : post
            )
          );
        }
      } else {
        console.log('Post does not exist');
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };
  
  const handleBookmark = (postId) => {
    setBookmarkedPosts((prev) => {
      const updated = new Set(prev);
      if (updated.has(postId)) {
        updated.delete(postId);
      } else {
        updated.add(postId);
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

  
  const toggleExpand = (postId) => {
    setExpandedPosts((prev) => {
      const updated = new Set(prev);
      if (updated.has(postId)) {
        updated.delete(postId);
      } else {
        updated.add(postId);
      }
      return updated;
    });
  };

  const handleGoalIconPress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  
  const togglePlayVideo = (postId) => {
    setPlayingVideos((prev) => {
      const updated = new Set(prev);
      if (updated.has(postId)) {
        updated.delete(postId);
      } else {
        updated.add(postId);
      }
      return updated;
    });
  };


  
  const renderPost = ({ item: post }) => {
    const hasLiked = likedPosts.has(post.id);
    const userProfile = users[post.uid] || {}; // Get user profile details
    const isBookmarked = bookmarkedPosts.has(post.id);
    const showReport = showReportOption === post.id;
    const isExpanded = expandedPosts.has(post.id);
    const description = post.description || "No description available";
    const truncatedDescription = description.length > 100 ? description.substring(0, 100) + '...' : description;
    const isPlaying = playingVideos.has(post.id);
    return (
      <View key={post.id} style={styles.postItem}>
        {/* Post Header with User Profile */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            key={post.id}
            style={styles.postHeaderContent}
            onPress={() => navigation.navigate('Postdetailscreen', { post, userProfile })}
          >
            <Image
              source={{ uri: userProfile.photoURL || 'https://via.placeholder.com/50' }}
              style={styles.userProfileImage}
            />
            <Text style={styles.userName}>{userProfile.displayName || 'Anonymous'}</Text>
          </TouchableOpacity>
          <View style={styles.threeDotContainer}>
            {showReport && (
              <TouchableOpacity style={styles.reportOption} onPress={() => handleReport(post.id)}>
                <Image
                  source={require('../assets/report-flag.png')} // Replace with your report icon path
                  style={styles.reportIcon}
                />
                <Text style={styles.reportText}>Report</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.threeDotIcon} onPress={() => toggleReportOption(post.id)}>
              <Image
                source={require('../assets/more.png')} // Replace with your three-dot icon path
                style={styles.threeDotImage}
              />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Post Description */}
        <Text style={styles.postDescription}>
          {isExpanded ? description : truncatedDescription}
          {description.length > 100 && (
            <Text onPress={() => toggleExpand(post.id)} style={styles.seeMoreText}>
              {isExpanded ? ' See Less' : ' See More'}
            </Text>
          )}
        </Text>
  
        {/* Media Content */}
        {post.mediaType === 'video' ? (
          <View style={styles.videoContainer}>
          <Video
            source={{ uri: post.mediaUrl }}
            style={styles.postVideo}
            resizeMode="cover"
            paused={!isPlaying}
            controls={true}
          />
          {!isPlaying && (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => togglePlayVideo(post.id)}
              >
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Image
            source={{ uri: post.mediaUrl }}
            style={styles.postImage}
          />
        )}
  
        {/* Post Details */}
        <View style={styles.postDetails}>
          <Text style={styles.postTitle}>{post.title || "Untitled Post"}</Text>
          <Text style={styles.postInfo}>
            {post.skillCategory || "General"} • {format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy')}
          </Text>
        </View>
  
        {/* Interactive Buttons */}
        <View style={styles.interactionContainer}>
          {/* Like/Unlike Button */}
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => handleLike(post.id, post.category)}
          >
            <Image
              source={require('../assets/like.png')}
              style={[styles.likeIcon, hasLiked && styles.likedIcon]}
            />
            <Text style={styles.interactionText}>
              {post.likesCount}
            </Text>
          </TouchableOpacity>
  
          {/* Bookmark Button */}
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => handleBookmark(post.id)}
          >
            <Image
              source={require('../assets/bookmark.png')} // Replace with your bookmark icon path
              style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkedIcon]}
            />
          </TouchableOpacity>
  
          {/* Comment Button */}
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => {
              console.log('Navigating to CommentsScreen with postId:', post.id, 'and category:', post.category);
              navigation.navigate('CommentsScreen', { postId: post.id, category: post.category });
            }}
          >
            <Image
              source={require('../assets/comment.png')} // Replace with your comment icon path
              style={styles.commentIcon}
            />
          </TouchableOpacity>
        </View>
  
        {/* Line from User Profile to Like Button */}
        <View style={styles.line} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Logo, App Name, and Goal Icon */}
      <View style={styles.header}>
        <Image
          source={require('../assets/applogo1.png')}
          style={styles.logo}
        />
        <Text style={styles.appName}>Ski.io</Text>
      
        <TouchableOpacity onPress={handleGoalIconPress}>
          <FastImage source={require("../assets/achievement.gif")} style={styles.goalIcon} resizeMode={FastImage.resizeMode.contain} />
        </TouchableOpacity>
      </View>

      {/* Custom Modal */}
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>AI to develop your skill is coming soon</Text>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Joined Communities Section */}
      <View style={styles.communityPostsContainer}>
        <ScrollView 
          style={styles.communitiesScrollContainer} 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.communitiesContainer}>
            {joinedCommunities.length > 0 ? (
              joinedCommunities.map((community) => (
                <TouchableOpacity key={community.id} style={styles.communityItem} onPress={() => navigation.navigate("CommunityDetails", {
                  communityId: community.id,
                  createdBy: community.createdBy,
                  communityName: community.name,
                  category: community.category,
                  imageUrl: community.imageUrl,
                })}>
                  <Image source={{ uri: community.imageUrl }} style={styles.communityImage} />
                  <Text style={styles.communityTitle}>{community.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noCommunitiesText}>You haven't joined any communities yet.</Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Category Selection Dropdown */}
      <View style={styles.pickerContainer}>
        <ModalDropdown
          options={categories}
          defaultValue="Select a category"
          onSelect={(index, value) => setSelectedCategory(value)}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          dropdownStyle={styles.dropdownMenu}
          dropdownTextStyle={styles.dropdownMenuText}
          renderRightComponent={() => (
            <Image
              source={require('../assets/down.png')} // Replace with your image path
              style={styles.dropdownIcon}
            />
          )}
          animationType="slide"
        />
      </View>

      {/* Posts Section */}
      <View style={styles.postsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LottieView
              source={require('../assets/hamster.json')} // Ensure the path is correct
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.loadingText}>Loading...</Text> 
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            onEndReached={fetchMorePosts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingMore ? <ActivityIndicator size="large" color="#FF007A" /> : null}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  seeMoreText: {
    color: '#00FFFF', // Cyan color for "See More"
    fontWeight: 'bold',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
    backgroundColor:"red"
  },
  
  loadingText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10, // Reduced padding
    backgroundColor: 'black', // Slightly lighter dark background
    borderBottomWidth: 1,
    borderBottomColor: '#00FFFF', // Cyan border
    shadowColor: '#00FFFF', // Cyan shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  modalContent: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FF007A',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfileImage: {
    width: 50, // Set width for the profile image
    height: 50, // Set height for the profile image
    borderRadius: 25, // Make it circular
    borderWidth: 2, // Optional: add border
    borderColor: '#00FFFF', // Optional: border color
    marginRight: 10, // Space between image and username
  },
  userName: {
    fontSize: 16, // Set font size for the username
    fontWeight: 'bold', // Make the username bold
    color: '#FFFFFF', // Set text color to white for visibility
    marginLeft: 5, // Space between the profile image and username
  },
  postDescription: {
    fontSize: 15,
    color: '#AAAAAA', // Light gray color
    marginBottom: 10,
    marginLeft:30
  },
  postImage: {
    width: "90%", // Smaller image width
    height: 200, // Smaller image height
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 30, // Shift image to the left
  },
  postVideo: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft:30
  },
  line: {
    position: 'absolute',
    top: 70, // Adjust based on the position of the user profile image
    left: 30, // Adjust based on the position of the user profile image
    width: 1,
    height: '65%',
    backgroundColor: '#FFFFFF', // White color for the line
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
    backgroundColor: '#1E1E1E', // Background color for the report option
    padding: 0,

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
  logo: {
    width: 40, // Smaller logo
    height: 40, // Smaller logo
    borderRadius: 15,
    borderWidth: 2,
    
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  appName: {
    fontSize: 20, // Smaller app name
    fontWeight: 'bold',
    color: '#FFFFFF', // White color
    letterSpacing: 2,
    textShadowColor: '#00FFFF', // Cyan glow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    marginRight:20
  },
  // ... existing code ...
  
  bookmarkIcon: {
    width: 20, // Set the width of the bookmark icon
    height: 20, // Set the height of the bookmark icon
    marginLeft: 180,
    tintColor:"white" // Space between icon and text
  },
  bookmarkedIcon: {
    tintColor: 'cyan', // Cyan color for bookmarked icon
  },
  commentIcon: {
    width: 20, // Set the width of the comment icon
    height: 20, // Set the height of the comment icon
    marginRight: 10,
    tintColor:"cyan" // Space between icon and text
  },
    goalIcon: {
    width: 40, // Smaller goal icon
    height: 45, // Smaller goal icon
    
   
   
  },

  // Communities Section
  communitiesScrollContainer: {
    marginBottom: 20, // Increased margin to provide space for the picker
  },
  communitiesContainer: {
    flexDirection: 'row',
    marginHorizontal: 0,
    
  },
  communityItem: {
    width: 80, // Smaller community item
    height: 100, // Smaller community item
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00FFFF', // Cyan
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  communityImage: {
    width: 60, // Smaller community image
    height: 60, // Smaller community image
    borderRadius: 30,
    marginBottom: 5,
  },
  communityTitle: {
    fontSize: 12, // Smaller font size
    color: '#FFFFFF', // White color
    textAlign: 'center',
  },
  noCommunitiesText: {
    color: '#FFFFFF', // White color
    fontSize: 14,
  },

  // Picker Container
  pickerContainer: {
    marginHorizontal: 150,
    marginBottom: 20,
    marginLeft:20
  },
    dropdown: {
    
    borderWidth: 1,
    borderColor: '#00FFFF', // Cyan border
    borderRadius: 8,
    padding: 10,
  },
  dropdownText: {
    color: '#00FFFF', // Cyan text color
    fontSize: 14,
  },
  dropdownMenu: {
    
    
    borderWidth: 1,
    borderColor: '#00FFFF', // Cyan border
    borderRadius: 8,
    marginTop:10,
    
   
      },
  dropdownMenuText: {
    color: 'black', // Cyan text color
    fontSize: 14,
  },
  dropdownIcon: {
    width: 20, // Set the width of the icon
    height: 20, // Set the height of the icon
    marginLeft: 10,
    tintColor:"cyan" // Optional: add some space between text and icon
  },


  postsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  postItem: {
    
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#00FFFF', // Cyan border
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },


  postDetails: {
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // White color
  },
  postInfo: {
    fontSize: 12,
    color: '#AAAAAA', // Light gray color
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
    tintColor:"white"
  },
  likedIcon: {
    tintColor: 'cyan', // Pink color for liked icon
  },
  interactionText: {
    fontSize: 14,
    color: '#FFFFFF', // White color
  },
});

export default Home;