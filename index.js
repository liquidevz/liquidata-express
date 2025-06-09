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
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
}

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

function generateEmailHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
          }
          .content {
            padding: 20px;
            background: white;
            border-radius: 5px;
            margin-top: 20px;
          }
          .field {
            margin-bottom: 15px;
          }
          .label {
            font-weight: bold;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <p class="label">Name:</p>
              <p>${data.name}</p>
            </div>
            <div class="field">
              <p class="label">Company:</p>
              <p>${data.company}</p>
            </div>
            <div class="field">
              <p class="label">Goal:</p>
              <p>${data.goal}</p>
            </div>
            <div class="field">
              <p class="label">Desired Completion Date:</p>
              <p>${data.date}</p>
            </div>
            <div class="field">
              <p class="label">Budget Range:</p>
              <p>${data.budget}</p>
            </div>
            <div class="field">
              <p class="label">Email:</p>
              <p>${data.email}</p>
            </div>
            ${data.details ? `
            <div class="field">
              <p class="label">Additional Details:</p>
              <p>${data.details}</p>
            </div>
            ` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
}

app.post('/send-email', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw new Error('Invalid request body');
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
    console.log('Message sent: %s', info.messageId);
    
    res.json({ 
      success: true, 
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send email. Please check server logs for details.' 
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 