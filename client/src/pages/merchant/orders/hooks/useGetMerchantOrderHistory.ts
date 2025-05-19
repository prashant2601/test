import { useInfiniteQuery } from '@tanstack/react-query';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import useGetRelevantMerchantID from '../../hooks/useGetRelevantMerchantID';

// Types
export interface MerchantOrder {
  orderId: string;
  orderTime: string;
  paymentType: string;
  total: number;
  status: string;
  orderType: string;
  deliveryCharge: number;
}

export interface OrderHistoryDayGroup {
  date: string;
  orders: MerchantOrder[];
}

interface GetMerchantOrderHistoryResponse {
  orders: OrderHistoryDayGroup[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  totalOrderSum: number;
  fromDate?: string;
  toDate?: string;
}

const PAGE_SIZE = 10;

interface UseGetMerchantOrderHistoryProps {
  orderId?: string;
  dateRange?: [Date | null, Date | null];
  EnableQuery: boolean;
}

export const useGetMerchantOrderHistory = ({
  orderId,
  dateRange,
  EnableQuery,
}: UseGetMerchantOrderHistoryProps) => {
  const merchantId = useGetRelevantMerchantID();

  const fetchPage = async (
    pageParam: number
  ): Promise<GetMerchantOrderHistoryResponse> => {
    const queryParams = {
      merchantId,
      pageNo: pageParam,
      limit: PAGE_SIZE,
      orderId,
      startDate: dateRange?.[0],
      endDate: dateRange?.[1],
    };

    const response = await ApiHelpers.GET(
      ApiConstants.GET_MERCHANT_ORDER_HISTORY(),
      { params: queryParams }
    );

    return response.data;
  };

  return useInfiniteQuery({
    queryKey: ['merchant-order-history', orderId, dateRange, merchantId],
    queryFn: ({ pageParam = 1 }) => fetchPage(pageParam),
    initialPageParam: 1,
    enabled: EnableQuery && !!merchantId,
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.currentPage > 1 ? firstPage.currentPage - 1 : undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    staleTime: 5 * 1000,
  });
};
