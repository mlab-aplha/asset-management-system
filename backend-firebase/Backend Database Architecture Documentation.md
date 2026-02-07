# **Backend Database Architecture Documentation for mLab South Africa**

## **Database Structure Overview**

### **1. USERS Collection**
Stores system users with authentication and permission data specific to mLab South Africa operations.

**Document Fields:**
- `id` (string): Auto-generated Firestore ID
- `email` (string): User's email address (must be unique across system)
- `displayName` (string): Full name of user
- `role` (string): User role - 'admin', 'manager', or 'user'
- `status` (string): Account status - 'active' or 'inactive'
- `department` (string): User's department/team within mLab
- `phone` (string, optional): South African contact number
- `hub` (string): Associated mLab hub location (Tshwane, Polokwane, or Galeshewe)
- `isActive` (boolean): Account active status
- `createdAt` (timestamp): Account creation date
- `updatedAt` (timestamp): Last update date

**Key Points:**
- Email addresses must follow mLab domain patterns (@mlab.co.za or similar)
- Phone numbers should follow South African format (+27 or 0...)
- Hub assignments must match existing mLab South Africa locations

---

### **2. ASSETS Collection**
Main collection for tracking all mLab organizational assets across South African locations.

**Document Fields:**
- `id` (string): Asset ID (format: ASSET-001)
- `name` (string): Asset name/description
- `category` (string): Asset category - 'Laptop', 'Workstation', 'Tablet', 'Camera', 'Server', 'Network Equipment', etc.
- `status` (string): Current status - 'available', 'assigned', 'maintenance', 'retired'
- `location` (string): Physical mLab location (must be one of: Tshwane, Polokwane, Galeshewe)
- `serialNumber` (string, optional): Manufacturer serial number
- `purchaseDate` (timestamp): Date of purchase
- `value` (number): Monetary value in South African Rand (ZAR)
- `assignedTo` (string, optional): Reference to user ID (if assigned)
- `assignedDate` (timestamp, optional): Date of assignment
- `notes` (string, optional): Additional notes/comments about the asset
- `manufacturer` (string, optional): Manufacturer name
- `description` (string, optional): Detailed description
- `createdAt` (timestamp): Creation date
- `updatedAt` (timestamp): Last update date

**Subcollections:**
- `maintenance_history`: Track maintenance records specific to South African service providers
- `assignment_history`: Track assignment changes across mLab locations

**Important Requirements:**
- All monetary values must be in ZAR
- Location field must reference existing mLab South Africa hubs
- Asset IDs should follow sequential numbering for easy tracking

---

### **3. LOCATIONS Collection**
Manages mLab physical locations across South Africa only.

**Fixed mLab South Africa Locations:**
- **Tshwane** (Headquarters): U8, Enterprise Building, The Innovation Hub, Mark Shuttleworth Street, Tshwane Pretoria, South Africa, 0087
- **Polokwane**: Partnership between mLab, Limpopo Connexion and The Department of Science and Innovation
- **Galeshewe**: Partnership between mLab, the Northern Cape Department of Economic Development and Tourism, Sol Plaatje Municipality, Northern Cape Community Education College, and The Department of Science and Innovation

**Document Fields:**
- `id` (string): Location ID (Tshwane, Polokwane, Galeshewe)
- `name` (string): Location name (Tshwane, Polokwane, Galeshewe)
- `type` (string): Location type - 'hq' (Tshwane), 'hub' (Polokwane, Galeshewe)
- `address` (string): Physical address specific to each location
- `status` (string): Operational status - 'active', 'maintenance', 'offline'
- `totalAssets` (number): Count of assets currently at location
- `primaryContact` (object):
  - `name` (string): mLab contact person name at location
  - `email` (string): mLab contact email (e.g., tshwane@mlab.co.za)
  - `phone` (string): mLab location phone number (South African format)
- `createdAt` (timestamp): Creation date
- `updatedAt` (timestamp): Last update date

**Critical Requirements:**
- Only three locations are allowed in the system
- Addresses must match official mLab South Africa addresses
- Contact information must use mLab domain emails
- No GPS coordinates needed for South Africa-only operations

---

### **4. ASSIGNMENTS Collection**
Tracks asset assignment history within mLab South Africa operations.

**Document Fields:**
- `id` (string): Assignment ID
- `assetId` (string): Reference to asset ID
- `userId` (string): Reference to user ID
- `assignedAt` (timestamp): Assignment date
- `returnedAt` (timestamp, optional): Return date (if returned)
- `condition` (string): Asset condition at assignment - 'excellent', 'good', 'fair', 'poor'
- `notes` (string, optional): Assignment notes
- `createdAt` (timestamp): Creation date

**Assignment Rules:**
- Assets can only be assigned to active mLab users
- Assignment history must be maintained for audit purposes
- Condition assessment required at each assignment

---

### **5. MAINTENANCE_RECORDS Collection**
Tracks maintenance and repair history specific to South African service providers.

**Document Fields:**
- `id` (string): Record ID
- `assetId` (string): Reference to asset ID
- `type` (string): Maintenance type - 'repair', 'service', 'upgrade'
- `description` (string): Description of work done
- `cost` (number): Cost of maintenance in ZAR
- `performedBy` (string): South African technician/company name
- `performedDate` (timestamp): Date maintenance performed
- `nextServiceDate` (timestamp, optional): Next scheduled service
- `status` (string): Completion status - 'completed', 'scheduled', 'cancelled'
- `createdAt` (timestamp): Creation date

---

## **South Africa-Specific Implementation Details**

### **Location Management:**
- Only three mLab South Africa locations are supported
- Tshwane serves as headquarters (type: 'hq')
- Polokwane and Galeshewe serve as hubs (type: 'hub')
- No branch or site locations needed currently

### **Contact Information Format:**
- Phone numbers: South African format (+27 XX XXX XXXX or 0XX XXX XXXX)
- Email addresses: Must use mLab domains
- Addresses: Official mLab South Africa addresses only

### **Currency and Values:**
- All monetary values stored in South African Rand (ZAR)
- Currency formatting applied on frontend
- Historical cost tracking in local currency

---

## **Data Integrity Rules**

### **Location Validation:**
- Location names must exactly match: Tshwane, Polokwane, Galeshewe
- No new locations can be added without system administrator approval
- Address fields must contain valid South African addresses

### **User Validation:**
- Email domain validation for mLab accounts
- Phone number validation for South African format
- Hub assignment must match existing mLab locations

### **Asset Validation:**
- Location references must point to valid mLab South Africa locations
- Serial numbers must be unique within the system
- Value fields must be positive ZAR amounts

---

## **Backend Service Requirements**

### **Location Services Must:**
- Return only mLab South Africa locations
- Validate location references before saving
- Prevent creation of non-mLab locations
- Maintain location contact information accuracy

### **User Services Must:**
- Validate South African phone numbers
- Check email domains for mLab patterns
- Ensure hub assignments are valid mLab locations

### **Asset Services Must:**
- Enforce location validation on all operations
- Track all values in ZAR
- Maintain assignment history for audit compliance

---
