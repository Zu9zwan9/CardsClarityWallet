import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Switch,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '../components/Card';
import PaymentModal from '../components/PaymentModal';
import { useWallet, Card as CardType } from '../contexts/WalletContext';
import { useDynamicColors } from '../hooks/useDynamicColors';
const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const colors = useDynamicColors();
  const insets = useSafeAreaInsets();
  const {
    cards,
    filteredCards,
    filterCards,
    selectedCard,
    selectCard,
    suggestions,
    isLoading,
  } = useWallet();

  // Payment modal state
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  // State for filter toggle
  const [showCreditOnly, setShowCreditOnly] = useState(false);

  // Animation for the FAB
  const fabScale = useRef(new Animated.Value(1)).current;

  // Handle filter toggle
  useEffect(() => {
    if (showCreditOnly) {
      filterCards('credit');
    } else {
      filterCards('all');
    }
  }, [showCreditOnly, filterCards]);

  // Handle card selection
  const handleCardPress = (id: string) => {
    selectCard(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle payment button press
  const handlePaymentPress = () => {
    if (!selectedCard) {
      Alert.alert('No Card Selected', 'Please select a card before making a payment.');
      return;
    }
    setPaymentModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // FAB animation
  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // Render card item
  const renderCardItem = ({ item }: { item: CardType }) => (
      <Card
          card={item}
          onPress={handleCardPress}
          isSelected={selectedCard?.id === item.id}
      />
  );

  // Render suggestion banner if available
  const renderSuggestionBanner = () => {
    if (suggestions.length === 0) return null;

    const suggestion = suggestions[0];
    const suggestedCard = cards.find(card => card.id === suggestion.cardId);

    if (!suggestedCard) return null;

    return (
        <Animatable.View
            animation="fadeInDown"
            duration={800}
            style={[
              styles.suggestionBanner,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.glassBorder,
                shadowColor: colors.shadow,
              },
            ]}
        >
          <View style={styles.suggestionContent}>
            <Ionicons name="bulb-outline" size={24} color={colors.accent} />
            <View style={styles.suggestionTextContainer}>
              <Text style={[styles.suggestionTitle, { color: colors.textPrimary }]}>
                Card Suggestion
              </Text>
              <Text style={[styles.suggestionDescription, { color: colors.textSecondary }]}>
                {suggestion.reason}
              </Text>
              <Text style={[styles.suggestionSavings, { color: '#34C759' }]}>
                Potential savings: ${suggestion.potentialSavings.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
              style={[styles.suggestionButton, { backgroundColor: colors.buttonBackground }]}
              onPress={() => handleCardPress(suggestion.cardId)}
          >
            <Text style={[styles.suggestionButtonText, { color: colors.accent }]}>
              Use Card
            </Text>
          </TouchableOpacity>
        </Animatable.View>
    );
  };

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header with filter toggle */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            My Cards
          </Text>
          <View style={styles.filterContainer}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
              Credit Cards Only
            </Text>
            <Switch
                value={showCreditOnly}
                onValueChange={setShowCreditOnly}
                trackColor={{ false: colors.textSecondary, true: colors.accent + '80' }}
                thumbColor={showCreditOnly ? colors.accent : colors.cardBackground}
                ios_backgroundColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Suggestion banner */}
        {renderSuggestionBanner()}

        {/* Cards list */}
        <FlatList
            data={filteredCards}
            renderItem={renderCardItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.cardsList, { paddingBottom: insets.bottom + 80 }]}
            snapToInterval={width * 0.85 + 20}
            decelerationRate="fast"
            snapToAlignment="center"
        />

        {/* Floating Action Button (FAB) for Make Payment */}
        <Animated.View
            style={[
              styles.fabContainer,
              {
                bottom: insets.bottom + 20,
                transform: [{ scale: fabScale }],
              },
            ]}
        >
          <TouchableOpacity
              style={[styles.fab, { backgroundColor: colors.accent }]}
              onPress={handlePaymentPress}
              onPressIn={handleFabPressIn}
              onPressOut={handleFabPressOut}
              activeOpacity={0.8}
              disabled={isLoading}
          >
            <Ionicons name="wallet-outline" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.fabText}>Make Payment</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Payment Modal */}
        <PaymentModal
            visible={paymentModalVisible}
            onClose={() => setPaymentModalVisible(false)}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'SFProDisplay-Bold',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginRight: 8,
    fontSize: 14,
    fontFamily: 'SFProText-Regular',
  },
  cardsList: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
  suggestionBanner: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  suggestionContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'SFProDisplay-Semibold',
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'SFProText-Regular',
  },
  suggestionSavings: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SFProText-Semibold',
  },
  suggestionButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  suggestionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
});

export default HomeScreen;
