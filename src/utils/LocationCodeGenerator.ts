// src/utils/LocationCodeGenerator.ts
export class LocationCodeGenerator {
    private static readonly LOCATION_CODES: Record<string, string> = {
        'pretoria': 'PRT',
        'johannesburg': 'JHB',
        'cape town': 'CPT',
        'durban': 'DBN',
        'bloemfontein': 'BFN',
        'polokwane': 'PLK',
        'tshwane': 'TSH',
        'port elizabeth': 'PE',
        'east london': 'EL',
        'kimberley': 'KIM',
        'upington': 'UPN',
        'nelspruit': 'NEL',
        'mbombela': 'MBB',
        'soweto': 'SWT',
        'tembisa': 'TMB',
        'imbali': 'IMB',
        'rustenburg': 'RBT',
        'witbank': 'WTB'
    } as const;

    private static readonly TYPE_PREFIXES: Record<string, string> = {
        'hq': 'HQ-',
        'hub': 'HUB-',
        'site': 'ST-',
        'branch': 'BR-',
        'other': 'LOC-'
    } as const;

    /**
     * Get location codes (public accessor)
     */
    public static getLocationCodes(): Record<string, string> {
        return { ...this.LOCATION_CODES };
    }

    /**
     * Generates a location code based on location name, type, and existing locations
     */
    public static generate(
        locationName: string,
        locationType: string,
        existingLocations: Array<{ code?: string }> = []
    ): string {
        if (!locationName || !locationType) return '';

        const normalizedName = locationName.toLowerCase().trim();
        const normalizedType = locationType.toLowerCase().trim();

        // Get location code based on city/region name
        let locationPrefix = '';

        // First, try exact match
        if (this.LOCATION_CODES[normalizedName]) {
            locationPrefix = this.LOCATION_CODES[normalizedName];
        } else {
            // Try partial match
            for (const [key, code] of Object.entries(this.LOCATION_CODES)) {
                if (normalizedName.includes(key.toLowerCase())) {
                    locationPrefix = code;
                    break;
                }
            }
        }

        // If no specific code found, use first 3 letters of location
        if (!locationPrefix) {
            locationPrefix = locationName.substring(0, 3).toUpperCase();
        }

        // Get type prefix
        const typePrefix = this.TYPE_PREFIXES[normalizedType] || 'LOC-';

        // Filter existing locations for this location prefix and type
        const similarLocations = existingLocations.filter(loc => {
            if (!loc.code) return false;
            return loc.code.startsWith(`${typePrefix}${locationPrefix}-`);
        });

        // Find the next sequential number
        let maxNumber = 0;
        similarLocations.forEach(loc => {
            if (loc.code) {
                const match = loc.code.match(/\w+-\w+-(\d+)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) maxNumber = num;
                }
            }
        });

        const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
        return `${typePrefix}${locationPrefix}-${nextNumber}`;
    }

    /**
     * Validates a location code format
     */
    public static isValid(code: string): boolean {
        if (!code) return false;
        return /^(HQ|HUB|ST|BR|LOC)-[A-Z]{2,3}-\d{3}$/.test(code);
    }

    /**
     * Extracts information from a location code
     */
    public static parse(code: string): {
        type: string;
        location: string;
        sequence: number;
    } | null {
        if (!this.isValid(code)) return null;

        const match = code.match(/^([A-Z]+)-([A-Z]{2,3})-(\d{3})$/);
        if (!match) return null;

        return {
            type: match[1],
            location: match[2],
            sequence: parseInt(match[3], 10)
        };
    }
}