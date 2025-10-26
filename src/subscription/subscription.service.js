import { SubscriptionRepository } from "./subscription.repository.js";
import { EmailService } from "../email/email.service.js";

export class SubscriptionService {
  static async subscribe(userId, postId) {
    return SubscriptionRepository.subscribe(userId, postId);
  }

  static async unsubscribe(userId, postId) {
    return SubscriptionRepository.unsubscribe(userId, postId);
  }

  static async notifySubscribers(postId, message) {
    const subscribers = await SubscriptionRepository.getSubscribers(postId);
    const postUrl = `http://localhost:5173/posts/${postId}`;

    for (const sub of subscribers) {
      const html = EmailService.buildHtmlEmail({
        title: "New update on a post you follow",
        message,
        actionUrl: postUrl,
        actionText: "View Post",
      });

      await EmailService.sendMail({
        to: sub.email,
        subject: "Post update",
        text: `${message}\n\nView the post: ${postUrl}`,
        html,
      });
    }
  }

  static async getUserSubscriptions(userId) {
    return SubscriptionRepository.getUserSubscriptions(userId);
  }
}
