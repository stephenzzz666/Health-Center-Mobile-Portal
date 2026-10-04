import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopHeader({ role, setScreen }) {
  return (
    <View style={styles.topHeader}>
      <View>
        <Text style={styles.headerPortalTitle}>BRGY. VISAYAN VILLAGE</Text>
        <Text style={styles.headerPortalSub}>Health Center Portal</Text>
      </View>
      <View style={styles.headerRightGroup}>
        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>{role === 'admin' ? 'STAFF' : 'RESIDENT'}</Text>
        </View>
        <TouchableOpacity onPress={() => setScreen('login')} style={styles.logoutIconButton}>
          <Ionicons name="log-out-outline" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerPortalTitle: { fontSize: 13, fontWeight: '800', color: '#16a34a', letterSpacing: 0.5 },
  headerPortalSub: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  userBadgeText: { fontSize: 10, fontWeight: '700', color: '#15803d' },
  logoutIconButton: { padding: 4 },
});