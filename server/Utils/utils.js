const IdGenerator = require('../Models/idGenerator');
const EmailLog = require('../Models/emailLogs');
const MerchantModal = require('../Models/merchant');
const OrderModal = require('../Models/order');
const moment = require('moment-timezone');
const merchant = require('../Models/merchant');
const timeZone = 'Europe/London';

const getNextId = async (name, start = 1) => {
  const counter = await IdGenerator.findOneAndUpdate(
    { name },                            // Find the counter by name (e.g., "customerId")
    { $inc: { seq: 1 } },                // Increment the sequence
    { new: true, upsert: true }          // Create the counter if it doesn't exist
  );

  // If the counter was newly created, initialize the sequence to the start value
  if (counter.seq < start) {
    counter.seq = start;
    await counter.save();
  }

  return counter.seq;
};

const updateEmailLog = async (logId, updates) => {
  await EmailLog.findByIdAndUpdate(logId, {
    ...updates,
    updatedAt: moment.tz(timeZone).toDate()
  });
};

const calculateNewOrderValue = (order, merchantDetails) => {

  if (!order || !merchantDetails || !order.subTotal) return 0;

  let orderValue = order.subTotal;

  // Deduct order discount first (common for all types)
  if (order.orderDiscount) {
    orderValue -= order.orderDiscount;
  }
  if (order.promoDiscountMerchant) {
    orderValue -= order.promoDiscountMerchant;
  }
  // if (order.promoDiscountSwishr) {
  //   orderValue -= order.promoDiscountSwishr;
  // }

  if (merchantDetails.serviceFeeApplicable && order.serviceFee) {
    orderValue += order.serviceFee;
  } else if (!merchantDetails.serviceFeeApplicable && order.paymentType?.toUpperCase() === 'CASH' && order.serviceFee) {
    orderValue += order.serviceFee;
  }

  if (merchantDetails.isInHouseType && order.deliveryCharge) {
    orderValue += order.deliveryCharge;
  } else if (!merchantDetails.isInHouseType && merchantDetails.deliveryChargeApplicable && order.deliveryCharge) {
    orderValue += order.deliveryCharge;
  }
  const calculatedValue = Number(parseFloat(orderValue)?.toFixed(2));

  return calculatedValue;

};

const calculateNewNetCommission = (order, merchantDetails) => {

  if (!order || !merchantDetails || !order.subTotal) return 0;

  let netSubTotal = order.subTotal;
  let commissionRate = 0;

  if (order.orderDiscount) {
    netSubTotal -= order.orderDiscount;
  }
  if (order.promoDiscountMerchant) {
    netSubTotal -= order.promoDiscountMerchant;
  }
  // if (order.promoDiscountSwishr) {
  //   netSubTotal -= order.promoDiscountSwishr;
  // }

  // if (merchantDetails.isInHouseType && order.deliveryCharge) {
  //   netSubTotal += order.deliveryCharge;
  // } else 
  if (!merchantDetails.isInHouseType && merchantDetails.deliveryChargeApplicable && order.deliveryCharge) {
    netSubTotal += order.deliveryCharge;
  }

  if (order.orderType.toLowerCase() === 'delivery') {
    commissionRate = merchantDetails.deliveryOrdersComission
  } else if (order.orderType.toLowerCase() === 'collection') {
    commissionRate = merchantDetails.collectionOrdersComission
  }


  const commission = (netSubTotal * commissionRate) / 100
  const calculatedValue = Number(parseFloat(commission).toFixed(2)) || 0;

  return calculatedValue;

};

const calculateNewServiceFeeCommission = (order, merchantDetails) => {

  if (!order || !merchantDetails || !order.serviceFee) return 0;

  let serviceFee = 0;

  if (merchantDetails.serviceFeeApplicable && order.serviceFee) {
    serviceFee = order.serviceFee
  } else if (!merchantDetails.serviceFeeApplicable && order.paymentType.toUpperCase() === 'CASH' && order.serviceFee) {
    serviceFee = order.serviceFee
  } else if (!merchantDetails.serviceFeeApplicable && order.paymentType.toUpperCase() === 'CARD' && order.serviceFee) {
    serviceFee = (order.serviceFee) / 1.2
  }

  const netService = Number(parseFloat(serviceFee).toFixed(2)) || 0;

  return netService;

}

const calculateNewDeliveryFeeCommission = (order, merchantDetails) => {

  if (!order || !merchantDetails || !order.deliveryCharge) return 0;

  let deliveryFee = 0;

  if (merchantDetails.isInHouseType && order.deliveryCharge) {
      deliveryFee += order.deliveryCharge;
      deliveryFee = (deliveryFee * merchantDetails.deliveryOrdersComission)/100;
  }
  else {
    if (!merchantDetails.isInHouseType && merchantDetails.deliveryChargeApplicable && order.deliveryCharge) {
      deliveryFee = order.deliveryCharge

    } else if (!merchantDetails.isInHouseType && !merchantDetails.deliveryChargeApplicable && order.paymentType.toUpperCase() === 'CASH' && order.deliveryCharge) {
      deliveryFee = order.deliveryCharge
    } else if (!merchantDetails.isInHouseType && !merchantDetails.deliveryChargeApplicable && order.paymentType.toUpperCase() === 'CARD' && order.deliveryCharge) {
      deliveryFee = (order.deliveryCharge) / 1.2
    }
  }

  const netDeliveryFee = Number(parseFloat(deliveryFee).toFixed(2)) || 0;

  return netDeliveryFee;
}

module.exports = { getNextId, updateEmailLog, calculateNewOrderValue, calculateNewNetCommission, calculateNewServiceFeeCommission, calculateNewDeliveryFeeCommission };
