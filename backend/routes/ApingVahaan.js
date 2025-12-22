const express = require("express")
const https = require('https');
const router = express.Router()
const { ApiKeys } = require("../Models")
const { vahan_details } = require("../Models")
const {sarathi_details} = require("../Models")
const { ApiLogs } = require("../Models")
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const JWT_SECRET = 'saltcode';
const { User } = require("../Models")
var fetchuser = require("../middleware/fetchuser")
var fetchapi = require("../middleware/fetchapi")
var convert = require('xml-js');
var crypto = require('crypto');
require('dotenv').config()
var nodemailer = require("nodemailer");
const fs = require("fs")
const XLSXStyle = require('xlsx-js-style');
const { body, validationResult } = require('express-validator');
const {fetchapiui} = require("../middleware/fetchapiui");
const {fetchapiuixl}= require("../middleware/fetchapiui");
const fetch = require('node-fetch')
const multer = require('multer');
const xlsx = require('xlsx');
const xml2js = require('xml2js');
const email = require('../emailService/mailer')
const CryptoJS = require("crypto-js");

const upload = multer({ dest: 'uploads/' }); // configure multer for file uploads

function excelSerialDateToJSDate(serial) {
    const epoch = new Date(1899, 11, 30);
    const days = Math.floor(serial);
    const date = new Date(epoch.getTime() + days * 24 * 60 * 60 * 1000);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}
// function parseDate(dateStr) {
//     // Split the date string by '-'
//     const parts = dateStr.split('-');
//     // Extract the day, month, and year
//     const day = parseInt(parts[0], 10);
//     const month = parseInt(parts[1], 10) - 1; // Months are 0-based in JavaScript Date
//     const year = parseInt(parts[2], 10);
//     // Create and return the new Date object
//     return new Date(year, month, day);
// }

function parseDate(dateStr) {
    if (!dateStr) return null; // Handle null, undefined, or empty string

    if (dateStr instanceof Date && !isNaN(dateStr)) {
        return dateStr; // Already a valid Date object
    }

    if (typeof dateStr !== "string") return null;

    // Check if format is DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('-');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    // Check if format is YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr); // JS can directly parse YYYY-MM-DD
    }

    return null; // Return null if format is incorrect
}

router.post("/sendmailcreatekey", [
    body("email", "Must be a email").isEmail(),
    body("applicationName", "Application Name must have some value").isLength({ min: 1 }),
    body("ownerName", "Owner Name must have some value").isLength({ min: 1 }),
    body("apiKey", "Empty API key passed").isLength({ min: 1 }),

],
    fetchuser, async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const htmlTemplate = fs.readFileSync('Html/index.html', 'utf8');

            // Replace placeholders with provided parameters
            const renderedHtmlContent = htmlTemplate.replace('{apiKey}', req.body.apiKey)
                .replace('{applicationName}', req.body.applicationName)
                .replace('{ownerName}', req.body.ownerName)
                .replace('{seckey}', req.body.secretkey)


            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "service.ulipmll@gmail.com",
                    pass: "fpxa maku oavr owcv"
                }
            })
            var mailOptions = {
                from: "service.ulipmll@gmail.com",
                to: req.body.email,
                subject: "ULIP API Key",
                html: renderedHtmlContent

            }
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("The error is ", error)
                    res.send("error")
                }
                else {
                    console.log("Email sent", info.response)
                    res.send({ success: true })
                }
            })

        } catch (error) {
            res.status(500).send("Internal Server Error")
        }



    })


router.post("/createKey", [
    body("email", "Must be a email").isEmail(),
    body("applicationName", "Application Name must have some value").isLength({ min: 3 }),
    body('applicationName', 'Application Name must only contain alphabets, numbers, and underscores')
    .matches(/^[A-Za-z0-9_ ]+$/),
    body("ownerName", "Owner Name must have some value").isLength({ min: 1 }),
    body('ownerName', 'Owner Name must only contain alphabets')
    .matches(/^[A-Za-z\s]+$/),
    body("ip", "Should be a valid IP address").isLength({ min: 4 }),
    body("key", "Empty API key passed").isLength({ min: 1 }),
    body('contactNo', 'Contact Number should be exactly 10 digits').isLength({ min: 10, max: 10 }),
    body('contactNo', 'Contact Number must be Number').isNumeric(),
], fetchuser, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { applicationName,contactNo,email} = req.body;
        const applicationExists = await ApiKeys.findOne({
            where: { applicationName }
          });
          const emailExists = await ApiKeys.findOne({
            where: { email }
          });
          const phoneExists = await ApiKeys.findOne({
            where: { contactNo }
          });
      
          if (applicationExists) {
            return res.status(400).json({ message: 'Application Name already exists' });
          }  
          if (emailExists) {
            return res.status(400).json({ message: 'Email already exists' });
          }  
          if (phoneExists) {
            return res.status(400).json({ message: 'Contact No already exists' });
          }        
        let secKey = crypto.randomUUID()
        const newKey = crypto.createCipher('aes-128-cbc', "secKey");
        var mystr = newKey.update(secKey, 'utf8', 'hex')
        mystr += newKey.final('hex');

        const dateTime = new Date()
        dateTime.setDate(dateTime.getDate() + 15)
        let key = req.body
        key.username = req.usn
        key.secKey = mystr
        key.secValidity = dateTime
        // let keyVal = key.key
        // keyVal = CrockfordBase32.encode(keyVal)
        const keyIs = await ApiKeys.create(key)
        email.sendKeys(key, (emailResult) => {
            if (emailResult.status === 400) {
                let mailresult = 'Error in sending mail'
                res.json({ success: true, keyIs ,mailresult})

            }
            else if(emailResult.status === 200){
                let mailresult = 'Mail sent successfully'
                res.json({ success: true, keyIs ,mailresult})
            }
        });
        res.json({ success: true, keyIs })
        // res.json({success:true,key, keyVal})

    } catch (error) {
        res.status(500).send("Internal Server Error")
        console.log(error.message)
    }

})

