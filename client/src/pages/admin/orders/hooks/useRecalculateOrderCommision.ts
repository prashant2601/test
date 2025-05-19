import { useMutation } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { handleAPIError } from '../../../../utility/helperFuntions';
import { Order } from './useGetAllOrders';

interface RecalculateCommissionRequest {
  orderId: string;
  merchantDetails: Record<string, any>;
}

interface RecalculateCommissionResponse {
  success: boolean;
  message: string;
  order: Order;
}

async function recalculateCommission(
  data: RecalculateCommissionRequest
): Promise<AxiosResponse<RecalculateCommissionResponse>> {
  const url = ApiConstants.RECALCULATE_ORDER_COMMISSION();
  return ApiHelpers.POST(url, data);
}

export const useRecalculateOrderCommission = () => {
  return useMutation({
    mutationFn: (payload: RecalculateCommissionRequest) =>
      recalculateCommission(payload),
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        handleAPIError(error);
      } else {
        console.error('Non-Axios error:', error);
      }
    },
  });
};
