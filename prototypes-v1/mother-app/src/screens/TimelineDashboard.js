import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';

const TimelineDashboard = ({ navigation }) => {
  const [currentPhase, setCurrentPhase] = useState('pregnancy'); // pregnancy, infant, toddler
  const [daysInJourney, setDaysInJourney] = useState(0);

  useEffect(() => {
    // Calculate days since conception
    const conceptionDate = new Date('2025-06-01'); // Example
    const today = new Date();
    const days = Math.floor((today - conceptionDate) / (1000 * 60 * 60 * 24));
    setDaysInJourney(days);

    if (days < 280) setCurrentPhase('pregnancy');
    else if (days < 645) setCurrentPhase('infant'); // 0-12 months
    else setCurrentPhase('toddler'); // 12-24 months
  }, []);

  const timelineData = [
    {
      time: 'Day 1-90',
      title: 'First Trimester',
      description: 'Critical neural development',
      circleColor: currentPhase === 'pregnancy' && daysInJourney < 90 ? '#4CAF50' : '#ccc',
      lineColor: '#ddd',
      icon: '🤰',
    },
    {
      time: 'Day 91-180',
      title: 'Second Trimester',
      description: 'Rapid growth phase',
      circleColor: currentPhase === 'pregnancy' && daysInJourney >= 90 && daysInJourney < 180 ? '#4CAF50' : '#ccc',
      lineColor: '#ddd',
      icon: '🤰',
    },
    {
      time: 'Day 181-280',
      title: 'Third Trimester',
      description: 'Final preparation',
      circleColor: currentPhase === 'pregnancy' && daysInJourney >= 180 ? '#4CAF50' : '#ccc',
      lineColor: '#ddd',
      icon: '🤰',
    },
    {
      time: 'Day 280',
      title: 'Birth',
      description: 'Welcome to the world!',
      circleColor: daysInJourney >= 280 ? '#FF9800' : '#ccc',
      lineColor: '#ddd',
      icon: '👶',
    },
    {
      time: 'Month 0-6',
      title: 'Exclusive Breastfeeding',
      description: 'Critical immunity building',
      circleColor: currentPhase === 'infant' && daysInJourney < 460 ? '#2196F3' : '#ccc',
      lineColor: '#ddd',
      icon: '🍼',
    },
    {
      time: 'Month 6-12',
      title: 'Complementary Feeding',
      description: 'Introduction to solid foods',
      circleColor: currentPhase === 'infant' && daysInJourney >= 460 ? '#2196F3' : '#ccc',
      lineColor: '#ddd',
      icon: '🥣',
    },
    {
      time: 'Month 12-24',
      title: 'Toddler Nutrition',
      description: 'Diverse diet for growth',
      circleColor: currentPhase === 'toddler' ? '#9C27B0' : '#ccc',
      lineColor: '#ddd',
      icon: '🍎',
    },
    {
      time: 'Day 1000',
      title: 'First 1,000 Days Complete',
      description: 'Foundation for life established',
      circleColor: daysInJourney >= 1000 ? '#4CAF50' : '#ccc',
      lineColor: '#ddd',
      icon: '🎉',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your First 1,000 Days Journey</Text>
        <View style={styles.progressCard}>
          <Text style={styles.dayCount}>{daysInJourney}</Text>
          <Text style={styles.dayLabel}>Days in Journey</Text>
          <Text style={styles.remaining}>{1000 - daysInJourney} days remaining</Text>
        </View>
      </View>

      <View style={styles.phaseIndicator}>
        <Text style={styles.phaseLabel}>Current Phase:</Text>
        <Text style={styles.phaseValue}>
          {currentPhase === 'pregnancy' ? '🤰 Pregnancy' : 
           currentPhase === 'infant' ? '👶 Infant (0-12 months)' : 
           '🧒 Toddler (12-24 months)'}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => navigation.navigate('FoodHack')}
        >
          <Text style={styles.actionIcon}>📸</Text>
          <Text style={styles.actionText}>Food Hack</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => navigation.navigate('KitRequest')}
        >
          <Text style={styles.actionIcon}>🛒</Text>
          <Text style={styles.actionText}>Request Kit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
          onPress={() => navigation.navigate('HealthBook')}
        >
          <Text style={styles.actionIcon}>📖</Text>
          <Text style={styles.actionText}>Health Book</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timelineContainer}>
        <Timeline
          data={timelineData}
          circleSize={20}
          circleColor="rgb(45,156,219)"
          lineColor="rgb(45,156,219)"
          timeContainerStyle={{ minWidth: 80 }}
          timeStyle={styles.timelineTime}
          descriptionStyle={styles.timelineDescription}
          options={{
            style: { paddingTop: 5 }
          }}
          renderDetail={(rowData) => (
            <View style={styles.timelineCard}>
              <Text style={styles.timelineIcon}>{rowData.icon}</Text>
              <Text style={styles.timelineTitle}>{rowData.title}</Text>
              <Text style={styles.timelineDesc}>{rowData.description}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.milestoneSection}>
        <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneIcon}>💉</Text>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneTitle}>Next Vaccination</Text>
            <Text style={styles.milestoneDate}>In 14 days</Text>
          </View>
        </View>
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneIcon}>⚖️</Text>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneTitle}>Growth Check</Text>
            <Text style={styles.milestoneDate}>In 21 days</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  dayCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  dayLabel: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  remaining: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 10,
  },
  phaseIndicator: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  phaseValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
  },
  actionButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timelineContainer: {
    margin: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
  },
  timelineCard: {
    padding: 10,
  },
  timelineIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timelineDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  milestoneSection: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  milestoneCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  milestoneIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  milestoneDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
});

export default TimelineDashboard;
