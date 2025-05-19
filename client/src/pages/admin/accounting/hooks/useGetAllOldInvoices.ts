import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { useEffect, useState } from 'react';
import { MRT_SortingState, MRT_PaginationState } from 'material-react-table';
import dayjs from 'dayjs';
import { AppGridGetDataAPIProps } from '../../../../types/globalTypes';

interface OrderCalculation {
  totalOrderValue: number;
  totalOrders: number;
  commissionRate: number;
  amount: number;
  isCashOrders?: boolean;
}
interface MISCELLANEOUS {
  amount: number;
  text: string;
  isVatApplicable: boolean;
}
interface CalculationsByOrderType {
  DELIVERY?: OrderCalculation;
  COLLECTION?: OrderCalculation;
  DELIVERY_CHARGE: OrderCalculation;
  SERVICE_FEE: OrderCalculation;
  DRIVER_TIP: OrderCalculation;
  MISCELLANEOUS?: MISCELLANEOUS[];
}
interface ValidItem {
  _id: string;
  merchantId: number;
  itemName: string;
  totalAmount: number;
  totalQuantity: number;
  balanceAmount: number;
  deductableAmount: number;
  isWaivedOff: boolean;
  issueDate: string;
  itemId: number;
  transactions: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  tax: number;
}
export interface OldInvoice {
  _id: string;
  merchantId: number;
  merchantName: string;
  fromDate: string;
  toDate: string;
  downloadLink: string;
  createdAt: string;
  status: string;
  invoiceId: string;
  updatedAt: string;
  downloadHistory: string[];
  viewHistory: string[];
  isEditable: boolean;
  isPaidDisable?: boolean;
  __v: number;
}

interface GetAllInvoicesResponse {
  invoices: OldInvoice[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  totalToBePaid: number;
}

const ExtractedcolumnFiltersForParams = (columnFilters: ColumnFilter[]) => {
  let params: Record<string, any> = {};
  const avoidDateFilters = ['fromDate', 'toDate', 'createdAt'];
  columnFilters
    ?.filter((column) => !avoidDateFilters?.includes(column.id))
    ?.forEach((columnFilter) => {
      if (Array.isArray(columnFilter.value)) {
        params[columnFilter.id] = columnFilter.value?.join(',');
      } else if (columnFilter.id === 'merchantId') {
        params['merchantIds'] = columnFilter.value;
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
): Promise<AxiosResponse<GetAllInvoicesResponse>> {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
    isOlderInvoice: true,
  };
  return ApiHelpers.GET(ApiConstants.GET_ALL_INVOICES_DETAILS(), {
    params: finalQueryParams,
  });
}

export const useGetAllOldInvoices = (props: AppGridGetDataAPIProps) => {
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
    'OlderInvoiceGrid',
    appliedColumnFilters,
    sorting,
    pagination,
  ];

  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchInvoices(appliedColumnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
