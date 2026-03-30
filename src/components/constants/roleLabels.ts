// src/components/constants/roleLabels.ts
import { UserRole } from '@/core/entities/User';

export const ROLE_LABELS: Record<UserRole, string> = {
    super_admin: 'Super Admins',
    hub_manager: 'Hub Managers',
    it: 'IT',
    asset_facilitator: 'Facilitators',
    student: 'Students',
};