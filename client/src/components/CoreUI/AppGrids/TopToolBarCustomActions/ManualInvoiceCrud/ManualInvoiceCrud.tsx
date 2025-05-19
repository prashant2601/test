import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Formik, Form, FormikProps } from 'formik';
import {
  Button,
  Group,
  Box,
  LoadingOverlay,
  Divider,
  Paper,
  Fieldset,
  Stack,
  Text,
  Center,
  Title,
  Mark,
} from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import { UISCHEMA } from '../../../../../pages/admin/customers/CRUDUISchema/customersUISchema';
import AppAlertComponent from '../../../../AppAlertComponent';
import FormikCheckboxField from '../../../FormikFields/FormikCheckBoxField';
import FormikDatePickerField from '../../../FormikFields/FormikDateField';
import FormikDateTimeField from '../../../FormikFields/FormikDateTimeField';
import FormikInputField from '../../../FormikFields/FormikInputField';
import FormikNumberField from '../../../FormikFields/FormikNumberField';
import FormikRadioGroupForBooleanValue from '../../../FormikFields/FormikRadioGroupForBooleanValue';
import FormikSelectField from '../../../FormikFields/FormikSelectField';
import FormikGrid from '../../../FormikFields/FormikGridArrayOfObjects';
import { useCreateManualInvoice } from '../../../../../pages/admin/accounting/hooks/useCreateManualInvoice';
import { useEditManualInvoice } from '../../../../../pages/admin/accounting/hooks/useEditManualInvoice';
import * as Yup from 'yup';
import DebouncedAutoCompleteTextInput from '../../../../AppAutoCompletes/DebouncedAutoCompleteTextInput';
import { useGetSwishrCourierCustomer } from '../../../../../pages/admin/accounting/hooks/useGetSwishrCourierCustomer';
import MutliSelectMerchantIds from '../../../../../pages/admin/accounting/MutliSelectMerchantIds';
import { DebouncedSearchedMerchant } from '../../../../../pages/admin/merchants/hooks/useGetMerchantIdAndName';

interface CustomerAddress {
  name: string;
  line1: string;
  line2: string;
  area: string;
  post: string;
  country: string;
}

interface InvoiceData {
  text: string;
  amount: number;
}
interface InvoiceFirstPageData extends InvoiceData {
  vatapplicable: boolean;
}

interface InvoiceParameters {
  firstPageData: InvoiceFirstPageData[];
  secondPageData: InvoiceData[];
  thirdPageData: { date: string; description: string; amount: number }[];
  totalSubTotal: number;
  tax_amount: number;
  totalWithTax: number;
  customerAddress: CustomerAddress;
}

interface ManualInvoice {
  fromDate: string;
  toDate: string;
  invoiceParameters: InvoiceParameters;
  isMarketPlaceInvoiceManually: boolean;
}

const validationSchema = Yup.object({
  fromDate: Yup.date()
    .required('From date is required')
    .max(Yup.ref('toDate'), 'From date must be before to date'),
  toDate: Yup.date()
    .required('To date is required')
    .min(Yup.ref('fromDate'), 'To date must be after from date'),
  invoiceParameters: Yup.object({
    customerAddress: Yup.object({
      name: Yup.string().required('Name is compulsory'),
      post: Yup.string().required('Post code is required'),
    }),
    firstPageData: Yup.array().test({
      name: 'check-for-empty-row',
      test: (rows) => {
        console.log(rows);
        return rows?.every((row) => row.text && row.amount);
      },
      message: 'Rows must have Description and Amount',
    }),
    secondPageData: Yup.array().test(
      'check-for-empty-row-seocondpage',
      'At least one row must have values or be deleted',
      (rows) => rows?.every((row) => row.text && row.amount)
    ),
    thirdPageData: Yup.array().test(
      'check-for-empty-row-thirdpage',
      'At least one row must have values or be deleted',
      (rows) => rows?.every((row) => row.date && row.description && row.amount)
    ),
    totalSubTotal: Yup.number().min(0, 'SubTotal cannot be negative'),
    tax_amount: Yup.number().min(0, 'Tax amount cannot be negative'),
    totalWithTax: Yup.number().min(0, 'Total with tax cannot be negative'),
  }),
});

