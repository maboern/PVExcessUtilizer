class MpptCurtailmentEstimator {
    // Curtailment estimate from MPPT tracking / Panel voltage

    constructor(script_id, string_voltage_obj, nr_string_panels) {
        this.SCRIPT_DEBUG = false;
        this.MPPT_DYNAMICS = 0.1;
        this.MIN_PANEL_VOLTAGE = 32;

        this.script_id = script_id;
        this.string_voltage_obj = string_voltage_obj;
        this.nr_string_panels = nr_string_panels;

        this.curtailment_percent = 0;
        this.power = 0;
        this.uncurtailed_panel_voltage = 0;
        this.smoothed_panel_voltage = 0;
        this.panel_voltage = 0;
        this.panel_voltage_power_bucket = [];

        this.root_obj = script_id + '.info.mppt';
        this.SCRIPT_PV_CURTAILMENT_ESTIMATE_OBJ = this.root_obj + ".curtailment";
        createState(this.SCRIPT_PV_CURTAILMENT_ESTIMATE_OBJ, 0, {read: true, write: false, name: "CurtailmentPercentEstimate", type: "number", unit: "%", def: 0});
        this.SCRIPT_PV_MPPT_POWER_ESTIMATE_OBJ = this.root_obj + ".power";
        createState(this.SCRIPT_PV_MPPT_POWER_ESTIMATE_OBJ, 0, {read: true, write: false, name: "PowerEstimate", type: "number", unit: "W", def: 0});
        this.SCRIPT_SMOOTHED_PANEL_VOLTAGE_OBJ = this.root_obj + ".smoothed_panel_voltage";
        createState(this.SCRIPT_SMOOTHED_PANEL_VOLTAGE_OBJ, 0, {read: true, write: false, name: "SmoothedPanelVoltage", type: "number", unit: "V", def: 0});
        this.SCRIPT_PV_PANEL_VOLTAGE_POWER_BUCKET_OBJ_PREFIX = this.root_obj + ".panel_voltage_buckets.power_";
        for(var power_bucket = 0; power_bucket <= 25; power_bucket++) {
            createState(this.SCRIPT_PV_PANEL_VOLTAGE_POWER_BUCKET_OBJ_PREFIX + power_bucket, 0, {read: true, write: false, name: "pvPanelVoltagePowerBucket_" + power_bucket, type: "number", unit: "V", def: 0});
        }
    }

    getCurtailmentPercent() { return this.curtailment_percent; }
    getPower() {return this.power; }

    updateEstimation(is_curtailed, pv_power) {
       // if(is_curtailed) {
            var mppt_voltage_offset = this.smoothed_panel_voltage - this.uncurtailed_panel_voltage;
            if(mppt_voltage_offset < 1) {
                // Voltage within error margin around peak power or below - assume no curtailment
                this.curtailment_percent = 0;
            } else if(mppt_voltage_offset <= 3.5) {
                // Power curve estimation near the peak power (offset < 3.5V) is -3.178%/V
                this.curtailment_percent = 0.03178 * mppt_voltage_offset;
            } else if (mppt_voltage_offset < 10) {
                // Power curve estimation further away from peak power is -9.2%/V
                var net_mppt_voltage_offset = mppt_voltage_offset - 3.5;
                this.curtailment_percent = 0.08 + 0.092*net_mppt_voltage_offset;
            } else {
                // Voltage way above - something is strange
                this.curtailment_percent = 0;
            }
        //} 
        if(!is_curtailed) {
            this.uncurtailed_panel_voltage = this.smoothed_panel_voltage;
        }
        setState(this.SCRIPT_PV_CURTAILMENT_ESTIMATE_OBJ, this.curtailment_percent * 100, true);

        this.power = pv_power / (1 - this.curtailment_percent);
        setState(this.SCRIPT_PV_MPPT_POWER_ESTIMATE_OBJ, this.power, true);

        if(this.SCRIPT_DEBUG) {
            this.logPowerBuckets();
        }
    }

    getPowerBucket(panel_voltage, pv_power) {
        const POWER_LEVEL_THRESHOLD = 100; // 100 W tolerance
        for(var power_bucket = 0; power_bucket <= 25; power_bucket += 1) {
            var power_level = power_bucket * 1000;
            if(pv_power > power_level - POWER_LEVEL_THRESHOLD && pv_power < power_level + POWER_LEVEL_THRESHOLD) {
                return power_bucket;
            }
        }
        return -1;
    }

    updatePanelVoltagePowerBuckets(pv_power)
    {
        var power_bucket = this.getPowerBucket(pv_power);
        if(power_bucket < 0) {
            return;
        }

        if(this.panel_voltage_power_bucket[power_bucket] > 0) {
            // Update the entry in the power bucket to get the minimum
            var diff = this.panel_voltage - this.panel_voltage_power_bucket[power_bucket];
            this.panel_voltage_power_bucket[power_bucket] += diff * this.MPPT_DYNAMICS;
        } else {
            // No entry in power bucket yet
            this.panel_voltage_power_bucket[power_bucket] = this.panel_voltage;
        }

        setState(this.SCRIPT_PV_PANEL_VOLTAGE_POWER_BUCKET_OBJ_PREFIX + power_bucket, this.panel_voltage, true);
    }

    logPowerBuckets() 
    {
        var log_string = "Power Buckets:";
        for(var power_bucket = 0; power_bucket < 25; power_bucket += 1) {
            log_string += " " + power_bucket + "kW: " + this.panel_voltage_power_bucket[power_bucket] + "V"
        }
        console.log(log_string);
    }

    smoothMpptVoltage(is_curtailed) 
    {
        if(!is_curtailed) {
            if(this.smoothed_panel_voltage < this.MIN_PANEL_VOLTAGE) {
                this.smoothed_panel_voltage = this.panel_voltage;
            } else {
                this.smoothed_panel_voltage += this.panel_voltage * this.MPPT_DYNAMICS;
            }
        }
        setState(this.SCRIPT_SMOOTHED_PANEL_VOLTAGE_OBJ, this.smoothed_panel_voltage, true);
    }

    processMeasurements(is_curtailed, pv_power) 
    {
        this.panel_voltage = getState(this.string_voltage_obj).val / this.nr_string_panels;
        this.updatePanelVoltagePowerBuckets(pv_power);
        this.smoothMpptVoltage(is_curtailed);
    }
}
