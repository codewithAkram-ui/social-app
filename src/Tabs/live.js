import React, { useEffect, useState } from "react";
import { Button, View, StyleSheet, Text, TextInput, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; 
import { debounce } from 'lodash';
import Clipboard from '@react-native-clipboard/clipboard'; // Import Clipboard

export default function Live() {
    const navigation = useNavigation();
    const route = useRoute();
    const [uid, setUserID] = useState('');
    const [userName, setUserName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [liveID, setLiveID] = useState('');
    const [audienceLiveID, setAudienceLiveID] = useState(''); 
    const insets = useSafeAreaInsets();
    const [topic, setTopic] = useState('');
    const [audienceTopic, setAudienceTopic] = useState('');

    useEffect(() => {
        const currentUser = auth().currentUser;
        if (currentUser) {
            setUserID(currentUser.uid); 
            fetchUserProfile(currentUser.uid); 
            setLiveID(currentUser.uid); 

            if (route.params?.liveID) {
                setAudienceLiveID(route.params.liveID);
            }

            if (route.params?.topic) {
                setAudienceTopic(route.params.topic);
            }
        }
    }, [route.params?.liveID, route.params?.topic]);

    const fetchUserProfile = async (uid) => {
        try {
            const userDoc = await firestore().collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                setUserName(userData.displayName); 
                setProfileImage(userData.photoURL); 
            }
        } catch (error) {
            console.error("Error fetching user details: ", error);
        }
    };

    const handleAudienceLiveIDChange = debounce((text) => {
        setAudienceLiveID(text.replace(/[^0-9A-Za-z_]/g, ''));
    }, 300);

    const onJoinPress = (isHost) => {
        const liveIDToUse = isHost ? liveID : audienceLiveID;

        if (!liveIDToUse || !uid || (isHost && !topic)) {
            Alert.alert('Error', 'Please provide a valid Live ID, Topic, and make sure User ID is generated.');
            return;
        }

        navigation.navigate(isHost ? 'HostPage' : 'AudiencePage', {
            uid,
            userName: userName || uid,
            liveID: liveIDToUse,
            topic: isHost ? topic : audienceTopic,
        });
    };

    const copyToClipboard = () => {
        Clipboard.setString(liveID);
       
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
           <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.appIconContainer}>
            <Image
                source={require('../assets/appplaceholder1.png')} // Ensure you have the app icon in the specified path
                style={styles.appIcon}
            />
        </View>

        <View style={styles.profileBox}>
            {profileImage ? (
                <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                />
            ) : (
                <Text style={styles.loadingText}>Loading profile image...</Text>
            )}
            <Text style={styles.userName}>{userName || 'Fetching name...'}</Text>
        </View>

        <Text style={[styles.liveID, styles.leftPadding]}>Your Live ID (Host):</Text>
        <View style={styles.liveIDContainer}>
            <TextInput
                style={[styles.input, { color: 'gray', flex: 1 }]}
                value={liveID}
                editable={false} 
            />
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
            </View>
            <Text style={[styles.liveID, styles.leftPadding]}>Enter Topic for Live:</Text>
            <TextInput
                placeholder="Enter the topic"
                placeholderTextColor={"white"}
                style={styles.input}
                onChangeText={setTopic}
                value={topic}
                maxLength={47} 
            />

            <Text style={[styles.liveID, styles.leftPadding]}>Enter Live ID to Watch:</Text>
            <TextInput
                placeholder="Enter the Live ID"
                placeholderTextColor={"white"}
                style={styles.input}
                onChangeText={handleAudienceLiveIDChange}
                maxLength={30}
                value={audienceLiveID}
            />
            {audienceTopic ? (
                <Text style={styles.audienceTopic}>Topic: {audienceTopic}</Text>
            ) : null}

            <View style={[styles.buttonLine, styles.leftPadding]}>
                <Button
                    disabled={!liveID || !topic}
                    title="Start a Live"
                    onPress={() => onJoinPress(true)}
                />
                <View style={styles.buttonSpacing} />
                <Button
                    disabled={!audienceLiveID}
                    title="Watch a Live"
                    onPress={() => onJoinPress(false)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#000', // Black background
    },
    header: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    backButton: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'cyan',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent white
        shadowColor: 'cyan',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    backButtonText: {
        color: 'cyan',
        fontWeight: 'bold',
    },
    appIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
       bottom:20
       
    },
    appIcon: {
        width: 200,
        height: 200,
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent white
        padding: 16,
        borderRadius: 10,
        marginBottom: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'cyan', // Cyan border
        marginRight: 16,
    },
    userName: {
        fontSize: 20,
        color: 'cyan', // Cyan color
        fontWeight: 'bold',
    },
    loadingText: {
        textAlign: 'center',
        marginBottom: 10,
        color: 'cyan', // Cyan color
        fontSize: 18,
        fontWeight: 'bold',
    },
    liveID: {
        fontSize: 16,
        marginTop: 10,
        color: 'cyan', // Cyan color
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: 'cyan', // Cyan border
        borderWidth: 1,
        marginBottom: 20,
        paddingLeft: 10,
        color: 'cyan', // Cyan text color
        borderRadius: 5,
        backgroundColor: '#111', // Slightly lighter black for input background
    },
    liveIDContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    copyButton: {
        backgroundColor: 'cyan', // Cyan background
        padding: 10,
        marginLeft: 10,
        borderRadius: 5,
        bottom:10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    copyButtonText: {
        color: 'black', // Black text color
        fontWeight: 'bold',
    },
    buttonLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    buttonSpacing: {
        width: 10,
    },
    audienceTopic: {
        fontSize: 16,
        color: 'white', // Cyan color
        marginTop: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});