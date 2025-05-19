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
export interface StoreAddress {
  line1: string;
  line2: string;
  area: string;
  city: string;
  post: any;
  country: string;
}

export interface ExpenseStore {
  storeId: number;
  storeName: string;
  storeAddress: StoreAddress;
  storeProfileImg: string;
}

export interface GetExpenseStoreResponse {
  success: boolean;
  message: string;
  expenseStore: ExpenseStore[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// GET API call
async function getExpenseStore({
  pageNo = 1,
  limit = 10,
  query = '',
}: {
  pageNo?: number;
  limit?: number;
  query?: string;
}): Promise<GetExpenseStoreResponse> {
  const url = ApiConstants.GET_EXPENSE_STORE({ pageNo, limit, query });
  const response = await ApiHelpers.GET(url);
  return response.data;
}

// GET Hook
export const useGetExpenseStore = ({
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
    queryKey: ['Expense-Store-List', pageNo, limit, query],
    queryFn: () => getExpenseStore({ pageNo, limit, query }),
    enabled: enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Add API call
async function addExpenseStore({
  storeName,
  storeAddress,
  storeProfileImg,
}: {
  storeName: string;
  storeAddress: string;
  storeProfileImg?: string;
}) {
  const url = ApiConstants.ADD_EXPENSE_STORE();
  return ApiHelpers.POST(url, { storeName, storeAddress, storeProfileImg });
}

// Add Hook
export const useAddExpenseStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      storeName: string;
      storeAddress: string;
      storeProfileImg?: string;
    }) => addExpenseStore(payload),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Store Added',
        message: data?.data?.message ?? 'Store added successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Store-List'] });
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
async function editExpenseStore({
  storeId,
  storeName,
  storeAddress,
  storeProfileImg,
}: {
  storeId: number;
  storeName: string;
  storeAddress: StoreAddress;
  storeProfileImg?: string;
}) {
  const url = ApiConstants.EDIT_EXPENSE_STORE();
  return ApiHelpers.PUT(url, {
    storeId,
    storeName,
    storeAddress,
  });
}

// Edit Hook
export const useEditExpenseStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      storeId: number;
      storeName: string;
      storeAddress: StoreAddress;
      storeProfileImg?: string;
    }) => editExpenseStore(payload),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Store Updated',
        message: data?.data?.message ?? 'Store updated successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Store-List'] });
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
async function deleteExpenseStore(storeIds: number[]) {
  const idsParam = storeIds.join(',');
  const url = ApiConstants.DELETE_EXPENSE_STORE(idsParam);
  return ApiHelpers.DELETE(url);
}

// Delete Hook
export const useDeleteExpenseStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeIds: number[]) => deleteExpenseStore(storeIds),
    onSuccess: (data) => {
      notifications.show({
        title: 'Expense Store Deleted',
        message: data?.data?.message ?? 'Store deleted successfully',
        color: 'green',
        autoClose: 2000,
        position: 'top-center',
      });
      queryClient.invalidateQueries({ queryKey: ['Expense-Store-List'] });
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
