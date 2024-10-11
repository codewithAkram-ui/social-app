import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth'; 
import Question from './src/pages/questions';
import Login from './src/pages/login';

import PhoneNumberLogin from './src/pages/phonenumberlogin';
import SplashScreen from './src/pages/splashscreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import Home from './src/Tabs/home';

import Add from './src/Tabs/add';
import Community from './src/Tabs/community';
import User from './src/Tabs/user';
import CustomTabBar from './src/components/customtabbar';

import EditProfile from './src/pages/editprofile';
import Channels from './src/pages/user/channels';
import Yourpost from './src/pages/user/yourpost';
import Help from './src/pages/user/help';
import Settings from './src/pages/user/settings';
import Post from './src/Tabs/post';
import Live from './src/Tabs/live';
import Communityadd from './src/Tabs/communityadd';
import Businessandmanagement from './src/Tabs/communitytype/Businessandmanagement';
import Communicationandmedia from './src/Tabs/communitytype/Communicationandmedia';
import Craftsandtrades from './src/Tabs/communitytype/Craftsandtrades';
import Creativeandart from './src/Tabs/communitytype/Creativeandart';
import Educationandtraining from './src/Tabs/communitytype/Educationandtraining';
import Healthcareandwellness from './src/Tabs/communitytype/Healthcareandwellness';
import Homeandlifestyle from './src/Tabs/communitytype/Homeandlifestyle';

import Legalandregulatory from './src/Tabs/communitytype/Legalandregulatory';
import Religiousandspiritual from './src/Tabs/communitytype/Religiousandspiritual';
import Scienceandresearch from './src/Tabs/communitytype/Scienceandresearch';
import SocialSciencesandhumanities from './src/Tabs/communitytype/Sciencesandhumanities';
import Sportsandphysicalactivity from './src/Tabs/communitytype/Sportsandphysicalactivity';
import Technologyandit from './src/Tabs/communitytype/Technologyandit';
import Travelandadventure from './src/Tabs/communitytype/Travelandadventure';
import CommunityDetails from './src/Tabs/community/communitydetails';
import CommentsScreen from './src/Tabs/community/CommentsScreen';
import Postdetailscreen from './src/Tabs/community/postdetailscreen';
import Goal from './src/Tabs/goal';
import Friendpost from './src/Tabs/friendpost';

import FollowingScreen from './src/Tabs/community/folllowingscreen';
import FollowersScreen from './src/Tabs/community/followerscreen';
import HostPage from './src/Tabs/live/hostpage';
import AudiencePage from './src/Tabs/live/audiencepage';
import JoinedUsers from './src/Tabs/community/joineduser';

import FriendsListScreen from './src/Tabs/friendlist';
import ChatScreen from './src/Tabs/chat';
import CommunityEdit from './src/Tabs/community/communtyedit';
import Postedit from './src/Tabs/community/postedit';
import Livepage from './src/Tabs/livepage';




