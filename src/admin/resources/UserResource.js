import crypto from 'crypto';
import { AuthService } from '../../auth/auth.service.js';

export const userOptions = {
    properties: {
        password: {
            type: 'password',
            isVisible: {
                list: false,
                edit: true,
                show: false,
                filter: false,
            },
        },
        password_hash: {
            isVisible: false,
        },
        created_at: {
            isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
            },
        },
    },
    actions: {
        new: {
            before: async (request) => {
                if (!request.payload) return request;

                let plainPassword = request.payload.password;
                let shouldLogPassword = false;

                if (!plainPassword) {
                    plainPassword = crypto.randomBytes(8).toString('hex');
                    shouldLogPassword = true;
                }

                const hashed = await AuthService.hashPassword(plainPassword);

                if (shouldLogPassword) {
                    console.log('Generated password for user:', request.payload.email, ':', plainPassword);
                }

                const { password, ...rest } = request.payload;

                return {
                    ...request,
                    payload: {
                        ...rest,
                        password_hash: hashed,
                    },
                };
            },
        },
        edit: {
            before: async (request) => {
                if (!request.payload) return request;

                if (request.payload.password) {
                    const hashed = await AuthService.hashPassword(request.payload.password);
                    const { password, ...rest } = request.payload;

                    return {
                        ...request,
                        payload: {
                            ...rest,
                            password_hash: hashed,
                        },
                    };
                }
                return request;
            },
        },
    },
};
