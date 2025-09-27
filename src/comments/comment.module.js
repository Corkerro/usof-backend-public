import { CommentController } from "./comment.controller.js";

export function CommentModule(app) {
    app.use('/comments', CommentController);
}
