import { ForwardRefExoticComponent, RefAttributes } from 'react';

import {
  IconMap,
  IconChartLine,
  IconShoppingCart,
  IconDiscount2,
  IconBriefcase,
  IconCreditCard,
  IconMessages,
  IconBuilding,
  IconDashboard,
  IconUser,
  IconBell,
  IconCar,
  IconChartBar,
  IconCrown,
  IconDiscount,
  IconExchange,
  IconFileInvoice,
  IconInbox,
  IconLayout,
  IconList,
  IconMail,
  IconMailFast,
  IconMessage,
  IconMessageCircle,
  IconPercentage,
  IconSettings,
  IconStar,
  IconTruck,
  IconTruckDelivery,
  IconUserCircle,
  IconWallet,
  IconPhone,
  IconToolsKitchen2,
  IconProps,
  Icon,
  IconCoinPound,
  IconUsers,
  IconClock,
  IconReport,
  IconClipboardList,
  IconBuildingStore,
  IconBadge4k,
  IconMapPin,
  IconSpeakerphone,
  IconGift,
  IconTrendingUp,
  IconFileText,
  IconPlug,
  IconHeartHandshake,
  IconGiftCard,
  IconTicket,
  IconUserCog,
  IconSettings2,
  IconLayoutDashboard,
  IconShare2,
  IconTag,
  IconUserShield,
  IconReportAnalytics,
  IconReceipt,
  IconBuildingBank,
  IconChartDots,
  IconScale,
  IconTrendingDown,
  IconFileCertificate,
  IconCalendarStats,
  IconCalendarDue,
  IconCurrencyDollar,
} from '@tabler/icons-react';
type NavlinkMapping = {
  [key: string]: {
    path: string;
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  };
};
export const AdminNavlinkMapping: Record<string, { icon: any; path: string }> =
  {
    // Main
    Dashboard: { icon: IconDashboard, path: 'dashboard' },

    // Partners & Customers
    'Partners & Customers': {
      icon: IconBuilding,
      path: 'partners-and-customers',
    },
    'Partners & Customers/Dashboard': {
      icon: IconDashboard,
      path: 'partners-and-customers/dashboard',
    },
    'Partners & Customers/Businesses': {
      icon: IconBriefcase,
      path: 'partners-and-customers/businesses',
    },
    'Partners & Customers/Customers': {
      icon: IconUser,
      path: 'partners-and-customers/customers',
    },
    'Partners & Customers/Merchants': {
      icon: IconToolsKitchen2,
      path: 'partners-and-customers/merchants',
    },
    'Partners & Customers/Orders': {
      icon: IconShoppingCart,
      path: 'partners-and-customers/orders',
    },
    'Partners & Customers/Analytics': {
      icon: IconChartBar,
      path: 'partners-and-customers/analytics',
    },
    'Partners & Customers/Zones': {
      icon: IconMap,
      path: 'partners-and-customers/zones',
    },

    // Swishr Courier
    'Swishr Courier': { icon: IconTruck, path: 'swishr-courier' },
    'Swishr Courier/Orders': {
      icon: IconShoppingCart,
      path: 'swishr-courier/orders',
    },
    'Swishr Courier/Analytics': {
      icon: IconChartBar,
      path: 'swishr-courier/analytics',
    },
    'Swishr Courier/Customers': {
      icon: IconUser,
      path: 'swishr-courier/customers',
    },
    'Swishr Courier/Drivers': { icon: IconCar, path: 'swishr-courier/drivers' },
    'Swishr Courier/List of Drivers': {
      icon: IconList,
      path: 'swishr-courier/list-of-drivers',
    },
    'Swishr Courier/Promotions': {
      icon: IconTag,
      path: 'swishr-courier/promotions',
    },
    'Swishr Courier/Zones': { icon: IconMapPin, path: 'swishr-courier/zones' },

    // Settings
    Settings: { icon: IconSettings, path: 'settings' },
    'Settings/Users & Roles': {
      icon: IconUserShield,
      path: 'settings/users-roles',
    },

    // Accounting & Finances
    'Accounting & Finances': {
      icon: IconWallet,
      path: 'accounting-and-finances',
    },
    'Accounting & Finances/Transactions': {
      icon: IconCreditCard,
      path: 'accounting-and-finances/transactions',
    },
    'Accounting & Finances/Invoices': {
      icon: IconFileInvoice,
      path: 'accounting-and-finances/invoices',
    },
    'Accounting & Finances/Invoice Settings': {
      icon: IconSettings,
      path: 'accounting-and-finances/invoice-settings',
    },
    'Accounting & Finances/Merchant Payouts': {
      icon: IconExchange,
      path: 'accounting-and-finances/business-payouts',
    },
    'Accounting & Finances/Driver Payouts': {
      icon: IconTruckDelivery,
      path: 'accounting-and-finances/driver-payouts',
    },
    'Accounting & Finances/Refund Details': {
      icon: IconCoinPound,
      path: 'accounting-and-finances/refund-details',
    },
    'Accounting & Finances/Bank Accounts': {
      icon: IconPercentage,
      path: 'accounting-and-finances/bank-accounts',
    },

    // Tax & Financial Reports
    'Tax & Financial Reports': {
      icon: IconReportAnalytics,
      path: 'tax-and-financial-reports',
    },
    'Tax & Financial Reports/Sales Report': {
      icon: IconChartLine,
      path: 'tax-and-financial-reports/sales-report',
    },
    'Tax & Financial Reports/Invoices': {
      icon: IconFileInvoice,
      path: 'tax-and-financial-reports/invoices',
    },
    'Tax & Financial Reports/Expenses & Receipts': {
      icon: IconReceipt,
      path: 'tax-and-financial-reports/expenses-receipts',
    },
    'Tax & Financial Reports/Banking & Accounts': {
      icon: IconBuildingBank,
      path: 'tax-and-financial-reports/banking-accounts',
    },
    'Tax & Financial Reports/Chart of Accounts': {
      icon: IconChartDots,
      path: 'tax-and-financial-reports/chart-of-accounts',
    },
    'Tax & Financial Reports/Balance Sheet': {
      icon: IconScale,
      path: 'tax-and-financial-reports/balance-sheet',
    },
    'Tax & Financial Reports/Profit Loss': {
      icon: IconTrendingDown,
      path: 'tax-and-financial-reports/profit-loss',
    },
    'Tax & Financial Reports/Tax Summary': {
      icon: IconFileCertificate,
      path: 'tax-and-financial-reports/tax-summary',
    },
    'Tax & Financial Reports/Debtor Ageing': {
      icon: IconCalendarStats,
      path: 'tax-and-financial-reports/debtor-ageing',
    },
    'Tax & Financial Reports/Creditor Ageing': {
      icon: IconCalendarDue,
      path: 'tax-and-financial-reports/creditor-ageing',
    },
    'Tax & Financial Reports/VAT Returns': {
      icon: IconCurrencyDollar,
      path: 'tax-and-financial-reports/vat-returns',
    },

    // Communications
    Communications: { icon: IconMessageCircle, path: 'communications' },
    'Communications/Push Notifications': {
      icon: IconBell,
      path: 'communications/push-notifications',
    },
    'Communications/In-App Messages': {
      icon: IconMessages,
      path: 'communications/in-app-messages',
    },
    'Communications/Messages Box': {
      icon: IconInbox,
      path: 'communications/messages-box',
    },
    'Communications/E-Mails': { icon: IconMail, path: 'communications/emails' },
    'Communications/SMS': { icon: IconMessage, path: 'communications/sms' },

    // Marketing & Promotions
    'Marketing & Promotions': {
      icon: IconPhone,
      path: 'marketing-and-promotions',
    },
    'Marketing & Promotions/Promotional Emails': {
      icon: IconMailFast,
      path: 'marketing-and-promotions/promotional-emails',
    },
    'Marketing & Promotions/Promo Code': {
      icon: IconTag,
      path: 'marketing-and-promotions/promo-code',
    },
    'Marketing & Promotions/Order Discounts': {
      icon: IconDiscount,
      path: 'marketing-and-promotions/order-discounts',
    },
    'Marketing & Promotions/Account Level Discounts': {
      icon: IconDiscount2,
      path: 'marketing-and-promotions/account-level-discounts',
    },
    'Marketing & Promotions/VIP Discounts': {
      icon: IconCrown,
      path: 'marketing-and-promotions/vip-discounts',
    },
    'Marketing & Promotions/Loyalty Program': {
      icon: IconGift,
      path: 'marketing-and-promotions/loyalty-program',
    },

    // Affiliates
    Affiliates: { icon: IconShare2, path: 'affiliates' },
    'Affiliates/Dashboard': {
      icon: IconLayoutDashboard,
      path: 'affiliates/dashboard',
    },
    'Affiliates/List of Affiliates': {
      icon: IconList,
      path: 'affiliates/list-of-affiliates',
    },
    'Affiliates/Users & Roles': {
      icon: IconUserShield,
      path: 'affiliates/users-roles',
    },

    // Admin Panel Settings
    'Admin Panel Settings': {
      icon: IconSettings2,
      path: 'admin-panel-settings',
    },
    'Admin Panel Settings/Layout Settings': {
      icon: IconLayout,
      path: 'admin-panel-settings/layout-settings',
    },
    'Admin Panel Settings/Invoice Settings': {
      icon: IconSettings,
      path: 'admin-panel-settings/invoice-settings',
    },
    'Admin Panel Settings/Users & Roles': {
      icon: IconUserCircle,
      path: 'admin-panel-settings/users-roles',
    },
  };

