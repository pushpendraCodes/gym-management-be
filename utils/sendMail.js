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
    pass: "zknw hqyp chgm opab", // Gmail password or app-specific password
  },
});

exports.sendMail = async function ({ to, subject, text, html }) {
  let info = await transporter.sendMail({
    from: '"one9 Gym solution" <one9.gym@gmail.com>', // sender address
    to,
    subject,
    text,
    html,
  });
  console.log(info, "info");
  return info;
};

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
    </html>`;
};

const getTrainingType = ({trainingNumber,gym}) => {
  const service = gym.servicesOffered.find(
    (service) => service.serviceNumber === trainingNumber
  );
  return service ? service.serviceName : "Not Available";
};

exports.joinNewMemberTemplate = function ({member,gym}) {
  return ` <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Our Gym!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .container {
                width: 90%;
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h2 {
                color: #4CAF50;
            }
            h1{
                color: red;
            }
            .footer {
                margin-top: 20px;
                font-size: 0.9em;
                color: #888;
            }
            .details {
                margin: 15px 0;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
        <h1>${gym.gymName}</h1>
            <h2>Welcome to Our Gym,  ${member.firstName}!</h2>
            <p>Thank you for joining our gym! We're excited to have you on board.</p>

            <div class="details">
                <p><strong>Joining Date:</strong> ${member.startMonthDate}</p>
                <p><strong>Fees Due Date:</strong> ${member.dueDate}</p>
                <p><strong>Training Type:</strong> ${  getTrainingType({trainingNumber:member.training,gym})}</p>
                 <p><strong>Subscription Type:</strong> ${member.SubscriptionType==1&&"monthly"||member.SubscriptionType==2&&"quaterly" ||member.SubscriptionType==3&&"yealy"}</p>
            </div>

            <p>We look forward to supporting you in achieving your fitness goals. If you have any questions, feel free to reach out to us.</p>

            <p>Best Regards,<br>${gym.gymName} Team</p>

            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${gym.gymName}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
exports.feespaymentTemplate = function ({member,gym,dueDate,Payment_Date,fees}) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        /* General Styles */
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #2e86de;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #333333;
        }
        .content p {
            color: #555555;
            line-height: 1.6;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .details-table th, .details-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dddddd;
        }
        .details-table th {
            background-color: #f2f2f2;
            color: #333333;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            color: #777777;
            font-size: 12px;
        }
        .footer a {
            color: #2e86de;
            text-decoration: none;
        }
        /* Responsive Styles */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }
            .details-table th, .details-table td {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header Section -->
        <div class="header">
            <img src=${gym.gymLogo} alt="Gym Logo">
            <h1>Payment Confirmation</h1>
        </div>

        <!-- Content Section -->
        <div class="content">
            <h2>Hi, ${member.firstName}  ${member.lastName}!</h2>
            <p>Thank you for your payment. We have successfully received your gym fees. Below are the details of your transaction:</p>

            <!-- Payment Details Table -->
            <table class="details-table">
                <tr>
                    <th>Payment ID</th>
                    <td>{{Payment_ID}}</td>
                </tr>
                <tr>
                    <th>Amount Paid</th>
                    <td>₹${fees}</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>${Payment_Date}</td>
                </tr>
                <tr>
                    <th>Membership Plan</th>
                          <td><strong>Training Type:</strong> ${  getTrainingType({trainingNumber:member.training,gym})}</td>

                </tr>
                <tr>
                    <th>Membership type</th>
                                <td><strong>Subscription Type:</strong> ${member.SubscriptionType==1&&"monthly"||member.SubscriptionType==2&&"quaterly" ||member.SubscriptionType==3&&"yealy"}</td>

                </tr>
                <tr>
                    <th>Next Payment Due</th>
                    <td>${dueDate}</td>
                </tr>
            </table>

            <p>If you have any questions or need further assistance, feel free to contact our support team at <a href={mailto:${gym.email}}>${gym.email}</a>.</p>
            <p>We’re excited to have you as part of our fitness community!</p>

            <p>Best Regards,<br>Your ${gym.gymName}Team</p>
        </div>

        <!-- Footer Section -->
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${gym.gymName}. All rights reserved.</p>

  `;
};
