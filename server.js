const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
if (!resend) console.warn("WARNING: RESEND_API_KEY is missing! Emails will be skipped.");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// Helper to format generic JSON body into an HTML table for the email
function formatBodyToHTML(data) {
    let html = '<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: sans-serif;">';
    for (const [key, value] of Object.entries(data)) {
        html += `<tr><td style="background-color: #f8f9fa; font-weight: bold; width: 30%;">${key}</td><td>${value}</td></tr>`;
    }
    html += '</table>';
    return html;
}

// 1. Checkout Order Endpoint
app.post('/api/checkout', async (req, res) => {
    console.log("New Checkout Order Received:", req.body);
    
    if (resend) {
        try {
            await resend.emails.send({
                from: 'Vaperaus Orders <orders@perthconsulting.agency>',
                to: ['psyfaktz@gmail.com'], // Update to your preferred admin email
                subject: '🚨 NEW VAPERAUS ORDER RECEIVED',
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <h2 style="color: #d4af37;">New Checkout Order</h2>
                        <p>A new order has been submitted via the Vaperaus website.</p>
                        <br/>
                        ${formatBodyToHTML(req.body)}
                    </div>
                `
            });
        } catch (error) {
            console.error("Resend Error on Checkout:", error);
        }
    }
    res.status(200).json({ message: "Order processed successfully." });
});

// 2. Contact Team Endpoint
app.post('/api/contact', async (req, res) => {
    console.log("New Contact Message Received:", req.body);
    
    if (resend) {
        try {
            await resend.emails.send({
                from: 'Vaperaus Support <support@perthconsulting.agency>',
                to: ['psyfaktz@gmail.com'], // Update to your preferred admin email
                subject: '✉️ NEW VAPERAUS CONTACT MESSAGE',
                html: `
                    <div style="font-family: sans-serif; color: #333;">
                        <h2>New Contact Message</h2>
                        <p>A user submitted the Contact Our Team form.</p>
                        <br/>
                        ${formatBodyToHTML(req.body)}
                    </div>
                `
            });
        } catch (error) {
            console.error("Resend Error on Contact:", error);
        }
    }
    res.status(200).json({ message: "Message received successfully." });
});

app.listen(PORT, () => console.log(`[SECURE] Vaperaus Backend running on port ${PORT}`));
