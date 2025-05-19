import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useLocation } from 'react-router-dom';
import {
  DashboardComparisonRange,
  MerchantComparativeAnalysis,
  MerchantGraphDataFrequency,
  MerchantOrderSummaryOrderType,
} from '../../enums';
import ApiConstants from '../../api/ApiConstants';
import ApiHelpers from '../../api/ApiHelpers';

interface AxiosErrorResponse {
  message: string;
  success: boolean;
  errors: string[];
}

export interface TopOrderedItem {
  productName: string;
  totalQuantity: number;
  numberOfOrders: number;
}

export interface CustomerWithMaximumOrderCount {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalOrders: number;
  profileImg?: string;
  merchantId: number;
}
export interface CustomerWithMaximumOrderValue {
  customerId: string;
  customerName: string;
  orderCount: number;
  totalOrderValue: number;
  profileImg?: string;
  merchantId: 102;
}
interface MerchantTopOrderSummary {
  success: boolean;
  message: string;
  data: {
    topOrderedItems: TopOrderedItem[];
    customerWithMaximumOrderCount: CustomerWithMaximumOrderCount | null;
    customerWithMaximumOrderValue: CustomerWithMaximumOrderValue | null;
  };
}
function fetchMerchantTopOrderSummary(
  compareType: DashboardComparisonRange,
  merchantId: string
): Promise<AxiosResponse<MerchantTopOrderSummary, AxiosErrorResponse>> {
  return ApiHelpers.GET(
    `${ApiConstants.GET_MERCHANT_TOP_ORDER_SUMMARY(compareType, merchantId?.toString())}`
  );
}
function fetchOrderTopOrderSummary(
  compareType: DashboardComparisonRange
): Promise<AxiosResponse<MerchantTopOrderSummary, AxiosErrorResponse>> {
  return ApiHelpers.GET(`${ApiConstants.GET_ORDER_TOP_SUMMARY(compareType)}`);
}

export const useGetTopOrderSummary = (
  compareType: DashboardComparisonRange,
  merchantId?: string
) => {
  const location = useLocation();
  const isOrderDashboard = location.pathname.includes(
    '/partners-and-customers/dashboard'
  );

  return useQuery({
    queryKey: isOrderDashboard
      ? ['orderTopOrderSummary', compareType]
      : ['merchantTopOrderSummary', compareType, merchantId],
    queryFn: () =>
      isOrderDashboard
        ? fetchOrderTopOrderSummary(compareType)
        : fetchMerchantTopOrderSummary(compareType, merchantId!),
    enabled: !!compareType && (isOrderDashboard || !!merchantId),
    retry: 2,
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 mins
    refetchOnWindowFocus: false,
  });
};

interface ComparativeOrderAnalysisResponse {
  success: boolean;
  message: string;
  data: ComparativeOrderAnalysisData;
}

interface ComparativeOrderAnalysisData {
  periodInfo: PeriodInfo;
  metrics: Metric[];
}

