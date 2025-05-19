import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { MRT_SortingState, MRT_PaginationState } from 'material-react-table';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { AppGridGetDataAPIProps } from '../../../../types/globalTypes';
export interface InvoiceParameters {
  totalSales: number;
  totalOrdersCount: number;
  deliveryOrderCount: number;
  collectionOrderCount: number;
  cardPaymentCount: number;
  cashPaymentCount: number;
  cardPaymentAmount: string;
  cashPaymentAmount: number;
  deliveryOrderValue: number;
  collectionOrderValue: number;
  calculationsByOrderType: {
    DELIVERY: {
      totalOrderValue: number;
      totalOrders: number;
      commissionRate: number;
      amount: number;
    };
    COLLECTION: {
      totalOrderValue: number;
      totalOrders: number;
      commissionRate: number;
      amount: number;
    };
  };
  totalSubTotal: number;
  taxAmount: number;
  totalWithTax: number;
}
export interface MerchantInvoice {
  _id: string;
  merchantId: number;
  invoiceId: string;
  fromDate: Date;
  toDate: Date;
  downloadLink: string;
  createdAt: Date;
  invoiceParameters: InvoiceParameters[];
  __v: number;
}

export interface APIResponseInvoicesOfMerchantID {
  invoices: MerchantInvoice[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
function getFormattedDayFromDayjs(dateobj: dayjs.Dayjs) {
  return dayjs(dateobj, 'DD MMM YYYY').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}

const formatSortForParams = (sorting: MRT_SortingState) => {
  let sort = '';
  const columnID = sorting?.[0]?.id;
  const sortDirection = sorting?.[0]?.desc;
  if (columnID === 'createdAt' && !sortDirection) {
    sort = 'asc';
  } else if (columnID === 'createdAt' && sortDirection) {
    sort = 'desc';
  }
  if (sort) {
    return { sort };
  }
};
const formatDateForParams = (columnFilters: ColumnFilter[]) => {
  let startDate = '';
  let endDate = '';
  const getFromDateColumn = columnFilters?.find(
    (column) => column.id === 'fromDate'
  );
  const getEndDateColumn = columnFilters?.find(
    (column) => column.id === 'toDate'
  );
  if (getFromDateColumn) {
    startDate = getFromDateColumn?.value
      ? getFormattedDayFromDayjs(getFromDateColumn?.value as dayjs.Dayjs)
      : '';
    if (getEndDateColumn) {
      endDate = getEndDateColumn?.value
        ? getFormattedDayFromDayjs(getEndDateColumn?.value as dayjs.Dayjs)
        : '';
    }
  }
  if (startDate || endDate) {
    return { startDate, endDate };
  }
};
function fetchInvoicesOfMerchant(
  merchantId: string,
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<APIResponseInvoicesOfMerchantID>> {
  const finalQueryParams = {
    merchantId,
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...formatDateForParams(columnFilters),
  };
  return ApiHelpers.GET(ApiConstants.GET_MERCHANT_INVOICES_BY_ID(), {
    params: finalQueryParams,
  });
}
interface GetAllInvoicesOfMerchantProps extends AppGridGetDataAPIProps {
  merchantId: string;
}
export const useGetInvoicesbyMerchantId = (
  props: GetAllInvoicesOfMerchantProps
) => {
  const { merchantId, columnFilters, EnableQuery, sorting, pagination } = props;
  const queryKey = [
    'Invoices-of-Merchant',
    merchantId,
    columnFilters,
    sorting,
    pagination,
  ];
  return useQuery({
    queryKey: queryKey,
    queryFn: () =>
      fetchInvoicesOfMerchant(merchantId, columnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    enabled: EnableQuery,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
