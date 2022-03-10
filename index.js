"use strict";

import { writeFileSync, rmSync, mkdir, existsSync } from "fs";
import XLSX from "xlsx";
import dotenv from "dotenv";
import { sendEmailToParticipants } from "./services/sendEmailToParticipants.js";

if (!existsSync("form.ods") || !existsSync(".env")) {
  console.log("Create form.ods file!");
} else {
  runApp();
}

function runApp() {
  dotenv.config();

  if (existsSync("./result")) rmSync("result", { recursive: true });

  if (!existsSync("./result")) mkdir("result", () => {});

  const participants = XLSX.readFile("form.ods");
  const sheet = participants.Sheets[process.env.SHEET];

  for (let cell in sheet) if (cell.startsWith("A")) delete sheet[cell];

  const formParticipants = [...XLSX.utils.sheet_to_json(sheet)];

  sortParticipants();

  function sortParticipants() {
    console.log("Sorting participants... \n");
    let filesGenerated = 0;
    let secretFriends = [...XLSX.utils.sheet_to_json(sheet).sort(() => Math.random() - 0.5)];

    for (let participant of formParticipants) {
      for (let secretFriend of secretFriends) {
        if (secretFriend[process.env.CELL_MAIN_KEY] === participant[process.env.CELL_MAIN_KEY]) continue;

        secretFriends.splice(secretFriends.indexOf(secretFriend), 1);

        writeFileSync(
          `./result/${participant[process.env.CELL_MAIN_KEY]}-${participant[process.env.CELL_MAIL_KEY]}.txt`,
          JSON.stringify(secretFriend)
        );
        filesGenerated++;

        //console.log(participant[process.env.CELL_MAIN_KEY], "__________", secretFriend[process.env.CELL_MAIN_KEY]);
        break;
      }
    }

    console.log({ "Files generated": filesGenerated, "Total of participants": formParticipants.length }, "\n");

    if (filesGenerated === formParticipants.length) {
      sendEmailToParticipants();
      return;
    }

    console.log("\nNew sort! \n");
    sortParticipants();
  }
}


