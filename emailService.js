// emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
    auth: {
        user: 'akshaytechin@gmail.com',
        pass: 'fxoxggcgmucnwxmu'
    }
    });

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail server verification failed:', error);
  } else {
    console.log('✅ Mail server ready');
  }
});

function sendErrorEmail(errorDetails) {
  const mailOptions = {
    from: 'akshaytechin@gmail.com',
    to: 'akshaytechin@gmail.com',
    subject: '🚨 Error Notification',
    text: `An error occurred:\n\n${JSON.stringify(errorDetails, null, 2)}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email failed:', error);
    } else {
      console.log('✅ Email sent:', info.response);
    }
  });
}

module.exports = { transporter, sendErrorEmail };
