import { Location, LocationFormData, LocationFilters, LocationStats } from '../../../src/core/entities/Location';
import { LocationValidation } from '../../../src/utils/Vaidation_Location';

export interface ILocationService {
    getLocations(filters?: LocationFilters): Promise<Location[]>;
    getLocationById(id: string): Promise<Location | null>;
    createLocation(locationData: LocationFormData): Promise<Location>;
    updateLocation(id: string, updates: Partial<LocationFormData>): Promise<Location>;
    deleteLocation(id: string): Promise<void>;
    getLocationStats(): Promise<LocationStats>;
    validateLocation(data: LocationFormData): { isValid: boolean; errors: Record<string, string> };
}

// Define a type for the raw location data stored in localStorage
interface StoredLocation {
    id: string;
    name: string;
    address: string;
    type: 'hq' | 'hub' | 'branch' | 'site';
    status: 'active' | 'maintenance' | 'offline';
    totalAssets: number;
    primaryContact: {
        name: string;
        email: string;
        phone?: string;
    };
    description?: string;
    region?: string;
    capacity?: number;
    lastAudit?: string;
    createdAt?: string; // Stored as string in localStorage
    updatedAt?: string; // Stored as string in localStorage
}

export class LocationService implements ILocationService {
    private static readonly STORAGE_KEY = 'mlab_locations';
    private locations: Location[];

    constructor() {
        this.locations = this.initializeData();
    }

    private initializeData(): Location[] {
        const mockData: Location[] = [
            {
                id: '1',
                name: 'Tshwane HQ',
                address: 'U8, Enterprise Building, The Innovation Hub, Mark Shuttleworth Street, Pretoria, 0087',
                type: 'hq',
                status: 'active',
                totalAssets: 245,
                region: 'Gauteng',
                primaryContact: {
                    name: 'John Smith',
                    email: 'john.smith@mlab.co.za',
                    phone: '+27 012 844 0240'
                },
                description: 'mLab Tshwane is a proud partnership between mLab, The Innovation Hub and The Department of Science and Innovation.',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15')
            },
            {
                id: '2',
                name: 'Polokwane Hub',
                address: 'Enterprise Building, Polokwane Central, Limpopo',
                type: 'hub',
                status: 'active',
                totalAssets: 187,
                region: 'Limpopo',
                primaryContact: {
                    name: 'Sarah Johnson',
                    email: 'sarah.j@mlab.co.za',
                    phone: '+27 015 123 4567'
                },
                description: 'mLab Limpopo is a proud partnership between mLab, Limpopo Connexion and The Department of Science and Innovation.',
                createdAt: new Date('2024-02-10'),
                updatedAt: new Date('2024-02-10')
            },
            {
                id: '3',
                name: 'Soweto Branch',
                address: '456 Vilakazi Street, Orlando West, Soweto',
                type: 'branch',
                status: 'maintenance',
                totalAssets: 92,
                region: 'Gauteng',
                primaryContact: {
                    name: 'Mike Brown',
                    email: 'mike.b@mlab.co.za',
                    phone: '+27 011 234 5678'
                }
            },
            {
                id: '4',
                name: 'Tembisa Site',
                address: '321 Tembisa Plaza, Tembisa, Gauteng',
                type: 'site',
                status: 'active',
                totalAssets: 56,
                region: 'Gauteng',
                primaryContact: {
                    name: 'Lisa Wang',
                    email: 'lisa.w@mlab.co.za',
                    phone: '+27 011 345 6789'
                }
            },
            {
                id: '5',
                name: 'Imbali Hub',
                address: '789 Innovation Drive, Imbali, Pietermaritzburg',
                type: 'hub',
                status: 'active',
                totalAssets: 123,
                region: 'KwaZulu-Natal',
                primaryContact: {
                    name: 'David Miller',
                    email: 'david.m@mlab.co.za',
                    phone: '+27 033 456 7890'
                }
            },
            {
                id: '6',
                name: 'Kemberly Site',
                address: '987 Diamond Street, Kemberly, Northern Cape',
                type: 'site',
                status: 'offline',
                totalAssets: 34,
                region: 'Northern Cape',
                primaryContact: {
                    name: 'Emma Wilson',
                    email: 'emma.w@mlab.co.za',
                    phone: '+27 053 567 8901'
                },
                description: 'mLab Northern Cape serves the diamond mining region with digital innovation.'
            },
            {
                id: '7',
                name: 'Upington Hub',
                address: '654 Orange River Road, Upington, Northern Cape',
                type: 'hub',
                status: 'active',
                totalAssets: 78,
                region: 'Northern Cape',
                primaryContact: {
                    name: 'Robert Chen',
                    email: 'robert.c@mlab.co.za',
                    phone: '+27 054 678 9012'
                }
            },
        ];

        const existingData = this.getStoredData();
        if (existingData.length === 0) {
            localStorage.setItem(LocationService.STORAGE_KEY, JSON.stringify(mockData));
            return mockData;
        }
        return existingData;
    }

