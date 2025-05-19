const fs = require('fs');
const path = require('path');
const CustomerModal = require('../Models/customer');
const OrderModal = require('../Models/order')
const RefundModal = require('../Models/refunds')
const FeedbackModal = require('../Models/feedback')
const { deleteBlob, uploadBase64Image } = require('../azureBlobHelper');
const { getNextId } = require('../Utils/utils');

const csv = require('csv-parser');
const stream = require('stream');

const HEADER_MAPPING = {
  'Customer ID': 'customerId',
  'Company ID': 'merchantId',
  'Customer FirstName': 'customerFirstName',
  'Customer LastName': 'customerLastName',
  'Branch ID': 'branchId',
  'Email': 'customerEmail',
  'Phone': 'customerMobile',
};

exports.uploadAndParseCustomer = (isCourierCustomer) => async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded', success: false, errors: [] });
    }

    const results = [];
    const errors = [];
    const uniqueCustomerIds = new Set();

    const mapRowToSchema = (headers, row) => {
      const mappedRow = {};
      Object.keys(HEADER_MAPPING).forEach((header) => {
        const fileColumnIndex = headers.indexOf(header);

        if (fileColumnIndex !== -1) {
          // If the header exists in the file, map its value
          mappedRow[HEADER_MAPPING[header]] = row[fileColumnIndex] || '';
        } else {
          // If the header doesn't exist, assign a default value
          mappedRow[HEADER_MAPPING[header]] = '';
        }
      });
      // Check if all values are empty, 0, or blank
      const hasValidValue = Object.values(mappedRow).some(value =>
        value !== '' && value !== 0 && !(Array.isArray(value) && value.length === 0)
      );

      return hasValidValue ? mappedRow : null;
    };


    for (const file of req.files) {
      const fileResults = [];
      const fileErrors = [];

      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        await new Promise((resolve, reject) => {
          const rows = [];
          bufferStream
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', () => {
              const headers = Object.keys(rows[0]);

              rows.forEach((row) => {
                const rowData = Object.values(row)
                const filteredRow = []
                const updatedHeading = []
                headers.forEach((head, index) => {
                  if (head && Object.keys(HEADER_MAPPING).includes(head)) {
                    updatedHeading.push(head);
                    filteredRow.push(rowData[index])
                  }
                })
                const mappedRow = mapRowToSchema(updatedHeading, filteredRow);
                if (mappedRow) {
                  if (mappedRow.customerId) {
                    if (!uniqueCustomerIds.has(mappedRow.customerId)) {
                      uniqueCustomerIds.add(mappedRow.customerId);
                      fileResults.push(mappedRow);
                    }
                  } else {
                    fileErrors.push({ fileName: file.originalname, Error: `Missing required data in row: ${JSON.stringify(row)}` });
                  }
                }

              });
              resolve();
            })
            .on('error', (err) => {
              fileErrors.push({ fileName: file.originalname, Error: err.message });
              reject(err);
            });
        });
      } else {
        fileResults.push({ fileName: file.originalname, Error: 'Unsupported file type' });
      }

      if (fileResults.length > 0) results.push(...fileResults);
      if (fileErrors.length > 0) errors.push(...fileErrors);
    }

    // Validate for duplicates in the database
    const allCustomerIds = results.map(customer => customer.customerId);
    const existingCustomers = await CustomerModal.find({ customerId: { $in: allCustomerIds } }, { customerId: 1 });
    const duplicateCustomerIds = new Set(existingCustomers.map(customer => customer.customerId));

    if (duplicateCustomerIds.size > 0) {
      return res.status(400).json({
        error: 'Duplicate Customer IDs found in the file.',
        success: false,
        errors: [
          { Error: Array.from(duplicateCustomerIds).join(', '), fileName: req.files?.map(file => file.originalname).join(', ') }
        ]
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Error parsing files', errors, success: false });
    }

    if (results.length > 0) {
      const updatedResult = results.map(item => ({
        customerId: item.customerId,
        merchantId: item.merchantId,
        branchId: item.branchId,
        isSwishrCourierCustomer: isCourierCustomer,
        personalDetails: {
          firstName: item.customerFirstName,
          lastName: item.customerLastName,
          email: item.customerEmail,
          mobile: item.customerMobile,
        }
      }));
      await CustomerModal.insertMany(updatedResult);
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Error parsing files:', error);
    return res.status(500).json({ error: 'Internal Server Error', success: false, errors: [{ Error: error.message, fileName: req.files?.map(file => file.originalname).join(', ') }] });
  }
};


exports.addCustomer = (isCourierCustomer)  => async (req, res) => {
  const { customerFirstName, customerLastName, customerEmail, customerMobile, customerAddress, customerArea, customerPost, profileImg, registrationDate, registrationMethod, dob, zone, merchantId, branchId } = req.body;
  try {
    // Check if a customer with the same customerId already exists
    const existingCustomer = await CustomerModal.findOne({ 'personalDetails.email': customerEmail });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this Email already exists', success: false, errors: [] });
    }

    const customerId = await getNextId('customerId', 100);

    const matches = profileImg?.match(/^data:(image\/([^;]+));base64,(.+)$/);

    let imageUrl;

    if (!matches) {
      // return res.status(400).json({ message: 'Invalid image format', success: false, errors: [] });
    }
    else {
      const imageType = matches[2]; // e.g., 'png', 'jpeg'
      const imgName = `customer_${customerId.toString()}.${imageType}`;
      imageUrl = await uploadBase64Image(profileImg, imgName);
    }

    // Create a new customer
    const customer = new CustomerModal({
      customerId,
      merchantId,
      personalDetails: {
        firstName: customerFirstName,
        lastName: customerLastName,
        email: customerEmail,
        mobile: customerMobile,
        address: customerAddress,
        area: customerArea,
        post: customerPost,
        profileImg: imageUrl || null,
        dob: dob || null,
      },
      registrationDate: registrationDate || Date.now(),
      registrationMethod: registrationMethod || 'Web', // Default to 'Web' if not provided
      zone: zone || 'London',
      branchId,
      isSwishrCourierCustomer: isCourierCustomer
    });

    await customer.save();
    res.status(200).json({ message: 'Customer added successfully', customer, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllCustomerDetails = (isCourierCustomer) => async (req, res) => {
  try {
    const { customerId, customerFirstName, customerLastName, customerEmail, customerMobile, zone, startDate, endDate, merchantId, pageNo = 1, limit = 10, sort } = req.query

    const page = parseInt(pageNo, 10) || 1;
    const limitValue = parseInt(limit, 10) || 10;

    const matchStage = {};
    matchStage.isSwishrCourierCustomer = isCourierCustomer

    // Add filters dynamically
    if (merchantId) {
      const merchantIds = merchantId.split(',').map(id => parseInt(id.trim(), 10));
      matchStage.merchantId = { $in: merchantIds };
    }
    if (customerId) {
      const customerIds = customerId.split(',').map(id => parseInt(id, 10));
      matchStage.customerId = { $in: customerIds };
    }
    if (zone) matchStage.zone = { $in: zone.split(',') };
    if (customerFirstName) {
      matchStage['personalDetails.firstName'] = { $regex: customerFirstName, $options: 'i' };
    }
    if (customerLastName) {
      matchStage['personalDetails.lastName'] = { $regex: customerLastName, $options: 'i' };
    }
    if (customerEmail) {
      matchStage['personalDetails.email'] = { $regex: customerEmail, $options: 'i' };
    }
    if (customerMobile) {
      matchStage['personalDetails.mobile'] = { $regex: customerMobile, $options: 'i' };
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

      matchStage.registrationDate = { $gte: start, $lte: end };
    }

    const sortStage = {};
    if (sort === 'ascFirstName') sortStage.customerFirstName = 1;
    if (sort === 'descFirstName') sortStage.customerFirstName = -1;
    if (sort === 'ascLastName') sortStage.customerLastName = 1;
    if (sort === 'descLastName') sortStage.customerLastName = -1;
    if (sort === 'ascRegistrationDate') sortStage.registrationDate = 1;
    if (sort === 'descRegistrationDate') sortStage.registrationDate = -1;

    // Aggregate pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders', // Match your orders collection name
          let: { customerId: { $toString: '$customerId' } }, // Convert customerId to string
          pipeline: [
            { $match: { $expr: { $eq: ['$customerId', '$$customerId'] } } }, // Match customerId
          ],
          as: 'orders',
        },
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' }, // Count orders for each customer
        },
      },
      {
        $project: {
          customerId: 1,
          merchantId: 1,
          customerFirstName: '$personalDetails.firstName',
          customerLastName: '$personalDetails.lastName',
          customerEmail: '$personalDetails.email',
          customerMobile: '$personalDetails.mobile',
          customerAddress: '$personalDetails.address',
          profileImg: '$personalDetails.profileImg',
          customerDOB: '$personalDetails.dob',
          registrationDate: 1,
          zone: 1,
          totalOrders: 1,
          branchId: 1,
          isSwishrCourierCustomer: 1
        },
      },
      ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
      { $skip: (page - 1) * limitValue },
      { $limit: limitValue },
    ];

    // Fetch data and count total customers
    const [customers, totalCount] = await Promise.all([
      CustomerModal.aggregate(pipeline).collation({ locale: 'en', strength: 2 }),
      CustomerModal.countDocuments(matchStage),
    ]);

    const totalPages = Math.ceil(totalCount / limitValue);

    res.status(200).json({
      customer: customers,
      currentPage: page,
      totalPages,
      totalCount,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.editCustomer = async (req, res) => {
  const updates = req.body; // Array of updates

  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided', success: false, errors: [] });
    }

    const updatePromises = updates.map(async (update) => {
      const { customerId, customerFirstName, customerLastName, merchantId, customerEmail, customerMobile, customerAddress, profileImg, registrationDate, registrationMethod, dob, zone, branchId } = update;

      const customer = await CustomerModal.findOne({ customerId: parseInt(customerId, 10) });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found', success: false, errors: [`Customer with ID ${customerId} not found`] });
      }

      // Update fields if provided, otherwise keep existing values
      if ('customerFirstName' in update) customer.personalDetails.firstName = customerFirstName;
      if ('customerLastName' in update) customer.personalDetails.lastName = customerLastName;
      if ('merchantId' in update) customer.merchantId = merchantId;
      if ('customerEmail' in update) customer.personalDetails.email = customerEmail;
      if ('customerMobile' in update) customer.personalDetails.mobile = customerMobile;
      if ('customerAddress' in update) customer.personalDetails.address = customerAddress;
      if ('dob' in update) customer.personalDetails.dob = dob;
      if ('registrationDate' in update) customer.registrationDate = registrationDate;
      if ('registrationMethod' in update) customer.registrationMethod = registrationMethod;
      if ('zone' in update) customer.zone = zone;
      if ('branchId' in update) customer.branchId = branchId;

      // Handle image update if a new image is provided
      if (profileImg && typeof profileImg === 'string') {
        const matches = profileImg.match(/^data:(image\/([^;]+));base64,(.+)$/);
        if (!matches) {
          return res.status(400).json({ message: 'Invalid image format' });
        }

        const imageType = matches[2]; // e.g., 'png', 'jpeg'
        const imgName = `customer_${customerId.toString()}.${imageType}`;
        const imageUrl = await uploadBase64Image(profileImg, imgName);
        customer.personalDetails.profileImg = imageUrl || null;
      }

      await customer.save();
      return { customerId, success: true, message: 'Customer updated successfully' };
    });

    const results = await Promise.all(updatePromises);

    res.status(200).json({ results, success: true });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.query;
  try {
    // Parse the IDs into an array
    const ids = id.includes(',') ? id.split(',').map(Number) : [parseInt(id, 10)];

    // Fetch customers to get their profile image paths before deletion
    const customers = await CustomerModal.find({ customerId: { $in: ids } });

    if (!customers.length) {
      return res.status(404).json({
        error: 'No customer found for the given ID(s)',
        success: false,
        errors: []
      });
    }

    // Delete profile images
    for (const customer of customers) {
      const profileImgPath = customer.personalDetails.profileImg;
      if (profileImgPath) {
        await deleteBlob(profileImgPath);
      }
    }

    // Delete customers from the database
    const result = await CustomerModal.deleteMany({ customerId: { $in: ids } });

    res.status(200).json({
      message: 'Customers deleted successfully',
      deletedCount: result.deletedCount,
      success: true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.getCustomerById = async (req, res) => {
  const { id } = req.params; // Assuming 'id' is actually the 'customerId'
  try {
    const customer = await CustomerModal.findOne({ customerId: id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getCustomerOrderHistory = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: "customerId is required" });
    }

    const numericCustomerId = Number(customerId); // Ensure consistent type

    // Run queries concurrently for better performance
    const [
      recentOrder,
      totalOrders,
      totalOrderValueData,
      refundData,
      recentRefund,
      topOrderedItems,
      recentFeedback
    ] = await Promise.all([
      // Fetch the most recent order
      OrderModal.findOne(
        { customerId: numericCustomerId },
        { orderId: 1, orderDate: 1, orderItems: 1, invoiceId: 1, invoiceDate: 1, _id: 0 }
      ).sort({ orderDate: -1 }),

      // Get total count of orders
      OrderModal.countDocuments({ customerId: numericCustomerId }),

      // Calculate total order value
      OrderModal.aggregate([
        { $match: { customerId: numericCustomerId } },
        { $group: { _id: null, totalOrderValue: { $sum: "$subTotal" } } }
      ]),

      // Fetch refund statistics
      RefundModal.aggregate([
        { $match: { customerId: numericCustomerId } },
        {
          $group: {
            _id: null,
            totalRefunds: { $sum: 1 },
            totalRefundAmount: { $sum: "$refundAmount" }
          }
        }
      ]),

      // Fetch the most recent refund
      RefundModal.findOne(
        { customerId: numericCustomerId },
        { orderId: 1, orderDate: 1, refundAmount: 1, refundReason: 1, refundCaptureDate: 1, invoiceId: 1, invoiceDate: 1, _id: 0 }
      ).sort({ refundCaptureDate: -1 }),

      // Fetch top 5 most ordered products by the customer
      OrderModal.aggregate([
        { $match: { customerId: numericCustomerId } },
        { $unwind: "$orderItems" }, // Flatten orderItems array
        {
          $group: {
            _id: "$orderItems.product", // Group by product name
            totalOrders: { $sum: 1 }, // Count how many orders contain this item
            totalQuantity: { $sum: "$orderItems.quantity" } // Sum total quantity ordered
          }
        },
        { $sort: { totalQuantity: -1 } }, // Sort by highest quantity ordered
        { $limit: 3 } // Get top 3 most ordered products
      ]),

      // Recent Feedback
      FeedbackModal.find(
        { customerId: numericCustomerId },
        {orderId: 1, rating: 1, suggestion: 1, feedbackDate: 1, _id: 0 }
      ).sort({ feedbackDate: -1 }).limit(3),
      
    ]);

    // Extract total order value
    const totalOrderValue = totalOrderValueData.length > 0 ? totalOrderValueData[0].totalOrderValue : 0;

    // Extract refund data
    const totalRefunds = refundData.length > 0 ? refundData[0].totalRefunds : 0;
    const totalRefundAmount = refundData.length > 0 ? refundData[0].totalRefundAmount : 0;

    res.status(200).json({
      totalOrders,
      totalOrderValue,
      recentOrder,
      totalRefunds,
      totalRefundAmount,
      recentRefund,
      topOrderedItems,
      recentFeedback
    });

  } catch (error) {
    console.error("Error fetching customer order history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.searchSwishrCourierCustomer = async (req, res) => {
  let { searchQuery, pageNo = 1, limit = 10 } = req.query;

  try {
      pageNo = parseInt(pageNo, 10) || 1;
      limit = parseInt(limit, 10) || 10;

      let query = { isSwishrCourierCustomer: true };

      if (searchQuery) {
          const isNumeric = /^\d+$/.test(searchQuery); // Check if searchQuery is a number

          if (isNumeric) {
            query.customerId = parseInt(searchQuery, 10);
          } else {
            query.$or = [
              { "personalDetails.firstName": { $regex: searchQuery, $options: 'i' } },
              { "personalDetails.lastName": { $regex: searchQuery, $options: 'i' } },
          ];
          }
      }

      // Count total matching documents
      const totalCount = await CustomerModal.countDocuments(query);

      // Fetch paginated results
      const customers = await CustomerModal.find(query)
          .select('customerId personalDetails.firstName personalDetails.lastName personalDetails.email  personalDetails.address')
          .skip((pageNo - 1) * limit)
          .limit(limit);

      if (!customers.length) {
          return res.status(404).json({
              message: 'No customers found',
              success: false,
              errors: [],
          });
      }

      const formattedCustomers = customers.map(customer => ({
        customerId: customer.customerId,
        customerName: `${customer.personalDetails?.firstName || ''} ${customer.personalDetails?.lastName || ''}`?.trim(),
        email: customer.personalDetails?.email || '',
        addressLine1: customer.personalDetails?.address?.line1 || '',
        addressLine2: customer.personalDetails?.address?.line2 || '',
        area: customer.personalDetails?.address?.area || '',
        city: customer.personalDetails?.address?.city || '',
        post: customer.personalDetails?.address?.post || '',
        country: customer.personalDetails?.address?.country || ''
    }));

      res.status(200).json({
          customers : formattedCustomers,
          success: true,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          totalPages: 1,
          currentPage: pageNo,
      });

  } catch (err) {
      console.error("Error searching customers:", err.message);
      res.status(500).json({ message: "Server error", success: false });
  }
};
