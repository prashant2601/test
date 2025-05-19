import * as Yup from 'yup';
import { userRoles } from '../../pages/admin/adminPanelSetting/usersAndRole/constants';
import { accountRoleOptions } from '../../pages/admin/bankAccounts/constants';
import { TableNames } from '../../enums';

interface UseValidationSchemaProps {
  formState: 'VIEW' | 'NEW' | 'EDIT';
  tableName: TableNames | undefined;
}

const OrdersvalidationSchema = Yup.object({
  merchantId: Yup.string().required('Merchant ID is required'),
  orderId: Yup.string().required('Order ID is required'),
  orderDate: Yup.date().required('Order Date is required'),
  customerId: Yup.string().required('Customer ID is required'),
  orderType: Yup.string().required('Order Type is required'),
  status: Yup.string()
    .when(['orderType', 'confirmationStatus'], {
      is: (orderType: string, confirmationStatus: string) => {
        const lowerOrderType = orderType?.toLowerCase();
        const lowerConfirmationStatus = confirmationStatus?.toLowerCase();
        return (
          lowerOrderType === 'delivery' &&
          lowerConfirmationStatus === 'completed'
        );
      },
      then: (schema) =>
        schema
          .required('Status is required')
          .oneOf(
            ['DELIVERED'],
            'Invalid status based on order type and confirmation status'
          ),
      // otherwise: (schema) => schema.required("Status is Required"),
    })
    .when(['orderType', 'confirmationStatus'], {
      is: (orderType: string, confirmationStatus: string) => {
        const lowerOrderType = orderType?.toLowerCase();
        const lowerConfirmationStatus = confirmationStatus?.toLowerCase();
        return (
          lowerOrderType === 'collection' &&
          lowerConfirmationStatus === 'completed'
        );
      },
      then: (schema) =>
        schema
          .required('Status is required')
          .oneOf(
            ['PICKED_UP'],
            'Invalid status based on order type and confirmation status'
          ),
      // otherwise: (schema) => schema.required("Status is Required"),
    }),
});

const CustomersvalidationSchemaforEDIT = Yup.object({
  merchantId: Yup.string().required('Merchant ID is required'),
  customerId: Yup.string().required('Customer ID is required'),
});

const CustomersvalidationSchemaforNEW = Yup.object({
  merchantId: Yup.string().required('Merchant ID is required'),
});

const MerchantValidationSchema = Yup.object({
  merchantName: Yup.string()
    .required('Merchant name is required')
    .min(3, 'Merchant name must be at least 3 characters long')
    .max(100, 'Merchant name must be less than 100 characters'),
  merchantEmail: Yup.string()
    .email('Invalid email format')
    .required('Merchant email is required'),
  merchantMobile: Yup.string().required('Merchant mobile is required'),
  merchantAddress: Yup.object({
    line1: Yup.string().optional(),
    line2: Yup.string().optional(),
    area: Yup.string().optional(),
    city: Yup.string().optional(),
    post: Yup.string().required('Postal code is required'),
    country: Yup.string().optional(),
  }),
  registrationDate: Yup.date()
    .required('Registration date is required')
    .max(new Date(), 'Registration date cannot be in the future'),
  registrationMethod: Yup.string()
    .required('Registration method is required')
    .oneOf(['Web', 'Mobile', 'Other', 'Online'], 'Invalid registration method'),
  zone: Yup.string()
    .required('Zone is required')
    .oneOf(
      [
        'Chester',
        'Manchester',
        'Birmingham',
        'Wrexham',
        'Ellesmere Port',
        'Mold',
        'London',
        'Birkenhead',
        'Wirral',
      ],
      'Invalid zone'
    ),
  serviceFeeApplicable: Yup.boolean().required(
    'Service fee applicability is required'
  ),
  deliveryChargeApplicable: Yup.boolean().required(
    'Delivery charge applicability is required'
  ),
  driverTipApplicable: Yup.boolean().required(
    'Driver tip applicability is required'
  ),
  deliveryOrdersComission: Yup.number()
    .required('Delivery order commission is required')
    .min(0, 'Commission must be greater than or equal to 0'),
  collectionOrdersComission: Yup.number()
    .required('Collection order commission is required')
    .min(0, 'Commission must be greater than or equal to 0'),
  eatInComission: Yup.number()
    .required('Eat-in commission is required')
    .min(0, 'Commission must be greater than or equal to 0'),
});

