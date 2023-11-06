import nodemailer from "nodemailer";
//call to config file
import { config } from "dotenv";
config();

export const sendVerificationCode = async (email, verificationCode) => {
  console.log("UTLIS email, verificationCode", email, verificationCode);
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMPT_MAIL,
      to: email,
      subject: "Verification Code",
      html: ` <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verification Code</title>
      </head>
      <body>
       
          <h1>Stack Overflow</h1>
          <h3>Verification Code</h3>
          <p>Use this OTP for Login Verification</p>
          <h6
            style="
              background-color: green;
              color: white;
              padding: 10px;
              width: fit-content;
              font-size: xx-large;
            "
          >
            ${verificationCode}
          </h6>
        
      </body>
    </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification code email sent successfully!");
  } catch (error) {
    console.error("Error sending verification code email:", error);
  }
};
