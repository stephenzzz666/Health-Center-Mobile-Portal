import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function LoginScreen({ setName, setRole, setScreen, setActiveTab }) {
  const [activeTab, setActiveAuthTab] = useState('signIn'); // 'signIn' | 'signUp'
  const [accessLevel, setAccessLevel] = useState('Resident / Parent');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const notify = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // 1. SIGN IN (Updated with explicit role separation)
  const handleSignIn = async () => {
    if (!email || !password) {
      notify('Missing Fields', 'Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          notify('Login Failed', error.message);
        } else if (data?.user) {
          const userMeta = data.user.user_metadata || {};
          const userName = userMeta.full_name || fullName || email.split('@')[0];
          const lowerName = userName.toLowerCase();
          const lowerEmail = email.toLowerCase();

          // Explicit Admin Check: Match Francis or explicit admin metadata/toggles
          const isFrancisAdmin = lowerName.includes('francis') || lowerEmail.includes('francis');
          const isExplicitAdminMeta = userMeta.role === 'admin' || userMeta.role === 'staff';
          
          let finalRole = 'patient';
          if (isFrancisAdmin || isExplicitAdminMeta || accessLevel === 'Health Worker / Admin') {
            finalRole = 'admin';
          }

          if (setName) setName(userName);
          if (setRole) setRole(finalRole);
          if (setActiveTab) setActiveTab('dashboard');
          if (setScreen) setScreen('main');
        }
      } else {
        notify('Config Error', 'Supabase client is not initialized.');
      }
    } catch (err) {
      notify('Error', err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  // 2. CREATE ACCOUNT (SIGN UP)
  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      notify('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      notify('Password Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (supabase && supabase.auth) {
        const selectedRole = accessLevel === 'Resident / Parent' ? 'patient' : 'admin';
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: selectedRole,
              access_level: accessLevel,
            },
          },
        });

        if (error) {
          notify('Sign Up Failed', error.message);
        } else {
          notify('Success', 'Account created successfully! You can now sign in.');
          setActiveAuthTab('signIn');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        notify('Config Error', 'Supabase client is not initialized.');
      }
    } catch (err) {
      notify('Error', err.message || 'An unexpected error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  // 3. FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email) {
      notify('Email Required', 'Please enter your email address in the field above first.');
      return;
    }

    setLoading(true);
    try {
      if (supabase && supabase.auth) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

        if (error) {
          notify('Reset Error', error.message);
        } else {
          notify('Email Sent', `Password reset link sent to ${email}. Check your inbox.`);
        }
      }
    } catch (err) {
      notify('Error', err.message || 'Could not send reset password email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView contentContainerStyle={styles.centerWrapper}>
        <View style={styles.headerBox}>
          <Ionicons name="business-sharp" size={32} color="#15803d" />
          <Text style={styles.headerTitle}>Barangay Visayan Village</Text>
          <Text style={styles.headerSubtitle}>
            Health Center Management Information System
          </Text>
        </View>

        <View style={styles.card}>
          {/* Switcher Tabs */}
          <View style={styles.topTabContainer}>
            <TouchableOpacity
              style={[
                styles.topTabButton,
                activeTab === 'signIn' && styles.activeTopTabButton,
              ]}
              onPress={() => setActiveAuthTab('signIn')}
            >
              <Text
                style={[
                  styles.topTabText,
                  activeTab === 'signIn' && styles.activeTopTabText,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.topTabButton,
                activeTab === 'signUp' && styles.activeTopTabButton,
              ]}
              onPress={() => setActiveAuthTab('signUp')}
            >
              <Text
                style={[
                  styles.topTabText,
                  activeTab === 'signUp' && styles.activeTopTabText,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Access Level Selector */}
          <Text style={styles.label}>Select Access Level</Text>
          <View style={styles.accessLevelContainer}>
            <TouchableOpacity
              style={[
                styles.accessLevelBtn,
                accessLevel === 'Resident / Parent' && styles.accessLevelBtnActive,
              ]}
              onPress={() => setAccessLevel('Resident / Parent')}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={accessLevel === 'Resident / Parent' ? '#16a34a' : '#64748b'}
              />
              <Text
                style={[
                  styles.accessLevelText,
                  accessLevel === 'Resident / Parent' && styles.accessLevelTextActive,
                ]}
              >
                Resident / Parent
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accessLevelBtn,
                accessLevel === 'Health Worker / Admin' && styles.accessLevelBtnActive,
              ]}
              onPress={() => setAccessLevel('Health Worker / Admin')}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={
                  accessLevel === 'Health Worker / Admin' ? '#16a34a' : '#64748b'
                }
              />
              <Text
                style={[
                  styles.accessLevelText,
                  accessLevel === 'Health Worker / Admin' &&
                    styles.accessLevelTextActive,
                ]}
              >
                Health Worker / Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Input (Create Account Only) */}
          {activeTab === 'signUp' && (
            <>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Juan Dela Cruz"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
              />
            </>
          )}

          {/* Email Address Input */}
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. resident@domain.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password Input */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIconButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input (Create Account Only) */}
          {activeTab === 'signUp' && (
            <>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </>
          )}

          {/* Forgot Password Link (Sign In Only) */}
          {activeTab === 'signIn' && (
            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={activeTab === 'signIn' ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {activeTab === 'signIn' ? 'Access Health Portal' : 'Register Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Switcher Footer Link */}
          <TouchableOpacity
            style={styles.signUpLinkContainer}
            onPress={() => setActiveAuthTab(activeTab === 'signIn' ? 'signUp' : 'signIn')}
          >
            <Text style={styles.signUpLinkText}>
              {activeTab === 'signIn' ? (
                <>
                  Don't have an account yet?{' '}
                  <Text style={styles.signUpBoldText}>Sign Up here</Text>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Text style={styles.signUpBoldText}>Sign In here</Text>
                </>
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerCaption}>
          Official DOH / Local Health Center Electronic System
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  topTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  topTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTopTabButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  topTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTopTabText: {
    color: '#16a34a',
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  accessLevelContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  accessLevelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  accessLevelBtnActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  accessLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  accessLevelTextActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 16,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeIconButton: {
    paddingHorizontal: 12,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 18,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  signUpLinkContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  signUpLinkText: {
    fontSize: 12,
    color: '#16a34a',
  },
  signUpBoldText: {
    fontWeight: '700',
  },
  footerCaption: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 20,
    textAlign: 'center',
  },
});