const UserValidationSchemaForNEW = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  role: Yup.string()
    .oneOf(
      userRoles?.map((role) => role.value),
      'Invalid role assigned'
    )
    .required('Role is required'),

  merchantIds: Yup.array()
    .of(Yup.string().required('Merchant ID is required'))
    .when('role', {
      is: (role: string) => role === 'merchant',
      then: (schema) =>
        schema.min(1, 'At least one Merchant ID is required').required(),
    }),
});

const UserValidationSchemaForEDIT = Yup.object({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  role: Yup.string()
    .oneOf(
      ['superAdmin', 'merchant', 'affiliate', 'admin', 'staff', 'support'],
      'Invalid role assigned'
    )
    .required('Role is required'),
  merchantIds: Yup.array()
    .of(Yup.string().required('Merchant ID is required'))
    .when('role', {
      is: (role: string) => role === 'merchant',
      then: (schema) =>
        schema.min(1, 'At least one Merchant ID is required').required(),
    }),
});

export const BankAccountValidationSchema = Yup.object({
  // accId: Yup.number()
  //   .required('Account ID is required')
  //   .positive('Account ID must be a positive number')
  //   .integer('Account ID must be an integer'),

  accountHolderName: Yup.string()
    .required('Account Holder Name is required')
    .min(3, 'Account Holder Name must be at least 3 characters long')
    .max(100, 'Account Holder Name must be less than 100 characters'),

  bankName: Yup.string()
    .required('Bank Name is required')
    .min(3, 'Bank Name must be at least 3 characters long')
    .max(100, 'Bank Name must be less than 100 characters'),

  accountNumber: Yup.number()
    .required('Account Number is required')
    .positive('Account Number must be a positive number')
    .integer('Account Number must be an integer')
    .test('len', 'Account Number must be between 8 and 16 digits', (val) =>
      val ? val.toString().length >= 8 && val.toString().length <= 16 : false
    ),

  sortCode: Yup.number()
    .required('Sort Code is required')
    .positive('Sort Code must be a positive number')
    .integer('Sort Code must be an integer')
    .test('len', 'Sort Code must be exactly 6 digits', (val) =>
      val ? val.toString().length === 6 : false
    ),

  // accountHolderId: Yup.number()
  //   .required('Account Holder ID is required')
  //   .positive('Account Holder ID must be a positive number')
  //   .integer('Account Holder ID must be an integer'),

  accountRole: Yup.string()
    .required('Account Role is required')
    .oneOf(
      accountRoleOptions?.map((rol) => rol.value),
      'Invalid Account Role'
    ),
  merchantId: Yup.string().when('accountRole', {
    is: (accountRole: string) => accountRole === 'Partner Merchant',
    then: (schema) => schema.required('Merchant ID is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});
const OlderInvoiceValidationSchemaForEdit = Yup.object({
  invoiceId: Yup.string().required('Invoice ID is required'),
  fromDate: Yup.date().required('From Date is required'),
  toDate: Yup.date().required('To Date is required'),
  createdAt: Yup.date().required('Invoice Date is required'),
});
export const ExpensesValidationSchema = Yup.object({
  receiptDate: Yup.date().required('Receipt Date is required'),

  storeName: Yup.string().required('Store Name is required'),

  expenseType: Yup.string().required('Expense Type is required'),

  spentBy: Yup.string().required('Spent By is required'),

  claimableVAT: Yup.number()
    .typeError('Claimable VAT must be a number')
    .required('Claimable VAT is required'),

  totalAmount: Yup.number()
    .typeError('Total Amount must be a number')
    .required('Total Amount is required'),

  paidStatus: Yup.string()
    .oneOf(['PAID', 'UNPAID'], 'Invalid Paid Status')
    .required('Paid Status is required'),

  paymentDetails: Yup.array()
    .of(
      Yup.object().shape({
        // paymentType: Yup.string().required('Payment Type is required'),
        // cardType: Yup.string().when('paymentType', {
        //   is: (val: string) => val === 'CARD' || val === 'BOTH',
        //   then: (schema) => schema.required('Card Type is required'),
        //   otherwise: (schema) => schema.notRequired(),
        // }),
        // paymentFrom: Yup.object().shape({
        //   CARD: Yup.number()
        //     .typeError('Card amount must be a number')
        //     .min(0, 'Card amount must be >= 0')
        //     .when(['$paymentType'], {
        //       is: (val: string) => val === 'CARD' || val === 'BOTH',
        //       then: (schema) => schema.required('Card amount is required'),
        //       otherwise: (schema) => schema.notRequired(),
        //     }),
        //   CASH: Yup.number()
        //     .typeError('Cash amount must be a number')
        //     .min(0, 'Cash amount must be >= 0')
        //     .when(['$paymentType'], {
        //       is: (val: string) => val === 'CASH' || val === 'BOTH',
        //       then: (schema) => schema.required('Cash amount is required'),
        //       otherwise: (schema) => schema.notRequired(),
        //     }),
        // }),
        // paymentDate: Yup.date().required('Payment Date is required'),
      })
    )
    .test(
      'non-empty-if-present',
      'Each payment must have a payment type, or delete the empty rows',
      function (value) {
        if (!value || value.length === 0) return true; // allow empty array
        return value.every((item) => !!item.paymentType);
      }
    ),
});
const validationSchemas: { [key: string]: Yup.ObjectSchema<any> } = {
  [`${TableNames.OrdersDisplay}-NEW`]: OrdersvalidationSchema,
  [`${TableNames.OrdersDisplay}-EDIT`]: OrdersvalidationSchema,
  [`${TableNames.CustomersDisplay}-EDIT`]: CustomersvalidationSchemaforEDIT,
  [`${TableNames.CustomersDisplay}-NEW`]: CustomersvalidationSchemaforNEW,
  [`${TableNames.SwishrCourierCustomersDisplay}-EDIT`]:
    CustomersvalidationSchemaforEDIT,
  [`${TableNames.SwishrCourierCustomersDisplay}-NEW`]:
    CustomersvalidationSchemaforNEW,
  [`${TableNames.MerchantsDisplay}-NEW`]: MerchantValidationSchema,
  [`${TableNames.MerchantsDisplay}-EDIT`]: MerchantValidationSchema,
  [`${TableNames.UsersDisplay}-EDIT`]: UserValidationSchemaForEDIT,
  [`${TableNames.UsersDisplay}-NEW`]: UserValidationSchemaForNEW,
  [`${TableNames.BankAccountDisplay}-EDIT`]: BankAccountValidationSchema,
  [`${TableNames.BankAccountDisplay}-NEW`]: BankAccountValidationSchema,
  [`${TableNames.AllOldInvoicesDisplay}-EDIT`]:
    OlderInvoiceValidationSchemaForEdit,
  [`${TableNames.ExpensesDisplay}-NEW`]: ExpensesValidationSchema,
  [`${TableNames.ExpensesDisplay}-EDIT`]: ExpensesValidationSchema,
};

const useValidationSchema = ({
  formState,
  tableName,
}: UseValidationSchemaProps) => {
  const schemaKey = `${tableName}-${formState}`;
  return { validationSchema: validationSchemas[schemaKey] || {} };
};

export default useValidationSchema;
