import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#15803d" />

      {/* Main Branding Graphic */}
      <View style={styles.brandBox}>
        <View style={styles.outerRing}>
          <View style={styles.iconBadge}>
            <Ionicons name="business" size={50} color="#15803d" />
          </View>
        </View>
        
        <Text style={styles.mainTitle}>Barangay Visayan Village</Text>
        <Text style={styles.subtitle}>Health Center Management Information System</Text>
      </View>

      {/* Footer Loading State */}
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#ffffff" style={styles.spinner} />
        <Text style={styles.loadingText}>Initializing Health Portal...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#15803d', // Primary Barangay Green
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  brandBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    padding: 10,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  iconBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#bbf7d0',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    maxWidth: 280,
  },
  footer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#f0fdf4',
    fontWeight: '600',
  },
  dohTagline: {
    fontSize: 10,
    color: '#86efac',
    marginTop: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});