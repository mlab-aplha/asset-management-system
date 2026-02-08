export class AssetValidations {
  // Valid categories for mLab South Africa
  static validCategories = [
    'Laptop',
    'Workstation', 
    'Tablet',
    'Camera',
    'Server',
    'Network Equipment',
    'Printer',
    'Projector',
    'Monitor',
    'Phone',
    'Other'
  ] as const;

  // Valid statuses
  static validStatuses = [
    'available',
    'assigned', 
    'maintenance',
    'retired'
  ] as const;

  // Valid mLab South Africa locations
  static validLocations = [
    'Tshwane',
    'Polokwane',
    'Galeshewe'
  ] as const;

  // Validate asset creation data
  static validateCreateAsset(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    const requiredFields = ['name', 'category', 'location', 'value', 'purchaseDate'];
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    });

    // Name validation
    if (data.name && (data.name.length < 2 || data.name.length > 100)) {
      errors.push('Asset name must be between 2 and 100 characters');
    }

    // Category validation
    if (data.category && !this.validCategories.includes(data.category)) {
      errors.push(`Invalid category. Must be one of: ${this.validCategories.join(', ')}`);
    }

    // Location validation (mLab South Africa specific)
    if (data.location && !this.validLocations.includes(data.location)) {
      errors.push(`Invalid location. Must be one of: ${this.validLocations.join(', ')}`);
    }

    // Value validation (ZAR currency)
    if (data.value !== undefined) {
      if (typeof data.value !== 'number') {
        errors.push('Value must be a number (ZAR)');
      } else if (data.value <= 0) {
        errors.push('Value must be positive (ZAR)');
      } else if (data.value > 10000000) { // 10 million ZAR max
        errors.push('Value cannot exceed 10,000,000 ZAR');
      }
    }

    // Purchase date validation
    if (data.purchaseDate) {
      const purchaseDate = new Date(data.purchaseDate);
      const today = new Date();
      
      if (isNaN(purchaseDate.getTime())) {
        errors.push('Invalid purchase date');
      } else if (purchaseDate > today) {
        errors.push('Purchase date cannot be in the future');
      } else if (purchaseDate < new Date('2000-01-01')) {
        errors.push('Purchase date cannot be before 2000');
      }
    }

    // Serial number validation (optional)
    if (data.serialNumber && data.serialNumber.length > 50) {
      errors.push('Serial number cannot exceed 50 characters');
    }

    // Manufacturer validation (optional)
    if (data.manufacturer && data.manufacturer.length > 50) {
      errors.push('Manufacturer name cannot exceed 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate asset update data
  static validateUpdateAsset(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Status validation
    if (data.status && !this.validStatuses.includes(data.status)) {
      errors.push(`Invalid status. Must be one of: ${this.validStatuses.join(', ')}`);
    }

    // Location validation
    if (data.location && !this.validLocations.includes(data.location)) {
      errors.push(`Invalid location. Must be one of: ${this.validLocations.join(', ')}`);
    }

    // Value validation
    if (data.value !== undefined) {
      if (typeof data.value !== 'number') {
        errors.push('Value must be a number (ZAR)');
      } else if (data.value <= 0) {
        errors.push('Value must be positive (ZAR)');
      }
    }

    // Assigned user validation
    if (data.assignedTo && data.assignedTo.length > 100) {
      errors.push('Invalid assigned user ID');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate South African Rand (ZAR) formatting
  static formatZAR(value: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  // Generate asset ID (ASSET-001, ASSET-002, etc.)
  static generateAssetId(lastId?: string): string {
    if (!lastId) return 'ASSET-001';
    
    const match = lastId.match(/ASSET-(\d+)/);
    if (!match) return 'ASSET-001';
    
    const lastNum = parseInt(match[1], 10);
    const nextNum = lastNum + 1;
    
    return `ASSET-${nextNum.toString().padStart(3, '0')}`;
  }

  // Calculate depreciation (South Africa tax rules)
  static calculateDepreciation(purchaseDate: Date, purchaseValue: number): number {
    const today = new Date();
    const monthsOwned = Math.max(0, 
      (today.getFullYear() - purchaseDate.getFullYear()) * 12 + 
      (today.getMonth() - purchaseDate.getMonth())
    );
    
    // South Africa: Computers depreciate 33.3% per year (SARS rules)
    const annualDepreciationRate = 0.333;
    const monthlyRate = annualDepreciationRate / 12;
    const totalDepreciation = purchaseValue * monthlyRate * monthsOwned;
    
    return Math.max(0, purchaseValue - totalDepreciation);
  }
}