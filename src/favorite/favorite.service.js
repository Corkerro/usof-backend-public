import { FavoriteRepository } from './favorite.repository.js';

export class FavoriteService {
    static async addToFavorites(userId, postId) {
        return FavoriteRepository.add(userId, postId);
    }

    static async removeFromFavorites(userId, postId) {
        return FavoriteRepository.remove(userId, postId);
    }

    static async getUserFavorites(userId) {
        return FavoriteRepository.getUserFavorites(userId);
    }
}
