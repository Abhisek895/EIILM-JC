import { InfrastructureRepository } from '../repository/InfrastructureRepository';

export interface CreateInfrastructureInput {
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  icon?: string;
  category?: 'facility' | 'tour' | 'campus_highlight';
  status?: 'active' | 'inactive' | 'maintenance';
  sortOrder?: number;
}

export class InfrastructureService {
  private repo: InfrastructureRepository;

  constructor() {
    this.repo = new InfrastructureRepository();
  }

  async list(page: number, limit: number, category?: string) {
    return this.repo.findAll(page, limit, category);
  }

  async getById(id: number) {
    return this.repo.findById(id);
  }

  async create(data: CreateInfrastructureInput) {
    return this.repo.create({
      title: data.title,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      icon: data.icon || null,
      category: data.category || 'facility',
      status: data.status || 'active',
      sortOrder: data.sortOrder ?? 0,
    });
  }

  async update(id: number, data: Partial<CreateInfrastructureInput>) {
    return this.repo.update(id, data as any);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
