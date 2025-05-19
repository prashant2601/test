const { uploadPdfBuffer, uploadBase64Image, deleteBlob } = require("../azureBlobHelper.js");
const ExpenseData = require("../Models/expense_data.js");
const ExpenseCategory = require("../Models/expense_category.js");
const ExpenseType = require("../Models/expense_type.js");
const ExpenseStore = require("../Models/expense_store.js");

const moment = require('moment-timezone');
const timeZone = 'Europe/London';
const { getNextId } = require("../Utils/utils.js");

exports.UploadExpenseData = async (req, res) => {

    try {

        const { receiptDate, storeName, expenseType, spentBy, claimableVAT, totalAmount, receiptItems, paidStatus, paymentDetails } = req.body;

        // if (!req.files || req.files.length === 0) {
        //     return res.status(400).json({ error: 'No receipt uploaded', success: false });
        // }
        if (!receiptDate || !storeName || !expenseType || !spentBy) {
            return res.status(400).json({ error: 'Missing required fields', success: false });
        }

        const receiptId = await getNextId('expenseReceipt');

        const receiptLink = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileName = `Expense_Receipt_${storeName}_${receiptId}_${file.originalname}`;
                const link = await uploadPdfBuffer(file.buffer, fileName, 'expenseReceipt');
                receiptLink.push(link);
            }
        }

         const parsedReceiptDate = moment.tz(receiptDate, timeZone).toDate();

        // const parsedReceiptDate = moment.tz(JSON.parse(receiptDate), timeZone).toDate();

        const newExpenseReceipt = new ExpenseData({
            receiptId,
            receiptDate: parsedReceiptDate,
            storeName,
            receiptLink,
            receiptItems: receiptItems ? JSON.parse(receiptItems) : [],
            expenseType,
            spentBy,
            claimableVAT,
            totalAmount,
            paidStatus,
            paymentDetails: paymentDetails ? JSON.parse(paymentDetails) : [],
            // paymentType,
            // paymentDate: moment.tz(paymentDate, timeZone).toDate(),
            // cardType: cardType || '',
            // paymentFrom: paymentFrom ? JSON.parse(paymentFrom) : { CARD: 0, CASH: 0 },

        });
        await newExpenseReceipt.save();
        res.status(200).json({ message: "Expense receipt uploaded successfully", success: true });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

};