const initialValues: ManualInvoice = {
  fromDate: '',
  toDate: '',
  invoiceParameters: {
    customerAddress: {
      name: '',
      line1: '',
      line2: '',
      area: '',
      post: '',
      country: '',
    },
    firstPageData: [{ text: '', vatapplicable: false, amount: 0.0 }],
    secondPageData: [{ text: '', amount: 0.0 }],
    thirdPageData: [{ date: '', description: '', amount: 0.0 }],
    totalSubTotal: 0,
    tax_amount: 0,
    totalWithTax: 0,
    openingBalance: 0,
    closingBalance: 0,
  },
  isMarketPlaceInvoiceManually: false,
};
const getOptionValue = (option: { label: string; value: string }) =>
  option?.value;
const getOptionLabel = (option: { label: string; value: string }) =>
  option?.label;

interface ManualInvoiceCrudProps {
  originalRow: Record<string, any>;
  formState: 'VIEW' | 'NEW' | 'EDIT';
  onClose: () => void;
}

const styles = {
  scrollablePaper: { maxHeight: '70vh' },
  formWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    alignItems: 'flex-start',
    padding: '5px',
  },
  formFieldBox: { marginBottom: 'sm', width: '23%' },
  alertPaper: { marginTop: 20 },
  buttonGroup: { justifyContent: 'center', marginTop: 20 },
};

const renderField = (field: UISCHEMA, formState: 'NEW' | 'EDIT') => {
  const { fieldType, key, name, label, meta, fieldsInSection } = field;

  const isHiddenField =
    formState === 'NEW'
      ? field?.hidden?.hideFieldForNEW
      : field?.hidden?.hideFieldForEDIT;
  if (isHiddenField) return null;

  const isDisabledField =
    formState === 'EDIT'
      ? field?.disabled?.disableFieldForEdit
      : field?.disabled?.disabledFieldForNew;

  const fieldProps = { key, name, label, disabled: isDisabledField };

  const FieldComponents: Record<string, React.ReactNode> = {
    DateTimeRange: <FormikDateTimeField {...fieldProps} />,
    Date: <FormikDatePickerField {...fieldProps} />,
    Select: <FormikSelectField {...fieldProps} data={meta?.options ?? []} />,
    Number: <FormikNumberField {...fieldProps} />,
    Checkbox: <FormikCheckboxField {...fieldProps} />,
    Section: (
      <Fieldset legend={label} styles={{ legend: { fontWeight: '500' } }}>
        <Box style={styles.formWrapper}>
          {fieldsInSection?.map((sectionField) =>
            renderField(sectionField, 'NEW')
          )}
        </Box>
      </Fieldset>
    ),
  };

  return (
    <Box style={styles.formFieldBox} key={key}>
      {FieldComponents[fieldType] ?? <FormikInputField {...fieldProps} />}
    </Box>
  );
};

