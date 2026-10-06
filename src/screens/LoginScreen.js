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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function LoginScreen({ onLoginSuccess, onNavigateToSignUp }) {
  const [activeTab, setActiveTab] = useState('signIn'); // 'signIn' | 'signUp'
  const [accessLevel, setAccessLevel] = useState('Resident / Parent'); // 'Resident / Parent' | 'Health Worker / Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle User Sign In
  const handleSignIn = async () => {
    if (!email || !password) {
      const msg = 'Please enter both your email address and password.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Missing Fields', msg);
      return;
    }

    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          if (Platform.OS === 'web') window.alert(`Login Failed: ${error.message}`);
          else Alert.alert('Login Failed', error.message);
        } else if (data?.user) {
          if (onLoginSuccess) onLoginSuccess(data.user, accessLevel);
        }
      } else {
        // Fallback demo mode if Supabase isn't connected
        if (onLoginSuccess) onLoginSuccess({ email: email }, accessLevel);
      }
    } catch (err) {
      const errMsg = err.message || 'An unexpected error occurred during sign in.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPassword = async () => {
    if (!email) {
      const msg = 'Please enter your email address in the field above first, then click "Forgot Password?".';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Email Required', msg);
      return;
    }

    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

        if (error) {
          if (Platform.OS === 'web') window.alert(`Error: ${error.message}`);
          else Alert.alert('Error', error.message);
        } else {
          const successMsg = `A password reset link has been sent to ${email}. Please check your inbox.`;
          if (Platform.OS === 'web') window.alert(successMsg);
          else Alert.alert('Password Reset Sent', successMsg);
        }
      } else {
        const demoMsg = `Password reset instructions simulated for ${email}.`;
        if (Platform.OS === 'web') window.alert(demoMsg);
        else Alert.alert('Reset Email Sent', demoMsg);
      }
    } catch (err) {
      const errMsg = err.message || 'Could not send reset password email.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={styles.centerWrapper}>
        {/* Header Icon & Title */}
        <View style={styles.headerBox}>
          <Text style={styles.logoEmoji}>🏢</Text>
          <Text style={styles.headerTitle}>Barangay Visayan Village</Text>
          <Text style={styles.headerSubtitle}>
            Health Center Management Information System
          </Text>
        </View>

        {/* Outer Form Card */}
        <View style={styles.card}>
          {/* Sign In / Create Account Top Tab Switcher */}
          <View style={styles.topTabContainer}>
            <TouchableOpacity
              style={[
                styles.topTabButton,
                activeTab === 'signIn' && styles.activeTopTabButton,
              ]}
              onPress={() => setActiveTab('signIn')}
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
              onPress={() => {
                setActiveTab('signUp');
                if (onNavigateToSignUp) onNavigateToSignUp();
              }}
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

          {/* Password Input with Show/Hide Toggle */}
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

          {/* Forgot Password Action Link */}
          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Main Action Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Access Health Portal</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Sign-Up Link */}
          <TouchableOpacity
            style={styles.signUpLinkContainer}
            onPress={() => {
              if (onNavigateToSignUp) onNavigateToSignUp();
            }}
          >
            <Text style={styles.signUpLinkText}>
              Don't have an account yet?{' '}
              <Text style={styles.signUpBoldText}>Sign Up here</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Caption */}
        <Text style={styles.footerCaption}>
          Official DOH / Local Health Center Electronic System
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 42,
    marginBottom: 6,
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
    justify: 'center',
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
    marginBottom: 8,
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