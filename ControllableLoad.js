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
        this.load_hysteresis_power = 0;

        this.runtime_secs = 0;
        this.max_day_runtime_secs = 0;
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
        createState(this.day_energy_obj, 0, {read: true, write: false, name: "Load Day Energy", type: "number", unit: "Ws", def: 0});

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

    resetDayValues() { 
        this.day_energy = 0;
        setState(this.day_energy_obj, this.day_energy, true);
        this.runtime_secs = 0;
        setState(this.runtime_secs_obj, this.runtime_secs, true);
    }

    isOn() { return getState(this.switch_obj).val; }
    toString() { return `Load ${this.name} (${this.load_type})`; }

    start(available_power) {
        if(this.allowedToRun()) {
            console.log("Turning ON Load " + this.name + "! (Surplus: " + available_power + "W)");
            setState(this.switch_obj, true);

            var switchCount = getState(this.total_switch_count_obj).val;
            switchCount = switchCount + 1;
            setState(this.total_switch_count_obj, switchCount, true);
            return true;
        } else {
            console.log("Cannot turn ON Load + " + this.name + ": Not allowed to run.");
            return false;
        }
    }

    stop(available_power) {
        console.log("Turning OFF Load " + this.name + "! (Surplus: " + available_power + "W)");
        setState(this.switch_obj, false);
    }

    getMeasuredPower() {
        return getState(this.measured_power_obj).val;
    }

    getCurrentPower() {
        if(this.measured_power_obj) {
            return this.getMeasuredPower();
        } else if(this.isOn()) {
            return this.expected_power;
        } else {
            return 0;
        }
    }

    allowedToRun() {
        if(this.isReady()) {
            if(this.runtime_secs < this.max_day_runtime_secs) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }   
    }
    
    validateDrawingPower(non_load_consumption) {
        // Check whether the device is plausibly still drawing
        // the expected power or has turned itself off
        var measured_power = this.getMeasuredPower();
        if(this.measured_power_obj && measured_power > 0) {
            return true;
        } else if(non_load_consumption >= this.expected_power) {
            return true;
        } else {
            console.log("Load " + this.name + " is drawing too little to be running (" + non_load_consumption + "W / " + this.expected_power + "W).");
            return false;
        }
    }

    validateRunning(non_load_consumption) {
        if(this.isOn()) {
            if(!this.allowedToRun()) {
                console.log("Load " + this.name + " has expired its max runtime (" + this.runtime_secs + "s / " + this.max_day_runtime_secs + "s).");
                this.stop();
                return false;
            } else if(!this.validateDrawingPower(non_load_consumption)) {
                this.stop();
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    control(interval, available_power) {
        if(!this.isReady()) {
            return false;
        }

        if(this.isOn()) {
            if(available_power < this.getCurrentPower() + this.load_hysteresis_power){
                this.stop(available_power);
            }
        } else {
            if(available_power > this.expected_power + this.load_hysteresis_power) {
                if(this.allowedToRun()) {
                    this.start(available_power);
                }
            }
        }
        this.updateRunTime(interval);
        return true;
    }
}

class ControllableBattery extends ControllableLoad {
  constructor(script_id, name, capacity) {
    super(script_id, name, CONTROLLABLE_LOAD_TYPE.BATTERY);

    this.capacity = capacity;
    this.level_of_charge_percent = 0;
    this.max_level_of_charge_percent = 80;
    this.charging_loss_percent = 2;
    this.max_day_runtime_secs = 1000;

    this.expected_power = 1500;
    this.load_hysteresis_power = 250;
    this.is_connected_obj = 'shelly.0.shellyplusplugs#e465b8455ce8#1.online';
    this.switch_obj = 'shelly.0.shellyplusplugs#e465b8455ce8#1.Relay0.Switch';
    this.measured_power_obj = 'shelly.0.shellyplusplugs#e465b8455ce8#1.Relay0.Power';

    console.log("Initialized " + this.toString());
  }

  toString() {
    return super.toString() + ": " + this.capacity + "Wh";
  }
}
        
