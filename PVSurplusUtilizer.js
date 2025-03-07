// Debug
var debug = 1; /*debug ausgabe ein oder aus 1/0 */

// Static Script Parameters
var SCRIPT_UPDATE_INTERVAL_SEC = 30;
var SCRIPT_MAX_VALUE_AGE = 60 * 1000;
var SCRIPT_LOAD_HISTERESYS_WATTS = 250;
var scriptRunTimeSecs = 0;
var SCRIPT_ID = 'javascript.0';

// Static PV System Parameters
var PV_PEAK_POWER_WATTS = 16400;
var PV_GRID_FEEDIN_MAX_WATTS = 13200;
var PV_TOTAL_NR_PV_PANELS = INV15_NR_PV_PANELS + INV10_NR_PV_PANELS;
var PV_PANEL_POWER_WATTS = 440;
var PV_MANAGER_CONNECTED = 'sma-em.0.info.connection';
var PV_GRID_FEEDIN_ID = 'sma-em.0.3014001810.psurplus';


var SCRIPT_READY_OBJ = SCRIPT_ID + ".info.ready";
createState(SCRIPT_READY_OBJ, false, {read: true, write: false, name: "ready", type: "boolean", def: false});
var SCRIPT_RUNTIME_SECS_OBJ = SCRIPT_ID + ".info.runTimeSecs";
createState(SCRIPT_RUNTIME_SECS_OBJ, 0, {read: true, write: false, name: ".info.runTimeSecs", type: "number", unit: "s", def: 0});

