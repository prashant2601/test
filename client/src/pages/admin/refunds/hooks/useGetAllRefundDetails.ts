import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { MRT_SortingState, MRT_PaginationState } from 'material-react-table';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { useEffect, useState } from 'react';
import { AppGridGetDataAPIProps } from '../../../../types/globalTypes';

export interface Refund {
  _id: string;
  orderId: number;
  orderDate: Date;
  refundAmount: number;
  refundReason: string;
  merchantId: number;
  customerId: number;
  invoiceId: string;
  invoiceDate: Date;
  refundCaptureDate: Date;
  isSettled: boolean;
  __v: number;
}

interface GetRefundResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  refundOrders: Refund[];
}

function getFormattedDayFromDayjs(dateobj: dayjs.Dayjs) {
  // date in YYYY-MM-DD format
  return dayjs(dateobj, 'DD MMM YYYY hh:mm A').format(
    'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
  );
}

const ExtractedcolumnFiltersForParams = (columnFilters: ColumnFilter[]) => {
  let params: Record<string, any> = {};

  columnFilters?.forEach((columnFilter) => {
    if (Array.isArray(columnFilter.value)) {
      params[columnFilter.id] = columnFilter.value?.join(',');
    } else {
      params[columnFilter.id] = columnFilter.value;
    }
  });
  return params;
};
const formatSortForParams = (sorting: MRT_SortingState) => {
  let sort = '';
  const columnID = sorting?.[0]?.id;
  const sortDirection = sorting?.[0]?.desc;
  if (columnID === 'createdAt' && !sortDirection) {
    sort = 'ascDate';
  } else if (columnID === 'createdAt' && sortDirection) {
    sort = 'descDate';
  }
  if (sort) {
    return { sort };
  }
};
const formatDateForParams = (columnFilters: ColumnFilter[]) => {
  let startDate = '';
  let endDate = '';
  const getDateColumn = columnFilters?.find(
    (column) => column.id === 'createdAt'
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
function fetchRefundDetails(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<GetRefundResponse>> {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
  };
  return ApiHelpers.GET(ApiConstants.GET_REFUND_DETAILS(), {
    params: finalQueryParams,
  });
}

export const useGetAllRefundDetails = (props: AppGridGetDataAPIProps) => {
  const { columnFilters, EnableQuery, sorting, pagination } = props;
  const [appliedColumnFilters, setAppliedColumnFilters] = useState<
    ColumnFilter[]
  >([]);
  useEffect(() => {
    if (EnableQuery) {
      setAppliedColumnFilters(columnFilters);
    }
  }, [columnFilters, EnableQuery]);
  const queryKey = [
    'Refund-Grid-data',
    appliedColumnFilters,
    sorting,
    pagination,
  ];
  return useQuery({
    queryKey: queryKey,
    queryFn: () =>
      fetchRefundDetails(appliedColumnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