export const hardcodedAllMenusforMerchant = [
  {
    label: 'Dashboard',
    isActive: true,
  },
  {
    label: 'Orders',
    isActive: true,
  },
  {
    label: 'Management',
    isActive: true,
    submenu: [
      {
        label: 'Services',
        isActive: true,
      },
      {
        label: 'Menu',
        isActive: true,
      },
      {
        label: 'Items Availability',
        isActive: true,
      },
      {
        label: 'Opening Hours',
        isActive: true,
      },
      {
        label: 'Payment Methods',
        isActive: true,
      },
      {
        label: 'Delivery Zones',
        isActive: true,
      },
      {
        label: 'Charges',
        isActive: true,
      },
      {
        label: 'Business Details',
        isActive: true,
      },
    ],
  },
  {
    label: 'Reviews',
    isActive: true,
  },
  {
    label: 'Accounting & Finance',
    isActive: true,
    submenu: [
      {
        label: 'Account Summary',
        isActive: true,
      },
      {
        label: 'Invoices',
        isActive: true,
      },
      {
        label: 'Refunds',
        isActive: true,
      },
      {
        label: 'Banking',
        isActive: true,
      },
    ],
  },
  {
    label: 'Analytics',
    isActive: true,
    submenu: [
      {
        label: 'Performance Score',
        isActive: true,
      },
      {
        label: 'Partner Status',
        isActive: true,
      },
      {
        label: 'Order Reports',
        isActive: true,
      },
      {
        label: 'Customers Reports',
        isActive: true,
      },
      {
        label: 'Menu Insight',
        isActive: true,
        submenu: [
          {
            label: 'By Category',
            isActive: true,
          },
          {
            label: 'By Items',
            isActive: true,
          },
        ],
      },
    ],
  },
  {
    label: 'Marketing & Promotions',
    isActive: true,
    submenu: [
      {
        label: 'Offers',
        isActive: true,
      },
      {
        label: 'Sponsor your store',
        isActive: true,
      },
      {
        label: 'Swishr Loyalty Program',
        isActive: true,
      },
    ],
  },
  {
    label: 'Integrations',
    isActive: true,
  },
  {
    label: 'Administration Menu',
    isActive: true,
    submenu: [
      {
        label: 'Dashboard',
        isActive: true,
      },
      {
        label: 'Documents',
        isActive: true,
      },
      {
        label: 'Sales / Commissions',
        isActive: true,
      },
      {
        label: 'Service Fees',
        isActive: true,
      },
      {
        label: 'Marketing & Promotions',
        isActive: true,
        submenu: [
          {
            label: 'Order Discounts',
            isActive: true,
          },
          {
            label: 'Promotional Codes',
            isActive: true,
          },
          {
            label: 'Vouchers',
            isActive: true,
          },
        ],
      },
      {
        label: 'Delivery Zones',
        isActive: true,
      },
      {
        label: 'Customers',
        isActive: true,
      },
      {
        label: 'Users & Roles',
        isActive: true,
      },
      {
        label: 'Settings',
        isActive: true,
      },
    ],
  },
];
export const merchantNavlinkMapping: Record<
  string,
  { icon: any; path: string }
