require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Enable CORS
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

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Log configuration (mask sensitive data)
console.log('ℹ️  SMTP Configuration:');
console.log(`   Host: ${process.env.SMTP_HOST}`);
console.log(`   Port: ${process.env.SMTP_PORT}`);
console.log(`   User: ${process.env.SMTP_USER}`);
console.log(`   From: ${process.env.SMTP_FROM_EMAIL}`);
console.log(`   To:   ${process.env.SMTP_TO_EMAIL}`);
console.log('   Pass: **********');

// Create reusable transporter object
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    logger: true, // Enable built-in logging
    debug: true   // Output SMTP traffic
  });

  // Add event listeners for better debugging
  transporter.on('log', console.log);
  transporter.on('error', (error) => {
    console.error('🚨 SMTP Transport Error:', error);
  });
} catch (error) {
  console.error('❌ Failed to create SMTP transporter:', error);
  process.exit(1);
}

// Test SMTP connection on startup
async function testSMTPConnection() {
  try {
    console.log('🔌 Testing SMTP connection...');
    const verified = await transporter.verify();
    if (verified) {
      console.log('✅ SMTP Connection Verified');
      return true;
    }
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', error);
    return false;
  }
}

// Perform connection test on startup
testSMTPConnection()
  .then(success => {
    if (!success) {
      console.error('⛔ SMTP connection test failed. Server will still start, but email sending may fail.');
    }
  })
  .catch(err => console.error('SMTP Test Error:', err));

// Email template function remains the same

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

app.post('/send-email', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('\n📨 Received email request');
    console.log('   Client IP:', req.ip);
    console.log('   Request Body:', JSON.stringify({
      ...req.body,
      details: req.body.details ? `${req.body.details.substring(0, 50)}...` : 'None'
    }));

    if (!req.body || typeof req.body !== 'object') {
      throw new Error('Invalid request body');
    }

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
      // to: process.env.SMTP_TO_EMAIL,
        to: "anupm019@gmail.com,
      subject: 'New Contact Form Submission - Liquidata',
      html: generateEmailHTML(req.body),
      replyTo: req.body.email
    };

    console.log('✉️  Sending email...');
    const info = await transporter.sendMail(mailData);
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Email sent in ${elapsed}ms`);
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    res.json({ 
      success: true, 
      messageId: info.messageId,
      response: info.response
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Email failed after ${elapsed}ms`, error);
    
    let errorMessage = 'Failed to send email';
    let statusCode = 500;
    
    // Handle specific SMTP errors
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed';
      statusCode = 503;
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'SMTP server connection failed';
    statusCode = 503;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection timed out';
      statusCode = 504;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`\n🚀 Server running on port ${port}`);
  console.log('---------------------------------');
});
