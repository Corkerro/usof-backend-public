import { CategoryController } from './category.controller.js';

export const CategoryModule = (app) => {
    app.use('/categories', CategoryController);
};
