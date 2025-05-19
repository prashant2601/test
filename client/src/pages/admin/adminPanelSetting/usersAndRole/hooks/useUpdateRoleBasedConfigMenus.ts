import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { notifications } from '@mantine/notifications';
import ApiConstants from '../../../../../api/ApiConstants';
import ApiHelpers from '../../../../../api/ApiHelpers';
import { handleAPIError } from '../../../../../utility/helperFuntions';
import { UserRoleTypes } from '../constants';

interface EditConfigMenusSuccessResponse {
  success: true;
  message: string;
  menu: {
    role: string;
    menus: Record<string, any>[]; // Adjust based on actual menu structure
  };
}

interface ConfigMenuUpdates {
  role: UserRoleTypes;
  menus: Record<string, any>[]; // Adjust based on actual menu structure
}

async function editConfigMenus({
  role,
  menus,
}: ConfigMenuUpdates): Promise<AxiosResponse<EditConfigMenusSuccessResponse>> {
  const url = ApiConstants.EDIT_ROLE_BASED_CONFIG_MENUS();
  return ApiHelpers.PUT(url, { role, menus });
}

export const useUpdateRoleBasedConfigMenus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ role, menus }: ConfigMenuUpdates) =>
      editConfigMenus({ role, menus }),
    onSuccess: (data) => {
      notifications.show({
        title: `Success`,
        message: 'Role-based menu configuration updated successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });

      queryClient.invalidateQueries({
        queryKey: ['roleBasedMenus', data?.data?.menu?.role],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        handleAPIError(error);
      } else {
        console.error('Non-Axios error:', error);
      }
    },
  });
};