var SCRIPT_FEEDIN_MAX_WATTS_OBJ = SCRIPT_ID + ".info.feedin_max_watts";
createState(SCRIPT_FEEDIN_MAX_WATTS_OBJ, 0, {read: true, write: false, name: "gridFeedInMaxWatts", type: "number", unit: "W", def: PV_GRID_FEEDIN_MAX_WATTS});
var SCRIPT_PV_CUR_WATTS_OBJ = SCRIPT_ID + ".info.pv_cur_watts";
createState(SCRIPT_PV_CUR_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionCurrentPower", type: "number", unit: "W", def: 0});
var SCRIPT_PV_POT_WATTS_OBJ = SCRIPT_ID + ".info.pv_potential_watts";
createState(SCRIPT_PV_POT_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionPotentialPower", type: "number", unit: "W", def: 0});
var SCRIPT_PV_FEEDIN_WATTS_OBJ = SCRIPT_ID + ".info.pv_feedin_watts";
createState(SCRIPT_PV_FEEDIN_WATTS_OBJ, 0, {read: true, write: false, name: "pvFeedInPower", type: "number", unit: "W", def: 0});
var SCRIPT_PV_FEEDIN_LIMIT_DEVIATION_WATTS_OBJ = SCRIPT_ID + ".info.pv_feedin_limit_deviation_watts";
createState(SCRIPT_PV_FEEDIN_LIMIT_DEVIATION_WATTS_OBJ, 0, {read: true, write: false, name: "pvFeedInLimitDeviation", type: "number", unit: "W", def: 0});
var SCRIPT_PV_SURPLUS_WATTS_OBJ = SCRIPT_ID + ".info.pv_surplus_watts";
createState(SCRIPT_PV_SURPLUS_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionSurplusPower", type: "number", unit: "W", def: 0});
var SCRIPT_PV_FORECASTED_SURPLUS_WATTS_OBJ = SCRIPT_ID + ".info.pv_surplus_forecast_watts";
createState(SCRIPT_PV_FORECASTED_SURPLUS_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionSurplusForecastPower", type: "number", unit: "W", def: 0});
var SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ = SCRIPT_ID + ".info.pv_available_excess_watts";
createState(SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ, 0, {read: true, write: false, name: "pvProductionAvailableExcessPower", type: "number", unit: "W", def: 0});
var SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ = SCRIPT_ID + ".info.pv_self_consumption_watts";
createState(SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ, 0, {read: true, write: false, name: "pvSelfConsumptionPower", type: "number", unit: "W", def: 0});
var SCRIPT_CONTROLLED_LOADS_WATTS_OBJ = SCRIPT_ID + ".info.controlled_loads_watts";
createState(SCRIPT_CONTROLLED_LOADS_WATTS_OBJ, 0, {read: true, write: false, name: "controlledLoadPower", type: "number", unit: "W", def: 0});


var SCRIPT_LOAD_CELLAR_HEATER_RUNTIME_OBJ = SCRIPT_ID + ".info.load.cellarHeater.runtimeSecs";
createState(SCRIPT_LOAD_CELLAR_HEATER_RUNTIME_OBJ, 0, {read: true, write: false, name: "loadCellarHeaterRuntimeSecs", type: "number", unit: "s", def: 0});
var SCRIPT_LOAD_CELLAR_HEATER_SWITCH_COUNT_OBJ = SCRIPT_ID + ".info.load.cellarHeater.switchCount";
createState(SCRIPT_LOAD_CELLAR_HEATER_SWITCH_COUNT_OBJ, 0, {read: true, write: false, name: "loadCellarHeaterSwitchCount", type: "number", def: 0});
var SCRIPT_LOAD_CELLAR_HEATER_TOTAL_ENERGY_OBJ = SCRIPT_ID + ".info.load.cellarHeater.totalEnergy";
createState(SCRIPT_LOAD_CELLAR_HEATER_TOTAL_ENERGY_OBJ, 0, {read: true, write: false, name: "loadCellarHeaterTotalEnergy", type: "number", unit: "Ws", def: 0});
var SCRIPT_LOAD_CELLAR_HEATER_DAY_ENERGY_OBJ = SCRIPT_ID + ".info.load.cellarHeater.todayEnergy";
createState(SCRIPT_LOAD_CELLAR_HEATER_DAY_ENERGY_OBJ, 0, {read: true, write: false, name: "loadCellarHeaterTodayEnergy", type: "number", unit: "Ws", def: 0});

var SCRIPT_LOAD_BOILER_RUNTIME_OBJ = SCRIPT_ID + ".info.load.boiler.runtimeSecs";
createState(SCRIPT_LOAD_BOILER_RUNTIME_OBJ, 0, {read: true, write: false, name: "loadBoilerRuntimeSecs", type: "number", unit: "s", def: 0});
var SCRIPT_LOAD_BOILER_SWITCH_COUNT_OBJ = SCRIPT_ID + ".info.load.boiler.switchCount";
createState(SCRIPT_LOAD_BOILER_SWITCH_COUNT_OBJ, 0, {read: true, write: false, name: "loadBoilerSwitchCount", type: "number", def: 0});
var SCRIPT_LOAD_BOILER_TOTAL_ENERGY_OBJ = SCRIPT_ID + ".info.load.boiler.totalEnergy";
createState(SCRIPT_LOAD_BOILER_TOTAL_ENERGY_OBJ, 0, {read: true, write: false, name: "loadBoilerTotalEnergy", type: "number", unit: "Ws", def: 0});
var SCRIPT_LOAD_BOILER_DAY_ENERGY_OBJ = SCRIPT_ID + ".info.load.boiler.todayEnergy";
createState(SCRIPT_LOAD_BOILER_DAY_ENERGY_OBJ, 0, {read: true, write: false, name: "loadBoilerTodayEnergy", type: "number", unit: "Ws", def: 0});

// Sunny TriPower X-15 15kW Inverter
var INV15_MAX_POWER_WATTS = 15000;
var INV15_NR_PV_PANELS = 35;
var INV15_MODBUS_ID = 'modbus.0';
var INV15_CONNECTED_OBJ = INV15_MODBUS_ID + '.info.connection';
var INV15_CUR_POWER_WATTS_OBJ = INV15_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW'

// Sunny TriPower SmartEnergy 10kW Hybrid Inverter
var INV10_MAX_POWER_WATTS = 10000;
var INV10_NR_PV_PANELS = 25;
var INV10_MODBUS_ID = 'modbus.1';
var INV10_CONNECTED_OBJ = INV10_MODBUS_ID + '.info.connection';
var INV10_CUR_POWER_WATTS_OBJ = INV10_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW';

// PV Forecast from api.forecast.solar
var PV_FORECAST_POWER_NOW_OBJ = 'pvforecast.0.summary.power.now';

// Shelly SmartPlug as with Space Heater
var LOAD_SHELLY_CELLAR_HEATER_EXPECTED_POWER_WATTS = 2000;
var LOAD_SHELLY_CELLAR_HEATER_CONNECTED = 'shelly.0.info.connection';
var LOAD_SHELLY_CELLAR_HEATER_SWITCH = 'shelly.0.shellyplusplugs#fcb4670921c4#1.Relay0.Switch';
var LOAD_SHELLY_CELLAR_HEATER_POWER_OBJ = 'shelly.0.shellyplusplugs#fcb4670921c4#1.Relay0.Power'
var load_shelly_cellar_heater_runtime_secs = 0;
var load_shelly_cellar_heater_day_energy = 0;

// MOXA IoLogic E1214 with 4kW Heating Flange in warm water boiler
var LOAD_BOILER_EXPECTED_POWER_WATTS = 4000;
var LOAD_BOILER_CONNECTED = 'modbus.2.info.connection';
var LOAD_BOILER_SWITCH = 'modbus.2.coils.0_DO-00';
var load_boiler_runtime_secs = 0;
var load_boiler_day_energy = 0;

let pv_system = new PVSystem('Turnerweg');
console.log(pv_system.getDetails());

function getRecentStateVal(obj) {
    var state = getState(obj);
    if(state.ts >= (Date.now() - SCRIPT_MAX_VALUE_AGE)) {
        return state.val;
    } else {
        return null;
    }
}

function updateRunTime() {
    scriptRunTimeSecs = scriptRunTimeSecs + SCRIPT_UPDATE_INTERVAL_SEC;
    setState(SCRIPT_RUNTIME_SECS_OBJ, scriptRunTimeSecs, true);
}

function checkReady() {
    if(getState(INV10_CONNECTED_OBJ).val 
    && getState(INV15_CONNECTED_OBJ).val
    && getState(PV_MANAGER_CONNECTED).val) {
        setState(SCRIPT_READY_OBJ, true, true);
        updateRunTime();
        return true;
    } else {
        setState(SCRIPT_READY_OBJ,false, true);
        scriptRunTimeSecs = 0;
        return false;
    }
}

function updatePVProduction() {
    var inv10_power = getState(INV10_CUR_POWER_WATTS_OBJ).val;
    var inv15_power = getState(INV15_CUR_POWER_WATTS_OBJ).val;

    var feedin_power = getState(PV_GRID_FEEDIN_ID).val;
    setState(SCRIPT_PV_FEEDIN_WATTS_OBJ, feedin_power, true);
    var pv_feedin_limit_deviation = feedin_power - PV_GRID_FEEDIN_MAX_WATTS;
    setState(SCRIPT_PV_FEEDIN_LIMIT_DEVIATION_WATTS_OBJ, pv_feedin_limit_deviation, true);

    var pv_power = inv10_power + inv15_power;
    setState(SCRIPT_PV_CUR_WATTS_OBJ, pv_power, true);

    /* The 15kW Inverter should produce more than the 10kW inverter proportional to the number
       of PV Panels on the string. */
    var inv15_potential_pv_production = inv10_power * INV15_NR_PV_PANELS / INV10_NR_PV_PANELS;
    var potential_pv_production = inv10_power + inv15_potential_pv_production;
    setState(SCRIPT_PV_POT_WATTS_OBJ, potential_pv_production, true);

    var self_consumption = pv_power - feedin_power;
    setState(SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ, self_consumption, true);

    var pv_surplus = 0;
    if(potential_pv_production > pv_power && potential_pv_production > PV_GRID_FEEDIN_MAX_WATTS) {
        pv_surplus = potential_pv_production - pv_power;
    } 
    setState(SCRIPT_PV_SURPLUS_WATTS_OBJ, pv_surplus, true);

    var pv_forecast = getState(PV_FORECAST_POWER_NOW_OBJ).val;
    var pv_forecasted_surplus = 0;
    var unused_excess_power = 0;
    if(pv_forecast > pv_power && pv_power >= PV_GRID_FEEDIN_MAX_WATTS) {
        pv_forecasted_surplus = pv_forecast - pv_power;
        unused_excess_power = pv_forecasted_surplus + pv_feedin_limit_deviation;
    } 
    setState(SCRIPT_PV_FORECASTED_SURPLUS_WATTS_OBJ, pv_forecasted_surplus, true);
    var available_excess_power = unused_excess_power > 0 ? unused_excess_power : 0;
    setState(SCRIPT_PV_AVAILABLE_EXCESS_WATTS_OBJ, available_excess_power, true);

    // TODO: Calculate real available excess power including controlled load power (Object oriented)
    return unused_excess_power;
}

function updateCellarHeaterRunTime(water_heater_on) {
    if(water_heater_on) {
        load_shelly_cellar_heater_runtime_secs += SCRIPT_UPDATE_INTERVAL_SEC;
        setState(SCRIPT_LOAD_CELLAR_HEATER_RUNTIME_OBJ, load_shelly_cellar_heater_runtime_secs, true);

        var load_shelly_power = getState(LOAD_SHELLY_CELLAR_HEATER_POWER_OBJ).val;
        var load_shelly_energy = load_shelly_power * SCRIPT_UPDATE_INTERVAL_SEC;

        load_shelly_cellar_heater_day_energy += load_shelly_energy;
        setState(SCRIPT_LOAD_CELLAR_HEATER_DAY_ENERGY_OBJ, load_shelly_cellar_heater_day_energy, true);

        var totalEnergy = getState(SCRIPT_LOAD_CELLAR_HEATER_TOTAL_ENERGY_OBJ).val;
        totalEnergy += load_shelly_energy;
        setState(SCRIPT_LOAD_CELLAR_HEATER_TOTAL_ENERGY_OBJ, totalEnergy, true);
    }
}

function updateBoilerRunTime(boiler_on) {
    if(boiler_on) {
        load_boiler_runtime_secs += SCRIPT_UPDATE_INTERVAL_SEC;
        setState(SCRIPT_LOAD_BOILER_RUNTIME_OBJ, load_boiler_runtime_secs, true);

        var load_boiler_energy = LOAD_BOILER_EXPECTED_POWER_WATTS * SCRIPT_UPDATE_INTERVAL_SEC;

        load_boiler_day_energy += load_boiler_energy;
        setState(SCRIPT_LOAD_BOILER_DAY_ENERGY_OBJ, load_boiler_day_energy, true);

        var totalEnergy = getState(SCRIPT_LOAD_BOILER_TOTAL_ENERGY_OBJ).val;
        totalEnergy += load_boiler_day_energy;
        setState(SCRIPT_LOAD_BOILER_TOTAL_ENERGY_OBJ, totalEnergy, true);
    }
}

function resetDayValuesIfNecessary() {
    // Reset the daily values before the sun rises.
    const d = new Date();
    let hour = d.getHours();
    if (hour < 5) {
        load_shelly_cellar_heater_day_energy = 0;
        setState(SCRIPT_LOAD_CELLAR_HEATER_DAY_ENERGY_OBJ, load_shelly_cellar_heater_day_energy, true);
        load_shelly_cellar_heater_runtime_secs = 0;
        setState(SCRIPT_LOAD_CELLAR_HEATER_RUNTIME_OBJ, load_shelly_cellar_heater_runtime_secs, true);

        load_boiler_day_energy = 0;
        setState(SCRIPT_LOAD_BOILER_DAY_ENERGY_OBJ, load_boiler_day_energy, true);
        load_boiler_runtime_secs = 0;
        setState(SCRIPT_LOAD_BOILER_RUNTIME_OBJ, load_boiler_runtime_secs, true);

    }
}

function startBoiler(available_power)
{
    console.log("Turning ON Load Boiler! (Surplus: " + available_power + "W)");
    setState(LOAD_BOILER_SWITCH, true);

    var switchCount = getState(SCRIPT_LOAD_BOILER_SWITCH_COUNT_OBJ).val;
    switchCount = switchCount + 1;
    setState(SCRIPT_LOAD_BOILER_SWITCH_COUNT_OBJ, switchCount, true);
}

function stopBoiler(available_power)
{
    console.log("Turning OFF Load Boiler! (Surplus: " + available_power + "W)");
    setState(LOAD_BOILER_SWITCH, false);
}

function startCellarHeater(available_power)
{
    console.log("Turning ON Load Cellar Heater! (Surplus: " + available_power + "W)");
    setState(LOAD_SHELLY_CELLAR_HEATER_SWITCH, true);

    var switchCount = getState(SCRIPT_LOAD_CELLAR_HEATER_SWITCH_COUNT_OBJ).val;
    switchCount = switchCount + 1;
    setState(SCRIPT_LOAD_CELLAR_HEATER_SWITCH_COUNT_OBJ, switchCount, true);
}

function stopCellarHeater(available_power)
{
    console.log("Turning OFF Load Cellar Heater! (Surplus: " + available_power + "W)");
    setState(LOAD_SHELLY_CELLAR_HEATER_SWITCH, false);
}

function controlLoads(available_excess_power) {
    var cellar_heater_connected = getState(LOAD_SHELLY_CELLAR_HEATER_CONNECTED).val;
    var cellar_heater_on = false; 
    var load_cellar_heater_power = 0;
    if(cellar_heater_connected) {
        cellar_heater_on = getState(LOAD_SHELLY_CELLAR_HEATER_SWITCH).val;
        if(cellar_heater_on) {
            load_cellar_heater_power = getState(LOAD_SHELLY_CELLAR_HEATER_POWER_OBJ).val;
        }
    }

    var boiler_connected = getState(LOAD_BOILER_CONNECTED).val;
    var boiler_on = false; 
    var load_boiler_power = 0;
    if(boiler_connected) {
        boiler_on = getState(LOAD_BOILER_SWITCH).val;
        var self_consumption = getState(SCRIPT_PV_SELF_CONSUMPTION_WATTS_OBJ).val;

        if(boiler_on) {
            var non_load_consumption = self_consumption - load_cellar_heater_power - LOAD_BOILER_EXPECTED_POWER_WATTS;
            if(non_load_consumption > 0) {
                load_boiler_power = LOAD_BOILER_EXPECTED_POWER_WATTS;
            } else {
                stopBoiler(available_excess_power - load_cellar_heater_power);
                load_boiler_power = 0;
                boiler_on = false;
            }
        }
    }
    
    var cur_total_load_power = 0;
    var available_power = available_excess_power;
    available_power += (cellar_heater_on ? load_cellar_heater_power : 0);
    available_power += (boiler_on ? load_boiler_power : 0);
    
    if(boiler_connected) {
        if(available_power >= LOAD_BOILER_EXPECTED_POWER_WATTS) {
            if(!boiler_on && available_power > LOAD_BOILER_EXPECTED_POWER_WATTS + SCRIPT_LOAD_HISTERESYS_WATTS) {
                startBoiler(available_power);
                load_boiler_power = LOAD_BOILER_EXPECTED_POWER_WATTS;
            }
        } else if(boiler_on && available_power < LOAD_BOILER_EXPECTED_POWER_WATTS - SCRIPT_LOAD_HISTERESYS_WATTS) {
            stopBoiler(available_power);
        }
        cur_total_load_power += load_boiler_power;
        available_power -= load_boiler_power;
    } 

    if(cellar_heater_connected ) {
        if(available_power >= LOAD_SHELLY_CELLAR_HEATER_EXPECTED_POWER_WATTS) {
            if(!cellar_heater_on && available_power > LOAD_SHELLY_CELLAR_HEATER_EXPECTED_POWER_WATTS + SCRIPT_LOAD_HISTERESYS_WATTS) {
                startCellarHeater(available_power);
                load_cellar_heater_power = LOAD_SHELLY_CELLAR_HEATER_EXPECTED_POWER_WATTS;
            } 
        } else if(cellar_heater_on && available_power < LOAD_SHELLY_CELLAR_HEATER_EXPECTED_POWER_WATTS - SCRIPT_LOAD_HISTERESYS_WATTS) {
                stopCellarHeater(available_power);
        } 
        cur_total_load_power += load_cellar_heater_power;
        available_power -= load_cellar_heater_power;
    } 
    setState(SCRIPT_CONTROLLED_LOADS_WATTS_OBJ, cur_total_load_power, true);
    updateCellarHeaterRunTime(cellar_heater_on);
    updateBoilerRunTime(boiler_on);
    resetDayValuesIfNecessary();
}

function processing() {
    if(!checkReady()) { return; }

    var available_excess_power = updatePVProduction();
    controlLoads(available_excess_power);
}

var Interval = setInterval(function () {
  processing(); /*start processing in interval*/
}, (SCRIPT_UPDATE_INTERVAL_SEC*1000));

