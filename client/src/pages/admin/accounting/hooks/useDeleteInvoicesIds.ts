import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { notifications } from '@mantine/notifications';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import { useLocation } from 'react-router-dom';

interface DeleteInvoiceIdsResponse {
  message: string;
  deletedCount: number;
  success: boolean;
}

function deleteInvoiceIds(
  invoiceId: string
): Promise<AxiosResponse<DeleteInvoiceIdsResponse>> {
  return ApiHelpers.DELETE(ApiConstants.DELETE_INVOICE_BY_IDS(invoiceId));
}

export const useDeleteInvoiceIds = () => {
  const queryClient = useQueryClient();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab');
  return useMutation({
    mutationKey: ['Deleting-Invoices'],
    mutationFn: (invoiceId: string) => deleteInvoiceIds(invoiceId),
    onSuccess: (data) => {
      if (data?.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['All_Invoices-Grid-data'] });
        queryClient.invalidateQueries({
          queryKey: ['All_Manual_Invoices-Grid-data'],
        });
        if (activeTab && activeTab === 'Old_Invoices') {
          queryClient.invalidateQueries({
            queryKey: ['OlderInvoiceGrid'],
          });
        }
        notifications.show({
          title: 'Invoice deletion operation is successful',
          message: `Deleted ${data.data.deletedCount} invoice(s).`,
          color: 'green',
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: 'Invoice Deletion Failed',
          message:
            data?.data?.message ??
            'An error occurred while deleting the invoice.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
    onError: (error) => {
      displayRelevantErrorNotification(error);
    },
  });
};
