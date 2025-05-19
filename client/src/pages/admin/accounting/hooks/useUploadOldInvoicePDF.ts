import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';
import { notifications } from '@mantine/notifications';

export interface UploadOldInvoicePDFParams {
  merchantId: string;
  merchantName: string;
  pdfFiles: File[];
}

export interface UploadInvoiceResult {
  success: boolean;
  message: string;
  filename: string;
  data?: {
    invoiceId: string;
    invoiceDate: string;
    fromDate: string;
    toDate: string;
    downloadLink: string;
    merchantId: string;
    merchantName: string;
  };
}

export interface UploadInvoicePDFResponse {
  success: boolean;
  message: string;
  results: UploadInvoiceResult[];
}

const uploadOldInvoicePDF = (
  payload: UploadOldInvoicePDFParams
): Promise<AxiosResponse<UploadInvoicePDFResponse>> => {
  const url = ApiConstants.UPLOAD_OLD_INVOICE_PDFS();
  const formData = new FormData();
  formData.append('merchantId', payload.merchantId);
  formData.append('merchantName', payload.merchantName);
  payload.pdfFiles.forEach((file) => {
    formData.append('pdfs', file);
  });

  return ApiHelpers.POST(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useUploadOldInvoicePDF = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadOldInvoicePDFParams) => uploadOldInvoicePDF(data),
    onSuccess: (response) => {
      if (response?.data?.message) {
        notifications.show({
          title: 'Upload Complete',
          message: response.data.message,
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
