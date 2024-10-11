import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import ZegoUIKitPrebuiltLiveStreaming, { HOST_DEFAULT_CONFIG, ZegoMenuBarButtonName } from '@zegocloud/zego-uikit-prebuilt-live-streaming-rn';
import * as ZIM from 'zego-zim-react-native';
import firestore from '@react-native-firebase/firestore'; // Import Firestore
import KeyCenter from "../../Tabs/live/keycenter";

export default function HostPage({ route, navigation }) {
    const prebuiltRef = useRef();
    const { uid, userName, liveID,topic } = route.params;

    // Function to add the user to the 'live' collection
    const startLiveInFirestore = async () => {
        try {
            await firestore()
                .collection('live')
                .doc(uid)
                .set({ liveID, userName, uid,topic });
            console.log('User added to live collection');
        } catch (error) {
            console.error('Error starting live in Firestore: ', error);
        }
    };

    // Function to remove the user from the 'live' collection
    const stopLiveInFirestore = async () => {
        try {
            await firestore()
                .collection('live')
                .doc(uid)
                .delete();
            console.log('User removed from live collection');
        } catch (error) {
            console.error('Error stopping live in Firestore: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <ZegoUIKitPrebuiltLiveStreaming
                ref={prebuiltRef}
                appID={KeyCenter.appID}
                appSign={KeyCenter.appSign}
                userID={uid}
                userName={userName}
                liveID={liveID}
                config={{
                    ...HOST_DEFAULT_CONFIG,
                    onStartLiveButtonPressed: async () => {
                        console.log('Host started live stream');
                        await startLiveInFirestore(); // Add the user to the 'live' collection
                    },
                    onLiveStreamingEnded: async () => {
                        console.log('Live streaming ended');
                        await stopLiveInFirestore(); // Remove the user from the 'live' collection
                    },
                    onLeaveLiveStreaming: async () => {
                        console.log('Host left the live stream');
                        await stopLiveInFirestore(); // Remove the user from the 'live' collection
                        navigation.navigate('Live');
                    },
                    durationConfig: {
                        isVisible: true,
                        onDurationUpdate: (duration) => {
                            console.log('Live duration:', duration);
                            if (duration === 10 * 60) { // Stop after 10 minutes
                                prebuiltRef.current.leave();
                            }
                        }
                    },
                    topMenuBarConfig: {
                        buttons: [ZegoMenuBarButtonName.minimizingButton, ZegoMenuBarButtonName.leaveButton],
                    },
                    onWindowMinimized: () => {
                        console.log('Window minimized');
                        navigation.navigate('Live');
                    },
                }}
                plugins={[ZIM]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
