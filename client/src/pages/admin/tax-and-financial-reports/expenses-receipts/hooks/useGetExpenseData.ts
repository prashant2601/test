import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { ColumnFilter } from '@tanstack/table-core';
import { MRT_PaginationState, MRT_SortingState } from 'material-react-table';
import ApiHelpers from '../../../../../api/ApiHelpers';
import ApiConstants from '../../../../../api/ApiConstants';
import { AppGridGetDataAPIProps } from '../../../../../types/globalTypes';
import { formatDateForParamSingleColumnRange } from '../../../../../utility/helperFuntions';
interface ReceiptItem {
  category: string;
  itemName: string;
  selectedVAT: number;
  amount: number;
  vatAmount: number;
  total: number;
  _id: string;
}
export enum SpentByEnum {
  COMPANY = 'COMPANY',
  EMPLOYEE = 'EMPLOYEE',
}
export enum PaymentTypeEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  BOTH = 'BOTH',
}
export const CLAIMABLE_VAT_VALUES = [0, 5, 10, 20] as const;
export type ClaimableVAT = (typeof CLAIMABLE_VAT_VALUES)[number];
export interface Expense {
  receiptId: number;
  storeName: string;
  spentBy: SpentByEnum;
  expenseType: string;
  paidStatus: 'PAID' | 'UNPAID';
  totalAmount: number;
  claimableVAT: ClaimableVAT;
  receiptDate: string;
  receiptItems: ReceiptItem[];
  receiptLink: string[];
  updatedAt: string;
  createdAt: string;
  cardType?: string;
  paymentDetails: {
    paymentType: PaymentTypeEnum;
    cardType: string;
    paymentFrom: { CARD: number; CASH: number };
    paymentDate: string;
    isSameDayPayment?: string;
  }[];
}

interface GetExpenseDataResponse {
  expense: Expense[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  totalAmount: number;
  totalClaimableVAT: number;
  success: boolean;
}

const allowedExpenseParamsInBackend = [
  'receiptId',
  'storeName',
  'spentBy',
  'expenseType',
  'paidStatus',
  'startDate',
  'endDate',
  'pageNo',
  'limit',
  'paymentType',
] as const;

type AllowedExpenseParams = (typeof allowedExpenseParamsInBackend)[number];

type ExpenseParams = {
  [key in AllowedExpenseParams]?: any;
};

const extractColumnFiltersForExpenseParams = (
  columnFilters: ColumnFilter[]
) => {
  let params: ExpenseParams = {};

  columnFilters?.forEach((columnFilter) => {
    if (
      allowedExpenseParamsInBackend.includes(
        columnFilter.id as AllowedExpenseParams
      )
    ) {
      if (Array.isArray(columnFilter.value)) {
        params[columnFilter.id as AllowedExpenseParams] =
          columnFilter.value.join(',');
      } else {
        params[columnFilter.id as AllowedExpenseParams] = columnFilter.value;
      }
    }
  });

  return params;
};

const formatExpenseSortForParams = (sorting: MRT_SortingState) => {
  if (!sorting?.length) return;

  const isDescending = sorting[0].desc;
  if (isDescending !== undefined) {
    return { sort: isDescending ? 'desc' : 'asc' };
  }
};

function fetchExpenseData(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<GetExpenseDataResponse>> {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatExpenseSortForParams(sorting),
    ...extractColumnFiltersForExpenseParams(columnFilters),
    ...formatDateForParamSingleColumnRange(columnFilters, 'receiptDate'),
  };

  return ApiHelpers.GET(ApiConstants.GET_EXPENSE_DATA(), {
    params: finalQueryParams,
  });
}

export const useGetExpenseData = (props: AppGridGetDataAPIProps) => {
  const { columnFilters, EnableQuery, sorting, pagination } = props;
  const queryKey = ['Expense-Grid-data', columnFilters, sorting, pagination];

  return useQuery({
    queryKey,
    queryFn: () => fetchExpenseData(columnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    enabled: EnableQuery,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
