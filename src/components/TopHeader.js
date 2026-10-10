import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopHeader({ role, setScreen, onLogout }) {
  const isAdmin = role === 'admin' || role === 'staff';

  return (
    <View style={styles.headerContainer}>
      {/* Left Logo & Role Badge Section */}
      <View style={styles.logoRow}>
        <Ionicons name="business" size={22} color="#16a34a" />
        <Text style={styles.appName}>Barangay Visayan Village</Text>

        {/* Dynamic Role Indicator Badge */}
        <View style={[styles.roleBadge, isAdmin ? styles.adminBadge : styles.residentBadge]}>
          <Text style={[styles.roleBadgeText, isAdmin ? styles.adminBadgeText : styles.residentBadgeText]}>
            {isAdmin ? 'ADMIN PORTAL' : 'RESIDENT'}
          </Text>
        </View>
      </View>

      {/* Right Log Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={16} color="#dc2626" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 4,
  },
  adminBadge: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  adminBadgeText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  residentBadge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  residentBadgeText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
});