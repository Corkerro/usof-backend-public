import { SessionController } from './session.controller.js';

export const SessionModule = (app) => {
    app.use('/sessions', SessionController);
};
