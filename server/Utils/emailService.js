const { EmailClient } = require("@azure/communication-email");
require("dotenv").config();

const emailClient = new EmailClient(process.env.AZURE_EMAIL_CONNECTION_STRING);
const senderEmail = "swishr@swishrcourier.com";

const sendEmail = async (recipientEmail, subject, htmlContent,displayName) => {
    try {
        const message = {
            senderAddress: senderEmail,
            recipients: {
                to: [{ address: recipientEmail, displayName: displayName }]
            },
            content: {
                subject,
                html: htmlContent,
            },
        };

        const poller = await emailClient.beginSend(message);
        const result = await poller.pollUntilDone();
        
        if (result.status === "Succeeded") {
            console.log("Email sent successfully");
            return {status: "sent", error: null}
        } else {
            console.log("Email sending failed");
            return {status: "failed", error: "Email sending failed from azure"}
        }
    } catch (error) {
        console.error("Error sending email:", error.message);
        return {status: "failed", error: error.message}
    }
};

module.exports = sendEmail;
