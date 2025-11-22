import { Role } from './permissions';

/**
 * Get the appropriate dashboard route based on user role
 */
export function getDashboardRoute(role: Role | undefined): string {
    if (!role) return '/dashboard';

    switch (role) {
        case 'admin':
            return '/dashboard/admin';
        case 'agent':
            return '/dashboard'; // Agents use the regular user dashboard
        case 'user':
        case 'guest':
        default:
            return '/dashboard';
    }
}

/**
 * Get the appropriate dashboard label based on user role
 */
export function getDashboardLabel(role: Role | undefined): string {
    if (!role) return 'Dashboard';

    switch (role) {
        case 'admin':
            return 'Admin Dashboard';
        case 'agent':
            return 'Agent Dashboard';
        case 'user':
        case 'guest':
        default:
            return 'Dashboard';
    }
}
