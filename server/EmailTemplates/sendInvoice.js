const sendInvoiceTemplate = ({merchantName, invoiceId, invoiceDate, downloadUrl, fromDate, toDate, invoiceParameters}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      /* Reset styles for email clients */
      body, table, td, div, p, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        margin: 0;
        padding: 0;
      }

      body {
        width: 100% !important;
        height: 100% !important;
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        background-color: #f8f9fa;
      }

      /* Container styles */
      .email-container {
       /* max-width: 600px; */
        margin: 20px auto;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      /* Header styles */
      .header {
        background: #ffffff;
        color: white;
        box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.1);
        text-align: center;
        border: 1px solid #e0e4f0;
      }

      .header h2 {
        margin: 0;
        font-size: 24px;
        color: black;
      }

      /* Content styles */
      .content {
        padding: 20px;
      }

      .invoice-details {
        background: #f8f9fa;
        padding: 20px;
        margin: 20px 0;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
      }

      .invoice-details p {
        margin: 8px 0;
        color: #333;
      }

      /* Table styles */
      .summary-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        background: white;
      }

      .summary-table th,
      .summary-table td {
        padding: 12px;
        border: 1px solid #e0e0e0;
        text-align: center;
      }

      .summary-table th {
        background: #f1f3f5;
        color: #333;
        font-weight: bold;
      }

     .feedback-buttons a:hover {
            background-color:rgb(105, 35, 228) !important;
        }
        
        .footer-links a {
            white-space: nowrap;
        }

      /* Mobile responsiveness */
      @media screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          margin: 10px auto;
        }

        .header h2 {
          font-size: 20px;
        }

        .content {
          padding: 15px;
        }

        .invoice-details {
          padding: 8px;
        }
        .invoice-details p {
          font-size: 12px !important;
        }
        .summary-table {
          font-size: 14px;
        }

        .summary-table th,
        .summary-table td {
          padding: 5px !important;
          font-size: 10px !important;
        }

        .button {
          display: block;
          margin: 0 20px;
          background-color: #1a73e8;
        }
        .button:hover {
          background-color:rgb(5, 94, 203);
        }
          .footer-main{
                padding: 10px 5px !important;
            }
            .footer-table {
                display: table !important;
                width: 100% !important;
            }
            
            .footer-column {
                display: table-cell !important;
                width: 33.33% !important;
                padding: 5px !important;
                vertical-align: top !important;
            }
            
            .footer-column h3 {
                font-size: 10px !important;
                margin-bottom: 8px !important;
            }
            
            .footer-column p {
                font-size: 10px !important;
                line-height: 1.3 !important;
                margin-bottom: 4px !important;
                font-size: 8px !important;
            }
            
            .footer-column a, .footer-column p a {
                font-size: 8px !important;
            }
            
            .footer-description {
                font-size: 10px !important;
                line-height: 1.3 !important;
            }
            
            .app-store-buttons img {
                width: 90px !important;
                height: auto !important;
            }
            .app-store-buttons .img1 {
                width: 85px !important;
                padding-left: 7px !important;
            }
            
            .social-icons img {
                width: 15px !important;
                height: 15px !important;
            }
            
            .footer-logo {
                width: 80px !important;
                margin-bottom: 8px !important;
            }
            
            .social-icons {
                margin-bottom: 12px !important;
            }
            
            .footer-registration {
                font-size: 9px !important;
            }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <div style="width: 100%;">
            <img src="https://swishrstorage.blob.core.windows.net/photos-public/swishr_header.jpeg" alt="Swishr Logo" style="width: 100%; height: auto; display: block;">
        </div>
        <h2 style="text-align: center; margin: 20px 0;">Invoice for <span style="color: #7C3AED">${merchantName}</span></h2>
      </div>

      <div class="content">
        <div class="invoice-details">
          <p><strong>Invoice ID:</strong> ${invoiceId}</p>
          <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
          <p><strong>Invoice Period:</strong> ${fromDate} to ${toDate}</p>
          
          <table class="summary-table">
            <tr>
              <th>Total Orders</th>
              <th>Delivery Orders</th>
              <th>Collection Orders</th>
              <th>Total Sales</th>
              <th>To Be Paid</th>
            </tr>
            <tr>
              <td>${invoiceParameters?.totalOrdersCount || '0'}</td>
              <td>${invoiceParameters?.deliveryOrderCount || '0'}</td>
              <td>${invoiceParameters?.collectionOrderCount || '0'}</td>
              <td>${invoiceParameters?.totalSales || '0'}</td>
              <td>${invoiceParameters?.bankTransfer || '0'}</td>
            </tr>
          </table>
        </div>

        <div class="feedback-buttons" style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #7C3AED; color: #ffffff; padding: 15px 70px; text-decoration: none; border-radius: 5px; margin: 10px; font-weight: bold;">View Invoice</a>
        </div>
      </div>

      <div style="background-color: #000000; color: #ffffff; padding: 10px;" class="footer-main">
            <table class="footer-table" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 800px; margin: 0 auto; border-collapse: collapse;">
                <tr>
                    <td class="footer-column" style="width: 33.33%; vertical-align: top; padding: 15px 5px;">
                        <div style="text-align: center;">
                            <img src="https://swishrstorage.blob.core.windows.net/photos-public/swishr_logo_black.jpeg" alt="Swishr Logo" class="footer-logo" style="width: 120px; height: auto; margin-bottom: 15px;">
                            <p class="footer-description" style="font-size: 13px; line-height: 1.4; margin: 0; text-align: center;">
                                Swishr is a brand new food ordering app launched in the UK.
                            </p>
                            <p class="footer-description" style="font-size: 13px; line-height: 1.4; margin: 0; text-align: center;">
                                Our aim is help restaurants and customer save when ordering online.
                            </p>
                        </div>
                    </td>
                    <td class="footer-column" style="width: 33.33%; vertical-align: top; padding: 15px 10px;">
                        <div class="footer-links" style="padding-left: 15px;">
                            <h3 style="color: #ffffff; margin-bottom: 12px; font-size: 16px;">Useful links</h3>
                            <p style="margin: 0 0 8px 0;"><a href="https://www.swishrcourier.com/about-us" style="color: #ffffff; text-decoration: none; font-size: 13px;">About us</a></p>
                            <p style="margin: 0 0 8px 0;"><a href="https://www.swishrcourier.com/blog" style="color: #ffffff; text-decoration: none; font-size: 13px;">Blog</a></p>
                            <p style="margin: 0 0 8px 0;"><a href="https://www.swishr.co.uk/" style="color: #ffffff; text-decoration: none; font-size: 13px;">Order Food</a></p>
                            <p style="margin: 0 0 8px 0;"><a href="https://www.swishrcourier.com/contact-us" style="color: #ffffff; text-decoration: none; font-size: 13px;">Contact Us</a></p>
                        </div>
                    </td>
                    <td class="footer-column" style="width: 33.33%; vertical-align: top; padding: 15px 5px;">
                        <div>
                            <h3 style="color: #ffffff; margin-bottom: 12px; font-size: 16px;">Contact</h3>
                            <p style="margin: 0 0 8px 0;"><a href="mailto:Couriersupport@swishr.co.uk" style="color: #ffffff; text-decoration: none; font-size: 13px;">Couriersupport@swishr.co.uk</a></p>
                            <p style="margin: 0 0 12px 0;"><a href="https://swishr.ladesk.com/" style="color: #ffffff; text-decoration: none; font-size: 13px;">Help center</a></p>
                            
                            <!-- Social Icons -->
                            <div class="social-icons" style="margin-bottom: 20px;">
                                <a href="https://www.facebook.com/swishrr" style="display: inline-block; margin-right: 6px;"><img src="https://swishrstorage.blob.core.windows.net/photos-public/facebook.jpg" alt="Facebook" width="28" height="28" style="display: inline-block;"></a>
                                <a href="https://www.twitter.com/swishr_uk" style="display: inline-block; margin-right: 6px;"><img src="https://swishrstorage.blob.core.windows.net/photos-public/twitter.jpg" alt="Twitter" width="28" height="28" style="display: inline-block;"></a>
                                <a href="https://www.linkedin.com/company/swishr/" style="display: inline-block; margin-right: 6px;"><img src="https://swishrstorage.blob.core.windows.net/photos-public/linkedin.jpg" alt="LinkedIn" width="28" height="28" style="display: inline-block;"></a>
                                <a href="https://www.instagram.com/swishr_uk" style="display: inline-block;"><img src="https://swishrstorage.blob.core.windows.net/photos-public/instagram.jpg" alt="Instagram" width="28" height="28" style="display: inline-block;"></a>
                            </div>
                            
                            <h3 style="color: #ffffff; margin-bottom: 12px; font-size: 16px;">Download Our Apps</h3>
                            <div class="app-store-buttons">
                                <a href="https://apps.apple.com/gb/app/swishr-food-more/id6680155951" style="display: inline-block; margin-bottom: 5px;"><img src="https://swishrstorage.blob.core.windows.net/photos-public/appleAppStore.jpeg" alt="Download on App Store" style="max-width: 100%;width: 120px; height: auto;"></a>
                                <a href="https://play.google.com/store/apps/details?id=com.swishr.swishrapp" style="display: inline-block; margin-bottom: 5px;"><img src="https://swishrstorage.blob.core.windows.net/photos-public/googlePlay.jpg" alt="Get it on Google Play" style="max-width: 100%; width: 115px; height: 43px; padding-left: 11px" class="img1"></a>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
            
            <div class="footer-registration" style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #333; font-size: 11px; color: #999;">
                Registered in England & Wales No. 15587868 | 128 City Road, London, EC1V 2NX
            </div>
        </div>
    </div>
  </body>
</html>
`;

module.exports = sendInvoiceTemplate;