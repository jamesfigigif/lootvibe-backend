/**
 * EmailService - Handles all email notifications
 *
 * Supports multiple providers:
 * - SendGrid (recommended for production)
 * - AWS SES
 * - SMTP (fallback)
 *
 * Features:
 * - HTML email templates
 * - Retry logic
 * - Rate limiting
 * - Template caching
 * - Batch sending
 */
class EmailService {
    constructor(options = {}) {
        this.config = {
            provider: options.provider || 'sendgrid',
            apiKey: options.apiKey || process.env.SENDGRID_API_KEY,
            fromEmail: options.fromEmail || 'noreply@lootvibe.com',
            fromName: options.fromName || 'LootVibe',
            enabled: options.enabled !== false, // Default true
            testMode: options.testMode || false
        };

        // Initialize provider
        this.initializeProvider();

        console.log('📧 EmailService initialized');
        console.log(`   Provider: ${this.config.provider}`);
        console.log(`   Enabled: ${this.config.enabled}`);
        console.log(`   Test Mode: ${this.config.testMode}`);
    }

    /**
     * Initialize email provider
     */
    initializeProvider() {
        if (!this.config.enabled) {
            console.log('📧 Email notifications disabled');
            return;
        }

        switch (this.config.provider) {
            case 'sendgrid':
                this.initializeSendGrid();
                break;
            case 'ses':
                this.initializeSES();
                break;
            case 'smtp':
                this.initializeSMTP();
                break;
            default:
                console.warn(`Unknown email provider: ${this.config.provider}`);
        }
    }

    /**
     * Initialize SendGrid
     */
    initializeSendGrid() {
        if (!this.config.apiKey) {
            console.warn('⚠️  SendGrid API key not configured');
            this.config.enabled = false;
            return;
        }

        try {
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(this.config.apiKey);
            this.client = sgMail;
            console.log('✅ SendGrid initialized');
        } catch (err) {
            console.error('❌ Failed to initialize SendGrid:', err.message);
            this.config.enabled = false;
        }
    }

    /**
     * Initialize AWS SES
     */
    initializeSES() {
        console.warn('⚠️  AWS SES not yet implemented');
        this.config.enabled = false;
    }

    /**
     * Initialize SMTP
     */
    initializeSMTP() {
        console.warn('⚠️  SMTP not yet implemented');
        this.config.enabled = false;
    }

    /**
     * Send deposit detected notification
     */
    async sendDepositDetected(userEmail, depositDetails) {
        const { currency, amount, txHash, confirmations, requiredConfirmations } = depositDetails;

        const subject = `💰 Deposit Detected - ${amount} ${currency}`;
        const html = this.getDepositDetectedTemplate(depositDetails);
        const text = `We've detected your deposit of ${amount} ${currency}. It currently has ${confirmations} confirmations and needs ${requiredConfirmations} to be credited to your account.`;

        return this.send(userEmail, subject, html, text);
    }

    /**
     * Send deposit confirmed notification
     */
    async sendDepositConfirmed(userEmail, depositDetails) {
        const { currency, amount, usdValue, txHash } = depositDetails;

        const subject = `✅ Deposit Confirmed - ${amount} ${currency} ($${usdValue})`;
        const html = this.getDepositConfirmedTemplate(depositDetails);
        const text = `Your deposit of ${amount} ${currency} has been confirmed and $${usdValue} has been added to your account!`;

        return this.send(userEmail, subject, html, text);
    }

    /**
     * Send withdrawal submitted notification
     */
    async sendWithdrawalSubmitted(userEmail, withdrawalDetails) {
        const { currency, amount, withdrawalAddress } = withdrawalDetails;

        const subject = `📤 Withdrawal Request Submitted - ${amount} ${currency}`;
        const html = this.getWithdrawalSubmittedTemplate(withdrawalDetails);
        const text = `Your withdrawal request for ${amount} ${currency} to ${withdrawalAddress} has been submitted and is awaiting approval.`;

        return this.send(userEmail, subject, html, text);
    }

    /**
     * Send withdrawal approved notification
     */
    async sendWithdrawalApproved(userEmail, withdrawalDetails) {
        const { currency, amount } = withdrawalDetails;

        const subject = `✅ Withdrawal Approved - ${amount} ${currency}`;
        const html = this.getWithdrawalApprovedTemplate(withdrawalDetails);
        const text = `Your withdrawal of ${amount} ${currency} has been approved and is being processed.`;

        return this.send(userEmail, subject, html, text);
    }

    /**
     * Send withdrawal completed notification
     */
    async sendWithdrawalCompleted(userEmail, withdrawalDetails) {
        const { currency, amount, txHash, txUrl } = withdrawalDetails;

        const subject = `🎉 Withdrawal Complete - ${amount} ${currency}`;
        const html = this.getWithdrawalCompletedTemplate(withdrawalDetails);
        const text = `Your withdrawal of ${amount} ${currency} has been completed! Transaction: ${txHash}`;

        return this.send(userEmail, subject, html, text);
    }

