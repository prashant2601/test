import { UserRoleTypes } from '../pages/admin/adminPanelSetting/usersAndRole/constants';

const ApiConstants = {
  // POST API
  REGISTER_USER: () => `/api/auth/register`,
  LOGIN_USER: () => `/api/auth/login`,
  UPLOAD_CSV: () => `/api/invoice/uploadAndGetInvoiceData`,
  UPLOAD_AND_GET_INVOICE_DATA: () => `/api/invoice/uploadAndGetInvoiceData`,
  SAVE_INVOICE_DATA: () => `/api/invoice/saveInvoiceData`,
  UPLOAD_AND_PARSE_DOCUMENT: () => '/api/order/uploadAndParseDocument',
  CREATE_ORDER_MANUALLY: () => '/api/order/addOrders',
  GENERATE_INVOICE_BY_MERCHANTID_AND_DATE_RANGE: () =>
    `api/invoice/generateInvoiceByMerchantIds`,

  UPLOAD_AND_PARSE_CUSTOMER: () => `api/customer/uploadAndParseCustomer`,
  UPLOAD_AND_PARSE_SWISHR_COURIER_CUSTOMER: () =>
    `api/customer/uploadAndParseSwishrCourierCustomer`,
  SEND_CUSTOMERS_ORDERIDS_FEEDBACK: () => `/api/email/sendFeedbackMail`,
  CREATE_MANUAL_INVOICE: () => `/api/invoice/create-invoice-manually`,
  CREATE_BANK_ACCOUNT: () => `api/payment/add-bank-accounts`,

  // Customers
  ADD_CUSTOMER_DETAILS_MANUALLY: () => `api/customer/add-customer`,
  ADD_SWISHR_COURIER_CUSTOMER: () => `api/customer/add-swishr-courier-customer`,

  // Merchants
  ADD_MERCHANT_DETAILS_MANUALLY: () => `api/merchant/add-merchant`,

  // GET API
  GET_ALL_CUSTOMERS: () => '/api/customer/getAllCustomerList',
  GET_CUSTOMER_CONFIG: (id: string) => `/api/customer/getCustomerById/${id}`,
  GET_ALL_ORDERS: () => `/api/order/getAllOrders`,
  VIEW_INVOICE_BY_MERCHANT: () => `api/invoice/view-invoice`,
  GET_CUSTOMER_DETAILS: () => `api/customer/getAllCustomerDetails`,
  GET_MERCHANT_DETAILS: () => `api/merchant/getAllMerchantDetails`,
  GET_MERCHANT_DETAILS_BY_ID: (id: string) =>
    `api/merchant/getMerchantDetailsById/${id}`,
  GET_MERCHANT_ID_AND_MERCHANT_NAME: (searchQuery: string) =>
    `api/merchant/searchMerchant?searchQuery=${searchQuery}`,
  GET_MERCHANT_INVOICES_BY_ID: () => `api/invoice/getInvoicesByMerchantId`,
  GET_ALL_INVOICES_DETAILS: () => `api/invoice/getAllInvoices`,
  UPLOAD_OLD_INVOICE_PDFS: () => `/api/invoice//upload-invoice-pdfs`,
  GET_EMAIL_REPORT: () => `api/email/getEmailLogs`,
  GET_REFUND_DETAILS: () => `api/order/getAllRefundOrders`,
  GET_SWISHR_COURIER_CUSTOMER: (searchQuery: string) =>
    `api/customer/searchSwishrCourierCustomer?searchQuery=${searchQuery}`,
  GET_ALL_SWISHR_COURIER_CUSTOMER_DETAILS: () =>
    `api/customer/getAllSwishrCourierCustomerDetails`,
  EDIT_MANUAL_INVOICE: () => `/api/invoice/edit-invoice-manually`,
  EDIT_OLD_INVOICE: () => `/api/invoice/edit-older-invoice`,
  GET_ALL_BANK_ACCOUNTS: () => `api/payment/getAllBankAccounts`,

  // Auth APIs
  GET_ALL_USER: () => `api/auth/getAllUsers`,
  RESET_PASSWORD: () => `api/auth/resetPassword`,
  FORGOT_PASSWORD: () => `api/auth/forgotPassword`,
  CHECK_AUTH: () => `api/auth/check-auth`,
  LOGOUT_USER: () => `/api/auth/logout`,
  VALIDATE_RESET_PASSWORD_TOKEN: () => `api/auth/validateResetPasswordToken`,
  CREATE_USER: () => `api/auth/create-new-user`,
  DELETE_USER: (userIds: string) => `api/auth/delete-user?userIds=${userIds}`,
  EDIT_USER: () => `api/auth/edit-user`,
  GET_NAVIGATION_MENUS: (role: UserRoleTypes) =>
    `api/auth/getDashboardMenu?role=${role}`,
  GET_ROLE_BASED_CONFIG_MENUS: (role: Omit<UserRoleTypes, 'merchant'>) =>
    `api/auth/getAllConfigMenus?role=${role}`,
  EDIT_ROLE_BASED_CONFIG_MENUS: () => `api/auth/editConfigMenus`,

  // PUT API
  UPDATE_ORDER_BY_ID: () => `/api/order/updateOrder/`,
  RECALCULATE_ORDER_COMMISSION: () => `/api/order/recalculateOrderCommission`,
  UPDATE_CUSTOMER_BY_ID: () => `/api/customer/edit-customer`,
  UPDATE_MERCHANT_BY_ID: () => `api/merchant/edit-merchant`,
  EDIT_MERCHANT_INVOICE: () => `api/invoice/edit-invoice`,
  EDIT_BANK_ACCOUNT: () => `/api/payment/edit-bank-accounts`,
  SEND_INVOICES_TO_MERCHANTS: () => `api/invoice/sendInvoicesToMerchant`,

  // DELETE API
  DELETE_ORDER_BY_ID: (orderIds: string) =>
    `/api/order/deleteOrder?id=${orderIds}`,
  DELETE_CUSTOMERS_BY_IDS: (customerIds: string) =>
    `/api/customer/delete-customer?id=${customerIds}`,
  DELETE_MERCHANTS_BY_IDS: (merchantIds: string) =>
    `/api/merchant/delete-merchant?id=${merchantIds}`,
  DELETE_INVOICE_BY_IDS: (invoiceIds: string) =>
    `/api/invoice/delete-invoice?invoiceId=${invoiceIds}`,
  DELETE_BANK_ACCOUNTS_BY_IDS: (ids: string) =>
    `/api/payment/delete-bank-accounts?ids=${ids}`,

  // Merchant DashBoard API
  GET_MERCHANT_ORDER_HISTORY_SUMMARY: (
    compareType: string,
    merchantId: string
  ) =>
    `/api/dashboard/getMerchantOrderHistorySummary?compareType=${compareType}&merchantId=${merchantId}`,

  GET_MERCHANT_ORDER_SUMMARY_CHART_DATA: (
    frequency: string,
    orderType: string,
    merchantId: string
  ) =>
    `/api/dashboard/getMerchantOrderGraphData?frequency=${frequency}&orderType=${orderType}&merchantId=${merchantId}`,
  GET_MERCHANT_TOP_ORDER_SUMMARY: (compareType: string, merchantId: string) =>
    `/api/dashboard/getMerchantTopOrderSummary?compareType=${compareType}&merchantId=${merchantId}`,

  GET_MERCHANT_COMPARATIVE_ORDER_ANALYSIS: (
    compareType: string,
    merchantId: string
  ) =>
    `/api/dashboard/getMerchantComparativeOrderAnalysis?compareType=${compareType}&merchantId=${merchantId}`,
  GET_MERCHANT_ORDER_COMMISION_REPORT: (
    compareType: string,
    merchantId: string
  ) =>
    `/api/dashboard/getMerchantOrderComissionReport?compareType=${compareType}&merchantId=${merchantId}`,
  // Merchant Orders
  GET_MERCHANT_ORDER_HISTORY: () => `/api/merchant/getMerchantOrderHistory`,
  // Order DashBoard API
  GET_ORDER_COMMISSION_REPORT: (compareType: string) =>
    `/api/dashboard/getOrderComissionReport?compareType=${compareType}`,

  GET_ORDER_SUMMARY_CHART_DATA: (frequency: string, orderType: string) =>
    `/api/dashboard/getOrderGraphData?frequency=${frequency}&orderType=${orderType}`,

  GET_ORDER_TOP_SUMMARY: (compareType: string) =>
    `/api/dashboard/topOrderSummary?compareType=${compareType}`,

  GET_ORDER_COMPARATIVE_ANALYSIS: (compareType: string) =>
    `/api/dashboard/getComparativeOrderAnalysis?compareType=${compareType}`,

  // Expense API
  GET_EXPENSE_DATA: () => `/api/expense/getExpenseData`,
  UPLOAD_EXPENSE_DATA: () => `/api/expense/uploadExpenseData`,
  EDIT_EXPENSE_DATA: () => `/api/expense/editExpenseData`,
  DELETE_EXPENSE_DATA_BY_IDS: (receiptIds: string) =>
    `/api/expense/deleteExpenseData?receiptIds=${receiptIds}`,

  // Expense Category API
  GET_EXPENSE_CATEGORY: ({
    pageNo,
    limit,
    query,
  }: {
    pageNo: number;
    limit: number;
    query: string;
  }) =>
    `/api/expense/getExpenseCategory?pageNo=${pageNo}&limit=${limit}&query=${query}`,
  ADD_EXPENSE_CATEGORY: () => `/api/expense/addExpenseCategory`,
  EDIT_EXPENSE_CATEGORY: () => `/api/expense/editExpenseCategory`,
  DELETE_EXPENSE_CATEGORY: (categoryIds: string) =>
    `/api/expense/deleteExpenseCategory?categoryIds=${categoryIds}`,

  // Expense Type API
  GET_EXPENSE_TYPE: ({
    pageNo,
    limit,
    query,
  }: {
    pageNo: number;
    limit: number;
    query: string;
  }) =>
    `/api/expense/getExpenseType?pageNo=${pageNo}&limit=${limit}&query=${query}`,
  ADD_EXPENSE_TYPE: () => `/api/expense/addExpenseType`,
  EDIT_EXPENSE_TYPE: () => `/api/expense/editExpenseType`,
  DELETE_EXPENSE_TYPE: (typeIds: string) =>
    `/api/expense/deleteExpenseType?typeIds=${typeIds}`,

  // Expense Store API
  GET_EXPENSE_STORE: ({
    pageNo,
    limit,
    query,
  }: {
    pageNo: number;
    limit: number;
    query: string;
  }) =>
    `/api/expense/getExpenseStore?pageNo=${pageNo}&limit=${limit}&query=${query}`,
  ADD_EXPENSE_STORE: () => `/api/expense/addExpenseStore`,
  EDIT_EXPENSE_STORE: () => `/api/expense/editExpenseStore`,
  DELETE_EXPENSE_STORE: (storeIds: string) =>
    `/api/expense/deleteExpenseStore?storeIds=${storeIds}`,
};

export default ApiConstants;
