import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { UserRoleTypes } from '../constants';
import ApiHelpers from '../../../../../api/ApiHelpers';
import ApiConstants from '../../../../../api/ApiConstants';

export interface MenuItem {
  label: string;
  isActive?: boolean;
  submenu?: MenuItem[];
}
export interface APIResponseMenuKeyTypes {
  _id: string;
  role: UserRoleTypes;
  menus: MenuItem[];
}
export interface RoleBasedMenuResponse {
  message: string;
  success: boolean;
  menu: APIResponseMenuKeyTypes;
}

interface AxiosErrorResponse {
  message: string;
  success: boolean;
  errors?: string[];
}

const fetchRoleBasedMenus = (
  role: Omit<UserRoleTypes, 'superAdmin'> | null
): Promise<AxiosResponse<RoleBasedMenuResponse, AxiosErrorResponse>> => {
  if (role) {
    return ApiHelpers.GET(ApiConstants.GET_ROLE_BASED_CONFIG_MENUS(role));
  } else {
    throw new Error('Role or Token Unavailable');
  }
};

export const useGetRoleBasedConfigMenus = (
  role: Omit<UserRoleTypes, 'superAdmin'> | null
) => {
  return useQuery({
    queryKey: ['roleBasedMenus', role],
    queryFn: () => fetchRoleBasedMenus(role),
    refetchOnWindowFocus: false,
    enabled: !!role,
    retry: 1,
    select: (data) => data?.data?.menu,
  });
};
