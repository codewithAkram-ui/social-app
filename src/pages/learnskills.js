import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import Knownskills from './knownskills';

const Learnskills = () => {
  const navigation = useNavigation();
  return (
    <ScrollView style={styles.container}>
      {/* User Details */}
      <View style={styles.userContainer}>
        <Image source={{ uri: userProfile.photoURL }} style={styles.userImage} />
        <Text style={styles.userName}>{userProfile.displayName}</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
        <Text style={styles.userPhone}>{userProfile.phoneNumber}</Text>
        <Text style={styles.userEducation}>{userProfile.education}</Text>
        <Text style={styles.userBirthday}>{userProfile.birthday}</Text>
        <View style={styles.linkContainer}>
          <Image source={require('../../assets/facebook.png')} style={styles.linkIcon} />
          <Text style={styles.userLink}>{userProfile.facebookLink}</Text>
        </View>
        <View style={styles.linkContainer}>
          <Image source={require('../../assets/social.png')} style={styles.linkIcon} />
          <Text style={styles.userLink}>{userProfile.instagramLink}</Text>
        </View>
        <View style={styles.linkContainer}>
          <Image source={require('../../assets/linkedin.png')} style={styles.linkIcon} />
          <Text style={styles.userLink}>{userProfile.linkedinLink}</Text>
        </View>
        <View style={styles.linkContainer}>
          <Image source={require('../../assets/internet.png')} style={styles.linkIcon} />
          <Text style={styles.userLink}>{userProfile.websiteLink}</Text>
        </View>

        <TouchableOpacity
          style={[styles.followButton, { backgroundColor: isFollowing ? 'red' : 'cyan' }]}
          onPress={handleFollow}
        >
          <Text style={styles.buttonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>

        {isFriend ? (
          <Text style={styles.friendText}>You are friends with {userProfile.displayName}</Text>
        ) : requestSent ? (
          <Text style={styles.requestSentText}>Friend Request Sent</Text>
        ) : (
          <TouchableOpacity
            style={styles.friendRequestButton}
            onPress={handleSendFriendRequest}
          >
            <Text style={styles.buttonText}>Send Friend Request</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Details */}
      <View style={styles.postContainer}>
        <Text style={styles.postTitle}>Title: {post.title}</Text>
        <Text style={styles.postDescription}>Description: {post.description}</Text>
        <Text style={styles.postInfo}>
          Skill: {post.skillCategory} | Difficulty: {post.difficultyLevel}
        </Text>
        <Text style={styles.postInfo}>
          Created on: {format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy')}
        </Text>
        <Text style={styles.postLocation}>Location: {post.location}</Text>
        <Text style={styles.postGoals}>Goals: {post.goals}</Text>
        <Text style={styles.postResources}>Resources: {post.resources}</Text>
        <Text style={styles.postTimeSpent}>Time Spent: {post.timeSpent}</Text>
      </View>
    </ScrollView>
  );
};
  

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e0f7fa',  // Light cyan background color
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,  // Adds a drop shadow for Android
  },
  text: {
    fontSize: 20,
    color: '#00796b',  // Dark teal text color
    fontWeight: '600',
  },
});

export default Learnskills



