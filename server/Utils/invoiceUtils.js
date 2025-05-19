const fs = require('fs');
const path = require('path');
const pdfMake = require('pdfmake/build/pdfmake');

const vfsFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = vfsFonts.vfs;
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const InvoiceModal = require('../Models/invoice');
const MerchantItemsModal = require('../Models/merchantItems');
const { uploadPdfBuffer } = require('../azureBlobHelper');
const { getNextId } = require('./utils');

const generateInvoiceId = async (merchantId) => {
    const invoiceCount = await getNextId('invoice');
    const formattedCount = String(invoiceCount).padStart(4, '0');
    const formattedMerchantId = merchantId ? String(merchantId).padStart(4, '0') : "0000";
    const invoiceId = `SWSH-230324-${formattedMerchantId}-${formattedCount}`;
    return invoiceId;
};

const calculateInvoiceParameters = (merchant, orders, refundArray) => {
    const calculationsByOrderType = calculateOrderValues(orders, merchant, 'orderType');
    const calculationsByPaymentType = calculateOrderValues(orders, merchant, 'paymentType');

    let totalSubTotal = 0;
    let totalSalesValue = 0;
    let serviceFeeCharge = 0;
    let deliveryFeeCharge = 0;
    let driverTipCharge = 0;
    let totalFoodValue = 0;

    const isInHouseType = merchant?.isInHouseType;

    for (const orderType in calculationsByOrderType) {

        if (isInHouseType) {
            if (orderType !== "DELIVERY_CHARGE" && orderType !== "DRIVER_TIP") {
                totalSubTotal += Number(calculationsByOrderType[orderType].amount?.toFixed(2));
            }
        }
        else {
            totalSubTotal += Number(calculationsByOrderType[orderType].amount?.toFixed(2));
        }

        if (orderType.toLowerCase() === 'delivery' || orderType.toLowerCase() === 'collection') {
            totalFoodValue += Number(calculationsByOrderType[orderType].totalOrderValue?.toFixed(2));
        }
    }

    if (calculationsByOrderType['SERVICE_FEE'] && calculationsByOrderType['SERVICE_FEE'].amount) {
        serviceFeeCharge = Number(calculationsByOrderType['SERVICE_FEE'].amount?.toFixed(2));
    }

    // if (calculationsByOrderType['DELIVERY_CHARGE'] && calculationsByOrderType['DELIVERY_CHARGE'].isCashOrders && !isInHouseType) {
    //     deliveryFeeCharge = Number(calculationsByOrderType['DELIVERY_CHARGE'].amount?.toFixed(2));
    // }
    if (calculationsByOrderType['DELIVERY_CHARGE'] && calculationsByOrderType['DELIVERY_CHARGE']?.amount && !isInHouseType) {
        deliveryFeeCharge = Number(calculationsByOrderType['DELIVERY_CHARGE'].amount?.toFixed(2));
    }
    if (calculationsByOrderType['DRIVER_TIP'] && calculationsByOrderType['DRIVER_TIP']?.amount && !isInHouseType) {
        driverTipCharge = Number(calculationsByOrderType['DRIVER_TIP'].amount?.toFixed(2));
    }

    totalSalesValue = totalFoodValue + serviceFeeCharge + deliveryFeeCharge + driverTipCharge;

    const cardPaymentAmount = calculationsByPaymentType?.CARD?.totalOrderValue || 0;
    const cashPaymentAmount = totalSalesValue - cardPaymentAmount;
    const totalSalesWithoutRefund = totalSalesValue;

    let totalRefundAmount = 0;
    if (refundArray && refundArray.length > 0) {
        totalRefundAmount = refundArray.reduce((acc, current) => acc + current.refundAmount, 0);
        totalSalesValue = totalSalesValue - totalRefundAmount 
    }

    const tax_amount = (merchant.taxRate * totalSubTotal) / 100;
    const totalWithTax = totalSubTotal + tax_amount;

    const finalData = {
        calculationsByOrderType,
        calculationsByPaymentType,
        totalSubTotal: totalSubTotal?.toFixed(2),
        tax_amount: tax_amount.toFixed(2),
        totalWithTax: totalWithTax?.toFixed(2),
        totalSalesValue: totalSalesValue?.toFixed(2),
        taxRate: merchant.taxRate,
        totalFoodValue,
        refundArray,
        totalRefundAmount: Number(totalRefundAmount?.toFixed(2)) || 0,
        cardPaymentAmount,
        cashPaymentAmount,
        totalSalesWithoutRefund
    };

    return finalData
}

