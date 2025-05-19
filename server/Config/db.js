const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const InvoiceModal = require('../Models/invoice');
const MerchantModal = require('../Models/merchant');
const CustomerModal = require('../Models/customer');
const OrderModal = require('../Models/order');
const User = require('../Models/user');
const RefundModal = require('../Models/refunds');
const { calculateNewOrderValue, calculateNewNetCommission, calculateNewServiceFeeCommission, calculateNewDeliveryFeeCommission } = require('../Utils/utils');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected:`);
    // await updateDb();
   // await updateOrderValue();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Function to update the rating field for all merchants
const updateDb = async () => {
  try {

    //const res = await RefundModal.collection.getIndexes();

    // const newPassword = '12345';  
    // const newpass =await bcrypt.hash(newPassword, 10);
    // const result = await User.updateOne({email: "test@test.com"}, { $set: { userName: "Super Admin" } });
    const result = await OrderModal.updateMany({}, {
      $set: {
        isOrderUpdated: false
      }
    });
    console.log(`All updated with.`, result.modifiedCount);
  } catch (error) {
    console.error(`Error updating invoice: ${error.message}`);
  }
};

const updateOrderValue = async () => {
  try {
    const results = await OrderModal.find();

    const uniqueMerchantIds = Array.from(new Set(
      results.map(order => [order.merchantId, Number(order.merchantId)]).flat()
    ));  
    const merchants = await MerchantModal.find({
      merchantId: { $in: uniqueMerchantIds }
    });

    for (const order of results) {
      const merchant = merchants.find(m =>
        m.merchantId.toString() === order.merchantId.toString() ||
        m.merchantId === Number(order.merchantId)
      );

      if (merchant) {
        // const newOrderValue = calculateNewOrderValue(order, merchant);
        // const netCommission = calculateNewNetCommission(order, merchant);
        // const netServiceFee = calculateNewServiceFeeCommission(order, merchant);
        // const netDeliveryCharge = calculateNewDeliveryFeeCommission(order, merchant);

        // console.log("newOrderValue", newOrderValue);
        // console.log("netCommission", netCommission);
        // console.log("netServiceFee", netServiceFee);
        // console.log("netDeliveryCharge", netDeliveryCharge);
        await OrderModal.updateOne(
          { _id: order._id },
          {
            $set: {
              // newOrderValue: newOrderValue,
              // netCommission: netCommission,
              // netServiceFee: netServiceFee,
              // netDeliveryCharge: netDeliveryCharge,
              merchantDetails: {isInHouseType: merchant.isInHouseType, deliveryOrdersComission: merchant.deliveryOrdersComission, collectionOrdersComission: merchant.collectionOrdersComission, serviceFeeApplicable: merchant.serviceFeeApplicable, deliveryChargeApplicable: merchant.deliveryChargeApplicable}
            }
          }
        );
      }
    }

    console.log(`All orders updated successfully`, results?.length);
  } catch (error) {
    console.error(`Error updating orders:`, error);
  }
};

module.exports = connectDB;
