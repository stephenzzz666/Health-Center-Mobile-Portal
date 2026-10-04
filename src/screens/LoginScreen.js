import React from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ name, setName, role, setRole, setScreen, setActiveTab }) {
  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.loginCard}>
        <View style={styles.loginHeaderBox}>
          <Ionicons name="business-outline" size={42} color="#0f172a" style={{ marginBottom: 8 }} />
          <Text style={styles.loginTitle}>Barangay Visayan Village</Text>
          <Text style={styles.loginSubtitle}>Health Center Management Information System</Text>
        </View>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'patient' && styles.roleBtnActive]}
            onPress={() => setRole('patient')}
          >
            <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>Resident / Parent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
            onPress={() => setRole('admin')}
          >
            <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>Staff / Admin</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Account User Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Full Name..."
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            setScreen('main');
            setActiveTab('dashboard');
          }}
        >
          <Text style={styles.primaryButtonText}>Access Portal</Text>
        </TouchableOpacity>

        <View style={styles.loginFooter}>
          <Text style={styles.footerText}>Official DOH / Local Health Center Electronic System</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginContainer: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', padding: 20 },
  loginCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, elevation: 4 },
  loginHeaderBox: { alignItems: 'center', marginBottom: 20 },
  loginTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  loginSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 },
  roleContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 8, padding: 4, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  roleBtnActive: { backgroundColor: '#ffffff', elevation: 1 },
  roleText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  roleTextActive: { color: '#16a34a', fontWeight: '700' },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 14, color: '#0f172a' },
  primaryButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  loginFooter: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#94a3b8' },
});