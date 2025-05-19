import ApiHelpers from '../api/ApiHelpers';
import ApiConstants from '../api/ApiConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosResponse } from 'axios';
import { ParsedData } from './useUplaodAndGetCsvData';
import useAppBasedContext from './useAppBasedContext';
import { isEqual } from 'lodash';
export interface EditAndSaveResponse {
  message: string;
  invoice: Invoice;
}
interface AmountToReceive {
  total: number;
  cashPayment: number;
  bankPayment: number;
}
export interface Invoice {
  invoiceId: string;
  customerId: number;
  calculationsByOrderType: {
    DELIVERY: OrderTypeDetails;
    COLLECTION: OrderTypeDetails;
    SERVICE_FEE?: ServiceFeeSection;
    DELIVERY_CHARGE?: OrderTypeDetails;
    DRIVER_TIP?: OrderTypeDetails;
    [key: string]: OrderTypeDetails | undefined; // For potential additional order types
  };
  calculationsByPaymentType: {
    CARD?: PaymentTypeDetails;
    CASH?: PaymentTypeDetails;
  };
  totalSubTotal: number;
  tax_amount: number;
  totalWithTax: number;
  totalSalesValue: number;
  amountToRecieve: AmountToReceive;
  startDate: string;
  endDate: string;
  storeName: string;
  _id: string;
  createdAt: string;
  __v: number;
  taxRate: number;
}

interface OrderTypeDetails {
  totalOrderValue: number;
  totalOrders: number;
  commissionRate: number;
  amount: number;
}
interface ServiceFeeSection extends OrderTypeDetails {
  isCashOrders?: boolean;
}
interface PaymentTypeDetails {
  totalOrderValue: number;
  totalOrders: number;
}

const saveEditedData = async (
  formValues: ParsedData
): Promise<AxiosResponse<EditAndSaveResponse, any>> => {
  return await ApiHelpers.POST(ApiConstants.SAVE_INVOICE_DATA(), formValues);
};

export const useSaveSubmittedData = () => {
  const { setTrackOldFormData, setInvoiceData } = useAppBasedContext();
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<EditAndSaveResponse>, Error, ParsedData>({
    // mutationFn: (data: ParsedData) => saveEditedData(data),

    mutationFn: async (newData: ParsedData) => {
      // Retrieve the previously posted data
      const cachedOldFormData = queryClient.getQueryData<ParsedData>([
        'oldpreviewPDFData',
      ]);

      // Compare new data with cached data
      if (isEqual(cachedOldFormData, newData)) {
        // Return the cached parsed data if the form data hasn't changed
        const cachedParsedData = queryClient.getQueryData<EditAndSaveResponse>([
          'editedAndSavedData',
        ]);
        return { data: cachedParsedData } as AxiosResponse<EditAndSaveResponse>;
      }

      // Perform the network call if data has changed
      const response = await saveEditedData(newData);

      // Update cached form data after successful network call
      queryClient.setQueryData(['oldpreviewPDFData'], newData);

      return response;
    },
    retry: 0,
    onSuccess: (data, postedFormData) => {
      notifications.show({
        title: data?.data?.message ?? 'Data updated successfully',
        message: 'Some more text here',
        color: 'green',
      });
      setTrackOldFormData({ step2: postedFormData });
      setInvoiceData(data?.data);
      queryClient.setQueryData(['editedAndSavedData'], data?.data);
    },
    onError: (data) =>
      notifications.show({
        title: 'Failed to Update the calculations',
        message: 'Some more text here',
        color: 'red',
      }),
  });
};
