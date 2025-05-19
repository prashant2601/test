// routeConfig.ts
import { lazy } from 'react';
import { AppRoute } from './Routes';

export const routeConfig: AppRoute[] = [
  // Public (Unprotected) Routes
  {
    path: '/login',
    element: lazy(() => import('../pages/LoginPage')),
    type: 'unprotected',
  },
  {
    path: '/auth/forgot-password',
    element: lazy(() => import('../pages/ForgotPasswordPage')),
    type: 'unprotected',
  },
  {
    path: '/auth/reset-password',
    element: lazy(() => import('../pages/ResetPasswordPage')),

    type: 'unprotected',
  },

  // Admin Protected Routes
  {
    path: '/',
    element: lazy(() => import('../pages/admin/adminAppShell/AppShell')),
    type: 'protected',
    children: [
      {
        path: 'partners-and-customers/dashboard',
        element: lazy(
          () =>
            import(
              '../pages/admin/partners-and-customers/MerchantAndCustomersDashbaord'
            )
        ),
        type: 'protected',
      },
      {
        path: 'partners-and-customers/customers',
        element: lazy(
          () => import('../pages/admin/customers/CustomersTabsWrapper')
        ),

        type: 'protected',
      },
      {
        path: 'partners-and-customers/merchants',
        element: lazy(
          () => import('../pages/admin/merchants/DisplayMerchantsGrid')
        ),

        type: 'protected',
      },
      {
        path: 'partners-and-customers/orders',
        element: lazy(() => import('../pages/admin/orders/OrdersTabsWrapper')),

        type: 'protected',
      },
      {
        path: 'swishr-courier/customers',
        element: lazy(
          () =>
            import(
              '../pages/admin/swishrCourier/customers/SwishrCourierCustomersTabsWrapper'
            )
        ),

        type: 'protected',
      },
      {
        path: 'accounting-and-finances/invoices',
        element: lazy(
          () => import('../pages/admin/accounting/InvoicesTabsWrapper')
        ),

        type: 'protected',
      },
      {
        path: 'communications/emails',
        element: lazy(
          () => import('../pages/admin/communications/email/DisplayEmailReport')
        ),

        type: 'protected',
      },
      {
        path: 'accounting-and-finances/refund-details',
        element: lazy(
          () => import('../pages/admin/refunds/DisplayRefundReport')
        ),

        type: 'protected',
      },
      {
        path: 'accounting-and-finances/bank-accounts',
        element: lazy(
          () => import('../pages/admin/bankAccounts/DisplayBankAccounts')
        ),

        type: 'protected',
      },
      {
        path: 'admin-panel-settings/users-roles',
        element: lazy(
          () =>
            import(
              '../pages/admin/adminPanelSetting/usersAndRole/DisplayUsersTabsWrapper'
            )
        ),

        type: 'protected',
      },
      {
        path: 'tax-and-financial-reports/expenses-receipts',
        element: lazy(
          () =>
            import(
              '../pages/admin/tax-and-financial-reports/expenses-receipts/ExpensesAndReceiptsWrapper'
            )
        ),

        type: 'protected',
      },
      {
        path: 'profile',
        element: lazy(() => import('../pages/profile/UserProfile')),

        type: 'protected',
      },
      {
        path: '*',
        element: lazy(() => import('../pages/NotFound')),
        type: 'protected',
      },
    ],
  },

  // Merchant Protected Routes
  {
    path: '/merchant',
    element: lazy(() => import('../pages/admin/adminAppShell/AppShell')),
    type: 'protected',
    protectedForRole: 'merchant',
    children: [
      {
        path: 'dashboard',
        element: lazy(
          () => import('../pages/merchant/dashboard/MerchantDashbaord')
        ),

        type: 'protected',
      },
      {
        path: 'orders',
        element: lazy(
          () => import('../pages/merchant/orders/MerchantOrderHistory')
        ),

        type: 'protected',
      },
      {
        path: 'invoices',
        element: lazy(
          () =>
            import('../pages/merchant/invoices/DisplaySpecificMerchantInvoices')
        ),

        type: 'protected',
      },
      {
        path: 'profile',
        element: lazy(() => import('../pages/profile/UserProfile')),

        type: 'protected',
      },
      {
        path: 'unauthorized',
        element: lazy(() => import('../pages/UnAuthorizedPage')),

        type: 'protected',
      },
      {
        path: '*',
        element: lazy(() => import('../pages/NotFound')),

        type: 'protected',
      },
    ],
  },

  // Global 404 fallback
  {
    path: '*',
    element: lazy(() => import('../pages/NotFound')),
    type: 'unprotected',
  },
];
