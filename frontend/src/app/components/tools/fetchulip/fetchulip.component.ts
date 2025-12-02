import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { ApiKeys } from 'src/app/ApiKeys';
import { apiService } from 'src/app/services/api/apiservice';
import { KeypageService } from 'src/app/services/keypage/keypage.service';

interface MyObject {
  [key: string]: any;
}
@Component({
  selector: 'app-fetchulip',
  templateUrl: './fetchulip.component.html',
  styleUrls: ['./fetchulip.component.css']
})
export class FetchulipComponent implements OnInit {
  visibleVahan: boolean = false;
  ifVahanFit: boolean = true
  VahanUnfitList: string[] = []

  showDialogVahan() {
    this.visibleVahan = true
  }
  onLoading: boolean = false;
  allOutputTabs: string[] = []
  refineVahan() {
    console.log("insdie teh refinement")
    for (let i = 0; i < this.outputObjCompleteArr.length; ++i) {
      if (this.outputObjCompleteArr[i].length > 0 && typeof this.outputObjCompleteArr[i][0].vl === 'object') {
        console.log("Insidd teh if 1")
        if (this.outputObjCompleteArr[i][0].vl._text) {
          console.log("Insidd teh if 2")
          this.outputObjCompleteArr[i][0].vl = this.outputObjCompleteArr[i][0].vl._text
        }
      }
    }
  }
  // findUnixDate(dateString: string) {
  //   const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  //   const dateArr = dateString.split("-")
  //   const date = dateArr[0]
  //   const myMont = month.indexOf(dateArr[1]) + 1
  //   const year = dateArr[2]
  //   const dateInString: string = String(year) + "-" + String(myMont) + "-" + String(date)
  //   console.log("date in string is ", dateInString)
  //   const myDateIs = new Date(dateInString)
  //   const unixTimestamp = Math.floor(myDateIs.getTime() / 1000);
  //
  //   return unixTimestamp;
  // }
  findUnixDate(dateString: string | null | undefined) {
    if (!dateString) {  // Check if dateString is undefined or null
      console.warn("findUnixDate received an undefined or null dateString");
      return 0;  // Return a default value (Unix timestamp 0) or handle as needed
    }

    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateArr = dateString.split("-");

    if (dateArr.length !== 3) {  // Ensure the date format is correct
      console.error("Invalid date format received in findUnixDate:", dateString);
      return 0;
    }

    const date = dateArr[0];
    const myMonth = month.indexOf(dateArr[1]) + 1;
    const year = dateArr[2];

    if (myMonth === 0) {  // If month is not found in the list
      console.error("Invalid month format in dateString:", dateString);
      return 0;
    }

    const dateInString: string = `${year}-${myMonth}-${date}`;
    console.log("Formatted date string:", dateInString);

    const myDateIs = new Date(dateInString);
    const unixTimestamp = Math.floor(myDateIs.getTime() / 1000);

    return unixTimestamp;
  }

