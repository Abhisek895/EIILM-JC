import { Faculty } from '@models/index';
import { FacultyRepository } from '../repository/FacultyRepository';

export interface CreateFacultyInput {
  name: string;
  departmentId?: number;
  designation?: string;
  photo?: string;
  qualification?: string;
  experience?: string;
  email?: string;
  phone?: string;
  bio?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export class FacultyService {
  private repo: FacultyRepository;

  constructor() {
    this.repo = new FacultyRepository();
  }

  async list(page: number, limit: number, departmentId?: number, search?: string) {
    return this.repo.findAllActive(page, limit, departmentId, search);
  }

  async getById(id: number): Promise<Faculty | null> {
    return this.repo.findByIdWithDept(id);
  }

  async create(data: CreateFacultyInput): Promise<Faculty> {
    return this.repo.create({
      name: data.name,
      departmentId: data.departmentId || null,
      designation: data.designation || null,
      photo: data.photo || null,
      qualification: data.qualification || null,
      experience: data.experience || null,
      email: data.email || null,
      phone: data.phone || null,
      bio: data.bio || null,
      status: data.status || 'active',
      sortOrder: data.sortOrder ?? 0,
    });
  }

  async update(id: number, data: Partial<CreateFacultyInput>): Promise<void> {
    await this.repo.update(id, data as Record<string, unknown>);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
