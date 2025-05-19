const feedbackTemplate = (emailParams) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Feedback</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        .feedback-buttons a:hover {
            background-color: rgb(105, 35, 228) !important;
        }
        
        .footer-links a {
            white-space: nowrap;
        }
        
        @media screen and (max-width: 600px) {
            .content-div {
                width: 90% !important;
                padding: 15px !important;
                margin: 0 auto !important;
            }
            
            .content-div h2 {
                font-size: 16px !important;
            }
            
            .content-div h1, .content-div h1 span {
                font-size: 15px !important;
            }
            
            .content-div p {
                font-size: 14px !important;
            }
            
            .order-details p, .order-details li {
                font-size: 13px !important;
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
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <div style="width: 100%; max-width: 850px; margin: 0 auto; background-color: #ffffff;">
        <!-- Banner -->
        <div style="width: 100%;">
            <img src="https://swishrstorage.blob.core.windows.net/photos-public/swishr_header.jpeg" alt="Swishr Logo" style="width: 100%; height: auto; display: block;">
        </div>

        <!-- Content -->
        <div style="padding: 25px; width: 70%; margin: 0 auto;" class="content-div">
            <h2 style="font-size: 20px; color: #333; margin-bottom: 10px; text-align: center;">
                Hi ${emailParams.customerName},
            </h2>
            <h1 style="font-size: 18px; color: #333; margin-bottom: 20px; text-align: center;">
                How was your last order from <span style="color: #7C3AED; font-size: 18px;">${emailParams.branchName}</span>!
            </h1>

            <!-- Order Details -->
            <div class="order-details" style="background-color: #f8f8f8; padding: 15px; margin-bottom: 25px; border-left: 4px solid #7C3AED;">
                <p style="margin: 6px 0; color: #444; font-size: 14px;"><strong>Order ID:</strong> ${emailParams.orderId}</p>
                <p style="margin: 6px 0; color: #444; font-size: 14px;"><strong>Date:</strong> ${emailParams.orderDate}</p>
                <p style="margin: 6px 0; color: #444; font-size: 14px;"><strong>Items Ordered:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                    ${(emailParams.orderItems || []).map(item => `<li style="color: #444; font-size: 14px;">${item.product} - (Qty: ${item.quantity})</li>`).join("")}
                </ul>
            </div>

            <p style="font-size: 14px; color: #555; margin-bottom: 20px; text-align: center; line-height: 1.5;">
                Please help other customers by giving us your thoughts on your order from <span style="color: #7C3AED;">${emailParams.branchName}</span>. Thanks in advance for your feedback.
            </p>

            <div style="text-align: center; margin-bottom: 25px;">
                <p style="font-size: 16px; color: #555; margin-bottom: 10px;">
                    <strong>How to review your order?</strong>
                </p>
                <p style="font-size: 14px; color: #555; line-height: 1.5;">
                    Log into your My Swishr Account through the Swishr app or online, select the order, and share your thoughts.
                </p>
            </div>

            <!-- Feedback Buttons -->
            <div style="text-align: center; margin: 25px 0;" class="feedback-buttons">
                <p style="font-size: 16px; color: #555; margin-bottom: 10px;">
                    <strong>Would you recommend them?</strong>
                </p>
                <a href="${emailParams.feedbackUrl}&response=yes" style="display: inline-block; background-color: #7C3AED; color: #ffffff; padding: 12px 60px; text-decoration: none; border-radius: 5px; margin: 8px; font-weight: bold; font-size: 14px;">Yes</a>
                <br>
                <a href="${emailParams.feedbackUrl}&response=no" style="display: inline-block; background-color: #7C3AED; color: #ffffff; padding: 12px 35px; text-decoration: none; border-radius: 5px; margin: 8px; font-weight: bold; font-size: 14px;">No</a>
            </div>
        </div>

        <!-- Footer -->
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

module.exports = feedbackTemplate;