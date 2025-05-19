import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';
import { notifications } from '@mantine/notifications';

interface CreateManualInvoiceSuccessResponse {
  message: string;
  invoice: any;
}

interface CreateManualInvoiceErrorResponse {
  error: string;
}

interface CreateManualInvoiceParams {
  fromDate: string;
  toDate: string;
  customerAddress: {
    name: string;
    email: string;
    customerId: string;
    line1: string;
    line2: string;
    area: string;
    post: string;
    country: string;
  };
  invoiceParameters: {
    firstPageData: { text: string; vatapplicable: boolean; amount: number }[];
    secondPageData: { text: string; amount: number }[];
    thirdPageData: { date: string; description: string; amount: number }[];
    totalSubTotal: number;
    tax_amount: number;
    totalWithTax: number;
    openingBalance: number;
    closingBalance: number;
  };
}

const createManualInvoice = (
  invoiceData: CreateManualInvoiceParams
): Promise<
  AxiosResponse<
    CreateManualInvoiceSuccessResponse,
    CreateManualInvoiceErrorResponse
  >
> => {
  const url = ApiConstants.CREATE_MANUAL_INVOICE();
  return ApiHelpers.POST(url, invoiceData);
};

export const useCreateManualInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceData: CreateManualInvoiceParams) => {
      return createManualInvoice(invoiceData);
    },
    onSuccess: (data) => {
      if (data?.data?.message) {
        notifications.show({
          title: 'Invoice Generated',
          message: data?.data?.message,
          position: 'top-center',
          color: 'green',
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['All_Manual_Invoices-Grid-data'],
      });
    },
    onError: (error) => {
      displayRelevantErrorNotification(error);
    },
  });
};
