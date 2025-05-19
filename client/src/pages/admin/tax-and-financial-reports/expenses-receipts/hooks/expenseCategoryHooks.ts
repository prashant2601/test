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
export interface ExpenseCategory {
  categoryId: number;
  categoryName: string;
}

export interface GetExpenseCategoryResponse {
  success: boolean;
  message: string;
  category: ExpenseCategory[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// GET API call
async function getExpenseCategory({
  pageNo = 1,
  limit = 10,
  query = '',
}: {
  pageNo?: number;
  limit?: number;
  query?: string;
}): Promise<GetExpenseCategoryResponse> {
  const url = ApiConstants.GET_EXPENSE_CATEGORY({ pageNo, limit, query });
  const response = await ApiHelpers.GET(url);
  return response.data;
}
// GET Hook
export const useGetExpenseCategory = ({
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
    queryKey: ['Expense-Category-List', pageNo, limit, query],
    queryFn: () => getExpenseCategory({ pageNo, limit, query }),
    enabled: enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  });
};

// Add API call
async function addExpenseCategory(categoryName: string) {
  const url = ApiConstants.ADD_EXPENSE_CATEGORY();
  return ApiHelpers.POST(url, { categoryName });
}

// Add Hook
export const useAddExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: ExpenseCategory) =>
      addExpenseCategory(category.categoryName),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Category Added',
        message: data?.data?.message ?? 'Category added successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Category-List'] });
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

// EDIT call
async function editExpenseCategory({
  categoryId,
  categoryName,
}: {
  categoryId: number;
  categoryName: string;
}) {
  const url = ApiConstants.EDIT_EXPENSE_CATEGORY();
  return ApiHelpers.PUT(url, { categoryId, categoryName });
}

// EDIT Hook
export const useEditExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { categoryId: number; categoryName: string }) =>
      editExpenseCategory(payload),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Category Updated',
        message: data?.data?.message ?? 'Category updated successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Category-List'] });
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

// Delete call
async function deleteExpenseCategory(categoryIds: number[]) {
  const idsParam = categoryIds.join(',');
  const url = ApiConstants.DELETE_EXPENSE_CATEGORY(idsParam);
  return ApiHelpers.DELETE(url);
}

// Delete Hook
export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: number[]) => deleteExpenseCategory(categoryIds),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Category Deleted',
        message: data?.data?.message ?? 'Category deleted successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Category-List'] });
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
