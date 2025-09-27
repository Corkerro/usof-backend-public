import { UserController } from './user.controller.js';

export const UserModule = (app) => {
    app.use('/users', UserController);
};
