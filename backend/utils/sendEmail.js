const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  const transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOption = {
    from: `"Chat.io OTP <${process.env.EMAIL_USER}>"`,
    to,
    subject,
    text,
  };

  await transpoter.sendMail(mailOption);
};

module.exports = sendEmail;
