
const InvoiceModal = require('../Models/invoice');
const OrderModal = require('../Models/order');
const MerchantModal = require('../Models/merchant');
const RefundModal = require('../Models/refunds');
const { calculateInvoiceParameters, generateInvoiceId, createPDF, getFinalDataForEditInvoice, calculateInvoiceParametersManual, createManualPDF } = require('../Utils/invoiceUtils');
const { deleteBlob, uploadPdfBuffer } = require('../azureBlobHelper');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';
const MerchantItemsModal = require('../Models/merchantItems');
const idGenerator = require('../Models/idGenerator');
const agenda = require('../agenda');
const PDFParser = require('pdf-parse');

exports.getInvoicesByMerchantId = async (req, res) => {
    try {
        const { startDate, endDate, pageNo = 1, limit = 10, sort } = req.query
        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;
        const merchantId = parseInt(req.query.merchantId, 10);

        if (!merchantId) {
            return res.status(400).json({ message: 'Merchant ID is required' });
        }

        const invoices = await InvoiceModal.find({
            merchantId, isManualCreate: false, $or: [
                { isOlderInvoice: false },
                { isOlderInvoice: { $exists: false } }
            ]
        });

        if (invoices.length === 0) {
            return res.status(201).json({ message: 'No invoices found' });
        }

        const matchStage = {
            merchantId: merchantId,
            isSentToMerchant: true,
            isManualCreate: false,
            $or: [
                { isOlderInvoice: false },
                { isOlderInvoice: { $exists: false } }
            ]
        };

        if (startDate) {
            const start = new Date(startDate);
            let end;
            if (!endDate) {
                end = new Date();
                end.setHours(23, 59, 59, 999);
            } else {
                end = new Date(endDate);
            }

            matchStage.createdAt = { $gte: start, $lte: end };
        }

        const sortStage = {};
        sortStage.createdAt = -1;
        if (sort === 'asc') {
            sortStage.createdAt = 1;
        } else if (sort === 'desc') {
            sortStage.createdAt = -1;
        }

        const pipeline = [
            { $match: matchStage },
            ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
            { $skip: (page - 1) * limitValue },
            { $limit: limitValue },
        ];

        const result = await InvoiceModal.aggregate(pipeline);

        const totalCount = await InvoiceModal.countDocuments(matchStage);

        const totalPages = Math.ceil(totalCount / limitValue);

        res.status(200).json({ invoices: result, totalCount, totalPages, currentPage: page, });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.generateInvoiceByMerchantIds = async (req, res) => {
    try {
        const { merchantIds, lastWeek, startDate, endDate } = req.body;

        if (!merchantIds) {
            return res.status(400).json({ message: 'Merchant IDs are required' });
        }

        const merchantIdArray = merchantIds?.map(id => parseInt(id.trim(), 10));

        if (merchantIdArray.some(isNaN)) {
            return res.status(400).json({ message: 'Invalid Merchant IDs provided' });
        }

        let fromDate, toDate;

        if (lastWeek) {
            fromDate = moment.tz(timeZone).startOf('isoWeek').subtract(7, 'days').toDate();
            toDate = moment.tz(timeZone).endOf('isoWeek').subtract(7, 'days').toDate();
        }
        else if (startDate && endDate) {
            fromDate = moment.tz(startDate, timeZone).startOf('day').toDate();
            toDate = moment.tz(endDate, timeZone).endOf('day').toDate();

        } else {
            return res.status(400).json({ message: 'Provide date range to generate invoice', status: 'failed' });
        }


        const invoices = [];

        for (const merchantId of merchantIdArray) {

            const orders = await OrderModal.find({
                merchantId,
                orderDate: { $gte: fromDate, $lte: toDate }, // Filter by orderDate
                status: { $nin: ['ABANDONED', 'CANCELLED', 'REJECTED', 'FAILED'] }
            });

            if (!orders || orders.length === 0) {
                invoices.push({ merchantId, message: 'No orders found for the given date range', status: 'failed' });
                continue;
            }

            const existingInvoice = await InvoiceModal.findOne({
                merchantId,
                fromDate,
                toDate,
                isManualCreate: false
            });

            if (existingInvoice) {
                invoices.push({ merchantId, message: 'Invoice already exists for the given date range', status: 'failed' });
                continue;
            }

            const merchant = await MerchantModal.findOne({ merchantId });

            if (!merchant) {
                invoices.push({ merchantId, message: 'Merchant not found', status: 'failed' });
                continue;
            }

            const refunds = await RefundModal.find({ merchantId, isSettled: false });
            let refundArray = refunds.length > 0 ? refunds.map((refund) => refund.toObject()) : null;

            const finalData = calculateInvoiceParameters(merchant, orders, refundArray);

            const invoiceId = await generateInvoiceId(merchantId);

            const lastInvoice = await InvoiceModal.findOne({ merchantId, isManualCreate: false }).sort({ createdAt: -1 });
            const lastInvoiceId = lastInvoice ? lastInvoice.invoiceId : null;
            let lastInvoiceCount = 0;
            if (lastInvoiceId) {
                const lastInvoiceIdWithLeadingZeros = lastInvoiceId.split('-').pop();
                lastInvoiceCount = parseInt(lastInvoiceIdWithLeadingZeros, 10) || 0;
            }
            const invoiceCount = lastInvoiceCount + 1;
            const formattedCount = String(invoiceCount).padStart(4, '0');

            const fileName = `invoice_${merchantId}_${formattedCount}.pdf`;

            const { pdfUrl, invoiceParameters } = await createPDF(fileName, merchant, fromDate, toDate, finalData, invoiceId);

            // Save Invoice Record
            const invoice = new InvoiceModal({
                merchantId,
                fromDate,
                toDate,
                downloadLink: pdfUrl,
                createdAt: moment.tz(timeZone).toDate(),
                invoiceParameters,
                status: 'UNPAID',
                invoiceId,
                merchantName: merchant.merchantName,
                isManualCreate: false
            });

            await invoice.save();

            for (const order of orders) {
                order.invoiceId = invoiceId;
                order.invoiceDate = moment.tz(timeZone).toDate();
                await order.save();
            }

            if (refundArray) {
                for (const refund of refunds) {
                    refund.isSettled = true;
                    await refund.save();
                }
            }

            invoices.push({ merchantId, message: 'Invoice generated successfully', status: 'success', invoice });

        }

        res.status(201).json({ message: 'Invoice request processed', invoices });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllInvoices = async (req, res) => {
    try {
        const { merchantIds, startDate, endDate, status, pageNo = 1, limit = 10, sort, isSentToMerchant, isManualCreate, merchantName, invoiceId, isOlderInvoice } = req.query

        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;

        const matchStage = {};

        matchStage.isManualCreate = isManualCreate ? true : false;

        if (isOlderInvoice !== undefined) {
            matchStage.isOlderInvoice = isOlderInvoice === "true" ? true : false;
        }

        // Add filters dynamically
        if (merchantIds) {
            const merchantIdArray = merchantIds.split(',').map(id => parseInt(id.trim(), 10));
            matchStage.merchantId = { $in: merchantIdArray };
        }
        if (invoiceId) {
            const invoiceIds = invoiceId.split(',').map(id => id.trim());
            matchStage.invoiceId = { $in: invoiceIds };
        }

        if (isSentToMerchant !== undefined) {
            matchStage.isSentToMerchant = isSentToMerchant === "true" ? true : false;
        }

        if (startDate) {
            const start = moment.tz(startDate, timeZone).toDate();
            let end;

            if (!endDate) {
                end = moment.tz(new Date(), timeZone).endOf('day').toDate();
            } else {
                end = moment.tz(endDate, timeZone).endOf('day').toDate();
            }

            matchStage.fromDate = { $gte: start };
            matchStage.toDate = { $lte: end };

        }

        if (status) {
            matchStage.status = status;
        }

        if (merchantName) {
            matchStage.merchantName = { $regex: merchantName, $options: 'i' };
        }

        const sortStage = {};
        sortStage.createdAt = -1;
        if (sort === 'asc') {
            sortStage.createdAt = 1;
        } else if (sort === 'desc') {
            sortStage.createdAt = -1;
        }

        // **Step 1: Calculate totalToBePaid for all matched invoices**
        const totalAggregation = await InvoiceModal.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: { $ifNull: ["$invoiceParameters.bankTransfer", 0] } },
                    totalWithTax: { $sum: { $ifNull: ["$invoiceParameters.totalWithTax", 0] } },
                    totalVAT: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$isManualCreate", true] },
                                then: { $ifNull: ["$invoiceParameters.tax_amount", 0] },
                                else: { $ifNull: ["$invoiceParameters.taxAmount", 0] }
                            }
                        }
                    }
                }
            }
        ]);

        const totalToBePaid = totalAggregation.length ? totalAggregation[0].totalAmount : 0;

        const totalWithTax = totalAggregation.length ? totalAggregation[0].totalWithTax : 0;

        const totalVAT = totalAggregation.length ? totalAggregation[0].totalVAT : 0;


        const pipeline = [
            { $match: matchStage },
            ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
            { $skip: (page - 1) * limitValue },
            { $limit: limitValue },
        ];

        const result = await InvoiceModal.aggregate(pipeline);

        const totalCount = await InvoiceModal.countDocuments(matchStage);

        const totalPages = Math.ceil(totalCount / limitValue);

        res.status(200).json({ invoices: result, totalCount, totalPages, currentPage: page, totalToBePaid: Number(totalToBePaid?.toFixed(2)) || 0, totalAmountDue: Number(totalWithTax?.toFixed(2)) || 0, totalVAT: Number(totalVAT?.toFixed(2)) || 0 }, );


    } catch (error) {

    }
}