  fetchArrObj(mydata2: any) {


    this.outputObjCompleteArr = []

    let allKeys = Object.keys(mydata2)
    this.tableOutputHeader = allKeys
    let allValues = Object.values(mydata2)
    let tempObjArrOutput: Array<{
      dt: string,
      vl: any
    }> = []
    let tempArray: Array<{
      dt: string,
      vl: any
    }> = []
    for (let i = 0; i < allKeys.length; ++i) {
      let tempObj: {
        dt: string,
        vl: any
      } = {
        dt: '',
        vl: ''
      }
      tempObj.dt = allKeys[i]

      if (typeof allValues[i] === 'object' && !Array.isArray(allValues[i])) {

        let objArrKeys = Object.keys(Object(allValues[i]))
        let objArrVal = Object.values(Object(allValues[i]));

        for (let i = 0; i < objArrKeys.length; ++i) {
          let veryVeryTempObj = {
            dt: objArrKeys[i],
            vl: objArrVal[i]
          }
          tempObjArrOutput.push(veryVeryTempObj)
        }
        this.outputObjCompleteArr.push(tempObjArrOutput)
        tempObjArrOutput = []
      }
      else if (typeof allValues[i] === 'object' && Array.isArray(allValues[i]) && allValues[i] !== null && allValues[i] !== undefined) {
        // let tempObjVal:any = allValues[i]let objArrKeys = Object.keys(allValues[i][0] as Record<string, any>);
        let val_arr = allValues[i] as any[]
        let objArrKeys = Object.keys(Object(val_arr[0]));
        let objArrVal = Object.values(Object(val_arr[0]));

        for (let i = 0; i < objArrKeys.length; ++i) {
          let veryVeryTempObj = {
            dt: objArrKeys[i],
            vl: objArrVal[i]
          }
          tempObjArrOutput.push(veryVeryTempObj)
        }
        this.outputObjCompleteArr.push(tempObjArrOutput)
        tempObjArrOutput = []
      }
      else if (!Array.isArray(allValues[i])) {
        while (i < allKeys.length && typeof allValues[i] !== 'object') {
          let veryVeryTempObj = {
            dt: allKeys[i],
            vl: allValues[i]
          }
          tempArray.push(veryVeryTempObj)
          i++;
        }
        i--;

        this.outputObjCompleteArr.push(tempArray)
        tempArray = []
      }
    }

  }
  handleOnSubmitRequest() {
    this.outputObjCompleteArr = []
    this.onLoading = true
    this.outputObjArr = []
    this.outputObjCompleteVS = []
    let ind = this.selectedVersionMap.get(this.selectedVersion)
    let verNum = '0'
    if (ind < 9) {
      verNum += String(ind + 1)
    }
    else {
      verNum = String(ind + 1)
    }
    const myUrl = this.apiSrivice.mainUrl + 'aping/ulipui/' + this.selectedUlipArr + "/" + verNum;
    let ind2 = this.selectedUlipMap.get(this.selectedUlipArr)
    console.log("here", this.selectedUlipArr, ind2, ind)
    const myKeyArr = this.correctFetchArr[ind2].input[ind]

    let reqObj: any = {}
    if (myKeyArr.length === this.textInputUlip.length) {
      for (let i = 0; i < myKeyArr.length; ++i) {
        if (myKeyArr[i] === 'dob') {
          console.log("my date is, ", this.textInputUlip[i])
          reqObj[myKeyArr[i]] = this.textInputUlip[i]
          continue
        }
        //         reqObj[myKeyArr[i]] = this.textInputUlip[i]

        if (myKeyArr[i] === 'rc_regn_no' || myKeyArr[i].toLowerCase().includes("vehicle")) {
          reqObj[myKeyArr[i]] = this.textInputUlip[i].toUpperCase();
        } else {
          reqObj[myKeyArr[i]] = this.textInputUlip[i];
        }
      }
    }
    else {
      this.messageService.add({ severity: 'error', summary: 'Submission Failed', detail: 'Plese Enter all the details' });
      return
    }


    const headers = new HttpHeaders({
      'auth-token': this.tokeVal || '',
      'Content-Type': 'application/json',
      'api-key': "16f78afa-e306-424e-8a08-21ad21629404",
      'seckey': "f968799f2906991647c9941bbd8c97a746cd2cc320f390a310c170e0f072bc5bf71c372060e799b75a323f57d3ccdf8b",
      'user': `${localStorage.getItem("ulip-person-username")}`
    });

    this.http.post<any>(myUrl, reqObj, { headers }).subscribe({
      next: data => {
        let mydata = data.json;
        console.log(mydata, '=================')
        // if(this.selectedUlipArr === "VAHAN"){
        //  mydata = data.json
        // }
        // else{
        //   mydata = data.json.response.json

        // }
        debugger
        if(data.response == null){

let outputObjCompleteVSTemp: Array<{
            dt: string,
            vl: any,
            valid: any
          }> = [];
            outputObjCompleteVSTemp = [
            { dt: data.code, vl: data.message, valid: null },
          
            ]
          this.outputObjCompleteVS.push(outputObjCompleteVSTemp)
          this.onLoading = false
          

        }

        if (this.selectedUlipArr === "VAHAN") {
          console.log("Inside teh vahan")
          let allKeys = Object.keys(mydata)
          let allValues = Object.values(mydata)


          let todayDate = new Date()
          let todayDateUnix = Number(Math.floor(todayDate.getTime() / 1000))
          this.VahanUnfitList = []
          this.ifVahanFit = true
          console.log("Inside the date conversion")
          let rcRegnDate = Number(this.findUnixDate(mydata.rc_regn_upto))
          let rcFitDate = Number(this.findUnixDate(mydata.rc_fit_upto))

          // let rcTaxDateValStr = String(mydata.rc_tax_upto)
          // let rcTaxDateArr = rcTaxDateValStr.split("-")
          // let rcTaxDateFinStr = String(rcTaxDateArr[2]) + "-" + String(rcTaxDateArr[1]) + "-" + String(rcTaxDateArr[0])
          // let rcTaxDateVal = new Date(rcTaxDateFinStr)
          // let rcTaxDate = Number(Math.floor(rcTaxDateVal.getTime() / 1000))

          let rcTaxDate: number = 0; // Declare rcTaxDate with a default value
          let rcTaxDateVal: any
          let rcTaxDateFinStr: any
          let rcTaxDateValStr = mydata.rc_tax_upto ? String(mydata.rc_tax_upto) : ""; // Check if it exists
          if (rcTaxDateValStr && rcTaxDateValStr.includes("-")) {
            let rcTaxDateArr = rcTaxDateValStr.split("-");
            if (rcTaxDateArr.length === 3) { // Ensure valid format (YYYY-MM-DD or DD-MM-YYYY)
              rcTaxDateFinStr = `${rcTaxDateArr[2]}-${rcTaxDateArr[1]}-${rcTaxDateArr[0]}`;
              rcTaxDateVal = new Date(rcTaxDateFinStr);
              rcTaxDate = Math.floor(rcTaxDateVal.getTime() / 1000); // Assign value here
              console.log("RC Tax Date: ", rcTaxDate);
            } else {
              console.error("Invalid rc_tax_upto format:", rcTaxDateValStr);
            }
          } else {
            console.warn("rc_tax_upto is undefined, empty, or not in the correct format.");
          }

// Now rcTaxDate will always have a value (either a valid date or 0)

          let rcInsuDate = Number(this.findUnixDate(mydata.rc_insurance_upto))
          let rcPuccDate = Number(this.findUnixDate(mydata.rc_pucc_upto))
          console.log("my rc tax date ", rcTaxDate, rcTaxDateVal, todayDateUnix, mydata.rc_tax_upto, rcTaxDateFinStr)

          if (rcRegnDate < todayDateUnix) {
            this.VahanUnfitList.push("RC Registration Validity Expired")
          }
          if (rcFitDate < todayDateUnix) {
            this.VahanUnfitList.push("RC Fit")
          }
          if (rcTaxDate < todayDateUnix) {
            this.VahanUnfitList.push("RC Tax")
          }
          if (rcInsuDate < todayDateUnix) {
            this.VahanUnfitList.push("RC Insurance")
          }
          if (rcPuccDate < todayDateUnix) {
            this.VahanUnfitList.push("RC Pollution Control")
          }
          if (this.VahanUnfitList.length > 0) {
            this.ifVahanFit = false
          }
          this.showDialogVahan()

          let outputObjCompleteVSTemp: Array<{
            dt: string,
            vl: any,
            valid: any
          }> = [];

          outputObjCompleteVSTemp = [
            { dt: 'Registration Number', vl: mydata.rc_regn_no, valid: null },
            { dt: 'Registration Number Validity', vl: mydata.rc_regn_upto, valid: rcRegnDate > todayDateUnix },
            { dt: 'Owner Name', vl: mydata.rc_owner_name, valid: null },
            { dt: 'Vehicle Purchase Date', vl: mydata.rc_purchase_dt, valid: null },
            { dt: 'Insurance Policy Number', vl: mydata.rc_insurance_policy_no, valid: null },
            { dt: 'Insurace Policy Validity Upto', vl: mydata.rc_insurance_upto, valid: rcInsuDate > todayDateUnix },
            { dt: 'Pollution Certificate Number', vl: mydata.rc_pucc_no, valid: null },
            { dt: 'Pollution Validity Upto', vl: mydata.rc_pucc_upto, valid: rcPuccDate > todayDateUnix },
            { dt: 'Fitness Certificate Validity Upto', vl: mydata.rc_fit_upto, valid: rcFitDate>todayDateUnix },
            { dt: 'Road Tax Validity Upto', vl: mydata.rc_tax_upto, valid: rcTaxDate > todayDateUnix },
            { dt: 'Registration Date', vl: mydata.rc_regn_dt, valid: null },
            { dt: 'Vehicle Make', vl: mydata.rc_maker_model, valid: null },
          ]
          this.outputObjCompleteVS.push(outputObjCompleteVSTemp)

        }
        else if (this.selectedUlipArr === "SARATHI") {
          this.outputObjCompleteVS = []
          let todayDate = new Date()
          let todayDateUnix = Number(Math.floor(todayDate.getTime() / 1000))
          if(data.type === "api"){
          let mydata2 = mydata.response[0].response.dldetobj[0]
          let outputObjCompleteVSTemp: Array<{
            dt: string,
            vl: any,
            valid: any
          }> = [];
          console.log("my data2 is ", mydata2)
          if(mydata2.dlobj === null){
            console.log("it's an errro")
          }
          let dlExpDate = new Date(mydata2.dlobj.dlNtValdtoDt)
          let dlExpDateNum = Number(Math.floor(dlExpDate.getTime() / 1000))
          console.log("My DL exp date is ", dlExpDate)
          outputObjCompleteVSTemp = [

            { dt: 'Driving license Number', vl: mydata2.dlobj.dlLicno, valid: null },
            { dt: 'Driving license Validity Upto', vl: mydata2.dlobj.dlNtValdtoDt, valid: dlExpDateNum > todayDateUnix },

          ]
          this.outputObjCompleteVS.push(outputObjCompleteVSTemp)
          }else if (data.type === "DB"){
            let mydata2 = mydata

          let outputObjCompleteVSTemp: Array<{
            dt: string,
            vl: any,
            valid: any
          }> = [];
          console.log("my data2 is ", mydata2)
          if(mydata2.dlobj === null){
            console.log("it's an errro")
          }
          let dlExpDate = new Date(mydata2.dlNtValdtoDt)
          let dlExpDateNum = Number(Math.floor(dlExpDate.getTime() / 1000))
          console.log("My DL exp date is ", dlExpDate)
          outputObjCompleteVSTemp = [

            { dt: 'Driving license Number', vl: mydata2.dlLicno, valid: null },
            { dt: 'Driving license Validity Upto', vl: mydata2.dlNtValdtoDt, valid: dlExpDateNum > todayDateUnix },

          ]
           this.outputObjCompleteVS.push(outputObjCompleteVSTemp)

        }
        }
        // else if (this.selectedUlipArr === "FOIS") {
        //   // this.outputObjCompleteArr = []
        //   // let mydata2 = mydata.response[0].response[0]
        //   let mydata2 = mydata
        //   this.outputObjCompleteArr = mydata2;
        //   console.log(mydata2, '====================', this.outputObjCompleteArr)
        //   let allKeys = Object.keys(mydata2)
        //
        //   let allValues = Object.values(mydata2)
        //   let tempObjArrOutput: Array<{
        //     dt: string,
        //     vl: any
        //   }> = []
        //   let tempArray: Array<{
        //     dt: string,
        //     vl: any
        //   }> = []
        //   for (let i = 0; i < allKeys.length; ++i) {
        //     let tempObj: {
        //       dt: string,
        //       vl: any
        //     } = {
        //       dt: '',
        //       vl: ''
        //     }
        //     tempObj.dt = allKeys[i]
        //
        //     if (typeof allValues[i] === 'object') {
        //       let objArrKeys = Object.keys(Object(allValues[i]))
        //       let objArrVal = Object.values(Object(allValues[i]));
        //       for (let i = 0; i < objArrKeys.length; ++i) {
        //         let veryVeryTempObj = {
        //           dt: objArrKeys[i],
        //           vl: objArrVal[i]
        //         }
        //         tempObjArrOutput.push(veryVeryTempObj)
        //       }
        //       this.outputObjCompleteArr.push(tempObjArrOutput)
        //       tempObjArrOutput = []
        //     }
        //     else {
        //       while (i < allKeys.length && typeof allValues[i] !== 'object') {
        //         let veryVeryTempObj = {
        //           dt: allKeys[i],
        //           vl: allValues[i]
        //         }
        //         tempArray.push(veryVeryTempObj)
        //         i++;
        //       }
        //       i--;
        //
        //       this.outputObjCompleteArr.push(tempArray)
        //       tempArray = []
        //     }
        //
        //   }
        //
        //
        //
        // }
        else if (this.selectedUlipArr === "LDB") {

          this.handleLDB1(mydata.response[0].response.eximContainerTrail)
          this.handleLDB2(mydata.response[0].response.domesticContainerTrail)



        } else if (this.selectedUlipArr === "FASTAG") {

          this.fastagFun(mydata.response)
          // this.handleLDB2(mydata.response[0].response.domesticContainerTrail)



        } else if (this.selectedUlipArr === "FOIS") {

          this.foisFun(mydata)
          // this.handleLDB2(mydata.response[0].response.domesticContainerTrail)



        }
        else if (this.selectedUlipArr === 'EWAYBILL') {
          let mydata2 = mydata.response[0].response
          this.fetchArrObj(mydata2)

        }
        else if (this.selectedUlipArr === 'ECHALLAN') {

          this.allOutputTabs = ['Pending_data', 'Disposed_data'];

          this.outputObjCompleteArrEchallan1 = this.handleEchallan2(mydata.response[0].response.data.Pending_data);
          this.outputObjCompleteAllChallan.push(this.outputObjCompleteArrEchallan1)

          this.outputObjCompleteArrEchallan1 = this.handleEchallan2(mydata.response[0].response.data.Disposed_data);
          this.outputObjCompleteAllChallan.push(this.outputObjCompleteArrEchallan1)

          console.log(this.outputObjCompleteAllChallan, " Is my complete challan")

        }
        this.onLoading = false



      },
      error: error => {
        console.log("the error has occured")
        let allKeys = Object.keys(error.error)
        let allValues = Object.values(error.error)
        console.log("The error is ", error.error)
        this.outputObjArr = []
        this.outputObjCompleteVS = []
        for (let i = 0; i < allKeys.length; ++i) {
          let tempObj: {
            dt: string,
            vl: any,
            valid:any
          } = {
            dt: '',
            vl: '',
            valid:null
          }
          tempObj.dt = allKeys[i]
          tempObj.vl = String(allValues[i]);
          this.outputObjArr.push(tempObj)

        }
        this.outputObjCompleteVS.push(this.outputObjArr)
        this.onLoading = false
      }
    })



  }