const calculateOrderValues = (orders, merchant, type) => {
    // Group data based on the type parameter (either orderType or paymentType)
    const groupedData = orders.reduce((acc, order) => {
        const key = order[type]; // Use the type parameter (orderType or paymentType)
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(order);
        return acc;
    }, {});

    const calculations = {};
    const isInHouseType = merchant?.isInHouseType;

    // Loop through each group (orderType or paymentType)
    for (const key in groupedData) {
        let totalOrderValue = 0;

        groupedData[key].forEach((order) => {

            // Calculate the total value for each order
            const totalForRow = order.subTotal
                - order.orderDiscount
                - order.promoDiscountSwishr
                - order.promoDiscountMerchant;
            totalOrderValue += totalForRow;
            if (isInHouseType) {
                totalOrderValue += order.deliveryCharge;
                if (merchant?.driverTipApplicable) {
                    totalOrderValue += order.driverTip
                }
            }
        });

        let commissionRate = 0;
        if (key.toLowerCase() === 'delivery') {
            commissionRate = merchant?.deliveryOrdersComission;
        } else if (key.toLowerCase() === 'collection') {
            commissionRate = merchant?.collectionOrdersComission;
        }


        const commissionAmount = (commissionRate * totalOrderValue) / 100;

        let totalCashOrdersWithServiceFee = 0;
        let cashOrderValueService = 0;

        if (!merchant.serviceFeeApplicable && type === 'paymentType' && orders.some(order => order.paymentType === 'CASH' && order.serviceFee > 0)) {
            totalCashOrdersWithServiceFee = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0)?.length
            cashOrderValueService = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0).reduce((acc, order) => acc + order.serviceFee, 0)
        }

        if (type === 'orderType') {
            calculations[key] = {
                totalOrderValue: Number(totalOrderValue.toFixed(2)),
                totalOrders: groupedData[key].length,
                commissionRate,
                amount: Number(commissionAmount.toFixed(2)),
            };
        }
        else if (type === 'paymentType') {
            let orderValueSum = totalOrderValue;
            if (merchant?.serviceFeeApplicable) {
                orderValueSum += orders.filter(order => order.paymentType === key && order.serviceFee > 0).reduce((acc, order) => acc + order.serviceFee, 0)
            }
            if (merchant?.deliveryChargeApplicable && !isInHouseType) {
                orderValueSum += orders.filter(order => order.paymentType === key && order.deliveryCharge > 0).reduce((acc, order) => acc + order.deliveryCharge, 0)
            }
            if (merchant?.driverTipApplicable && !isInHouseType) {
                orderValueSum += orders.filter(order => order.paymentType === key && order.driverTip > 0).reduce((acc, order) => acc + order.driverTip, 0)
            }
            calculations[key] = {
                totalOrderValue: key === 'CARD' ? Number(orderValueSum.toFixed(2)) : Number(orderValueSum?.toFixed(2)) + Number(cashOrderValueService?.toFixed(2)),
                totalOrders: groupedData[key].length,
            };
            if (key === 'CASH') {
                calculations['CASH'].isServiceFeeIncluded = true
            }
        }

    }

    if (merchant.serviceFeeApplicable && type === 'orderType') {
        const orderValue = orders.reduce((acc, order) => acc + order.serviceFee, 0)
        calculations['SERVICE_FEE'] = {
            totalOrderValue: Number(orderValue.toFixed(2)),
            totalOrders: orders.filter(order => order.serviceFee > 0).length,
            commissionRate: 0,
            amount: Number(orderValue.toFixed(2))
        }
    }

    //if service fee is not applicable, check if any cash payment is made for service fee, if so, calculate the total amount of cash payment for service fee column

    if (!merchant.serviceFeeApplicable && type === 'orderType' && orders.some(order => order.paymentType === 'CASH' && order.serviceFee > 0)) {
        const totalCashOrdersWithServiceFee = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0)?.length
        const cashOrderValueService = orders.filter(order => order.paymentType === 'CASH' && order.serviceFee > 0).reduce((acc, order) => acc + order.serviceFee, 0)
        calculations['SERVICE_FEE'] = {
            totalOrderValue: Number(cashOrderValueService.toFixed(2)),
            totalOrders: totalCashOrdersWithServiceFee,
            commissionRate: 0,
            amount: Number(cashOrderValueService.toFixed(2)),
            isCashOrders: true
        }
    }

    if (isInHouseType && type === 'orderType') {
        const orderValue = orders.reduce((acc, order) => acc + order.deliveryCharge, 0)
        calculations['DELIVERY_CHARGE'] = {
            totalOrderValue: Number(orderValue.toFixed(2)),
            totalOrders: orders.filter(order => order.deliveryCharge > 0).length,
            commissionRate: 0,
            amount: Number(orderValue.toFixed(2))
        }
        if (merchant.driverTipApplicable) {
            const orderValue = orders.reduce((acc, order) => acc + order.driverTip, 0)
            calculations['DRIVER_TIP'] = {
                totalOrderValue: Number(orderValue.toFixed(2)),
                totalOrders: orders.filter(order => order.driverTip > 0).length,
                commissionRate: 0,
                amount: Number(orderValue.toFixed(2))
            }
        }
    }
    else {
        if (merchant.deliveryChargeApplicable && type === 'orderType') {
            const orderValue = orders.reduce((acc, order) => acc + order.deliveryCharge, 0)
            calculations['DELIVERY_CHARGE'] = {
                totalOrderValue: Number(orderValue.toFixed(2)),
                totalOrders: orders.filter(order => order.deliveryCharge > 0).length,
                commissionRate: 0,
                amount: Number(orderValue.toFixed(2))
            }
        }

        if (!merchant.deliveryChargeApplicable && type === 'orderType' && orders.some(order => order.paymentType === 'CASH' && order.deliveryCharge > 0)) {
            const totalCashOrdersWithDeliveryCharge = orders.filter(order => order.paymentType === 'CASH' && order.deliveryCharge > 0)?.length
            const cashOrderValueDelivery = orders.filter(order => order.paymentType === 'CASH' && order.deliveryCharge > 0).reduce((acc, order) => acc + order.deliveryCharge, 0)
            calculations['DELIVERY_CHARGE'] = {
                totalOrderValue: Number(cashOrderValueDelivery.toFixed(2)),
                totalOrders: totalCashOrdersWithDeliveryCharge,
                commissionRate: 0,
                amount: Number(cashOrderValueDelivery.toFixed(2)),
                isCashOrders: true
            }
        }

        if (merchant.driverTipApplicable && type === 'orderType') {
            const orderValue = orders.reduce((acc, order) => acc + order.driverTip, 0)
            calculations['DRIVER_TIP'] = {
                totalOrderValue: Number(orderValue.toFixed(2)),
                totalOrders: orders.filter(order => order.driverTip > 0).length,
                commissionRate: 0,
                amount: Number(orderValue.toFixed(2))
            }
        }
    }


    return calculations;
};