exports.GetExpenseData = async (req, res) => {
    try {
        const { receiptId, storeName, spentBy, expenseType, startDate, endDate, paidStatus, sort, pageNo = 1, limit = 10, } = req.query;

        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;

        const matchStage = {};

        if (receiptId) matchStage.receiptId = { $in: receiptId.split(',').map(id => parseInt(id.trim(), 10)) };
        if (storeName) matchStage.storeName = { $regex: storeName, $options: 'i' };
        if (spentBy) matchStage.spentBy = { $in: spentBy.split(',').map(name => name.trim()) };
        if (expenseType) matchStage.expenseType = { $in: expenseType.split(',').map(type => type.trim()) };
        if (paidStatus) matchStage.paidStatus = { $in: paidStatus.split(',').map(status => status.trim()) };
        
        if (startDate) {
            const start = moment.tz(startDate, timeZone).toDate();
            let end;

            if (!endDate) {
                end = moment.tz(new Date(), timeZone).endOf('day').toDate();
            } else {
                end = moment.tz(endDate, timeZone).toDate();
            }

            matchStage.receiptDate = {
                $gte: start,
                $lte: end
            };
        }

        const sortStage = {};
        sortStage.receiptDate = -1;
        if (sort === 'asc') {
            sortStage.receiptDate = 1;
        } else if (sort === 'desc') {
            sortStage.receiptDate = -1;
        }

        const totalAggregation = await ExpenseData.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
                    claimableVAT: { $sum: { $ifNull: ["$claimableVAT", 0] } },
                }
            }
        ]);

        const totalAmount = totalAggregation.length ? totalAggregation[0].totalAmount : 0;

        const totalClaimableVAT = totalAggregation.length ? totalAggregation[0].claimableVAT : 0;


        const pipeline = [
            { $match: matchStage },
            ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
            { $skip: (page - 1) * limitValue },
            { $limit: limitValue },
            {
                $project: {
                  _id: 0,
                  receiptId: 1,
                  receiptDate: 1,
                  receiptItems: 1,
                  receiptLink: 1,
                  storeName: 1,
                  expenseType: 1,
                  spentBy: 1,
                  claimableVAT: 1,
                  totalAmount: 1,
                  paidStatus: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  paymentDetails: {
                    $cond: [
                      { $gt: [{ $size: { $ifNull: ["$paymentDetails", []] } }, 0] },
                      "$paymentDetails",
                      []
                    ]
                  }
                }
              }
              
        ]

        const result = await ExpenseData.aggregate(pipeline);

        const totalCount = await ExpenseData.countDocuments(matchStage);

        const totalPages = Math.ceil(totalCount / limitValue);

        res.status(200).json({ expense: result, totalCount, totalPages, currentPage: page, totalAmount: Number(totalAmount.toFixed(2)), totalClaimableVAT: Number(totalClaimableVAT.toFixed(2)), success: true });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.EditExpenseData = async (req, res) => {

    try {
        const { receiptId, receiptDate, storeName, receiptItems, expenseType, spentBy, claimableVAT, totalAmount, paidStatus,  receiptLink, paymentDetails } = req.body;

        if (!receiptId) {
            return res.status(400).json({ message: "Receipt ID is required", success: false });
        }

        const existingReceipt = await ExpenseData.findOne({ receiptId: { $in: [Number(receiptId)] } });
        if (!existingReceipt) {
            return res.status(404).json({ message: "Receipt not found", success: false });
        }

        let newReceiptLink = receiptLink ? JSON.parse(receiptLink) : existingReceipt.receiptLink;
        if (req.files && req.files.length > 0) {
            const fileLink = [];
            for (const file of req.files) {
                const fileName = `Expense_Receipt_${storeName}_${receiptId}_${file.originalname}`;
                const link = await uploadPdfBuffer(file.buffer, fileName, 'expenseReceipt');
                fileLink.push(link);
            }

            newReceiptLink = [...newReceiptLink, ...fileLink];
        }

        const parsedReceiptDate = moment.tz(receiptDate, timeZone).toDate();
        // const parsedReceiptDate = moment.tz(JSON.parse(receiptDate), timeZone).toDate();

        const updatedReceipt = await ExpenseData.findOneAndUpdate(
            { receiptId },
            {
                receiptDate: receiptDate ? parsedReceiptDate : existingReceipt.receiptDate,
                storeName: storeName || existingReceipt.storeName,
                receiptItems: receiptItems ? JSON.parse(receiptItems) : existingReceipt.receiptItems,
                expenseType: expenseType || existingReceipt.expenseType,
                spentBy: spentBy || existingReceipt.spentBy,
                claimableVAT: claimableVAT || existingReceipt.claimableVAT,
                totalAmount: totalAmount || existingReceipt.totalAmount,
                paidStatus: paidStatus || existingReceipt.paidStatus,
                receiptLink: newReceiptLink,
                paymentDetails: paymentDetails ? JSON.parse(paymentDetails) : existingReceipt.paymentDetails,
                updatedAt: moment.tz(timeZone).toDate()
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Receipt updated successfully",
            success: true,
            receipt: updatedReceipt
        });

    } catch (error) {
        console.error("Error in editing expense:", error);
        res.status(500).json({
            message: "Failed to update receipt",
            error: error.message,
            success: false
        });
    }
};

