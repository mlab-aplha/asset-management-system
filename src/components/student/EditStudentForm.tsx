import React, { useState, useEffect } from 'react';
import './StudentForm.css';

interface EditStudentFormProps {
  student: any;
  onSubmit: (id: string, data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EditStudentForm: React.FC<EditStudentFormProps> = ({ 
  student, 
  onSubmit, 
  onCancel, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    course: '',
    cohort: '',
    hub: 'Tshwane',
    status: 'active',
    phone: '',
    enrollmentDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        studentId: student.studentId || '',
        course: student.course || '',
        cohort: student.cohort || '',
        hub: student.hub || 'Tshwane',
        status: student.status || 'active',
        phone: student.phone || '',
        enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : ''
      });
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(student.id, formData);
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setIsSubmitting(false);
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
          disabled
        />
        <small>Email cannot be changed</small>
      </div>

      <div className="form-group">
        <label>STUDENT ID</label>
        <input
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          disabled
        />
      </div>

      <div className="form-group">
        <label>COURSE *</label>
        <input
          type="text"
          name="course"
          value={formData.course}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>COHORT *</label>
        <input
          type="text"
          name="cohort"
          value={formData.cohort}
          onChange={handleChange}
          required
        />
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

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading || isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading || isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