const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = ({ route }) => {
  const { uid } = route.params || {}; 

  useEffect(() => {
    if (uid) {
      console.log('User UID:', uid);
    }
  }, [uid]);

  return (
    <Tab.Navigator 
      tabBar={(props) => <CustomTabBar {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="Home" 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./src/assets/house.png')} 
              style={{ tintColor: color, width: 24, height: 24 }} 
            />
          ),
          tabBarLabel: 'Home',
          
        }}
      >
        {(props) => <Home {...props} uid={uid} />}  
      </Tab.Screen>
      <Tab.Screen 
        name="Friendpost" 
        component={Friendpost} 
        initialParams={{uid}} 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./src/assets/friends.png')} 
              style={{ tintColor: color, width: 24, height: 24 }} 
            />
          ),
          tabBarLabel: 'Friends',
        }}
      />
   
      <Tab.Screen 
        name="Add" 
        component={Add} 
        initialParams={{uid}} 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./src/assets/plus.png')} 
              style={{ tintColor: "red", width: 24, height: 24 }} 
            />
          ),
          
        
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={Community} 
        initialParams={{uid}} 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./src/assets/population.png')} 
              style={{ tintColor: color, width: 24, height: 24 }} 
            />
          ),
          tabBarLabel: 'Community',
        }}
      />
      <Tab.Screen 
        name="User" 
        component={User} 
        initialParams={{uid}} 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Image 
              source={require('./src/assets/programmer.png')} 
              style={{ tintColor: color, width: 24, height: 24 }} 
            />
          ),
          tabBarLabel: 'User',
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
   
    GoogleSignin.configure({
      webClientId: '324681738267-mp3vjhonv25dg3dq7hc22bjm3fk4stfi.apps.googleusercontent.com',
      offlineAccess: true,
    });

    // Set up the authentication state listener
    const unsubscribe = auth().onAuthStateChanged((user) => { // Use auth() directly
      setUser(user); 
      if (initializing) setInitializing(false);
    });

    // Splash screen timeout
    const timeout = setTimeout(() => {
      setShowSplash(false); 
    }, 3000);

    return () => {
      clearTimeout(timeout);
      unsubscribe(); 
    };
  }, [initializing]);

  if (initializing) return null; 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (<>
              <Stack.Screen name="MainTabs" component={MainTabs} initialParams={{userId:user.uid}} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen name="Channels" component={Channels} />
              <Stack.Screen name="Yourpost" component={Yourpost} />
              <Stack.Screen name="Settings" component={Settings}/>
              <Stack.Screen name="Help" component={Help}/>
              <Stack.Screen name="Live" component={Live}/>
              <Stack.Screen name="Livepage" component={Livepage}/>
              <Stack.Screen name="HostPage" component={HostPage}/>
              <Stack.Screen name="AudiencePage" component={AudiencePage}/>
              <Stack.Screen name="Post" component={Post}/>
              <Stack.Screen name="Goal" component={Goal}/>
              
              <Stack.Screen name="FriendsListScreen" component={FriendsListScreen}/>
              <Stack.Screen name="ChatScreen" component={ChatScreen}/>

            
              <Stack.Screen name="FollowersScreen" component={FollowersScreen}/>
              <Stack.Screen name="FollowingScreen" component={FollowingScreen}/>
              <Stack.Screen name="Communityadd" component={Communityadd}/>
              <Stack.Screen name="CommunityDetails" component={CommunityDetails}/>
              <Stack.Screen name="Postedit" component={Postedit}/>
              <Stack.Screen name="CommunityEdit" component={CommunityEdit}/>
              <Stack.Screen name="JoinedUsers" component={JoinedUsers}/>
              <Stack.Screen name="CommentsScreen" component={CommentsScreen}/>
              <Stack.Screen name="Postdetailscreen" component={Postdetailscreen}/>

              <Stack.Screen name="Businessandmanagement" component={Businessandmanagement}/>
              <Stack.Screen name="Communicationandmedia" component={Communicationandmedia}/>
              <Stack.Screen name="Craftsandtrades" component={Craftsandtrades}/>
              <Stack.Screen name="Creativeandart" component={Creativeandart}/>
              <Stack.Screen name="Educationandtraining" component={Educationandtraining}/>
              <Stack.Screen name="Healthcareandwellness" component={Healthcareandwellness}/>
              <Stack.Screen name="Homeandlifestyle" component={Homeandlifestyle}/>
           
              <Stack.Screen name="Legalandregulatory" component={Legalandregulatory}/>
              <Stack.Screen name="Religiousandspiritual" component={Religiousandspiritual}/>
              <Stack.Screen name="Scienceandresearch" component={Scienceandresearch}/>
              <Stack.Screen name="SocialSciencesandhumanities" component={SocialSciencesandhumanities}/>
              <Stack.Screen name="Sportsandphysicalactivity" component={Sportsandphysicalactivity}/>
              <Stack.Screen name="Technologyandit" component={Technologyandit}/>
              <Stack.Screen name="Travelandadventure" component={Travelandadventure}/>
              
              </>
            ) : (
              <><Stack.Screen name="Question" component={Question} />
                <Stack.Screen name="Login" component={Login} />
                
                <Stack.Screen name="PhoneNumberLogin" component={PhoneNumberLogin} />
              </>
            )}
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
