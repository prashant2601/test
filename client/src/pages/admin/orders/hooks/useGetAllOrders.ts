import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { ColumnFilter } from '@tanstack/table-core';
import dayjs from 'dayjs';
import { MRT_PaginationState, MRT_SortingState } from 'material-react-table';
import { AppGridGetDataAPIProps } from '../../../../types/globalTypes';

enum OrderType {
  DELIVERY = 'DELIVERY',
  COLLECTION = 'COLLECTION',
}

enum PaymentType {
  CARD = 'CARD',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

enum PaymentStatus {
  PROCESSED = 'PROCESSED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

enum ConfirmationStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}
export interface OrderItem {
  quantity: number;
  product: string;
}
export interface Order {
  _id: string;
  orderId: string;
  orderDate: string;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  orderType: OrderType;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  confirmationStatus: ConfirmationStatus;
  promoCode?: string;
  orderDiscount: number;
  driverTip: number;
  deliveryCharge: number;
  serviceFee: number;
  subTotal: number;
  taxes: number;
  total: number;
  branchName: string;
  merchantId?: string;
  status: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
  feedback?: number;
  promoDiscountSwishr: number;
  promoDiscountMerchant: number;
  refundSwishr: number;
  refundMerchant: number;
  newOrderValue: number;
  netServiceFee: number;
  netDeliveryCharge: number;
  netCommission: number;
  orderItems: OrderItem[];
  merchantDetails: {
    isInHouseType: boolean;
    deliveryOrdersComission: number;
    collectionOrdersComission: number;
    serviceFeeApplicable: boolean;
    deliveryChargeApplicable: boolean;
  };
}

interface GetAllOrdersResponse {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

function getFormattedDayFromDayjs(dateobj: dayjs.Dayjs) {
  return dayjs(dateobj, 'DD MMM YYYY hh:mm A').format(
    'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
  );
}
const allowedParammsInBAckend = [
  'merchantId',
  'pageNo',
  'limit',
  'customerId',
  'orderType',
  'paymentType',
  'confirmationStatus',
  'status',
  'paymentStatus',
  'branchName',
  'orderId',
] as const;
type AllowedParams = (typeof allowedParammsInBAckend)[number];

type Params = {
  [key in AllowedParams]?: any;
};
const ExtractedcolumnFiltersForParams = (columnFilters: ColumnFilter[]) => {
  let params: Params = {};

  columnFilters?.forEach((columnFilter) => {
    if (allowedParammsInBAckend?.includes(columnFilter.id as AllowedParams)) {
      if (Array.isArray(columnFilter.value)) {
        params[columnFilter.id as AllowedParams] =
          columnFilter.value?.join(',');
      } else {
        params[columnFilter.id as AllowedParams] = columnFilter.value;
      }
    }
  });
  return params;
};
const formatSortForParams = (sorting: MRT_SortingState) => {
  let sort = '';
  const columnID = sorting?.[0]?.id;
  const sortDirection = sorting?.[0]?.desc;
  if (columnID === 'customerFirstName' && !sortDirection) {
    sort = 'ascFirstName';
  } else if (columnID === 'customerFirstName' && sortDirection) {
    sort = 'descFirstName';
  } else if (columnID === 'customerLastName' && !sortDirection) {
    sort = 'ascLastName';
  } else if (columnID === 'customerLastName' && sortDirection) {
    sort = 'descLastName';
  } else if (columnID === 'orderDate' && !sortDirection) {
    sort = 'ascOrder';
  } else if (columnID === 'orderDate' && sortDirection) {
    sort = 'descOrder';
  }
  if (sort) {
    return { sort };
  }
};
const formatDateForParams = (columnFilters: ColumnFilter[]) => {
  let startDate = '';
  let endDate = '';
  const getDateColumn = columnFilters?.find(
    (column) => column.id === 'orderDate'
  );
  if (getDateColumn && Array.isArray(getDateColumn?.value)) {
    startDate = getDateColumn?.value[0]
      ? getFormattedDayFromDayjs(getDateColumn?.value[0])
      : '';
    endDate = getDateColumn?.value[1]
      ? getFormattedDayFromDayjs(getDateColumn?.value[1])
      : '';
  }
  if (startDate || endDate) {
    return { startDate, endDate };
  }
};
function fetchOrders(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<GetAllOrdersResponse>> {
  const finalQueryParams = {
    merchantId: null,
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
  };
  return ApiHelpers.GET(ApiConstants.GET_ALL_ORDERS(), {
    params: finalQueryParams,
  });
}

export const useGETALLOrdersWithFilters = (props: AppGridGetDataAPIProps) => {
  const { columnFilters, EnableQuery, sorting, pagination } = props;
  const queryKey = ['Orders-Grid-data', columnFilters, sorting, pagination];
  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchOrders(columnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    enabled: EnableQuery,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