const getFinalDataForEditInvoice = (invoiceParameters, taxRate) => {

    let totalSubTotal = 0;
    let taxableSubTotal = 0;
    for (const orderType in invoiceParameters.calculationsByOrderType) {
        const orderData = invoiceParameters.calculationsByOrderType[orderType];
        if (orderType === 'MISCELLANEOUS') {
            if (Array.isArray(orderData) && orderData.length) {
                totalSubTotal += orderData.reduce((acc, current) => acc + current.amount, 0);
                taxableSubTotal += orderData.filter(item => item.isVatApplicable).reduce((acc, current) => acc + current.amount, 0);
            }
        }
        else if (orderType === "DELIVERY" || orderType === "COLLECTION" || orderType === "SERVICE_FEE") {
            totalSubTotal += orderData.amount;
            taxableSubTotal += orderData.amount;
        }
        else if ((orderType === 'DELIVERY_CHARGE' || orderType === 'DRIVER_TIP') && !invoiceParameters?.isInHouseType) {
            totalSubTotal += orderData.amount;
            taxableSubTotal += orderData.amount;
        }
    }
    const tax_amount = (taxRate * taxableSubTotal) / 100;
    const totalWithTax = totalSubTotal + tax_amount;

    let totalSubTotal_item = totalSubTotal;
    let taxAmount_item = tax_amount;
    let totalWithTax_item = totalWithTax;
    if (invoiceParameters?.validItem.length > 0) {
        let validItem = invoiceParameters?.validItem;
        validItem = validItem.map(item => {
            const tax = (item.deductableAmount * taxRate) / 100;
            return { ...item, tax: Number(tax.toFixed(2)) };
        });
        totalSubTotal_item += validItem.reduce((acc, current) => acc + current.deductableAmount, 0);
        taxAmount_item += validItem.reduce((acc, current) => acc + Number(current.tax), 0);
        totalWithTax_item = totalSubTotal_item + taxAmount_item;
    }

    const finalData = {
        calculationsByOrderType: invoiceParameters.calculationsByOrderType,
        totalSubTotal: totalSubTotal_item?.toFixed(2),
        tax_amount: taxAmount_item?.toFixed(2),
        totalWithTax: totalWithTax_item?.toFixed(2),
        totalOrdersCount: invoiceParameters?.totalOrdersCount,
        cardPaymentCount: invoiceParameters?.cardPaymentCount,
        cashPaymentCount: invoiceParameters?.cashPaymentCount,
        cardPaymentAmount: invoiceParameters?.cardPaymentAmount,
        openingBalance: invoiceParameters?.openingBalance,
        currentInvoiceCount: invoiceParameters?.currentInvoiceCount,
        cashPaymentAmount: invoiceParameters?.cashPaymentAmount,
        totalSales: invoiceParameters?.totalSales,
        merchantItemIds: invoiceParameters?.merchantItemIds,
        invoiceDate: invoiceParameters?.invoiceDate,
        validItem: invoiceParameters?.validItem,
        taxRate: taxRate,
        deliveryChargeInHouse: invoiceParameters?.deliveryChargeInHouse,
        driverTipInHouse: invoiceParameters?.driverTipInHouse,
        refundArray: invoiceParameters?.refundArray,
        totalRefundAmount: invoiceParameters?.totalRefundAmount
    }
    return finalData
}