  constructor(private http: HttpClient, private router: Router, public keypage: KeypageService, private messageService: MessageService, private apiSrivice: apiService, private confirmationService: ConfirmationService) { }

  apiData: ApiKeys[] = []
  tableOutputHeader: string[] = []

  handleOnUlipClick() {
    this.versionUlip = []
    let ind = this.selectedUlipMap.get(this.selectedUlipArr)
    this.selectedVersion = this.fetchArr[ind].use[0]

    for (let i = 0; i < this.fetchArr[ind].use.length; ++i) {
      this.versionUlip.push(this.fetchArr[ind].use[i])
      this.selectedVersionMap.set(this.fetchArr[ind].use[i], i)
    }
    this.handleOnVersionChange()
  }
  handleOnVersionChange() {
    this.takeInputObjArr = []
    this.textInputUlip = []
    let ind = this.selectedVersionMap.get(this.selectedVersion)
    let ind2 = this.selectedUlipMap.get(this.selectedUlipArr)
    let len = this.fetchArr[ind2].input[ind].length
    for (let i = 0; i < len; ++i) {
      let obj = {
        dt: this.fetchArr[ind2].input[ind][i],
        vl: "empty"
      }
      this.takeInputObjArr.push(obj)
    }
  }
  // textInputUlip: string = ''
fastagListData: any = [];
foisListData: any = [];
  value: string = "";
  takeInputObj: any;
  takeInputObjArr: {
    dt: string,
    vl: string
  }[] = [];

