import { useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import { displayRelevantErrorNotification } from '../../../../utility/helperFuntions';
import ApiHelpers from '../../../../api/ApiHelpers';
import { notifications } from '@mantine/notifications';

interface SendOrderFeedbackSuccessResponse {
  message: string;
  success: boolean;
}

interface SendOrderFeedbackErrorResponse {
  error: string;
  success: boolean;
}

interface OrderFeedbackParams {
  orderId: number;
  customerId: number;
}

const sendCustomersOrderFeedback = (
  orderFeedbacks: OrderFeedbackParams[]
): Promise<
  AxiosResponse<
    SendOrderFeedbackSuccessResponse,
    SendOrderFeedbackErrorResponse
  >
> => {
  const url = ApiConstants.SEND_CUSTOMERS_ORDERIDS_FEEDBACK();
  return ApiHelpers.POST(url, orderFeedbacks);
};

export const useSendCustomersOrderIDsFeedback = () => {
  return useMutation({
    mutationFn: (orderFeedbacks: OrderFeedbackParams[]) =>
      sendCustomersOrderFeedback(orderFeedbacks),
    onSuccess: (data) => {
      if (data?.data?.success) {
        notifications.show({
          title: 'Success',
          message: data?.data?.message,
          position: 'top-center',
          color: 'green',
        });
      }
      // TODO
      // invalididate the email grid data
    },
    onError: (error) => {
      displayRelevantErrorNotification(error);
    },
  });
};
