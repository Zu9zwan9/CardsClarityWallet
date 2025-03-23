import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card as CardType } from '../contexts/WalletContext';
import { useDynamicColors } from '../hooks/useDynamicColors';

interface CardProps {
  card: CardType;
  onPress?: (id: string) => void;
  isSelected?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

export const Card: React.FC<CardProps> = ({ card, onPress, isSelected = false }) => {
  const colors = useDynamicColors();

  const baseColor = card.color;
  const lighterColor = adjustColorBrightness(baseColor, 20);
  const darkerColor = adjustColorBrightness(baseColor, -20);

  const handlePress = () => {
    if (onPress) {
      onPress(card.id);
    }
  };

  return (
      <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePress}
          style={[
            styles.container,
            isSelected && styles.selectedCard,
            {
 shadowColor: colors.textSecondary,
               borderColor: isSelected ? colors.accent : colors.textSecondary,
            },
          ]}
      >
        <LinearGradient
            colors={[lighterColor + '99', darkerColor + '99']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
          {/* Card content */}
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={[styles.issuer, { color: colors.textPrimary }]}>
                {card.issuer}
              </Text>
              <View style={styles.typeContainer}>
                <Text style={[styles.type, { color: colors.textPrimary }]}>
                  {card.type.toUpperCase()}
                </Text>
                {card.type === 'credit' ? (
                    <Ionicons name="card-outline" size={16} color={colors.textPrimary} />
                ) : (
                    <Ionicons name="cash-outline" size={16} color={colors.textPrimary} />
                )}
              </View>
            </View>

            <View style={styles.cardNumberContainer}>
              <Text style={[styles.cardNumberDots, { color: colors.textPrimary }]}>
                •••• •••• ••••
              </Text>
              <Text style={[styles.cardNumberVisible, { color: colors.textPrimary }]}>
                {card.lastFourDigits}
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  CARD HOLDER
                </Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {card.name}
                </Text>
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  EXPIRES
                </Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {card.expiryDate}
                </Text>
              </View>
              <View>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  CASHBACK
                </Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {card.cashbackRate}%
                </Text>
              </View>
            </View>
          </View>

          <View
              style={[
                styles.glassmorphicOverlay,
                { backgroundColor: colors.cardBackground },
              ]}
          />
        </LinearGradient>
      </TouchableOpacity>
  );
};

const adjustColorBrightness = (hex: string, percent: number): string => {
  hex = hex.replace(/^#/, '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.min(255, Math.max(0, r + percent));
  g = Math.min(255, Math.max(0, g + percent));
  b = Math.min(255, Math.max(0, b + percent));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
  },
  glassmorphicOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
    borderRadius: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issuer: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
    fontFamily: 'SFProDisplay-Semibold',
  },
  cardNumberContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  cardNumberDots: {
    fontSize: 20,
    letterSpacing: 2,
    fontFamily: 'SFProDisplay-Regular',
  },
  cardNumberVisible: {
    fontSize: 20,
    letterSpacing: 2,
    fontFamily: 'SFProDisplay-Regular',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'SFProText-Regular',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SFProDisplay-Semibold',
  },
});

export default Card;
