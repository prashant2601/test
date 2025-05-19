import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import ApiConstants from '../../../../../api/ApiConstants';
import { handleAPIError } from '../../../../../utility/helperFuntions';
import ApiHelpers from '../../../../../api/ApiHelpers';
import { notifications } from '@mantine/notifications';

// Define types
export interface ExpenseType {
  expenseTypeId: number;
  expenseTypeName: string;
}

export interface GetExpenseTypeResponse {
  success: boolean;
  message: string;
  expenseType: ExpenseType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// GET API call
async function getExpenseTypes({
  pageNo = 1,
  limit = 10,
  query = '',
}: {
  pageNo?: number;
  limit?: number;
  query?: string;
}): Promise<GetExpenseTypeResponse> {
  const url = ApiConstants.GET_EXPENSE_TYPE({ pageNo, limit, query });
  const response = await ApiHelpers.GET(url);
  return response.data;
}

// GET Hook
export const useGetExpenseTypes = ({
  pageNo = 1,
  limit = 10,
  query = '',
  enabled,
}: {
  pageNo?: number;
  limit?: number;
  query?: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['Expense-Type-List', pageNo, limit, query],
    queryFn: () => getExpenseTypes({ pageNo, limit, query }),
    enabled: enabled,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

// Add API call
async function addExpenseType({
  expenseTypeName,
}: {
  expenseTypeName: string;
}) {
  const url = ApiConstants.ADD_EXPENSE_TYPE();
  return ApiHelpers.POST(url, { expenseTypeName });
}

// Add Hook
export const useAddExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { expenseTypeName: string }) =>
      addExpenseType(payload),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Type Added',
        message: data?.data?.message ?? 'Expense type added successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Type-List'] });
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

// Edit API call
async function editExpenseType({
  expenseTypeId,
  expenseTypeName,
}: {
  expenseTypeId: number;
  expenseTypeName: string;
}) {
  const url = ApiConstants.EDIT_EXPENSE_TYPE();
  return ApiHelpers.PUT(url, { expenseTypeId, expenseTypeName });
}

// Edit Hook
export const useEditExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { expenseTypeId: number; expenseTypeName: string }) =>
      editExpenseType(payload),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Type Updated',
        message: data?.data?.message ?? 'Expense type updated successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Type-List'] });
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

// Delete API call
async function deleteExpenseType(expenseTypeIds: number[]) {
  const idsParam = expenseTypeIds.join(',');
  const url = ApiConstants.DELETE_EXPENSE_TYPE(idsParam);
  return ApiHelpers.DELETE(url);
}

// Delete Hook
export const useDeleteExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseTypeIds: number[]) => deleteExpenseType(expenseTypeIds),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Type Deleted',
        message: data?.data?.message ?? 'Expense type deleted successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Type-List'] });
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
