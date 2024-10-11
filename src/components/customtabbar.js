import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import Live from '../Tabs/live';
import Post from "../Tabs/post"

const { width } = Dimensions.get('window');

const CustomTabBar = (props) => {
  const { state, descriptors, navigation } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // Initialize Animated.Values for each tab's icon scaling
  const scaleValues = useRef(
    state.routes.map((route, index) => new Animated.Value(state.index === index ? 1.2 : 1))
  ).current;

  useEffect(() => {
    // Animate the scaling of the tab icons when the focused tab changes
    state.routes.forEach((route, index) => {
      Animated.timing(scaleValues[index], {
        toValue: state.index === index ? 1.2 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index, scaleValues, state.routes]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      // Close the menu with animation
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsMenuOpen(false));
    } else {
      // Open the menu with animation
      setIsMenuOpen(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Interpolations for "Post" button animation
  const postTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const postTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });

  const postOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const postScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Interpolations for "Live" button animation
  const liveTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const liveTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 70],
  });

  const liveOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const liveScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Interpolation for "Add" button rotation
  const addRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Interpolation for overlay opacity
  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <>
      {/* Overlay to darken the background when menu is open */}
      {isMenuOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            if (route.name === 'Add') {
              toggleMenu();
            } else {
              if (isMenuOpen) {
                toggleMenu();
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }
          };

          // Get the icon from options
          const icon = options.tabBarIcon({ color: isFocused ? '#00FFFF' : 'white' });

          // Find the index of the current route
          const tabIndex = state.routes.findIndex((r) => r.key === route.key);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleValues[tabIndex] }] }}>
                {route.name === 'Add' ? (
                  <Animated.View style={{ transform: [{ rotate: addRotation }] }}>
                    {icon}
                  </Animated.View>
                ) : (
                  icon
                )}
              </Animated.View>
              <Text style={{ color: isFocused ? '#00FFFF' : 'white', fontSize: 12 }}>
                {options.tabBarLabel}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Floating Menu for "Post" and "Live" */}
        {isMenuOpen && (
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.menuContainer}>
              {/* "Post" Button */}
              <Animated.View
                style={[
                  styles.menuItem,
                  {
                    transform: [
                      { translateX: postTranslateX },
                      { translateY: postTranslateY },
                      { scale: postScale },
                    ],
                    opacity: postOpacity,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(Post);
                    toggleMenu();
                  }}
                  style={[styles.menuButton, styles.postButton]}
                  activeOpacity={0.7}
                >
                  <Image source={require('../../src/assets/post.png')} style={styles.menuIcon} />
                </TouchableOpacity>
              </Animated.View>

              {/* "Live" Button */}
              <Animated.View
                style={[
                  styles.menuItem,
                  {
                    transform: [
                      { translateX: liveTranslateX },
                      { translateY: liveTranslateY },
                      { scale: liveScale },
                    ],
                    opacity: liveOpacity,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate(Live);
                    toggleMenu();
                  }}
                  style={[styles.menuButton, styles.liveButton]}
                  activeOpacity={0.7}
                >
                  <Image source={require('../../src/assets/live.png')} style={styles.menuIcon} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: "rgba(0, 255, 255, 0.2)",
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 30, // Positioning above the tab bar
    left: '55%',
    transform: [{ translateX: -20 }], // Center the menu container horizontally
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    position: 'absolute',
  },
  menuButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6347', // Default color, overridden by specific buttons
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  postButton: {
    backgroundColor: '#2196F3', // Green color for "Post"
  },
  liveButton: {
    backgroundColor: 'red', // Blue color for "Live"
  },
  menuIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60, // Ensure it doesn't cover the tab bar
    backgroundColor: '#000',
    zIndex: 5,
  },
});

export default CustomTabBar;