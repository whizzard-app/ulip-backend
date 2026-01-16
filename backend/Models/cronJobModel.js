module.exports = (sequelize, DataTypes) => {
    const CronJobVahanResponses = sequelize.define(
        "cronJob_vahan_respones",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            rc_regn_no: {
                type: DataTypes.STRING(30),
                allowNull: false
            },
            responseOfUlipApi: {
                type: DataTypes.STRING(300),
                allowNull: true
            },
            reqPlayLoad: {
                type: DataTypes.STRING(45),
                allowNull: true
            },
            TIMESTAMP: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            freezeTableName: true,
            timestamps: false   // 👈 because table already has TIMESTAMP column
        }
    );

    return CronJobVahanResponses;
};
