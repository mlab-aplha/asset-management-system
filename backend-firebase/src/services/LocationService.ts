import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface Location {
    id: string;
    name: string;
    type: string;
    status: string;
    code: string;
    capacity: {
        availableCapacity: number;
        currentAssets: number;
        maxAssets: number;
    };
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateLocationData {
    name: string;
    type: string;
    status: string;
    code: string;
    capacity: {
        availableCapacity: number;
        currentAssets: number;
        maxAssets: number;
    };
    address?: string;
}

export interface UpdateLocationData {
    name?: string;
    type?: string;
    status?: string;
    code?: string;
    capacity?: {
        availableCapacity?: number;
        currentAssets?: number;
        maxAssets?: number;
    };
    address?: string;
}

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export class LocationService {
    private static collectionName = 'locations';

    static async getAllLocations(): Promise<ServiceResponse<Location[]>> {
        try {
            const locationsRef = collection(db, this.collectionName);
            const q = query(locationsRef, orderBy("name", "asc"));
            const snapshot = await getDocs(q);

            const locations = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || '',
                    type: data.type || 'hub',
                    status: data.status || 'active',
                    code: data.code || '',
                    capacity: data.capacity || {
                        availableCapacity: 0,
                        currentAssets: 0,
                        maxAssets: 0
                    },
                    address: data.address || '',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as Location;
            });

            return {
                success: true,
                data: locations
            };
        } catch (error) {
            console.error('Get locations error:', error);
            return {
                success: false,
                message: 'Failed to fetch locations',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async getLocation(id: string): Promise<ServiceResponse<Location>> {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const location = {
                    id: docSnap.id,
                    name: data.name || '',
                    type: data.type || 'hub',
                    status: data.status || 'active',
                    code: data.code || '',
                    capacity: data.capacity || {
                        availableCapacity: 0,
                        currentAssets: 0,
                        maxAssets: 0
                    },
                    address: data.address || '',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as Location;

                return {
                    success: true,
                    data: location
                };
            } else {
                return {
                    success: false,
                    message: 'Location not found'
                };
            }
        } catch (error) {
            console.error('Get location error:', error);
            return {
                success: false,
                message: 'Failed to fetch location',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async createLocation(locationData: CreateLocationData): Promise<ServiceResponse<{ id: string }>> {
        try {
            console.log('Creating location with data:', locationData);

            const capacity = {
                availableCapacity: locationData.capacity.availableCapacity || 0,
                currentAssets: locationData.capacity.currentAssets || 0,
                maxAssets: locationData.capacity.maxAssets || 0
            };

            const location = {
                name: locationData.name,
                type: locationData.type,
                status: locationData.status,
                code: locationData.code,
                capacity: capacity,
                address: locationData.address || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const locationsRef = collection(db, this.collectionName);
            const docRef = await addDoc(locationsRef, location);

            return {
                success: true,
                data: { id: docRef.id },
                message: 'Location created successfully'
            };
        } catch (error) {
            console.error('Create location error:', error);
            return {
                success: false,
                message: 'Failed to create location',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async updateLocation(id: string, updates: UpdateLocationData): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, this.collectionName, id);

            const updateData: Record<string, unknown> = {
                updatedAt: serverTimestamp()
            };

            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.type !== undefined) updateData.type = updates.type;
            if (updates.status !== undefined) updateData.status = updates.status;
            if (updates.code !== undefined) updateData.code = updates.code;
            if (updates.address !== undefined) updateData.address = updates.address;

            if (updates.capacity !== undefined) {
                updateData.capacity = {
                    availableCapacity: updates.capacity.availableCapacity,
                    currentAssets: updates.capacity.currentAssets,
                    maxAssets: updates.capacity.maxAssets
                };
            }

            console.log('Updating location with data:', updateData);

            // Disable ESLint for this line only
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updateDoc(docRef, updateData as any);

            return {
                success: true,
                message: 'Location updated successfully'
            };
        } catch (error) {
            console.error('Update location error:', error);
            return {
                success: false,
                message: 'Failed to update location',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async deleteLocation(id: string): Promise<ServiceResponse> {
        try {
            await deleteDoc(doc(db, this.collectionName, id));
            return {
                success: true,
                message: 'Location deleted successfully'
            };
        } catch (error) {
            console.error('Delete location error:', error);
            return {
                success: false,
                message: 'Failed to delete location',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static generateLocationCode(locationName: string): string {
        const nameParts = locationName.toLowerCase().split(' ');
        let code = 'MLAB-';

        if (nameParts.includes('johannesburg') || nameParts.includes('jhb')) {
            code += 'JHB';
        } else if (nameParts.includes('pretoria') || nameParts.includes('pta')) {
            code += 'PTA';
        } else if (nameParts.includes('cape') || nameParts.includes('ct')) {
            code += 'CT';
        } else if (nameParts.includes('durban') || nameParts.includes('dbn')) {
            code += 'DBN';
        } else {
            code += nameParts.map(part => part.substring(0, 3).toUpperCase()).join('');
        }

        if (nameParts.includes('headquarters') || nameParts.includes('hq')) {
            code += '-HQ';
        } else if (nameParts.includes('hub')) {
            code += '-HUB';
        }

        return code;
    }
}