router.delete("/deletemykey", [
    body("apiKey", "Empty API key passed").isLength({ min: 1 }),

], fetchuser, async (req, res) => {
    try {
        const { apiKey } = req.body
        await ApiKeys.destroy({
            where: {
                key: apiKey
            },
        });
        res.send({ success: true, msg: "Key deleted successfully" })
    } catch (error) {
        res.status(500).send("Internal Server Error")
        console.log(error.message)
    }
})

router.put("/changeip", fetchuser, async (req, res) => {
    try {
        const { myIp, passKey } = req.body
        const apiKeyIs = await ApiKeys.update({
            ip: myIp
        }, { returning: true, where: { key: passKey } })
        res.send({ success: true, apiKeyIs })

    } catch (error) {
        res.status(500).send("Internal Server Error")
        console.log(error.message)
    }

})

router.put("/generateseckey", [
    body("passKey", "Key should have value").isLength({ min: 1 })
],
    fetchuser, async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const { passKey } = req.body

            let secKey = crypto.randomUUID()

            const newKey = crypto.createCipher('aes-128-cbc', "secKey");
            var mystr = newKey.update(secKey, 'utf8', 'hex')
            mystr += newKey.final('hex');

            const dateTime = new Date()
            dateTime.setDate(dateTime.getDate() + 15)

            console.log(dateTime)
            const apiKeyIs = await ApiKeys.update(
                {
                    secKey: mystr,
                    secValidity: dateTime
                },
                { returning: true, where: { key: passKey } }
            )
            res.send({ success: true, secKeyIs: mystr })

        } catch (error) {
            res.status(500).send("Internal Server Error")
        }


    })

router.post("/createLog", [
    body("key", "Invalid API key").isLength({ min: 1 }),
    body("ulip", "Invalid ULIP data request").isLength({ min: 1 }),
    body("applicationName", "Invalid Application Name").isLength({ min: 1 }),
    body("username", "Username must be 4 characters").isLength({ min: 4 })
],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {

            const keyLog = req.body
            const keyLogIs = await ApiLogs.create(keyLog)
            res.json({ success: true, keyLogIs })

        } catch (error) {
            res.status(500).send("Internal Server Error")
        }

    })


router.post("/fetchKeys", fetchuser, async (req, res) => {
    try {
        //let allKey = await ApiKeys.findAll({ where: { username: req.usn } })
        let allKey = await ApiKeys.findAll()
        res.send({ success: true, allKey })

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal Server Error")
    }

})

// router.post("/fetchKeys", fetchuser, async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//         const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page if not provided
//         const offset = (page - 1) * pageSize;

//         const allKey = await ApiKeys.findAll({
//             where: { username: req.usn },
//             limit: pageSize,
//             offset: offset
//         });

//         // Optionally, get the total count of items
//         const totalCount = await ApiKeys.count({ where: { username: req.usn } });

//         res.send({
//             success: true,
//             allKey,
//             pagination: {
//                 totalItems: totalCount,
//                 currentPage: page,
//                 totalPages: Math.ceil(totalCount / pageSize)
//             }
//         });

//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send("Internal Server Error");
//     }
// });

