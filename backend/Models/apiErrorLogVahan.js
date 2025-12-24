module.exports = (sequelize, DataTypes) => {
  const ApiErrorLogsVahan = sequelize.define("api_error_logs_vahan", {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },

    vehicle_number: {                 // keeping same name as table
      type: DataTypes.STRING(100)
    },

    error_type: {
      type: DataTypes.STRING(50)
    },

    error_message: {
      type: DataTypes.TEXT
    },

    request_payload: {
      type: DataTypes.JSON
    },

    response_payload: {
      type: DataTypes.TEXT('medium') // MEDIUMTEXT
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }

  }, {
    timestamps: false,       // because created_at is manually handled
    freezeTableName: true    // table name = api_error_logs_vahan
  });

  return ApiErrorLogsVahan;
};
