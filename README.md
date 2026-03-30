# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# User Credentials & Database Setup

## 📋 Default User Accounts
# 📋 TEST USER CREDENTIALS DOCUMENTATION

## System Access Credentials

### Super Administrator (Full System Access)
| Field | Value |
|-------|-------|
| Email | test.superadmin@mlab.co.za |
| Password | SuperAdmin123!@# |
| Role | super_admin |
| Department | System Administration |
| Hub | Pretoria |
| Permissions | Full system access, manage all users, assets, locations |

### Hub Manager (Hub Level Management)
| Field | Value |
|-------|-------|
| Email | test.hubmanager@mlab.co.za |
| Password | HubManager123!@# |
| Role | hub_manager |
| Department | Hub Management |
| Hub | Pretoria |
| Permissions | Manage hub operations, facilitators, assets |

### Asset Facilitator (Asset Operations)
| Field | Value |
|-------|-------|
| Email | test.facilitator@mlab.co.za |
| Password | Facilitator123!@# |
| Role | asset_facilitator |
| Department | Asset Management |
| Hub | Pretoria |
| Permissions | Manage assets, process student requests |

### IT Technician (Technical Support)
| Field | Value |
|-------|-------|
| Email | test.it@mlab.co.za |
| Password | ITTechnician123!@# |
| Role | it |
| Department | Information Technology |
| Hub | Pretoria |
| Permissions | Manage technical assets and maintenance |

### Students (End Users)

| Name | Email | Password | Role | Course | Hub |
|------|-------|----------|------|--------|-----|
| Test Student | test.student@mlab.co.za | Student123!@# | student | Learning & Development | Cape Town |
| Jane Smith | test.student2@mlab.co.za | Student123!@# | student | Software Development | Tshwane |
| John Doe | test.student3@mlab.co.za | Student123!@# | student | Data Science | Kimberley |

## Existing System Users (Pre-migration)

| Name | Email | Role |
|------|-------|------|
| Administrator | admin@mlab.com | super_admin |
| Mbuso | facilitator@mlab.co.za | asset_facilitator |
| Mbuso Mulaudzi | mbuso.mulaudzi@mlab.com | asset_facilitator |
| John asuha | user122@example.com | asset_facilitator |

## Password Requirements

All passwords must meet these criteria:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

## Quick Login Reference

```
Super Admin:     test.superadmin@mlab.co.za / SuperAdmin123!@#
Hub Manager:     test.hubmanager@mlab.co.za / HubManager123!@#
Facilitator:     test.facilitator@mlab.co.za / Facilitator123!@#
IT Technician:   test.it@mlab.co.za / ITTechnician123!@#
Student 1:       test.student@mlab.co.za / Student123!@#
Student 2:       test.student2@mlab.co.za / Student123!@#
Student 3:       test.student3@mlab.co.za / Student123!@#
```

## Database Collections Summary

After migration, the following collections are populated:

| Collection | Document Count | Description |
|------------|---------------|-------------|
| users | 10+ | All user accounts with roles |
| student_profiles | 6 | Educational data for students |
| assets | 57 | Asset inventory |
| locations | 15 | Hub and location data |

## Role Hierarchy

```
super_admin (Super Admin)
    ↓
hub_manager (Hub Manager)
    ↓
asset_facilitator (Asset Facilitator)
    ↓
it (IT Technician)
    ↓
student (Student)
```


## 🔐 Password Requirements
All passwords must meet these criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

## 🗄️ Database Migration Setup

### Prerequisites
1. Firebase project with Firestore database enabled
2. Service account key JSON file from Firebase Console

### Migration Steps

#### 1. Create Migration Directory
```bash
mkdir database-migration
cd database-migration
