import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import ApiHelpers from '../../../../../api/ApiHelpers';
import { ColumnFilter } from '@tanstack/table-core';
import {
  AllUserRoleTypesExcludingSuperAdmin,
  UserRoleTypes,
  UserStatusTypes,
} from '../constants';

export interface User {
  userId: number;
  email: string;
  role: UserRoleTypes;
  status: UserStatusTypes;
  firstName: string;
  lastName: string;
  merchantIds: string[];
  userName?: string;
  activatedOn?: string;
  lastActive?: string;
  lastLogin?: string;
  profileImg?: string;
}

export interface MerchantUser extends User {
  merchantIds: string[];
}
export interface AdminUser extends User {
  adminIds: string[];
}

export interface StaffUser extends User {
  department?: string;
}

export interface SupportUser extends User {
  ticketCount?: number;
}

export interface AffiliateUser extends User {
  referralCode: string;
}

export interface DriverUser extends User {
  licenseNumber: string;
  vehicleType: string;
}

export type UserRoleMapResponses = {
  merchant: MerchantUser;
  admin: User;
  staff: StaffUser;
  support: SupportUser;
  affiliate: AffiliateUser;
  driver: DriverUser;
};

export type UserRoleMapResponsesData = {
  merchant: MerchantUser[];
  admin: User[];
  staff: StaffUser[];
  support: SupportUser[];
  affiliate: AffiliateUser[];
  driver: DriverUser[];
};

const getUserApiEndpoint = (
  role: AllUserRoleTypesExcludingSuperAdmin
): string => {
  const endpoints: Record<AllUserRoleTypesExcludingSuperAdmin, string> = {
    admin: 'api/auth/getAllAdminUsers',
    merchant: 'api/auth/getAllMerchantUsers',
    staff: 'api/auth/getAllStaffUsers',
    support: 'api/auth/getAllSupportUsers',
    affiliate: 'api/auth/getAllAffiliateUsers',
    driver: 'api/auth/getAllDriverUsers',
  };

  return endpoints[role];
};

const formatSortForParams = (sorting: any) => {
  if (!sorting?.length) return {};
  return {
    sort: sorting[0].desc ? `desc${sorting[0].id}` : `asc${sorting[0].id}`,
  };
};

const formatFiltersForParams = (columnFilters: ColumnFilter[]) => {
  let params: Record<string, any> = {};
  columnFilters?.forEach((filter) => {
    params[filter.id] = Array.isArray(filter.value)
      ? filter.value.join(',')
      : filter.value;
  });
  return params;
};

const fetchUsers = <T extends AllUserRoleTypesExcludingSuperAdmin>(
  role: T,
  columnFilters: ColumnFilter[],
  sorting: any,
  pagination: any
): Promise<
  AxiosResponse<{ users: UserRoleMapResponsesData[T]; totalCount: number }>
> => {
  const finalQueryParams = {
    pageNo: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...formatSortForParams(sorting),
    ...formatFiltersForParams(columnFilters),
  };

  return ApiHelpers.GET(getUserApiEndpoint(role), { params: finalQueryParams });
};

interface UseGetUsersProps<T extends AllUserRoleTypesExcludingSuperAdmin> {
  role: T;
  columnFilters: ColumnFilter[];
  enableQuery: boolean;
  sorting: any;
  pagination: any;
}

export const useGetUsersByRole = <
  T extends AllUserRoleTypesExcludingSuperAdmin,
>({
  role,
  columnFilters,
  enableQuery,
  sorting,
  pagination,
}: UseGetUsersProps<T>) => {
  const [appliedFilters, setAppliedFilters] = useState<ColumnFilter[]>([]);
  useEffect(() => {
    if (enableQuery) setAppliedFilters(columnFilters);
  }, [columnFilters, enableQuery]);

  return useQuery({
    queryKey: [`Users-Grid-${role}-data`, appliedFilters, sorting, pagination],
    queryFn: () => fetchUsers(role, appliedFilters, sorting, pagination),
    enabled: enableQuery,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