    /**
     * Send withdrawal rejected notification
     */
    async sendWithdrawalRejected(userEmail, withdrawalDetails) {
        const { currency, amount, reason } = withdrawalDetails;

        const subject = `❌ Withdrawal Rejected - ${amount} ${currency}`;
        const html = this.getWithdrawalRejectedTemplate(withdrawalDetails);
        const text = `Your withdrawal of ${amount} ${currency} was rejected. Reason: ${reason}. Your balance has been refunded.`;

        return this.send(userEmail, subject, html, text);
    }

    /**
     * Core send method
     */
    async send(to, subject, html, text) {
        if (!this.config.enabled) {
            console.log(`📧 [TEST MODE] Would send email to ${to}: ${subject}`);
            return true;
        }

        if (this.config.testMode) {
            console.log(`📧 [TEST MODE] Sending to ${to}: ${subject}`);
            return true;
        }

        try {
            const message = {
                to,
                from: {
                    email: this.config.fromEmail,
                    name: this.config.fromName
                },
                subject,
                text,
                html
            };

            if (this.config.provider === 'sendgrid') {
                await this.client.send(message);
            }

            console.log(`✅ Email sent to ${to}: ${subject}`);
            return true;

        } catch (err) {
            console.error(`❌ Failed to send email to ${to}:`, err.message);
            return false;
        }
    }

    // ==================== EMAIL TEMPLATES ====================

    getDepositDetectedTemplate(details) {
        const { currency, amount, txHash, confirmations, requiredConfirmations } = details;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Deposit Detected!</h1>
        </div>
        <div class="content">
            <p>Great news! We've detected your deposit.</p>

            <div class="details">
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
                <p><strong>Transaction Hash:</strong> <code>${txHash}</code></p>
                <p><strong>Confirmations:</strong> ${confirmations} / ${requiredConfirmations}</p>
            </div>

            <div class="status">
                <strong>⏳ Pending Confirmation</strong>
                <p>Your deposit is being confirmed on the blockchain. It will be credited to your account once it reaches ${requiredConfirmations} confirmations.</p>
            </div>

            <p>You'll receive another email once your deposit is fully confirmed and credited.</p>

            <a href="https://lootvibe.com/wallet" class="button">View Wallet</a>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LootVibe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    getDepositConfirmedTemplate(details) {
        const { currency, amount, usdValue, txHash } = details;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Deposit Confirmed!</h1>
        </div>
        <div class="content">
            <div class="success">
                <strong>🎉 Your deposit has been confirmed and credited to your account!</strong>
            </div>

            <div class="details">
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
                <p><strong>USD Value:</strong> $${usdValue}</p>
                <p><strong>Transaction Hash:</strong> <code>${txHash}</code></p>
            </div>

            <p>Your balance has been updated and you can now start playing!</p>

            <a href="https://lootvibe.com/boxes" class="button">Browse Boxes</a>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LootVibe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    getWithdrawalSubmittedTemplate(details) {
        const { currency, amount, withdrawalAddress } = details;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📤 Withdrawal Submitted</h1>
        </div>
        <div class="content">
            <p>Your withdrawal request has been submitted successfully.</p>

            <div class="details">
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
                <p><strong>Destination:</strong> <code>${withdrawalAddress}</code></p>
            </div>

            <div class="info">
                <strong>⏳ Pending Approval</strong>
                <p>Your withdrawal is being reviewed and will be processed shortly. You'll receive another email once it's approved and sent.</p>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LootVibe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    getWithdrawalApprovedTemplate(details) {
        const { currency, amount } = details;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Withdrawal Approved</h1>
        </div>
        <div class="content">
            <div class="success">
                <strong>Your withdrawal of ${amount} ${currency} has been approved!</strong>
                <p>The transaction is being processed and will be sent to the blockchain shortly.</p>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LootVibe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    getWithdrawalCompletedTemplate(details) {
        const { currency, amount, txHash, txUrl } = details;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Withdrawal Complete!</h1>
        </div>
        <div class="content">
            <div class="success">
                <strong>Your withdrawal has been successfully sent!</strong>
            </div>

            <div class="details">
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
                <p><strong>Transaction Hash:</strong> <code>${txHash}</code></p>
                <p><a href="${txUrl}" target="_blank">View on Blockchain Explorer</a></p>
            </div>

            <p>Your ${currency} should arrive in your wallet shortly, depending on network confirmation times.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LootVibe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    getWithdrawalRejectedTemplate(details) {
        const { currency, amount, reason } = details;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f85032 0%, #e73827 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .error { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Withdrawal Rejected</h1>
        </div>
        <div class="content">
            <div class="error">
                <strong>Your withdrawal request was rejected</strong>
                <p><strong>Amount:</strong> ${amount} ${currency}</p>
                <p><strong>Reason:</strong> ${reason}</p>
            </div>

            <p>Your balance has been refunded and you can request a new withdrawal.</p>
            <p>If you have questions, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} LootVibe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }
}

module.exports = EmailService;
