class PVSystem {
    constructor(name) {
        this.name = name;
        this.SCRIPT_ID = 'javascript.0';
        this.updateIntervalMs = 1000;

        // Sunny TriPower X-15 15kW Inverter
        this.INV15_MAX_POWER_WATTS = 15000;
        this.INV15_NR_PV_PANELS = 35;
        this.INV15_MODBUS_ID = 'modbus.0';
        this.INV15_CONNECTED_OBJ = this.INV15_MODBUS_ID + '.info.connection';
        this.INV15_CUR_POWER_WATTS_OBJ = this.INV15_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW'
        this.inv15_power = 0;

        // Sunny TriPower SmartEnergy 10kW Hybrid Inverter
        this.INV10_MAX_POWER_WATTS = 10000;
        this.INV10_NR_PV_PANELS = 25;
        this.INV10_MODBUS_ID = 'modbus.1';
        this.INV10_CONNECTED_OBJ = this.INV10_MODBUS_ID + '.info.connection';
        this.INV10_CUR_POWER_WATTS_OBJ = this.INV10_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW';
        this.inv10_power = 0;

        // PV Forecast from api.forecast.solar
        this.PV_FORECAST_POWER_NOW_OBJ = 'pvforecast.1.summary.power.now';

        // Static PV System Parameters
        this.PV_PEAK_POWER_WATTS = 16400;
        this.PV_GRID_FEEDIN_MAX_WATTS = 13200;
        this.PV_TOTAL_NR_PV_PANELS = this.INV15_NR_PV_PANELS + this.INV10_NR_PV_PANELS;
        this.PV_PANEL_POWER_WATTS = 440;
        this.PV_MANAGER_CONNECTED = 'sma-em.0.info.connection';
        this.PV_GRID_FEEDIN_OBJ = 'sma-em.0.3014001810.psurplus';

        // Configuration
        this.PV_GRID_FEEDIN_TOLERANCE = 250;
        this.PV_MAX_DYNAMICS = 0.05;

        this.pv_power = 0;
        this.pv_power_max = 0;
        this.pv_power_min = 0;
        this.pv_power_estimate = 0;
        this.feedin_power = 0;
        this.feedin_power_max = 0;
        this.feedin_power_min = 0;
        this.pv_feedin_limit_deviation = 0;
        this.self_consumption = 0;
        this.pv_excess_power = 0;
        this.pv_shading = 0;

        this.SCRIPT_FEEDIN_MAX_WATTS_OBJ = this.SCRIPT_ID + ".info.feedin_max_watts";
        createState(this.SCRIPT_FEEDIN_MAX_WATTS_OBJ, 0, {read: true, write: false, name: "gridFeedInMaxWatts", type: "number", unit: "W", def: this.PV_GRID_FEEDIN_MAX_WATTS});
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
        this.SCRIPT_PV_FORECAST_DEVIATION_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_forecast_deviation_watts";
        createState(this.SCRIPT_PV_FORECAST_DEVIATION_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionForecastDeviation", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_available_excess_watts";
        createState(this.SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionAvailableExcessPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_self_consumption_watts";
        createState(this.SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ, 0, {read: true, write: false, name: "pvSelfConsumptionPower", type: "number", unit: "W", def: 0});
        this.SCRIPT_PV_ESTIMATE_WATTS_OBJ = this.SCRIPT_ID + ".info.pv_generation_estimate_watts";
        createState(this.SCRIPT_PV_ESTIMATE_WATTS_OBJ, 0, {read: true, write: false, name: "pvGenerationEstimatePower", type: "number", unit: "W", def: 0});

        console.log(`Initialized PV System ${this.name} (${this.PV_PEAK_POWER_WATTS} Wp).`)
    }

    getDetails() {
        return (`The name of the system is ${this.name}.`)
    }
    getUpdateIntervalMs() {
        return this.updateIntervalMs;
    }
    
    getSelfConsumption() {
        return this.self_consumption;
    }

    checkReady() {
        if(getState(this.INV10_CONNECTED_OBJ).val 
        && getState(this.INV15_CONNECTED_OBJ).val
        && getState(this.PV_MANAGER_CONNECTED).val) {
            return true;
        } else {
            return false;
        }
    }

    updateShading() {
        /* The 15kW Inverter should produce more than the 10kW inverter proportional to the number
        of PV Panels on the string. */
        var inv15_potential_pv_production = this.inv10_power * this.INV15_NR_PV_PANELS / this.INV10_NR_PV_PANELS;
        var potential_pv_production = this.inv10_power + inv15_potential_pv_production;
        setState(this.SCRIPT_PV_POT_WATTS_OBJ, potential_pv_production, true);

        if(potential_pv_production > this.pv_power && potential_pv_production > this.PV_GRID_FEEDIN_MAX_WATTS) {
            this.pv_shading = potential_pv_production - this.pv_power;
        } else {
            this.pv_shading = 0;
        }
        setState(this.SCRIPT_PV_SURPLUS_WATTS_OBJ, this.pv_shading, true);
    }

    restartMeasurementPeriod() {
        this.pv_power_max = this.pv_power;
        this.pv_power_min = this.pv_power;

        this.feedin_power_max = this.feedin_power;
        this.feedin_power_min = this.feedin_power;
    }

    fadeGenerationMax() {
        if(this.pv_power_max > this.pv_power_estimate || this.pv_power_max > this.pv_power_fading_max) {
            this.pv_power_fading_max = this.pv_power_max;
        } else {
            var old_fading_max = this.pv_power_fading_max
            this.pv_power_fading_max = old_fading_max + (this.pv_power_max - old_fading_max)*this.PV_MAX_DYNAMICS;
        }
        return this.pv_power_fading_max;
    }

    isCurtailed() {
        if(this.feedin_power_max > this.PV_GRID_FEEDIN_MAX_WATTS - this.PV_GRID_FEEDIN_TOLERANCE) {
            return true;
        } 
        return false;
    }

    estimatePotentialPower() {
        this.updateShading();
        this.fadeGenerationMax();

        var pv_forecast = getState(this.PV_FORECAST_POWER_NOW_OBJ).val;
        pv_forecast -= this.pv_shading;

        var estimate = pv_forecast;
        if(this.isCurtailed()) {
            // We are being curtailed
            if(this.pv_power_max > pv_forecast) {
                // We have observed higher PV power in this period - so we know we can at least produce that
                // TODO: Consider lower potential than forecast
                estimate = this.pv_power_max;
            }
            if(this.pv_power_fading_max > estimate) {
                // We have observed higher PV power earlier, but faded by time since then. 
                // We trust it more than the current forecast or max if it is higher.
                estimate = this.pv_power_fading_max;
            }
        } else {
            // Generation not curtailed because feed-in limit not reached
            estimate = this.pv_power;
        }

        this.pv_power_estimate = estimate;
        setState(this.SCRIPT_PV_ESTIMATE_WATTS_OBJ, this.pv_power_estimate, true);
        var pv_forecast_deviation = pv_forecast - estimate;
        setState(this.SCRIPT_PV_FORECAST_DEVIATION_WATTS_OBJ, pv_forecast_deviation, true);
        return estimate;
    }

    updateEstimation() {
        setState(this.SCRIPT_PV_FEEDIN_WATTS_OBJ, this.feedin_power, true);
        setState(this.SCRIPT_PV_CUR_WATTS_OBJ, this.pv_power, true);
        setState(this.SCRIPT_PV_FEEDIN_LIMIT_DEVIATION_WATTS_OBJ, this.pv_feedin_limit_deviation, true);
        setState(this.SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ, this.self_consumption, true);

        var potential_pv_power = this.estimatePotentialPower();

        // The estimate guarantees that the potential is always higher than the actual
        // and therefore the unused potential is always >= 0
        var unused_potential_power = potential_pv_power - this.pv_power;

        // Correct the unused potential power by the feed-in above or below the limit.
        // If above, the PV system will regulate down the inverter and the deviation become available as 
        // additional potential.
        // If below, we are either not curtailed (negative excess power) or the PV system will regulate up,
        // subtracting from the currently measured potential excess.
        this.pv_excess_power = unused_potential_power + this.pv_feedin_limit_deviation;

        // For the sake of graphing, we floor the excess power at 0
        var pv_available_excess_power = this.pv_excess_power > 0 ? this.pv_excess_power : 0;
        setState(this.SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ, pv_available_excess_power, true);

       // TODO: Calculate real available excess power including controlled load power (Object oriented)

        // At the end of the update we reset the min/max values for the next period
        this.restartMeasurementPeriod();
    }
    
    max(value, prev_max) {
        if(value > prev_max) {
            return value;
        }
        return prev_max;
    }

    min(value, prev_min) {
        if(value < prev_min || prev_min == 0) {
            return value;
        }
        return prev_min;
    }

    processMeasurements() {
        this.inv10_power = getState(this.INV10_CUR_POWER_WATTS_OBJ).val;
        this.inv15_power = getState(this.INV15_CUR_POWER_WATTS_OBJ).val;

        this.feedin_power = getState(this.PV_GRID_FEEDIN_OBJ).val;
        this.feedin_power_max = this.max(this.feedin_power, this.feedin_power_max);
        this.feedin_power_min = this.min(this.feedin_power, this.feedin_power_min);
        this.pv_feedin_limit_deviation = this.feedin_power - this.PV_GRID_FEEDIN_MAX_WATTS;
        
        this.pv_power = this.inv10_power + this.inv15_power;
        this.pv_power_max = this.max(this.pv_power, this.pv_power_max);
        this.pv_power_min = this.min(this.pv_power, this.pv_power_min);

        this.self_consumption = this.pv_power - this.feedin_power;
    }
}
