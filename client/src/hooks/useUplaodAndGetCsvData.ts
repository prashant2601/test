import ApiHelpers from '../api/ApiHelpers';
import ApiConstants from '../api/ApiConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { FormValueTypes } from '../pages/UploadandGenrateInvoice/Step1';
import { AxiosError, AxiosResponse } from 'axios';
import useAppBasedContext from './useAppBasedContext';
import { isEqual } from 'lodash';
export interface ValidationErrorDetail {
  fileName: string;
  issues: Issue[];
}

interface Issue {
  fileName: string;
  invalidField: string;
  invalidValue: string;
}

export interface ValidationErrorResponse {
  error: string;
  details: ValidationErrorDetail[];
}

interface CalculationDetails {
  totalOrderValue: number;
  totalOrders: number;
  commissionRate: number;
  amount: number;
}
interface SERVICE_FEE_MORE_Keys extends CalculationDetails {
  isCashOrders?: boolean;
}

interface PaymentTypeDetails {
  totalOrderValue: number;
  totalOrders: number;
}

export interface CalculationsByOrderType {
  DELIVERY: CalculationDetails;
  COLLECTION: CalculationDetails;
  SERVICE_FEE?: SERVICE_FEE_MORE_Keys;
  DELIVERY_CHARGE?: CalculationDetails;
  DRIVER_TIP?: CalculationDetails;
}
interface AmountToReceive {
  total: number;
  cashPayment: number;
  bankPayment: number;
}
interface CalculationsByPaymentType {
  CARD?: PaymentTypeDetails;
  CASH?: PaymentTypeDetails;
}

export interface ParsedData {
  customerId: number;
  calculationsByOrderType: CalculationsByOrderType;
  calculationsByPaymentType: CalculationsByPaymentType;
  totalSubTotal: number;
  tax_amount: number;
  totalWithTax: number;
  totalSalesValue: number;
  amountToRecieve: AmountToReceive;
  startDate: string;
  endDate: string;
  storeName: string;
  taxRate: number;
  totalFoodValue: number;
}

const uploadFiles = async (
  formValues: FormValueTypes
): Promise<AxiosResponse<ParsedData>> => {
  if (!formValues.csvfile || formValues.csvfile.length === 0) {
    throw new Error('No file');
  }
  const formData = new FormData();

  Array.from(formValues?.csvfile).forEach((file) => {
    formData.append('files', file);
  });
  formData.append('customerId', formValues.customerid);
  formData.append('taxRate', formValues.taxrate.toString());

  return await ApiHelpers.POST(
    ApiConstants.UPLOAD_AND_GET_INVOICE_DATA(),
    formData
  );
};

export const useUploadandGetCsvData = () => {
  const queryClient = useQueryClient();
  const { setParsedData, setTrackOldFormData } = useAppBasedContext();
  return useMutation<
    AxiosResponse<ParsedData>,
    AxiosError<ValidationErrorResponse>,
    FormValueTypes
  >({
    mutationFn: async (newData: FormValueTypes) => {
      // Retrieve the previously posted data
      const cachedOldFormData = queryClient.getQueryData<FormValueTypes>([
        'oldFormData',
      ]);

      // Compare new data with cached data
      if (isEqual(cachedOldFormData, newData)) {
        // Return the cached parsed data if the form data hasn't changed
        const cachedParsedData = queryClient.getQueryData<ParsedData>([
          'parsedData',
        ]);
        return { data: cachedParsedData } as AxiosResponse<ParsedData>;
      }

      // Perform the network call if data has changed
      const response = await uploadFiles(newData);

      // Update cached form data after successful network call
      queryClient.setQueryData(['oldFormData'], newData);

      return response;
    },
    retry: 0,
    onSuccess: (data, postedData) => {
      notifications.show({
        title: 'File Uploaded successfully',
        message: 'Success',
        color: 'green',
        autoClose: 2000,
      });
      setParsedData(data?.data);
      setTrackOldFormData({ step1: postedData, step2: undefined });

      // Cache the parsed data for future use
      queryClient.setQueryData(['parsedData'], data?.data);
    },
    onError: (data) => {
      if (data instanceof AxiosError) {
        notifications.show({
          title: data?.response?.data?.error ?? 'Request Failed',
          message: 'Request Failed',
          color: 'red',
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: 'File Upload Failed',
          message: 'Something went wrong',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
  });
};
