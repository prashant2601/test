// src/hooks/useGetAllUsersDetails.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';

import { useEffect, useState } from 'react';
import ApiHelpers from '../../../../api/ApiHelpers';
import ApiConstants from '../../../../api/ApiConstants';
import { AccountRolesTypes } from '../constants';

export interface BankAccountInBankGrid {
  accId: number;
  accountAddedOn: Date;
  accountHolderName: string;
  bankName: string;
  accountNumber: number;
  sortCode: number;
  accountHolderId: number;
  accountRole: AccountRolesTypes;
  merchantId?: number;
  merchantName?: string;
}

interface GetAllBankAccountsResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  bankAccounts: BankAccountInBankGrid[];
}

const formatSortForParams = (sorting: any) => {
  let sortParam = '';
  const columnID = sorting?.[0]?.id;
  const sortDirection = sorting?.[0]?.desc;

  return sortParam ? { sort: sortParam } : {};
};

const formatFiltersForParams = (columnFilters: ColumnFilter[]) => {
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

const fetchUsers = (
  columnFilters: ColumnFilter[],
  sorting: any,
  pagination: any
): Promise<AxiosResponse<GetAllBankAccountsResponse>> => {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...formatFiltersForParams(columnFilters),
  };

  return ApiHelpers.GET(ApiConstants.GET_ALL_BANK_ACCOUNTS(), {
    params: finalQueryParams,
  });
};

interface GetAllBankAccountsProps {
  columnFilters: ColumnFilter[];
  EnableQuery: boolean;
  sorting: any;
  pagination: any;
}

export const useGetAllBankAccounts = ({
  columnFilters,
  EnableQuery,
  sorting,
  pagination,
}: GetAllBankAccountsProps) => {
  const [appliedColumnFilters, setAppliedColumnFilters] = useState<
    ColumnFilter[]
  >([]);

  useEffect(() => {
    if (EnableQuery) {
      setAppliedColumnFilters(columnFilters);
    }
  }, [columnFilters, EnableQuery]);

  const queryKey = [
    'BankAccounts-Grid-data',
    appliedColumnFilters,
    sorting,
    pagination,
  ];

  return useQuery({
    queryKey,
    queryFn: () => fetchUsers(appliedColumnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
