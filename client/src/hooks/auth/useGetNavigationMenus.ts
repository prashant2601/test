import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import ApiConstants from '../../api/ApiConstants';
import ApiHelpers from '../../api/ApiHelpers';
import { UserRoleTypes } from '../../pages/admin/adminPanelSetting/usersAndRole/constants';
import { readLocalStorageValue } from '@mantine/hooks';

export interface MenuItem {
  label: string;
  isActive?: boolean;
  submenu?: MenuItem[];
}

export interface NavigationMenuResponse {
  message: string;
  success: boolean;
  menu: MenuItem[];
}

interface AxiosErrorResponse {
  message: string;
  success: boolean;
  errors?: string[];
}

const fetchNavigationMenus = (
  role: UserRoleTypes | undefined,
  appToken: string
): Promise<AxiosResponse<NavigationMenuResponse, AxiosErrorResponse>> => {
  if (appToken && role) {
    return ApiHelpers.GET(ApiConstants.GET_NAVIGATION_MENUS(role));
  } else throw Error('Token Unavailable');
};

export const useGetNavigationMenus = (role: UserRoleTypes | undefined) => {
  const appToken = readLocalStorageValue({ key: 'appToken' });

  return useQuery({
    queryKey: ['navigationMenus', role],
    queryFn: () => fetchNavigationMenus(role, appToken as string),
    refetchOnWindowFocus: false,
    enabled: !!role,
    retry: 1,
    select: (data) => data?.data?.menu,
  });
};
