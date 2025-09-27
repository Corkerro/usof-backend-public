export class CategoryEntity {
    constructor({ id, name, slug, description, created_by, created_at, updated_at, deleted_at }) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.createdBy = created_by;
        this.createdAt = created_at;
        this.updatedAt = updated_at;
        this.deletedAt = deleted_at;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.deletedAt ? 'deleted' : this.name,
            slug: this.slug,
            description: this.deletedAt ? 'deleted' : this.description,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
