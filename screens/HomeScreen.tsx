import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '../components/Card';
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
  } = useWallet();

  // State for filter toggle
  const [showCreditOnly, setShowCreditOnly] = useState(false);

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
    // Will implement payment modal in a future update
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
            borderColor: colors.cardBorder,
          }
        ]}
      >
        <View style={styles.suggestionContent}>
          <Ionicons name="bulb-outline" size={24} color={colors.warning} />
          <View style={styles.suggestionTextContainer}>
            <Text style={[styles.suggestionTitle, { color: colors.text }]}>
              Card Suggestion
            </Text>
            <Text style={[styles.suggestionDescription, { color: colors.secondaryText }]}>
              {suggestion.reason}
            </Text>
            <Text style={[styles.suggestionSavings, { color: colors.success }]}>
              Potential savings: ${suggestion.potentialSavings.toFixed(2)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.suggestionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleCardPress(suggestion.cardId)}
        >
          <Text style={[styles.suggestionButtonText, { color: '#FFFFFF' }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My Cards
        </Text>
        <View style={styles.filterContainer}>
          <Text style={[styles.filterLabel, { color: colors.secondaryText }]}>
            Credit Cards Only
          </Text>
          <Switch
            value={showCreditOnly}
            onValueChange={setShowCreditOnly}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={showCreditOnly ? colors.primary : colors.card}
            ios_backgroundColor={colors.border}
          />
        </View>
      </View>

      {/* Suggestion banner */}
      {renderSuggestionBanner()}

      {/* Cards list */}
      <FlatList
        data={filteredCards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsList}
        snapToInterval={width * 0.85 + 20}
        decelerationRate="fast"
        snapToAlignment="center"
      />

      {/* Payment button */}
      <View style={[styles.paymentButtonContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.paymentButton, { backgroundColor: colors.primary }]}
          onPress={handlePaymentPress}
          activeOpacity={0.8}
        >
          <Ionicons name="wallet-outline" size={24} color="#FFFFFF" />
          <Text style={styles.paymentButtonText}>Make Payment</Text>
        </TouchableOpacity>
      </View>
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
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  cardsList: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  paymentButtonContainer: {
    padding: 20,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  suggestionBanner: {
    margin: 20,
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
    shadowColor: '#000',
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
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  suggestionSavings: {
    fontSize: 14,
    fontWeight: '600',
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
  },
});

export default HomeScreen;
