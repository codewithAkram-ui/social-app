import { useRoute, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,RefreshControl } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import Communityadd from './communityadd';
import Technologyandit from './communitytype/Technologyandit';
import Creativeandart from './communitytype/Creativeandart';
import Businessandmanagement from './communitytype/Businessandmanagement';
import Communicationandmedia from './communitytype/Communicationandmedia';
import Educationandtraining from './communitytype/Educationandtraining';
import Scienceandresearch from './communitytype/Scienceandresearch';
import Healthcareandwellness from './communitytype/Healthcareandwellness';
import Legalandregulatory from './communitytype/Legalandregulatory';
import SocialSciencesandhumanities from './communitytype/Sciencesandhumanities';
import Sportsandphysicalactivity from './communitytype/Sportsandphysicalactivity';
import Craftsandtrades from './communitytype/Craftsandtrades';
import Travelandadventure from './communitytype/Travelandadventure';
import Religiousandspiritual from './communitytype/Religiousandspiritual';

import Homeandlifestyle from './communitytype/Homeandlifestyle';

const Community = () => {
  const [createdCommunities, setCreatedCommunities] = useState([]);
  const [trendingCommunities, setTrendingCommunities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();
  const userUID = auth.currentUser?.uid;

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

  const fetchData = async () => {
    if (userUID) {
      const communitiesList = [];
      const trendingList = [];
      try {
        // Fetching created communities
        for (const category of categories) {
          const snapshot = await firestore()
            .collection('communities')
            .doc(category)
            .collection('communityList')
            .where('createdBy', '==', userUID)
            .get();

          snapshot.forEach(doc => {
            communitiesList.push({ id: doc.id, category, ...doc.data() });
          });
        }

        // Fetching trending communities based on joined users count
        const trendingSnapshot = await firestore()
          .collection('communityJoinedCount')
          .orderBy('joinedCount', 'desc')
          .limit(10)
          .get();

        trendingSnapshot.forEach(doc => {
          trendingList.push({
            id: doc.id,
            joinedCount: doc.data().joinedCount,
            communityName: doc.data().communityName,
            imageUrl: doc.data().imageUrl
          });
        });

        setCreatedCommunities(communitiesList);
        setTrendingCommunities(trendingList);
      } catch (error) {
        console.error('Error fetching communities:', error);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribeFocus = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
        fetchData();
      }
    });
    return () => {
      unsubscribeFocus();
    };
  }, [navigation, route.params?.refresh, userUID]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  const fetchCommunityDetails = async (communityId) => {
    try {
      const communityDoc = await firestore()
        .collectionGroup('communityList')
        .doc(communityId)
        .get();

      if (communityDoc.exists) {
        setSelectedCommunity(communityDoc.data());
      }
    } catch (error) {
      console.error('Error fetching community details:', error);
    }
  };

  useEffect(() => {
    if (route.params?.communityId) {
      fetchCommunityDetails(route.params.communityId);
    }
  }, [route.params?.communityId]);

  
  return (
    <ScrollView
    style={styles.pageContainer}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }
  >
      <Text style={styles.mainTitle}>Communities</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate(Communityadd)}>
        <Image source={require("../assets/plus.png")} style={styles.addIcon}/>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Trending Networks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.createdCommunitiesContentContainer}>
  {trendingCommunities.length > 0 ? (
    trendingCommunities.map((community) => (
      <TouchableOpacity
        key={community.id}
        onPress={() => navigation.navigate('CommunityDetails', {
          communityId: community.id,
          communityName: community.communityName,
          imageUrl: community.imageUrl,
        })}
        style={styles.communityItem}
      >
        {community.imageUrl ? (
          <Image source={{ uri: community.imageUrl }} style={styles.communityImage} />
        ) : (
          <Image source={require('../assets/placeholder.png')} style={styles.communityImage} />
        )}
        <Text style={styles.communityTitle}>{community.communityName}</Text>
       
      </TouchableOpacity>
    ))
  ) : (
    <View style={styles.placeholderContainer}>
    <Image source={require('../assets/appplaceholder1.png')} style={styles.placeholderImage} />
    
  </View>
  )}
