import { Department } from '@models/index';
import { DepartmentRepository } from '../repository/DepartmentRepository';

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  hodId?: number;
  status?: 'active' | 'inactive';
}

export class DepartmentService {
  private repo: DepartmentRepository;

  constructor() {
    this.repo = new DepartmentRepository();
  }

  async list(page: number, limit: number) {
    return this.repo.findAllActive(page, limit);
  }

  async getBySlug(slug: string): Promise<Department | null> {
    return this.repo.findBySlug(slug);
  }

  async getById(id: number): Promise<Department | null> {
    return this.repo.findById(id, {
      include: [{ association: 'faculty' }],
    });
  }

  async create(data: CreateDepartmentInput): Promise<Department> {
    const slug = slugify(data.name);

    // Ensure unique slug
    const existing = await this.repo.findBySlug(slug);
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return this.repo.create({
      name: data.name,
      slug: finalSlug,
      description: data.description || null,
      hodId: data.hodId || null,
      status: data.status || 'active',
      tenantId: null,
    });
  }

  async update(id: number, data: Partial<CreateDepartmentInput>): Promise<void> {
    const payload: Record<string, unknown> = { ...data };
    if (data.name) {
      payload.slug = slugify(data.name);
    }
    await this.repo.update(id, payload);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
