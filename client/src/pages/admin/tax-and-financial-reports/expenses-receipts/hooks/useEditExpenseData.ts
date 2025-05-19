import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { notifications } from '@mantine/notifications';
import ApiHelpers from '../../../../../api/ApiHelpers';
import ApiConstants from '../../../../../api/ApiConstants';
import { handleAPIError } from '../../../../../utility/helperFuntions';
import { Expense } from './useGetExpenseData';
import { sanitizePaymentDetails } from './useUploadExpenseData';

interface EditExpenseResponse {
  message: string;
  success: boolean;
  receipt: any;
}
interface EditExpenseDataRequest extends Expense {
  files: File[]; // Files you want to upload
}
async function editExpenseData(
  payload: EditExpenseDataRequest
): Promise<AxiosResponse<EditExpenseResponse>> {
  const url = ApiConstants.EDIT_EXPENSE_DATA();
  const formData = new FormData();

  for (const key in payload) {
    if (key === 'files' || payload[key as keyof Expense] === undefined)
      continue;

    const value = payload[key as keyof Expense];

    if (key === 'paymentDetails' && Array.isArray(value)) {
      const sanitized = sanitizePaymentDetails(value);
      formData.append(key, JSON.stringify(sanitized));
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

  // Append files separately if needed
  if (payload?.files?.length) {
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  return ApiHelpers.PUT(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// Custom hook
export const useEditExpenseData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ updates }: { updates: EditExpenseDataRequest[] }) =>
      editExpenseData(updates[0]),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Updated Successfully',
        message: data?.data?.message ?? 'Updated successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Grid-data'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        handleAPIError(error);
      } else {
        console.error('Non-Axios error:', error);
      }
    },
  });
};
