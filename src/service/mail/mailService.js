const nodemailer = require("nodemailer");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const sendMail = async (userEmail, mailSubject, content) => {
  //1. create an email transporter
  // SMTP (Simple Mail Transfer Protocol)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2. Config email content
  const mailOption = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: mailSubject,
    html: content,
  };

  //3. Send Mail
  try {
    const result = await transporter.sendMail(mailOption);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = sendMail;