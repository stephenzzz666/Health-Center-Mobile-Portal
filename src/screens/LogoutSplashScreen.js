import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LogoutSplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />
      <View style={styles.splashContent}>
        <View style={styles.iconWrapper}>
          <Ionicons name="heart-outline" size={64} color="#ffffff" />
        </View>
        <Text style={styles.splashTitle}>Barangay Visayan Village</Text>
        <Text style={styles.splashSubtitle}>Signing out safely...</Text>
        <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 24 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 50,
  },
  splashTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
    marginTop: 6,
    textAlign: 'center',
  },
});