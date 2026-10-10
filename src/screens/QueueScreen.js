import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { supabase } from '../../supabase';

// Configure how notifications present when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function QueueScreen({
  role = 'patient',
  consultNum = 14,
  setConsultNum,
  vaccineNum = 8,
  setVaccineNum,
  prenatalNum = 5,
  setPrenatalNum,
  myToken = 'A-015',
}) {
  const isAdmin = role === 'admin' || role === 'staff';
  const myTokenNum = parseInt(myToken.replace(/[^0-9]/g, ''), 10) || 15;
  
  // Ref to ensure we only trigger the notification once per turn
  const notifiedRef = useRef(false);

  useEffect(() => {
    // 1. Request Push Notification Permissions
    registerForPushNotificationsAsync();

    // 2. Fetch Initial Queue State
    fetchQueueFromSupabase();

    // 3. Subscribe to Realtime Updates
    let channel;
    if (supabase) {
      channel = supabase
        .channel('public:queues')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'queues', filter: 'id=eq.1' },
          (payload) => {
            if (payload.new) {
              const newConsult = payload.new.consult_num;
              if (newConsult !== undefined && setConsultNum) {
                setConsultNum(newConsult);
                checkAndTriggerNotification(newConsult);
              }
              if (payload.new.vaccine_num !== undefined && setVaccineNum) {
                setVaccineNum(payload.new.vaccine_num);
              }
              if (payload.new.prenatal_num !== undefined && setPrenatalNum) {
                setPrenatalNum(payload.new.prenatal_num);
              }
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Request permissions for notifications
  const registerForPushNotificationsAsync = async () => {
    try {
      if (Platform.OS === 'web') return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
      }
    } catch (e) {
      console.log('Error setting up notifications:', e);
    }
  };

  // Helper to trigger push notification when current serving matches user token
  const checkAndTriggerNotification = (currentServing) => {
    if (!isAdmin && currentServing === myTokenNum && !notifiedRef.current) {
      notifiedRef.current = true; // Mark as notified
      sendLocalPushNotification();
    }
  };

  const sendLocalPushNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 YOUR QUEUE TICKET IS NOW SERVING!',
          body: `Ticket ${myToken} is now being called! Please proceed immediately to Counter 1.`,
          sound: 'default',
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Send immediately
      });
    } catch (e) {
      console.log('Error triggering push notification:', e);
    }
  };

  const fetchQueueFromSupabase = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('queues')
          .select('*')
          .eq('id', 1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.log('Error fetching queue:', error.message);
        } else if (data) {
          if (data.consult_num !== undefined && setConsultNum) {
            setConsultNum(data.consult_num);
            checkAndTriggerNotification(data.consult_num);
          }
          if (data.vaccine_num !== undefined && setVaccineNum) setVaccineNum(data.vaccine_num);
          if (data.prenatal_num !== undefined && setPrenatalNum) setPrenatalNum(data.prenatal_num);
        }
      }
    } catch (err) {
      console.log('Queue fetch catch:', err);
    }
  };

  const syncQueueToSupabase = async (newConsult, newVaccine, newPrenatal) => {
    try {
      if (supabase) {
        const { error } = await supabase.from('queues').upsert({
          id: 1,
          consult_num: newConsult,
          vaccine_num: newVaccine,
          prenatal_num: newPrenatal,
          updated_at: new Date().toISOString(),
        });

        if (error) console.log('Supabase Queue Sync Error:', error.message);
      }
    } catch (err) {
      console.log('Queue sync catch:', err);
    }
  };

  const handleConsultChange = (newVal) => {
    const validVal = Math.max(1, newVal);
    if (setConsultNum) setConsultNum(validVal);
    syncQueueToSupabase(validVal, vaccineNum, prenatalNum);
  };

  const handleVaccineChange = (newVal) => {
    const validVal = Math.max(1, newVal);
    if (setVaccineNum) setVaccineNum(validVal);
    syncQueueToSupabase(consultNum, validVal, prenatalNum);
  };

  const handlePrenatalChange = (newVal) => {
    const validVal = Math.max(1, newVal);
    if (setPrenatalNum) setPrenatalNum(validVal);
    syncQueueToSupabase(consultNum, vaccineNum, validVal);
  };

  const formattedServing = `A-${String(consultNum || 12).padStart(3, '0')}`;
  const patientsAhead = Math.max(0, myTokenNum - (consultNum || 12));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Brgy. Visayan Village Health Center</Text>
        <Text style={styles.headerSubtitle}>Live Queue Management System</Text>
      </View>

      {/* Now Serving Display Card */}
      <View style={styles.nowServingCard}>
        <Text style={styles.cardLabel}>NOW SERVING</Text>
        <Text style={styles.nowServingNumber}>{formattedServing}</Text>
      </View>

      {/* RESIDENT / PATIENT VIEW: Ticket Status Card */}
      {!isAdmin && (
        <View style={styles.patientTicketCard}>
          <Text style={styles.patientLabel}>YOUR TICKET NUMBER</Text>
          <Text style={styles.patientToken}>{myToken}</Text>
          <Text style={styles.patientStatus}>
            {patientsAhead > 0
              ? `Status: ${patientsAhead} patient(s) ahead of you`
              : (consultNum || 12) === myTokenNum
              ? 'Status: It is your turn! Please proceed to Counter 1.'
              : 'Status: Your appointment has passed.'}
          </Text>
        </View>
      )}

      {/* ADMIN / STAFF VIEW ONLY: Queue Control Actions */}
      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.adminSectionTitle}>Admin / Staff Controls</Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.callNextBtn}
            onPress={() => handleConsultChange((consultNum || 12) + 1)}
          >
            <Ionicons name="megaphone-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.callNextBtnText}>Call Next Patient (+1)</Text>
          </TouchableOpacity>

          {/* Service Counter Management Cards */}
          <View style={styles.counterGrid}>
            {/* Consultation Counter */}
            <View style={styles.counterCard}>
              <Text style={styles.counterTitle}>General Consultation</Text>
              <Text style={styles.counterNumber}>A-{String(consultNum || 12).padStart(3, '0')}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handleConsultChange((consultNum || 12) - 1)}
                >
                  <Text style={styles.adjustBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handleConsultChange((consultNum || 12) + 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Immunization Counter */}
            <View style={styles.counterCard}>
              <Text style={styles.counterTitle}>Vaccination / Immunization</Text>
              <Text style={styles.counterNumber}>B-{String(vaccineNum || 8).padStart(3, '0')}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handleVaccineChange((vaccineNum || 8) - 1)}
                >
                  <Text style={styles.adjustBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handleVaccineChange((vaccineNum || 8) + 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Prenatal Counter */}
            <View style={styles.counterCard}>
              <Text style={styles.counterTitle}>Maternal & Prenatal</Text>
              <Text style={styles.counterNumber}>C-{String(prenatalNum || 5).padStart(3, '0')}</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handlePrenatalChange((prenatalNum || 5) - 1)}
                >
                  <Text style={styles.adjustBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => handlePrenatalChange((prenatalNum || 5) + 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
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
  headerBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  nowServingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 8,
  },
  nowServingNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#16a34a',
  },
  patientTicketCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  patientLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  patientToken: {
    fontSize: 40,
    fontWeight: '800',
    color: '#15803d',
    marginBottom: 8,
  },
  patientStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  adminSection: {
    marginTop: 8,
  },
  adminSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    textAlign: 'center',
  },
  callNextBtn: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 20,
  },
  callNextBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  counterGrid: {
    gap: 12,
  },
  counterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  counterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  counterNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#16a34a',
    marginVertical: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  adjustBtn: {
    backgroundColor: '#f1f5f9',
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  adjustBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
});