interface PeriodInfo {
  current: DateRange;
  previous: DateRange;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface Metric {
  key: string;
  label: string;
  current: number;
  previous: number;
  percentageChange: number;
  trend: 'positive' | 'negative';
  type: 'count' | 'amount';
}

function fetchMerchantComparativeOrderAnalysis(
  compareType: MerchantComparativeAnalysis,
  merchantId: string
): Promise<
  AxiosResponse<ComparativeOrderAnalysisResponse, AxiosErrorResponse>
> {
  return ApiHelpers.GET(
    `${ApiConstants.GET_MERCHANT_COMPARATIVE_ORDER_ANALYSIS(compareType, merchantId.toString())}`
  );
}
function fetchOrderComparativeOrderAnalysis(
  compareType: MerchantComparativeAnalysis
): Promise<
  AxiosResponse<ComparativeOrderAnalysisResponse, AxiosErrorResponse>
> {
  return ApiHelpers.GET(
    `${ApiConstants.GET_ORDER_COMPARATIVE_ANALYSIS(compareType)}`
  );
}

export const useGetComparativeOrderAnalysis = (
  compareType: MerchantComparativeAnalysis,
  merchantId?: string
) => {
  const location = useLocation();
  const isOrderDashboard = location.pathname.includes(
    '/partners-and-customers/dashboard'
  );

  return useQuery({
    queryKey: isOrderDashboard
      ? ['orderComparativeOrderAnalysis', compareType]
      : ['merchantComparativeOrderAnalysis', compareType, merchantId],
    queryFn: () =>
      isOrderDashboard
        ? fetchOrderComparativeOrderAnalysis(compareType)
        : fetchMerchantComparativeOrderAnalysis(compareType, merchantId!),
    enabled: !!compareType && (isOrderDashboard || !!merchantId),
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

//////////////////////////////////////////////////////////////////

interface CommissionReportData {
  netCommission: {
    totalNetCommission: number;
    deliveryOrderCommission: number;
    collectionOrderCommission: number;
  };
  netServiceFeeCommission: {
    totalServiceFeeCommission: number;
    deliveryOrderServiceFeeCommission: number;
    collectionOrderServiceFeeCommission: number;
  };
  netDeliveryChargeCommission: {
    totalDeliveryChargeCommission: number;
    deliveryOrderDeliveryChargeCommission: number;
    collectionOrderDeliveryChargeCommission: number;
  };
  netVATCommission: {
    totalVATCommission: number;
    deliveryOrderVATCommission: number;
    collectionOrderVATCommission: number;
  };
  totalCommission: {
    totalOrderCommission: number;
    totalDeliveryOrderCommission: number;
    totalCollectionOrderCommission: number;
  };
}

interface MerchantCommissionReportResponse {
  success: boolean;
  message: string;
  data: CommissionReportData;
}
function fetchOrderCommissionReport(
  compareType: DashboardComparisonRange
): Promise<
  AxiosResponse<MerchantCommissionReportResponse, AxiosErrorResponse>
> {
  return ApiHelpers.GET(
    `${ApiConstants.GET_ORDER_COMMISSION_REPORT(compareType)}`
  );
}
function fetchMerchantOrderCommissionReport(
  compareType: DashboardComparisonRange,
  merchantId: string
): Promise<
  AxiosResponse<MerchantCommissionReportResponse, AxiosErrorResponse>
> {
  return ApiHelpers.GET(
    `${ApiConstants.GET_MERCHANT_ORDER_COMMISION_REPORT(compareType, merchantId?.toString())}`
  );
}

export const useGetOrderCommissionReport = (
  compareType: DashboardComparisonRange,
  merchantId?: string
) => {
  const location = useLocation();
  const isOrderDashboard = location.pathname.includes(
    '/partners-and-customers/dashboard'
  );
  return useQuery({
    queryKey: isOrderDashboard
      ? ['orderCommissionReport', compareType]
      : ['merchantOrderCommissionReport', compareType, merchantId],
    queryFn: () =>
      isOrderDashboard
        ? fetchOrderCommissionReport(compareType)
        : fetchMerchantOrderCommissionReport(compareType, merchantId!),
    enabled: !!compareType && (isOrderDashboard || !!merchantId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    select: (data) => data?.data,
  });
};
////////////////////////////////////////////////////////////////////////////////////////

interface GraphDataItem {
  xAxis: string;
  OrderValue: number;
  OrderCount: number;
  AverageValue: number;
}

interface SummaryData {
  totalCount: number;
  totalOrderValue: number;
  totalAverageValue: number;
}

interface GraphResponseData {
  graphData: GraphDataItem[];
  summary: SummaryData;
}

interface OrderSummaryChartData {
  success: boolean;
  message: string;
  data: GraphResponseData;
}

// Define API call function
async function fetchMerchantOrderSummaryChartData(
  frequency: 'daily' | 'weekly' | 'monthly',
  orderType: MerchantOrderSummaryOrderType,
  merchantId: string
): Promise<AxiosResponse<OrderSummaryChartData>> {
  return ApiHelpers.GET(
    ApiConstants.GET_MERCHANT_ORDER_SUMMARY_CHART_DATA(
      frequency,
      orderType,
      merchantId?.toString()
    )
  );
}
async function fetchOrderSummaryChartData(
  frequency: 'daily' | 'weekly' | 'monthly',
  orderType: MerchantOrderSummaryOrderType
): Promise<AxiosResponse<OrderSummaryChartData>> {
  return ApiHelpers.GET(
    ApiConstants.GET_ORDER_SUMMARY_CHART_DATA(frequency, orderType)
  );
}

// Create a custom hook
export const useOrderSummaryChartData = (
  frequency: MerchantGraphDataFrequency,
  orderType: MerchantOrderSummaryOrderType,
  merchantId?: string
) => {
  const location = useLocation();
  const isOrderDashboard = location.pathname.includes(
    '/partners-and-customers/dashboard'
  );

  return useQuery({
    queryKey: isOrderDashboard
      ? ['orderSummaryChartData', frequency, orderType]
      : ['merchantOrderSummaryChartData', frequency, orderType, merchantId],
    queryFn: () =>
      isOrderDashboard
        ? fetchOrderSummaryChartData(frequency, orderType)
        : fetchMerchantOrderSummaryChartData(frequency, orderType, merchantId!),
    enabled: !!frequency && !!orderType && (isOrderDashboard || !!merchantId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
