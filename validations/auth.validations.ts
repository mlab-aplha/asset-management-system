export class AuthValidations {
  // Valid mLab email domains
  static validEmailDomains = [
    'mlab.co.za',
    'mlab.org.za'
  ];

  // Valid roles for mLab South Africa
  static validRoles = [
    'admin',
    'manager', 
    'user'
  ] as const;

  // Valid departments
  static validDepartments = [
    'IT',
    'Finance',
    'Operations',
    'Management',
    'Media',
    'Training',
    'Research',
    'Administration',
    'Other'
  ];

  // Validate email (mLab South Africa specific)
  static validateMlabEmail(email: string): { isValid: boolean; message?: string } {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // Check mLab domain
    const domain = email.split('@')[1];
    if (!this.validEmailDomains.includes(domain)) {
      return { 
        isValid: false, 
        message: `Email must be from mLab domain (@${this.validEmailDomains.join(' or @')})` 
      };
    }

    return { isValid: true };
  }

  // Validate South African phone number
  static validateSouthAfricanPhone(phone: string): { isValid: boolean; formatted?: string; message?: string } {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    // Remove all spaces and special characters
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // South African phone regex
    const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
    
    if (!saPhoneRegex.test(cleanPhone)) {
      return { 
        isValid: false, 
        message: 'Invalid South African phone number. Use format: +27 82 123 4567 or 082 123 4567' 
      };
    }

    // Format to standard +27 format
    let formatted = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formatted = '+27' + cleanPhone.substring(1);
    }

    // Add spacing for display: +27 82 123 4567
    const displayFormat = formatted.replace(/(\+27)(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');

    return { 
      isValid: true, 
      formatted: formatted, // For storage
      message: displayFormat // For display
    };
  }

  // Validate password strength
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      return { 
        isValid: false, 
        message: errors.join('. ') 
      };
    }

    return { isValid: true };
  }

  // Validate user registration data
  static validateUserRegistration(data: any): { isValid: boolean; errors: string[]; cleanedData?: any } {
    const errors: string[] = [];
    const cleanedData: any = { ...data };

    // Email validation
    const emailValidation = this.validateMlabEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.message!);
    }

    // Phone validation
    const phoneValidation = this.validateSouthAfricanPhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.message!);
    } else {
      cleanedData.phone = phoneValidation.formatted; // Store formatted phone
    }

    // Password validation
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(passwordValidation.message!);
    }

    // Display name validation
    if (!data.displayName || data.displayName.trim().length < 2) {
      errors.push('Display name must be at least 2 characters');
    } else if (data.displayName.length > 50) {
      errors.push('Display name cannot exceed 50 characters');
    }

    // Hub validation (mLab South Africa specific)
    if (!data.hub) {
      errors.push('Hub is required');
    } else if (!['Tshwane', 'Polokwane', 'Galeshewe'].includes(data.hub)) {
      errors.push('Hub must be Tshwane, Polokwane, or Galeshewe');
    }

    // Department validation
    if (data.department && !this.validDepartments.includes(data.department)) {
      errors.push(`Invalid department. Must be one of: ${this.validDepartments.join(', ')}`);
    }

    // Role validation
    if (data.role && !this.validRoles.includes(data.role)) {
      errors.push(`Invalid role. Must be one of: ${this.validRoles.join(', ')}`);
    }

    // Set default role if not provided
    if (!data.role) {
      cleanedData.role = 'user';
    }

    return {
      isValid: errors.length === 0,
      errors,
      cleanedData: errors.length === 0 ? cleanedData : undefined
    };
  }

  // Validate user login data
  static validateUserLogin(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    const emailValidation = this.validateMlabEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.message!);
    }

    // Password validation
    if (!data.password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate user update data
  static validateUserUpdate(data: any): { isValid: boolean; errors: string[]; cleanedData?: any } {
    const errors: string[] = [];
    const cleanedData: any = { ...data };

    // Phone validation (if provided)
    if (data.phone) {
      const phoneValidation = this.validateSouthAfricanPhone(data.phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.message!);
      } else {
        cleanedData.phone = phoneValidation.formatted;
      }
    }

    // Email validation (if provided)
    if (data.email) {
      const emailValidation = this.validateMlabEmail(data.email);
      if (!emailValidation.isValid) {
        errors.push(emailValidation.message!);
      }
    }

    // Display name validation (if provided)
    if (data.displayName !== undefined) {
      if (data.displayName.trim().length < 2) {
        errors.push('Display name must be at least 2 characters');
      } else if (data.displayName.length > 50) {
        errors.push('Display name cannot exceed 50 characters');
      }
    }

    // Hub validation (if provided)
    if (data.hub && !['Tshwane', 'Polokwane', 'Galeshewe'].includes(data.hub)) {
      errors.push('Hub must be Tshwane, Polokwane, or Galeshewe');
    }

    // Department validation (if provided)
    if (data.department && !this.validDepartments.includes(data.department)) {
      errors.push(`Invalid department. Must be one of: ${this.validDepartments.join(', ')}`);
    }

    // Role validation (if provided)
    if (data.role && !this.validRoles.includes(data.role)) {
      errors.push(`Invalid role. Must be one of: ${this.validRoles.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      cleanedData: errors.length === 0 ? cleanedData : undefined
    };
  }

  // Generate user ID (optional, Firebase does this automatically)
  static generateUserId(email: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const emailPrefix = email.split('@')[0].substring(0, 5).toLowerCase();
    
    return `user_${emailPrefix}_${timestamp}_${random}`;
  }
}