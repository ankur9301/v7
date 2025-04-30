// import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
// import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
// import { Ionicons } from '@expo/vector-icons';
// import React, { useRef, useEffect, useState } from 'react';
// import MapboxGL from '@react-native-mapbox-gl/maps';
// import { MAPBOX_TOKEN } from '@env';

// // TODO: set your Mapbox access token (or via environment variables)
// // MapboxGL.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN');
// MapboxGL.setAccessToken(MAPBOX_TOKEN);

// const { width, height } = Dimensions.get('window');

// const JogTracker: React.FC = () => {
//   const { isDarkMode } = useTheme();
//   const colors = isDarkMode ? darkTheme : lightTheme;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>      
//       {/* Map View */}
//       <MapboxGL.MapView
//         styleURL={MapboxGL.StyleURL.Street}
//         style={styles.map}
//         compassEnabled={true}
//         logoEnabled={false}
//         pitchEnabled={false}
//         rotateEnabled={false}
//       >
//         <MapboxGL.Camera
//           zoomLevel={14}
//           followUserLocation={true}
//           followUserMode={MapboxGL.UserTrackingModes.Follow}
//         />
//         <MapboxGL.UserLocation visible={true} />
//       </MapboxGL.MapView>

//       {/* Start Button */}
//       <TouchableOpacity
//         style={[styles.startButton, { backgroundColor: isDarkMode ? '#FF9500' : '#6366F1' }]}
//         onPress={() => {
//           // TODO: handle start tracking
//           console.log('Start pressed');
//         }}
//       >
//         <Ionicons name="play" size={28} color="#fff" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//     width,
//     height,
//   },
//   startButton: {
//     position: 'absolute',
//     bottom: 40,
//     alignSelf: 'center',
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
// });

// export default JogTracker;
