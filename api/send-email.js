import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Validate required environment variables
const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM_EMAIL',
  'SMTP_TO_EMAIL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
let transporter;

if (missingEnvVars.length === 0) {
  try {
    // Create transporter
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      logger: true,
      debug: true
    });

    transporter.verify((error) => {
      if (error) {
        console.error('❌ SMTP Connection Failed:', error);
      } else {
        console.log('✅ SMTP Connection Verified');
      }
    });
  } catch (error) {
    console.error('❌ Failed to create SMTP transporter:', error);
  }
} else {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
}

// Email template function (same as original)

function generateEmailHTML(data) {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          /* Reset styles */
          body, p, h1, h2, h3, div, span {
            margin: 0;
            padding: 0;
            line-height: 1.6;
            font-family: Arial, sans-serif;
          }

          .email-wrapper {
            background-color: #f8f9fa;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }

          .email-header {
            background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }

          .header-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
          }

          .email-content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .info-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }

          .info-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }

          .section-title {
            font-size: 18px;
            color: #1a1a1a;
            font-weight: bold;
            margin-bottom: 15px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .info-item {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }

          .info-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }

          .info-value {
            font-size: 16px;
            color: #333;
            font-weight: 500;
          }

          .budget-tag {
            display: inline-block;
            padding: 6px 12px;
            background-color: #e3f2fd;
            color: #1976d2;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
          }

          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }

          .highlight {
            color: #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-header">
            <div class="header-title">New Project Inquiry</div>
            <div class="header-subtitle">A potential client has submitted a project request</div>
          </div>
          
          <div class="email-content">
            <div class="info-section">
              <div class="section-title">Client Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Name</div>
                  <div class="info-value">${data.name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Company</div>
                  <div class="info-value">${data.company}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${data.email}</div>
                </div>
              </div>
            </div>

            <div class="info-section">
              <div class="section-title">Project Details</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Project Goal</div>
                  <div class="info-value">${data.goal}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Desired Completion</div>
                  <div class="info-value">${formatDate(data.date)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Budget Range</div>
                  <div class="info-value">
                    <span class="budget-tag">${data.budget}</span>
                  </div>
                </div>
              </div>
            </div>

            ${data.details ? `
            <div class="info-section">
              <div class="section-title">Additional Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-value">${data.details}</div>
                </div>
              </div>
            </div>
            ` : ''}

            <div class="footer">
              <p>This inquiry was received on ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Main endpoint handler
app.post('/', async (req, res) => {
  if (!transporter) {
    return res.status(500).json({ 
      success: false, 
      message: 'Email service not configured properly' 
    });
  }

  try {
    const requiredFields = ['name', 'email', 'goal', 'date', 'budget'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const mailData = {
      from: {
        name: 'Liquidata Contact Form',
        address: process.env.SMTP_FROM_EMAIL
      },
      to: process.env.SMTP_TO_EMAIL,
      subject: 'New Contact Form Submission - Liquidata',
      html: generateEmailHTML(req.body),
      replyTo: req.body.email
    };

    const info = await transporter.sendMail(mailData);
    
    res.json({ 
      success: true, 
      messageId: info.messageId,
      response: info.response
    });
  } catch (error) {
    console.error('❌ Email failed', error);
    
    let errorMessage = 'Failed to send email';
    let statusCode = 500;
    
    if (error.code === 'EAUTH') statusCode = 503;
    else if (error.code === 'ECONNECTION') statusCode = 503;
    else if (error.code === 'ETIMEDOUT') statusCode = 504;
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


export default app;
