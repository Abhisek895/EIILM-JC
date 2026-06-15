import { SiteSettingRepository } from '../repository/SiteSettingRepository';

export class SiteSettingService {
  private repo: SiteSettingRepository;

  constructor() {
    this.repo = new SiteSettingRepository();
  }

  async getAll() {
    return this.repo.findAll();
  }

  async getMap(): Promise<Record<string, string>> {
    return this.repo.toMap();
  }

  async getByKey(key: string) {
    return this.repo.findByKey(key);
  }

  async set(key: string, value: string, description?: string) {
    return this.repo.upsert(key, value, description);
  }

  async bulkSet(settings: Array<{ key: string; value: string; description?: string }>) {
    return Promise.all(settings.map((s) => this.repo.upsert(s.key, s.value, s.description)));
  }
}
