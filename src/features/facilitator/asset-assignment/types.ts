 // ============================================================================
// USER TYPES
// ============================================================================
export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: 'user' | 'facilitator' | 'admin';  // ✅ Fixed: literal union
  avatar?: string;                          // ✅ Added
  phone?: string;                          // ✅ Added
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ============================================================================
// ASSET TYPES
// ============================================================================
export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  location?: string;
  imageUrl?: string;
  purchaseDate?: Date | string;            // ✅ Added
  purchasePrice?: number;                 // ✅ Added
  currentValue?: number;                 // ✅ Added
  notes?: string;                        // ✅ Added
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ============================================================================
// ASSIGNMENT REQUEST TYPES
// ============================================================================
export interface AssignmentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment?: string;
  assetId: string;
  assetName: string;
  assetSerialNumber: string;
  requestedDate: Date | string;
  expectedReturnDate: Date | string;
  purpose: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'overdue';
  facilitatorNotes?: string;
  approvedDate?: Date | string | null;     // ✅ Fixed: allow null
  approvedBy?: string;
  rejectedDate?: Date | string | null;     // ✅ Fixed: allow null
  rejectedBy?: string;
  rejectionReason?: string;
  completedDate?: Date | string | null;    // ✅ Fixed: allow null
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// ASSIGNMENT TYPES
// ============================================================================
export interface Assignment {
  id: string;
  requestId?: string;
  userId: string;
  userName: string;
  userEmail?: string;                     // ✅ Added
  userDepartment?: string;               // ✅ Added
  assetId: string;
  assetName: string;
  assetSerialNumber?: string;           // ✅ Added
  assignedDate: Date | string;
  expectedReturnDate: Date | string;
  actualReturnDate?: Date | string | null;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  conditionAtCheckout: string;
  conditionAtReturn?: string | null;
  facilitatorId: string;
  facilitatorName: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================
export interface AssignmentFormData {
  userId: string;
  assetId: string;
  expectedReturnDate: string;
  purpose: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export interface CheckoutData {            // ✅ ADDED - for CheckoutForm
  assetId: string;
  userId: string;
  expectedReturnDate: string;
  conditionAtCheckout: string;
  notes?: string;
}

export interface ReturnData {             // ✅ ADDED - for ReturnForm
  assignmentId: string;
  conditionAtReturn: string;
  notes?: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================
export interface RequestFilter {
  status?: AssignmentRequest['status'];
  priority?: AssignmentRequest['priority'];
  userId?: string;
  assetId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

export interface AssignmentFilter {        // ✅ ADDED
  status?: Assignment['status'];
  userId?: string;
  assetId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  overdue?: boolean;
}

// ============================================================================
// DASHBOARD STATS TYPES
// ============================================================================
export interface DashboardStats {         // ✅ ADDED - for FacilitatorDashboard
  totalPending: number;
  urgentRequests: number;
  activeAssignments: number;
  overdueReturns: number;
  availableAssets: number;
  assetsInMaintenance: number;
  totalAssets: number;
  utilizationRate: number;
  assignmentsToday: number;
  returnsToday: number;
}

export interface AssignmentStats {        // ✅ Keep existing
  totalPending: number;
  urgentRequests: number;
  approvedToday: number;
  activeAssignments: number;
  overdueReturns: number;
  availableAssets: number;
}

// ============================================================================
// REPORT TYPES
// ============================================================================
export interface AssetUsageData {         // ✅ ADDED - for AssetUsageReport
  assetId: string;
  assetName: string;
  category: string;
  totalAssignments: number;
  totalDays: number;
  currentUser?: string;
  lastAssigned?: Date | string;
  status: string;
}

export interface UserActivityData {      // ✅ ADDED - for UserActivityReport
  userId: string;
  userName: string;
  department: string;
  totalAssignments: number;
  activeAssignments: number;
  overdueReturns: number;
  lastAssignment?: Date | string;
  mostUsedCategory: string;
}

export interface MaintenanceData {       // ✅ ADDED - for MaintenanceReport
  assetId: string;
  assetName: string;
  category: string;
  lastMaintenance?: Date | string | null;
  nextMaintenance?: Date | string | null;
  maintenanceCount: number;
  totalCost: number;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// DASHBOARD COMPONENT TYPES
// ============================================================================
export interface PendingRequest {        // ✅ ADDED - for PendingRequests component
  id: string;
  userName: string;
  assetName: string;
  requestedDate: Date | string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  purpose: string;
}

export interface OverdueAssignment {     // ✅ ADDED - for OverdueAssets component
  id: string;
  assetName: string;
  assetSerialNumber: string;
  userName: string;
  userEmail: string;
  expectedReturnDate: Date | string;
  daysOverdue: number;
}

// ============================================================================
// CHECKOUT HISTORY TYPES
// ============================================================================
export interface CheckoutHistoryItem {   // ✅ ADDED - for CheckoutHistory
  id: string;
  assetName: string;
  assetSerialNumber: string;
  userName: string;
  userEmail: string;
  checkoutDate: Date | string;
  expectedReturnDate: Date | string;
  actualReturnDate?: Date | string | null;
  status: string;
  conditionAtCheckout: string;
  conditionAtReturn?: string | null;
  facilitatorName: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================
export interface ApiResponse<T = any> {  // ✅ ADDED
  success: boolean;
  data?: T;
  error?: string;
  id?: string;
}

export interface PaginatedResponse<T = any> {  // ✅ ADDED
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}