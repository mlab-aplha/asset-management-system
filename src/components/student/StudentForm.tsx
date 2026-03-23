import React, { useState, useEffect } from 'react';
import './StudentForm.css';

interface StudentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: any;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, onCancel, loading, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    course: 'Web Development',
    cohort: 'Cohort 1',
    hub: 'Tshwane',
    status: 'active',
    phone: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    password: ''
  });

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | 'very-strong'>('weak');
  const [showPassword, setShowPassword] = useState(false);

  // Course options
  const courses = [
    'Web Development',
    'Data Science',
    'Software Engineering',
    'Cloud Computing',
    'Cybersecurity',
    'Mobile Development',
    'UI/UX Design'
  ];

  // Cohort options
  const cohorts = [
    'Cohort 1',
    'Cohort 2',
    'Cohort 3',
    'Cohort 4',
    'Cohort 5'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        studentId: initialData.studentId || '',
        course: initialData.course || 'Web Development',
        cohort: initialData.cohort || 'Cohort 1',
        hub: initialData.hub || 'Tshwane',
        status: initialData.status || 'active',
        phone: initialData.phone || '',
        enrollmentDate: initialData.enrollmentDate ? new Date(initialData.enrollmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        password: ''
      });
    }
  }, [initialData]);

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
    checkPasswordStrength(password);
  };

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength <= 1) setPasswordStrength('weak');
    else if (strength === 2) setPasswordStrength('medium');
    else if (strength === 3) setPasswordStrength('strong');
    else setPasswordStrength('very-strong');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, password: value }));
    checkPasswordStrength(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      case 'very-strong': return '#94c73d';
      default: return '#ef4444';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
      default: return 'Weak';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <div className="form-group">
        <label>FIRST NAME *</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="Enter first name"
        />
      </div>

      <div className="form-group">
        <label>LAST NAME *</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Enter last name"
        />
      </div>

      <div className="form-group">
        <label>EMAIL ADDRESS *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="student@example.com"
          disabled={!!initialData}
        />
        {initialData && <small>Email cannot be changed</small>}
      </div>

      <div className="form-group">
        <label>STUDENT ID *</label>
        <input
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          required
          placeholder="STU001"
          disabled={!!initialData}
        />
        {initialData && <small>Student ID cannot be changed</small>}
      </div>

      <div className="form-group">
        <label>COURSE *</label>
        <select name="course" value={formData.course} onChange={handleChange} required>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>COHORT *</label>
        <select name="cohort" value={formData.cohort} onChange={handleChange} required>
          {cohorts.map(cohort => (
            <option key={cohort} value={cohort}>{cohort}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>HUB *</label>
        <select name="hub" value={formData.hub} onChange={handleChange} required>
          <option value="Tshwane">Tshwane</option>
          <option value="Polokwane">Polokwane</option>
          <option value="Galeshewe">Galeshewe</option>
        </select>
      </div>

      <div className="form-group">
        <label>STATUS *</label>
        <select name="status" value={formData.status} onChange={handleChange} required>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
          <option value="dropped">Dropped</option>
        </select>
      </div>

      <div className="form-group">
        <label>PHONE</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+27 12 345 6789"
        />
      </div>

      <div className="form-group">
        <label>ENROLLMENT DATE</label>
        <input
          type="date"
          name="enrollmentDate"
          value={formData.enrollmentDate}
          onChange={handleChange}
        />
      </div>

      {!initialData && (
        <div className="form-group">
          <label>PASSWORD *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              required
              placeholder="Enter password"
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="password-actions">
            <button type="button" className="auto-generate-btn" onClick={generatePassword}>
              Auto-generate
            </button>
          </div>
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${passwordStrength === 'weak' ? 25 : passwordStrength === 'medium' ? 50 : passwordStrength === 'strong' ? 75 : 100}%`,
                    backgroundColor: getStrengthColor()
                  }}
                />
              </div>
              <span className="strength-text" style={{ color: getStrengthColor() }}>
                {getStrengthText()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Student' : 'Create Student')}
        </button>
      </div>

      <style>{`
        .password-input-wrapper {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .password-input-wrapper input {
          flex: 1;
        }
        .password-toggle {
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.25rem;
          color: white;
          cursor: pointer;
        }
        .password-actions {
          margin-top: 0.5rem;
        }
        .auto-generate-btn {
          padding: 0.25rem 0.75rem;
          background: rgba(148, 199, 61, 0.2);
          border: 1px solid rgba(148, 199, 61, 0.3);
          border-radius: 0.25rem;
          color: #94c73d;
          cursor: pointer;
          font-size: 0.75rem;
        }
        .password-strength {
          margin-top: 0.5rem;
        }
        .strength-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }
        .strength-fill {
          height: 100%;
          transition: width 0.3s;
        }
        .strength-text {
          font-size: 0.7rem;
        }
      `}</style>
    </form>
  );
};
