import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  Platform,
} from 'react-native';
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
const CARD_HEIGHT = CARD_WIDTH * 0.6; // Standard credit card ratio

export const Card: React.FC<CardProps> = ({ 
  card, 
  onPress, 
  isSelected = false 
}) => {
  const colors = useDynamicColors();
  
  // Create a lighter and darker version of the card color for gradient
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
          shadowColor: colors.cardShadow,
          borderColor: colors.cardBorder,
        }
      ]}
    >
      <LinearGradient
        colors={[lighterColor + '99', darkerColor + '99']} // 99 adds 60% opacity
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Card content */}
        <View style={styles.contentContainer}>
          {/* Card issuer and type */}
          <View style={styles.header}>
            <Text style={[styles.issuer, { color: colors.text }]}>
              {card.issuer}
            </Text>
            <View style={styles.typeContainer}>
              <Text style={[styles.type, { color: colors.text }]}>
                {card.type.toUpperCase()}
              </Text>
              {card.type === 'credit' ? (
                <Ionicons name="card-outline" size={16} color={colors.text} />
              ) : (
                <Ionicons name="cash-outline" size={16} color={colors.text} />
              )}
            </View>
          </View>
          
          {/* Card number */}
          <View style={styles.cardNumberContainer}>
            <Text style={[styles.cardNumberDots, { color: colors.text }]}>
              •••• •••• •••• 
            </Text>
            <Text style={[styles.cardNumberVisible, { color: colors.text }]}>
              {card.lastFourDigits}
            </Text>
          </View>
          
          {/* Card details */}
          <View style={styles.detailsContainer}>
            <View>
              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>
                CARD HOLDER
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {card.name}
              </Text>
            </View>
            
            <View>
              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>
                EXPIRES
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {card.expiryDate}
              </Text>
            </View>
            
            <View>
              <Text style={[styles.detailLabel, { color: colors.secondaryText }]}>
                CASHBACK
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {card.cashbackRate}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Glassmorphic effect overlay */}
        <View style={[
          styles.glassmorphicOverlay, 
          { backgroundColor: colors.cardBackground }
        ]} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Helper function to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex string
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  r = Math.min(255, Math.max(0, r + percent));
  g = Math.min(255, Math.max(0, g + percent));
  b = Math.min(255, Math.max(0, b + percent));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    marginVertical: 10,
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
    ...Platform.select({
      ios: {
        backgroundColor: 'transparent',
        backdropFilter: 'blur(10px)',
      },
      android: {
        // Android doesn't support backdropFilter
      },
    }),
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    zIndex: 1, // Ensure content is above the glassmorphic overlay
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issuer: {
    fontSize: 18,
    fontWeight: '600',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  cardNumberDots: {
    fontSize: 20,
    letterSpacing: 2,
  },
  cardNumberVisible: {
    fontSize: 20,
    letterSpacing: 2,
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
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Card;
