export type Role = 'admin' | 'agent' | 'user' | 'guest';

export type Permission =
    // Dashboard Access
    | 'access_admin_panel'
    | 'access_agent_panel'
    | 'access_customer_panel'

    // Admin Actions
    | 'manage_users'
    | 'manage_all_orders'
    | 'manage_topups'
    | 'manage_validations'
    | 'manage_stores'
    | 'send_sms'
    | 'perform_manual_transaction'

    // Agent Actions
    | 'view_agent_stats'
    | 'manage_agent_orders'

    // User Actions
    | 'view_wallet'
    | 'make_purchase'
    | 'request_agent_upgrade'
    ;

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    admin: [
        'access_admin_panel',
        'access_customer_panel',
        'manage_users',
        'manage_all_orders',
        'manage_topups',
        'manage_validations',
        'manage_stores',
        'send_sms',
        'perform_manual_transaction',
        'view_wallet',
        'make_purchase'
    ],
    agent: [
        'access_agent_panel',
        'access_customer_panel',
        'view_agent_stats',
        'manage_agent_orders',
        'view_wallet',
        'make_purchase'
    ],
    user: [
        'access_customer_panel',
        'view_wallet',
        'make_purchase',
        'request_agent_upgrade'
    ],
    guest: []
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function hasAnyPermission(role: Role | undefined, permissions: Permission[]): boolean {
    if (!role) return false;
    return permissions.some(permission => hasPermission(role, permission));
}
