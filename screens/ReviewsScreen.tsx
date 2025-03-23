import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDynamicColors } from '../hooks/useDynamicColors';

const ReviewsScreen: React.FC = () => {
  const colors = useDynamicColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Card Reviews
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
          Find the best cards for your needs
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.placeholderContainer,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
            shadowColor: colors.cardShadow,
          }
        ]}>
          <Ionicons name="star-outline" size={64} color={colors.primary} />
          <Text style={[styles.placeholderTitle, { color: colors.text }]}>
            Coming Soon
          </Text>
          <Text style={[styles.placeholderText, { color: colors.secondaryText }]}>
            Card reviews and ratings will be available in a future update. Stay tuned!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  placeholderContainer: {
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    height: 300,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
});

export default ReviewsScreen;
