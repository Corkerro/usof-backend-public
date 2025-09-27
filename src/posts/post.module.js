import { PostController } from './post.controller.js';

export function PostModule(app) {
    app.use('/posts', PostController);
}