exports.DeleteExpenseData = async (req, res) => {
    try {
        const { receiptIds } = req.query;

        if (!receiptIds) {
            return res.status(400).json({
                message: "Receipt IDs are required",
                success: false
            });
        }

        const ids = receiptIds.split(',').map(id => parseInt(id.trim(), 10));
        const receipts = await ExpenseData.find({ receiptId: { $in: ids } });

        if (!receipts.length) {
            return res.status(404).json({
                error: 'No expense records found',
                success: false,
            });
        }

        for (const receipt of receipts) {
            if (receipt.receiptLink && receipt.receiptLink.length > 0) {
                for (const fileUrl of receipt.receiptLink) {
                    await deleteBlob(fileUrl, 'expenseReceipt');
                }
            }
        }

        await ExpenseData.deleteMany({ receiptId: { $in: ids } });

        res.status(200).json({
            message: "Receipt(s) deleted successfully",
            success: true
        });

    } catch (error) {
        console.error("Error in deleting expense:", error);
        res.status(500).json({
            message: "Failed to delete receipt(s)",
            error: error.message,
            success: false
        });
    }
};


exports.AddExpenseCategory = async (req, res) => {
    try {

        const { categoryName } = req.body;

        if (!categoryName) return res.status(400).json({ message: "Category name is required", success: false });

        const categoryId = await getNextId('expenseCategory');

        const newExpenseCategory = new ExpenseCategory({ categoryId, categoryName });
        await newExpenseCategory.save();

        res.status(200).json({ message: "Expense category added successfully", success: true, category: newExpenseCategory });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.GetExpenseCategory = async (req, res) => {
    try {
        let { query, pageNo = 1, limit = 10 } = req.query;
        pageNo = parseInt(pageNo, 10);
        limit = parseInt(limit, 10);

        const searchQuery = query ? { categoryName: { $regex: query, $options: 'i' } } : {};

        const totalCount = await ExpenseCategory.countDocuments(searchQuery);
        const expenseCategory = await ExpenseCategory.find(searchQuery).select("categoryId categoryName").skip((pageNo - 1) * limit)
            .limit(limit).sort({ createdAt: -1 });

        if (!expenseCategory.length) {
            return res.status(201).json({
                message: 'No category found',
                success: false,
            });
        }

        res.status(200).json({
            message: "Expense category list",
            category: expenseCategory,
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNo,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.AddExpenseType = async (req, res) => {
    try {

        const { expenseTypeName } = req.body;

        if (!expenseTypeName) return res.status(400).json({ message: "Expense type name is required", success: false });

        const expenseTypeId = await getNextId('expenseType');

        const newExpenseType = new ExpenseType({ expenseTypeId, expenseTypeName });
        await newExpenseType.save();
        res.status(200).json({ message: "Expense category added successfully", success: true, expenseType: newExpenseType });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.GetExpenseType = async (req, res) => {
    try {
        let { query, pageNo = 1, limit = 10 } = req.query;
        pageNo = parseInt(pageNo, 10);
        limit = parseInt(limit, 10);

        const searchQuery = query ? { expenseTypeName: { $regex: query, $options: 'i' } } : {};

        const totalCount = await ExpenseType.countDocuments(searchQuery);
        const expenseType = await ExpenseType.find(searchQuery).skip((pageNo - 1) * limit)
            .limit(limit).sort({ createdAt: -1 });

        if (!expenseType.length) {
            return res.status(201).json({
                message: 'No expense type found',
                success: false,
            });
        }

        res.status(200).json({
            message: "Expense type list",
            expenseType: expenseType,
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNo,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.AddExpenseStore = async (req, res) => {
    try {

        const { storeName, storeAddress, storeProfileImg } = req.body;

        if (!storeName || !storeAddress) return res.status(400).json({ message: "Store name & address is required", success: false });

        const storeId = await getNextId('expenseStore');

        let imageUrl = '';
        if (storeProfileImg) {
            const matches = storeProfileImg.match(/^data:(image\/([^;]+));base64,(.+)$/);
            if (!matches) {
                // return res.status(400).json({ message: 'Invalid image format', success: false, errors: [] });
            }
            else {
                const imageType = matches[2]; // e.g., 'png', 'jpeg'
                const imgName = `ExpenseStore_${storeName}.${imageType}`;
                imageUrl = await uploadBase64Image(storeProfileImg, imgName);
            }
        }

        const newExpenseStore = new ExpenseStore({ storeId, storeName, storeAddress, storeProfileImg: imageUrl });
        await newExpenseStore.save();
        res.status(200).json({ message: "Expense store added successfully", success: true, expenseStore: newExpenseStore });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.GetExpenseStore = async (req, res) => {
    try {
        let { query, pageNo = 1, limit = 10 } = req.query;
        pageNo = parseInt(pageNo, 10);
        limit = parseInt(limit, 10);

        const searchQuery = query ? { storeName: { $regex: query, $options: 'i' } } : {};

        const totalCount = await ExpenseStore.countDocuments(searchQuery);
        const expenseStore = await ExpenseStore.find(searchQuery).select('storeId storeName storeAddress storeProfileImg').skip((pageNo - 1) * limit)
            .limit(limit).sort({ createdAt: -1 });

        if (!expenseStore.length) {
            return res.status(201).json({
                message: 'No expense store found',
                success: false,
            });
        }

        res.status(200).json({
            message: "Expense store list",
            expenseStore: expenseStore,
            success: true,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: pageNo,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

exports.EditExpenseCategory = async (req, res) => {
    try {

        const { categoryId, categoryName } = req.body;

        if (!categoryId || !categoryName) {
            return res.status(400).json({
                message: "Category ID and name are required",
                success: false
            });
        }

        const updatedCategory = await ExpenseCategory.findOneAndUpdate(
            { categoryId },
            { categoryName, updatedAt: moment.tz(timeZone).toDate() },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                message: "Category not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Category updated successfully",
            success: true,
            category: updatedCategory
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.DeleteExpenseCategory = async (req, res) => {
    try {
        const { categoryIds } = req.query;

        if (!categoryIds) {
            return res.status(400).json({
                message: "Category IDs are required",
                success: false
            });
        }

        const ids = categoryIds.split(',').map(id => parseInt(id.trim(), 10));
        const result = await ExpenseCategory.deleteMany({ categoryId: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "No categories found",
                success: false
            });
        }

        res.status(200).json({
            message: "Categories deleted successfully",
            success: true,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.EditExpenseType = async (req, res) => {
    try {
        const { expenseTypeId, expenseTypeName } = req.body;

        if (!expenseTypeId || !expenseTypeName) {
            return res.status(400).json({
                message: "Expense type ID and name are required",
                success: false
            });
        }

        const updatedType = await ExpenseType.findOneAndUpdate(
            { expenseTypeId },
            { expenseTypeName, updatedAt: moment.tz(timeZone).toDate() },
            { new: true, runValidators: true }
        );

        if (!updatedType) {
            return res.status(404).json({
                message: "Expense type not found",
                success: false
            });
        }

        res.status(200).json({
            message: "Expense type updated successfully",
            success: true,
            expenseType: updatedType
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.DeleteExpenseType = async (req, res) => {
    try {
        const { typeIds } = req.query;

        if (!typeIds) {
            return res.status(400).json({
                message: "Type IDs are required",
                success: false
            });
        }

        const ids = typeIds.split(',').map(id => parseInt(id.trim(), 10));
        const result = await ExpenseType.deleteMany({ expenseTypeId: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "No expense types found",
                success: false
            });
        }

        res.status(200).json({
            message: "Expense types deleted successfully",
            success: true,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.EditExpenseStore = async (req, res) => {
    try {
        const { storeId, storeName, storeAddress, storeProfileImg } = req.body;

        if (!storeId || !storeName || !storeAddress) {
            return res.status(400).json({
                message: "Store ID, name and address are required",
                success: false
            });
        }

        const existingStore = await ExpenseStore.findOne({ storeId });
        if (!existingStore) {
            return res.status(404).json({
                message: "Store not found",
                success: false
            });
        }

        let imageUrl = existingStore.storeProfileImg;
        if (storeProfileImg) {
            const matches = storeProfileImg.match(/^data:(image\/([^;]+));base64,(.+)$/);
            if (matches) {
                const imageType = matches[2];
                const imgName = `ExpenseStore_${storeName}.${imageType}`;
                imageUrl = await uploadBase64Image(storeProfileImg, imgName);

                // Delete old image if exists
                if (existingStore.storeProfileImg) {
                    await deleteBlob(existingStore.storeProfileImg);
                }
            }
        }

        const updatedStore = await ExpenseStore.findOneAndUpdate(
            { storeId },
            {
                storeName,
                storeAddress,
                storeProfileImg: imageUrl,
                updatedAt: moment.tz(timeZone).toDate()
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Store updated successfully",
            success: true,
            expenseStore: updatedStore
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.DeleteExpenseStore = async (req, res) => {
    try {
        const { storeIds } = req.query;

        if (!storeIds) {
            return res.status(400).json({
                message: "Store IDs are required",
                success: false
            });
        }

        const ids = storeIds.split(',').map(id => parseInt(id.trim(), 10));
        const stores = await ExpenseStore.find({ storeId: { $in: ids } });

        if (!stores.length) {
            return res.status(404).json({
                message: "No stores found",
                success: false
            });
        }

        // Delete store profile images from storage
        for (const store of stores) {
            if (store.storeProfileImg) {
                await deleteBlob(store.storeProfileImg);
            }
        }

        await ExpenseStore.deleteMany({ storeId: { $in: ids } });

        res.status(200).json({
            message: "Stores deleted successfully",
            success: true,
            deletedCount: stores.length
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.GetExpenseSummary = async (req, res) => {
    try {
        const { storeName, expenseTypeName, spendBy, categoryName, range, startDate, endDate } = req.query;

        if (!range && !(startDate && endDate)) {
            return res.status(400).json({
                success: false,
                message: "Either provide 'range' or both 'startDate' and 'endDate'"
            });
        }

        // Build match stage for filtering
        const matchStage = {};

        // Add filters based on provided parameters
        if (storeName) {
            matchStage.storeName = { $regex: storeName, $options: 'i' };
        }
        if (expenseTypeName) {
            matchStage.expenseType = expenseTypeName;
        }
        if (spendBy) {
            matchStage.spentBy = spendBy;
        }
        if (categoryName) {
            matchStage.receiptItems = {
                $elemMatch: { category: categoryName }
            };
        }

        const now = moment.tz(timeZone);
        
        if (range) {
            switch (range) {
                case 'thisWeek':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('week').toDate(),
                        $lte: now.clone().endOf('week').toDate()
                    };
                    break;
                case 'thisMonth':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('month').toDate(),
                        $lte: now.clone().endOf('month').toDate()
                    };
                    break;
                case 'thisYear':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('year').toDate(),
                        $lte: now.clone().endOf('year').toDate()
                    };
                    break;
                case 'allTime':
                    // No date filter needed
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid range value. Use 'thisWeek', 'thisMonth', 'thisYear', or 'allTime'"
                    });
            }
        } else {
            // Handle custom date range
            matchStage.receiptDate = {
                $gte: moment.tz(startDate, timeZone).startOf('day').toDate(),
                $lte: moment.tz(endDate, timeZone).endOf('day').toDate()
            };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $project: {
                    totalAmount: 1,
                    claimableVAT: { $ifNull: ["$claimableVAT", 0] },
                    cardPayments: {
                        $reduce: {
                            input: {
                                $filter: {
                                    input: { $ifNull: ["$paymentDetails", []] },
                                    as: "payment",
                                    cond: {
                                        $in: ["$$payment.paymentType", ["CARD", "BOTH"]]
                                    }
                                }
                            },
                            initialValue: 0,
                            in: {
                                $add: ["$$value", { $ifNull: ["$$this.paymentFrom.CARD", 0] }]
                            }
                        }
                    },
                    cashPayments: {
                        $reduce: {
                            input: {
                                $filter: {
                                    input: { $ifNull: ["$paymentDetails", []] },
                                    as: "payment",
                                    cond: {
                                        $in: ["$$payment.paymentType", ["CASH", "BOTH"]]
                                    }
                                }
                            },
                            initialValue: 0,
                            in: {
                                $add: ["$$value", { $ifNull: ["$$this.paymentFrom.CASH", 0] }]
                            }
                        }
                    },
                    cardPaymentCount: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$paymentDetails", []] },
                                as: "payment",
                                cond: {
                                    $in: ["$$payment.paymentType", ["CARD", "BOTH"]]
                                }
                            }
                        }
                    },
                    cashPaymentCount: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$paymentDetails", []] },
                                as: "payment",
                                cond: {
                                    $in: ["$$payment.paymentType", ["CASH", "BOTH"]]
                                }
                            }
                        }
                    }
                }
            },           
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$totalAmount" },
                    totalClaimableVAT: { $sum: "$claimableVAT" },
                    totalCount: { $sum: 1 },
                    cardPayments: { $sum: "$cardPayments" },
                    cashPayments: { $sum: "$cashPayments" },
                    cardPaymentCount: { $sum: "$cardPaymentCount" },
                    cashPaymentCount: { $sum: "$cashPaymentCount" }
                }
            }
        ];

        const result = await ExpenseData.aggregate(pipeline);

        const summary = result.length > 0 ? result[0] : {
            totalAmount: 0,
            totalClaimableVAT: 0,
            totalCount: 0,
            cardPayments: 0,
            cashPayments: 0,
            cardPaymentCount: 0,
            cashPaymentCount: 0
        };

        // Remove _id from response and format numbers
        delete summary._id;
        summary.totalAmount = Number(summary.totalAmount.toFixed(2));
        summary.totalClaimableVAT = Number(summary.totalClaimableVAT.toFixed(2));
        summary.cardPayments = Number(summary.cardPayments.toFixed(2));
        summary.cashPayments = Number(summary.cashPayments.toFixed(2));

        res.status(200).json({
            success: true,
            message: "Expense summary fetched successfully",
            data: summary
        });

    } catch (error) {
        console.error("Error in getting expense summary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get expense summary",
            error: error.message
        });
    }
};

exports.GetStoreWiseExpenseSummary = async (req, res) => {
    try {
        const { storeName, range, startDate, endDate } = req.query;

        const matchStage = {};

        if (storeName) {
            matchStage.storeName = { $regex: storeName, $options: 'i' };
        }

        // Handle date filtering
        if (range) {
            const now = moment.tz(timeZone);
            
            switch (range) {
                case 'thisWeek':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('week').toDate(),
                        $lte: now.clone().endOf('week').toDate()
                    };
                    break;
                case 'thisMonth':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('month').toDate(),
                        $lte: now.clone().endOf('month').toDate()
                    };
                    break;
                case 'thisYear':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('year').toDate(),
                        $lte: now.clone().endOf('year').toDate()
                    };
                    break;
                case 'allTime':
                    // No date filter needed
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid range value. Use 'thisWeek', 'thisMonth', 'thisYear', or 'allTime'"
                    });
            }
        } else if (startDate && endDate) {
            matchStage.receiptDate = {
                $gte: moment.tz(startDate, timeZone).startOf('day').toDate(),
                $lte: moment.tz(endDate, timeZone).endOf('day').toDate()
            };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: "$storeName",
                    totalAmount: { $sum: "$totalAmount" },
                    totalClaimableVAT: { $sum: "$claimableVAT" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    storeName: "$_id",
                    totalAmount: { $round: ["$totalAmount", 2] },
                    totalClaimableVAT: { $round: ["$totalClaimableVAT", 2] },
                    count: 1
                }
            },
            {
                $sort: { storeName: 1 }
            }
        ];

        const result = await ExpenseData.aggregate(pipeline);

        // Calculate grand totals
        const grandTotals = result.reduce((acc, store) => {
            return {
                totalAmount: acc.totalAmount + store.totalAmount,
                totalClaimableVAT: acc.totalClaimableVAT + store.totalClaimableVAT,
                totalCount: acc.totalCount + store.count
            };
        }, { totalAmount: 0, totalClaimableVAT: 0, totalCount: 0 });

        // Format grand totals to 2 decimal places
        grandTotals.totalAmount = Number(grandTotals.totalAmount.toFixed(2));
        grandTotals.totalClaimableVAT = Number(grandTotals.totalClaimableVAT.toFixed(2));

        res.status(200).json({
            success: true,
            message: "Store-wise expense summary fetched successfully",
            stores: result,
            grandTotals,
        });

    } catch (error) {
        console.error("Error in getting store-wise expense summary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get store-wise expense summary",
            error: error.message
        });
    }
};

exports.GetExpenseTypeWiseExpenseSummary = async (req, res) => {
    try {
        const { expenseType, range, startDate, endDate } = req.query;

        const matchStage = {};

        if (expenseType) {
            matchStage.expenseType = expenseType;
        }

        // Handle date filtering
        if (range) {
            const now = moment.tz(timeZone);
            switch (range) {
                case 'thisWeek':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('week').toDate(),
                        $lte: now.clone().endOf('week').toDate()
                    };
                    break;
                case 'thisMonth':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('month').toDate(),
                        $lte: now.clone().endOf('month').toDate()
                    };
                    break;
                case 'thisYear':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('year').toDate(),
                        $lte: now.clone().endOf('year').toDate()
                    };
                    break;
                case 'allTime':
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid range value. Use 'thisWeek', 'thisMonth', 'thisYear', or 'allTime'"
                    });
            }
        } else if (startDate && endDate) {
            matchStage.receiptDate = {
                $gte: moment.tz(startDate, timeZone).startOf('day').toDate(),
                $lte: moment.tz(endDate, timeZone).endOf('day').toDate()
            };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: "$expenseType",
                    totalAmount: { $sum: "$totalAmount" },
                    totalClaimableVAT: { $sum: "$claimableVAT" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    expenseType: "$_id",
                    totalAmount: { $round: ["$totalAmount", 2] },
                    totalClaimableVAT: { $round: ["$totalClaimableVAT", 2] },
                    count: 1
                }
            },
            { $sort: { expenseType: 1 } }
        ];

        const result = await ExpenseData.aggregate(pipeline);

        const grandTotals = result.reduce((acc, type) => ({
            totalAmount: acc.totalAmount + type.totalAmount,
            totalClaimableVAT: acc.totalClaimableVAT + type.totalClaimableVAT,
            totalCount: acc.totalCount + type.count
        }), { totalAmount: 0, totalClaimableVAT: 0, totalCount: 0 });

        grandTotals.totalAmount = Number(grandTotals.totalAmount.toFixed(2));
        grandTotals.totalClaimableVAT = Number(grandTotals.totalClaimableVAT.toFixed(2));

        res.status(200).json({
            success: true,
            message: "Expense type-wise summary fetched successfully",
            expenseTypes: result,
            grandTotals,
        });

    } catch (error) {
        console.error("Error in getting expense type-wise summary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get expense type-wise summary",
            error: error.message
        });
    }
};

exports.GetCategoryWiseExpenseSummary = async (req, res) => {
    try {
        const { categoryName, range, startDate, endDate } = req.query;

        const matchStage = {};

        if (categoryName) {
            matchStage['receiptItems.category'] = categoryName;
        }

        if (range) {
            const now = moment.tz(timeZone);
            switch (range) {
                case 'thisWeek':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('week').toDate(),
                        $lte: now.clone().endOf('week').toDate()
                    };
                    break;
                case 'thisMonth':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('month').toDate(),
                        $lte: now.clone().endOf('month').toDate()
                    };
                    break;
                case 'thisYear':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('year').toDate(),
                        $lte: now.clone().endOf('year').toDate()
                    };
                    break;
                case 'allTime':
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid range value. Use 'thisWeek', 'thisMonth', 'thisYear', or 'allTime'"
                    });
            }
        } else if (startDate && endDate) {
            matchStage.receiptDate = {
                $gte: moment.tz(startDate, timeZone).startOf('day').toDate(),
                $lte: moment.tz(endDate, timeZone).endOf('day').toDate()
            };
        }

        const pipeline = [
            { $match: matchStage },
            { $unwind: "$receiptItems" },
            {
                $group: {
                    _id: "$receiptItems.category",
                    totalAmount: { $sum: "$receiptItems.total" },
                    totalClaimableVAT: { $sum: "$receiptItems.vatAmount" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    totalAmount: { $round: ["$totalAmount", 2] },
                    totalClaimableVAT: { $round: ["$totalClaimableVAT", 2] },
                    count: 1
                }
            },
            { $sort: { category: 1 } }
        ];

        const result = await ExpenseData.aggregate(pipeline);

        const grandTotals = result.reduce((acc, category) => ({
            totalAmount: acc.totalAmount + category.totalAmount,
            totalClaimableVAT: acc.totalClaimableVAT + category.totalClaimableVAT,
            totalCount: acc.totalCount + category.count
        }), { totalAmount: 0, totalClaimableVAT: 0, totalCount: 0 });

        grandTotals.totalAmount = Number(grandTotals.totalAmount.toFixed(2));
        grandTotals.totalClaimableVAT = Number(grandTotals.totalClaimableVAT.toFixed(2));

        res.status(200).json({
            success: true,
            message: "Category-wise expense summary fetched successfully",
            categories: result,
            grandTotals,
        });

    } catch (error) {
        console.error("Error in getting category-wise expense summary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get category-wise expense summary",
            error: error.message
        });
    }
};

exports.GetSpendByWiseExpenseSummary = async (req, res) => {
    try {
        const { spendBy, range, startDate, endDate } = req.query;

        const matchStage = {};

        if (spendBy) {
            matchStage.spentBy = spendBy;
        }

        if (range) {
            const now = moment.tz(timeZone);
            switch (range) {
                case 'thisWeek':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('week').toDate(),
                        $lte: now.clone().endOf('week').toDate()
                    };
                    break;
                case 'thisMonth':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('month').toDate(),
                        $lte: now.clone().endOf('month').toDate()
                    };
                    break;
                case 'thisYear':
                    matchStage.receiptDate = {
                        $gte: now.clone().startOf('year').toDate(),
                        $lte: now.clone().endOf('year').toDate()
                    };
                    break;
                case 'allTime':
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid range value. Use 'thisWeek', 'thisMonth', 'thisYear', or 'allTime'"
                    });
            }
        } else if (startDate && endDate) {
            matchStage.receiptDate = {
                $gte: moment.tz(startDate, timeZone).startOf('day').toDate(),
                $lte: moment.tz(endDate, timeZone).endOf('day').toDate()
            };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: "$spentBy",
                    totalAmount: { $sum: "$totalAmount" },
                    totalClaimableVAT: { $sum: "$claimableVAT" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    spentBy: "$_id",
                    totalAmount: { $round: ["$totalAmount", 2] },
                    totalClaimableVAT: { $round: ["$totalClaimableVAT", 2] },
                    count: 1
                }
            },
            { $sort: { spentBy: 1 } }
        ];

        const result = await ExpenseData.aggregate(pipeline);

        const grandTotals = result.reduce((acc, spender) => ({
            totalAmount: acc.totalAmount + spender.totalAmount,
            totalClaimableVAT: acc.totalClaimableVAT + spender.totalClaimableVAT,
            totalCount: acc.totalCount + spender.count
        }), { totalAmount: 0, totalClaimableVAT: 0, totalCount: 0 });

        grandTotals.totalAmount = Number(grandTotals.totalAmount.toFixed(2));
        grandTotals.totalClaimableVAT = Number(grandTotals.totalClaimableVAT.toFixed(2));

        res.status(200).json({
            success: true,
            message: "Spend by-wise expense summary fetched successfully",
            spenders: result,
            grandTotals,
        });

    } catch (error) {
        console.error("Error in getting spend by-wise expense summary:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get spend by-wise expense summary",
            error: error.message
        });
    }
};