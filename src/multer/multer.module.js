import path from 'path';

export const MulterModule = (express, app) => {
    app.use('/uploads', (req, res, next) => {
        express.static(path.join(process.cwd(), 'uploads'))(req, res, next);
    });
};
