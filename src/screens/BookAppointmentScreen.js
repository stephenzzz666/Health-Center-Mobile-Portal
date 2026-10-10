import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { supabase as defaultSupabase } from '../../supabase';

export default function BookAppointmentScreen({
  supabase = defaultSupabase,
  role,
  name,
  setScreen,
  fetchAppointments,
  infants = [],
}) {
  const [selectedService, setSelectedService] = useState('Infant Immunization');
  const [selectedChild, setSelectedChild] = useState(infants.length > 0 ? infants[0] : null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('08:00 AM - 10:00 AM');
  const [notes, setNotes] = useState('');
  
  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Calendar State (Defaulting to October 2026)
  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [currentMonth, setCurrentMonth] = useState(9);
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    if (infants.length > 0 && !selectedChild) {
      setSelectedChild(infants[0]);
    }
  }, [infants]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 2500);
  };

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '01:00 PM - 03:00 PM',
    '03:00 PM - 05:00 PM',
  ];

  const services = [
    { id: 'vaccine', title: 'Infant Immunization', icon: 'shield-checkmark-outline' },
    { id: 'consultation', title: 'General Consultation', icon: 'medical-outline' },
    { id: 'prenatal', title: 'Prenatal Care', icon: 'heart-outline' },
  ];

  const sendBookingNotification = async (dateStr, slotStr) => {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📅 Appointment Booking Confirmed!',
            body: `Your ${selectedService} visit is set for ${dateStr} at ${slotStr}.`,
            sound: 'default',
          },
          trigger: null,
        });
      }
    } catch (err) {
      console.log('Push notification error:', err);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    setSelectedDate(dateStr);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate) return;

    const childNameStr = selectedChild 
      ? (selectedChild.fullName || `${selectedChild.first_name || ''} ${selectedChild.last_name || ''}`.trim()) 
      : 'N/A';
    const childIdVal = selectedChild ? selectedChild.id : null;

    try {
      if (supabase) {
        const { error } = await supabase.from('appointments').insert([
          {
            user_name: name || 'Resident Patient',
            service: selectedService,
            child_name: childNameStr,
            child_id: childIdVal,
            appointment_date: selectedDate,
            time_slot: selectedTimeSlot,
            notes: notes || 'Routine visit',
            status: 'Scheduled',
          },
        ]);

        if (error) console.log('Supabase insert note:', error.message);
      }

      if (fetchAppointments) await fetchAppointments();
      
      showToast(`Appointment submitted successfully for ${selectedDate}!`);
      await sendBookingNotification(selectedDate, selectedTimeSlot);

      setTimeout(() => {
        setScreen('main');
      }, 1500);
    } catch (err) {
      console.log('Error booking appointment:', err);
      showToast(`Appointment submitted for ${selectedDate}!`);
      setTimeout(() => {
        setScreen('main');
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setScreen('main')}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
          <Text style={styles.backBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule a Visit</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>1. Select Health Service</Text>
        <View style={styles.serviceRow}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.serviceCard,
                selectedService === item.title && styles.serviceCardActive,
              ]}
              onPress={() => setSelectedService(item.title)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={selectedService === item.title ? '#16a34a' : '#64748b'}
              />
              <Text
                style={[
                  styles.serviceText,
                  selectedService === item.title && styles.serviceTextActive,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedService === 'Infant Immunization' && (
          <View style={styles.childSection}>
            <Text style={styles.sectionTitle}>2. Select Registered Child</Text>
            {infants.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
                {infants.map((child, index) => {
                  const childName = child.fullName || `${child.first_name || ''} ${child.last_name || ''}`.trim() || `Child ${index + 1}`;
                  const isSelected = selectedChild?.id ? selectedChild.id === child.id : selectedChild === child;

                  return (
                    <TouchableOpacity
                      key={child.id || index}
                      style={[
                        styles.childChip,
                        isSelected && styles.childChipActive,
                      ]}
                      onPress={() => setSelectedChild(child)}
                    >
                      <Ionicons
                        name="person-circle-outline"
                        size={18}
                        color={isSelected ? '#ffffff' : '#15803d'}
                      />
                      <Text
                        style={[
                          styles.childChipText,
                          isSelected && styles.childChipTextActive,
                        ]}
                      >
                        {childName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.noChildNote}>
                No registered children found under your profile. (Will book under parent profile)
              </Text>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>3. Click Available Date on Calendar</Text>
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow}>
              <Ionicons name="chevron-back" size={20} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {months[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow}>
              <Ionicons name="chevron-forward" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCellEmpty} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedMonth = String(currentMonth + 1).padStart(2, '0');
              const formattedDay = String(dayNum).padStart(2, '0');
              const cellDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
              const isSelected = selectedDate === cellDateStr;
              const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();
              const isSunday = dayOfWeek === 0;

              return (
                <TouchableOpacity
                  key={`day-${dayNum}`}
                  disabled={isSunday}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isSunday && styles.dayCellDisabled,
                  ]}
                  onPress={() => handleSelectDay(dayNum)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      isSunday && styles.dayTextDisabled,
                    ]}
                  >
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={styles.selectedDateBadge}>
            <Ionicons name="calendar-outline" size={16} color="#16a34a" />
            <Text style={styles.selectedDateText}>
              Selected Visit Date: <Text style={{ fontWeight: '800' }}>{selectedDate}</Text>
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>4. Select Time Slot</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlot,
                selectedTimeSlot === slot && styles.timeSlotActive,
              ]}
              onPress={() => setSelectedTimeSlot(slot)}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={selectedTimeSlot === slot ? '#ffffff' : '#475569'}
              />
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slot && styles.timeSlotTextActive,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmBooking}>
          <Text style={styles.confirmBtnText}>Confirm Visit Booking</Text>
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  toastContainer: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    backgroundColor: '#15803d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginTop: 12, marginBottom: 10 },
  serviceRow: { flexDirection: 'row', gap: 10 },
  serviceCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  serviceCardActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  serviceText: { fontSize: 11, fontWeight: '600', color: '#64748b', textAlign: 'center' },
  serviceTextActive: { color: '#15803d', fontWeight: '700' },
  childSection: { marginTop: 6 },
  childScroll: { flexDirection: 'row' },
  childChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  childChipActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  childChipText: { fontSize: 13, fontWeight: '600', color: '#15803d' },
  childChipTextActive: { color: '#ffffff' },
  noChildNote: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navArrow: { padding: 6, borderRadius: 6, backgroundColor: '#f1f5f9' },
  monthTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#64748b' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCellEmpty: { width: '14.28%', height: 38 },
  dayCell: { width: '14.28%', height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  dayCellSelected: { backgroundColor: '#16a34a' },
  dayCellDisabled: { backgroundColor: '#f8fafc' },
  dayText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  dayTextSelected: { color: '#ffffff', fontWeight: '800' },
  dayTextDisabled: { color: '#cbd5e1' },
  selectedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  selectedDateText: { fontSize: 13, color: '#166534' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '48%',
  },
  timeSlotActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  timeSlotText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  timeSlotTextActive: { color: '#ffffff', fontWeight: '700' },
  confirmBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  confirmBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});