"use strict";

import { readFileSync, readdirSync } from "fs";
import mail from "@sendgrid/mail";
import dotenv from "dotenv";

export const sendEmailToParticipants = () => {
  dotenv.config();

  const results = readdirSync("./result");

  for (let result of results) {
    const file = readFileSync(`./result/${result}`, "utf8");
    const [name, email] = result.replace(".txt", "").split("-");
    const data = JSON.parse(file);
    const html = buildHtmlEmail(data);
    const text = JSON.stringify(data).replace("{", "").replace("}", "");

    sendEmail({ name, email }, text, html);
  }
};

function buildHtmlEmail(data) {
  let html = getEmailTemplate();

  // Replace the placeholders with your data
  html = html
    .replace("EASTER_DRAW_SECRET_FRIEND_NAME", data["Nome"])
    .replace("EASTER_DRAW_SECRET_FRIEND_ADDRESS", data["Endereço completo"])
    .replace("EASTER_DRAW_SECRET_FRIEND_ALLERGIES", data["Alergias/Intolerâncias"] ?? "-")
    .replace("EASTER_DRAW_SECRET_FRIEND_PREFERENCE", data["Preferências"] ?? "-");

  return html;
}

function sendEmail(to, text, html) {
  mail.setApiKey(process.env.SENDGRID_API_KEY);

  const message = {
    to: process.env.SENDGRID_MAIL,
    from: {
      name: process.env.SENDGRID_NAME,
      email: process.env.SENDGRID_MAIL,
    },
    subject: process.env.SENDGRID_MAIL_TITLE,
    text,
    html,
  };

  (async () => {
    try {
      console.log(`Sending email to ${to.name} (${to.email})...`);
      await mail.send(message).then(() => {
        console.log(`Email sent ✔\n`);
      });
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  })();
}

// Change this to your own email template
function getEmailTemplate() {
  return `<!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Amigo Secreto de Páscoa</title>
    
      <style>
        .main {
          width: 600px;
          min-height: 350px;
          margin: 0 auto;
          background-color: #dfe4ea;
          box-sizing: border-box;
        }
    
        .your-secret-friend {
          text-align: center;
          width: 100%;
          padding: 50px 0;
          min-height: 50px;
          color: #fff;
          background: #FF4791;
          background-size: cover;
        }
    
        .your-secret-friend small {
          padding: 5px;
          background-color: rgba(245, 125, 174, .75);
          font: 18px 'Arial';
          margin-bottom: 15px;
        }
    
        .your-secret-friend p {
          margin: 0;
          font: bold 42px 'Arial';
        }
    
        .your-secret-friend-infos {
          padding: 35px;
          color: #131114;
        }
    
        .address, .preference, .allergies {
          padding: 10px;
          border: 10px double #131114;
          margin-bottom: 15px;
        }
   
        .address p:first-child, .preference p:first-child, .allergies p:first-child {
          font: bold 18px 'Arial';
        }
    
        .address p, .preference p, .allergies p {
          font: 18px 'Arial';
        }
      </style>
    </head>
    <body>
    <div class="main">
      <div class="your-secret-friend">
        <small>E o seu amigo secreto é:</small>
        <p>EASTER_DRAW_SECRET_FRIEND_NAME</p>
      </div>
      <div class="your-secret-friend-infos">
        <div class="address">
          <p>Endereço:</p>
          <p>EASTER_DRAW_SECRET_FRIEND_ADDRESS</p>
        </div>
    
        <div class="allergies">
          <p>Alergias:</p>
          <p>EASTER_DRAW_SECRET_FRIEND_ALLERGIES</p>
        </div>
    
        <div class="preference">
          <p>Preferência:</p>
          <p>EASTER_DRAW_SECRET_FRIEND_PREFERENCE</p>
        </div>
      </div>
    </div>
    </body>
    </html>
  `;
}