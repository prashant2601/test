import { useFormikContext } from 'formik';
import FormikGrid from '../../../../components/CoreUI/FormikFields/FormikGridArrayOfObjects';
import { Expense, PaymentTypeEnum } from './hooks/useGetExpenseData';
import FormikStringArrayField from '../../../../components/CoreUI/FormikFields/FormikStringArrayField';
import { Fieldset, Stack } from '@mantine/core';
import { isEqual } from 'lodash';
import FormikFileUpload from '../../../../components/CoreUI/FormikFields/FormikFileUpload';
import { useEffect, useMemo } from 'react';
const newRow = {
  category: '',
  itemName: '',
  selectedVAT: 0,
  amount: 0,
  vatAmount: 0,
  total: 0,
};
const paymentDetailsColumns = [
  'paymentType',
  'cardType',
  'paymentFrom.CARD',
  'paymentFrom.CASH',
  'isSameDayPayment',
  'paymentDate',
];

const paymentDetailsHeaders = [
  'Payment Type',
  'Card Type',
  'Card Payment',
  'Cash Payment',
  'Payment Done on Same Day',
  'Payment Date',
];

const paymentDetailsFieldTypes = {
  paymentType: 'select' as const,
  cardType: 'text' as const,
  'paymentFrom.CARD': 'number' as const,
  'paymentFrom.CASH': 'number' as const,
  isSameDayPayment: 'RadioGroupBooleanValue' as const,
  paymentDate: 'date-time' as const,
};

const paymentDetailsSelectOptions = [
  {
    columnName: 'paymentType',
    options: Object.values(PaymentTypeEnum).map((type) => ({
      label: type,
      value: type,
    })),
  },
];

const paymentDetailsDefaultValues = {
  paymentType: '',
  cardType: '',
  paymentFrom: { CARD: 0, CASH: 0 },
  paymentDate: '',
};

const receiptItemsColumns = [
  'category',
  'itemName',
  'selectedVAT',
  'amount',
  'vatAmount',
  'total',
];

const receiptItemsHeaders = [
  'Category',
  'Item Name',
  'Selected VAT',
  'Amount',
  'VAT Amount',
  'Total',
];

const receiptItemsFieldTypes = {
  category: 'ExpenseCategoryType' as const,
  itemName: 'text' as const,
  selectedVAT: 'selectNumber' as const,
  amount: 'number' as const,
  vatAmount: 'number' as const,
  total: 'number' as const,
};

const receiptItemsSelectOptions = [
  {
    columnName: 'selectedVAT',
    options: [
      { label: '0%', value: 0 },
      { label: '5%', value: 5 },
      { label: '10%', value: 10 },
      { label: '20%', value: 20 },
    ],
  },
];

const receiptItemsDisableCols = ['vatAmount', 'total'];

interface ExpenseDataCrudProps {
  formState: 'VIEW' | 'NEW' | 'EDIT';
}
const ExpenseDataCRUD = (props: ExpenseDataCrudProps) => {
  const { formState } = props;
  const { values, setFieldValue } = useFormikContext<Expense>();
  useEffect(() => {
    if (!Array.isArray(values?.receiptItems) || !setFieldValue) return;

    // Create a new array to store the modified rows
    const updatedReceiptItems = values.receiptItems.map((item, index) => {
      const amount = Number(item?.amount ?? 0);
      const vat = Number(item?.selectedVAT ?? 0);
      const currentVATAmount = Number(item?.vatAmount ?? 0);
      const currentTotal = Number(item?.total ?? 0);

      if (!isNaN(amount) && !isNaN(vat)) {
        const calculatedVATAmount = +((amount * vat) / 100).toFixed(2);
        const calculatedTotal = +(amount + calculatedVATAmount).toFixed(2);

        // If VAT or total has changed, update the row
        if (
          calculatedVATAmount !== currentVATAmount ||
          calculatedTotal !== currentTotal
        ) {
          return {
            ...item, // Spread the existing row
            vatAmount: calculatedVATAmount,
            total: calculatedTotal,
          };
        }
      }

      // Return the original row if no changes were made
      return item;
    });

    if (!isEqual(values.receiptItems, updatedReceiptItems)) {
      setFieldValue('receiptItems', updatedReceiptItems, false);
    }
  }, [values.receiptItems]);
  useEffect(() => {
    if (
      formState === 'NEW' &&
      values?.receiptDate &&
      Array.isArray(values?.paymentDetails) &&
      values.paymentDetails.length
    ) {
      const newExpectedValuesInPaymentDetails = values.paymentDetails.map(
        (singlePayment) => {
          if (singlePayment?.isSameDayPayment === 'true') {
            return {
              ...singlePayment,
              paymentDate: values.receiptDate,
            };
          }
          return singlePayment;
        }
      );

      if (!isEqual(values.paymentDetails, newExpectedValuesInPaymentDetails)) {
        setFieldValue('paymentDetails', newExpectedValuesInPaymentDetails);
      }
    }
  }, [formState, values?.receiptDate, values?.paymentDetails]);
  const isEdit = formState === 'EDIT';

  const dynamicPaymentDetailsColumns = useMemo(() => {
    return isEdit
      ? paymentDetailsColumns.filter((col) => col !== 'isSameDayPayment')
      : paymentDetailsColumns;
  }, [isEdit, paymentDetailsColumns]);

  const dynamicPaymentDetailsHeaders = useMemo(() => {
    return isEdit
      ? paymentDetailsHeaders.filter(
          (header) => header !== 'Payment Done on Same Day'
        )
      : paymentDetailsHeaders;
  }, [isEdit, paymentDetailsHeaders]);

  const dynamicPaymentDetailsWidths = useMemo(() => {
    return isEdit
      ? ['220px', '250px', '150px', '150px', '250px'] // Without last column
      : ['220px', '250px', '150px', '150px', '250px', '200px'];
  }, [isEdit]);
  return (
    <Stack mt={'md'}>
      {formState === 'EDIT' && (
        <Fieldset
          legend={`Reciept Links`}
          styles={{ legend: { fontWeight: '500', color: 'green' } }}
        >
          <FormikStringArrayField
            label="Reciept Links"
            name="receiptLink"
            hideNewButton
            textAsLinks
            needLabel={false}
          />
        </Fieldset>
      )}
      <FormikGrid
        FieldsetHeader="Payment Details"
        name="paymentDetails"
        fieldTypes={paymentDetailsFieldTypes}
        selectOptions={paymentDetailsSelectOptions}
        newRowDefaulValues={paymentDetailsDefaultValues}
        columns={dynamicPaymentDetailsColumns}
        columnsHeader={dynamicPaymentDetailsHeaders}
        columnWidths={dynamicPaymentDetailsWidths}
      />

      <FormikGrid
        name="receiptItems"
        FieldsetHeader="Receipt Items"
        columns={receiptItemsColumns}
        columnsHeader={receiptItemsHeaders}
        columnWidths={['320px', '300px', '150px', '150px', '150px', '150px']}
        fieldTypes={receiptItemsFieldTypes}
        selectOptions={receiptItemsSelectOptions}
        newRowDefaulValues={newRow}
        disableColumns={receiptItemsDisableCols}
      />
      <FormikFileUpload
        key={'files'}
        name={'files'}
        label={'Files'}
        acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
      />
    </Stack>
  );
};

export default ExpenseDataCRUD;
