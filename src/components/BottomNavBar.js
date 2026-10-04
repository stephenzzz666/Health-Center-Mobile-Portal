import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNavBar({ activeTab, setActiveTab, setScreen }) {
  const tabs = [
    { key: 'dashboard', label: 'Home', icon: 'home-outline' },
    { key: 'queue', label: 'Live Queue', icon: 'list-outline' },
    { key: 'children', label: 'Children', icon: 'person-outline' },
    { key: 'appointments', label: 'Visits', icon: 'calendar-outline' },
  ];

  return (
    <View style={styles.bottomNavContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => {
              setScreen('main');
              setActiveTab(tab.key);
            }}
          >
            <Ionicons name={tab.icon} size={22} color={isActive ? '#16a34a' : '#64748b'} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navItemActive: { borderTopWidth: 2, borderTopColor: '#16a34a' },
  navLabel: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '500' },
  navLabelActive: { color: '#16a34a', fontWeight: '700' },
});