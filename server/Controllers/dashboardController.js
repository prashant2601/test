const OrderModal = require('../Models/order');
const RefundModal = require('../Models/refunds');
const MerchantModal = require('../Models/merchant');
const CustomerModal = require('../Models/customer');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

exports.GetOrderHistorySummary = async (req, res) => {
    try {
        const { compareType, merchantId } = req.query;
        // compareType = 'last7Days', 'last30Days', 'last24Hours', 'allTime'

        let startDate, endDate;
        switch (compareType) {
            case 'last7Days':
                startDate = moment.tz(timeZone).subtract(7, 'days').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'last30Days':
                startDate = moment.tz(timeZone).subtract(30, 'days').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'last24Hours':
                startDate = moment.tz(timeZone).subtract(24, 'hours').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'allTime':
                startDate = null;
                endDate = null;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid compare type. Use 'last7Days', 'last30Days', 'last24Hours', or 'allTime'"
                });
        }

        let orderQueryFilter = {
            merchantId: {
                $exists: true,
                $ne: null,
                $nin: [undefined, 0, '0']
            }
        };
        let refundQueryFilter = {
            merchantId: {
                $exists: true,
                $ne: null,
                $nin: [undefined, 0, '0']
            }
        };

        if (startDate && endDate) {
            orderQueryFilter.orderDate = { $gte: startDate.toDate(), $lte: endDate.toDate() };
            refundQueryFilter.refundCaptureDate = { $gte: startDate.toDate(), $lte: endDate.toDate() };
        }

        // In GetOrderHistorySummary
        let parsedMerchantId = [];
        if (merchantId) {
            parsedMerchantId = [merchantId, Number(merchantId)];
            orderQueryFilter.merchantId = { $in: parsedMerchantId };
            refundQueryFilter.merchantId = { $in: parsedMerchantId };
        }

        // Fetch orders, refunds, and merchant info concurrently
        const [orders, refunds, merchant] = await Promise.all([
            OrderModal.find(orderQueryFilter).lean()
                .select('subTotal orderDiscount serviceFee deliveryCharge driverTip status merchantId orderType paymentType orderDate orderId branchName newOrderValue promoDiscountMerchant promoDiscountSwishr _id'), ,
            RefundModal.find(refundQueryFilter),
            merchantId ? MerchantModal.findOne({ merchantId: { $in: parsedMerchantId } }) : null
        ]);

        const filteredOrders = orders.filter(order => order.status?.toUpperCase() !== 'CANCELLED' && order.status?.toUpperCase !== 'REJECTED' && order.status?.toUpperCase() !== 'FAILED')

        const totalOrderValues = filteredOrders.reduce((acc, order) => (acc + (order?.newOrderValue || 0)), 0);

        // Update the rest of your statistics calculations
        const cancelledOrders = orders.filter(order => order.status === 'CANCELLED');
        const rejectedOrders = orders.filter(order => order.status === 'REJECTED');

        // Update cancelled orders calculation
        const cancelledOrderStats = {
            count: cancelledOrders.length,
            totalValue: cancelledOrders.reduce((acc, order) => acc + (order?.newOrderValue || 0), 0)
        };

        // Update rejected orders calculation
        const rejectedOrderStats = {
            count: rejectedOrders.length,
            totalValue: rejectedOrders.reduce((acc, order) => acc + (order?.newOrderValue || 0), 0)
        };

        // Update order type and payment type summaries
        const orderTypeSummary = {};
        const paymentTypeSummary = {};

        for (const order of filteredOrders) {
            const orderValue = order?.newOrderValue || 0;

            // Standardize order type and payment type to uppercase
            const standardOrderType = (order.orderType || '').toUpperCase();
            const standardPaymentType = (order.paymentType || '').toUpperCase();

            // Order Type Summary
            if (!orderTypeSummary[standardOrderType]) {
                orderTypeSummary[standardOrderType] = { count: 0, totalValue: 0 };
            }
            orderTypeSummary[standardOrderType].count += 1;
            orderTypeSummary[standardOrderType].totalValue += orderValue;

            // Payment Type Summary
            if (!paymentTypeSummary[standardPaymentType]) {
                paymentTypeSummary[standardPaymentType] = { count: 0, totalValue: 0 };
            }
            paymentTypeSummary[standardPaymentType].count += 1;
            paymentTypeSummary[standardPaymentType].totalValue += orderValue;
        }

        const latestOrder = filteredOrders.sort((a, b) => b.orderDate - a.orderDate)[0];

        // Calculate refund statistics
        let totalRefunds = 0, totalRefundAmount = 0;
        let totalSettledRefunds = 0, totalSettledRefundAmount = 0;
        let totalUnsettledRefunds = 0, totalUnsettledRefundsAmount = 0;

        if (refunds && refunds.length) {
            refunds.forEach(refund => {
                totalRefunds++;
                totalRefundAmount += refund.refundAmount;

                if (refund.isSettled) {
                    totalSettledRefunds++;
                    totalSettledRefundAmount += refund.refundAmount;
                } else {
                    totalUnsettledRefunds++;
                    totalUnsettledRefundsAmount += refund.refundAmount;
                }
            });
        }

        // Send response
        res.status(200).json({
            success: true,
            message: "Order history summary fetched successfully",
            data: {
                orders: {
                    totalOrders: {
                        count: filteredOrders.length,
                        totalValue: Number(totalOrderValues.toFixed(2)),
                        averageValue: filteredOrders.length ? Number((totalOrderValues / filteredOrders.length).toFixed(2)) : 0
                    },
                    cancelledOrders: {
                        count: cancelledOrderStats.count,
                        totalValue: cancelledOrderStats.totalValue,
                        averageValue: cancelledOrderStats.count ? Number((cancelledOrderStats.totalValue / cancelledOrderStats.count).toFixed(2)) : 0
                    },
                    rejectedOrders: {
                        count: rejectedOrderStats.count,
                        totalValue: rejectedOrderStats.totalValue,
                        averageValue: rejectedOrderStats.count ? Number((rejectedOrderStats.totalValue / rejectedOrderStats.count).toFixed(2)) : 0
                    },
                    orderTypeSummary: Object.fromEntries(
                        Object.entries(orderTypeSummary).map(([type, stats]) => [
                            type,
                            {
                                ...stats,
                                averageValue: stats.count ? Number((stats.totalValue / stats.count).toFixed(2)) : 0
                            }
                        ])
                    ),
                    paymentTypeSummary: Object.fromEntries(
                        Object.entries(paymentTypeSummary).map(([type, stats]) => [
                            type,
                            {
                                ...stats,
                                averageValue: stats.count ? Number((stats.totalValue / stats.count).toFixed(2)) : 0
                            }
                        ])
                    ),
                    latestOrder: latestOrder ? {
                        orderId: latestOrder.orderId,
                        orderDate: latestOrder.orderDate,
                        orderType: latestOrder.orderType,
                        paymentType: latestOrder.paymentType,
                        branchName: latestOrder.branchName,
                        orderValue: latestOrder?.newOrderValue || 0
                    } : null
                },
                refunds: {
                    totalRefunds,
                    totalRefundAmount: Number(totalRefundAmount.toFixed(2)),
                    averageRefundAmount: totalRefunds ? Number((totalRefundAmount / totalRefunds).toFixed(2)) : 0,
                    totalSettledRefunds,
                    totalSettledRefundAmount: Number(totalSettledRefundAmount.toFixed(2)),
                    averageSettledRefundAmount: totalSettledRefunds ? Number((totalSettledRefundAmount / totalSettledRefunds).toFixed(2)) : 0,
                    totalUnsettledRefunds,
                    totalUnsettledRefundsAmount: Number(totalUnsettledRefundsAmount.toFixed(2)),
                    averageUnsettledRefundAmount: totalUnsettledRefunds ? Number((totalUnsettledRefundsAmount / totalUnsettledRefunds).toFixed(2)) : 0
                }
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.GetTopOrderSummary = async (req, res) => {
    try {
        const { compareType, merchantId } = req.query;
        // compareType = 'last7Days', 'last30Days', 'last24Hours', 'allTime'

        let startDate, endDate;
        switch (compareType) {
            case 'last7Days':
                startDate = moment.tz(timeZone).subtract(7, 'days').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'last30Days':
                startDate = moment.tz(timeZone).subtract(30, 'days').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'last24Hours':
                startDate = moment.tz(timeZone).subtract(24, 'hours').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'allTime':
                startDate = null;
                endDate = null;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid compare type. Use 'last7Days', 'last30Days', 'last24Hours', or 'allTime'"
                });
        }

        let matchStage = {
            status: { $nin: ['CANCELLED', 'REJECTED', 'FAILED'] },
            merchantId: {
                $exists: true,
                $ne: null,
                $nin: [undefined, 0, '0']
            }
        };

        if (startDate && endDate) matchStage.orderDate = { $gte: startDate.toDate(), $lte: endDate.toDate() };

        let parsedMerchantId = [];
        if (merchantId) {
            parsedMerchantId = [merchantId, Number(merchantId)];
            matchStage.merchantId = { $in: parsedMerchantId };
        }

        const orders = await OrderModal.find(matchStage);

        const orderValueMap = orders.reduce((acc, order) => {
            acc[order._id.toString()] = order?.newOrderValue || 0;
            return acc;
        }, {});

        const topOrderedItems = await OrderModal.aggregate([
            { $match: matchStage },
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    totalQuantity: { $sum: "$orderItems.quantity" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        let merchantData = {};

        if (!merchantId) {
            // Get orders with calculated values for merchant aggregation
            const ordersWithValues = orders.map(order => ({
                ...order.toObject(),
                calculatedValue: orderValueMap[order._id.toString()]
            }));

            // Group by merchant for order count
            const merchantOrderCounts = ordersWithValues.reduce((acc, order) => {
                acc[order.merchantId] = (acc[order.merchantId] || 0) + 1;
                return acc;
            }, {});

            // Group by merchant for order value
            const merchantOrderValues = ordersWithValues.reduce((acc, order) => {
                acc[order.merchantId] = (acc[order.merchantId] || 0) + order.calculatedValue;
                return acc;
            }, {});

            // Find top merchants
            const topMerchantByCount = Object.entries(merchantOrderCounts)
                .sort(([, a], [, b]) => b - a)[0];
            const topMerchantByValue = Object.entries(merchantOrderValues)
                .sort(([, a], [, b]) => b - a)[0];

            const [merchantCount, merchantValue] = await Promise.all([
                MerchantModal.findOne({ merchantId: Number(topMerchantByCount[0]) })
                    .select("merchantName merchantId logoImg"),
                MerchantModal.findOne({ merchantId: Number(topMerchantByValue[0]) })
                    .select("merchantName merchantId logoImg")
            ]);

            merchantData = {
                merchantWithMaximumOrderCount: {
                    merchantName: merchantCount.merchantName,
                    merchantId: merchantCount.merchantId,
                    totalOrders: topMerchantByCount[1],
                    logoImg: merchantCount.logoImg
                },
                merchantWithMaximumOrderValue: {
                    merchantName: merchantValue.merchantName,
                    merchantId: merchantValue.merchantId,
                    totalOrderValue: Number(topMerchantByValue[1].toFixed(2)),
                    averageOrderValue: Number((topMerchantByValue[1] / merchantOrderCounts[topMerchantByValue[0]]).toFixed(2)),
                    logoImg: merchantValue.logoImg
                }
            };
        }


        const topCustomerOrderCount = await OrderModal.aggregate([
            { $match: matchStage },
            { $group: { _id: "$customerId", totalOrders: { $sum: 1 } } },
            { $sort: { totalOrders: -1 } },
            { $limit: 1 }
        ]);
        const topCustomerOrderValue = await OrderModal.aggregate([
            { $match: matchStage },
            { $group: { _id: "$customerId", totalOrderValue: { $sum: "$subTotal" }, orderCount: { $sum: 1 } } },
            { $sort: { totalOrderValue: -1 } },
            { $limit: 1 }
        ]);
        const customerCount = await CustomerModal.findOne({ customerId: topCustomerOrderCount[0]?._id, isSwishrCourierCustomer: false }).select("personalDetails.firstName personalDetails.lastName personalDetails.profileImg customerId merchantId");
        const customerValue = await CustomerModal.findOne({ customerId: topCustomerOrderValue[0]?._id, isSwishrCourierCustomer: false }).select("personalDetails.firstName personalDetails.lastName personalDetails.profileImg customerId merchantId");

        return res.status(200).json({
            success: true,
            message: "Top order summary fetched successfully",
            data: {
                topOrderedItems: topOrderedItems.map(item => ({
                    productName: item._id,
                    totalQuantity: item.totalQuantity,
                    numberOfOrders: item.orderCount
                })),
                ...(merchantId ? {} : merchantData),
                ...(topCustomerOrderCount[0] && customerCount ? {
                    customerWithMaximumOrderCount: {
                        customerName: `${customerCount.personalDetails.firstName} ${customerCount.personalDetails.lastName}`,
                        customerId: customerCount.customerId,
                        totalOrders: topCustomerOrderCount[0].totalOrders,
                        profileImg: customerCount.personalDetails.profileImg,
                        merchantId: customerCount.merchantId
                    }
                } : {
                    customerWithMaximumOrderCount: null
                }),
                ...(topCustomerOrderValue[0] && customerValue ? {
                    customerWithMaximumOrderValue: {
                        customerName: `${customerValue.personalDetails.firstName} ${customerValue.personalDetails.lastName}`,
                        customerId: customerValue.customerId,
                        totalOrderValue: topCustomerOrderValue[0].totalOrderValue,
                        averageOrderValue: Number((topCustomerOrderValue[0].totalOrderValue / topCustomerOrderValue[0].orderCount).toFixed(2)),
                        profileImg: customerValue.personalDetails.profileImg,
                        merchantId: customerValue.merchantId
                    }
                } : {
                    customerWithMaximumOrderValue: null
                })
            }
        });


    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

exports.GetComparativeOrderAnalysis = async (req, res) => {
    try {
        const { compareType, merchantId } = req.query; // 'today', 'thisWeek', 'thisMonth', 'thisYear'

        // Get current period dates
        let currentPeriodStart, currentPeriodEnd;
        let previousPeriodStart, previousPeriodEnd;

        switch (compareType) {
            case 'today':
                currentPeriodStart = moment.tz(timeZone).startOf('day');
                currentPeriodEnd = moment.tz(timeZone).endOf('day');
                previousPeriodStart = moment.tz(timeZone).subtract(7, 'days').startOf('day');
                previousPeriodEnd = moment.tz(timeZone).subtract(7, 'days').endOf('day');
                break;
            case 'thisWeek':
                currentPeriodStart = moment.tz(timeZone).startOf('week');
                currentPeriodEnd = moment.tz(timeZone).endOf('week');
                previousPeriodStart = moment.tz(timeZone).subtract(1, 'week').startOf('week');
                previousPeriodEnd = moment.tz(timeZone).subtract(1, 'week').endOf('week');
                break;
            case 'thisMonth':
                currentPeriodStart = moment.tz(timeZone).startOf('month');
                currentPeriodEnd = moment.tz(timeZone).endOf('month');
                previousPeriodStart = moment.tz(timeZone).subtract(1, 'month').startOf('month');
                previousPeriodEnd = moment.tz(timeZone).subtract(1, 'month').endOf('month');
                break;
            case 'thisYear': // Added thisYear case
                currentPeriodStart = moment.tz(timeZone).startOf('year');
                currentPeriodEnd = moment.tz(timeZone).endOf('year');
                previousPeriodStart = moment.tz(timeZone).subtract(1, 'year').startOf('year');
                previousPeriodEnd = moment.tz(timeZone).subtract(1, 'year').endOf('year');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid compare type. Use 'today', 'thisWeek', or 'thisMonth' or 'thisYear'"
                });
        }

        let currentQueryFilter = {
            orderDate: {
                $gte: currentPeriodStart.toDate(), $lte: currentPeriodEnd.toDate()
            },
            merchantId: {
                $exists: true,
                $ne: null,
                $nin: [undefined, 0, '0']
            }
        };

        let previousQueryFilter = {
            orderDate: {
                $gte: previousPeriodStart.toDate(), $lte: previousPeriodEnd.toDate()
            },
            merchantId: {
                $exists: true,
                $ne: null,
                $nin: [undefined, 0, '0']
            }
        };

        let parsedMerchantId = [];
        if (merchantId) {
            parsedMerchantId = [merchantId, Number(merchantId)];
            currentQueryFilter.merchantId = { $in: parsedMerchantId };
            previousQueryFilter.merchantId = { $in: parsedMerchantId };
        }

        // Fetch merchant info if merchantId provided
        const merchant = merchantId ? await MerchantModal.findOne({ merchantId: { $in: parsedMerchantId } }) : null;

        // Fetch orders for both periods
        const [currentPeriodOrders, previousPeriodOrders] = await Promise.all([
            OrderModal.find(currentQueryFilter)
                .lean()
                .select('subTotal orderDiscount serviceFee deliveryCharge driverTip status merchantId isOrderUpdated newOrderValue promoDiscountMerchant promoDiscountSwishr _id'),
            OrderModal.find(previousQueryFilter)
                .lean()
                .select('subTotal orderDiscount serviceFee deliveryCharge driverTip status merchantId isOrderUpdated newOrderValue _id')
        ]);

        const currentFilteredOrders = currentPeriodOrders.filter(order => order.status?.toUpperCase() !== 'CANCELLED' && order.status?.toUpperCase() !== 'REJECTED' && order.status?.toUpperCase() !== 'FAILED')
        const previousFilteredOrders = previousPeriodOrders.filter(order => order.status?.toUpperCase() !== 'CANCELLED' && order.status?.toUpperCase() !== 'REJECTED' && order.status?.toUpperCase() !== 'FAILED')


        // Calculate metrics with new order values
        const currentMetrics = {
            orderCount: currentFilteredOrders.length,
            orderValue: Number(currentFilteredOrders.reduce((acc, order) => (acc + order?.newOrderValue || 0), 0).toFixed(2)),
            cancelledOrders: currentPeriodOrders.filter(order => order.status?.toUpperCase() === 'CANCELLED').length,
            rejectedOrders: currentPeriodOrders.filter(order => order.status?.toUpperCase() === 'REJECTED').length,
            refundedOrders: currentPeriodOrders.filter(order => order.status?.toUpperCase() === 'REFUNDED').length
        };

        const previousMetrics = {
            orderCount: previousFilteredOrders.length,
            orderValue: Number(previousFilteredOrders.reduce((acc, order) => (acc + order?.newOrderValue || 0), 0).toFixed(2)),
            cancelledOrders: previousPeriodOrders.filter(order => order.status?.toUpperCase() === 'CANCELLED').length,
            rejectedOrders: previousPeriodOrders.filter(order => order.status?.toUpperCase() === 'REJECTED').length,
            refundedOrders: previousPeriodOrders.filter(order => order.status?.toUpperCase() === 'REFUNDED').length
        };

        const calculatePercentageChange = (current, previous) => {
            if (previous === 0) return current === 0 ? 0 : 100;
            return Number(((current - previous) / previous * 100).toFixed(2));
        };

        const orderCountChange = calculatePercentageChange(currentMetrics.orderCount, previousMetrics.orderCount);
        const orderValueChange = calculatePercentageChange(currentMetrics.orderValue, previousMetrics.orderValue);
        const cancelledOrdersChange = calculatePercentageChange(currentMetrics.cancelledOrders, previousMetrics.cancelledOrders);
        const rejectedOrdersChange = calculatePercentageChange(currentMetrics.rejectedOrders, previousMetrics.rejectedOrders);
        const refundedOrdersChange = calculatePercentageChange(currentMetrics.refundedOrders, previousMetrics.refundedOrders);

        // Restructure the response to be more frontend-friendly
        res.status(200).json({
            success: true,
            message: "Comparative analysis fetched successfully",
            data: {
                periodInfo: {
                    current: {
                        startDate: currentPeriodStart.toDate(),
                        endDate: currentPeriodEnd.toDate()
                    },
                    previous: {
                        startDate: previousPeriodStart.toDate(),
                        endDate: previousPeriodEnd.toDate()
                    }
                },
                metrics: [
                    {
                        key: 'orders',
                        label: 'Total Orders',
                        current: currentMetrics.orderCount,
                        previous: previousMetrics.orderCount,
                        percentageChange: orderCountChange,
                        trend: orderCountChange >= 0 ? 'positive' : 'negative',
                        type: 'count'
                    },
                    {
                        key: 'orderValue',
                        label: 'Order Value',
                        current: currentMetrics.orderValue,
                        previous: previousMetrics.orderValue,
                        percentageChange: orderValueChange,
                        trend: orderValueChange >= 0 ? 'positive' : 'negative',
                        type: 'amount'
                    },
                    {
                        key: 'cancelledOrders',
                        label: 'Cancelled Orders',
                        current: currentMetrics.cancelledOrders,
                        previous: previousMetrics.cancelledOrders,
                        percentageChange: cancelledOrdersChange,
                        trend: cancelledOrdersChange >= 0 ? 'negative' : 'positive', // Note: For cancelled orders, increase is negative
                        type: 'count'
                    },
                    {
                        key: 'rejectedOrders',
                        label: 'Rejected Orders',
                        current: currentMetrics.rejectedOrders,
                        previous: previousMetrics.rejectedOrders,
                        percentageChange: rejectedOrdersChange,
                        trend: rejectedOrdersChange >= 0 ? 'negative' : 'positive', // Note: For rejected orders, increase is negative
                        type: 'count'
                    },
                    {
                        key: 'refundedOrders',
                        label: 'Refunded Orders',
                        current: currentMetrics.refundedOrders,
                        previous: previousMetrics.refundedOrders,
                        percentageChange: refundedOrdersChange,
                        trend: refundedOrdersChange >= 0 ? 'negative' : 'positive', // Note: For refunded orders, increase is negative
                        type: 'count'
                    }
                ]
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.GetOrderComissionReport = async (req, res) => {
    try {
        const { compareType, merchantId } = req.query;
        // compareType = 'last7Days', 'last30Days', 'last24Hours', 'allTime'

        let startDate, endDate;
        switch (compareType) {
            case 'last7Days':
                startDate = moment.tz(timeZone).subtract(7, 'days').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'last30Days':
                startDate = moment.tz(timeZone).subtract(30, 'days').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'last24Hours':
                startDate = moment.tz(timeZone).subtract(24, 'hours').startOf('day');
                endDate = moment.tz(timeZone).endOf('day');
                break;
            case 'allTime':
                startDate = null;
                endDate = null;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid compare type. Use 'last7Days', 'last30Days', 'last24Hours', or 'allTime'"
                });
        }

        let orderQueryFilter = {
            status: { $nin: ['CANCELLED', 'REJECTED', 'FAILED'] },
            merchantId: {
                $exists: true,
                $ne: null,
                $nin: [undefined, 0, '0']
            }
        };

        if (startDate && endDate) {
            orderQueryFilter.orderDate = { $gte: startDate.toDate(), $lte: endDate.toDate() };
        }

        // In GetOrderHistorySummary
        let parsedMerchantId = [];
        if (merchantId) {
            parsedMerchantId = [merchantId, Number(merchantId)];
            orderQueryFilter.merchantId = { $in: parsedMerchantId };
        }

        // Fetch orders, refunds, and merchant info concurrently
        const [orders, merchant] = await Promise.all([
            OrderModal.find(orderQueryFilter).lean()
                .select('subTotal orderDiscount serviceFee deliveryCharge driverTip status merchantId orderType paymentType orderDate orderId branchName newOrderValue promoDiscountMerchant promoDiscountSwishr netCommission netServiceFee netDeliveryCharge _id'),
            merchantId ? MerchantModal.findOne({ merchantId: { $in: parsedMerchantId } }) : null
        ]);

        const deliveryOrders = orders.filter(order => order.orderType.toUpperCase() === 'DELIVERY');
        const collectionOrders = orders.filter(order => order.orderType.toUpperCase() === 'COLLECTION');

        const deliveryOrderCommission = deliveryOrders.reduce((sum, order) => (sum + order.netCommission || 0), 0);    

        const collectionOrderCommission = collectionOrders.reduce((sum, order) => (sum + order.netCommission || 0), 0);

        const totalNetCommission = deliveryOrderCommission + collectionOrderCommission;

        const deliveryOrderServiceFeeCommission = deliveryOrders.reduce((sum, order) => (sum + order.netServiceFee || 0), 0);

        const collectionOrderServiceFeeCommission = collectionOrders.reduce((sum, order) => (sum + order.netServiceFee || 0), 0);

        const totalServiceFeeCommission = deliveryOrderServiceFeeCommission + collectionOrderServiceFeeCommission;

        const deliveryOrderDeliveryChargeCommission = deliveryOrders.reduce((sum, order) => (sum + order.netDeliveryCharge || 0), 0);

        const collectionOrderDeliveryChargeCommission = collectionOrders.reduce((sum, order) => (sum + order.netDeliveryCharge || 0), 0);

        const totalDeliveryChargeCommission = deliveryOrderDeliveryChargeCommission + collectionOrderDeliveryChargeCommission;

        const deliveryOrderVATCommission = (deliveryOrderCommission + deliveryOrderServiceFeeCommission + deliveryOrderDeliveryChargeCommission) * 0.20;

        const collectionOrderVATCommission = (collectionOrderCommission + collectionOrderServiceFeeCommission + collectionOrderDeliveryChargeCommission) * 0.20;

        const totalVATCommission = deliveryOrderVATCommission + collectionOrderVATCommission;

        const totalDeliveryOrderCommission = deliveryOrderCommission + deliveryOrderServiceFeeCommission + deliveryOrderDeliveryChargeCommission + deliveryOrderVATCommission;

        const totalCollectionOrderCommission = collectionOrderCommission + collectionOrderServiceFeeCommission + collectionOrderDeliveryChargeCommission + collectionOrderVATCommission;

        const totalOrderCommission = totalDeliveryOrderCommission + totalCollectionOrderCommission;


        res.status(200).json({
            success: true,
            message: "Order commission report fetched successfully",
            data: {
                netCommission: {
                    totalNetCommission: Number(totalNetCommission?.toFixed(2)),
                    deliveryOrderCommission: Number(deliveryOrderCommission?.toFixed(2)),
                    collectionOrderCommission: Number(collectionOrderCommission?.toFixed(2))
                },
                netServiceFeeCommission: {
                    totalServiceFeeCommission: Number(totalServiceFeeCommission?.toFixed(2)),
                    deliveryOrderServiceFeeCommission: Number(deliveryOrderServiceFeeCommission?.toFixed(2)),
                    collectionOrderServiceFeeCommission: Number(collectionOrderServiceFeeCommission?.toFixed(2))
                },
                netDeliveryChargeCommission: {
                    totalDeliveryChargeCommission: Number(totalDeliveryChargeCommission?.toFixed(2)),
                    deliveryOrderDeliveryChargeCommission: Number(deliveryOrderDeliveryChargeCommission?.toFixed(2)),
                    collectionOrderDeliveryChargeCommission: Number(collectionOrderDeliveryChargeCommission?.toFixed(2))
                },
                netVATCommission: {
                    totalVATCommission: Number(totalVATCommission?.toFixed(2)),
                    deliveryOrderVATCommission: Number(deliveryOrderVATCommission?.toFixed(2)),
                    collectionOrderVATCommission: Number(collectionOrderVATCommission?.toFixed(2))
                },
                totalCommission: {
                    totalOrderCommission: Number(totalOrderCommission?.toFixed(2)),
                    totalDeliveryOrderCommission: Number(totalDeliveryOrderCommission?.toFixed(2)),
                    totalCollectionOrderCommission: Number(totalCollectionOrderCommission?.toFixed(2))
                }
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

exports.GetOrderGraphData = async (req, res) => {
    try {
        const { frequency, orderType, merchantId } = req.query;
        let fromDate, toDate;

        // Set date range based on frequency
        switch (frequency) {
            case 'daily':
                fromDate = moment.tz(timeZone).startOf('isoWeek').subtract(7, 'days').toDate();
                toDate = moment.tz(timeZone).endOf('isoWeek').subtract(7, 'days').toDate();
                break;

            case 'weekly':
                // Get the start and end of the previous month
                // fromDate = moment().tz(timeZone).subtract(1, 'month').startOf('month').startOf('isoWeek').toDate();
                // toDate = moment().tz(timeZone).subtract(1, 'month').endOf('month').endOf('isoWeek').toDate();
                // break;
                fromDate = moment().tz(timeZone).subtract(6, 'weeks').startOf('isoWeek').toDate();
                // Get the end of LAST WEEK (Saturday)
                toDate = moment().tz(timeZone).subtract(1, 'week').endOf('isoWeek').toDate();
                break;
            case 'monthly':
                fromDate = moment().tz(timeZone).startOf('year').toDate();
                toDate = moment().tz(timeZone).endOf('day').toDate();
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid frequency. Use 'daily', 'weekly', or 'monthly'" });
        }

        let queryFilter = {
            orderDate: { $gte: fromDate, $lte: toDate },
            merchantId: { $exists: true, $ne: null, $nin: [undefined, 0, '0'] }
        };

        if (merchantId) {
            const parsedMerchantId = [merchantId, Number(merchantId)];
            queryFilter.merchantId = { $in: parsedMerchantId };
        }

        switch (orderType) {
            case 'cancelledOrders': queryFilter.status = { $regex: /^cancelled$/i };
                break;
            case 'rejectedOrders': queryFilter.status = { $regex: /^rejected$/i };
                break;
            case 'collectionOrders': queryFilter.orderType = { $regex: /^collection$/i };
                queryFilter.status = { $nin: ['CANCELLED', 'REJECTED', 'FAILED'] };
                break;
            case 'deliveryOrders': queryFilter.orderType = { $regex: /^delivery$/i };
                queryFilter.status = { $nin: ['CANCELLED', 'REJECTED', 'FAILED'] };
                break;
            case 'cashOrders': queryFilter.paymentType = { $regex: /^cash$/i };
                queryFilter.status = { $nin: ['CANCELLED', 'REJECTED', 'FAILED'] };
                break;
            case 'cardOrders': queryFilter.paymentType = { $regex: /^card$/i };
                queryFilter.status = { $nin: ['CANCELLED', 'REJECTED', 'FAILED'] };
                break;
            case 'refundOrders': queryFilter.status = { $regex: /^refunded$/i };
                break;
            case 'totalOrders': queryFilter.status = { $nin: ['CANCELLED', 'REJECTED', 'FAILED'] }; break;

            default: return res.status(400).json({ success: false, message: "Invalid orderType" });
        }

        const [orders, merchant] = await Promise.all([
            OrderModal.find(queryFilter).lean().select('orderDate subTotal orderDiscount serviceFee deliveryCharge status merchantId orderType paymentType newOrderValue'),
            merchantId ? MerchantModal.findOne({ merchantId: { $in: [merchantId, Number(merchantId)] } }) : null
        ]);

        const aggregatedData = {};
        let totalOrderValue = 0;
        let totalCount = 0;

        // Modified date range handling
        let current = moment(fromDate);
        const endDate = moment(toDate);

        while (
            (frequency === 'monthly' && current.isSameOrBefore(endDate, 'month')) ||
            (frequency !== 'monthly' && current.isBefore(endDate, frequency === 'daily' ? 'day' : 'week'))
        ) {
            let key;
            if (frequency === 'daily') {
                if (current.isSameOrAfter(fromDate, 'day') && current.isSameOrBefore(endDate, 'day')) {
                    key = current.format('D MMM');
                }
            } else if (frequency === 'weekly') {
                let startOfWeek = current.clone().startOf('isoWeek').format('D MMM');
                let endOfWeek = current.clone().endOf('isoWeek').format('D MMM');
                key = `${startOfWeek} - ${endOfWeek}`;
            } else if (frequency === 'monthly') {
                // Only add months that are within the current year
                if (current.isSameOrAfter(fromDate, 'month') && current.isSameOrBefore(endDate, 'month')) {
                    key = current.format('MMMM');
                }
            }

            if (key) {
                aggregatedData[key] = { label: key, orderValue: 0, orderCount: 0, averageValue: 0 };
            }
            current.add(1, frequency === 'daily' ? 'days' : frequency === 'weekly' ? 'weeks' : 'months');
        }

        // Modified order processing
        for (const order of orders) {
            let orderDate = moment(order.orderDate);
            // if (orderDate.isBetween(fromDate, toDate, 'day', '[]')) {
            let key;
            if (frequency === 'daily') {
                key = orderDate.format('D MMM');
            } else if (frequency === 'weekly') {
                let startOfWeek = orderDate.clone().startOf('isoWeek').format('D MMM');
                let endOfWeek = orderDate.clone().endOf('isoWeek').format('D MMM');
                key = `${startOfWeek} - ${endOfWeek}`;
            } else if (frequency === 'monthly') {
                key = orderDate.format('MMMM');
            }

            if (aggregatedData[key]) {
                const orderValue = order?.newOrderValue || 0;
                aggregatedData[key].orderValue += orderValue;
                aggregatedData[key].orderCount += 1;
                totalOrderValue += orderValue;
                totalCount += 1;
            }
            // }
        }

        const graphData = Object.values(aggregatedData).map(item => ({
            ...item,
            averageValue: item.orderCount > 0 ? Number((item.orderValue / item.orderCount).toFixed(2)) : 0,
            orderValue: Number(item.orderValue.toFixed(2))
        }));

        const transformedGraphData = graphData.map(item => ({
            xAxis: item.label,
            OrderValue: item.orderValue,
            OrderCount: item.orderCount,
            AverageValue: item.averageValue
        }));


        res.status(200).json({
            success: true,
            message: "Graph data fetched successfully",
            data: {
                graphData: transformedGraphData,
                summary: {
                    totalCount,
                    totalOrderValue: Number(totalOrderValue.toFixed(2)),
                    totalAverageValue: totalCount > 0 ? Number((totalOrderValue / totalCount).toFixed(2)) : 0
                }
            }
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};


