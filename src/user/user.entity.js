export class UserEntity {
    constructor({ id, login, full_name, email, password_hash, role_id, is_email_confirmed, avatar_url, rating, created_at, updated_at, deleted_at }) {
        this.id = id;
        this.login = login;
        this.fullName = full_name;
        this.email = email;
        this.passwordHash = password_hash;
        this.roleId = role_id;
        this.isEmailConfirmed = is_email_confirmed;
        this.avatarUrl = avatar_url;
        this.rating = rating;
        this.createdAt = created_at;
        this.updatedAt = updated_at;
        this.deletedAt = deleted_at;
    }

    toPublicJSON() {
        return {
            id: this.id,
            login: this.login,
            fullName: this.fullName,
            email: this.email,
            roleId: this.roleId,
            avatarUrl: this.avatarUrl,
            rating: this.rating,
            createdAt: this.createdAt,
        };
    }

    toSafeJSON() {
        return {
            id: this.id,
            login: this.login,
            fullName: this.fullName,
            avatarUrl: this.avatarUrl,
            rating: this.rating,
        };
    }
}
