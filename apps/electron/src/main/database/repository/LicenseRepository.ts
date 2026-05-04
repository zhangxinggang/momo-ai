import { SoftwareLicense } from '../entities/SoftwareLicense';
import { BaseRepository } from './BaseRepository';

export class LicenseRepository extends BaseRepository<SoftwareLicense> {
  constructor() {
    super(SoftwareLicense);
  }
}