</ScrollView>



      <Text style={styles.sectionTitle}>Crafted Networks</Text>
      <ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false} 
  contentContainerStyle={styles.createdCommunitiesContentContainer}
>
  {createdCommunities.length > 0 ? (
    createdCommunities.map((community) => (
      <TouchableOpacity
        key={community.id}
        onPress={() => navigation.navigate("CommunityDetails", {
          communityId: community.id,
          createdBy: community.createdBy,
          communityName: community.communityName,
          imageUrl: community.imageUrl,
        })}
        style={styles.communityItem}
      >
        {community.imageUrl ? (
          <Image source={{ uri: community.imageUrl }} style={styles.communityImage} />
        ) : (
          <Image source={require('../assets/placeholder.png')} style={styles.communityImage} />
        )}
        <Text style={styles.communityTitle}>{community.communityName}</Text>
      </TouchableOpacity>
    ))
  ) : (
    <View style={styles.placeholderContainer}>
    <Image source={require('../assets/appplaceholder1.png')} style={styles.placeholderImage} />
    
  </View>
  )}
</ScrollView>

      <TouchableOpacity style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect with friends</Text>
      </TouchableOpacity>

      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate(Technologyandit)}>
          <Image source={require("../assets/technology.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Technology and IT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Creativeandart)}>
          <Image source={require("../assets/creative.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Creative and Arts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Businessandmanagement)}>
          <Image source={require("../assets/business.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Business and Management</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Communicationandmedia)}>
          <Image source={require("../assets/communication.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Communication and Media</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Educationandtraining)}>
          <Image source={require("../assets/education.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Education and Training</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Scienceandresearch)}>
          <Image source={require("../assets/science.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Science and Research</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Healthcareandwellness)}>
          <Image source={require("../assets/healthcare1.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Healthcare and Wellness</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Legalandregulatory)}>
          <Image source={require("../assets/legal.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Legal and Regulatory</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(SocialSciencesandhumanities)}>
          <Image source={require("../assets/socialscience.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Social Sciences and Humanities</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Sportsandphysicalactivity)}>
          <Image source={require("../assets/sports.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Sports and Physical Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Craftsandtrades)}>
          <Image source={require("../assets/crafts.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Crafts and Trades</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Travelandadventure)}>
          <Image source={require("../assets/travel.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Travel and Adventure</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate(Religiousandspiritual)}>
          <Image source={require("../assets/religious.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Religious and Spiritual</Text>
        </TouchableOpacity>
      
        <TouchableOpacity onPress={() => navigation.navigate(Homeandlifestyle)}>
          <Image source={require("../assets/home1.jpeg")} style={styles.footerImage} />
          <Text style={styles.footerText}>Home and Lifestyle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#1F1B24', // Black background
    padding: 16,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFFF', // Gold text color
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  addButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  addIcon: {
    width: 24,
    height: 24,
   
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#00FFFF',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  communityImage: {
    width: 60, 
    height: 60, 
    borderRadius: 30, // Circular images
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFA500',
    backgroundColor: '#fff',
  },
  connectButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  connectButtonText: {
    fontWeight: '700',
    color: 'white',
    fontSize: 18,
  },
  footerContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'space-between', 
    marginTop: 20,
    marginBottom:80
  },
  footerImage: {
    width: 150,
    height: 100,
    borderRadius: 15,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#00FFFF',
    backgroundColor: '#fff',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  communityItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  createdCommunitiesContentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  communityTitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#00FFFF',
    fontWeight: '600',
    width: 80,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  noCommunitiesText: {
    fontSize: 16,
    color: '#00FFFF',
    marginTop: 10,
    fontWeight: 'bold',
  },
});


export default Community;