exports.editInvoice = async (req, res) => {
    const { merchantId, fromDate, toDate, status, invoiceId } = req.body;
    const newInvoiceParameters = req.body?.invoiceParameters

    try {
        const invoice = await InvoiceModal.findOne({ invoiceId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (status && invoice.status !== status) {
            invoice.status = status;
            invoice.updatedAt = moment.tz(timeZone).toDate();
            if (status === "PAID") {
                invoice.paidDate = moment.tz(timeZone).toDate();
            } else {
                invoice.paidDate = null;
            }
            await invoice.save();

            const items = await MerchantItemsModal.find({
                itemId: { $in: newInvoiceParameters.merchantItemIds }
            });
            const itemSavePromises = items.map((item) => {
                const transactionIndex = item.transactions.findIndex(
                    (transaction) => transaction.invoiceId === invoiceId
                );
                if (transactionIndex !== -1) {
                    item.transactions[transactionIndex].isPaid = status === 'PAID';
                    return item.save();
                }
            });

            await Promise.all(itemSavePromises);

            return res.status(200).json({ message: 'Invoice updated successfully' });
        }

        const fileName = newInvoiceParameters.fileName || '';
        const merchant = await MerchantModal.findOne({ merchantId });

        const finalData = getFinalDataForEditInvoice(newInvoiceParameters, merchant.taxRate);
        const { pdfUrl, invoiceParameters } = await createPDF(fileName, merchant, fromDate, toDate, finalData, invoiceId, isEditInvoice = true);

        invoice.fromDate = fromDate;
        invoice.toDate = toDate;
        invoice.updatedAt = moment.tz(timeZone).toDate();
        invoice.invoiceParameters = invoiceParameters;
        invoice.downloadLink = pdfUrl;
        invoice.createdAt = moment.tz(invoiceParameters.invoiceDate, timeZone).toDate();

        await invoice.save();

        // ✅ Efficiently handle refunds (Update existing or create new refund records)
        if (invoiceParameters?.refundArray?.length) {
            await Promise.all(invoiceParameters.refundArray.map(async (refund) => {
                await RefundModal.findOneAndUpdate(
                    { merchantId, invoiceId, orderId: refund.orderId },
                    { refundAmount: refund.refundAmount, isSettled: true }
                );
            }));
            await Promise.all(invoiceParameters.refundArray.map(async (refund) => {
                await OrderModal.findOneAndUpdate(
                    { orderId: refund.orderId },
                    { refundMerchant: refund.refundAmount }
                );
            }));
        }

        res.status(200).json({ message: 'Invoice updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteInvoice = async (req, res) => {
    const { invoiceId } = req.query;
    try {
        const ids = invoiceId.split(',').map(id => id.trim());
        const invoices = await InvoiceModal.find({ invoiceId: { $in: ids } });

        if (!invoices.length) {
            return res.status(404).json({
                error: 'No invoice found for the given invoice Id(s)',
                success: false,
                errors: []
            });
        }

        const deletePromises = invoices.map(async (invoice) => {
            const pdfPath = invoice.downloadLink;
            if (pdfPath) {
                await deleteBlob(pdfPath, 'invoice');
            }

            const items = await MerchantItemsModal.find({
                itemId: { $in: invoice.invoiceParameters.merchantItemIds }
            });

            // Remove transactions related to the invoice
            const itemSavePromises = items.map((item) => {
                const transactionIndex = item.transactions.findIndex(
                    (transaction) => transaction.invoiceId === invoice.invoiceId
                );
                if (transactionIndex !== -1) {
                    item.transactions.splice(transactionIndex, 1);
                    return item.save();
                }
            });

            await Promise.all(itemSavePromises);
        });

        await Promise.all(deletePromises);

        const result = await InvoiceModal.deleteMany({ invoiceId: { $in: ids } });

        const latestInvoice = await InvoiceModal.findOne().sort({ createdAt: -1 });

        let newSeq = 0; // Default to 0 if no invoices are left
        if (latestInvoice) {
            const latestParts = latestInvoice.invoiceId.split('-');
            newSeq = parseInt(latestParts[3], 10);
        }

        // Update the IdGenerator sequence
        await idGenerator.findOneAndUpdate(
            { name: 'invoice' },
            { seq: newSeq },
            { new: true }
        );

        res.status(200).json({
            message: 'Invoice deleted successfully',
            deletedCount: result.deletedCount,
            success: true
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: 'Server error',
            success: false,
            details: error.message
        });
    }
};


exports.sendInvoicesToMerchant = async (req, res) => {
    const { invoiceIds } = req.body; // Expecting an array of invoiceIds
    const userRole = req.user.role;
    try {
        if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return res.status(400).json({ message: 'invoiceIds should be a non-empty array' });
        }

        let invoices = await InvoiceModal.find({ invoiceId: { $in: invoiceIds } }, { invoiceId: 1, merchantId: 1, isManualCreate: 1, isSentToMerchant: 1 }).lean();

        if (!invoices.length) {
            res.status(200).json({
                message: `invoice(s) already sent.`,
                invoiceIds: invoiceIds
            });
            return;
        }

        const manualInvoiceIds = []
        for (const inv of invoices) {
            if (inv.isManualCreate) {
                manualInvoiceIds.push(inv.invoiceId)
            }
        }

        if (manualInvoiceIds.length) {
            const timestamp = moment.tz(timeZone).toDate();

            const result = await InvoiceModal.updateMany(
                { invoiceId: { $in: manualInvoiceIds } },
                { $set: { isSentToMerchant: true, sentToMerchantAt: timestamp } }
            );

            manualInvoiceIds.forEach(invoiceId => {
                agenda.now('send invoice to merchant', { invoiceId, userRole });
            });

            res.status(200).json({
                message: `${result.modifiedCount} invoice(s) sent to customer successfully.`,
                invoiceIds: invoiceIds
            });
            return;
        }

        const merchantIds = [...new Set(invoices.map(inv => inv.merchantId))];

        const applicableMerchants = await MerchantModal.find(
            { merchantId: { $in: merchantIds }, isEmailApplicable: true },
            { merchantId: 1 } // Only fetch merchantId
        ).lean();

        const applicableMerchantIds = new Set(applicableMerchants.map(m => m.merchantId));

        const mailInvoiceIds = invoices
            .filter(invoice => applicableMerchantIds.has(invoice.merchantId))
            .map(invoice => invoice.invoiceId);

        const timestamp = moment.tz(timeZone).toDate();

        const result = await InvoiceModal.updateMany(
            { invoiceId: { $in: invoiceIds } },
            { $set: { isSentToMerchant: true, sentToMerchantAt: timestamp } }
        );

        mailInvoiceIds.forEach(invoiceId => {
            agenda.now('send invoice to merchant', { invoiceId, userRole });
        });

        res.status(200).json({
            message: `${result.modifiedCount} invoice(s) sent to merchant successfully.`,
            invoiceIds: invoiceIds
        });

    } catch (error) {
        console.error("Error sending invoices:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.viewInvoiceByMerchant = async (req, res) => {
    try {
        const { invoiceId, fromEmail } = req.query;

        if (!invoiceId) {
            return res.status(400).json({ error: "Invoice ID is required" });
        }

        const invoice = await InvoiceModal.findOne({ invoiceId });

        if (!invoice) {
            return res.status(404).json({ error: `Invoice not found for Id : ${invoiceId}` });
        }

        if (fromEmail === 'true') {
            agenda.now('view invoice history update', { invoiceId });
            return res.redirect(invoice.downloadLink);
        }

        // Update the viewHistory array, keeping only the latest 5 timestamps
        let updatedViewHistory = [moment.tz(timeZone).toDate(), ...invoice.viewHistory];
        updatedViewHistory = updatedViewHistory.slice(0, 5); // Keep only the last 5 entries

        // Save the updated invoice
        invoice.viewHistory = updatedViewHistory;
        await invoice.save();

        res.status(200).json({ message: "Invoice was viewed successfully", success: true });
    } catch (error) {
        console.error("Error updating view history:", error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
};

exports.createInvoiceManually = async (req, res) => {
    const { fromDate, toDate, invoiceParameters, isMarketPlaceInvoiceManually } = req.body;

    try {

        const invoiceId = await generateInvoiceId();

        const lastInvoice = await InvoiceModal.find().sort({ createdAt: -1 }).limit(1);
        const lastInvoiceId = lastInvoice ? lastInvoice[0].invoiceId : null;
        let lastInvoiceCount = 0;
        if (lastInvoiceId) {
            const lastInvoiceIdWithLeadingZeros = lastInvoiceId.split('-').pop();
            lastInvoiceCount = parseInt(lastInvoiceIdWithLeadingZeros, 10) || 0;
        }
        const invoiceCount = lastInvoiceCount + 1;
        const formattedCount = String(invoiceCount).padStart(4, '0');

        const fileName = `invoice_0000_${formattedCount}.pdf`;

        const finalData = calculateInvoiceParametersManual(invoiceParameters, invoiceCount);

        const invoiceDate = moment.tz(timeZone).toDate();
        const { pdfUrl, newInvoiceParameters } = await createManualPDF(fileName, invoiceParameters?.customerAddress, fromDate, toDate, invoiceDate, finalData, invoiceId);

        const invoice = new InvoiceModal({
            fromDate,
            toDate,
            downloadLink: pdfUrl,
            createdAt: invoiceDate,
            invoiceParameters: newInvoiceParameters,
            status: 'UNPAID',
            invoiceId,
            merchantId: invoiceParameters?.customerAddress?.customerId || 0,
            merchantName: invoiceParameters?.customerAddress?.name,
            isManualCreate: true,
            isMarketPlaceInvoiceManually: isMarketPlaceInvoiceManually || false
        });

        await invoice.save();
        res.status(201).json({ message: 'Invoice generated successfully', invoice });

    } catch (error) {
        console.log("Error in creating invoice", error);
    }

}

exports.editInvoiceManually = async (req, res) => {
    const { fromDate, toDate, invoiceDate, invoiceId, status, invoiceParameters } = req.body;

    try {

        const invoice = await InvoiceModal.findOne({ invoiceId });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (status && invoice.status !== status) {
            invoice.status = status;
            invoice.updatedAt = moment.tz(timeZone).toDate();
            if (status === "PAID") {
                invoice.paidDate = moment.tz(timeZone).toDate();
            } else {
                invoice.paidDate = null;
            }
            await invoice.save();
            await invoice.save();

            return res.status(200).json({ message: 'Invoice updated successfully' });
        }

        const fileName = invoiceParameters.fileName || '';
        const finalData = calculateInvoiceParametersManual(invoiceParameters, invoiceParameters?.currentInvoiceCount);

        const { pdfUrl, newInvoiceParameters } = await createManualPDF(fileName, invoiceParameters?.customerAddress, fromDate, toDate, invoiceDate, finalData, invoiceId);

        invoice.fromDate = fromDate;
        invoice.toDate = toDate;
        invoice.updatedAt = moment.tz(timeZone).toDate();
        invoice.invoiceParameters = newInvoiceParameters;
        invoice.downloadLink = pdfUrl;
        invoice.createdAt = invoiceDate;
        invoice.merchantName = invoiceParameters?.customerAddress?.name

        await invoice.save();
        res.status(200).json({ message: 'Invoice updated successfully' });

    } catch (error) {
        console.log("Error in editing invoice", error);
    }
}

exports.uploadInvoicePDFs = async (req, res) => {
    try {
        const { merchantId, merchantName } = req.body;
        const pdfs = req.files;

        if (!merchantId || !pdfs || !pdfs.length) {
            return res.status(400).json({
                success: false,
                message: "Merchant ID and PDF files are required"
            });
        }

        const results = [];

        for (const pdf of pdfs) {
            try {
                // Parse PDF
                const data = await PDFParser(pdf.buffer);
                const text = data.text;

                // Extract Invoice ID
                const invoiceMatch = text.match(/Invoice no\.\s*([^\n\r]*)/i);
                const invoiceId = invoiceMatch ? invoiceMatch[1].trim() : null;

                // Extract Invoice Date with better parsing
                const dateMatch = text.match(/Invoice date[:\s]*(\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+\d{4})/i);
                let invoiceDate = null;
                if (dateMatch) {
                    // Remove ordinal indicators (st, nd, rd, th) before parsing
                    const cleanDate = dateMatch[1].replace(/(st|nd|rd|th)/, '');
                    invoiceDate = moment.tz(cleanDate, ['D MMMM YYYY', 'DD MMMM YYYY'], timeZone).toDate();
                }

                // Extract Period with better parsing
                const periodMatch = text.match(/Period:\s*(\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+\d{4})\s*-\s*(\d{1,2}(?:st|nd|rd|th)?\s+\w+\s+\d{4})/i);
                let fromDate = null;
                let toDate = null;

                if (periodMatch) {
                    const cleanFromDate = periodMatch[1].replace(/(st|nd|rd|th)/, '');
                    const cleanToDate = periodMatch[2].replace(/(st|nd|rd|th)/, '');
                    fromDate = moment.tz(cleanFromDate, ['D MMMM YYYY', 'DD MMMM YYYY'], timeZone).toDate();
                    toDate = moment.tz(cleanToDate, ['D MMMM YYYY', 'DD MMMM YYYY'], timeZone).toDate();
                }

                // Validate dates before proceeding
                if (!invoiceDate || !moment(invoiceDate).isValid()) {
                    results.push({
                        success: false,
                        message: "Invalid invoice date format in PDF",
                        filename: pdf.originalname
                    });
                    continue;
                }

                if (!fromDate || !toDate || !moment(fromDate).isValid() || !moment(toDate).isValid()) {
                    results.push({
                        success: false,
                        message: "Invalid period date format in PDF",
                        filename: pdf.originalname
                    });
                    continue;
                }

                // Check if invoice already exists
                const existingInvoice = await InvoiceModal.findOne({ invoiceId });
                if (existingInvoice) {
                    results.push({
                        success: false,
                        message: `Invoice ${invoiceId} already exists`,
                        filename: pdf.originalname
                    });
                    continue;
                }

                // Upload PDF to Azure
                const fileName = `uploaded_invoice_${merchantId}_${moment().format('YYYYMMDDHHmmss')}_${pdf.originalname}`;
                const pdfUrl = await uploadPdfBuffer(pdf.buffer, fileName);

                // Save to database
                const invoice = new InvoiceModal({
                    merchantId,
                    invoiceId,
                    fromDate,
                    toDate,
                    createdAt: invoiceDate,
                    status: 'PAID',
                    downloadLink: pdfUrl,
                    isManualCreate: false,
                    merchantName,
                    updatedAt: moment.tz(timeZone).toDate(),
                    invoiceParameters: [],
                    isOlderInvoice: true,
                    isSentToMerchant: true
                });

                await invoice.save();

                results.push({
                    success: true,
                    message: `Invoice ${invoiceId} processed successfully`,
                    filename: pdf.originalname,
                    data: {
                        invoiceId,
                        invoiceDate,
                        fromDate,
                        toDate,
                        downloadLink: pdfUrl,
                        merchantId,
                        merchantName
                    }
                });

            } catch (error) {
                results.push({
                    success: false,
                    message: `Error processing PDF: ${error.message}`,
                    filename: pdf.originalname
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "PDF processing completed",
            results
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.editOlderInvoice = async (req, res) => {
    try {
        const { olderInvoiceId, newInvoiceId, fromDate, toDate, invoiceDate } = req.body;

        // Find the invoice by invoiceId
        const invoice = await InvoiceModal.findOne({ invoiceId: olderInvoiceId, isOlderInvoice: true });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }

        if (fromDate > toDate) {
            return res.status(400).json({
                success: false,
                message: "From date cannot be greater than to date",
            });
        }

        if (newInvoiceId !== olderInvoiceId) {
            const existingInvoice = await InvoiceModal.findOne({ invoiceId: newInvoiceId });
            if (existingInvoice) {
                return res.status(400).json({
                    success: false,
                    message: "Invoice with the same invoiceId already exists",
                });
            }
        }

        // Update the invoice

        invoice.fromDate = fromDate;
        invoice.toDate = toDate;
        invoice.createdAt = invoiceDate;
        invoice.updatedAt = moment.tz(timeZone).toDate();
        invoice.invoiceId = newInvoiceId;

        await invoice.save();

        return res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: invoice
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};