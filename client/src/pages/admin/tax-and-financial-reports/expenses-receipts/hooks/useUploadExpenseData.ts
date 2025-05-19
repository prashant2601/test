import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { AxiosError, AxiosResponse } from 'axios';
import ApiConstants from '../../../../../api/ApiConstants';
import ApiHelpers from '../../../../../api/ApiHelpers';
import { Expense } from './useGetExpenseData';

interface UploadExpenseDataRequest extends Expense {
  files: File[]; // Files you want to upload
}

interface UploadExpenseDataResponse {
  message: string;
  success: boolean;
}

interface UploadExpenseDataError {
  message: string;
  success: boolean;
  error: string;
}
export const sanitizePaymentDetails = (paymentDetails: any[]): any[] => {
  return paymentDetails.map(({ isSameDayPayment, ...rest }) => rest);
};
const uploadExpenseData = async (
  payload: UploadExpenseDataRequest
): Promise<AxiosResponse<UploadExpenseDataResponse>> => {
  const formData = new FormData();

  for (const key in payload) {
    const value = payload[key as keyof UploadExpenseDataRequest];

    if (key === 'paymentDetails' && Array.isArray(value)) {
      const sanitized = sanitizePaymentDetails(value);
      formData.append(key, JSON.stringify(sanitized));
    } else if (key === 'files') {
      continue;
    } else {
      formData.append(
        key,
        value instanceof Date
          ? value.toISOString()
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value)
      );
    }
  }

  if (payload?.files?.length) {
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  return ApiHelpers.POST(ApiConstants.UPLOAD_EXPENSE_DATA(), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useUploadExpenseData = () => {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<UploadExpenseDataResponse>,
    AxiosError<UploadExpenseDataError>,
    UploadExpenseDataRequest
  >({
    mutationFn: async (expenseData: UploadExpenseDataRequest) => {
      const response = await uploadExpenseData(expenseData);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['Expense-Grid-data'] });
      notifications.show({
        title: 'Expense Uploaded Successfully',
        message: data?.data?.message,
        color: 'green',
        autoClose: 5000,
        position: 'top-center',
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        notifications.show({
          title: error?.response?.data?.error ?? 'Upload Failed',
          message: 'There was an error uploading the expense data.',
          color: 'red',
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: 'Expense Upload Failed',
          message: 'Something went wrong.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
  });
};