  outputObjArr: {
    dt: string,
    vl: any,
    valid:null
  }[] = [];
  outputObjCompleteArr: Array<Array<{
    dt: string,
    vl: any
  }>> = [];

  outputObjCompleteVS: Array<Array<{
    dt: string,
    vl: any,
    valid: any,
  }>> = [];
  outputObjCompleteArrLDB1: Array<Array<Array<{
    dt: string,
    vl: any
  }>>> = [];
  outputObjCompleteArrLDB2: Array<Array<Array<{
    dt: string,
    vl: any
  }>>> = [];

  outputObjCompleteArrEchallan1: Array<Array<Array<{
    dt: string,
    vl: any
  }>>> = [];
  outputObjCompleteArrEchallan2: Array<Array<Array<{
    dt: string,
    vl: any
  }>>> = [];
  outputObjCompleteAllChallan: Array<Array<Array<Array<{
    dt: string,
    vl: any
  }>>>> = [];

  textInputUlip: string[] = new Array(this.takeInputObjArr.length).fill('');

  fetchArr: { ulip: string, use: Array<string>, input: Array<Array<string>> }[] = [
    {
      "ulip": "VAHAN",
      "use": ["Vehicle Data"],
      "input": [["Vehicle Number"]]
    },
    {
      "ulip": "SARATHI",
      "use": ["Driving License Data"],
      "input": [["DL Number", "Date of Birth"]]
    },
    {
      "ulip": "FOIS",
      "use": ["FOIS Information", "Travelling Details"],
      "input": [["FNR Number"], ["Station from", "Station To", "CMDT", "Wagon Type"]]
    },
    {
      "ulip": "LDB",
      "use": ["Track Container"],
      "input": [["Container Number"]]
    },
    // {
    //   "ulip": "EWAYBILL",
    //   "use": ["e-Way Bill Details"],
    //   "input": [["e-Way Bill Number"]]
    // },
    // {
    //   "ulip": "ECHALLAN",
    //   "use": ["e-Challan Details"],
    //   "input": [["Vehicle Number"]]
    // },
    {
      "ulip": "FASTAG",
      "use": ["Track Vehicle"],
      "input": [["Vehicle Number"]]
    },



  ]


