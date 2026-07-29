import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useOrders } from '../context/OrderContext';

export const OrderTrackingCard = ({ onTrackPress }) => {
  const { theme } = useTheme();
  const { activeOrder, advanceOrderStep } = useOrders();

  if (!activeOrder) return null;

  const currentStep = activeOrder.statusStep || 1;
  const stages = [
    { id: 1, label: 'Preparing', icon: 'package' },
    { id: 2, label: 'Packed', icon: 'box' },
    { id: 3, label: 'Out for Delivery', icon: 'truck' },
    { id: 4, label: 'Delivered', icon: 'check-circle' }
  ];

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.topRow}>
          <View style={styles.orderInfo}>
            <View style={styles.statusDotRow}>
              <View style={styles.pulseDot} />
              <Text style={[styles.orderNumber, { color: theme.textPrimary }]}>
                Order #{activeOrder.orderNumber || 'MED-784920'}
              </Text>
            </View>
            <Text style={[styles.estTime, { color: theme.textSecondary }]}>
              {activeOrder.estimatedDelivery || 'Today, by 6:00 PM'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.stepAdvancerBtn}
            onPress={() => advanceOrderStep(activeOrder._id)}
            activeOpacity={0.7}
          >
            <Text style={styles.advanceText}>Simulate Next</Text>
            <Feather name="chevron-right" size={14} color="#16A34A" />
          </TouchableOpacity>
        </View>

        {/* Visual Stage Tracker */}
        <View style={styles.trackerContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${((currentStep - 1) / 3) * 100}%` }
              ]} 
            />
          </View>

          <View style={styles.stagesRow}>
            {stages.map((stage) => {
              const isCompleted = stage.id <= currentStep;
              const isCurrent = stage.id === currentStep;

              return (
                <View key={stage.id} style={styles.stageItem}>
                  <View 
                    style={[
                      styles.nodeCircle,
                      isCompleted ? styles.nodeActive : styles.nodeInactive,
                      isCurrent && styles.nodeCurrent
                    ]}
                  >
                    <Feather 
                      name={stage.icon} 
                      size={14} 
                      color={isCompleted ? '#FFFFFF' : '#9CA3AF'} 
                    />
                  </View>
                  <Text 
                    style={[
                      styles.stageLabel,
                      { color: isCompleted ? (isCurrent ? '#22C55E' : theme.textPrimary) : theme.textSecondary },
                      isCurrent && styles.stageLabelCurrent
                    ]}
                    numberOfLines={1}
                  >
                    {stage.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.trackDetailsBtn, { backgroundColor: theme.inputBg }]} 
          onPress={onTrackPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.trackDetailsText, { color: theme.textPrimary }]}>View Live Map & Details</Text>
          <Feather name="arrow-right" size={16} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    marginVertical: 10
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  orderInfo: {
    flex: 1
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E'
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800'
  },
  estTime: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  },
  stepAdvancerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 2
  },
  advanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A'
  },
  trackerContainer: {
    marginVertical: 10,
    position: 'relative',
    paddingVertical: 8
  },
  progressBarBackground: {
    position: 'absolute',
    top: 22,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#E2E8F0',
    zIndex: 1
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E'
  },
  stagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2
  },
  stageItem: {
    alignItems: 'center',
    width: 70
  },
  nodeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  nodeActive: {
    backgroundColor: '#22C55E'
  },
  nodeInactive: {
    backgroundColor: '#E2E8F0'
  },
  nodeCurrent: {
    borderWidth: 3,
    borderColor: '#BBF7D0'
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center'
  },
  stageLabelCurrent: {
    fontWeight: '800'
  },
  trackDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 10,
    gap: 6
  },
  trackDetailsText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
