import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { notifications } from '@mantine/notifications';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';

export interface SendInvoicesToMerchantSuccessResponse {
  message: string;
  invoiceIds: string[];
}

export interface SendInvoicesToMerchantErrorResponse {
  message: string;
}

function sendInvoicesToMerchants(
  invoiceIds: string[]
): Promise<
  AxiosResponse<
    SendInvoicesToMerchantSuccessResponse,
    SendInvoicesToMerchantErrorResponse
  >
> {
  return ApiHelpers.PUT(ApiConstants.SEND_INVOICES_TO_MERCHANTS(), {
    invoiceIds: invoiceIds,
  });
}
interface UseSendInvoicesToMerchantsProps {
  gridName: string;
}
export const useSendInvoicesToMerchants = (
  props: UseSendInvoicesToMerchantsProps
) => {
  const { gridName } = props;
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['Send-Invoices-TO-Merchants'],
    mutationFn: (invoiceIds: string[]) => sendInvoicesToMerchants(invoiceIds),
    onSuccess: (data) => {
      if (data?.data) {
        if (gridName === 'AllManualInvoicesDisplay') {
          queryClient.invalidateQueries({
            queryKey: ['All_Manual_Invoices-Grid-data'],
          });
        } else if (gridName === 'AllInvoicesDisplay') {
          queryClient.invalidateQueries({
            queryKey: ['All_Invoices-Grid-data'],
          });
          queryClient.invalidateQueries({ queryKey: ['Invoices-of-Merchant'] });
        }

        notifications.show({
          title: data?.data?.message,
          message: `${data?.data?.invoiceIds?.toString()} Invoice Ids Sent to Merchants`,
          color: 'green',
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: 'Operation Failed',
          message: 'An error occurred while sending the invoice.',
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
