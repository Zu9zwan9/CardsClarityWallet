import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useWallet } from '../contexts/WalletContext';
import { useDynamicColors } from '../hooks/useDynamicColors';

const { width, height } = Dimensions.get('window');

// Define the payment flow steps
enum PaymentStep {
  DETAILS,
  CONFIRMATION,
  PROCESSING,
  SUCCESS,
  ERROR,
}

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose }) => {
  const colors = useDynamicColors();
  const insets = useSafeAreaInsets();
  const { selectedCard, processPayment } = useWallet();

  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current; // For button press animation

  // Form state
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('general');
  const [paymentStep, setPaymentStep] = useState<PaymentStep>(PaymentStep.DETAILS);
  const [error, setError] = useState('');

  // Double-tap state
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);

  // Reset state when modal is opened
  useEffect(() => {
    if (visible) {
      setAmount('');
      setMerchant('');
      setCategory('general');
      setPaymentStep(PaymentStep.DETAILS);
      setError('');
      setTapCount(0);
      if (tapTimeout) clearTimeout(tapTimeout);

      // Start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      slideAnim.setValue(height);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [visible, slideAnim, fadeAnim, rotateAnim, tapTimeout]);

  // Handle close modal
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setPaymentStep(PaymentStep.DETAILS);
    });
  };

  // Handle continue to confirmation
  const handleContinue = () => {
    if (!selectedCard) {
      setError('Please select a card first');
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!merchant.trim()) {
      setError('Please enter a merchant name');
      return;
    }

    setError('');
    setPaymentStep(PaymentStep.CONFIRMATION);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Handle button press animation
  const handleButtonPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // Handle confirmation tap (double-tap for Apple Pay)
  const handleConfirmationTap = () => {
    if (!selectedCard) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }

    setTapCount(prevCount => {
      const newCount = prevCount + 1;

      if (newCount >= 2) {
        handleProcessPayment();
        return 0;
      }

      const timeout = setTimeout(() => {
        setTapCount(0);
      }, 300);

      setTapTimeout(timeout);
      return newCount;
    });
  };

  // Handle regular payment (non-Apple Pay)
  const handleRegularPayment = () => {
    if (!selectedCard) return;
    handleProcessPayment();
  };

  // Handle process payment
  const handleProcessPayment = async () => {
    if (!selectedCard) return;

    setPaymentStep(PaymentStep.PROCESSING);

    Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
    ).start();

    try {
      const result = await processPayment(
          selectedCard.id,
          parseFloat(amount),
          merchant,
          category
      );

      if (result.success) {
        setPaymentStep(PaymentStep.SUCCESS);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
          handleClose();
        }, 2500);
      } else {
        setPaymentStep(PaymentStep.ERROR);
        setError(result.message || 'Payment failed. Please try again.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      setPaymentStep(PaymentStep.ERROR);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
      <Modal
          visible={visible}
          transparent
          animationType="none"
          onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoid}
          >
            <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.glassBorder,
                    transform: [{ translateY: slideAnim }],
                    opacity: fadeAnim,
                    paddingBottom: insets.bottom + 20,
                  },
                ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  {paymentStep === PaymentStep.DETAILS && 'New Payment'}
                  {paymentStep === PaymentStep.CONFIRMATION && 'Confirm Payment'}
                  {paymentStep === PaymentStep.PROCESSING && 'Processing...'}
                  {paymentStep === PaymentStep.SUCCESS && 'Payment Successful'}
                  {paymentStep === PaymentStep.ERROR && 'Payment Failed'}
                </Text>
                <View style={styles.headerRight} />
              </View>

              {/* Content */}
              <View style={styles.content}>
                {paymentStep === PaymentStep.DETAILS && (
                    <View>
                      {/* Selected Card Info */}
                      {selectedCard && (
                          <View style={[styles.selectedCardInfo, { backgroundColor: colors.cardBackground, borderColor: colors.glassBorder }]}>
                            <View style={[styles.selectedCardIcon, { backgroundColor: selectedCard.color + '20' }]}>
                              <Text style={styles.selectedCardInitial}>{selectedCard.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.selectedCardDetails}>
                              <Text style={[styles.selectedCardName, { color: colors.textPrimary }]}>{selectedCard.name}</Text>
                              <Text style={[styles.selectedCardIssuer, { color: colors.textSecondary }]}>
                                {selectedCard.issuer} • {selectedCard.lastFourDigits}
                              </Text>
                            </View>
                          </View>
                      )}

                      {/* Amount input */}
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                          Amount
                        </Text>
                        <View style={[styles.amountInputContainer, { backgroundColor: colors.background, borderColor: colors.glassBorder }]}>
                          <Text style={[styles.currencySymbol, { color: colors.textPrimary }]}>$</Text>
                          <TextInput
                              style={[styles.amountInput, { color: colors.textPrimary }]}
                              value={amount}
                              onChangeText={setAmount}
                              placeholder="0.00"
                              placeholderTextColor={colors.textSecondary}
                              keyboardType="decimal-pad"
                              autoFocus
                          />
                        </View>
                      </View>

                      {/* Merchant input */}
                      <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                          Merchant
                        </Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.glassBorder, color: colors.textPrimary }]}
                            value={merchant}
                            onChangeText={setMerchant}
                            placeholder="Enter merchant name"
                            placeholderTextColor={colors.textSecondary}
                        />
                      </View>

                      {/* Error message */}
                      {error ? (
                          <Text style={[styles.errorText, { color: colors.error }]}>
                            {error}
                          </Text>
                      ) : null}

                      {/* Pay button */}
                      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            style={[styles.payButton, { backgroundColor: selectedCard?.applePayEnabled ? '#000000' : colors.accent }]}
                            onPress={handleContinue}
                            onPressIn={handleButtonPressIn}
                            onPressOut={handleButtonPressOut}
                        >
                          {selectedCard?.applePayEnabled ? (
                              <>
                                <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.payButtonText}>Pay with Apple Pay</Text>
                              </>
                          ) : (
                              <Text style={styles.payButtonText}>Continue</Text>
                          )}
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                )}

                {paymentStep === PaymentStep.CONFIRMATION && (
                    <View style={styles.confirmationContainer}>
                      <Text style={[styles.confirmText, { color: colors.textPrimary }]}>
                        {selectedCard?.applePayEnabled
                            ? 'Double-tap to confirm payment'
                            : 'Confirm payment details'}
                      </Text>
                      <Text style={[styles.confirmDetails, { color: colors.textSecondary }]}>
                        ${parseFloat(amount).toFixed(2)} to {merchant}
                      </Text>
                      <Text style={[styles.confirmDetails, { color: colors.textSecondary }]}>
                        Using {selectedCard?.name} • {selectedCard?.lastFourDigits}
                      </Text>
                      {selectedCard?.applePayEnabled ? (
                          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <TouchableOpacity
                                style={[styles.applePayButton, { backgroundColor: '#000000' }]}
                                onPress={handleConfirmationTap}
                                onPressIn={handleButtonPressIn}
                                onPressOut={handleButtonPressOut}
                            >
                              <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                              <Text style={styles.applePayButtonText}>Confirm with Apple Pay</Text>
                            </TouchableOpacity>
                          </Animated.View>
                      ) : (
                          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <TouchableOpacity
                                style={[styles.payButton, { backgroundColor: colors.accent }]}
                                onPress={handleRegularPayment}
                                onPressIn={handleButtonPressIn}
                                onPressOut={handleButtonPressOut}
                            >
                              <Text style={styles.payButtonText}>Confirm Payment</Text>
                            </TouchableOpacity>
                          </Animated.View>
                      )}
                    </View>
                )}

                {paymentStep === PaymentStep.PROCESSING && (
                    <View style={styles.processingContainer}>
                      <Animated.View style={[styles.loadingIndicator, { transform: [{ rotate: spin }] }]}>
                        <Ionicons name="sync" size={48} color={colors.accent} />
                      </Animated.View>
                      <Text style={[styles.processingText, { color: colors.textPrimary }]}>
                        Processing your payment...
                      </Text>
                    </View>
                )}

                {paymentStep === PaymentStep.SUCCESS && (
                    <View style={styles.successContainer}>
                      <View style={[styles.checkmarkCircle, { backgroundColor: colors.success }]}>
                        <Ionicons name="checkmark" size={48} color="#FFFFFF" />
                      </View>
                      <Text style={[styles.successText, { color: colors.textPrimary }]}>
                        Payment Successful!
                      </Text>
                      <Text style={[styles.successDetails, { color: colors.textSecondary }]}>
                        ${parseFloat(amount).toFixed(2)} paid to {merchant}
                      </Text>
                    </View>
                )}

                {paymentStep === PaymentStep.ERROR && (
                    <View style={styles.errorContainer}>
                      <View style={[styles.errorCircle, { backgroundColor: colors.error }]}>
                        <Ionicons name="close" size={48} color="#FFFFFF" />
                      </View>
                      <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
                        Payment Failed
                      </Text>
                      <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                        {error}
                      </Text>
                      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <TouchableOpacity
                            style={[styles.tryAgainButton, { backgroundColor: colors.accent }]}
                            onPress={() => setPaymentStep(PaymentStep.DETAILS)}
                            onPressIn={handleButtonPressIn}
                            onPressOut={handleButtonPressOut}
                        >
                          <Text style={styles.tryAgainButtonText}>Try Again</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    </View>
                )}
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  selectedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCardInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'SFProDisplay-Bold',
  },
  selectedCardDetails: {
    flex: 1,
  },
  selectedCardName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
  selectedCardIssuer: {
    fontSize: 14,
    fontFamily: 'SFProText-Regular',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'SFProText-Regular',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'SFProDisplay-Semibold',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
  textInput: {
    borderWidth: 0.5,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'SFProText-Regular',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'SFProText-Regular',
  },
  payButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
  applePayButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  applePayButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  confirmText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'SFProDisplay-Semibold',
  },
  confirmDetails: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'SFProText-Regular',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  processingText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SFProDisplay-Semibold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'SFProDisplay-Semibold',
  },
  successDetails: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'SFProText-Regular',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'SFProDisplay-Semibold',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'SFProText-Regular',
  },
  tryAgainButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tryAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
});

export default PaymentModal;
