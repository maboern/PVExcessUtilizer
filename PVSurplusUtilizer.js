// Debug
var debug = 1; /*debug ausgabe ein oder aus 1/0 */

// Static Script Parameters
var SCRIPT_UPDATE_INTERVAL_SEC = 30;
var scriptRunTimeSecs = 0;
var SCRIPT_ID = 'javascript.0';
var SCRIPT_READY = SCRIPT_ID + ".info.ready";
createState(SCRIPT_READY, false, {read: true, write: false, name: "ready", type: "boolean", def: false});

var SCRIPT_RUNTIME_SECS = SCRIPT_ID + ".info.runTimeSecs";
createState(SCRIPT_RUNTIME_SECS, 0, {read: true, write: false, name: ".info.runTimeSecs", type: "number", unit: "s", def: 0});

var SCRIPT_FEEDIN_MAX_WATTS = SCRIPT_ID + ".info.feedin_max_watts";
createState(SCRIPT_FEEDIN_MAX_WATTS, 0, {read: true, write: false, name: "gridFeedInMaxWatts", type: "number", unit: "W", def: 0});

var SCRIPT_PV_CUR_WATTS = SCRIPT_ID + ".info.pv_cur_watts";
createState(SCRIPT_PV_CUR_WATTS, 0, {read: true, write: false, name: "pvProductionCurrentPower", type: "number", unit: "W", def: 0});

var SCRIPT_PV_POT_WATTS = SCRIPT_ID + ".info.pv_potential_watts";
createState(SCRIPT_PV_POT_WATTS, 0, {read: true, write: false, name: "pvProductionPotentialPower", type: "number", unit: "W", def: 0});

var SCRIPT_PV_FEEDIN_WATTS = SCRIPT_ID + ".info.pv_feedin_watts";
createState(SCRIPT_PV_FEEDIN_WATTS, 0, {read: true, write: false, name: "pvFeedInPower", type: "number", unit: "W", def: 0});

var SCRIPT_PV_SURPLUS_WATTS = SCRIPT_ID + ".info.pv_surplus_watts";
createState(SCRIPT_PV_SURPLUS_WATTS, 0, {read: true, write: false, name: "pvProductionSurplusPower", type: "number", unit: "W", def: 0});

var SCRIPT_PV_SELF_CONSUMPTION_WATTS = SCRIPT_ID + ".info.pv_self_consumption_watts";
createState(SCRIPT_PV_SELF_CONSUMPTION_WATTS, 0, {read: true, write: false, name: "pvSelfConsumptionPower", type: "number", unit: "W", def: 0});

var SCRIPT_LOAD_SHELLY_RUNTIME = SCRIPT_ID + ".info.load.shelly.runtimeSecs";
createState(SCRIPT_LOAD_SHELLY_RUNTIME, 0, {read: true, write: false, name: "loadShellyRuntimeSecs", type: "number", unit: "s", def: 0});

// Sunny TriPower X-15 15kW Inverter
var INV15_MAX_POWER_WATTS = 15000;
var INV15_NR_PV_PANELS = 35;
var INV15_MODBUS_ID = 'modbus.0';
var INV15_CONNECTED = INV15_MODBUS_ID + '.info.connection';
var INV15_CUR_POWER_WATTS = INV15_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW'

// Sunny TriPower SmartEnergy 10kW Hybrid Inverter
var INV10_MAX_POWER_WATTS = 10000;
var INV10_NR_PV_PANELS = 25;
var INV10_MODBUS_ID = 'modbus.1';
var INV10_CONNECTED = INV10_MODBUS_ID + '.info.connection';
var INV10_CUR_POWER_WATTS = INV10_MODBUS_ID + '.inputRegisters.60776_Measurement_GridMs_TotW';

// Shelly SmartPlug as Load (with Space Heater)
var LOAD_SHELLY_EXPECTED_POWER_WATTS = 2000;
var LOAD_SHELLY_CONNECTED = 'shelly.0.info.connection';
var LOAD_SHELLY_SWITCH = 'shelly.0.shellyplusplugs#fcb4670921c4#1.Relay0.Switch';
var load_shelly_runtime_secs = 0;

