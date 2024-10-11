import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

const CommentsScreen = ({ route, navigation }) => {
  const { postId, category } = route.params; // Get category from route params
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userProfilePic, setUserProfilePic] = useState('');
  const [commentsWithProfilePics, setCommentsWithProfilePics] = useState([]);

  const fetchCommentsWithProfilePics = async (comments) => {
    const commentsWithPics = await Promise.all(comments.map(async (comment) => {
      const userRef = firestore().collection('users').doc(comment.userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return {
          ...comment,
          userProfilePic: userData.photoURL || 'https://via.placeholder.com/50',
        };
      }
      return comment;
    }));
    setCommentsWithProfilePics(commentsWithPics);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Fetching post with ID:', postId, 'in category:', category); // Log postId and category
        if (!category || !postId) {
          console.error('Category or postId is missing');
          return;
        }
        const postRef = firestore().collection('posts').doc(category).collection('posts').doc(postId);
        console.log('Firestore path:', postRef.path); // Log the Firestore path
        const postDoc = await postRef.get();
        if (postDoc.exists) {
          const postData = postDoc.data();
          setPost(postData);
          await fetchCommentsWithProfilePics(postData.comments || []);
        } else {
          console.error('Post not found:', postId);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    const fetchUserNameAndProfilePic = async () => {
      try {
        const userRef = firestore().collection('users').doc(auth().currentUser.uid);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUserName(userData.displayName || 'Anonymous');
          setUserProfilePic(userData.photoURL || 'https://via.placeholder.com/50');
        }
      } catch (error) {
        console.error('Error fetching user name and profile picture:', error);
      }
    };

    fetchPost();
    fetchUserNameAndProfilePic();
  }, [postId, category]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const postRef = firestore().collection('posts').doc(category).collection('posts').doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) {
        console.error('Post not found:', postId);
        return;
      }

      const newCommentData = {
        text: newComment,
        userId: auth().currentUser.uid,
        userName: userName,
        userProfilePic: userProfilePic,
        createdAt: Timestamp.fromDate(new Date()),
      };

      const currentComments = postDoc.data().comments || [];
      const updatedComments = [...currentComments, newCommentData];

      await postRef.update({ comments: updatedComments });

      setPost(prevPost => ({
        ...prevPost,
        comments: updatedComments,
      }));
      setNewComment('');
      await fetchCommentsWithProfilePics(updatedComments);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image source={require("../../assets/arrow.png")} style={styles.backImage} />
      </TouchableOpacity>
      <Text style={styles.title}>Comments</Text>

      <FlatList
        data={commentsWithProfilePics}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Image source={{ uri: item.userProfilePic }} style={styles.commentUserProfilePic} />
            <View style={styles.commentTextContainer}>
              <Text style={styles.commentUserName}>{item.userName}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              <Text style={styles.commentDate}>
                {item.createdAt ? format(new Date(item.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Invalid Date'}
              </Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your comment..."
          placeholderTextColor="#bdc3c7"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleAddComment}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
    padding: 15,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
  },
  backImage: {
    width: 25,
    height: 25,
    tintColor: '#00FFFF', // Cyan color
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00FFFF', // Cyan color
    textAlign: 'center',
    marginBottom: 15,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#1E1E1E', // Slightly lighter dark background
    borderRadius: 8,
    borderColor: '#00FFFF', // Cyan border
    borderWidth: 1,
    shadowColor: '#00FFFF', // Cyan shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  commentUserProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUserName: {
    fontWeight: '600',
    color: '#00FFFF', // Cyan color
    marginBottom: 3,
  },
  commentText: {
    color: '#FFFFFF', // White color
    fontSize: 14,
    marginBottom: 3,
  },
  commentDate: {
    color: '#AAAAAA', // Subtle gray color
    fontSize: 10,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#1E1E1E', // Slightly lighter dark background
    borderRadius: 8,
    borderColor: '#00FFFF', // Cyan border
    borderWidth: 1,
    shadowColor: '#00FFFF', // Cyan shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  input: {
    flex: 1,
    borderColor: '#00FFFF', // Cyan border
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    color: '#FFFFFF', // White color
    marginRight: 8,
    backgroundColor: '#121212', // Dark background
  },
  submitButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#00FFFF', // Cyan background
    borderRadius: 5,
    shadowColor: '#00FFFF', // Cyan shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: '#121212', // Dark color
    fontWeight: '600',
  },
});

export default CommentsScreen;