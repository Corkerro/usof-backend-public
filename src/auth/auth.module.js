import { AuthController } from './auth.controller.js';

export const AuthModule = (app) => {
    app.use('/auth', AuthController);
};
