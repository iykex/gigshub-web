---
description: How to manage the Admin Dashboard
---

# Admin Dashboard Management

This workflow describes how to manage the Admin Dashboard modules.

## Prerequisites
- You must be logged in as a user with the `admin` role.
- The application must be running (`npm run dev` or deployed).

## Accessing the Dashboard
1. Log in to the application.
2. If you are an admin, you will see an "Admin Dashboard" link in the sidebar.
3. Click on it to access the overview at `/dashboard/admin`.

## Modules

### 1. User Management (`/dashboard/admin/users`)
- **View Users**: See a list of all registered users and agents.
- **Search**: Filter users by name, email, or phone (server-side).
- **Actions**:
    - **Edit Role**: Change a user's role (Guest, User, Agent, Admin).
    - **Ban User**: (Coming soon).
- **Pagination**: Navigate through pages of users.

### 2. Order Management (`/dashboard/admin/orders`)
- **View Orders**: See all customer orders.
- **Search**: Filter orders by ID, customer name/email, or product name (server-side).
- **Actions**:
    - **Mark Success**: Manually mark an order as successful.
    - **Mark Failed**: Manually mark an order as failed.
- **Status**: Monitor order status (pending, success, failed).

### 3. Wallet Topups (`/dashboard/admin/topups`)
- **View Requests**: See manual wallet funding requests.
- **Approve**: Click the checkmark to approve a topup. This will:
    - Update the request status to `approved`.
    - Credit the user's wallet.
    - Create a transaction record in `wallet_ledger`.
- **Reject**: Click the X to reject a request.

### 4. Agent Validations (`/dashboard/admin/validations`)
- **View Applications**: See users applying to be agents.
- **Approve**: Click the checkmark to approve. This will:
    - Update status to `approved`.
    - Change the user's role to `agent`.
- **Reject**: Click the X to reject.

### 5. Store & Pricing (`/dashboard/admin/stores`)
- **Manage Products**: View data bundles grouped by provider (MTN, Telecel, AT).
- **Update Price**: Edit the "Price" and "Agent Price" fields.
- **Toggle Availability**: Use the switch to enable/disable a product.
- **Save**: Click the save icon to persist changes. Changes are logged in `pricing_audit`.

### 6. SMS Campaigns (`/dashboard/admin/sms`)
- *Currently under development.*

## Troubleshooting
- **Data not loading**: Check your internet connection. The dashboard uses `swr` for caching and revalidation.
- **Actions failing**: Ensure you have the correct permissions and the database is reachable. Check the browser console for error details.