  correctFetchArr: { ulip: string, use: Array<string>, input: Array<Array<string>> }[] = [
    {
      "ulip": "VAHAN",
      "use": ["Vehicle Data"],
      "input": [["vehiclenumber"]]
    },
    {
      "ulip": "SARATHI",
      "use": ["Driving License Data"],
      "input": [["dlnumber", "dob"]]
    },
    {
      "ulip": "FOIS",
      "use": ["FOIS Information", "Travelling Details"],
      "input": [["fnrnumber"], ["sttnfrom", "sttnto", "cmdt", "wgontype"]]
    },
    {
      "ulip": "LDB",
      "use": ["Track Container"],
      "input": [["containerNumber"]]
    },
    // {
    //   "ulip": "EWAYBILL",
    //   "use": ["e-Way Bill Details"],
    //   "input": [["ewbNo"]]
    // },
    // {
    //   "ulip": "ECHALLAN",
    //   "use": ["e-Challan Details"],
    //   "input": [["vehicleNumber"]]
    // },
    {
      "ulip": "FASTAG",
      "use": ["Track Vehicle"],
      "input": [["vehiclenumber"]]
    },

  ]


  ulipArr: string[] = []
  selectedUlipMap = new Map();
  selectedVersionMap = new Map();

  selectedUlipArr: string | undefined

  versionUlip: string[] = []
  selectedVersion: string | undefined
  tokeVal: string = `${localStorage.getItem("authtoken")}`;

  handleOnChangeInputs(i: any) {

  }

  ngOnInit() {
    this.keypage.pageNav = 2
    // this.apis = ['VAHAN', 'SARATHI', 'FOIS'];
    for (let i = 0; i < this.fetchArr.length; ++i) {
      let obj = {
        name: this.fetchArr[i].ulip,
        // code:String(i)
      }
      this.selectedUlipMap.set(this.fetchArr[i].ulip, i)
      this.ulipArr.push(this.fetchArr[i].ulip)
    }
  }

  handleLDB1(mydata2: any) {
    this.outputObjCompleteArrLDB1 = []
    // console.log("My data is ", mydata.json.response[0].response.dldetobj[0])
    // let mydata2 = mydata.response[0].response.eximContainerTrail

    let allKeys = Object.keys(mydata2)
    this.tableOutputHeader = allKeys
    let allValues = Object.values(mydata2)
    let tempObjArrOutput: Array<{
      dt: string,
      vl: any
    }> = []
    let tempArray: Array<{
      dt: string,
      vl: any
    }> = []
    for (let i = 0; i < allKeys.length; ++i) {
      let tempObj: {
        dt: string,
        vl: any
      } = {
        dt: '',
        vl: ''
      }
      tempObj.dt = allKeys[i]

      if (typeof allValues[i] === 'object' && !Array.isArray(allValues[i])) {
        // let tempObjVal:any = allValues[i]
        let objArrKeys = Object.keys(Object(allValues[i]))
        let objArrVal = Object.values(Object(allValues[i]));
        console.log("inside teh if")
        console.log("Objarrkeys ", allValues[i])
        for (let i = 0; i < objArrKeys.length; ++i) {
          let veryVeryTempObj = {
            dt: objArrKeys[i],
            vl: objArrVal[i]
          }
          tempObjArrOutput.push(veryVeryTempObj)
        }
        let ldbTempArrOutput: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArrOutput.push(tempObjArrOutput)
        this.outputObjCompleteArrLDB1.push(ldbTempArrOutput)
        tempObjArrOutput = []
      }
      else if (typeof allValues[i] === 'object' && Array.isArray(allValues[i]) && allValues[i] !== null && allValues[i] !== undefined) {
        // let tempObjVal:any = allValues[i]let objArrKeys = Object.keys(allValues[i][0] as Record<string, any>);
        let val_arr = allValues[i] as any[]
        let tempObjArrOutputArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        for (let i = 0; i < val_arr.length; ++i) {
          let objArrKeys = Object.keys(Object(val_arr[i]));
          let objArrVal = Object.values(Object(val_arr[i]));
          console.log("inside teh if")
          console.log("Objarrkeys ", allValues[i])
          for (let i = 0; i < objArrKeys.length; ++i) {
            let veryVeryTempObj = {
              dt: objArrKeys[i],
              vl: objArrVal[i]
            }
            tempObjArrOutput.push(veryVeryTempObj)
          }
          tempObjArrOutputArr.push(tempObjArrOutput)
          tempObjArrOutput = []
        }
        this.outputObjCompleteArrLDB1.push(tempObjArrOutputArr)
        tempObjArrOutputArr = []

      }
      else if (!Array.isArray(allValues[i])) {
        while (i < allKeys.length && typeof allValues[i] !== 'object') {
          let veryVeryTempObj = {
            dt: allKeys[i],
            vl: allValues[i]
          }
          tempArray.push(veryVeryTempObj)
          i++;
        }
        i--;
        let ldbTempArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArr.push(tempArray)

        this.outputObjCompleteArrLDB1.push(ldbTempArr)
        tempArray = []
        ldbTempArr = []
      }
    }
  }