    private getStoredData(): Location[] {
        try {
            const data = localStorage.getItem(LocationService.STORAGE_KEY);
            if (!data) return [];

            // Parse the stored data with proper typing
            const storedLocations: StoredLocation[] = JSON.parse(data);

            // Convert stored locations to Location objects with proper Date objects
            return storedLocations.map((storedLocation: StoredLocation) => ({
                id: storedLocation.id,
                name: storedLocation.name,
                address: storedLocation.address,
                type: storedLocation.type,
                status: storedLocation.status,
                totalAssets: storedLocation.totalAssets,
                primaryContact: {
                    name: storedLocation.primaryContact.name,
                    email: storedLocation.primaryContact.email,
                    phone: storedLocation.primaryContact.phone
                },
                description: storedLocation.description,
                region: storedLocation.region,
                capacity: storedLocation.capacity,
                lastAudit: storedLocation.lastAudit,
                createdAt: storedLocation.createdAt ? new Date(storedLocation.createdAt) : new Date(),
                updatedAt: storedLocation.updatedAt ? new Date(storedLocation.updatedAt) : new Date()
            }));
        } catch (error) {
            console.error('Error reading location data:', error);
            return [];
        }
    }

    private saveData(): void {
        try {
            // Convert Location objects to StoredLocation for localStorage
            const storedLocations: StoredLocation[] = this.locations.map(location => ({
                id: location.id,
                name: location.name,
                address: location.address,
                type: location.type,
                status: location.status,
                totalAssets: location.totalAssets,
                primaryContact: {
                    name: location.primaryContact.name,
                    email: location.primaryContact.email,
                    phone: location.primaryContact.phone
                },
                description: location.description,
                region: location.region,
                capacity: location.capacity,
                lastAudit: location.lastAudit,
                createdAt: location.createdAt ? location.createdAt.toISOString() : new Date().toISOString(),
                updatedAt: location.updatedAt ? location.updatedAt.toISOString() : new Date().toISOString()
            }));

            localStorage.setItem(LocationService.STORAGE_KEY, JSON.stringify(storedLocations));
        } catch (error) {
            console.error('Error saving location data:', error);
        }
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    async getLocations(filters?: LocationFilters): Promise<Location[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...this.locations];

                if (filters) {
                    if (filters.searchTerm) {
                        const term = filters.searchTerm.toLowerCase();
                        filtered = filtered.filter(location =>
                            location.name.toLowerCase().includes(term) ||
                            location.address.toLowerCase().includes(term) ||
                            location.primaryContact.name.toLowerCase().includes(term) ||
                            (location.description && location.description.toLowerCase().includes(term))
                        );
                    }

                    if (filters.status && filters.status !== 'all') {
                        filtered = filtered.filter(location => location.status === filters.status);
                    }

                    if (filters.type && filters.type !== 'all') {
                        filtered = filtered.filter(location => location.type === filters.type);
                    }

                    if (filters.region) {
                        filtered = filtered.filter(location => location.region === filters.region);
                    }
                }

                resolve(filtered);
            }, 500);
        });
    }

    async getLocationById(id: string): Promise<Location | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const location = this.locations.find(loc => loc.id === id);
                resolve(location || null);
            }, 300);
        });
    }

    async createLocation(locationData: LocationFormData): Promise<Location> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newLocation: Location = {
                    ...locationData,
                    id: this.generateId(),
                    primaryContact: {
                        name: locationData.contactName,
                        email: locationData.contactEmail,
                        phone: locationData.contactPhone || undefined
                    },
                    totalAssets: locationData.totalAssets || 0,
                    region: locationData.region || 'Unknown',
                    capacity: locationData.capacity,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                this.locations.push(newLocation);
                this.saveData();
                resolve(newLocation);
            }, 300);
        });
    }

    async updateLocation(id: string, updates: Partial<LocationFormData>): Promise<Location> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.locations.findIndex(loc => loc.id === id);

                if (index === -1) {
                    reject(new Error('Location not found'));
                    return;
                }

                const existingLocation = this.locations[index];
                const updatedLocation: Location = {
                    ...existingLocation,
                    name: updates.name ?? existingLocation.name,
                    address: updates.address ?? existingLocation.address,
                    type: updates.type ?? existingLocation.type,
                    status: updates.status ?? existingLocation.status,
                    totalAssets: updates.totalAssets ?? existingLocation.totalAssets,
                    region: updates.region ?? existingLocation.region ?? 'Unknown',
                    description: updates.description !== undefined ? updates.description : existingLocation.description,
                    capacity: updates.capacity !== undefined ? updates.capacity : existingLocation.capacity,
                    primaryContact: {
                        name: updates.contactName ?? existingLocation.primaryContact.name,
                        email: updates.contactEmail ?? existingLocation.primaryContact.email,
                        phone: updates.contactPhone !== undefined ? updates.contactPhone : existingLocation.primaryContact.phone
                    },
                    updatedAt: new Date()
                };

                this.locations[index] = updatedLocation;
                this.saveData();
                resolve(updatedLocation);
            }, 300);
        });
    }

    async deleteLocation(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.locations.findIndex(loc => loc.id === id);

                if (index === -1) {
                    reject(new Error('Location not found'));
                    return;
                }

                this.locations.splice(index, 1);
                this.saveData();
                resolve();
            }, 300);
        });
    }

    async getLocationStats(): Promise<LocationStats> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const totalLocations = this.locations.length;
                const totalAssets = this.locations.reduce((sum, loc) => sum + loc.totalAssets, 0);
                const activeHubs = this.locations.filter(l =>
                    (l.type === 'hub' || l.type === 'hq') && l.status === 'active'
                ).length;
                const maintenanceLocations = this.locations.filter(l => l.status === 'maintenance').length;

                const locationsByType: Record<string, number> = {};
                const locationsByStatus: Record<string, number> = {};

                this.locations.forEach(location => {
                    locationsByType[location.type] = (locationsByType[location.type] || 0) + 1;
                    locationsByStatus[location.status] = (locationsByStatus[location.status] || 0) + 1;
                });

                resolve({
                    totalLocations,
                    totalAssets,
                    activeHubs,
                    maintenanceLocations,
                    locationsByType,
                    locationsByStatus
                });
            }, 200);
        });
    }

    validateLocation(data: LocationFormData): { isValid: boolean; errors: Record<string, string> } {
        const validationResult = LocationValidation.validateLocationForm(data);

        return {
            isValid: validationResult.isValid,
            errors: LocationValidation.formatFormErrors(validationResult.errors)
        };
    }
}

// Singleton instance
export const locationService = new LocationService();