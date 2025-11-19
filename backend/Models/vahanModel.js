module.exports = (sequelize, DataTypes) => {
  const VahanDetails = sequelize.define("vahan_details", {
    rc_regn_no: { type: DataTypes.STRING },
    rc_regn_dt: { type: DataTypes.DATEONLY },
    rc_regn_upto: { type: DataTypes.DATEONLY },
    rc_purchase_dt: { type: DataTypes.DATEONLY },
    rc_owner_sr: { type: DataTypes.INTEGER },
    rc_owner_name: { type: DataTypes.STRING },

    state_cd: { type: DataTypes.STRING },
    rto_cd: { type: DataTypes.STRING },

    rc_present_address: { type: DataTypes.STRING },
    rc_permanent_address: { type: DataTypes.STRING },

    rc_vch_catg: { type: DataTypes.STRING },
    rc_vh_class_desc: { type: DataTypes.STRING },
    rc_vhclass_desc: { type: DataTypes.STRING },

    rc_chasi_no: { type: DataTypes.STRING },
    rc_eng_no: { type: DataTypes.STRING },

    rc_maker_desc: { type: DataTypes.STRING },
    rc_maker_model: { type: DataTypes.STRING },

    rc_body_type_desc: { type: DataTypes.STRING },
    rc_fuel_desc: { type: DataTypes.STRING },
    rc_color: { type: DataTypes.STRING },
    rc_norms_desc: { type: DataTypes.STRING },

    rc_fit_upto: { type: DataTypes.DATEONLY },
    rc_np_from: { type: DataTypes.DATEONLY },
    rc_np_upto: { type: DataTypes.DATEONLY },
    rc_np_issued_by: { type: DataTypes.STRING },

    rc_tax_upto: { type: DataTypes.STRING },

    rc_financer: { type: DataTypes.STRING },
    rc_insurance_comp: { type: DataTypes.STRING },
    rc_insurance_policy_no: { type: DataTypes.STRING },
    rc_insurance_upto: { type: DataTypes.DATEONLY },

    rc_manu_month_yr: { type: DataTypes.STRING },
    rc_unld_wt: { type: DataTypes.INTEGER },
    rc_gvw: { type: DataTypes.INTEGER },
    rc_no_cyl: { type: DataTypes.INTEGER },

    rc_cubic_cap: { type: DataTypes.DECIMAL(10,2) },

    rc_seat_cap: { type: DataTypes.INTEGER },
    rc_sleeper_cap: { type: DataTypes.INTEGER },
    rc_stand_cap: { type: DataTypes.INTEGER },

    rc_wheelbase: { type: DataTypes.INTEGER },
    rc_registered_at: { type: DataTypes.STRING },

    rc_status_as_on: { type: DataTypes.DATEONLY },
    rc_pucc_upto: { type: DataTypes.DATEONLY },
    rc_pucc_no: { type: DataTypes.STRING },
    rc_status: { type: DataTypes.STRING },

    rc_blacklist_status: { type: DataTypes.JSON },

    rc_permit_no: { type: DataTypes.STRING },
    rc_permit_issue_dt: { type: DataTypes.DATEONLY },
    rc_permit_valid_from: { type: DataTypes.DATEONLY },
    rc_permit_valid_upto: { type: DataTypes.DATEONLY },

    rc_permit_code: { type: DataTypes.STRING },
    rc_permit_type: { type: DataTypes.STRING },
    rc_permit_catg: { type: DataTypes.STRING },
    rc_permit_issuing_authority: { type: DataTypes.STRING },

    rc_permit_service_type: { type: DataTypes.JSON },
    rc_permit_route_region: { type: DataTypes.JSON },
    rc_noc_details: { type: DataTypes.JSON },

    rc_vh_type: { type: DataTypes.STRING },
    rc_vh_class: { type: DataTypes.STRING },

    rc_noc_dt: { type: DataTypes.JSON },

    rc_fuel_cd: { type: DataTypes.STRING },
    rc_maker_cd: { type: DataTypes.STRING },
    rc_model_cd: { type: DataTypes.STRING },
    rc_norms_cd: { type: DataTypes.STRING },

    rc_sale_amt: { type: DataTypes.DECIMAL(15,2) },

    rc_own_catg_desc: { type: DataTypes.STRING },
    rc_vch_catg_desc: { type: DataTypes.STRING },
    rc_owner_cd_desc: { type: DataTypes.STRING },

    rc_vehicle_surrendered_to_dealer: { type: DataTypes.INTEGER },

    rc_currentadd_districtcode: { type: DataTypes.STRING },
    rc_non_use: { type: DataTypes.STRING },

    rc_passenger_tax: { type: DataTypes.JSON },
    rc_goods_tax: { type: DataTypes.JSON },

    rc_no_of_axle: { type: DataTypes.INTEGER },
    rc_tax_mode: { type: DataTypes.STRING }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  return VahanDetails;
};