  handleLDB2(mydata2: any) {
    this.outputObjCompleteArrLDB2 = []
    // console.log("My data is ", mydata.json.response[0].response.dldetobj[0])
    // let mydata2 = mydata.response[0].response.domesticContainerTrail

    let allKeys = Object.keys(mydata2)
    this.tableOutputHeader = allKeys
    let allValues = Object.values(mydata2)
    let tempObjArrOutput: Array<{
      dt: string,
      vl: any
    }> = []
    let tempArray: Array<{
      dt: string,
      vl: any
    }> = []
    for (let i = 0; i < allKeys.length; ++i) {
      let tempObj: {
        dt: string,
        vl: any
      } = {
        dt: '',
        vl: ''
      }
      tempObj.dt = allKeys[i]
      console.log("The type of is ", Array.isArray(allValues[i]))
      if (typeof allValues[i] === 'object' && !Array.isArray(allValues[i])) {
        // let tempObjVal:any = allValues[i]
        let objArrKeys = Object.keys(Object(allValues[i]))
        let objArrVal = Object.values(Object(allValues[i]));
        console.log("inside teh if")
        console.log("Objarrkeys ", allValues[i])
        for (let i = 0; i < objArrKeys.length; ++i) {
          let veryVeryTempObj = {
            dt: objArrKeys[i],
            vl: objArrVal[i]
          }
          tempObjArrOutput.push(veryVeryTempObj)
        }
        let ldbTempArrOutput: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArrOutput.push(tempObjArrOutput)
        this.outputObjCompleteArrLDB2.push(ldbTempArrOutput)
        tempObjArrOutput = []
      }
      else if (typeof allValues[i] === 'object' && Array.isArray(allValues[i]) && allValues[i] !== null && allValues[i] !== undefined) {
        // let tempObjVal:any = allValues[i]let objArrKeys = Object.keys(allValues[i][0] as Record<string, any>);
        let val_arr = allValues[i] as any[]
        let tempObjArrOutputArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        for (let i = 0; i < val_arr.length; ++i) {
          let objArrKeys = Object.keys(Object(val_arr[i]));
          let objArrVal = Object.values(Object(val_arr[i]));
          console.log("inside teh if")
          console.log("Objarrkeys ", allValues[i])
          for (let i = 0; i < objArrKeys.length; ++i) {
            let veryVeryTempObj = {
              dt: objArrKeys[i],
              vl: objArrVal[i]
            }
            tempObjArrOutput.push(veryVeryTempObj)
          }
          tempObjArrOutputArr.push(tempObjArrOutput)
          tempObjArrOutput = []
        }
        this.outputObjCompleteArrLDB2.push(tempObjArrOutputArr)
        tempObjArrOutputArr = []

      }
      else if (!Array.isArray(allValues[i])) {
        while (i < allKeys.length && typeof allValues[i] !== 'object') {
          let veryVeryTempObj = {
            dt: allKeys[i],
            vl: allValues[i]
          }
          tempArray.push(veryVeryTempObj)
          i++;
        }
        i--;
        let ldbTempArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArr.push(tempArray)

        this.outputObjCompleteArrLDB2.push(ldbTempArr)
        tempArray = []
        ldbTempArr = []
      }
    }
  }

  // handleEchallan1(mydata: any) {
  //   this.outputObjCompleteArrLDB1 = []
  //   // console.log("My data is ", mydata.json.response[0].response.dldetobj[0])
  //   let mydata2 = mydata.response[0].response.eximContainerTrail

  //   let allKeys = Object.keys(mydata2)
  //   this.tableOutputHeader = allKeys
  //   let allValues = Object.values(mydata2)
  //   let tempObjArrOutput: Array<{
  //     dt: string,
  //     vl: any
  //   }> = []
  //   let tempArray: Array<{
  //     dt: string,
  //     vl: any
  //   }> = []
  //   for (let i = 0; i < allKeys.length; ++i) {
  //     let tempObj: {
  //       dt: string,
  //       vl: any
  //     } = {
  //       dt: '',
  //       vl: ''
  //     }
  //     tempObj.dt = allKeys[i]

  //     if (typeof allValues[i] === 'object' && !Array.isArray(allValues[i])) {
  //       // let tempObjVal:any = allValues[i]
  //       let objArrKeys = Object.keys(Object(allValues[i]))
  //       let objArrVal = Object.values(Object(allValues[i]));
  //       console.log("inside teh if")
  //       console.log("Objarrkeys ", allValues[i])
  //       for (let i = 0; i < objArrKeys.length; ++i) {
  //         let veryVeryTempObj = {
  //           dt: objArrKeys[i],
  //           vl: objArrVal[i]
  //         }
  //         tempObjArrOutput.push(veryVeryTempObj)
  //       }
  //       let ldbTempArrOutput: Array<Array<{
  //         dt: string,
  //         vl: any
  //       }>> = []
  //       ldbTempArrOutput.push(tempObjArrOutput)
  //       this.outputObjCompleteArrLDB1.push(ldbTempArrOutput)
  //       tempObjArrOutput = []
  //     }
  //     else if (typeof allValues[i] === 'object' && Array.isArray(allValues[i]) && allValues[i] !== null && allValues[i] !== undefined) {
  //       // let tempObjVal:any = allValues[i]let objArrKeys = Object.keys(allValues[i][0] as Record<string, any>);
  //       let val_arr = allValues[i] as any[]
  //       let tempObjArrOutputArr: Array<Array<{
  //         dt: string,
  //         vl: any
  //       }>> = []
  //       for (let i = 0; i < val_arr.length; ++i) {
  //         let objArrKeys = Object.keys(Object(val_arr[i]));
  //         let objArrVal = Object.values(Object(val_arr[i]));
  //         console.log("inside teh if")
  //         console.log("Objarrkeys ", allValues[i])
  //         for (let i = 0; i < objArrKeys.length; ++i) {
  //           let veryVeryTempObj = {
  //             dt: objArrKeys[i],
  //             vl: objArrVal[i]
  //           }
  //           tempObjArrOutput.push(veryVeryTempObj)
  //         }
  //         tempObjArrOutputArr.push(tempObjArrOutput)
  //         tempObjArrOutput = []
  //       }
  //       this.outputObjCompleteArrLDB1.push(tempObjArrOutputArr)
  //       tempObjArrOutputArr = []

