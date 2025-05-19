import { UISCHEMA } from '../../customers/CRUDUISchema/customersUISchema';

export const merchantsUISchema: UISCHEMA[] = [
  {
    key: 'merchantId',
    name: 'merchantId',
    fieldType: 'Number',
    label: 'Merchant ID',
    disabled: {
      disabledFieldForNew: false,
      disableFieldForEdit: true,
    },
    hidden: {
      hideFieldForEDIT: false,
      hideFieldForNEW: true,
    },
  },
  {
    key: 'merchantName',
    name: 'merchantName',
    fieldType: 'Text',
    label: 'Merchant Name',
  },
  {
    key: 'merchantEmail',
    name: 'merchantEmail',
    fieldType: 'Text',
    label: 'Email',
  },
  {
    key: 'merchantMobile',
    name: 'merchantMobile',
    fieldType: 'Text',
    label: 'Mobile',
  },

  {
    key: 'deliveryOrdersComission',
    name: 'deliveryOrdersComission',
    fieldType: 'Number',
    label: 'Delivery Orders Commission',
  },
  {
    key: 'collectionOrdersComission',
    name: 'collectionOrdersComission',
    fieldType: 'Number',
    label: 'Collection Orders Commission',
  },
  {
    key: 'eatInComission',
    name: 'eatInComission',
    fieldType: 'Number',
    label: 'Eat-In Commission',
  },
  {
    key: 'logoImg',
    name: 'logoImg',
    fieldType: 'imageInput',
    label: 'Logo Image',
  },
  {
    key: 'registrationDate',
    name: 'registrationDate',
    fieldType: 'DateTimeRange',
    label: 'Registration Date',
    disabled: {
      disabledFieldForNew: false,
      disableFieldForEdit: true,
    },
  },
  {
    key: 'registrationMethod',
    name: 'registrationMethod',
    fieldType: 'Select',
    label: 'Registration Method',
    meta: {
      options: [
        { label: 'Online', value: 'Online' },
        { label: 'Web', value: 'Web' },
      ],
    },
  },
  {
    key: 'zone',
    name: 'zone',
    fieldType: 'Select',
    label: 'Zone',
    meta: {
      options: [
        { label: 'Chester', value: 'Chester' },
        { label: 'Manchester', value: 'Manchester' },
        { label: 'Birmingham', value: 'Birmingham' },
        { label: 'Wrexham', value: 'Wrexham' },
        { label: 'Ellesmere Port', value: 'Ellesmere Port' },
        { label: 'Mold', value: 'Mold' },
        { label: 'London', value: 'London' },
        { label: 'Birkenhead', value: 'Birkenhead' },
        { label: 'Wirral', value: 'Wirral' },
      ],
    },
  },

  {
    key: 'taxRate',
    name: 'taxRate',
    fieldType: 'Number',
    label: 'Tax Rate',
  },

  {
    key: 'rating',
    name: 'rating',
    fieldType: 'Rating',
    label: 'Rating',
  },
  {
    key: 'isInHouseType',
    name: 'isInHouseType',
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
    key: 'serviceFeeApplicable',
    name: 'serviceFeeApplicable',
    fieldType: 'Checkbox',
    label: 'Service Fee Applicable',
  },
  {
    key: 'deliveryChargeApplicable',
    name: 'deliveryChargeApplicable',
    fieldType: 'Checkbox',
    label: 'Delivery Charge Applicable',
  },
  {
    key: 'driverTipApplicable',
    name: 'driverTipApplicable',
    fieldType: 'Checkbox',
    label: 'Driver Tip Applicable',
  },
  {
    key: 'isEmailApplicable',
    name: 'isEmailApplicable',
    fieldType: 'Checkbox',
    label: 'Is Email Applicable',
  },
  {
    key: 'isActive',
    name: 'isActive',
    fieldType: 'Checkbox',
    label: 'Is Active',
  },
  {
    key: 'merchantAddress',
    name: 'merchantAddress',
    fieldType: 'Section',
    label: 'Merchant Address',
    fieldsInSection: [
      {
        key: 'merchantAddress.line1',
        name: 'merchantAddress.line1',
        fieldType: 'Text',
        label: 'Line 1',
      },
      {
        key: 'merchantAddress.line2',
        name: 'merchantAddress.line2',
        fieldType: 'Text',
        label: 'Line 2',
      },
      {
        key: 'merchantAddress.area',
        name: 'merchantAddress.area',
        fieldType: 'Text',
        label: 'Area',
      },
      {
        key: 'merchantAddress.city',
        name: 'merchantAddress.city',
        fieldType: 'Text',
        label: 'City',
      },
      {
        key: 'merchantAddress.post',
        name: 'merchantAddress.post',
        fieldType: 'Text',
        label: 'Postal Code',
      },
      {
        key: 'merchantAddress.country',
        name: 'merchantAddress.country',
        fieldType: 'Text',
        label: 'Country',
      },
    ],
  },
  {
    key: 'merchantManagementInfo',
    name: 'merchantManagementInfo',
    fieldType: 'Section',
    label: 'Merchant Management Info',
    fieldsInSection: [
      {
        key: 'merchantManagementInfo.ownerName',
        name: 'merchantManagementInfo.ownerName',
        fieldType: 'Text',
        label: 'Owner Name',
      },
      {
        key: 'merchantManagementInfo.ownerPhone',
        name: 'merchantManagementInfo.ownerPhone',
        fieldType: 'Text',
        label: 'Owner Phone',
      },
      {
        key: 'merchantManagementInfo.ownerEmail',
        name: 'merchantManagementInfo.ownerEmail',
        fieldType: 'Text',
        label: 'Owner Email',
      },
      {
        key: 'merchantManagementInfo.managerName',
        name: 'merchantManagementInfo.managerName',
        fieldType: 'Text',
        label: 'Manager Name',
      },
      {
        key: 'merchantManagementInfo.managerPhone',
        name: 'merchantManagementInfo.managerPhone',
        fieldType: 'Text',
        label: 'Manager Phone',
      },
      {
        key: 'merchantManagementInfo.managerEmail',
        name: 'merchantManagementInfo.managerEmail',
        fieldType: 'Text',
        label: 'Manager Email',
      },
    ],
  },
];
