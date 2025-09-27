import { SubscriptionController } from './subscription.controller.js';

export function SubscriptionModule(app) {
    app.use('/subscriptions', SubscriptionController);
}
