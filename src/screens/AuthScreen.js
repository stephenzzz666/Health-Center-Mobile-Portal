import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function AuthScreen({ setScreen, setActiveTab, setRole, setName }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Error Banner & Field States
  const [errorMessage, setErrorMessage] = useState('');
  const [apiEmailError, setApiEmailError] = useState('');
  const [apiPasswordError, setApiPasswordError] = useState('');

  const [touched, setTouched] = useState({ fullName: false, email: false, password: false });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('patient');

  // Real-time Validation Checks
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isNameValid = fullName.trim().length > 0;

  // Error Visibility Conditions
  const showEmailError = (touched.email && !isEmailValid) || !!apiEmailError;
  const showPasswordError = (touched.password && !isPasswordValid) || !!apiPasswordError;
  const showNameError = isSignUp && touched.fullName && !isNameValid;

  const handleAuth = async () => {
    setErrorMessage('');
    setApiEmailError('');
    setApiPasswordError('');
    setTouched({ fullName: true, email: true, password: true });

    if (isSignUp && !isNameValid) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!isEmailValid) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (!supabase) {
          setErrorMessage('System error: Supabase client is not initialized.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName,
              role: selectedRole,
            },
          },
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('user already exists')) {
            setApiEmailError('User with this email already exists.');
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        // TRIGGER POPUP MODAL ON SUCCESSFUL ACCOUNT CREATION
        setShowSuccessModal(true);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          const msg = error.message.toLowerCase();
          
          if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
            setApiEmailError('Incorrect email or account does not exist.');
            setApiPasswordError('Incorrect password or user does not exist.');
            setErrorMessage('Invalid email or password. Please try again.');
          } else if (msg.includes('user not found')) {
            setApiEmailError('User account does not exist.');
            setErrorMessage('No account associated with this email.');
          } else {
            setErrorMessage(error.message || 'Login failed.');
          }
          return;
        }

        const userMetaData = data.user?.user_metadata || {};
        const userFullName = userMetaData.full_name || fullName || email.split('@')[0];
        const userRole = userMetaData.role || selectedRole;

        setName(userFullName);
        setRole(userRole);
        setScreen('main');
        setActiveTab('dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => {
    setErrorMessage('');
    setApiEmailError('');
    setApiPasswordError('');
  };

  // Called when user clicks "Proceed to Sign In" on the success modal
  const handleModalProceed = () => {
    setShowSuccessModal(false);
    setIsSignUp(false); // Switch view back to Sign In
    clearErrors();
    setPassword('');
    setFullName('');
    setTouched({ fullName: false, email: false, password: false });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Account Created Success Popup Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={68} color="#16a34a" />
            </View>
            <Text style={styles.modalTitle}>Account Created!</Text>
            <Text style={styles.modalSubtext}>
              Your account has been successfully registered. You can now sign in to access the health portal.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalProceed}>
              <Text style={styles.modalButtonText}>Proceed to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerBox}>
            <Ionicons name="business-outline" size={44} color="#16a34a" style={{ marginBottom: 6 }} />
            <Text style={styles.portalTitle}>Barangay Visayan Village</Text>
            <Text style={styles.portalSubtitle}>Health Center Management Information System</Text>
          </View>

          {/* On-Screen Top Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={22} color="#dc2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, !isSignUp && styles.tabBtnActive]}
              onPress={() => {
                setIsSignUp(false);
                clearErrors();
                setTouched({ fullName: false, email: false, password: false });
              }}
            >
              <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, isSignUp && styles.tabBtnActive]}
              onPress={() => {
                setIsSignUp(true);
                clearErrors();
                setTouched({ fullName: false, email: false, password: false });
              }}
            >
              <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Role Selector */}
          <Text style={styles.label}>Select Access Level</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleBtn, selectedRole === 'patient' && styles.roleBtnActive]}
              onPress={() => setSelectedRole('patient')}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={selectedRole === 'patient' ? '#16a34a' : '#64748b'}
              />
              <Text style={[styles.roleText, selectedRole === 'patient' && styles.roleTextActive]}>
                Resident / Parent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, selectedRole === 'admin' && styles.roleBtnActive]}
              onPress={() => setSelectedRole('admin')}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={selectedRole === 'admin' ? '#16a34a' : '#64748b'}
              />
              <Text style={[styles.roleText, selectedRole === 'admin' && styles.roleTextActive]}>
                Health Worker / Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Field (Sign Up Only) */}
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={[styles.inputWrapper, showNameError && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Maria Santos"
                  placeholderTextColor="#94a3b8"
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    clearErrors();
                    setTouched((prev) => ({ ...prev, fullName: true }));
                  }}
                  autoCapitalize="words"
                />
                {showNameError && (
                  <Ionicons name="alert-circle" size={20} color="#ef4444" style={styles.errorIcon} />
                )}
              </View>
              {showNameError && <Text style={styles.errorSubtext}>Full name is required.</Text>}
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={[styles.inputWrapper, showEmailError && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. resident@domain.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  clearErrors();
                  setTouched((prev) => ({ ...prev, email: true }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {showEmailError && (
                <Ionicons name="alert-circle" size={20} color="#ef4444" style={styles.errorIcon} />
              )}
            </View>
            {showEmailError && (
              <Text style={styles.errorSubtext}>
                {apiEmailError || 'Please enter a valid email address.'}
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={[styles.inputWrapper, showPasswordError && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  clearErrors();
                  setTouched((prev) => ({ ...prev, password: true }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
              {showPasswordError && (
                <Ionicons name="alert-circle" size={20} color="#ef4444" style={styles.errorIcon} />
              )}
            </View>
            {showPasswordError && (
              <Text style={styles.errorSubtext}>
                {apiPasswordError || 'Password must be at least 6 characters long.'}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleAuth} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? 'Register Account' : 'Access Health Portal'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Sign In / Sign Up */}
          <TouchableOpacity
            style={styles.toggleTextBtn}
            onPress={() => {
              setIsSignUp(!isSignUp);
              clearErrors();
              setTouched({ fullName: false, email: false, password: false });
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have an account? Sign In here'
                : "Don't have an account yet? Sign Up here"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Official DOH / Local Health Center Electronic System</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, elevation: 4 },
  headerBox: { alignItems: 'center', marginBottom: 16 },
  portalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  portalSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 4 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#dc2626' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconCircle: { marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  modalSubtext: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  modalButton: { backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  modalButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: '#ffffff', elevation: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#16a34a', fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  roleContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 10, borderRadius: 8, backgroundColor: '#f8fafc' },
  roleBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  roleText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  roleTextActive: { color: '#16a34a', fontWeight: '700' },
  inputGroup: { marginBottom: 14 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 1.5,
    backgroundColor: '#fff5f5',
    elevation: 2,
  },
  input: { flex: 1, paddingVertical: 12, color: '#0f172a' },
  eyeBtn: { paddingHorizontal: 6 },
  errorIcon: { marginLeft: 6 },
  errorSubtext: { fontSize: 11, color: '#ef4444', marginTop: 4, fontWeight: '600' },
  primaryButton: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  toggleTextBtn: { marginTop: 16, alignItems: 'center' },
  toggleText: { fontSize: 12, color: '#16a34a', fontWeight: '700' },
  footer: { marginTop: 24, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  footerText: { fontSize: 11, color: '#94a3b8' },
});