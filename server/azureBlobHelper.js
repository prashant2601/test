const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config({ path: './.env' });

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME_UPLOAD_IMAGES = process.env.CONTAINER_NAME_UPLOAD_IMAGES; 
const CONTAINER_NAME_INVOICES = process.env.CONTAINER_NAME_INVOICES;
const CONTAINER_NAME_EXPENSE_RECEIPTS = process.env.CONTAINER_NAME_EXPENSE_RECEIPTS;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('Azure Storage Connection string not found');
}

const uploadBase64Image = async (base64Image, filename) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_UPLOAD_IMAGES);

    const blobName = filename;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' }, // Set content type
    });
    return blockBlobClient.url; 
  } catch (error) {
    console.error('Error uploading image to Azure Blob Storage:', error);
    throw error;
  }
};

const deleteBlob = async (blobName, type) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  let containerClient = null;
  if (!type) {
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_UPLOAD_IMAGES);
  } else if (type === 'invoice') {
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_INVOICES);
  } else if (type === 'expenseReceipt') {
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_EXPENSE_RECEIPTS);
  }

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.deleteIfExists();
    console.log(`Deleted blob: ${blobName}`);
  } catch (error) {
    console.error(`Error deleting blob ${blobName}:`, error.message);
  }
};

const uploadPdfBuffer = async (buffer, filename, type) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    let containerClient = null;
    if (!type){
       containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_INVOICES);
    } else if (type === 'expenseReceipt') {
      containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_EXPENSE_RECEIPTS);
    }

    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    // Get file extension and determine content type
    const fileExtension = filename.split('.').pop().toLowerCase();
    let contentType = 'application/pdf';  // default to PDF

    // Map common image extensions to their content types
    const imageTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp'
    };

    if (imageTypes[fileExtension]) {
      contentType = imageTypes[fileExtension];
    }

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading file to Azure Blob Storage:', error);
    throw error;
  }
};

module.exports = { uploadBase64Image, deleteBlob, uploadPdfBuffer };
