import { FavoriteController } from "./favorite.controller.js";

export function FavoriteModule(app) {
    app.use('/favorites', FavoriteController);
}
