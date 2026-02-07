import { BaseService } from './BaseService';

export interface Location {
  id: string;
  name: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  type: 'hq' | 'hub';
  address: string;
  status: 'active' | 'maintenance' | 'offline';
  totalAssets: number;
  primaryContact: {
    name: string;
    email: string; // mLab email
    phone: string; // South African format
  };
  createdAt: Date;
  updatedAt: Date;
}

export class LocationService extends BaseService<Location> {
  constructor() {
    super('locations');
  }

  // Get all mLab South Africa locations in specific order
  async getAllLocations(): Promise<Location[]> {
    const locations = await super.getAll();
    
    // Return in specific order: Tshwane (HQ), then hubs
    return locations.sort((a, b) => {
      if (a.name === 'Tshwane') return -1;
      if (b.name === 'Tshwane') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Get specific location by name
  async getLocationByName(name: 'Tshwane' | 'Polokwane' | 'Galeshewe'): Promise<Location | null> {
    const locations = await this.queryByField('name', name);
    return locations.length > 0 ? locations[0] : null;
  }

  // Get location contact information
  async getLocationContacts() {
    const locations = await this.getAllLocations();
    return locations.map(location => ({
      name: location.name,
      type: location.type,
      contact: location.primaryContact,
      address: location.address,
      status: location.status
    }));
  }

  // Update asset count for location
  async updateAssetCount(locationName: string, change: number): Promise<void> {
    const location = await this.getLocationByName(locationName as any);
    if (!location) return;

    const newCount = Math.max(0, (location.totalAssets || 0) + change);
    await this.update(location.id, { totalAssets: newCount } as Partial<Location>);
  }

  // Validate if location exists (mLab South Africa specific)
  async isValidLocation(locationName: string): Promise<boolean> {
    const location = await this.getLocationByName(locationName as any);
    return !!location && location.status === 'active';
  }
}

// Export singleton instance
export const locationService = new LocationService();
