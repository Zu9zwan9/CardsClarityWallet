import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AntDesign } from '@expo/vector-icons';
import CardService from '../services/CardService';

// Define the card data structure based on the JSON
interface CardFee {
  name: string;
  value: string;
}

interface CardReward {
  name: string;
  value: string;
}

interface Card {
  _id: { $oid: string };
  cardName: string;
  bankName: string;
  cardImageUrl: string;
  cashbackPercentages: Record<string, string>;
  perks: string[];
  redemptionOptions: string[];
  fees: CardFee[];
  apr: { range: string; introApr: string };
  rewards: CardReward[];
  creditScoreRequired: string;
  additionalBenefits: string[];
  reviewFromTheWeb: string;
  averageRating: number | null;
  bayesianRating: number | null;
  reviewCount: number;
  reviewStaticCount: number;
}

interface Review {
  _id: { $oid: string };
  cardId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isHidden: boolean;
  isAdminReview: boolean;
  displayedUser?: { username: string; avatar: string };
  user: { username: string; avatar: string };
}

type RouteParams = {
  ReviewsScreen: {
    cardId: string;
  };
};

const ReviewsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ReviewsScreen'>>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [card, setCard] = useState<Card | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const defaultCardIds = [
  "66bcc4fe50f7137997304e07",
    "66bcc4fe50f7137997304dc8",
    "66bcc4fe50f7137997304dc9",
    "66bcc4fe50f7137997304dca",
    "66bcc4fe50f7137997304dcb",
    "66bcc4fe50f7137997304dcc",
    "66bcc4fe50f7137997304dcd",
    "66bcc4fe50f7137997304dce",
    "66bcc4fe50f7137997304dcf"
  ];
  const cardId = route.params?.cardId || defaultCardIds[Math.floor(Math.random() * defaultCardIds.length)];
  const token = 'TestApiKey';
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cardData = await CardService.fetchCard(cardId, token);
        const reviewsData = await CardService.fetchReviewsByCardId(cardId, token);
        setCard(cardData);
        setReviews(reviewsData.reviews || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cardId]);

  const renderRatingStars = (rating: number | null) => {
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <View style={styles.starsContainer}>
          {[...Array(fullStars)].map((_, i) => (
              <AntDesign key={`full-${i}`} name="star" size={20} color="#FFD700" />
          ))}
          {halfStar && <AntDesign name="staro" size={20} color="#FFD700" />}
          {[...Array(emptyStars)].map((_, i) => (
              <AntDesign key={`empty-${i}`} name="staro" size={20} color="#D3D3D3" />
          ))}
        </View>
    );
  };

  const renderCardDetails = () => {
    if (!card) return null;

    return (
        <View style={styles.cardDetailsContainer}>
          <Image source={{ uri: card.cardImageUrl }} style={styles.cardImage} resizeMode="contain" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{card.cardName}</Text>
            <Text style={styles.bankName}>{card.bankName}</Text>
            {card.averageRating ? (
                <View style={styles.ratingContainer}>
                  {renderRatingStars(card.averageRating)}
                  <Text style={styles.ratingText}>
                    {card.averageRating.toFixed(1)} ({card.reviewCount}{' '}
                    {card.reviewCount === 1 ? 'review' : 'reviews'})
                  </Text>
                </View>
            ) : (
                <Text style={styles.noRatingText}>No ratings yet</Text>
            )}
          </View>
        </View>
    );
  };

  const renderReviewSection = () => {
    if (!card) return null;

    return (
        <View style={styles.reviewContainer}>
          <Text style={styles.sectionTitle}>Expert Review</Text>
          <Text style={styles.reviewText}>{card.reviewFromTheWeb}</Text>

          <View style={styles.specsContainer}>
            <Text style={styles.sectionTitle}>Card Specifications</Text>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Annual Fee:</Text>
              <Text style={styles.specValue}>
                {card.fees?.find((fee) => fee.name === 'Annual Fee')?.value || 'N/A'}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Foreign Transaction Fee:</Text>
              <Text style={styles.specValue}>
                {card.fees?.find((fee) => fee.name === 'Foreign Fee')?.value || 'N/A'}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>APR Range:</Text>
              <Text style={styles.specValue}>{card.apr?.range || 'N/A'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Intro APR:</Text>
              <Text style={styles.specValue}>{card.apr?.introApr || 'N/A'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Credit Score Required:</Text>
              <Text style={styles.specValue}>{card.creditScoreRequired}</Text>
            </View>
            {card.rewards?.find(
                (reward) => reward.name === 'Sign-Up Bonus' || reward.name === 'Sign-up Bonus'
            )?.value && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Sign-up Bonus:</Text>
                  <Text style={styles.specValue}>
                    {card.rewards.find(
                        (reward) =>
                            reward.name === 'Sign-Up Bonus' || reward.name === 'Sign-up Bonus'
                    )?.value || 'N/A'}
                  </Text>
                </View>
            )}
          </View>
        </View>
    );
  };

  const renderUserReview = ({ item }: { item: Review }) => (
      <View style={styles.userReviewContainer}>
        <View style={styles.userReviewHeader}>
          <Image
              source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }}
              style={styles.userAvatar}
          />
          <View>
            <Text style={styles.userName}>{item.user.username}</Text>
            <View style={styles.ratingContainer}>
              {renderRatingStars(item.rating)}
              <Text style={styles.reviewDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.reviewTitle}>{item.title}</Text>
        <Text style={styles.reviewContent}>{item.content}</Text>
      </View>
  );

  const renderUserReviews = () => {
    if (!reviews.length) return null;
    return (
        <View style={styles.reviewContainer}>
          <Text style={styles.sectionTitle}>User Reviews</Text>
          <FlatList
              data={reviews}
              renderItem={renderUserReview}
              keyExtractor={(item) => item._id.$oid}
              scrollEnabled={false}
          />
        </View>
    );
  };

  if (loading) {
    return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading card details...</Text>
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <ScrollView style={styles.container}>
        {renderCardDetails()}
        {renderReviewSection()}
        {renderUserReviews()}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Cards</Text>
        </TouchableOpacity>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardDetailsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 100,
    height: 60,
    marginRight: 16,
    borderRadius: 8,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  bankName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  noRatingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  reviewContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 20,
  },
  specsContainer: {
    marginTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  specLabel: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  userReviewContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  userReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  reviewContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewsScreen;
