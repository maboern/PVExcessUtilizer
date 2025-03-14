// Static Script Parameters
var SCRIPT_UPDATE_INTERVAL_SEC = 30;
var SCRIPT_MAX_VALUE_AGE = 60 * 1000;
var SCRIPT_LOAD_HISTERESYS_WATTS = 250;
var SCRIPT_DEBUG = false;
var scriptRunTimeSecs = 0;
var SCRIPT_ID = 'javascript.0';

var SCRIPT_READY_OBJ = SCRIPT_ID + ".info.ready";
createState(SCRIPT_READY_OBJ, false, {read: true, write: false, name: "ready", type: "boolean", def: false});
var SCRIPT_RUNTIME_SECS_OBJ = SCRIPT_ID + ".info.runTimeSecs";
createState(SCRIPT_RUNTIME_SECS_OBJ, 0, {read: true, write: false, name: ".info.runTimeSecs", type: "number", unit: "s", def: 0});
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

let pv = new PVSystem('Turnerweg');
console.log(pv.getDetails());

let jackery = new ControllableBattery(SCRIPT_ID, 'Jackery', 2000);

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
    if(pv.checkReady()) {
        setState(SCRIPT_READY_OBJ, true, true);
        updateRunTime();
        return true;
    } else {
        setState(SCRIPT_READY_OBJ,false, true);
        scriptRunTimeSecs = 0;
        return false;
    }
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

        jackery.resetDayValues();
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

        if(boiler_on) {
            var non_load_consumption = pv.getSelfConsumption() - load_cellar_heater_power - LOAD_BOILER_EXPECTED_POWER_WATTS;
            if(non_load_consumption > 0) {
                load_boiler_power = LOAD_BOILER_EXPECTED_POWER_WATTS;
            } else {
                // As there is not enough consumption, the heating element in the boiler
                // has probably turned itself off because it has reached its target temperature
                // From experiments, the heating element consumes power unequally as follows from 
                // the shared power circuit: L1: 1.08kW, L2: 1.07kW, L3: 2.15kW
                stopBoiler(available_excess_power - load_cellar_heater_power);
                load_boiler_power = 0;
                boiler_on = false;
            }
        }
    }
    
    jackery.validateRunning(pv.getSelfConsumption());

    var cur_total_load_power = 0;
    var available_power = available_excess_power;
    available_power += (cellar_heater_on ? load_cellar_heater_power : 0);
    available_power += (boiler_on ? load_boiler_power : 0);
    
    if(SCRIPT_DEBUG) {
        console.log("Excess: " + available_excess_power + "W; Available: " + available_power + "W");
    }

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

    jackery.control(SCRIPT_UPDATE_INTERVAL_SEC, available_power);

    setState(SCRIPT_CONTROLLED_LOADS_WATTS_OBJ, cur_total_load_power, true);
    updateCellarHeaterRunTime(cellar_heater_on);
    updateBoilerRunTime(boiler_on);
    resetDayValuesIfNecessary();
}

function updateControl() {
    if(!checkReady()) { return; }

    pv.updateEstimation();
    controlLoads(pv.getExcessPower());
}

var Interval = setInterval(function () {
  updateControl(); // start processing in interval
}, (SCRIPT_UPDATE_INTERVAL_SEC*1000));

var PVInterval = setInterval(function () {
  pv.processMeasurements(); // start processing in interval
}, (pv.getUpdateIntervalMs()));

