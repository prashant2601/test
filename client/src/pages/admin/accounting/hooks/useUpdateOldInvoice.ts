import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';
import { notifications } from '@mantine/notifications';
import { OldInvoice } from './useGetAllOldInvoices';

interface EditOldInvoiceSuccessResponse {
  message: string;
}

interface EditOldInvoiceErrorResponse {
  error: string;
}

const editOldInvoice = (
  invoiceData: OldInvoice,
  initialFormData: { invoiceId: string }
): Promise<
  AxiosResponse<EditOldInvoiceSuccessResponse, EditOldInvoiceErrorResponse>
> => {
  const url = ApiConstants.EDIT_OLD_INVOICE();
  const payload = {
    olderInvoiceId: initialFormData?.invoiceId,
    newInvoiceId: invoiceData?.invoiceId,
    fromDate: invoiceData?.fromDate,
    toDate: invoiceData?.toDate,
    invoiceDate: invoiceData?.createdAt,
  };
  return ApiHelpers.PUT(url, payload);
};

export const useUpdateOldInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      updates,
      initialFormData,
    }: {
      updates: any[];
      initialFormData: { invoiceId: string };
    }) => {
      return editOldInvoice(updates[0], initialFormData);
    },
    onSuccess: (data) => {
      if (data?.data?.message) {
        notifications.show({
          title: 'Old Invoice Updated',
          message: data?.data?.message,
          position: 'top-center',
          color: 'green',
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['OlderInvoiceGrid'],
      });
    },
    onError: (error) => {
      displayRelevantErrorNotification(error);
    },
  });
};
