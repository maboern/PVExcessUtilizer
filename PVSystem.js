class PVSystem {
    constructor(name, maker, engine) {
        this.name = name;
        this.SCRIPT_ID = 'javascript.0';
        this.updateIntervalMs = 1000;

        // Sunny TriPower X-15 15kW Inverter
        this.INV15_MAX_POWER_WATTS = 15000;
        this.INV15_NR_PV_PANELS = 35;
        this.INV15_MODBUS_ID = 'modbus.0';
        this.INV15_CONNECTED_OBJ = this.INV15_MODBUS_ID + '.info.connection';
        this.INV15_CUR_POWER_WATTS_OBJ = this.INV15_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW'

        // Sunny TriPower SmartEnergy 10kW Hybrid Inverter
        this.INV10_MAX_POWER_WATTS = 10000;
        this.INV10_NR_PV_PANELS = 25;
        this.INV10_MODBUS_ID = 'modbus.1';
        this.INV10_CONNECTED_OBJ = this.INV10_MODBUS_ID + '.info.connection';
        this.INV10_CUR_POWER_WATTS_OBJ = this.INV10_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW';

        // PV Forecast from api.forecast.solar
        var PV_FORECAST_POWER_NOW_OBJ = 'pvforecast.0.summary.power.now';

        // Static PV System Parameters
        this.PV_PEAK_POWER_WATTS = 16400;
        this.PV_GRID_FEEDIN_MAX_WATTS = 13200;
        this.PV_TOTAL_NR_PV_PANELS = this.INV15_NR_PV_PANELS + this.INV10_NR_PV_PANELS;
        this.PV_PANEL_POWER_WATTS = 440;
        this.PV_MANAGER_CONNECTED = 'sma-em.0.info.connection';
        this.PV_GRID_FEEDIN_ID = 'sma-em.0.3014001810.psurplus';

        this.SCRIPT_FEEDIN_MAX_WATTS_OBJ = this.SCRIPT_ID + ".info.feedin_max_watts";
        createState(this.SCRIPT_FEEDIN_MAX_WATTS_OBJ, 0, {read: true, write: false, name: "gridFeedInMaxWatts", type: "number", unit: "W", def: PV_GRID_FEEDIN_MAX_WATTS});
        this.SCRIPT_PV_CUR_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_cur_watts";
        createState(this.SCRIPT_PV_CUR_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionCurrentPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_POT_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_potential_watts";
        createState(this.SCRIPT_PV_POT_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionPotentialPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_FEEDIN_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_feedin_watts";
        createState(this.SCRIPT_PV_FEEDIN_WATTS_OBJ, 0, {read: true, write: false, name: "pvFeedInPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_FEEDIN_LIMIT_DEVIATION_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_feedin_limit_deviation_watts";
        createState(this.SCRIPT_PV_FEEDIN_LIMIT_DEVIATION_WATTS_OBJ, 0, {read: true, write: false, name: "pvFeedInLimitDeviation", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_SURPLUS_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_surplus_watts";
        createState(this.SCRIPT_PV_SURPLUS_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionSurplusPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_FORECASTED_SURPLUS_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_surplus_forecast_watts";
        createState(this.SCRIPT_PV_FORECASTED_SURPLUS_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionSurplusForecastPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_available_excess_watts";
        createState(this.SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionAvailableExcessPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_self_consumption_watts";
        createState(this.SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ, 0, {read: true, write: false, name: "pvSelfConsumptionPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_CONTROLLED_LOADS_WATTS_OBJ = this.SCRIPT_ID + ".info.controlled_loads_watts";
        createState(this.SCRIPT_CONTROLLED_LOADS_WATTS_OBJ, 0, {read: true, write: false, name: "controlledLoadPower", type: "number", unit: "W", def: 0});

        console.log(`Initialized PV System ${this.name} (${this.PV_PEAK_POWER_WATTS} Wp).`)
    }

    getDetails() {
        return (`The name of the system is ${this.name}.`)
    }

    process() {
        
    }
}
