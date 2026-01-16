const cron = require("node-cron");
const fetch = require("node-fetch");
const convert = require("xml-js");
require("dotenv").config();

const { vahan_details } = require("./Models");
const {cronJob_vahan_respones} = require("./Models");
const { Sequelize,Op } = require("sequelize");

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

function parseUlipDate(value) {
  if (!value || typeof value !== 'string') return null;

  // Handle DD-MMM-YYYY
  let m = moment(value, 'DD-MMM-YYYY', true);
  if (m.isValid()) return m.format('YYYY-MM-DD');

  // Handle DD-MM-YYYY
  m = moment(value, 'DD-MM-YYYY', true);
  if (m.isValid()) return m.format('YYYY-MM-DD');

  return null;
}

function normalizeDates(obj) {
  const dateFields = [
    'rc_regn_dt',
    'rc_regn_upto',
    'rc_purchase_dt',
    'rc_fit_upto',
    'rc_pucc_upto',
    'rc_insurance_upto',
    'rc_np_from',
    'rc_np_upto',
    'rc_permit_issue_dt',
    'rc_permit_valid_from',
    'rc_permit_valid_upto',
    'rc_status_as_on'
  ];

  dateFields.forEach(field => {
    obj[field] = parseUlipDate(obj[field]);
  });

  return obj;
}

// ----------------------------------------------------------------------------
// UPDATE VEHICLE DETAILS
// ----------------------------------------------------------------------------

async function updateVehicleDetails(row, authorization) {
  try {
    const body = { vehiclenumber: row.rc_regn_no };

    const url = `${process.env.ulip_url}/VAHAN/01`;

    console.log(`Calling VAHAN → ${row.rc_regn_no}`);

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
      console.warn(`VAHAN Error ${response.status} for ${row.rc_regn_no}`);
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

    let updatedData = correctVahan(vahanObj);
    updatedData = normalizeDates(updatedData);
    updatedData.rc_financer = String(updatedData.rc_financer);
    await vahan_details.update(
      { ...updatedData },
      { where: { rc_regn_no: row.rc_regn_no } }
    );
    const findRcnNo = await cronJob_vahan_respones.findOne({ where: { rc_regn_no: row.rc_regn_no }, raw: true });  
    if(findRcnNo){
      await cronJob_vahan_respones.update({
        responseOfUlipApi: JSON.stringify(updatedData),
        reqPlayLoad: JSON.stringify(body),
        TIMESTAMP: new Date()
      }, { where: { rc_regn_no: row.rc_regn_no } });
      console.log(`Updated Successfully → ${row.rc_regn_no} (Existing Record Updated)`);
    }else{
     await cronJob_vahan_respones.create({
      rc_regn_no: row.rc_regn_no,
      responseOfUlipApi: JSON.stringify(updatedData),
      reqPlayLoad: JSON.stringify(body),
      TIMESTAMP: new Date()
    });
  }
    console.log(`Updated Successfully → ${row.rc_regn_no}`);
    return true;

  } catch (err) {
    console.error(`Exception updating ${row.rc_regn_no}:`, err.message);
    await cronJob_vahan_respones.create({
      rc_regn_no: row.rc_regn_no,
      responseOfUlipApi: JSON.stringify(err),
      reqPlayLoad: JSON.stringify(body),
      TIMESTAMP: new Date()
    });
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
        "Cron started at",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      );

      try {
        const start = startOfToday();
        const end = endOfNDaysFromNow(2);

        // 🔍 Check vehicles expiring within next 2 days
        const candidates = await vahan_details.findAll({
          where: {
            [Op.or]: [
              Sequelize.where(
                Sequelize.fn('STR_TO_DATE', Sequelize.col('rc_tax_upto'), '%d-%m-%Y'),
                { [Op.between]: [start, end] }
              ),
              { rc_fit_upto: { [Op.between]: [start, end] } },
              { rc_pucc_upto: { [Op.between]: [start, end] } },
              { rc_insurance_upto: { [Op.between]: [start, end] } },
              { rc_regn_upto: { [Op.between]: [start, end] } }
            ]
          },
          raw: true
        });

        console.log(`Vehicles expiring soon: ${candidates.length}`);

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
          console.log("ULIP Login Failed");
          return;
        }

        // ------------------------------------------------------------------
        // UPDATE VEHICLES
        // ------------------------------------------------------------------
        for (const row of candidates) {
          const success = await updateVehicleDetails(row, authorization);
          // Delay between calls (important)
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err) {
        console.error("Cron Error:", err.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );

  console.log("Cron Scheduled: Every day at 6:00 AM IST");
};
