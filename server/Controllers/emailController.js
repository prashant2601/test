const sendEmail = require("../Utils/emailService");
const feedbackTemplate = require("../EmailTemplates/feedback");
const path = require('path');
const moment = require('moment-timezone');
const timeZone = 'Europe/London';

const FeedbackModal = require("../Models/feedback");
const CustomerModal = require("../Models/customer");
const OrderModal = require("../Models/order");
const InvoiceModal = require("../Models/invoice");
const EmailLog = require('../Models/emailLogs');
const sendInvoiceTemplate = require("../EmailTemplates/sendInvoice");
const jwt = require('jsonwebtoken');
const agenda = require('../agenda');

exports.getEmailLogs = async (req, res) => {
    try {
        const { receiverId, startDate, endDate, emailType, sendTo, status, pageNo = 1, limit = 10, sort, receiverName } = req.query

        const page = parseInt(pageNo, 10) || 1;
        const limitValue = parseInt(limit, 10) || 10;

        const matchStage = {};
        // Add filters dynamically
        if (receiverId) {
            const idArray = receiverId.split(',').map(id => parseInt(id.trim(), 10));
            matchStage.receiverId = { $in: idArray };
        }
        if (receiverName) {
            const receiverNameRegexArray = receiverName.split(',').map(name => new RegExp(name.trim(), 'i'));
            matchStage.receiverName = { $in: receiverNameRegexArray };
        }

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

        if (status) {
            matchStage.status = status;
        }

        if (emailType) {
            matchStage.emailType = emailType
        }

        if (sendTo) {
            matchStage.sendTo = sendTo
        }

        const sortStage = {};
        sortStage.createdAt = -1;
        if (sort === 'ascDate') {
            sortStage.createdAt = 1;
        } else if (sort === 'descDate') {
            sortStage.createdAt = -1;
        }

        const pipeline = [
            { $match: matchStage },
            ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
            { $skip: (page - 1) * limitValue },
            { $limit: limitValue },
        ];

        const result = await EmailLog.aggregate(pipeline);

        const totalCount = await EmailLog.countDocuments(matchStage);

        const totalPages = Math.ceil(totalCount / limitValue);

        res.status(200).json({ logs: result, totalCount, totalPages, currentPage: page, });

    } catch (error) {
        console.error('Error fetching email logs:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.sendFeedbackMail = async (req, res) => {
    const updates = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'No data provided in correct format', success: false });
    }

    // Enqueue a job for each feedback email
    updates.forEach((update) => {
        agenda.now('send order feedback', update);
    });

    res.status(200).json({
        message: 'Email will be sent if proper data exists. Pls check email reports',
        success: true
    });
};

exports.renderFeedbackPage = async (req, res) => {
    const { fromEmail, token, response } = req.query;
    try {
        if (fromEmail === 'true') {
            // return res.sendFile(path.resolve(__dirname, '..', 'EmailTemplates', 'feedbackPage.html'));

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const customerId = decoded.customerId;
                const orderId = decoded.orderId;
                const merchantId = decoded.merchantId;

                const isFeedbackAlreadySubmitted = await FeedbackModal.findOne({ customerId, orderId });
                if (isFeedbackAlreadySubmitted) {
                    return res.redirect(`https://www.swishr.co.uk/order/review-order/${orderId}`);
                }
                const feedback = new FeedbackModal({
                    customerId,
                    merchantId,
                    orderId,
                    recommended: response === "yes" ? "YES" : "NO",
                    feedbackDate: moment().tz(timeZone).toDate()
                })
                await feedback.save();
                
                return res.redirect(`https://www.swishr.co.uk/order/review-order/${orderId}`);
                
            }

        }
        res.status(400).send("Invalid request");

    } catch (error) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
}
exports.receiveFeedback = async (req, res) => {
    const { customerId, orderId, merchantId, rating, suggestion } = req.body;
    try {

        if (!orderId || !customerId || !rating) {
            return res.status(400).send("Invalid feedback data");
        }

        const isFeedbackAlreadySubmitted = await FeedbackModal.findOne({ customerId, orderId });
        if (isFeedbackAlreadySubmitted) {
            return res.status(200).json({
                message: 'Feedback already submitted',
                success: false,
            });
        }
        const feedback = new FeedbackModal({
            customerId,
            merchantId,
            orderId,
            rating,
            suggestion,
            feedbackDate: moment().tz(timeZone).toDate()
        })
        await feedback.save();

        const order = await OrderModal.findOne({ orderId });
        if (order) {
            order.feedback = rating;
            await order.save();
        }

        res.status(200).json({
            message: 'Feedback received successfully',
            success: true
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
}

exports.sendInvoiceMail = async (req, res) => {
    const updates = req.body;

    try {
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ error: 'No data provided in correct format', success: false, errors: [] });
        }

        const updatePromises = updates.map(async (update) => {
            try {
                const { invoiceId } = update;

                // Validate input data
                if (!invoiceId) {
                    throw new Error(`Missing invoiceId for update: ${JSON.stringify(update)}`);
                }

                // Fetch customer details
                const invoice = await InvoiceModal.findOne({ invoiceId });
                if (!invoice) {
                    throw new Error(`Invoice not found for ID: ${invoiceId}`);
                }

                const merchant = await MerchantModal.findOne({ merchantId: invoice.merchantId });
                if (!merchant) {
                    throw new Error(`Merchant not found for ID: ${invoice.merchantId}`);
                }

                // Prepare email parameters
                const emailParams = {
                    invoiceId,
                    merchantName: `${merchant?.merchantName || ''}`.trim(),
                    invoiceDate: moment.tz(invoice?.invoiceParameters?.invoiceDate, timeZone).format('Do MMMM YYYY'),
                    closingBalance: (invoice?.invoiceParameters?.closingBalance || 0).toFixed(2),
                    downloadUrl: `${process.env.API_DOMAIN}/api/email/viewInvoiceFromMail/${invoiceId}`,
                };

                if (!merchant?.merchantEmail) {
                    throw new Error(`Missing email for merchant ${emailParams.merchantName}`);
                }

                // Generate and send email
                const emailContent = sendInvoiceTemplate(emailParams);
                await sendEmail(merchant?.merchantEmail, "Send Invoice", emailContent);

                return { merchantName: emailParams.merchantName, success: true };
            } catch (error) {
                console.error(`Error processing order: ${error.message}`);
                return { error: error.message, success: false };
            }
        });

        const results = await Promise.all(updatePromises);

        res.status(200).json({
            message: 'Processing completed',
            results
        });

    } catch (err) {
        console.error("Unexpected error:", err.message);
        res.status(500).json({ error: err.message, success: false });
    }
}

exports.decryptToken = async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({ success: true, ...decoded });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
}