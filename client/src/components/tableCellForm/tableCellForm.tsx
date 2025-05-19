import { FC, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { Formik, Form, FormikProps, FormikValues } from 'formik';
import {
  Button,
  Group,
  Box,
  LoadingOverlay,
  Paper,
  Fieldset,
} from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import FormikNumberField from '../CoreUI/FormikFields/FormikNumberField';
import FormikInputField from '../CoreUI/FormikFields/FormikInputField';
import FormikSelectField from '../CoreUI/FormikFields/FormikSelectField';
import FormikDateTimeField from '../CoreUI/FormikFields/FormikDateTimeField';
import usegetableCellActions from './usegetableCellActions';
import AppAlertComponent from '../AppAlertComponent';
import useValidationSchema from './useValidationSchema';
import FormikImageFileUpload from '../CoreUI/FormikFields/FormikImageFileUpload';
import FormikDatePickerField from '../CoreUI/FormikFields/FormikDateField';
import { UISCHEMA } from '../../pages/admin/customers/CRUDUISchema/customersUISchema';
import FormikCheckboxField from '../CoreUI/FormikFields/FormikCheckBoxField';
import FormikRatingField from '../CoreUI/FormikFields/FormikRatingField';
import FormikRadioGroupForBooleanValue from '../CoreUI/FormikFields/FormikRadioGroupForBooleanValue';
import MutliSelectMerchantIds from '../../pages/admin/accounting/MutliSelectMerchantIds';
import FormikSortCodeField from '../CoreUI/FormikFields/FormikSortCodeField';
import { useGetInitialFormValues } from './useGetInitialFormValues';
import { TableNames } from '../../enums';
import AdditionalRenderInFieldSection from './AdditionalRenderInFieldSection';
import AdditionalRendererInTableCellForm from './AdditionalRendererInTableCellForm';
import FormikRadioGroupForString from '../CoreUI/FormikFields/FormikRadioGroupForString';
import FormikFileUpload from '../CoreUI/FormikFields/FormikFileUpload';
import FormikStringArrayField from '../CoreUI/FormikFields/FormikStringArrayField';

// Lazy load the components
const ExpenseCategoryTypeInput = lazy(
  () => import('../ExpenseCategoryTypeInput')
);
const ExpenseStoreNameInput = lazy(() => import('../ExpenseStoreNameInput'));
const ExpenseTypeInput = lazy(() => import('../ExpenseTypeInput'));

interface TableCellFormProps {
  originalRow: Record<string, any>;
  formState: 'VIEW' | 'NEW' | 'EDIT';
  onClose: () => void;
  crudOperationHeader: string;
  uiSchema: UISCHEMA[];
  tableName?: TableNames;
}

const styles = {
  scrollablePaper: {
    overflow: 'scroll',
    maxHeight: '70vh',
  },
  formWrapper: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    rowGap: '20px',
    gap: '20px',
    alignItems: 'flex-start',
  },
  formFieldBox: {
    marginBottom: 'sm',
    width: '23%',
    minWidth: '300px',
  },
  fullWidthField: {
    width: '100%',
  },
  alertPaper: {
    marginTop: 20,
  },
  buttonGroup: {
    justifyContent: 'center',
    marginTop: 20,
  },
  legand: {
    background: '#dbdbdb',
    fontWeight: '500',
    borderRadius: '0.5rem',
    padding: '2px 10px',
  },
};

