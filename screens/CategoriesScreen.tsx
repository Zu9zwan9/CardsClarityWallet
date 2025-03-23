import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDynamicColors } from '../hooks/useDynamicColors';

const { width } = Dimensions.get('window');
const numColumns = 2;
const tileSize = (width - 60) / numColumns;

// Sample category data
const categories = [
  {
    id: '1',
    name: 'Travel',
    icon: 'airplane',
    color: '#FF9500',
  },
  {
    id: '2',
    name: 'Dining',
    icon: 'restaurant',
    color: '#FF3B30',
  },
  {
    id: '3',
    name: 'Groceries',
    icon: 'cart',
    color: '#34C759',
  },
  {
    id: '4',
    name: 'Entertainment',
    icon: 'film',
    color: '#AF52DE',
  },
  {
    id: '5',
    name: 'Gas',
    icon: 'speedometer',
    color: '#007AFF',
  },
  {
    id: '6',
    name: 'Shopping',
    icon: 'bag',
    color: '#5856D6',
  },
  {
    id: '7',
    name: 'Utilities',
    icon: 'flash',
    color: '#FF2D55',
  },
  {
    id: '8',
    name: 'Healthcare',
    icon: 'medical',
    color: '#32ADE6',
  },
];

const CategoriesScreen: React.FC = () => {
  const colors = useDynamicColors();
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (id: string) => {
    // Will implement category details in a future update
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderCategoryItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryTile,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          shadowColor: colors.cardShadow,
        },
      ]}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: item.color + '20', // Add transparency to the color
          },
        ]}
      >
        <Ionicons name={item.icon as any} size={32} color={item.color} />
      </View>
      <Text style={[styles.categoryName, { color: colors.text }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Categories
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
          Explore cashback categories
        </Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={[
          styles.categoriesList,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      />
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
  categoriesList: {
    padding: 20,
  },
  categoryTile: {
    width: tileSize,
    height: tileSize,
    margin: 10,
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