> = {
  // Main Links
  Dashboard: { icon: IconDashboard, path: 'merchant/dashboard' },
  Orders: { icon: IconShoppingCart, path: 'merchant/orders' },

  // Management
  Management: { icon: IconSettings, path: 'merchant/management' },
  'Management/Services': {
    icon: IconBriefcase,
    path: 'merchant/management/services',
  },
  'Management/Menu': {
    icon: IconClipboardList,
    path: 'merchant/management/menu',
  },
  'Management/Items Availability': {
    icon: IconClock,
    path: 'merchant/management/items-availability',
  },
  'Management/Opening Hours': {
    icon: IconClock,
    path: 'merchant/management/opening-hours',
  },
  'Management/Payment Methods': {
    icon: IconWallet,
    path: 'merchant/management/payment-methods',
  },
  'Management/Delivery Zones': {
    icon: IconMapPin,
    path: 'merchant/management/delivery-zones',
  },
  'Management/Charges': {
    icon: IconWallet,
    path: 'merchant/management/charges',
  },
  'Management/Business Details': {
    icon: IconBuildingStore,
    path: 'merchant/management/business-details',
  },

  // Reviews
  Reviews: { icon: IconMessageCircle, path: 'merchant/reviews' },

  // Accounting & Finance
  'Accounting & Finance': {
    icon: IconBadge4k,
    path: 'merchant/accounting-and-finance',
  },
  'Accounting & Finance/Account Summary': {
    icon: IconWallet,
    path: 'merchant/accounting-and-finance/account-summary',
  },
  'Accounting & Finance/Invoices': {
    icon: IconFileInvoice,
    path: 'merchant/accounting-and-finance/invoices',
  },
  'Accounting & Finance/Refunds': {
    icon: IconCreditCard,
    path: 'merchant/accounting-and-finance/refunds',
  },
  'Accounting & Finance/Banking': {
    icon: IconBadge4k,
    path: 'merchant/accounting-and-finance/banking',
  },

  // Analytics
  Analytics: { icon: IconChartLine, path: 'merchant/analytics' },
  'Analytics/Performance Score': {
    icon: IconChartBar,
    path: 'merchant/analytics/performance-score',
  },
  'Analytics/Partner Status': {
    icon: IconStar,
    path: 'merchant/analytics/partner-status',
  },
  'Analytics/Order Reports': {
    icon: IconReport,
    path: 'merchant/analytics/order-reports',
  },
  'Analytics/Customers Reports': {
    icon: IconUsers,
    path: 'merchant/analytics/customers-reports',
  },
  'Analytics/Menu Insight': {
    icon: IconClipboardList,
    path: 'merchant/analytics/menu-insight',
  },

  // Marketing
  'Marketing & Promotions': {
    icon: IconSpeakerphone,
    path: 'merchant/marketing-and-promotions',
  },
  'Marketing & Promotions/Offers': {
    icon: IconGift,
    path: 'merchant/marketing-and-promotions/offers',
  },
  'Marketing & Promotions/Sponsor your store': {
    icon: IconStar,
    path: 'merchant/marketing-and-promotions/sponsor-your-store',
  },
  'Marketing & Promotions/Swishr Loyalty Program': {
    icon: IconHeartHandshake,
    path: 'merchant/marketing-and-promotions/swishr-loyalty-program',
  },
  Integrations: { icon: IconPlug, path: 'merchant/integrations' },
  'Administration Menu': {
    icon: IconSettings,
    path: 'merchant/administration-menu',
  },
  'Administration Menu/Dashboard': {
    icon: IconDashboard,
    path: 'merchant/administration-menu/dashboard',
  },
  'Administration Menu/Documents': {
    icon: IconFileText,
    path: 'merchant/administration-menu/documents',
  },
  'Administration Menu/Sales / Commissions': {
    icon: IconTrendingUp,
    path: 'merchant/administration-menu/sales-commissions',
  },
  'Administration Menu/Service Fees': {
    icon: IconWallet,
    path: 'merchant/administration-menu/service-fees',
  },
  'Administration Menu/Marketing & Promotions': {
    icon: IconSpeakerphone,
    path: 'merchant/administration-menu/marketing-and-promotions',
  },
  'Administration Menu/Marketing & Promotions/Order Discounts': {
    icon: IconDiscount,
    path: 'merchant/administration-menu/marketing-and-promotions/order-discounts',
  },
  'Administration Menu/Marketing & Promotions/Promotional Codes': {
    icon: IconTicket,
    path: 'merchant/administration-menu/marketing-and-promotions/promotional-codes',
  },
  'Administration Menu/Marketing & Promotions/Vouchers': {
    icon: IconGiftCard,
    path: 'merchant/administration-menu/marketing-and-promotions/vouchers',
  },
  'Administration Menu/Delivery Zones': {
    icon: IconMapPin,
    path: 'merchant/administration-menu/delivery-zones',
  },
  'Administration Menu/Customers': {
    icon: IconUsers,
    path: 'merchant/-menu/customers',
  },
  'Administration Menu/Users & Roles': {
    icon: IconUserCog,
    path: 'merchant/administration-menu/users-and-roles',
  },
  'Administration Menu/Settings': {
    icon: IconSettings2,
    path: 'merchant/administration-menu/settings',
  },
};