// Static PV System Parameters
var PV_PEAK_POWER_WATTS = 16400;
var GRID_FEEDIN_MAX_WATTS = 13200;
var PV_TOTAL_NR_PV_PANELS = INV15_NR_PV_PANELS + INV10_NR_PV_PANELS;
var PV_PANEL_POWER_WATTS = 440;
var PV_MANAGER_CONNECTED = 'sma-em.0.info.connection';
var PV_GRID_FEEDIN_ID = 'sma-em.0.3014001810.psurplus';

function updateRunTime() {
    scriptRunTimeSecs = scriptRunTimeSecs + SCRIPT_UPDATE_INTERVAL_SEC;
    setState(SCRIPT_RUNTIME_SECS, scriptRunTimeSecs, true);
}

function checkReady() {
    if(getState(INV10_CONNECTED).val 
    && getState(INV15_CONNECTED).val 
    && getState(LOAD_SHELLY_CONNECTED).val
    && getState(PV_MANAGER_CONNECTED).val) {
        setState(SCRIPT_READY, true, true);
        updateRunTime();
        return true;
    } else {
        setState(SCRIPT_READY,false);
        scriptRunTimeSecs = 0;
        return false;
    }
}

function updatePVProduction() {
    var inv10_power = getState(INV10_CUR_POWER_WATTS).val;
    var inv15_power = getState(INV15_CUR_POWER_WATTS).val;
    var feedin_power = getState(PV_GRID_FEEDIN_ID).val;
    setState(SCRIPT_PV_FEEDIN_WATTS, feedin_power, true);

    var pv_power = inv10_power + inv15_power;
    setState(SCRIPT_PV_CUR_WATTS, pv_power, true);

    /* The 15kW Inverter should produce more than the 10kW inverter proportional to the number
       of PV Panels on the string. */
    var inv15_potential_pv_production = inv10_power * INV15_NR_PV_PANELS / INV10_NR_PV_PANELS;
    var potential_pv_production = inv10_power + inv15_potential_pv_production;
    setState(SCRIPT_PV_POT_WATTS, potential_pv_production, true);
    var self_consumption = pv_power - feedin_power;
    setState(SCRIPT_PV_SELF_CONSUMPTION_WATTS, self_consumption, true);
    var pv_surplus = 0;
    if(potential_pv_production > GRID_FEEDIN_MAX_WATTS) {
        pv_surplus = potential_pv_production - GRID_FEEDIN_MAX_WATTS;
    } 
    setState(SCRIPT_PV_SURPLUS_WATTS, pv_surplus, true);

    return pv_surplus;
}

function updateShellyRunTime(shelly_on) {
    if(shelly_on) {
        load_shelly_runtime_secs += SCRIPT_UPDATE_INTERVAL_SEC;
        setState(SCRIPT_LOAD_SHELLY_RUNTIME, load_shelly_runtime_secs, true);
    }
}

function controlLoads(surplus) {
    var shelly_on = getState(LOAD_SHELLY_SWITCH).val;
    var available_power = shelly_on ? surplus +  LOAD_SHELLY_EXPECTED_POWER_WATTS : surplus;
    if(available_power >= LOAD_SHELLY_EXPECTED_POWER_WATTS) {
        if(shelly_on == false) {
            setState(LOAD_SHELLY_SWITCH, true);
            console.log("Turning ON Load Shelly! (Surplus: " + available_power + "W)");
        }
    } else {
        if(shelly_on == true) {
            setState(LOAD_SHELLY_SWITCH, false);
            console.log("Turning OFF Load Shelly! (Surplus: " + available_power + "W)");
        }
    }
    updateShellyRunTime(shelly_on);
}

function processing() {
    setState(SCRIPT_FEEDIN_MAX_WATTS, GRID_FEEDIN_MAX_WATTS, true);
    if(!checkReady()) { return; }

    var surplus = updatePVProduction();
    controlLoads(surplus);
}

var Interval = setInterval(function () {
  processing(); /*start processing in interval*/
}, (SCRIPT_UPDATE_INTERVAL_SEC*1000));
    
