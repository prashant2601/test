import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { MRT_SortingState, MRT_PaginationState } from 'material-react-table';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { useEffect, useState } from 'react';
import { AppGridGetDataAPIProps } from '../../../../types/globalTypes';
export interface MerchantAddress {
  line1: string;
  line2: string;
  area: string;
  city: string;
  post: string;
  country: string;
}
export interface Merchant {
  _id: string;
  merchantId: number;
  merchantName: string;
  merchantEmail: string;
  merchantMobile: string;
  merchantAddress: MerchantAddress;
  serviceFeeApplicable: boolean;
  deliveryChargeApplicable: boolean;
  driverTipApplicable: boolean;
  deliveryOrdersComission: number;
  collectionOrdersComission: number;
  eatInComission: number;
  logoImg: string;
  registrationDate: string;
  registrationMethod: string;
  zone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  totalOrders: number;
  taxRate: number;
  isActive: boolean;
  rating: number;
  isInHouseType: boolean;
  isEmailApplicable: boolean;
  merchantManagementInfo: {
    ownerName: string;
    ownerPhone: string; // Should match /^[0-9]{1,15}$/
    ownerEmail: string;
    managerName: string;
    managerPhone: string; // Should match /^[0-9]{1,15}$/
    managerEmail: string;
  };
}

export interface GetAllMerchantDetailsResponse {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  merchant: Merchant[];
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
  if (columnID === 'merchantName' && !sortDirection) {
    sort = 'ascName';
  } else if (columnID === 'merchantName' && sortDirection) {
    sort = 'descName';
  } else if (columnID === 'registrationDate' && !sortDirection) {
    sort = 'ascRegistrationDate';
  } else if (columnID === 'registrationDate' && sortDirection) {
    sort = 'descRegistrationDate';
  }
  if (sort) {
    return { sort };
  }
};
const formatDateForParams = (columnFilters: ColumnFilter[]) => {
  let startDate = '';
  let endDate = '';
  const getDateColumn = columnFilters?.find(
    (column) => column.id === 'registrationDate'
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
function fetchMerchants(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<GetAllMerchantDetailsResponse>> {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
  };
  return ApiHelpers.GET(ApiConstants.GET_MERCHANT_DETAILS(), {
    params: finalQueryParams,
  });
}

export const useGetAllMerchantsDetails = (props: AppGridGetDataAPIProps) => {
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
    'Merchants-Grid-data',
    appliedColumnFilters,
    sorting,
    pagination,
  ];
  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchMerchants(appliedColumnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    // enabled: EnableQuery,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