const ManualInvoiceCRUD: FC<ManualInvoiceCrudProps> = ({
  originalRow,
  formState = 'VIEW',
  onClose,
}) => {
  const {
    mutateAsync: CreateInvoice,
    isSuccess: isSuccessInCreatingInvoice,
    isError: isErrorInCreatingNewInvoice,
    error: ErrorResponseinCreatingInvoice,
    isPending: isCreatingInvoice,
  } = useCreateManualInvoice();
  const {
    mutateAsync: EditInvoice,
    isSuccess: isSuccessInEditingInvoice,
    isError: isErrorInEditingInvoice,
    error: ErrorResponseinEditingInvoice,
    isPending: isEditingInvoice,
  } = useEditManualInvoice();
  const [search, setSearch] = useState('');
  const {
    data: CustomerData,
    isError: isErrorInFetchingCustomers,
    isLoading: isLoadingCustomers,
    isFetching: IsFetchingCustomers,
  } = useGetSwishrCourierCustomer(search, true, 1, 100);
  const dataForCustomerAutoComplete =
    CustomerData?.data?.customers?.map((cus) => ({
      label: `${cus.customerName} (${cus.customerId})`,
      value: cus.customerId?.toString(),
    })) ?? [];
  const handleCustomerSelect = (val: string) => {
    const SelectedCustomer = CustomerData?.data?.customers?.find(
      (customer) => customer?.customerId?.toString() === val
    );
    if (SelectedCustomer) {
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.name',
        SelectedCustomer?.customerName
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.customerId',
        SelectedCustomer?.customerId
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.email',
        SelectedCustomer?.email
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.line1',
        SelectedCustomer?.addressLine1
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.line2',
        SelectedCustomer?.addressLine2
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.area',
        SelectedCustomer?.area
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.city',
        SelectedCustomer?.city
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.post',
        SelectedCustomer?.post
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.country',
        SelectedCustomer?.country
      );
      setSearch(SelectedCustomer?.customerName);
    }
  };
  const handleMerchantSelect = (merchant: DebouncedSearchedMerchant) => {
    if (merchant) {
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.name',
        merchant?.merchantName
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.customerId',
        merchant?.merchantId
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.email',
        merchant?.email
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.line1',
        merchant?.addressLine1
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.line2',
        merchant?.addressLine2
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.area',
        merchant?.area
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.city',
        merchant?.city
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.post',
        merchant?.post
      );
      formikRef?.current?.setFieldValue(
        'invoiceParameters.customerAddress.country',
        merchant?.country
      );
    }
  };
  const handleCalculate = useCallback(() => {
    const totalSubTotal =
      formikRef?.current?.values?.invoiceParameters?.firstPageData?.reduce(
        (acc, row) => acc + row?.amount,
        0
      ) ?? 0;
    const tax_amount =
      formikRef?.current?.values?.invoiceParameters?.firstPageData
        ?.filter((row) => row?.vatapplicable && row?.amount)
        ?.reduce((acc, row) => acc + row?.amount * 0.2, 0) ?? 0;
    formikRef?.current?.setFieldValue(
      'invoiceParameters.totalSubTotal',
      totalSubTotal
    );
    formikRef?.current?.setFieldValue(
      'invoiceParameters.tax_amount',
      tax_amount
    );
    formikRef?.current?.setFieldValue(
      'invoiceParameters.totalWithTax',
      totalSubTotal + tax_amount
    );
  }, []);
  const { scrollIntoView, targetRef, scrollableRef } =
    useScrollIntoView<HTMLDivElement>({ offset: 60 });
  useEffect(() => {
    if (isErrorInCreatingNewInvoice || isErrorInEditingInvoice)
      scrollIntoView();
  }, [isErrorInCreatingNewInvoice]);

  useEffect(() => {
    if (isSuccessInCreatingInvoice || isSuccessInEditingInvoice) {
      formikRef?.current?.resetForm();
      onClose();
    }
  }, [isSuccessInCreatingInvoice, isSuccessInEditingInvoice]);

  const formikRef = useRef<FormikProps<ManualInvoice>>(null);

  const handleSubmit = (values: ManualInvoice) => {
    if (formState === 'EDIT') EditInvoice(values);
    else if (formState === 'NEW') CreateInvoice(values);
  };

  const fieldsInSection = [
    {
      key: 'invoiceParameters.customerAddress.line1',
      name: 'invoiceParameters.customerAddress.line1',
      fieldType: 'Text',
      label: 'Line 1',
    },
    {
      key: 'invoiceParameters.customerAddress.line2',
      name: 'invoiceParameters.customerAddress.line2',
      fieldType: 'Text',
      label: 'Line 2',
    },
    {
      key: 'invoiceParameters.customerAddress.area',
      name: 'invoiceParameters.customerAddress.area',
      fieldType: 'Text',
      label: 'Area',
    },
    {
      key: 'invoiceParameters.customerAddress.city',
      name: 'invoiceParameters.customerAddress.city',
      fieldType: 'Text',
      label: 'City',
    },
    {
      key: 'invoiceParameters.customerAddress.post',
      name: 'invoiceParameters.customerAddress.post',
      fieldType: 'Text',
      label: 'Postal Code',
    },
    {
      key: 'invoiceParameters.customerAddress.country',
      name: 'invoiceParameters.customerAddress.country',
      fieldType: 'Text',
      label: 'Country',
    },
  ];

  return (
    <Paper pos={'relative'}>
      <Formik<ManualInvoice>
        initialValues={formState === 'EDIT' ? originalRow : initialValues}
        onSubmit={handleSubmit}
        innerRef={formikRef}
        validationSchema={validationSchema}
      >
        {({ dirty, values }) => (
          <Form>
            <Paper style={styles.scrollablePaper} ref={scrollableRef}>
              {formState === 'EDIT' && (
                <Title order={5} ta="center" c="grey">
                  Invoice Id: {values?.invoiceId}
                </Title>
              )}
              <Stack px={40} py={20}>
                {formState === 'NEW' && (
                  <Group>
                    <Text>
                      <Mark>Select Invoice Type:</Mark>
                    </Text>
                    <FormikRadioGroupForBooleanValue
                      options={[
                        { label: 'Market place invoice', value: 'true' },
                        { label: 'Courier invoice', value: 'false' },
                      ]}
                      label={null}
                      name="isMarketPlaceInvoiceManually"
                    />
                  </Group>
                )}
                {formState === 'NEW' &&
                !values?.isMarketPlaceInvoiceManually ? (
                  <Group align="center" w="fit-content">
                    <Text>
                      <Mark>Select Customer:</Mark>
                    </Text>
                    <DebouncedAutoCompleteTextInput
                      data={dataForCustomerAutoComplete}
                      disable={false}
                      isError={isErrorInFetchingCustomers}
                      isFetching={IsFetchingCustomers}
                      TextInputLabel="Select Customer"
                      optionValue={getOptionValue}
                      isLoading={isLoadingCustomers}
                      optionLabel={getOptionLabel}
                      dropdownMaxHeight={300}
                      setSearch={setSearch}
                      search={search}
                      noOptionFound="No customer Found"
                      onOptionSelect={handleCustomerSelect}
                      needLabel={false}
                      width="300px"
                    />
                  </Group>
                ) : formState === 'NEW' ? (
                  <Group>
                    <Text>
                      <Mark>Select Merchant:</Mark>
                    </Text>
                    <MutliSelectMerchantIds
                      name="somename"
                      needLabel={false}
                      multiSelect={false}
                      onSingleMerchantSelect={handleMerchantSelect}
                      singelSelectTextInputWidth={300}
                    />
                  </Group>
                ) : null}

                <Box
                  style={{ width: '100%', marginTop: 20 }}
                  key="CustomerDetails"
                >
                  <Fieldset
                    legend="Customer Details"
                    styles={{ legend: { fontWeight: '500', color: 'green' } }}
                  >
                    <Group>
                      <Box style={styles.formFieldBox}>
                        <FormikInputField
                          name="invoiceParameters.customerAddress.name"
                          label="Customer Name"
                          disabled={formState === 'EDIT'}
                        />
                      </Box>
                      <Box style={styles.formFieldBox}>
                        <FormikInputField
                          name="invoiceParameters.customerAddress.email"
                          label="Customer Email"
                          disabled={formState === 'EDIT'}
                        />
                      </Box>
                    </Group>
                    <Divider
                      label="Customer Address"
                      my={20}
                      size={'md'}
                      styles={{ label: { fontSize: '14px' } }}
                    />
                    <Box style={styles.formWrapper}>
                      {fieldsInSection.map((sectionField) =>
                        renderField(sectionField, 'NEW')
                      )}
                    </Box>
                  </Fieldset>
                </Box>

                <Fieldset
                  legend="Invoice Basic Details"
                  styles={{ legend: { fontWeight: '500', color: 'green' } }}
                >
                  <Group align="flex-start">
                    <Box style={styles.formFieldBox}>
                      <FormikDatePickerField
                        name="fromDate"
                        label="From Date"
                      />
                    </Box>
                    <Box style={styles.formFieldBox}>
                      <FormikDatePickerField name="toDate" label="To Date" />
                    </Box>
                    {formState === 'EDIT' && (
                      <Box style={styles.formFieldBox}>
                        <FormikDatePickerField
                          name="createdAt"
                          label="Invoice Date"
                        />
                      </Box>
                    )}
                  </Group>
                </Fieldset>
                <Box style={{ width: 'fit-content' }}>
                  <FormikGrid
                    name="invoiceParameters.firstPageData"
                    columns={['text', 'vatapplicable', 'amount']}
                    columnsHeader={['Description', 'VAT', 'Amount']}
                    columnWidths={['600px', '20px', '200px']}
                    fieldTypes={{
                      text: 'text',
                      vatapplicable: 'VAT_Checkbox',
                      amount: 'number',
                    }}
                    FieldsetHeader="Description and Amount section"
                  />
                  <Button
                    color="teal"
                    disabled={values?.invoiceParameters?.firstPageData?.some(
                      (row) => !row?.amount || !row?.text
                    )}
                    mr={20}
                    variant="outline"
                    onClick={handleCalculate}
                    mt={10}
                  >
                    Calculate
                  </Button>
                </Box>
                <Fieldset
                  legend="Total Section"
                  styles={{ legend: { fontWeight: '500', color: 'green' } }}
                >
                  <Group align="flex-start">
                    <FormikNumberField
                      name="invoiceParameters.totalSubTotal"
                      label="Subtotal"
                      extraProps={{ prefix: '£', maw: '200' }}
                    />
                    <FormikNumberField
                      name="invoiceParameters.tax_amount"
                      label="VAT"
                      extraProps={{ prefix: '£', maw: '200' }}
                    />
                    <FormikNumberField
                      name="invoiceParameters.totalWithTax"
                      label="Total Inc. VAT"
                      extraProps={{ prefix: '£', maw: '200' }}
                    />
                  </Group>
                </Fieldset>

                <Divider
                  size="lg"
                  label={<Text>Page 2 Starts here</Text>}
                  my={20}
                />
                <Box style={{ width: 'fit-content' }}>
                  <FormikGrid
                    name="invoiceParameters.secondPageData"
                    columns={['text', 'amount']}
                    columnsHeader={['Description', 'Amount']}
                    columnWidths={['600px', '200px']}
                    fieldTypes={{ text: 'text', amount: 'number' }}
                    FieldsetHeader="Summary"
                  />
                </Box>
                <Divider
                  size="lg"
                  label={<Text>Page 3 Starts here</Text>}
                  my={20}
                />
                <Box style={{ width: 'fit-content' }}>
                  <FormikGrid
                    name="invoiceParameters.thirdPageData"
                    columns={['date', 'description', 'amount']}
                    columnsHeader={['Date', 'Description', 'Amount']}
                    columnWidths={['200px', '600px', '200px']}
                    fieldTypes={{
                      date: 'date',
                      description: 'text',
                      amount: 'number',
                    }}
                    FieldsetHeader="Account Statement"
                  />
                </Box>
                <Divider my={20} />
                <Center>
                  <Group>
                    <Button
                      type="submit"
                      color="teal"
                      loading={isCreatingInvoice || isEditingInvoice}
                      disabled={!dirty}
                      mr={20}
                    >
                      {formState === 'NEW' ? 'Create Invoice' : 'Edit Invoice'}
                    </Button>
                    <Button color="red" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="outline" type="reset">
                      Reset
                    </Button>
                  </Group>
                </Center>
              </Stack>
              <LoadingOverlay visible={isCreatingInvoice || isEditingInvoice} />
              {isErrorInCreatingNewInvoice && dirty && (
                <AppAlertComponent
                  title={ErrorResponseinCreatingInvoice?.message ?? 'Error'}
                  color="red"
                  message={
                    ErrorResponseinCreatingInvoice?.message ??
                    'There was an error creating new Invoice.'
                  }
                />
              )}
            </Paper>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default ManualInvoiceCRUD;
