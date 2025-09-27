
import { SubscriptionRepository } from './subscription.repository.js';
import { EmailService } from '../email/email.service.js';

export class SubscriptionService {
    static async subscribe(userId, postId) {
        return SubscriptionRepository.subscribe(userId, postId);
    }

    static async unsubscribe(userId, postId) {
        return SubscriptionRepository.unsubscribe(userId, postId);
    }

    static async notifySubscribers(postId, message) {
        const subscribers = await SubscriptionRepository.getSubscribers(postId);
        for (const sub of subscribers) {
            await EmailService.sendMail({
                to: sub.email,
                subject: 'Post update',
                text: message,
            });
        }
    }

    static async getUserSubscriptions(userId) {
        return SubscriptionRepository.getUserSubscriptions(userId);
    }
}
