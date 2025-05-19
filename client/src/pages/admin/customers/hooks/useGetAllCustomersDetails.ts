import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ColumnFilter } from '@tanstack/table-core';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { MRT_SortingState, MRT_PaginationState } from 'material-react-table';
import ApiConstants from '../../../../api/ApiConstants';
import ApiHelpers from '../../../../api/ApiHelpers';
import { AppGridGetDataAPIProps } from '../../../../types/globalTypes';
interface CustomerAddress {
  line1: string;
  line2: string;
  area: string;
  city: string;
  post: string;
  country: string;
}
export interface CustomerWithoutProfilePic {
  _id: string;
  customerId: number;
  merchantId: number;
  registrationDate: string;
  zone: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: CustomerAddress;
  customerDOB: string;
  totalOrders: number;
  branchId: number;
}
export interface Customer extends CustomerWithoutProfilePic {
  profileImg: string;
}

interface GetAllCustomerDetailsResponse {
  currentPage: 1;
  totalPages: 1;
  totalCount: 4;
  customer: Customer[];
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
  if (columnID === 'customerFirstName' && !sortDirection) {
    sort = 'ascFirstName';
  } else if (columnID === 'customerFirstName' && sortDirection) {
    sort = 'descFirstName';
  } else if (columnID === 'customerLastName' && !sortDirection) {
    sort = 'ascLastName';
  } else if (columnID === 'customerLastName' && sortDirection) {
    sort = 'descLastName';
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
function fetchCustomers(
  columnFilters: ColumnFilter[],
  sorting: MRT_SortingState,
  pagination: MRT_PaginationState
): Promise<AxiosResponse<GetAllCustomerDetailsResponse>> {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...ExtractedcolumnFiltersForParams(columnFilters),
    ...formatDateForParams(columnFilters),
  };
  return ApiHelpers.GET(ApiConstants.GET_CUSTOMER_DETAILS(), {
    params: finalQueryParams,
  });
}

export const useGetAllCustomersDetails = (props: AppGridGetDataAPIProps) => {
  const { columnFilters, EnableQuery, sorting, pagination } = props;
  const queryKey = ['Customers-Grid-data', columnFilters, sorting, pagination];
  return useQuery({
    queryKey: queryKey,
    queryFn: () => fetchCustomers(columnFilters, sorting, pagination),
    placeholderData: keepPreviousData,
    enabled: EnableQuery,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