function formatDate(dateStr) {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    if (isNaN(date)) return null;

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

function formatRcDate(dateStr) {
    if (!dateStr) return null;

    const [day, month, year] = dateStr.split("-");

    const date = new Date(year, month - 1, day);
    if (isNaN(date)) return null;

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    return `${String(day).padStart(2, "0")}-${months[date.getMonth()]}-${year}`;
}


router.put("/toggle-api-key", fetchuser, [
    body("passKey", "API must be valid").isLength({ min: 1 }),
    body("isEnable", "API key toggle failed").isBoolean()

],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const { passKey, isEnable } = req.body
            const apiKeyIs = await ApiKeys.update({
                active: !isEnable
            }, { returning: true, where: { key: passKey } })
            res.send({ success: true, apiKeyIs })

        } catch (error) {
            res.status(500).send("Internal Server Error")
            console.log(error.message)
        }

    })
    router.post("/changePassword",fetchuser,async(req,res)=>{
        try {
        const {oldPassword,newPassword,confirmPassword}=req.body
        const bytesOldPass = CryptoJS.AES.decrypt(oldPassword, process.env.secretKey);
        const decryptedOldPassword = bytesOldPass.toString(CryptoJS.enc.Utf8);
        const bytesPass = CryptoJS.AES.decrypt(newPassword, process.env.secretKey);
        const decryptedPassword = bytesPass.toString(CryptoJS.enc.Utf8);
        const bytesConPass = CryptoJS.AES.decrypt(confirmPassword, process.env.secretKey);
        const decryptedConPassword = bytesConPass.toString(CryptoJS.enc.Utf8);

        if (!decryptedPassword || decryptedPassword.length < 8 || !decryptedPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*$/)) {
            return res.status(400).json({
              message: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one special character.'
            });
          }
        if(decryptedPassword != decryptedConPassword){
        return res.status(400).json({ success: false, message: "Mismatch the password" });

        }
        const user = await User.findOne({ where: { username: req.usn }  }); // Assuming `fetchuser` adds the user ID to `req.user.id`
    
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
    
        // Check if the old password is correct
        const isMatch = await bcrypt.compare(decryptedOldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Old password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10)
        var secPass = await bcrypt.hash(decryptedPassword, salt)
        const up= await User.update({
            password:secPass,
            passW:decryptedPassword
    
        }, {
            where: {
              username:user.username 
            }
        }); 
        return res.status(200).json({ message: "Password has been changed" });
        } catch (error) {
            console.log("-----error",error)
            return res.status(500).json({ error });

        }

    
    })
    
    router.put("/updatekey", fetchuser, [
    body("apiKey", "Empty API key passed").isLength({ min: 1 }),
    body("applicationName", "Application Name must have some value").isLength({ min: 3 }),
    body('applicationName', 'Application Name must only contain alphabets, numbers, and underscores')
    .matches(/^[A-Za-z0-9_ ]+$/),
    body("ownerName", "Owner Name must have some value").isLength({ min: 1 }),
    body('ownerName', 'Owner Name must only contain alphabets')
    .matches(/^[A-Za-z\s]+$/),
    body("contactNo", "Contact Number should be greater than 8 characters").isLength({ min: 8 }),
]

    , async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const { passKey, applicationName, ownerName, apiKey, contactNo, ulipAccess } = req.body
            const apiKeyIs = await ApiKeys.update({
                applicationName: applicationName,
                ownerName: ownerName,
                contactNo: contactNo,
                apiKey: apiKey,
                ulipAccess:ulipAccess
            }, { returning: true, where: { key: passKey } })
            res.send({ success: true, apiKeyIs })

        } catch (error) {
            res.status(500).send("Internal Server Error")
            console.log(error.message)
        }

    })

router.post("/fetchmykey", fetchuser, [
    body("passKey", "Empty API key passed").isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }


    try {
        const { passKey } = req.body
        let mykey = await ApiKeys.findOne({ where: { key: passKey } })
        res.send({ success: true, mykey })
    } catch (error) {

        console.log(error.message)
        res.status(500).send("Internal Server Error")

    }
})

router.post("/fetchLogs", fetchuser,
    async (req, res) => {
        try {

            const { username } = await req.usn
            console.log(username)
            let allLogs = await ApiLogs.findAll({ where: { username: req.usn } })
            res.send({ success: true, allLogs })

        } catch (error) {
            console.log(error.message)
            res.status(500).send("Internal Server Error")
        }

    })


const correctVahan = (jsval) => {
    let tempJs = {}
    let jsKey = Object.keys(jsval)
    let jsValAll = Object.values(jsval)
    for (let i = 0; i < jsValAll.length; i++) {
        if (jsValAll[i]._text) {
            tempJs[jsKey[i]] = jsValAll[i]._text

        }
        else {
            tempJs[jsKey[i]] = jsValAll[i]
        }

    }
    return tempJs

}

router.delete("/deleltelogs", async (req, res) => {
    try {
        await ApiLogs.destroy({
            where: {},
            truncate: true
        })
        res.send("All deleted")
    } catch (error) {
        res.send("Deletion failed")
    }
})


router.delete("/dropkey", async (req, res) => {
    try {
        await ApiKeys.drop()
        res.send("All deleted")
    } catch (error) {
        res.send("Deletion failed")
    }
})


router.post("/ulip/v1.0.0/:ulipIs/:reqIs", fetchapi, async (req, res) => {

    try {
        console.log("a9")
        const url = `${process.env.ulip_url}/${req.params.ulipIs}/${req.params.reqIs}`
        console.log("my url is ", url)

        if(req.params.ulipIs === "VAHAN") {
            const vehicleDetails = await vahan_details.findOne({ where: { rc_regn_no: req.body.vehiclenumber } ,raw: true});
        if (vehicleDetails) {
            // format all needed dates
            vehicleDetails.rc_regn_upto =
                formatDate(vehicleDetails.rc_regn_upto);

            vehicleDetails.rc_tax_upto =
                formatRcDate(vehicleDetails.rc_tax_upto);

                vehicleDetails.rc_pucc_upto =
                formatDate(vehicleDetails.rc_pucc_upto);

            vehicleDetails.rc_fit_upto =
                formatDate(vehicleDetails.rc_fit_upto);

            vehicleDetails.rc_insurance_upto =
                formatDate(vehicleDetails.rc_insurance_upto);

            return res.status(200).send({ success: true, json:vehicleDetails});    
        }
    } 
        

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json",
                'Authorization': `Bearer ${req.authorization}`,
                // 'Authorization': req.header('Authorization'),

            },
            body: JSON.stringify(req.body),
            // agent: new https.Agent({ rejectUnauthorized: false }) // Add this line to disable SSL certificate verification

        })
        console.log("a10")

        let json = await response.json()
        
        if (json.error === "true") {
            const urlArray = req.url.split("/")
            const mybody = req.body
            const appliName = req.applicationName
            const myKey = req.header("api-key")
            delete json.error
            ulipUiError(urlArray, mybody, json, appliName, myKey, req)
            return res.send(json)
        }



        let respBody = {
            code: json.code,
            message: json.message
        }

        if (req.params.ulipIs === "VAHAN") {
            try {
                const xmlString = json.response[0].response
                // if (xmlString === "ULIPNICDC is not authorized to access Non-Transport vehicle data")
                //     // return res.status(501).send({code:"501" , message: xmlString })
                //     return res.status(401).send(json.response[0] )

                var result1 = convert.xml2js(xmlString, { compact: true, spaces: 4 });
                const vhdet = result1["VehicleDetails"]

                // res.send({ success: true, vhdet })
                json = await correctVahan(vhdet)
                await vahan_details.create(json);


            } catch (error) {
                const urlArray = req.url.split("/")
                const mybody = req.body
                const appliName = req.applicationName
                const myKey = req.header("api-key")
                let tempJson = json.response[0]
                tempJson.code = "401"
                ulipUiError(urlArray, mybody, tempJson, appliName, myKey, req)
                return res.status(401).send(json.response[0])
            }

            console.log(json)

        }

        if (req.params.ulipIs === 'SARATHI' && json.response[0].response.dldetobj[0].dlobj === null) {
            const urlArray = req.url.split("/")
            const mybody = req.body
            const appliName = req.applicationName
            const mKey = req.header("api-key")
            let tempbodyOut = {
                code:"404",
                message:"No such data exist"
            }
            ulipUiError(urlArray, mybody, tempbodyOut, appliName, mKey, req)
            return res.status(404).send({ code: "404", message:"No such data exist" })
        }

        const urlArray = req.url.split("/")
        const mybody = req.body
        const appliName = req.applicationName
        const mKey = req.header("api-key")
        ulipUiError(urlArray, mybody, respBody, appliName, mKey, req)


        res.send({ success: true, json })


    } catch (error) {
        console.log(error.message)
        res.status(500).send({ code: "500", message: error.message })
    }

})


