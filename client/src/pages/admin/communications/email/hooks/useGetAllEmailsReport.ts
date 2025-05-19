import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { MRT_SortingState, MRT_PaginationState } from 'material-react-table';
import ApiConstants from '../../../../../api/ApiConstants';
import ApiHelpers from '../../../../../api/ApiHelpers';
import { useEffect, useState } from 'react';
import { AppGridGetDataAPIProps } from '../../../../../types/globalTypes';

export interface Email {
  _id: string;
  receiverId: number;
  receiverName: string;
  emailId: string;
  emailType: 'orderFeedback' | 'invoice';
  orderId: number | undefined;
  status: 'processing' | 'sent' | 'failed';
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  sendBy: 'admin' | 'superAdmin';
  sendTo: 'customer' | 'merchant';
  __v: number;
}

interface GetEmailLogsResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  logs: Email[];
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
function fetchEmailLogs(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<GetEmailLogsResponse>> {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
  };
  return ApiHelpers.GET(ApiConstants.GET_EMAIL_REPORT(), {
    params: finalQueryParams,
  });
}

export const useGetAllEmailsReport = (props: AppGridGetDataAPIProps) => {
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
    'Email-Logs-Grid-data',
    appliedColumnFilters,
    sorting,
    pagination,
  ];
  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchEmailLogs(appliedColumnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
