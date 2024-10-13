// utils/sendEmail.js
// const nodemailer = require('nodemailer');
// const env = require("dotenv");
// env.config();


// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: process.env.EMAIL_USER, // Gmail email
//       pass: process.env.EMAIL_PASS, // Gmail password or app-specific password
//     },
//   });

//   const mailOptions = {
//     from: '"one9 Gym" <one9.gym@gmail.com>',
//     to: options.to,
//     subject: options.subject,
//     text: options.text,
//   };

//   await transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return console.log('Error: ', error);
//     }
//     console.log('Email sent: ' + info.response);
//   });
// };




const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "one9.gym@gmail.com", // gmail
    pass: "zknw hqyp chgm opab"// Gmail password or app-specific password
  },
});

exports.sendMail = async function ({to, subject, text, html}){
  let info = await transporter.sendMail({
    from: '"one9 Gym solution" <one9.gym@gmail.com>', // sender address
      to,
      subject,
      text,
      html
    });
    console.log(info,"info")
  return info;
}

exports.passResetTemplate = function (resetLink) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
        }
        p {
          color: #555;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          margin-top: 20px;
          background-color: #28a745;
          color: #fff;
          text-decoration: none;
          font-size: 16px;
          border-radius: 5px;
        }
        .btn:hover {
          background-color: #218838;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your account. Click the button below to reset your password:</p>
        <a href=${resetLink} class="btn">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email. This link will expire in 24 hours.</p>
        <p>Thank you,<br>The One9 Gym solution Team</p>
        <div class="footer">
          <p>If you have any questions, contact us at one9.gym@gmail.com</p>
        </div>
      </div>
    </body>
    </html>`

  };


