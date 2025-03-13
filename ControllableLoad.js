const CONTROLLABLE_LOAD_TYPE = Object.freeze({
    BATTERY : "battery",
    HEATER : "heater"
});

class ControllableLoad {
    constructor(script_id, name, load_type) {
        this.name = name;
        this.script_id = script_id;
        this.SCRIPT_DEBUG = false;
        this.load_type = load_type;
        this.expected_power = 0;

        this.runtime_secs = 0;
        this.day_energy = 0;

        this.is_connected_obj = null;
        this.switch_obj = null;
        this.measured_power_obj = null;
        
        this.root_obj = this.script_id + '.info.load.' + this.name;
        this.total_switch_count_obj = this.root_obj + '.switchCount';
        createState(this.total_switch_count_obj, 0, {read: true, write: false, name: "Switch Count", type: "number", unit: "", def: 0});
        this.runtime_secs_obj = this.root_obj + '.runtimeSecs';
        createState(this.runtime_secs_obj, 0, {read: true, write: false, name: "Load Runtime", type: "number", unit: "s", def: 0});
        this.total_energy_obj = this.root_obj + '.totalEnergy';
        createState(this.total_energy_obj, 0, {read: true, write: false, name: "Load Total Energy", type: "number", unit: "Ws", def: 0});
        this.day_energy_obj = this.root_obj + '.dayEnergy';
        createState(this.total_energy_obj, 0, {read: true, write: false, name: "Load Day Energy", type: "number", unit: "Ws", def: 0});

    }

    getLoadType() { return this.load_type; }
    getLoadRootObj() { return  }

    isReady() { 
        if(this.is_connected_obj) {
            return getState(this.is_connected_obj).val;
        } else {
            return false;
        }
    }

    updateRunTime(interval) {
        this.runtime_secs += interval;
        setState(this.runtime_secs_obj, this.runtime_secs, true);
    }

    isOn() { return getState(this.switch_obj).val; }
    toString() { return `Load ${this.name} (${this.load_type})`; }

    start(available_power) {
        console.log("Turning ON Load " + this.name + "! (Surplus: " + available_power + "W)");
        setState(this.switch_obj, true);

        var switchCount = getState(this.total_switch_count_obj).val;
        switchCount = switchCount + 1;
        setState(this.total_switch_count_obj, switchCount, true);
    }

    stop(available_power) {
        console.log("Turning OFF Load " + this.name + "! (Surplus: " + available_power + "W)");
        setState(this.switch_obj, false);
    }

    control(available_power) {
    }
}

class ControllableBattery extends ControllableLoad {
  constructor(script_id, name, capacity) {
    super(script_id, name, CONTROLLABLE_LOAD_TYPE.BATTERY);

    this.capacity = capacity;
    this.levelOfChargePercent = 0;
    this.maxLevelOfChargePercent = 80;
    this.chargingLossPercent = 2;

    this.expected_power = 1500;
    this.is_connected_obj = 'shelly.0.shellyplusplugs#e465b8455ce8#1.online';
    this.switch_obj = 'shelly.0.shellyplusplugs#e465b8455ce8#1.Relay0.Switch';
    this.measured_power_obj = 'shelly.0.shellyplusplugs#e465b8455ce8#1.Relay0.Power';

    console.log("Initialized " + this.toString());
  }
  
  toString() {
    return super.toString() + ": " + this.capacity + "Wh";
  }
}

