import type { Asset, CreateAssetDto, UpdateAssetDto, HubLocation, AssetStatus } from '../entities/Asset';

export class AssetService {
    private static readonly API_BASE = '/api/assets';

    static async getAll(): Promise<Asset[]> {
        const response = await fetch(this.API_BASE);
        return response.json();
    }

    static async getById(id: string): Promise<Asset> {
        const response = await fetch(`${this.API_BASE}/${id}`);
        return response.json();
    }

    static async create(asset: CreateAssetDto): Promise<Asset> {
        const response = await fetch(this.API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(asset)
        });
        return response.json();
    }

    static async update(id: string, updates: UpdateAssetDto): Promise<Asset> {
        const response = await fetch(`${this.API_BASE}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return response.json();
    }

    static async delete(id: string): Promise<void> {
        await fetch(`${this.API_BASE}/${id}`, {
            method: 'DELETE'
        });
    }

    static async getByLocation(location: HubLocation): Promise<Asset[]> {
        const response = await fetch(`${this.API_BASE}/location/${location}`);
        return response.json();
    }

    static async getByStatus(status: AssetStatus): Promise<Asset[]> {
        const response = await fetch(`${this.API_BASE}/status/${status}`);
        return response.json();
    }
}