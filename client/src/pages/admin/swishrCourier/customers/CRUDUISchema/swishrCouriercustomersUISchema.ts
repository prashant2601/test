import { UISCHEMA } from '../../../customers/CRUDUISchema/customersUISchema';

export const swishrCouriercustomersUISchema: UISCHEMA[] = [
  {
    key: 'customerId',
    name: 'customerId',
    fieldType: 'Number',
    label: 'Customer ID',
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
    key: 'merchantId',
    name: 'merchantId',
    fieldType: 'Number',
    label: 'Merchant ID',
  },
  {
    key: 'customerFirstName',
    name: 'customerFirstName',
    fieldType: 'Text',
    label: 'First Name',
  },
  {
    key: 'customerLastName',
    name: 'customerLastName',
    fieldType: 'Text',
    label: 'Last Name',
  },
  {
    key: 'customerEmail',
    name: 'customerEmail',
    fieldType: 'Text',
    label: 'Email',
  },
  {
    key: 'customerMobile',
    name: 'customerMobile',
    fieldType: 'Text',
    label: 'Mobile',
  },
  {
    key: 'customerDOB',
    name: 'customerDOB',
    fieldType: 'Date',
    label: 'Date of Birth',
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
    disabled: {
      disabledFieldForNew: false,
      disableFieldForEdit: true,
    },
    meta: {
      options: [{ label: 'Web', value: 'Web' }],
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
    key: 'profileImg',
    name: 'profileImg',
    fieldType: 'imageInput',
    label: 'Profile Image',
  },
  {
    key: 'branchId',
    name: 'branchId',
    fieldType: 'Number',
    label: 'Branch ID',
  },
  {
    key: 'customerAddress',
    name: 'customerAddress',
    fieldType: 'Section',
    label: ' Customer Address',
    fieldsInSection: [
      {
        key: 'customerAddress.line1',
        name: 'customerAddress.line1',
        fieldType: 'Text',
        label: 'Line 1',
      },
      {
        key: 'customerAddress.line2',
        name: 'customerAddress.line2',
        fieldType: 'Text',
        label: 'Line 2',
      },
      {
        key: 'customerAddress.area',
        name: 'customerAddress.area',
        fieldType: 'Text',
        label: 'Area',
      },
      {
        key: 'customerAddress.city',
        name: 'customerAddress.city',
        fieldType: 'Text',
        label: 'City',
      },
      {
        key: 'customerAddress.post',
        name: 'customerAddress.post',
        fieldType: 'Text',
        label: 'Postal Code',
      },
      {
        key: 'customerAddress.country',
        name: 'customerAddress.country',
        fieldType: 'Text',
        label: 'Country',
      },
    ],
  },
];
