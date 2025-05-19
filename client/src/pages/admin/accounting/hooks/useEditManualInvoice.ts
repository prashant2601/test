import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';
import { notifications } from '@mantine/notifications';
import { ManualInvoiceRow } from './useGetAllManualInvoices';

interface EditManualInvoiceSuccessResponse {
  message: string;
}

interface EditManualInvoiceErrorResponse {
  error: string;
}

const editManualInvoice = (
  invoiceData: ManualInvoiceRow
): Promise<
  AxiosResponse<
    EditManualInvoiceSuccessResponse,
    EditManualInvoiceErrorResponse
  >
> => {
  const url = ApiConstants.EDIT_MANUAL_INVOICE();
  const payload = {
    fromDate: invoiceData?.fromDate,
    toDate: invoiceData?.toDate,
    invoiceDate: invoiceData?.createdAt,
    invoiceId: invoiceData?.invoiceId,
    status: invoiceData?.status,
    invoiceParameters: invoiceData?.invoiceParameters,
  };
  return ApiHelpers.PUT(url, payload);
};

export const useEditManualInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceData: ManualInvoiceRow) => {
      return editManualInvoice(invoiceData);
    },
    onSuccess: (data) => {
      if (data?.data?.message) {
        notifications.show({
          title: 'Invoice Updated',
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