  //     }
  //     else if (!Array.isArray(allValues[i])) {
  //       while (i < allKeys.length && typeof allValues[i] !== 'object') {
  //         let veryVeryTempObj = {
  //           dt: allKeys[i],
  //           vl: allValues[i]
  //         }
  //         tempArray.push(veryVeryTempObj)
  //         i++;
  //       }
  //       i--;
  //       let ldbTempArr: Array<Array<{
  //         dt: string,
  //         vl: any
  //       }>> = []
  //       ldbTempArr.push(tempArray)

  //       this.outputObjCompleteArrLDB1.push(ldbTempArr)
  //       tempArray = []
  //       ldbTempArr = []
  //     }
  //   }
  // }
  fastagFun(mydata2: any): void {
    this.fastagListData = mydata2;
    // this.fastagListData = []
    // console.log("My data is ", mydata.json.response[0].response.dldetobj[0])
    // let mydata2 = mydata.response[0].response.eximContainerTrail
    console.log(mydata2,'==========================', this.fastagListData);
    let allKeys = Object.keys(mydata2)
    this.tableOutputHeader = allKeys
    let allValues = Object.values(mydata2)
    console.log(allKeys, '===========================================================================================================================', allValues)
    let tempObjArrOutput: Array<{
      dt: string,
      vl: any
    }> = []
    let tempArray: Array<{
      dt: string,
      vl: any
    }> = []
    for (let i = 0; i < allKeys.length; ++i) {
      let tempObj: {
        dt: string,
        vl: any
      } = {
        dt: '',
        vl: ''
      }
      tempObj.dt = allKeys[i]
      console.log(tempObj, 'tempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObj')

      if (typeof allValues[i] === 'object' && !Array.isArray(allValues[i])) {
        // let tempObjVal:any = allValues[i]
        let objArrKeys = Object.keys(Object(allValues[i]))
        let objArrVal = Object.values(Object(allValues[i]));
        console.log("inside teh if")
        console.log("Objarrkeys ", allValues[i])
        for (let i = 0; i < objArrKeys.length; ++i) {
          let veryVeryTempObj = {
            dt: objArrKeys[i],
            vl: objArrVal[i]
          }
          tempObjArrOutput.push(veryVeryTempObj)
        }
        let ldbTempArrOutput: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        if (!Array.isArray(this.fastagListData)) {
          this.fastagListData = []; // Initialize fastagListData as an empty array
        }

  // Push elements into fastagListData
        this.fastagListData.push(ldbTempArrOutput);
        tempObjArrOutput = []
      }
      else if (typeof allValues[i] === 'object' && Array.isArray(allValues[i]) && allValues[i] !== null && allValues[i] !== undefined) {
        // let tempObjVal:any = allValues[i]let objArrKeys = Object.keys(allValues[i][0] as Record<string, any>);
        let val_arr = allValues[i] as any[]
        let tempObjArrOutputArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        for (let i = 0; i < val_arr.length; ++i) {
          let objArrKeys = Object.keys(Object(val_arr[i]));
          let objArrVal = Object.values(Object(val_arr[i]));
          console.log("inside teh if")
          console.log("Objarrkeys ", allValues[i])
          for (let i = 0; i < objArrKeys.length; ++i) {
            let veryVeryTempObj = {
              dt: objArrKeys[i],
              vl: objArrVal[i]
            }
            tempObjArrOutput.push(veryVeryTempObj)
          }
          tempObjArrOutputArr.push(tempObjArrOutput)
          tempObjArrOutput = []
        }
        this.fastagListData.push(tempObjArrOutputArr)
        tempObjArrOutputArr = []

      }
      else if (!Array.isArray(allValues[i])) {
        while (i < allKeys.length && typeof allValues[i] !== 'object') {
          let veryVeryTempObj = {
            dt: allKeys[i],
            vl: allValues[i]
          }
          tempArray.push(veryVeryTempObj)
          i++;
        }
        i--;
        let ldbTempArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArr.push(tempArray)

        this.fastagListData.push(ldbTempArr)
        tempArray = []
        ldbTempArr = []
      }
    }
  }
  foisFun(mydata2: any): void {
    this.foisListData = mydata2;
    // this.fastagListData = []
    // console.log("My data is ", mydata.json.response[0].response.dldetobj[0])
    // let mydata2 = mydata.response[0].response.eximContainerTrail
    console.log(mydata2,'==========================', this.foisListData);
    let allKeys = Object.keys(mydata2)
    this.tableOutputHeader = allKeys
    let allValues = Object.values(mydata2)
    console.log(allKeys, '===========================================================================================================================', allValues)
    let tempObjArrOutput: Array<{
      dt: string,
      vl: any
    }> = []
    let tempArray: Array<{
      dt: string,
      vl: any
    }> = []
    for (let i = 0; i < allKeys.length; ++i) {
      let tempObj: {
        dt: string,
        vl: any
      } = {
        dt: '',
        vl: ''
      }
      tempObj.dt = allKeys[i]
      console.log(tempObj, 'tempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObjtempObj')

      if (typeof allValues[i] === 'object' && !Array.isArray(allValues[i])) {
        // let tempObjVal:any = allValues[i]
        let objArrKeys = Object.keys(Object(allValues[i]))
        let objArrVal = Object.values(Object(allValues[i]));
        console.log("inside teh if")
        console.log("Objarrkeys ", allValues[i])
        for (let i = 0; i < objArrKeys.length; ++i) {
          let veryVeryTempObj = {
            dt: objArrKeys[i],
            vl: objArrVal[i]
          }
          tempObjArrOutput.push(veryVeryTempObj)
        }
        let ldbTempArrOutput: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        if (!Array.isArray(this.fastagListData)) {
          this.fastagListData = []; // Initialize fastagListData as an empty array
        }

  // Push elements into fastagListData
        this.fastagListData.push(ldbTempArrOutput);
        tempObjArrOutput = []
      }
      else if (typeof allValues[i] === 'object' && Array.isArray(allValues[i]) && allValues[i] !== null && allValues[i] !== undefined) {
        // let tempObjVal:any = allValues[i]let objArrKeys = Object.keys(allValues[i][0] as Record<string, any>);
        let val_arr = allValues[i] as any[]
        let tempObjArrOutputArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        for (let i = 0; i < val_arr.length; ++i) {
          let objArrKeys = Object.keys(Object(val_arr[i]));
          let objArrVal = Object.values(Object(val_arr[i]));
          console.log("inside teh if")
          console.log("Objarrkeys ", allValues[i])
          for (let i = 0; i < objArrKeys.length; ++i) {
            let veryVeryTempObj = {
              dt: objArrKeys[i],
              vl: objArrVal[i]
            }
            tempObjArrOutput.push(veryVeryTempObj)
          }
          tempObjArrOutputArr.push(tempObjArrOutput)
          tempObjArrOutput = []
        }
        this.fastagListData.push(tempObjArrOutputArr)
        tempObjArrOutputArr = []

      }
      else if (!Array.isArray(allValues[i])) {
        while (i < allKeys.length && typeof allValues[i] !== 'object') {
          let veryVeryTempObj = {
            dt: allKeys[i],
            vl: allValues[i]
          }
          tempArray.push(veryVeryTempObj)
          i++;
        }
        i--;
        let ldbTempArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArr.push(tempArray)

        this.fastagListData.push(ldbTempArr)
        tempArray = []
        ldbTempArr = []
      }
    }
  }
  handleEchallan2(mydata2: any) {
    let outputObjCompleteChallanLet: Array<Array<Array<{
      dt: string,
      vl: any
    }>>> = []

    let allKeys = Object.keys(mydata2)
    this.tableOutputHeader = allKeys
    let allValues = Object.values(mydata2)
    let tempObjArrOutput: Array<{
      dt: string,
      vl: any
    }> = []
    let tempArray: Array<{
      dt: string,
      vl: any
    }> = []
    for (let i = 0; i < allKeys.length; ++i) {
      let tempObj: {
        dt: string,
        vl: any
      } = {
        dt: '',
        vl: ''
      }
      tempObj.dt = allKeys[i]

      if (typeof allValues[i] === 'object' && !Array.isArray(allValues[i])) {
        // let tempObjVal:any = allValues[i]
        let objArrKeys = Object.keys(Object(allValues[i]))
        let objArrVal = Object.values(Object(allValues[i]));
        console.log("inside teh if")
        console.log("Objarrkeys ", allValues[i])
        for (let i = 0; i < objArrKeys.length; ++i) {
          let veryVeryTempObj = {
            dt: objArrKeys[i],
            vl: objArrVal[i]
          }
          tempObjArrOutput.push(veryVeryTempObj)
        }
        let ldbTempArrOutput: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArrOutput.push(tempObjArrOutput)
        outputObjCompleteChallanLet.push(ldbTempArrOutput)
        tempObjArrOutput = []
      }
      else if (typeof allValues[i] === 'object' && Array.isArray(allValues[i]) && allValues[i] !== null && allValues[i] !== undefined) {
        // let tempObjVal:any = allValues[i]let objArrKeys = Object.keys(allValues[i][0] as Record<string, any>);
        let val_arr = allValues[i] as any[]
        let tempObjArrOutputArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        for (let i = 0; i < val_arr.length; ++i) {
          let objArrKeys = Object.keys(Object(val_arr[i]));
          let objArrVal = Object.values(Object(val_arr[i]));
          console.log("inside teh if")
          console.log("Objarrkeys ", allValues[i])
          for (let i = 0; i < objArrKeys.length; ++i) {
            let veryVeryTempObj = {
              dt: objArrKeys[i],
              vl: objArrVal[i]
            }
            tempObjArrOutput.push(veryVeryTempObj)
          }
          tempObjArrOutputArr.push(tempObjArrOutput)
          tempObjArrOutput = []
        }
        outputObjCompleteChallanLet.push(tempObjArrOutputArr)
        tempObjArrOutputArr = []

      }
      else if (!Array.isArray(allValues[i])) {
        while (i < allKeys.length && typeof allValues[i] !== 'object') {
          let veryVeryTempObj = {
            dt: allKeys[i],
            vl: allValues[i]
          }
          tempArray.push(veryVeryTempObj)
          i++;
        }
        i--;
        let ldbTempArr: Array<Array<{
          dt: string,
          vl: any
        }>> = []
        ldbTempArr.push(tempArray)

        outputObjCompleteChallanLet.push(ldbTempArr)
        tempArray = []
        ldbTempArr = []
      }
    }
    return outputObjCompleteChallanLet
  }

}


