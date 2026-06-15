import { SiteSetting } from '@models/index';
import { BaseRepository } from '@repositories/BaseRepository';

export class SiteSettingRepository extends BaseRepository<SiteSetting> {
  constructor() {
    super(SiteSetting);
  }

  async findAll(): Promise<SiteSetting[]> {
    return this.model.findAll({ order: [['keyName', 'ASC']] });
  }

  async findByKey(key: string): Promise<SiteSetting | null> {
    return this.findOne({ where: { keyName: key } });
  }

  async upsert(key: string, value: string, description?: string): Promise<SiteSetting> {
    const [setting] = await (this.model as typeof SiteSetting).findOrCreate({
      where: { keyName: key },
      defaults: { keyName: key, value, description: description || null, tenantId: null },
    });

    if (setting.value !== value) {
      setting.value = value;
      if (description) setting.description = description;
      await setting.save();
    }

    return setting;
  }

  // Return all settings as a plain key→value map
  async toMap(): Promise<Record<string, string>> {
    const all = await this.findAll();
    return all.reduce((acc, s) => {
      acc[s.keyName] = s.value ?? '';
      return acc;
    }, {} as Record<string, string>);
  }
}
