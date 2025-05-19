import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { MRT_SortingState, MRT_PaginationState } from 'material-react-table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { AppGridGetDataAPIProps } from '../../../../types/globalTypes';

interface InvoiceItem {
  text: string;
  amount: string;
}

interface InvoiceTransaction {
  date: string;
  description: string;
  amount: string;
}

interface InvoiceParameters {
  firstPageData: InvoiceItem[];
  secondPageData: InvoiceItem[];
  thirdPageData: InvoiceTransaction[];
  totalSubTotal: number;
  tax_amount: number;
  totalWithTax: number;
  closingBalance: number;
  currentInvoiceCount: number;
  openingBalance: number;
  invoiceDate: string;
  fileName: string;
  customerAddress: {
    name: string;
    line1: string;
    line2: string;
    area: string;
    post: string;
    country: string;
    city: string;
    email: string;
    customerId: string;
  };
}

export interface ManualInvoiceRow {
  _id: string;
  merchantId: number;
  merchantName: string;
  fromDate: string;
  toDate: string;
  downloadLink: string;
  createdAt: string;
  invoiceParameters: InvoiceParameters;
  status: 'PAID' | 'UNPAID';
  invoiceId: string;
  isSentToMerchant: boolean;
  viewHistory: any[];
  isEditable: boolean;
  isPaidDisable?: boolean;
  isManualCreate: boolean;
  updatedAt: string;
  __v: number;
}

export interface ManualInvoiceResponse {
  invoices: ManualInvoiceRow[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  totalToBePaid: number;
  totalAmountDue: number;
  totalVAT: number;
}

const ExtractedcolumnFiltersForParams = (columnFilters: ColumnFilter[]) => {
  let params: Record<string, any> = {};
  const avoidDateFilters = ['fromDate', 'toDate', 'createdAt'];
  columnFilters
    ?.filter((column) => !avoidDateFilters?.includes(column.id))
    ?.forEach((columnFilter) => {
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
    sort = 'asc';
  } else if (columnID === 'createdAt' && sortDirection) {
    sort = 'desc';
  }
  if (sort) {
    return { sort };
  }
};
function getFormattedDayFromDayjs(dateobj: dayjs.Dayjs) {
  return dayjs(dateobj, 'DD MMM YYYY').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}
const formatDateForParams = (columnFilters: ColumnFilter[]) => {
  let startDate = '';
  let endDate = '';
  const getStartDateColumn = columnFilters?.find(
    (column) => column.id === 'fromDate'
  );
  const getEndDateColumn = columnFilters?.find(
    (column) => column.id === 'toDate'
  );
  if (getStartDateColumn) {
    startDate = getStartDateColumn?.value
      ? getFormattedDayFromDayjs(getStartDateColumn?.value)
      : '';
  }
  if (getEndDateColumn) {
    endDate = getEndDateColumn?.value
      ? getFormattedDayFromDayjs(getEndDateColumn?.value)
      : '';
  }
  if (getStartDateColumn && endDate) {
    return { startDate, endDate };
  } else if (getEndDateColumn) {
    return { endDate };
  } else if (getStartDateColumn) {
    return { startDate };
  }
};
function fetchInvoices(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<ManualInvoiceResponse>> {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
    isManualCreate: true,
  };
  return ApiHelpers.GET(ApiConstants.GET_ALL_INVOICES_DETAILS(), {
    params: finalQueryParams,
  });
}

export const useGetAllManualInvoices = (props: AppGridGetDataAPIProps) => {
  const { columnFilters, EnableQuery, sorting, pagination } = props;
  const [appliedColumnFilters, setAppliedColumnFilters] = useState<
    ColumnFilter[]
  >([]);
  const queryKey = [
    'All_Manual_Invoices-Grid-data',
    appliedColumnFilters,
    EnableQuery,
    sorting,
    pagination,
  ];

  useEffect(() => {
    if (EnableQuery) {
      setAppliedColumnFilters(columnFilters);
    }
  }, [columnFilters, EnableQuery]);
  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchInvoices(appliedColumnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