const TableCellForm: FC<TableCellFormProps> = ({
  originalRow,
  formState = 'VIEW',
  onClose,
  crudOperationHeader,
  uiSchema,
  tableName,
}) => {
  const {
    New: {
      CreateNewRecord,
      ErrorObjectinCreatingNewRecord,
      IsCreatingNewCrecord,
      IsSuccessInCreatingNewRecord,
      isErrorInCreatingNewRecord,
      ResetNewRecordMutation,
    },
    Edit: {
      EditRecord,
      isErrorinUpdating,
      isPendingEdit,
      isSuccessInEditing,
      ResetEditRecordMutation,
    },
  } = usegetableCellActions(tableName);
  const { validationSchema } = useValidationSchema({ tableName, formState });
  const { scrollIntoView, targetRef, scrollableRef } =
    useScrollIntoView<HTMLDivElement>({
      offset: 60,
    });
  useEffect(() => {
    if (isErrorInCreatingNewRecord || isErrorinUpdating) {
      scrollIntoView();
    }
  }, [isErrorInCreatingNewRecord || isErrorinUpdating]);
  useEffect(() => {
    if (IsSuccessInCreatingNewRecord || isSuccessInEditing) {
      onClose();
    }
  }, [IsSuccessInCreatingNewRecord, isSuccessInEditing]);

  const formikRef = useRef<FormikProps<Record<string, any>>>(null);
  const handleSubmit = (values: Record<string, any>) => {
    if (formState === 'EDIT' && EditRecord) {
      EditRecord({ updates: [values], initialFormData: originalRow });
    } else if (formState === 'NEW' && CreateNewRecord) {
      CreateNewRecord(values);
    }
  };
  const resetMutationOnFormReset = useCallback(() => {
    if (formState == 'NEW' && ResetNewRecordMutation) {
      ResetNewRecordMutation();
    } else if (formState === 'EDIT' && ResetEditRecordMutation) {
      ResetEditRecordMutation();
    }
  }, [formState, ResetNewRecordMutation, ResetEditRecordMutation]);

  useEffect(() => {
    if (IsSuccessInCreatingNewRecord) {
      formikRef?.current?.resetForm();
    }
  }, [IsSuccessInCreatingNewRecord]);
  const initialValues = useGetInitialFormValues(
    tableName,
    formikRef.current?.values
  );
  const shouldRenderField = useCallback(
    (values: FormikValues, field: UISCHEMA) => {
      if (
        tableName === TableNames?.BankAccountDisplay &&
        field.name === 'merchantId'
      ) {
        return values?.accountRole === 'Partner Merchant';
      }
      if (
        tableName === TableNames?.UsersDisplay &&
        field.name === 'merchantIds'
      ) {
        return values?.role === 'merchant';
      }
    },
    [tableName, formState]
  );
  const handleOnChangeCallback = useCallback(
    async (value: string) => {
      if (tableName === TableNames?.MerchantsDisplay && value === 'true') {
        await formikRef.current?.setFieldValue(
          'deliveryChargeApplicable',
          true
        );
      }
    },
    [tableName]
  );
  return (
    <Paper pos={'relative'}>
      <Formik<Record<string, any>>
        initialValues={formState === 'NEW' ? initialValues : originalRow}
        validationSchema={validationSchema ?? {}}
        onSubmit={handleSubmit}
        innerRef={formikRef}
        onReset={resetMutationOnFormReset}
        enableReinitialize
      >
        {({ dirty, values }) => (
          <Form>
            <Paper style={styles.scrollablePaper} ref={scrollableRef}>
              <Box style={styles.formWrapper}>
                {uiSchema?.map((uiField) => {
                  const renderField = (field: UISCHEMA) => {
                    const {
                      fieldType,
                      key,
                      label,
                      name,
                      meta,
                      fieldsInSection,
                    } = field;

                    const isHiddenField =
                      formState === 'NEW'
                        ? field?.hidden?.hideFieldForNEW
                        : field?.hidden?.hideFieldForEDIT;

                    if (isHiddenField) return null;
                    if (
                      meta?.conditionallyRender &&
                      !shouldRenderField(values, field)
                    ) {
                      return null;
                    }
                    const isDisabledField =
                      formState === 'EDIT'
                        ? field?.disabled?.disableFieldForEdit
                        : field?.disabled?.disabledFieldForNew;

                    const fieldProps = {
                      key,
                      name,
                      label,
                      disabled: isDisabledField,
                    };

                    switch (fieldType) {
                      case 'DateTimeRange':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikDateTimeField {...fieldProps} />
                          </Box>
                        );
                      case 'Date':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikDatePickerField {...fieldProps} />
                          </Box>
                        );
                      case 'Select':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikSelectField
                              {...fieldProps}
                              data={meta?.options ?? []}
                            />
                          </Box>
                        );
                      case 'Number':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikNumberField
                              {...fieldProps}
                              valueAsNumber={meta?.valueAsNumber}
                            />
                          </Box>
                        );
                      case 'imageInput':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikImageFileUpload
                              {...fieldProps}
                              accept={'image/png,image/jpeg'}
                              maxSize={2000}
                            />
                          </Box>
                        );
                      case 'FileUpload':
                        return (
                          <Box style={styles.fullWidthField} key={key}>
                            <FormikFileUpload
                              {...fieldProps}
                              acceptedTypes={field.meta?.acceptedTypes}
                            />
                          </Box>
                        );

                      case 'Checkbox':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikCheckboxField {...fieldProps} />
                          </Box>
                        );
                      case 'Rating':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikRatingField {...fieldProps} />
                          </Box>
                        );
                      case 'RadioGroupForBoolean':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikRadioGroupForBooleanValue
                              {...fieldProps}
                              options={field?.meta?.options ?? []}
                              onChangeCallback={handleOnChangeCallback}
                            />
                          </Box>
                        );
                      case 'RadioGroupForString':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikRadioGroupForString
                              {...fieldProps}
                              options={field?.meta?.options ?? []}
                              key={key}
                            />
                          </Box>
                        );
                      case 'ArrayofStrings':
                        return (
                          <Box key={key}>
                            <FormikStringArrayField {...fieldProps} />
                          </Box>
                        );
                      case 'SortCode':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikSortCodeField {...fieldProps} />
                          </Box>
                        );
                      case 'Section':
                        return (
                          <Box
                            style={{ width: '100%', marginTop: 20 }}
                            key={key}
                          >
                            <Fieldset
                              legend={label}
                              styles={{
                                legend: styles.legand,
                              }}
                            >
                              <Box style={styles.formWrapper}>
                                {fieldsInSection?.map((sectionField?) =>
                                  renderField(sectionField)
                                )}
                              </Box>
                              {TableNames.OrdersDisplay === tableName && (
                                <AdditionalRenderInFieldSection />
                              )}
                            </Fieldset>
                          </Box>
                        );
                      case 'MerchantIDs':
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <MutliSelectMerchantIds
                              {...fieldProps}
                              needLabel
                              multiSelect={meta?.multiSelect}
                            />
                          </Box>
                        );
                      case 'ExpenseCategoryType':
                        return (
                          <Suspense fallback={<div>Loading...</div>} key={key}>
                            <ExpenseCategoryTypeInput {...fieldProps} />
                          </Suspense>
                        );
                      case 'ExpenseStoreNameInput':
                        return (
                          <Suspense fallback={<div>Loading...</div>} key={key}>
                            <ExpenseStoreNameInput {...fieldProps} />
                          </Suspense>
                        );
                      case 'ExpenseTypeInput':
                        return (
                          <Suspense fallback={<div>Loading...</div>} key={key}>
                            <ExpenseTypeInput {...fieldProps} key={key} />
                          </Suspense>
                        );
                      default:
                        return (
                          <Box style={styles.formFieldBox} key={key}>
                            <FormikInputField {...fieldProps} />
                          </Box>
                        );
                    }
                  };

                  return renderField(uiField);
                })}
                <LoadingOverlay
                  visible={isPendingEdit || IsCreatingNewCrecord}
                />
              </Box>
              {/* <Space  /> */}
              {tableName === TableNames.ExpensesDisplay && (
                <AdditionalRendererInTableCellForm
                  formState={formState}
                  tableName={tableName}
                  uiSchema={uiSchema}
                  originalRow={originalRow}
                />
              )}

              <Paper style={styles.alertPaper} ref={targetRef}>
                {isErrorInCreatingNewRecord && dirty && (
                  <AppAlertComponent
                    title={
                      ErrorObjectinCreatingNewRecord?.response?.data?.error ??
                      'Error'
                    }
                    color="red"
                    message={
                      ErrorObjectinCreatingNewRecord?.response?.data?.message ??
                      ErrorObjectinCreatingNewRecord?.response?.data?.errors?.join(
                        ','
                      ) ??
                      'There was an error creating new record.'
                    }
                  />
                )}
              </Paper>
            </Paper>

            {formState !== 'VIEW' && (
              <Group style={styles.buttonGroup}>
                <Button
                  type="submit"
                  disabled={isPendingEdit || IsCreatingNewCrecord}
                >
                  {formState === 'NEW'
                    ? `Create ${crudOperationHeader}`
                    : `Update ${crudOperationHeader}`}
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  disabled={isPendingEdit || IsCreatingNewCrecord}
                >
                  Reset Form
                </Button>
              </Group>
            )}
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default TableCellForm;
