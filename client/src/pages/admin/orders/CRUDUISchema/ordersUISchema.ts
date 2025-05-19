import { UISCHEMA } from '../../customers/CRUDUISchema/customersUISchema';
import { orderStatuses } from '../DisplayOrders/constants';

export const ordersUISchemaArray: UISCHEMA[] = [
  {
    key: 'merchantId',
    name: 'merchantId',
    fieldType: 'Number',
    label: 'Merchant ID',
    disabled: {
      disabledFieldForNew: false,
    },
  },
  {
    key: 'orderId',
    name: 'orderId',
    fieldType: 'Number',
    label: 'Order ID',
    disabled: {
      disabledFieldForNew: true,
      disableFieldForEdit: true,
    },
  },
  {
    key: 'orderDate',
    name: 'orderDate',
    fieldType: 'DateTimeRange',
    label: 'Order Date',
    disabled: {
      disabledFieldForNew: false,
      disableFieldForEdit: true,
    },
  },
  {
    key: 'customerId',
    name: 'customerId',
    fieldType: 'Number',
    label: 'Customer ID',
    disabled: {
      disabledFieldForNew: false,
    },
  },
  {
    key: 'customerFirstName',
    name: 'customerFirstName',
    fieldType: 'Text',
    label: 'Customer First Name',
  },
  {
    key: 'customerLastName',
    name: 'customerLastName',
    fieldType: 'Text',
    label: 'Customer Last Name',
  },
  {
    key: 'orderType',
    name: 'orderType',
    fieldType: 'Select',
    label: 'Order Type',
    meta: {
      options: [
        { label: 'DELIVERY', value: 'DELIVERY' },
        { label: 'COLLECTION', value: 'COLLECTION' },
      ],
    },
  },
  {
    key: 'paymentType',
    name: 'paymentType',
    fieldType: 'Select',
    label: 'Payment Type',
    meta: {
      options: [
        { label: 'CASH', value: 'CASH' },
        { label: 'CARD', value: 'CARD' },
      ],
    },
  },
  {
    key: 'paymentStatus',
    name: 'paymentStatus',
    fieldType: 'Select',
    label: 'Payment Status',
    meta: {
      options: [
        { label: 'COMPLETED', value: 'COMPLETED' },
        { label: 'PENDING', value: 'PENDING' },
        { label: 'PROCESSED', value: 'PROCESSED' },
      ],
    },
  },
  {
    key: 'confirmationStatus',
    name: 'confirmationStatus',
    fieldType: 'Select',
    label: 'Confirmation Status',
    meta: {
      options: [
        { label: 'COMPLETED', value: 'COMPLETED' },
        { label: 'PENDING', value: 'PENDING' },
      ],
    },
  },
  {
    key: 'promoCode',
    name: 'promoCode',
    fieldType: 'Text',
    label: 'Promo Code',
  },
  {
    key: 'promoDiscountSwishr',
    name: 'promoDiscountSwishr',
    fieldType: 'Number',
    label: 'Promo Discount (SWISHR)',
  },
  {
    key: 'promoDiscountMerchant',
    name: 'promoDiscountMerchant',
    fieldType: 'Number',
    label: 'Promo Discount (Merchant)',
  },
  {
    key: 'refundSwishr',
    name: 'refundSwishr',
    fieldType: 'Number',
    label: 'Refund (SWISHR)',
  },
  {
    key: 'refundMerchant',
    name: 'refundMerchant',
    fieldType: 'Number',
    label: 'Refund (Merchant)',
  },
  {
    key: 'orderDiscount',
    name: 'orderDiscount',
    fieldType: 'Number',
    label: 'Order Discount',
  },
  {
    key: 'driverTip',
    name: 'driverTip',
    fieldType: 'Number',
    label: 'Driver Tip',
  },
  {
    key: 'deliveryCharge',
    name: 'deliveryCharge',
    fieldType: 'Number',
    label: 'Delivery Charge',
  },
  {
    key: 'serviceFee',
    name: 'serviceFee',
    fieldType: 'Number',
    label: 'Service Fee',
  },
  {
    key: 'surcharge',
    name: 'surcharge',
    fieldType: 'Number',
    label: 'Surcharge',
  },
  {
    key: 'subTotal',
    name: 'subTotal',
    fieldType: 'Number',
    label: 'Sub Total',
  },
  {
    key: 'taxes',
    name: 'taxes',
    fieldType: 'Number',
    label: 'Taxes',
  },
  {
    key: 'total',
    name: 'total',
    fieldType: 'Number',
    label: 'Total',
  },
  {
    key: 'branchName',
    name: 'branchName',
    fieldType: 'Text',
    label: 'Branch Name',
  },
  {
    key: 'status',
    name: 'status',
    fieldType: 'Select',
    label: 'Status',
    meta: {
      options: orderStatuses,
    },
  },
  {
    key: 'merchantDetails',
    name: 'merchantDetails',
    fieldType: 'Section',
    label: 'Merchant Details',
    hidden: {
      hideFieldForNEW: true,
    },
    fieldsInSection: [
      {
        key: 'merchantDetails.isInHouseType',
        name: 'merchantDetails.isInHouseType',
        fieldType: 'RadioGroupForBoolean',
        label: 'Merchant Type',
        meta: {
          options: [
            { label: 'In House', value: 'true' },
            { label: 'Outsource', value: 'false' },
          ],
        },
      },
      {
        key: 'merchantDetails.serviceFeeApplicable',
        name: 'merchantDetails.serviceFeeApplicable',
        fieldType: 'RadioGroupForBoolean',
        label: 'Service Fee Applicable',
        meta: {
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
        },
      },
      {
        key: 'merchantDetails.deliveryChargeApplicable',
        name: 'merchantDetails.deliveryChargeApplicable',
        fieldType: 'RadioGroupForBoolean',
        label: 'Delivery Charge Applicable',
        meta: {
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
        },
      },
      {
        key: 'merchantDetails.deliveryOrdersComission',
        name: 'merchantDetails.deliveryOrdersComission',
        fieldType: 'Number',
        label: 'Delivery Order Commission',
      },
      {
        key: 'merchantDetails.collectionOrdersComission',
        name: 'merchantDetails.collectionOrdersComission',
        fieldType: 'Number',
        label: 'Collection Order Commission',
      },
    ],
  },
];
