const cron = require("node-cron");
const fetch = require("node-fetch");
const convert = require("xml-js");
require("dotenv").config();

const { vahan_details } = require("./Models");
const { Op } = require("sequelize");

// ----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------------------------------

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfNDaysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(23, 59, 59, 999);
  return d;
}

function correctVahan(jsval) {
  let tempJs = {};
  let jsKey = Object.keys(jsval);
  let jsValAll = Object.values(jsval);

  for (let i = 0; i < jsValAll.length; i++) {
    if (jsValAll[i]?._text) {
      tempJs[jsKey[i]] = jsValAll[i]._text;
    } else {
      tempJs[jsKey[i]] = jsValAll[i];
    }
  }
  return tempJs;
}

// ----------------------------------------------------------------------------
// UPDATE VEHICLE DETAILS
// ----------------------------------------------------------------------------

async function updateVehicleDetails(row, authorization) {
  try {
    const body = { vehiclenumber: row.rc_regn_no };

    const url = `${process.env.ulip_url}/VAHAN/01`;

    console.log(`🔗 Calling VAHAN → ${row.rc_regn_no}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authorization}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn(`❌ VAHAN Error ${response.status} for ${row.rc_regn_no}`);
      return false;
    }

    const json = await response.json();
    const xmlString = json?.response?.[0]?.response;

    if (!xmlString || xmlString.trim() === "") {
      console.warn("⚠ Empty XML for", row.rc_regn_no);
      return false;
    }

    const result = convert.xml2js(xmlString, { compact: true });
    const vahanObj = result["VehicleDetails"];

    if (!vahanObj) {
      console.warn("⚠ Parsed XML empty for", row.rc_regn_no);
      return false;
    }

    const updatedData = correctVahan(vahanObj);

    await vahan_details.update(
      { ...updatedData, last_attempt: new Date() },
      { where: { rc_regn_no: row.rc_regn_no } }
    );

    console.log(`✅ Updated Successfully → ${row.rc_regn_no}`);
    return true;

  } catch (err) {
    console.error(`❌ Exception updating ${row.rc_regn_no}:`, err.message);
    return false;
  }
}

// ----------------------------------------------------------------------------
// MAIN CRON JOB (RUNS EVERY DAY AT 6:00 AM IST)
// ----------------------------------------------------------------------------

module.exports = () => {
  cron.schedule(
    "0 6 * * *", // every day at 6 AM
    async () => {
      console.log(
        "🚀 Cron started at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );

      try {
        const start = startOfToday();
        const end = endOfNDaysFromNow(2);

        // 🔍 Check vehicles expiring within next 2 days
        const candidates = await vahan_details.findAll({
          where: {
            [Op.or]: [
              { rc_tax_upto: { [Op.between]: [start, end] } },
              { rc_fit_upto: { [Op.between]: [start, end] } },
              { rc_pucc_upto: { [Op.between]: [start, end] } },
              { rc_insurance_upto: { [Op.between]: [start, end] } },
              { rc_regn_upto: { [Op.between]: [start, end] } }
            ]
          },
          raw: true
        });

        console.log(`🔍 Vehicles expiring soon: ${candidates.length}`);

        if (candidates.length === 0) return;

        // ------------------------------------------------------------------
        // LOGIN TO ULIP
        // ------------------------------------------------------------------
        const login_body = {
          username: process.env.ulip_username,
          password: process.env.ulip_password
        };

        const loginResp = await fetch(process.env.ulip_login_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(login_body)
        });

        const loginJson = await loginResp.json();
        let authorization = "";

        if (loginJson.error === "false") {
          authorization = loginJson.response.id;
        } else {
          console.log("❌ ULIP Login Failed");
          return;
        }

        // ------------------------------------------------------------------
        // UPDATE VEHICLES
        // ------------------------------------------------------------------
        for (const row of candidates) {
          // Skip vehicles checked recently (within last 24 hours)
          if (row.last_attempt) {
            const last = new Date(row.last_attempt);
            const now = new Date();

            if (now - last < 24 * 60 * 60 * 1000) {
              console.log(`⏭ Skip ${row.rc_regn_no} (checked recently)`);
              continue;
            }
          }

          const success = await updateVehicleDetails(row, authorization);

          // Delay between calls (important)
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err) {
        console.error("❌ Cron Error:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("Cron Scheduled: Every day at 6:00 AM IST");
};
