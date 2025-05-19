import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { notifications } from '@mantine/notifications';
import ApiConstants from '../../../../api/ApiConstants';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';
import { Invoice } from './useGetAllInvoices';
interface EditInvoiceSuccessResponse {
  message: string;
}
interface EditInvoiceErrorResponse {
  message: string;
}

const editInvoice = ({
  updates,
}: {
  updates: Invoice;
}): Promise<
  AxiosResponse<EditInvoiceSuccessResponse, EditInvoiceErrorResponse>
> => {
  const url = ApiConstants.EDIT_MERCHANT_INVOICE();
  return ApiHelpers.PUT(url, updates);
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates }: { updates: Invoice }) => editInvoice({ updates }),
    onSuccess: (data) => {
      notifications.show({
        title: 'Invoice Update',
        message: data?.data?.message ?? 'Invoice updated successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['All_Invoices-Grid-data'] });
    },
    onError: (error) => {
      displayRelevantErrorNotification(error);
    },
  });
};