const createPDF = async (fileName, merchant, fromDate, toDate, finalData, invoiceId, isEditInvoice) => {

    const logoImagePath = path.join(__dirname, './swishr_logo.jpg');
    const logoImage = fs.readFileSync(logoImagePath).toString('base64');
    const merchantAccountRef = `SWSH-${moment.tz(merchant?.registrationDate, timeZone).format('DDMMYY')}-${String(merchant.merchantId).padStart(4, '0')}`;
    const invoiceDate = !isEditInvoice ? moment.tz(timeZone).toDate() : finalData?.invoiceDate || moment.tz(timeZone).toDate();

    const totalSubTotal = Number(finalData.totalSubTotal) || 0;
    const taxAmount = Number(finalData.tax_amount) || 0;
    const totalWithTax = Number(finalData.totalWithTax) || 0;

    const totalOrdersCount = finalData?.totalOrdersCount || Object.values(finalData?.calculationsByPaymentType).reduce((acc, current) => acc + current.totalOrders, 0) || 0;
    const deliveryOrderCount = finalData?.calculationsByOrderType?.DELIVERY?.totalOrders || 0;
    const collectionOrderCount = finalData?.calculationsByOrderType?.COLLECTION?.totalOrders || 0;
    const cardPaymentCount = finalData?.cardPaymentCount || finalData?.calculationsByPaymentType?.CARD?.totalOrders || 0;
    const cashPaymentCount = finalData?.cashPaymentCount || finalData?.calculationsByPaymentType?.CASH?.totalOrders || 0;

    const cardPaymentAmount = finalData?.cardPaymentAmount || 0;

    const totalSales = !isEditInvoice ? Number(finalData?.totalSalesValue || 0) : finalData?.totalSales || 0;

    let cashPaymentAmount = 0;
    
    if (!isEditInvoice) {
        cashPaymentAmount = finalData?.cashPaymentAmount || 0;
    }else {
        cashPaymentAmount = finalData?.cashPaymentAmount || 0;
    }

    const merchantItem = await MerchantItemsModal.find({ merchantId: merchant.merchantId })
    let validItem = !isEditInvoice ? [] : finalData?.validItem;
    let totalSubTotal_item = totalSubTotal;
    let taxAmount_item = taxAmount;
    let totalWithTax_item = totalWithTax

    if (merchantItem.length > 0 && !isEditInvoice) {
        validItem = merchantItem.filter(item => !item.isWaivedOff && item.balanceAmount > 0);
        if (validItem.length > 0) {
            validItem = validItem.map(item => {
                const plainItem = item.toObject();
                const tax = (plainItem.deductableAmount * merchant.taxRate) / 100;
                return { ...plainItem, tax: Number(tax.toFixed(2)) };
            });
            totalSubTotal_item += validItem.reduce((acc, current) => acc + current.deductableAmount, 0);
            taxAmount_item += validItem.reduce((acc, current) => acc + Number(current.tax), 0);
            totalWithTax_item = totalSubTotal_item + taxAmount_item;
        }
    }
    const totalToBePaid = totalSales - totalWithTax_item
    const bankTransfer = totalToBePaid - cashPaymentAmount
    let closingBalance = 0

    const lastInvoice = await InvoiceModal.findOne({ merchantId: merchant.merchantId, isManualCreate: false }).sort({ createdAt: -1 });
    const openingBalance = isEditInvoice ? finalData.openingBalance : lastInvoice ? (Number(lastInvoice.invoiceParameters?.closingBalance) || 0) : 0;

    let currentInvoiceCount;
    if (!isEditInvoice) {
        const lastInvoiceIdWithLeadingZeros = invoiceId.split('-').pop();
        currentInvoiceCount = parseInt(lastInvoiceIdWithLeadingZeros, 10) || 1;
    }
    else {
        currentInvoiceCount = finalData?.currentInvoiceCount
    }

    const remainingAmount = - openingBalance + cardPaymentAmount - totalWithTax_item - finalData?.totalRefundAmount || 0
    if (remainingAmount > 0) {
        closingBalance = 0
    }
    else {
        closingBalance = - remainingAmount
    }

    const isInHouseType = merchant?.isInHouseType;
    let deliveryChargeInHouse = !isEditInvoice ? { amount: 0, totalOrders: 0 } : finalData?.deliveryChargeInHouse || { amount: 0, totalOrders: 0 };
    let driverTipInHouse = !isEditInvoice ? { amount: 0, totalOrders: 0 } : finalData?.driverTipInHouse || { amount: 0, totalOrders: 0 };
    if (!isEditInvoice && isInHouseType && finalData?.calculationsByOrderType['DELIVERY_CHARGE'] && finalData?.calculationsByOrderType['DELIVERY_CHARGE'].amount) {
        deliveryChargeInHouse = { amount: finalData?.calculationsByOrderType['DELIVERY_CHARGE'].amount, totalOrders: finalData?.calculationsByOrderType['DELIVERY_CHARGE'].totalOrders };
    }
    if (!isEditInvoice && isInHouseType && finalData?.calculationsByOrderType['DRIVER_TIP'] && finalData?.calculationsByOrderType['DRIVER_TIP'].amount) {
        driverTipInHouse = { amount: finalData?.calculationsByOrderType['DRIVER_TIP'].amount, totalOrders: finalData?.calculationsByOrderType['DRIVER_TIP'].totalOrders };
    }

    const docDefinition = {
        content: [
            {
                image: `data:image/png;base64,${logoImage}`,
                width: 125,
                alignment: 'right',
            },
            { text: `Invoice no. ${invoiceId}`, style: 'header', alignment: 'right' },

            {
                table: {
                    widths: ['*', 'auto'], // Left column takes remaining space, right column auto width
                    body: [
                        [
                            // Merchant Details (Left Side)
                            {
                                stack: [
                                    { text: `${merchant.merchantName}`, style: 'subheader', alignment: 'left' },
                                    ...(merchant.merchantAddress?.line1 ? [{ text: `${merchant.merchantAddress?.line1}`, style: 'subheader', alignment: 'left' }] : []),
                                    ...(merchant.merchantAddress?.line2 ? [{ text: `${merchant.merchantAddress?.line2}`, style: 'subheader', alignment: 'left' }] : []),
                                    ...(merchant.merchantAddress?.area ? [{ text: `${merchant.merchantAddress?.area}`, style: 'subheader', alignment: 'left' }] : []),
                                    { text: `${merchant.merchantAddress?.post}`, style: 'subheader', alignment: 'left' }, // Always included
                                    ...(merchant.merchantAddress?.country ? [{ text: `${merchant.merchantAddress?.country}`, style: 'subheader', alignment: 'left' }] : []),
                                ],
                            },
                            // Swishr Details (Right Side)
                            {
                                stack: [
                                    { text: `Swishr`, style: 'subheader', alignment: 'right' },
                                    { text: `128 City Road`, style: 'subheader', alignment: 'right' },
                                    { text: `London`, style: 'subheader', alignment: 'right' },
                                    { text: `EC1V 2NX`, style: 'subheader', alignment: 'right' },
                                    { text: `VAT Number: 467 7930 40`, style: 'subheader', alignment: 'right' },
                                    { text: `Tel: 0207 046 1829`, style: 'subheader', alignment: 'right' },
                                    { text: `e-Mail: Restaurants@Swishr.co.uk`, style: 'subheader', alignment: 'right', link: 'mailto: restaurants@Swishr.co.uk' },
                                ],
                            },
                        ],
                    ],
                },
                margin: [0, 5],
                layout: 'noBorders', // Optional: Remove borders for a cleaner look
            },

            { text: `Invoice date: ${moment.tz(invoiceDate, timeZone).format('Do MMMM YYYY')}`, style: 'subheader', alignment: 'right', margin: [0, 5, 0, 20] },

            { text: `Period: ${moment.tz(fromDate, timeZone).format('Do MMMM YYYY')} - ${moment.tz(toDate, timeZone).format('Do MMMM YYYY')}\n\n`, style: 'subheader', alignment: 'left', margin: [0, 30, 0, 0] },

            // Order Type Calculations Table
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: 'Description', bold: true, style: 'subheader', },
                            { text: 'Amount', bold: true, style: 'subheader', },
                        ],
                        ...Object.entries(finalData.calculationsByOrderType).filter(([orderType]) => orderType !== 'MISCELLANEOUS').flatMap(([orderType, data]) => {
                            const totalOrderValue = data.totalOrderValue || 0; // Default to 0
                            const amount = data.amount || 0; // Default to 0
                            let description = '';
                            // Set description based on orderType
                            if (orderType === 'COLLECTION' && amount > 0) {
                                description = `${data.commissionRate}% Commission on Collection Orders value £${totalOrderValue.toFixed(2)} (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DELIVERY' && amount > 0) {
                                description = `${data.commissionRate}% Commission on Delivery Orders value £${totalOrderValue.toFixed(2)} (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'SERVICE_FEE' && !data.isCashOrders && amount > 0) {
                                description = `Service Fee Paid (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'SERVICE_FEE' && data.isCashOrders && amount > 0) {
                                description = `Service Fee Paid By Cash Orders (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DELIVERY_CHARGE' && !data.isCashOrders && !isInHouseType && amount > 0) {
                                description = `Delivery Charge (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DELIVERY_CHARGE' && data.isCashOrders && !isInHouseType && amount > 0) {
                                description = `Delivery Charge Paid By Cash Orders (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            } else if (orderType === 'DRIVER_TIP' && !isInHouseType && amount > 0) {
                                description = `Driver Tip (${data.totalOrders} Orders) (VAT @ ${finalData.taxRate}%)`;
                            }

                            return !description ? [] : [[
                                { text: description, margin: [0, 2] },
                                { text: `£${amount.toFixed(2)}`, margin: [0, 2] }],
                            ];
                        }),
                        ...(finalData.calculationsByOrderType?.MISCELLANEOUS ? finalData.calculationsByOrderType?.MISCELLANEOUS.map(misc => [
                            { text: `${misc?.text || ''}`, margin: [0, 2] },
                            { text: `£${misc.amount}`, margin: [0, 2] }
                        ])
                            : []
                        ),
                        ...(validItem.length > 0 ? validItem.map(item => [
                            { text: `${item.itemName}, ${item.totalQuantity} Qty (Remaining £${item.balanceAmount})`, margin: [0, 2] },
                            { text: `£${item.deductableAmount}`, margin: [0, 2] }
                        ])
                            : [])
                    ],
                },
                margin: [0, 5, 0, 30],
            },

            {
                margin: [0, 70, 0, 10],
                table: {
                    widths: ['60%', '29%', 'auto'],
                    heights: [20, 20, 20],
                    body: [
                        [
                            {},
                            { text: 'Subtotal:', style: 'subheader', alignment: 'left' },
                            { text: `£${totalSubTotal_item?.toFixed(2)}`, style: 'textNormal', alignment: 'left' },
                        ],
                        [
                            {},
                            { text: 'VAT:', style: 'subheader', alignment: 'left' },
                            { text: `£${taxAmount_item?.toFixed(2)}`, style: 'textNormal', alignment: 'left' },
                        ],
                        [
                            {},
                            { text: 'Total Inc. VAT:', style: 'subheader', alignment: 'left' },
                            { text: `£${totalWithTax_item?.toFixed(2)}`, style: 'textNormal', alignment: 'left' },
                        ],
                    ],
                },
                layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                },
            },
            {
                text: `You don’t need to do anything, this will automatically be deducted in your Swishr Account statement.\n\n128 City Road, London, EC1V 2NX`,
                alignment: 'center',
                fontSize: 10,
                absolutePosition: { x: 0, y: 760 }, // Adjust y position as needed (bottom of the page)
                width: '100%', // Full width
                bold: true
            },

            {
                text: '', // Empty text to create space for page break
                pageBreak: 'before', // This will force the next content to start on a new page
            },

            // Second Page
            {
                image: `data:image/png;base64,${logoImage}`,
                width: 125,
                alignment: 'right',
            },
            { text: `Period: ${moment(fromDate).format('Do MMMM YYYY')} - ${moment(toDate).format('Do MMMM YYYY')}`, style: 'header', alignment: 'right' },
            { text: `Account Ref: ${merchantAccountRef}`, style: 'header', alignment: 'right', margin: [0, 0] },
            { text: "Summary", style: 'header', alignment: 'center', margin: [0, 30, 0, 20] },

            {
                table: {
                    widths: ["60%", "40%"],
                    body: [
                        [{ text: "Total Orders", style: 'tableHeader', margin: [0, 2] }, { text: totalOrdersCount, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: "Delivery Orders", style: 'tableHeader', margin: [0, 2] }, { text: deliveryOrderCount, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: "Collection Orders", style: 'tableHeader', margin: [0, 2] }, { text: collectionOrderCount, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: `${cardPaymentCount} Card Payments`, style: 'tableHeader', margin: [0, 2] }, { text: `£${cardPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: `${cashPaymentCount} Cash Payments (Including Service & Delivery Charges)`, style: 'tableHeader', margin: [0, 2] }, { text: `£${cashPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],

                        ...(isInHouseType && deliveryChargeInHouse
                            ? [
                                [{ text: `Own delivery charges (${deliveryChargeInHouse?.totalOrders || 0} orders)`, style: 'tableHeader', margin: [0, 2] }, { text: `£${deliveryChargeInHouse?.amount || 0}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                            ]
                            : []),
                        ...(isInHouseType && driverTipInHouse
                            ? [
                                [{ text: `Driver tip paid (${driverTipInHouse?.totalOrders || 0} orders)`, style: 'tableHeader', margin: [0, 2] }, { text: `£${driverTipInHouse?.amount || 0}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                            ]
                            : []),

                        ...(finalData?.totalRefundAmount && finalData?.totalRefundAmount > 0
                            ? [
                                [{ text: `Refunds`, style: 'tableHeader', margin: [0, 2] }, { text: `£${finalData?.totalRefundAmount}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                            ]
                            : []),
                        [{ text: "Total Sales", style: 'tableHeader', margin: [0, 2] }, { text: `£${totalSales?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 2] }],
                        [{ text: `Total To Be Paid This Week After All Deductions\n\n £${totalToBePaid?.toFixed(2)}`, style: 'tableHeader', margin: [0, 2] }, { text: `£${bankTransfer?.toFixed(2)} will be paid via Bank Transfer\n\n £${cashPaymentAmount?.toFixed(2)} Paid via Cash Order Payments`, style: 'tableText', margin: [0, 2] }],
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return (rowIndex % 2 === 0) ? '#F1F1F1' : null;
                    }
                }
            },
            // Conditionally add the refund table if refundArray has data
            ...(finalData?.refundArray && finalData?.refundArray.length > 0
                ? [
                    { text: "Refund Summary", style: 'header', alignment: 'center', margin: [0, 30, 0, 20] },
                    {
                        table: {
                            widths: ["20%", "30%", "20%", "30%"],
                            body: [
                                [{ text: "order Id", style: 'tableHeader', margin: [0, 2] }, { text: "Order Date", style: 'tableHeader', margin: [0, 2] }, { text: "Refund Amount", style: 'tableHeader', margin: [0, 2] }, { text: "Invoice Id(if already billed)", style: 'tableHeader', margin: [0, 2] }],
                                ...finalData.refundArray.map(refund => [
                                    { text: refund.orderId, style: 'tableText', margin: [0, 2] },
                                    { text: moment.tz(refund.orderDate, timeZone).format('Do MMMM YYYY'), style: 'tableText', margin: [0, 2] },
                                    { text: `£${refund.refundAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 2] },
                                    { text: `${refund.invoiceId && refund.invoiceId !== invoiceId ? `${refund.invoiceId}\n(${moment.tz(refund.invoiceDate, timeZone).format('Do MMMM YYYY')})` : 'N/A'}`, style: 'tableText', alignment: 'right', margin: [0, 2] },
                                ])
                            ]
                        },

                        layout: {
                            fillColor: function (rowIndex, node, columnIndex) {
                                return (rowIndex % 2 === 0) ? '#F9F9F9' : null;
                            }
                        }
                    },
                    {
                        margin: [0, 10],
                        table: {
                            widths: ["60%", "40%"],
                            body: [
                                [{ text: "Total Refund", style: 'tableHeader', margin: [0, 3] }, { text: `-£${finalData?.totalRefundAmount}`, style: 'tableText', alignment: 'right', margin: [0, 3] }]
                            ]
                        },
                        layout: {
                            fillColor: function (rowIndex, node, columnIndex) {
                                return "#F1F1F1";
                            }
                        }
                    },
                ]
                : []),

            {
                text: '', // Empty text to create space for page break
                pageBreak: 'before', // This will force the next content to start on a new page
            },

            //Third Page
            {
                image: `data:image/png;base64,${logoImage}`,
                width: 125,
                alignment: 'right',
            },
            { text: `Period: ${moment(fromDate).format('Do MMMM YYYY')} - ${moment(toDate).format('Do MMMM YYYY')}`, style: 'header', alignment: 'right' },
            { text: `Account Ref: ${merchantAccountRef}`, style: 'header', alignment: 'right', margin: [0, 0] },
            { text: "Account Statement", style: 'header', alignment: 'center', margin: [0, 30, 0, 5] },
            {
                margin: [0, 20],
                table: {
                    widths: ["60%", "40%"],
                    body: [
                        [{ text: "Account Balance", style: 'tableHeader', margin: [0, 3] }, { text: `-£${closingBalance.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }],
                        ...(validItem.length > 0 ? validItem.map(item => {
                            const amt = item.balanceAmount - item.deductableAmount - Number(item.tax)
                            return [
                                { text: `${item.itemName} (Remaining Amount)`, style: 'tableHeader', margin: [0, 3] },
                                { text: `-£${amt?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                            ]
                        })
                            : [])
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "#F1F1F1";
                    }
                }
            },

            {
                margin: [0, 20],
                table: {
                    headerRows: 1,
                    widths: ["25%", "50%", "25%"],
                    body: [
                        [
                            { text: 'Date', bold: true, style: 'subheader', margin: [0, 3] },
                            { text: 'Description', bold: true, style: 'subheader', margin: [0, 3] },
                            { text: 'Amount', bold: true, style: 'subheader', margin: [0, 3] },
                        ],
                        [
                            { text: `${moment(fromDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: 'Opening Balance', style: 'tableText', margin: [0, 3] },
                            { text: `-£${openingBalance?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        [
                            { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: 'Cash Order Payments Received', style: 'tableText', margin: [0, 3] },
                            { text: `£${cashPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        [
                            { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: 'Cash Orders Paid to Merchant', style: 'tableText', margin: [0, 3] },
                            { text: `-£${cashPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        ...(cardPaymentAmount > 0
                            ? [
                                [
                                    { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                                    { text: 'Card Order Payments Received', style: 'tableText', margin: [0, 3] },
                                    { text: `£${cardPaymentAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] },
                                ],
                            ]
                            : []),
                        ...(finalData?.refundArray && finalData?.refundArray.length > 0 ? [
                           [ { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: `Refund for missing poppadoms`, style: 'tableText', margin: [0, 3] },
                            { text: `-£${finalData?.totalRefundAmount}`, style: 'tableText', alignment: 'right', margin: [0, 3] }],
                        ] : []),
                        [
                            { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            { text: `INV - ${currentInvoiceCount}`, style: 'tableText', margin: [0, 3] },
                            { text: `-£${totalWithTax_item?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                        ],
                        ...(remainingAmount > 0
                            ? [
                                [
                                    { text: `${moment(toDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                                    { text: 'Remaining Balance Transferred to Merchant', style: 'tableText', margin: [0, 3] },
                                    { text: `-£${remainingAmount?.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] },
                                ],
                            ]
                            : []),
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return (rowIndex % 2 === 0) ? '#F1F1F1' : null;
                    }
                }
            },

            {
                margin: [0, 20],
                table: {
                    widths: ["60%", "40%"],
                    body: [
                        [{ text: "Closing Balance", style: 'tableHeader', margin: [0, 3] }, { text: `-£${closingBalance.toFixed(2)}`, style: 'tableText', alignment: 'right', margin: [0, 3] }]
                    ]
                },
                layout: {
                    fillColor: function (rowIndex, node, columnIndex) {
                        return "#F1F1F1";
                    }
                }
            }

        ],
        styles: {
            header: { fontSize: 16, bold: true, margin: [0, 10] },
            subheader: { fontSize: 14, bold: true, margin: [0, 2] },
            textNormal: { fontSize: 14, margin: [0, 2] },
            tableHeader: { fontSize: 12, bold: true },
            tableText: { fontSize: 12 },
        },
        defaultStyle: {
            columnGap: 20
        },
        footer: (currentPage, pageCount) => {
            return {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: 'center',
                fontSize: 10,
                margin: [0],
            };
        },

    };

    let merchantItemIds = !isEditInvoice ? [] : finalData?.merchantItemIds || [];
    if (validItem.length > 0) {
        const updates = [];
        for (const item of validItem) {
            const itemData = await MerchantItemsModal.findOne({ itemId: item.itemId });
            if (itemData) {
                const amt = item.deductableAmount + item.tax;
                if (!isEditInvoice) {
                    itemData.transactions.push({
                        date: moment.tz(timeZone).toDate(),
                        amount: Number(amt.toFixed(2)),
                        isPaid: false,
                        invoiceId: invoiceId,
                    });
                    merchantItemIds.push(item.itemId);
                }
                else {
                    const transactionIndex = itemData.transactions.findIndex((transaction) => transaction.invoiceId === invoiceId);
                    if (transactionIndex !== -1) {
                        itemData.transactions[transactionIndex].amount = Number(amt.toFixed(2));
                        itemData.transactions[transactionIndex].date = moment.tz(timeZone).toDate();
                    }
                }

                updates.push(itemData.save());
            }
        }
        await Promise.all(updates);
    }

    // Generate PDF and save it
    const pdfDoc = pdfMake.createPdf(docDefinition);
    return new Promise((resolve, reject) => {
        pdfDoc.getBuffer(async (buffer) => {
            const pdfUrl = await uploadPdfBuffer(buffer, fileName);
            resolve({
                pdfUrl: pdfUrl,
                invoiceParameters: {
                    totalSales: totalSales,
                    totalOrdersCount: totalOrdersCount || 0,
                    deliveryOrderCount: deliveryOrderCount || 0,
                    collectionOrderCount: collectionOrderCount || 0,
                    cardPaymentCount: cardPaymentCount || 0,
                    cashPaymentCount: cashPaymentCount || 0,
                    cardPaymentAmount: Number(cardPaymentAmount?.toFixed(2)) || 0,
                    cashPaymentAmount: Number(cashPaymentAmount?.toFixed(2)) || 0,
                    deliveryOrderValue: finalData?.calculationsByOrderType?.DELIVERY?.totalOrderValue || 0,
                    collectionOrderValue: finalData?.calculationsByOrderType?.COLLECTION?.totalOrderValue || 0,
                    calculationsByOrderType: finalData.calculationsByOrderType,
                    totalSubTotal: Number(totalSubTotal_item?.toFixed(2)),
                    taxAmount: Number(taxAmount_item?.toFixed(2)),
                    totalWithTax: Number(totalWithTax_item?.toFixed(2)),
                    closingBalance: Number(closingBalance.toFixed(2)),
                    validItem: validItem || [],
                    currentInvoiceCount: currentInvoiceCount,
                    cashPaymentAmount: Number(cashPaymentAmount?.toFixed(2)),
                    totalSales: Number(totalSales?.toFixed(2)),
                    openingBalance: Number(openingBalance?.toFixed(2)),
                    merchantItemIds: merchantItemIds,
                    invoiceDate: invoiceDate,
                    fileName: fileName,
                    bankTransfer: Number(bankTransfer?.toFixed(2)),
                    isInHouseType: isInHouseType,
                    deliveryChargeInHouse: deliveryChargeInHouse,
                    driverTipInHouse: driverTipInHouse,
                    refundArray: finalData?.refundArray || [],
                    totalRefundAmount: finalData?.totalRefundAmount || 0
                },
            });
        });
    });
};

const calculateInvoiceParametersManual = (invoiceParameters, invoiceCount) => {

    const { firstPageData, secondPageData, thirdPageData, totalSubTotal, tax_amount, totalWithTax, openingBalance, closingBalance } = invoiceParameters;

    const finalData = {
        firstPageData: firstPageData || [],
        secondPageData: secondPageData || [],
        thirdPageData: thirdPageData || [],
        totalSubTotal: totalSubTotal?.toFixed(2),
        tax_amount: tax_amount?.toFixed(2),
        totalWithTax: totalWithTax?.toFixed(2),
        openingBalance: openingBalance?.toFixed(2),
        currentInvoiceCount: invoiceCount,
        closingBalance: closingBalance?.toFixed(2)
    }
    return finalData
}

const createManualPDF = async (fileName, address, fromDate, toDate, invoiceDate, finalData, invoiceId) => {

    const logoImagePath = path.join(__dirname, './swishr_logo.jpg');
    const logoImage = fs.readFileSync(logoImagePath).toString('base64');
    const merchantAccountRef = `SWSH-0000-${String(finalData?.currentInvoiceCount).padStart(4, '0')}`;

    const docDefinition = {
        content: [
            {
                image: `data:image/png;base64,${logoImage}`,
                width: 125,
                alignment: 'right',
            },
            { text: `Invoice no. ${invoiceId}`, style: 'header', alignment: 'right' },

            {
                table: {
                    widths: ['*', 'auto'], 
                    body: [
                        [
                            {
                                stack: [
                                    address?.name ? { text: `${address.name}`, style: 'subheader', alignment: 'left' } : null,
                                    address?.line1 ? { text: `${address.line1}`, style: 'subheader', alignment: 'left' } : null,
                                    address?.line2 ? { text: `${address.line2}`, style: 'subheader', alignment: 'left' } : null,
                                    address?.area ? { text: `${address.area}`, style: 'subheader', alignment: 'left' } : null,
                                    address?.post ? { text: `${address.post}`, style: 'subheader', alignment: 'left' } : null,
                                    address?.country ? { text: `${address.country}`, style: 'subheader', alignment: 'left' } : null,
                                ].filter(item => item !== null), // Remove null values from the array
                            },
                            // Swishr Details (Right Side)
                            {
                                stack: [
                                    { text: `Swishr`, style: 'subheader', alignment: 'right' },
                                    { text: `128 City Road`, style: 'subheader', alignment: 'right' },
                                    { text: `London`, style: 'subheader', alignment: 'right' },
                                    { text: `EC1V 2NX`, style: 'subheader', alignment: 'right' },
                                    { text: `VAT Number: 467 7930 40`, style: 'subheader', alignment: 'right' },
                                    { text: `Tel: 0207 046 1829`, style: 'subheader', alignment: 'right' },
                                    { text: `e-Mail: Restaurants@Swishr.co.uk`, style: 'subheader', alignment: 'right', link: 'mailto: restaurants@Swishr.co.uk' },
                                ],
                            },
                        ],
                    ],
                },
                margin: [0, 5],
                layout: 'noBorders', // Optional: Remove borders for a cleaner look
            },

            { text: `Invoice date: ${moment.tz(invoiceDate, timeZone).format('Do MMMM YYYY')}`, style: 'subheader', alignment: 'right', margin: [0, 5, 0, 20] },

            { text: `Period: ${moment.tz(fromDate, timeZone).format('Do MMMM YYYY')} - ${moment.tz(toDate, timeZone).format('Do MMMM YYYY')}\n\n`, style: 'subheader', alignment: 'left', margin: [0, 10, 0, 0] },

            // FIRST PAGE DATA
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: 'Description', bold: true, style: 'subheader', },
                            { text: 'Amount', bold: true, style: 'subheader', },
                        ],

                        ...(finalData.firstPageData ? finalData.firstPageData.map(misc => [
                            { text: `${misc?.text || ''}`, margin: [0, 2] },
                            { text: `£${misc.amount}`, margin: [0, 2] }
                        ])
                            : []
                        )
                    ],
                },
                margin: [0, 5, 0, 20],
            },

            {
                margin: [0, 20, 0, 20],
                table: {
                    widths: ['60%', '29%', 'auto'],
                    heights: [20, 20, 20],
                    body: [
                        [
                            {},
                            { text: 'Subtotal:', style: 'subheader', alignment: 'left' },
                            { text: `£${finalData?.totalSubTotal}`, style: 'textNormal', alignment: 'left' },
                        ],
                        [
                            {},
                            { text: 'VAT:', style: 'subheader', alignment: 'left' },
                            { text: `£${finalData?.tax_amount}`, style: 'textNormal', alignment: 'left' },
                        ],
                        [
                            {},
                            { text: 'Total Inc. VAT:', style: 'subheader', alignment: 'left' },
                            { text: `£${finalData?.totalWithTax}`, style: 'textNormal', alignment: 'left' },
                        ],
                    ],
                },
                layout: {
                    hLineWidth: () => 0,
                    vLineWidth: () => 0,
                },
            },
            {text: "Please transfer payment to the following details to clear the balance", style: 'subheader', alignment: 'right'},
            {text: "", style: "subheader"},
            {text: "", style: "subheader"},
            {text: "Account Name: Swishr LTD", style: 'subheader', alignment: 'right'},
            {text: "Sort Code: 01-07-02", style: 'subheader', alignment: 'right'},
            {text: "Account Number: 56616910", style: 'subheader', alignment: 'right'},
            {text: "Payment Ref: Use Invoice Number", style: 'subheader', alignment: 'right'},
            {
                text: `128 City Road, London, EC1V 2NX`,
                alignment: 'center',
                fontSize: 10,
                absolutePosition: { x: 25, y: 780 }, // Adjust y position as needed (bottom of the page)
                width: '100%', // Full width
                bold: true,
                margin: [0]
            },

             // Second Page
            
            ...(finalData?.secondPageData && finalData.secondPageData.length > 0
                ? [
                    {
                        text: '', // Empty text to create space for page break
                        pageBreak: 'before', // This will force the next content to start on a new page
                    },
        
                    {
                        image: `data:image/png;base64,${logoImage}`,
                        width: 125,
                        alignment: 'right',
                    },
                    { text: `Period: ${moment(fromDate).format('Do MMMM YYYY')} - ${moment(toDate).format('Do MMMM YYYY')}`, style: 'header', alignment: 'right' },
                    { text: `Account Ref: ${merchantAccountRef}`, style: 'header', alignment: 'right', margin: [0, 0] },
                    { text: "Summary", style: 'header', alignment: 'center', margin: [0, 30, 0, 20] },
        
                    {
                        table: {
                            widths: ["60%", "40%"],
                            body: [
                                ...(finalData?.secondPageData ? finalData.secondPageData.map(misc => [{ text: misc.text, style: 'tableHeader', margin: [0, 2] }, { text: misc.amount, style: 'tableText', alignment: 'right', margin: [0, 2] }])
                                    : []
                                )
                            ]
                        },
                        layout: {
                            fillColor: function (rowIndex, node, columnIndex) {
                                return (rowIndex % 2 === 0) ? '#F1F1F1' : null;
                            }
                        }
                    },
                    
                ]
                : []),

            //Third Page
            ...(finalData?.thirdPageData && finalData.thirdPageData.length > 0 ? [

                {
                    text: '', // Empty text to create space for page break
                    pageBreak: 'before', // This will force the next content to start on a new page
                },
                {
                    image: `data:image/png;base64,${logoImage}`,
                    width: 125,
                    alignment: 'right',
                },
                { text: `Period: ${moment(fromDate).format('Do MMMM YYYY')} - ${moment(toDate).format('Do MMMM YYYY')}`, style: 'header', alignment: 'right' },
                { text: `Account Ref: ${merchantAccountRef}`, style: 'header', alignment: 'right', margin: [0, 0] },
                { text: "Account Statement", style: 'header', alignment: 'center', margin: [0, 30, 0, 5] },
                // {
                //     margin: [0, 20],
                //     table: {
                //         widths: ["60%", "40%"],
                //         body: [
                //             [{ text: "Account Balance", style: 'tableHeader', margin: [0, 3] }, { text: `-£${finalData?.closingBalance}`, style: 'tableText', alignment: 'right', margin: [0, 3] }],
                //         ]
                //     },
                //     layout: {
                //         fillColor: function (rowIndex, node, columnIndex) {
                //             return "#F1F1F1";
                //         }
                //     }
                // },
    
                {
                    margin: [0, 20],
                    table: {
                        headerRows: 1,
                        widths: ["25%", "50%", "25%"],
                        body: [
                            [
                                { text: 'Date', bold: true, style: 'subheader', margin: [0, 3] },
                                { text: 'Description', bold: true, style: 'subheader', margin: [0, 3] },
                                { text: 'Amount', bold: true, style: 'subheader', margin: [0, 3] },
                            ],
                            // [
                            //     { text: `${moment(fromDate).format('Do MMMM YYYY')}`, style: 'tableText', margin: [0, 3] },
                            //     { text: 'Opening Balance', style: 'tableText', margin: [0, 3] },
                            //     { text: `-£${finalData?.openingBalance}`, style: 'tableText', alignment: 'right', margin: [0, 3] }
                            // ],
                            ...(finalData?.thirdPageData.length > 0 ? finalData.thirdPageData.map(misc => [
                                { text: misc.date, style: 'tableText', margin: [0, 3] },
                                { text: misc.description, style: 'tableText', margin: [0, 3] },
                                { text: misc.amount, style: 'tableText', alignment: 'right', margin: [0, 3] }
                            ]) : [])
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex % 2 === 0) ? '#F1F1F1' : null;
                        }
                    }
                },
    
                // {
                //     margin: [0, 20],
                //     table: {
                //         widths: ["60%", "40%"],
                //         body: [
                //             [{ text: "Closing Balance", style: 'tableHeader', margin: [0, 3] }, { text: `-£${finalData?.closingBalance}`, style: 'tableText', alignment: 'right', margin: [0, 3] }]
                //         ]
                //     },
                //     layout: {
                //         fillColor: function (rowIndex, node, columnIndex) {
                //             return "#F1F1F1";
                //         }
                //     }
                // }

            ] : []),
            

        ],
        styles: {
            header: { fontSize: 16, bold: true, margin: [0, 10] },
            subheader: { fontSize: 14, bold: true, margin: [0, 2] },
            textNormal: { fontSize: 14, margin: [0, 2] },
            tableHeader: { fontSize: 12, bold: true },
            tableText: { fontSize: 12 },
        },
        defaultStyle: {
            columnGap: 20
        },
        footer: (currentPage, pageCount) => {
            return {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: 'center',
                fontSize: 10,
                margin: [0],
            };
        },

    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    return new Promise((resolve, reject) => {
        pdfDoc.getBuffer(async (buffer) => {
            const pdfUrl = await uploadPdfBuffer(buffer, fileName);
            resolve({
                pdfUrl: pdfUrl,
                newInvoiceParameters: {
                    firstPageData: finalData?.firstPageData || [],
                    secondPageData: finalData?.secondPageData || [],
                    thirdPageData: finalData?.thirdPageData || [],
                    totalSubTotal: Number(finalData?.totalSubTotal),
                    tax_amount: Number(finalData?.tax_amount),
                    totalWithTax: Number(finalData?.totalWithTax),
                    closingBalance: Number(finalData?.closingBalance),
                    currentInvoiceCount: finalData?.currentInvoiceCount,
                    openingBalance: Number(finalData?.openingBalance),
                    invoiceDate: invoiceDate,
                    fileName: fileName,
                    customerAddress: address
                },
            });
        });
    });
};

module.exports = { generateInvoiceId, calculateInvoiceParameters, calculateOrderValues, getFinalDataForEditInvoice, createPDF, calculateInvoiceParametersManual, createManualPDF };
