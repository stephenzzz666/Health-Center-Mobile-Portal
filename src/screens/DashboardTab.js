import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Safely attempt to import Supabase
let supabase;
try {
  supabase = require('../../supabase').supabase || require('../supabase').supabase;
} catch (e) {
  try {
    supabase = require('../supabase').supabase;
  } catch (err) {
    console.log('Supabase import warning in DashboardTab:', err.message);
  }
}

// Safely set notification handler
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.log('Notification handler init error:', e);
}

export default function DashboardTab({
  userName, // Dynamically passed from auth session
  userRole = 'patient',
  role,
  isAdmin = false,
  myToken = 'A-015',
  appointmentsCount = 0,
  childrenCount = 1,
  onNavigate,
}) {
  const [currentServing, setCurrentServing] = useState(12);
  const myTokenNum = parseInt(myToken.replace(/[^0-9]/g, ''), 10) || 15;
  const notifiedRef = useRef(false);

  // Check if logged-in user is Admin/Staff
  const activeRole = role || userRole;
  const isStaffOrAdmin =
    isAdmin === true ||
    activeRole === 'admin' ||
    activeRole === 'staff';

  // Fallback greeting names based on active role
  const displayName =
    userName || (isStaffOrAdmin ? 'Barangay Health Center Admin' : 'Resident User');

  useEffect(() => {
    // Only subscribe to live ticket alerts if user is a resident
    if (!isStaffOrAdmin) {
      registerForPushNotifications();
      fetchCurrentQueue();

      let channel;
      if (supabase) {
        try {
          channel = supabase
            .channel('public:queues_dashboard')
            .on(
              'postgres_changes',
              { event: 'UPDATE', schema: 'public', table: 'queues', filter: 'id=eq.1' },
              (payload) => {
                if (payload.new && payload.new.consult_num !== undefined) {
                  const newServing = payload.new.consult_num;
                  setCurrentServing(newServing);
                  checkAndTriggerNotification(newServing);
                }
              }
            )
            .subscribe();
        } catch (err) {
          console.log('Realtime subscription error:', err);
        }
      }

      return () => {
        if (supabase && channel) {
          try {
            supabase.removeChannel(channel);
          } catch (e) {}
        }
      };
    }
  }, [isStaffOrAdmin]);

  const registerForPushNotifications = async () => {
    try {
      if (Platform.OS === 'web') return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    } catch (err) {
      console.log('Error requesting notification permissions:', err);
    }
  };

  const fetchCurrentQueue = async () => {
    try {
      if (supabase) {
        const { data } = await supabase
          .from('queues')
          .select('consult_num')
          .eq('id', 1)
          .single();

        if (data && data.consult_num !== undefined) {
          setCurrentServing(data.consult_num);
          checkAndTriggerNotification(data.consult_num);
        }
      }
    } catch (err) {
      console.log('Error fetching dashboard queue:', err);
    }
  };

  const checkAndTriggerNotification = (servingNum) => {
    if (servingNum === myTokenNum && !notifiedRef.current) {
      notifiedRef.current = true;

      // In-App Alert Popup
      Alert.alert(
        '🚨 YOUR TURN!',
        `Ticket ${myToken} is now being served! Please proceed to Counter 1 immediately.`,
        [{ text: 'OK' }]
      );

      // Mobile Push Notification
      sendPushNotification();
    }
  };

  const sendPushNotification = async () => {
    try {
      if (Platform.OS === 'web') return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 YOUR QUEUE TICKET IS NOW SERVING!',
          body: `Ticket ${myToken} is now being called! Please proceed immediately to Counter 1.`,
          sound: 'default',
          vibrate: [0, 250, 250, 250],
        },
        trigger: null,
      });
    } catch (err) {
      console.log('Push notification trigger error:', err);
    }
  };

  const formattedServing = String(currentServing).padStart(3, '0');
  const estWait = Math.max(0, (myTokenNum - currentServing) * 5);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Welcome Greeting Header */}
      <Text style={styles.welcomeText}>Welcome back,</Text>
      <Text style={styles.userName}>{displayName}</Text>
      <Text style={styles.userSubtitle}>
        {isStaffOrAdmin ? 'Barangay Health Center Administrator' : 'Barangay Resident Health Profile'}
      </Text>

      {/* ADMIN HOMEPAGE VIEW */}
      {isStaffOrAdmin ? (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Admin Dashboard Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => onNavigate && onNavigate('LiveQueue')}
            >
              <Ionicons name="people-outline" size={28} color="#0f172a" />
              <Text style={styles.actionTitle}>Queue Control</Text>
              <Text style={styles.actionSub}>Call next ticket counter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => onNavigate && onNavigate('Visits')}
            >
              <Ionicons name="calendar-outline" size={28} color="#0f172a" />
              <Text style={styles.actionTitle}>View Bookings</Text>
              <Text style={styles.actionSub}>Review resident appointments</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* RESIDENT HOMEPAGE VIEW */
        <>
          {/* Daily Queue Token Dark Card */}
          <View
            style={[
              styles.tokenBanner,
              currentServing === myTokenNum && styles.tokenBannerActive,
            ]}
          >
            <View style={styles.bannerHeader}>
              <Text style={styles.tokenLabel}>Daily Queue Token</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>Live Status</Text>
              </View>
            </View>

            <Text style={styles.tokenValue}>{myToken}</Text>

            <Text style={styles.servingInfo}>
              Current Queue Serving: #{formattedServing} | Est. Wait: ~{estWait} mins
            </Text>

            {currentServing === myTokenNum && (
              <View style={styles.activeNotice}>
                <Ionicons name="megaphone" size={16} color="#ffffff" />
                <Text style={styles.activeNoticeText}>
                  IT IS YOUR TURN! Please proceed to Counter 1.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => onNavigate && onNavigate('BookVisit')}
            >
              <Ionicons name="calendar-outline" size={28} color="#0f172a" />
              <Text style={styles.actionTitle}>Book Visit</Text>
              <Text style={styles.actionSub}>Schedule consultation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => onNavigate && onNavigate('NewChild')}
            >
              <Ionicons name="person-add-outline" size={28} color="#0f172a" />
              <Text style={styles.actionTitle}>+ New Child</Text>
              <Text style={styles.actionSub}>Register newborn record</Text>
            </TouchableOpacity>
          </View>

          {/* Overview Summary Section */}
          <Text style={styles.sectionTitle}>Overview Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{appointmentsCount}</Text>
              <Text style={styles.summaryLabel}>My Appointments</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{childrenCount}</Text>
              <Text style={styles.summaryLabel}>Registered Children</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
  },
  welcomeText: {
    fontSize: 13,
    color: '#64748b',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  userSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 16,
  },
  adminSection: {
    marginTop: 8,
  },
  tokenBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tokenBannerActive: {
    backgroundColor: '#15803d',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  liveBadge: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  liveBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  tokenValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 6,
  },
  servingInfo: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  activeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  activeNoticeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  actionSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#16a34a',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
});