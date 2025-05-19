import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';

interface ViewInvoiceSuccessResponse {
  message: string;
  success: boolean;
}

interface ViewInvoiceErrorResponse {
  error: string;
  success: boolean;
}

interface ViewInvoiceParams {
  invoiceId: string;
}

const viewInvoiceByMerchant = ({
  invoiceId,
}: ViewInvoiceParams): Promise<
  AxiosResponse<ViewInvoiceSuccessResponse, ViewInvoiceErrorResponse>
> => {
  const url = `${ApiConstants.VIEW_INVOICE_BY_MERCHANT()}?invoiceId=${invoiceId}`;
  return ApiHelpers.GET(url);
};

export const useMerchantViewInvoiceID = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId }: ViewInvoiceParams) =>
      viewInvoiceByMerchant({ invoiceId }),
    onSuccess: (data) => {
      if (data?.data?.success) {
        queryClient.invalidateQueries({ queryKey: ['All_Invoices-Grid-data'] });
      }
    },
    onError: (error) => {
      displayRelevantErrorNotification(error);
    },
  });
};
