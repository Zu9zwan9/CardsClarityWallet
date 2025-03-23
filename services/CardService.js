import axios from 'axios';

const API_BASE_URL = 'https://www.cardsclarity.com/api/v1';

class CardService {
    static async fetchCard(cardId, token) {
        try {
            const response = await axios.get(`${API_BASE_URL}/cards/${cardId}?page=0&perPage=20`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch card data');
        }
    }

    static async fetchReviewsByCardId(cardId, token, page = 0, perPage = 10) {
        try {
            const response = await axios.get(`${API_BASE_URL}/cards/${cardId}/reviews?page=${page}&perPage=${perPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch reviews');
        }
    }
}

export default CardService;