const ulipUiError = async (urlArray, mybody, respBody, appliName, myKey, req) => {

    const dt = new Date()
    const newApiLog = {
        key: myKey,
        ulip: urlArray[3],
        reqDataCode: urlArray[4],
        resData: JSON.stringify(respBody),
        time: dt.getTime(),
        applicationName: appliName,
        username: req.usn,
        reqData: JSON.stringify(mybody)

    }
    console.log("logs sent")
    const apiLogIs = await ApiLogs.create(newApiLog)
}

router.post("/ulipui/:ulipIs/:reqIs", fetchuser,fetchapiuixl, async (req, res) => {

    try {
       if (req.params.ulipIs === "VAHAN") {
        const vehicleDetails = await vahan_details.findOne({ where: { rc_regn_no: req.body.vehiclenumber } ,raw: true}    
);
        if (vehicleDetails) {
            // format all needed dates
            vehicleDetails.rc_regn_upto =
                formatDate(vehicleDetails.rc_regn_upto);

            vehicleDetails.rc_tax_upto =
                formatRcDate(vehicleDetails.rc_tax_upto);

                vehicleDetails.rc_pucc_upto =
                formatDate(vehicleDetails.rc_pucc_upto);

            vehicleDetails.rc_fit_upto =
                formatDate(vehicleDetails.rc_fit_upto);

            vehicleDetails.rc_insurance_upto =
                formatDate(vehicleDetails.rc_insurance_upto);

            return res.status(200).send({ success: true, json:vehicleDetails});    
        }
    } 

      if(req.params.ulipIs === "SARATHI") {
        const dlDetails = await sarathi_details.findOne({ where: { dlLicno: req.body.dlnumber } ,raw: true}    );
        if (dlDetails) {            
            return res.status(200).send({ success: true, type:"DB",json:dlDetails});
        }
      }
       const login_body = {
            username:process.env.ulip_username,
            password:process.env.ulip_password
        }

        console.log("--------login_body",login_body)
        console.log("--------process.env.ulip_login_url",process.env.ulip_login_url)

        
        const logiresponse = await fetch(process.env.ulip_login_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(login_body),
            // agent: new https.Agent({ rejectUnauthorized: false }) // Add this line to disable SSL certificate verification

        });
        console.log("----------------LOGINresponse",logiresponse)
        const resp_login = await logiresponse.json()
        console.log("----------------resp_login",resp_login)
        if(resp_login.error === 'false'){
            req.authorization = await resp_login.response.id
        }
        else{
            const urlArray = req.url.split("/")
            urlArray.splice(0,0,'')
            console.log("my url array is ", urlArray)
            const mybody = req.body
            const appliName = "[Ulip Interface Used]"
            const mkey = "--"
            delete resp_login.error
            ulipUiError(urlArray, mybody, resp_login, appliName, mkey, req)
            return res.status(401).send(resp_login)
        }
        const url = `${process.env.ulip_url}/${req.params.ulipIs}/${req.params.reqIs}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': "application/json",
                'Authorization': `Bearer ${req.authorization}`,

            },
            body: JSON.stringify(req.body),

        })

        let json = await response.json()
        console.log("reached at json ", json)
        if (json.error === "true") {
            const urlArray = req.url.split("/")
            urlArray.splice(0, 0, '')
            const mybody = req.body
            const appliName = "[Ulip Interface Used]"
            const myKey = req.header("api-key")
            delete json.error
            ulipUiError(urlArray, mybody, json, appliName, myKey, req)
            return res.send(json)
        }



        let respBody = {
            code: json.code,
            message: json.message
        }

        if (req.params.ulipIs === "VAHAN") {
            try {
                const xmlString = json.response[0].response
                // if (xmlString === "ULIPNICDC is not authorized to access Non-Transport vehicle data")
                //     // return res.status(501).send({code:"501" , message: xmlString })
                //     return res.status(401).send(json.response[0] )

                if (json.response[0].response === 'Vehicle Details not Found') {

                    return res.status(404).send({ code: "404", message:"Vehicle Details not Found" })

                }else if(json.response[0].response === 'VAHAN_01 - 3rd party service is down!'){
                    return res.status(401).send({ code: "404", message:"VAHAN_01 - 3rd party service is down!" })
                }
                var result1 = convert.xml2js(xmlString, { compact: true, spaces: 4 });
                const vhdet = result1["VehicleDetails"]

                // res.send({ success: true, vhdet })
                json = await correctVahan(vhdet)
                 await vahan_details.create(json);

            } catch (error) {
                const urlArray = req.url.split("/")
                const mybody = req.body
                const appliName = req.applicationName
                const myKey = req.header("api-key")
                let tempJson = json.response[0]
                tempJson.code = "401"
                ulipUiError(urlArray, mybody, tempJson, appliName, myKey, req)
                return res.status(401).send(json.response[0])
            }


        }
        if (req.params.ulipIs === 'SARATHI' && json.response[0].response.dldetobj[0].dlobj === null) {
            const urlArray = req.url.split("/")
            urlArray.splice(0, 0, '')
            const mybody = req.body
            const appliName = "[Ulip Interface Used]"
            const mkey = req.header("api-key")
            let tempbodyOut = {
                code:"404",
                message:"No such data exist"
            }
            ulipUiError(urlArray, mybody, tempbodyOut, appliName, mkey, req)
            return res.status(404).send({ code: "404", message:"No such data exist" })
        }else if(req.params.ulipIs === 'SARATHI' && json.response[0].response.dldetobj[0].dlobj != null){
            let dlobjs = json.response[0].response.dldetobj[0].dlobj
            await sarathi_details.create(dlobjs);
        }
        const urlArray = req.url.split("/")
        urlArray.splice(0, 0, '')
        const mybody = req.body
        const appliName = "[Ulip Interface Used]"
        const mkey = req.header("api-key")
        ulipUiError(urlArray, mybody, respBody, appliName, mkey, req)

        res.send({ success: true, type:"api",json })
     
    
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ code: 500, message: error.message })
    }

})


router.post("/ulipxl/:ulipIs/:reqIs", upload.single('file'),fetchuser, fetchapiui, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ code: 400, message: 'No file uploaded' });
        }

            const workbook = xlsx.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);
    
            // Check if the file is empty
            if (!data.length) {
                fs.unlinkSync(req.file.path);
                return res.status(400).send({ code: 400, message: 'The uploaded file is empty' });
            }
    
            let responses = [];
            const currentDate = new Date();
    
            if (req.params.ulipIs === "VAHAN") {
                // Check if the 'vehiclenumber' column exists
                if (!data[0].hasOwnProperty('vehiclenumber')) {
                    fs.unlinkSync(req.file.path);
                    return res.status(400).send({ message: 'The uploaded file must contain a column named "vehiclenumber"' });
                }
    
                for (const row of data) {
                    const vehicleNumber = row.vehiclenumber;
                    const url = `${process.env.ulip_url}/${req.params.ulipIs}/${req.params.reqIs}`;
    
                    try {
                        const dbRecord = await vahan_details.findOne({
                            where: { rc_regn_no: vehicleNumber },
                            raw: true
                        });
                        if(dbRecord) {
                                    console.log(`📌 Found in DB → No ULIP call for ${vehicleNumber}`);
                                    // Prepare same response format
                                    responses.push({
                                        vehiclenumber: vehicleNumber,
                                        OwnerName: dbRecord.rc_owner_name || 'Not Found',
                                        VehiclePurchaseDate: dbRecord.rc_purchase_dt || 'Not Found',
                                        InsurancePolicyNumbe: dbRecord.rc_insurance_policy_no || 'Not Found',
                                        InsuracePolicyValidityUpto: dbRecord.rc_insurance_upto || 'Not Found',
                                        PollutionCertificateNumber: dbRecord.rc_pucc_no || 'Not Found',
                                        PollutionValidityUpto: dbRecord.rc_pucc_upto || 'Not Found',
                                        RegistrationNumberValidity: dbRecord.rc_regn_upto || 'Not Found',
                                        FitnessCertificateValidityUpto: dbRecord.rc_fit_upto || 'Not Found',
                                        RoadTaxValidityUpto: dbRecord.rc_tax_upto || 'Not Found',
                                        RegistrationDate: dbRecord.rc_regn_dt || 'Not Found',
                                        VehicleMake: dbRecord.rc_maker_model || 'Not Found',
                                        Valid: "Fit To Go"  // OR re-check validity if needed
                                    });
                                    continue; // Skip API call
                            }
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': "application/json",
                                'Authorization': `Bearer ${req.authorization}`,
                            },
                            body: JSON.stringify({ vehiclenumber: vehicleNumber }),
                            // agent: new https.Agent({ rejectUnauthorized: false })
                        });
    
                        const json = await response.json();
                        if (json.error === 'true' && json.code === '400') {
                            responses.push({
                                vehiclenumber: vehicleNumber,
                                OwnerName: 'Invalid vehicle Number Format',
                                VehiclePurchaseDate: 'Invalid vehicle Number Format',
                                InsurancePolicyNumbe: 'Invalid vehicle Number Format',
                                InsuracePolicyValidityUpto: 'Invalid vehicle Number Format',
                                PollutionCertificateNumber: 'Invalid vehicle Number Format',
                                PollutionValidityUpto: 'Invalid vehicle Number Format',
                                RegistrationNumberValidity: 'Invalid vehicle Number Format',
                                FitnessCertificateValidityUpto: 'Invalid vehicle Number Format',
                                RoadTaxValidityUpto: 'Invalid vehicle Number Format',
                                RegistrationDate: 'Invalid vehicle Number Format',
                                VehicleMake: 'Invalid vehicle Number Format',
                                Valid: 'Invalid vehicle Number Format'
                            });
                        } else if (json.response[0].response === 'Vehicle Details not Found') {
                            responses.push({
                                vehiclenumber: vehicleNumber,
                                OwnerName: 'OwnerName Not Found',
                                VehiclePurchaseDate: 'Vehicle Purchase Date Not Found',
                                InsurancePolicyNumbe: 'InsurancePolicyNumbe Not Found',
                                InsuracePolicyValidityUpto: 'InsuracePolicyValidityUpto Not Found',
                                PollutionCertificateNumber: 'PollutionCertificateNumber Not Found',
                                PollutionValidityUpto: 'PollutionValidityUpto Not Found',
                                RegistrationNumberValidity: 'RegistrationNumberValidity Not Found',
                                FitnessCertificateValidityUpto: 'FitnessCertificateValidityUpto Not Found',
                                RoadTaxValidityUpto: 'RoadTaxValidityUpto Not Found',
                                RegistrationDate: 'RegistrationDate Not Found',
                                VehicleMake: 'VehicleMake Not Found',
                                Valid: 'Vehicle Data Not Found'
                            });
                        } else {
                            try {
                                const parser = new xml2js.Parser({ explicitArray: false });
                                const parsedData = await parser.parseStringPromise(json.response[0].response);
                                const vehicleDetails = parsedData.VehicleDetails;
                                let tax_conv = vehicleDetails.rc_tax_upto ? parseDate(vehicleDetails.rc_tax_upto) : null;
                                let rc_tax_upto = vehicleDetails.rc_tax_upto ? new Date(tax_conv) : null;
                                console.log(vehicleDetails.rc_tax_upto,'------------------------vehicleDetails.rc_tax_upto')
                                if(vehicleDetails.rc_tax_upto=='LTT'){
                                    rc_tax_upto = new Date();
                                    rc_tax_upto.setDate(rc_tax_upto.getDate() + 2); // Ensure 2 days ahead
                                    rc_tax_upto.setHours(0, 0, 0, 0);
                                }
                                console.log(rc_tax_upto,'------------------------rc_tax_upto')
                                console.log(currentDate,'------------------------currentDate')
                                console.log(rc_tax_upto > currentDate,'------------------------rc_tax_upto > currentDate')
                                const rc_fit_upto = vehicleDetails.rc_fit_upto ? new Date(vehicleDetails.rc_fit_upto) : null;
                                const rc_pucc_upto = vehicleDetails.rc_pucc_upto ? new Date(vehicleDetails.rc_pucc_upto) : null;
                                const rc_insurance_upto = vehicleDetails.rc_insurance_upto ? new Date(vehicleDetails.rc_insurance_upto) : null;
                                const rc_regn_upto = vehicleDetails.rc_regn_upto ? new Date(vehicleDetails.rc_regn_upto) : null;
    
                                const valid = (rc_tax_upto && rc_fit_upto && rc_pucc_upto && rc_insurance_upto && rc_regn_upto &&
                                    rc_tax_upto > currentDate && rc_fit_upto > currentDate && rc_pucc_upto > currentDate &&
                                    rc_insurance_upto > currentDate && rc_regn_upto > currentDate) ? "Fit To Go" : "Not Fit To Go";
                                responses.push({
                                    vehiclenumber: vehicleNumber,
                                    OwnerName: vehicleDetails.rc_owner_name || 'OwnerName Not Found',
                                    VehiclePurchaseDate: vehicleDetails.rc_purchase_dt || 'Vehicle Purchase Date Not Found',
                                    InsurancePolicyNumbe: vehicleDetails.rc_insurance_policy_no || 'InsurancePolicyNumbe Not Found',
                                    InsuracePolicyValidityUpto: vehicleDetails.rc_insurance_upto || 'InsuracePolicyValidityUpto Not Found',
                                    PollutionCertificateNumber: vehicleDetails.rc_pucc_no || 'PollutionCertificateNumber Not Found',
                                    PollutionValidityUpto: vehicleDetails.rc_pucc_upto || 'PollutionValidityUpto Not Found',
                                    RegistrationNumberValidity: vehicleDetails.rc_regn_upto || 'RegistrationNumberValidity Not Found',
                                    FitnessCertificateValidityUpto: vehicleDetails.rc_fit_upto || 'FitnessCertificateValidityUpto Not Found',
                                    RoadTaxValidityUpto: vehicleDetails.rc_tax_upto || 'RoadTaxValidityUpto Not Found',
                                    RegistrationDate:vehicleDetails.rc_regn_dt|| 'RegistrationDate Not Found',
                                    VehicleMake: vehicleDetails.rc_maker_model||'VehicleMake Not Found',
                                    Valid: valid || 'Vehicle Data Not Found'
                                });
                                await vahan_details.create(vehicleDetails);
                            } catch (parseError) {
                                console.error(`Error parsing XML for vehicle number ${vehicleNumber}:`, parseError);
                                console.log("Response content:", json.response[0].response);
                                responses.push({
                                    vehiclenumber: vehicleNumber,
                                    OwnerName: 'Error parsing data',
                                    VehiclePurchaseDate: 'Error parsing data',
                                    InsurancePolicyNumbe: 'Error parsing data',
                                    InsuracePolicyValidityUpto: 'Error parsing data',
                                    PollutionCertificateNumber: 'Error parsing data',
                                    PollutionValidityUpto: 'Error parsing data',
                                    RegistrationNumberValidity: 'Error parsing data',
                                    FitnessCertificateValidityUpto: 'Error parsing data',
                                    RoadTaxValidityUpto: 'Error parsing data',
                                    RegistrationDate: 'Error parsing data',
                                    VehicleMake:'Error parsing data',
                                    Valid: 'Error parsing data'
                                });
                            }
                        }
                    } catch (fetchError) {
                        console.error(`Error fetching data for vehicle number ${vehicleNumber}:`, fetchError);
                        responses.push({
                            vehiclenumber: vehicleNumber,
                            OwnerName: 'Error fetching data',
                            VehiclePurchaseDate: 'Error fetching data',
                            InsurancePolicyNumbe: 'Error fetching data',
                            InsuracePolicyValidityUpto: 'Error fetching data',
                            PollutionCertificateNumber: 'Error fetching data',
                            PollutionValidityUpto: 'Error fetching data',
                            RegistrationNumberValidity: 'Error fetching data',
                            FitnessCertificateValidityUpto: 'Error fetching data',
                            RoadTaxValidityUpto: 'Error fetching data',
                            RegistrationDate: 'Error fetching data',
                            VehicleMake:'Error fetching data',
                            Valid: 'Error fetching data'
                        });
                    }
                }
    
                const newWorkbook = XLSXStyle.utils.book_new();
                let extractedData1 = [[
                    { v: 'vehiclenumber' },
                    { v: 'OwnerName' },
                    { v: 'VehiclePurchaseDate' },
                    { v: 'InsurancePolicyNumbe' },
                    { v: 'InsuracePolicyValidityUpto' },
                    { v: 'PollutionCertificateNumber' },
                    { v: 'PollutionValidityUpto' },
                    { v: 'RegistrationNumberValidity' },
                    { v: 'FitnessCertificateValidityUpto' },
                    { v: 'RoadTaxValidityUpto' },
                    { v: 'RegistrationDate' },
                    { v: 'VehicleMake' },

                    { v: 'Valid' },
                ]];
    
                responses.forEach((item_1) => {
                    let obj = {
                        'vehiclenumber': item_1.vehiclenumber,
                        'OwnerName': item_1.OwnerName,
                        'VehiclePurchaseDate': item_1.VehiclePurchaseDate,
                        'InsurancePolicyNumbe': item_1.InsurancePolicyNumbe,
                        'InsuracePolicyValidityUpto': item_1.InsuracePolicyValidityUpto,
                        'PollutionCertificateNumber': item_1.PollutionCertificateNumber,
                        'PollutionValidityUpto': item_1.PollutionValidityUpto,
                        'RegistrationNumberValidity': item_1.RegistrationNumberValidity,
                        'FitnessCertificateValidityUpto': item_1.FitnessCertificateValidityUpto,
                        'RoadTaxValidityUpto': item_1.RoadTaxValidityUpto,
                        'RegistrationDate':item_1.RegistrationDate,
                        'VehicleMake':item_1.VehicleMake,
                        'Valid': item_1.Valid
                    };
    
                    const row = [];
                    for (const key in obj) {
                        let setObj = { v: obj[key], t: "s" };
                        if (obj['Valid'] === 'Fit To Go') {
                            setObj.s = { fill: { fgColor: { rgb: '66FF66' } } }; // Highlight cells with green background
                        } else if (obj['Valid'] === 'Not Fit To Go') {
                            setObj.s = { fill: { fgColor: { rgb: 'FFCCCC' } } }; // Highlight cells with red background
                        } else if (obj['Valid'] === 'Vehicle Data Not Found') {
                            setObj.s = { fill: { fgColor: { rgb: 'ADD8E6' } } }; // Highlight cells with blue background
                        } else if (obj['Valid'] === 'Invalid vehicle Number Format') {
                            setObj.s = { fill: { fgColor: { rgb: 'FFFF00' } } }; // Highlight cells with yellow background
                        }
                        row.push(setObj);
                    }
                    extractedData1.push(row);
                });
    
                const worksheet1 = XLSXStyle.utils.aoa_to_sheet(extractedData1);
                XLSXStyle.utils.book_append_sheet(newWorkbook, worksheet1, "vehiclenumbers Response");
    
                const newFilePath = `uploads/responses_${Date.now()}.xlsx`;
                XLSXStyle.writeFile(newWorkbook, newFilePath);
    
                res.download(newFilePath, (err) => {
                    if (err) {
                        console.log('Error downloading file', err);
                    }
                    // Optionally delete the files after download
                    fs.unlinkSync(req.file.path);
                    fs.unlinkSync(newFilePath);
                });
        } else if (req.params.ulipIs === "SARATHI") {
            if (!data[0].hasOwnProperty('dlnumber') && !data[1].hasOwnProperty('dob')) {
                fs.unlinkSync(req.file.path);
                return res.status(400).send({ code: 400, message: 'The uploaded file must contain a column named "dlnumber" and "dob"' });
            }
            for (const row of data) {
                let dob = row.dob
                // Convert Excel serial date to dd-mm-yyyy format if necessary
                const dlDetails = await sarathi_details.findOne({ where: { dlLicno: req.body.dlnumber } ,raw: true}    );
                if (dlDetails) {            
                    console.log(`📌 Found in DB → No ULIP call for DL Number ${row.dlnumber}`);
                    responses.push({ dlnumber: row.dlnumber, DrivingLicenseValidityUpto: dlDetails.dlNtValdtoDt || 'Not Found', Message: 'SUCCESSFULL' });
                    continue;
                }

                if (typeof dob === 'number') {
                    dob = excelSerialDateToJSDate(dob);
                }
                const obj = {
                    dlnumber: row.dlnumber,
                    dob: dob
                }
                const url = `${process.env.ulip_url}/${req.params.ulipIs}/${req.params.reqIs}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': "application/json",
                        'Authorization': `Bearer ${req.authorization}`,
                    },
                    body: JSON.stringify(obj),
                    //  agent: new https.Agent({ rejectUnauthorized: false })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('Error response:', errorText);
                    responses.push({ dlnumber: obj.dlnumber, DrivingLicenseValidityUpto: "-------", Message: `HTTP error ${response.status} Gateway Time-out` });
                    continue;
                }
    
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    const json = await response.json();
                    // console.log("------------json", json);
                    // console.log("====json", json);
                    if (json.error === 'true' && json.code === '200' && json.response[0].responseStatus === 'ERROR') {
                        responses.push({ dlnumber: obj.dlnumber, DrivingLicenseValidityUpto: "-------", Message: json.response[0].response });
                    } else if (json.code === '400' && json.error === 'true') {
                        responses.push({ dlnumber: obj.dlnumber, DrivingLicenseValidityUpto: "-------", Message: json.message });
                    } else if (json.code === '200' && json.response[0].response.dldetobj[0].erormsg === 'Details not available ') {
                        responses.push({ dlnumber: obj.dlnumber, DrivingLicenseValidityUpto: '***********', Message: 'Details not available' });
                    } else {
                        responses.push({ dlnumber: obj.dlnumber, DrivingLicenseValidityUpto: json.response[0].response.dldetobj[0].dlobj.dlNtValdtoDt, Message: 'SUCCESSFULL' });
                    }
                } else {
                    const text = await response.text();
                    console.log('Non-JSON response:', text);
                    responses.push({ dlnumber: obj.dlnumber, DrivingLicenseValidityUpto: "-------", Message: 'Unexpected response format' });
                }
            }
            const newSheet = xlsx.utils.json_to_sheet(responses);
            const newWorkbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Responses');

            const newFilePath = `uploads/responses_${Date.now()}.xlsx`;
            xlsx.writeFile(newWorkbook, newFilePath);

            res.download(newFilePath, (err) => {
                if (err) {
                    console.log('Error downloading file', err);
                }
                // Optionally delete the files after download
                 fs.unlinkSync(req.file.path);
                 fs.unlinkSync(newFilePath);
                 console.log('File deleted successfully');            });
        }

        // const newSheet = xlsx.utils.json_to_sheet(responses);
        // const newWorkbook = XLSXStyle.utils.book_new();
        // const range = xlsx.utils.decode_range(newSheet['!ref']);
        // const validColumnIndex = Object.keys(responses[0]).length - 1; // Get index of the last column "valid"

        // for (let row = range.s.r + 1; row <= range.e.r; row++) { // Skip header row
        //     const cellAddress = XLSXStyle.utils.encode_cell({ r: row, c: validColumnIndex });
        //     const cell = newSheet[cellAddress];
        //     if (cell && cell.v) {
        //         if (cell.v === 'Fit To Go') {
        //             newSheet[cellAddress] = { ...cell, s: { fill: { fgColor: { rgb: "00FF00" } } } }; // Green background
        //         } else if (cell.v === 'Not Fit To Go') {
        //             newSheet[cellAddress] = { ...cell, s: { fill: { fgColor: { rgb: "FF0000" } } } }; // Red background
        //         }
        //     }
        // }
        //  const worksheet = XLSXStyle.utils.aoa_to_sheet(range)
        // XLSXStyle.utils.book_append_sheet(newWorkbook, newSheet, 'Responses');

    } catch (error) {
        fs.unlinkSync(req.file.path);
        console.log('-----------error',error);
        res.status(500).send({ code: 500, message: error.message });
    }
});







// router.post("/ulip/v1.0.0/VAHAN/02",fetchuser, fetchapi, async(req,res)=>{

//     try {

//         const response = await fetch(`http://localhost:3002/api/vahaan/ulip/v1.0.0/VAHAN/02`, {
//             method: 'POST'
//         })
//           const json = await response.json()
//         res.send({success:"API key fetch successfully", json})

//     } catch (error) {

//     }

// })


// router.post("/ulip/v1.0.0/VAHAN/03",fetchuser, fetchapi, async(req,res)=>{

//     try {

//         const response = await fetch(`http://localhost:3002/api/vahaan/ulip/v1.0.0/VAHAN/02`, {
//             method: 'POST'
//         })
//           const json = await response.json()
//         res.send({success:"API key fetch successfully", json})

//     } catch (error) {

//     }

// })


module.exports = router
