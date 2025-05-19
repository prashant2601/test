import dayjs from 'dayjs';
import { FormikValues } from 'formik';
import { useLocation } from 'react-router-dom';
import { TableNames } from '../../enums';
import { Expense } from '../../pages/admin/tax-and-financial-reports/expenses-receipts/hooks/useGetExpenseData';

const OrdersFormnewInitialValue = {
  merchantId: '',
  orderId: '',
  orderDate: dayjs().format(),
  customerId: '',
  customerFirstName: '',
  customerLastName: '',
  orderType: '',
  paymentType: '',
  paymentStatus: '',
  confirmationStatus: '',
  promoCode: '',
  promoDiscountSwishr: 0,
  promoDiscountMerchant: 0,
  refundSwishr: 0,
  refundMerchant: 0,
  orderDiscount: 0,
  driverTip: 0,
  deliveryCharge: 0,
  serviceFee: 0,
  surcharge: 0,
  subTotal: 0,
  taxes: 0,
  total: 0,
  branchName: '',
  status: '',
};

const CustomerFormInitialValues = {
  customerFirstName: '',
  customerLastName: '',
  customerEmail: '',
  customerMobile: 0,
  customerAddress: '',
  customerArea: {
    line1: '',
    line2: '',
    area: '',
    city: '',
    post: '',
    country: '',
  },
  customerPost: '',
  profileImg: '',
  registrationDate: new Date().toISOString(),
  registrationMethod: '',
  dob: new Date().toISOString(),
  zone: 0,
  merchantId: null,
};

const MerchantFormInitialValues = {
  merchantName: '',
  merchantEmail: '',
  merchantMobile: '',
  merchantAddress: {
    line1: '',
    line2: '',
    area: '',
    city: '',
    post: '',
    country: '',
  },
  logoImg: '',
  registrationDate: new Date().toISOString(),
  registrationMethod: '',
  zone: '',
  serviceFeeApplicable: false,
  deliveryChargeApplicable: false,
  driverTipApplicable: false,
  deliveryOrdersComission: 0,
  collectionOrdersComission: 0,
  eatInComission: 0,
  taxRate: 0,
  totalOrders: 0,
  merchantManagementInfo: {
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
  },
};

const NewUserFormInitialValues = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  status: '',
};
const BankAccountFormInitialValues = {
  accId: null,
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  sortCode: '',
  accountHolderId: null,
  accountRole: '',
};
interface ExpenseInitialValues extends Partial<Expense> {
  isSameDayPayment?: boolean;
}
const ExpenseFormInitialValues: ExpenseInitialValues = {
  paidStatus: 'UNPAID',
  receiptDate: '',
  storeName: '',
  expenseType: '',
  spentBy: undefined,
  claimableVAT: 0,
  totalAmount: 0,
};
export const useGetInitialFormValues = (
  tableName: TableNames | undefined,
  values?: FormikValues
) => {
  const queryParams = new URLSearchParams(useLocation().search);
  const tabValue = queryParams.get('tab');

  switch (tableName) {
    case TableNames.OrdersDisplay:
      return OrdersFormnewInitialValue;

    case TableNames.SwishrCourierCustomersDisplay:
    case TableNames.CustomersDisplay:
      return CustomerFormInitialValues;

    case TableNames.MerchantsDisplay:
      return MerchantFormInitialValues;

    case TableNames.BankAccountDisplay:
      return {
        ...BankAccountFormInitialValues,
        ...(values?.accountRole === 'Partner Merchant' && { merchantId: '' }),
      };

    case TableNames.UsersDisplay:
      return {
        ...NewUserFormInitialValues,
        role: tabValue,
        ...(values?.role === 'merchant' && { merchantIds: [] }),
      };
    case TableNames.ExpensesDisplay:
      return ExpenseFormInitialValues;

    default:
      return {};
  }
};
