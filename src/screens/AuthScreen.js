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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

export default function AuthScreen({ onLoginSuccess, onNavigateToSignUp }) {
  const [activeTab, setActiveTab] = useState('signIn'); // 'signIn' | 'signUp'
  const [accessLevel, setAccessLevel] = useState('Resident / Parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // In-app notification state
  const [message, setMessage] = useState(null); // { type: 'error' | 'success', text: string }

  const showNotification = (type, text) => {
    setMessage({ type, text });
  };

  const clearNotification = () => {
    setMessage(null);
  };

  // Handle User Sign In
  const handleSignIn = async () => {
    clearNotification();
    if (!email || !password) {
      showNotification('error', 'Please enter both your email address and password.');
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
          showNotification('error', `Login Failed: ${error.message}`);
        } else if (data?.user) {
          if (onLoginSuccess) onLoginSuccess(data.user, accessLevel);
        }
      } else {
        if (onLoginSuccess) onLoginSuccess({ email: email }, accessLevel);
      }
    } catch (err) {
      showNotification('error', err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Action
  const handleForgotPassword = async () => {
    clearNotification();
    if (!email) {
      showNotification(
        'error',
        'Please enter your email address in the field above first, then click "Forgot Password?".'
      );
      return;
    }

    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

        if (error) {
          showNotification('error', error.message);
        } else {
          showNotification(
            'success',
            `A password reset link has been sent to ${email}. Please check your inbox.`
          );
        }
      } else {
        showNotification(
          'success',
          `Password reset email simulated for ${email}. Check your inbox.`
        );
      }
    } catch (err) {
      showNotification('error', err.message || 'Could not send reset password email.');
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
          <View style={styles.iconCircle}>
            <Ionicons name="business-outline" size={42} color="#0f172a" />
          </View>
          <Text style={styles.headerTitle}>Barangay Visayan Village</Text>
          <Text style={styles.headerSubtitle}>
            Health Center Management Information System
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.card}>
          {/* Sign In / Create Account Switcher */}
          <View style={styles.topTabContainer}>
            <TouchableOpacity
              style={[
                styles.topTabButton,
                activeTab === 'signIn' && styles.activeTopTabButton,
              ]}
              onPress={() => {
                setActiveTab('signIn');
                clearNotification();
              }}
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
                clearNotification();
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

          {/* Inline Custom Notification Banner */}
          {message && (
            <View
              style={[
                styles.alertBanner,
                message.type === 'error' ? styles.alertError : styles.alertSuccess,
              ]}
            >
              <Ionicons
                name={
                  message.type === 'error'
                    ? 'alert-circle-outline'
                    : 'checkmark-circle-outline'
                }
                size={18}
                color={message.type === 'error' ? '#dc2626' : '#16a34a'}
              />
              <Text
                style={[
                  styles.alertText,
                  message.type === 'error' ? styles.alertTextError : styles.alertTextSuccess,
                ]}
              >
                {message.text}
              </Text>
              <TouchableOpacity onPress={clearNotification} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close-outline" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}

          {/* Access Level Picker */}
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

          {/* Email Address */}
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. resident@domain.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (message) clearNotification();
            }}
          />

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (message) clearNotification();
              }}
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

          {/* FORGOT PASSWORD LINK */}
          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
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

          {/* Bottom Link */}
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
  iconCircle: {
    marginBottom: 8,
    alignItems: 'center',
    justify: 'center',
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  alertError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  alertTextError: {
    color: '#991b1b',
  },
  alertTextSuccess: {
    color: '#166534',
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
    marginBottom: 16,
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
});