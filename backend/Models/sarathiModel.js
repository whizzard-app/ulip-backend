// models/sarathi_details.js

module.exports = (sequelize, DataTypes) => {

  function cleanText(value) {
    if (!value) return "";
    return value.trim().replace(/\s+/g, " ");
  }

  const SarathiDetails = sequelize.define(
    "sarathi_details",
    {
      dlLicno: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("dlLicno", cleanText(value));
        }
      },

      dlOldLicno: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("dlOldLicno", cleanText(value));
        }
      },

      dlApplno: DataTypes.BIGINT,
      dlTokenId: DataTypes.INTEGER,
      dlUsid: DataTypes.INTEGER,
      dlSeqno: DataTypes.STRING,

      dlIssueauth: DataTypes.STRING,
      dlAuthNo: DataTypes.STRING,
      dlAuthDt: DataTypes.DATEONLY,
      dlIssueDate: DataTypes.DATEONLY,
      dlIssuedt: DataTypes.DATEONLY,
      dlPrintDate: DataTypes.DATEONLY,
      dlPrintStatus: DataTypes.STRING,

      dlNtValdfrDt: DataTypes.DATEONLY,
      dlNtValdtoDt: DataTypes.DATEONLY,
      dlNtValdtoDate: DataTypes.DATEONLY,

      dlTrValdfrDt: DataTypes.DATEONLY,
      dlTrValdtoDt: DataTypes.DATEONLY,
      dlTrValdtoDate: DataTypes.DATEONLY,

      dlHzValdfrDt: DataTypes.DATEONLY,
      dlHzValdtoDt: DataTypes.DATEONLY,
      dlHzValdtoDate: DataTypes.DATEONLY,

      dlHlValdfrDt: DataTypes.DATEONLY,
      dlHlValdtoDt: DataTypes.DATEONLY,

      dlEndorseno: DataTypes.STRING,
      dlEndorsedt: DataTypes.DATEONLY,
      dlEndorsetime: DataTypes.STRING, // HH:MM:SS
      dlEndorseAuth: DataTypes.STRING,

      dlLatestTrcode: DataTypes.INTEGER,
      dlInvcrgNo: DataTypes.STRING,
      dlIncChallanNo: DataTypes.STRING,
      dlIncSourceType: DataTypes.STRING,
      dlIncRtoAction: DataTypes.STRING,
      dlRemarks: DataTypes.TEXT,
      dlDispatchStatus: DataTypes.STRING,

      dlStatus: DataTypes.STRING,
      dlAuthCov: DataTypes.STRING,
      dlAuthIssauth: DataTypes.STRING,
      dlIssuedesig: DataTypes.STRING,

      omRtoFullname: DataTypes.STRING,
      omRtoShortname: DataTypes.STRING,
      omOfficeTownname: DataTypes.STRING,
      olaName: DataTypes.STRING,

      olacode: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("olacode", cleanText(value));
        }
      },

      dlRtoCode: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("dlRtoCode", cleanText(value));
        }
      },

      bioid: DataTypes.STRING,
      dlDigest: DataTypes.TEXT,

      stateName: DataTypes.STRING,

      statecd: {
        type: DataTypes.STRING,
        set(value) {
          this.setDataValue("statecd", cleanText(value));
        }
      },

      dlRecGenesis: DataTypes.STRING,

      enforceFromDate: DataTypes.DATEONLY,
      enforceEndDate: DataTypes.DATEONLY,
      enforceRemark: DataTypes.TEXT,

      raw_json: DataTypes.JSON
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      freezeTableName: true
    }
  );

  return SarathiDetails;
};
