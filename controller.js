/*  LIFX Driver for NEEO.

Written By:   Niels de Klerk.
Version:      0.0.1
Tested with:  LIFX gen3 (Color) Bulbs and LIFX Z Led strips.   */


'use strict';

const BluePromise = require('bluebird');
let sendComponentUpdate;


//////////////////////
// LIFX

const lifxnodeclient = require('node-lifx').Client;
const LIFX_ERROR = '[LIFX] Light can not be reached.';
var lifxclient = new lifxnodeclient();
var lifxlights = [];

lifxclient.on('light-new', (lifxlight) => {
  lifxlight.getLabel(() => {
    lifxlight.getHardwareVersion((a,b) =>{
      
      console.log("[LIFX] Discovered new lifx light: "+lifxlight.id);

      //Map known specs to Lifx types, default = White.
      var type = 'White';
      if (b.productFeatures){
        if (b.productFeatures.color === true && b.productFeatures.infrared === true && b.productFeatures.multizone === false ){type = '+';}
        if (b.productFeatures.color === true && b.productFeatures.infrared === false && b.productFeatures.multizone === false ){type = 'Color';}
        if (b.productFeatures.color === true && b.productFeatures.infrared === false && b.productFeatures.multizone === true ){type = 'Z';}
      }

      BluePromise.promisifyAll(lifxlight);

      var light = {
        id: lifxlight.id, 
        name: lifxlight.label, 
        reachable: true, 
        type: type, 
        light: lifxlight
      }
      
      lifxlights.push(light);
    });
  },false); // Do not use cache //
});

lifxclient.on('light-online', (lifx) => {
  console.log ('[LIFX] light-online',lifx.id);
  lifxReachableSet(lifx.id, true);
});

lifxclient.on('light-offline', (lifx) => {
  console.log ('[LIFX] light-offline',lifx.id);
  lifxReachableSet(lifx.id, false);
});

lifxclient.init();




//////////////////////
// Module Exports, Components

//Power Toggle
module.exports.toggleSet = function(deviceId, value) {
  console.log('[CONTROLLER] switch set to', deviceId, value);

  getLifxbyId(deviceId).then((lifx) =>{
  if (lifx) {
      if (value === 'true'){
        updateComponent(deviceId, 'toggle', true);
        lifx.light.onAsync(0)
        .catch((e)=>{console.log(LIFX_ERROR)});
      } 
      if (value === 'false'){
        updateComponent(deviceId, 'toggle', 'false');
        lifx.light.offAsync(0)
        .catch((e)=>{console.log(LIFX_ERROR)});
      }
    }
  });
};
module.exports.toggleGet = function(deviceId) {
  return new BluePromise((_resolve, _reject) => {
    getLifxState(deviceId).then((state) => {
      if (state) {
        if (state && state.power === 1){
          _resolve(true);
        } else {
          _resolve(false);
        }
      } else {
        _reject('Powerstate expected but not received.')
      }
    });
  });
};

//Brightness
module.exports.power_sliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'power-slider', value);

  value = parseInt(value, 10);
  
  getLifxbyId(deviceId).then((lifx) => {
    if (lifx) {
      lifx.light.getState(function(e,state){
        if (state && state.color){
          lifx.light.color(state.color.hue, state.color.saturation, value, state.color.kelvin, 200, function(){});
        }
      })
    }
  }); 
};
module.exports.power_sliderGet = function(deviceId) {
  return new BluePromise((_resolve, _reject) => {
    getLifxState(deviceId).then((state) => {
      if (state && state.color && state.color.brightness) {
        _resolve(state.color.brightness)
      } else {
        _reject('Brightness expected, but not received.');
      }
    })
    .catch((e)=>{console.log('[LIFX] Light can not be reached.')});
  });
};

//Temperature
module.exports.temperature_sliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] Color temperature set to', deviceId, value);
  updateComponent(deviceId, 'temperature-slider', value);

  value = parseInt(value, 10);
  
  getLifxbyId(deviceId).then((lifx) => {
    if (lifx) {
      lifx.light.getState(function(e,state){
        if (state && state.color){
          lifx.light.color(state.color.hue, state.color.saturation, state.color.brightness, value, 200, function(){})
          .catch((e)=>{console.log(LIFX_ERROR)});
        }
      })
      .catch((e)=>{console.log(LIFX_ERROR)});
    }
  }); 
};
module.exports.temperature_sliderGet = function(deviceId) {
  return new BluePromise((_resolve, _reject) => {
    getLifxState(deviceId).then((state) => {
      if (state && state.color && state.color.kelvin) {
        _resolve(state.color.kelvin)
      } else {
        _reject('Kelvin expected, but not received.');
      }
    });
  });
};

//hue
module.exports.hue_sliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'hue-slider', value);

  value = parseInt(value, 10);
  
  getLifxbyId(deviceId).then((lifx) => {
    if (lifx) {
      lifx.light.getState(function(e,state){
        if (state && state.color){
          lifx.light.color(value, state.color.saturation, state.color.brightness, state.color.kelvin, 200, function(){})
          .catch((e)=>{console.log(LIFX_ERROR)});
        }
      })
      .catch((e)=>{console.log(LIFX_ERROR)});
    }
  }); 
};
module.exports.hue_sliderGet = function(deviceId) {
  return new BluePromise((_resolve, _reject) => {
    getLifxState(deviceId).then((state) => {
      if (state && state.color && state.color.hue) {
        _resolve(state.color.hue)
      } else {
        _reject('HUE expected, but not received.');
      }
    });
  });
};

//saturation
module.exports.saturation_sliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'saturation-slider', value);

  value = parseInt(value, 10);
  
  getLifxbyId(deviceId).then((lifx) => {
    if (lifx) {
      lifx.light.getState(function(e,state){
        if (state && state.color){
          lifx.light.color(state.color.hue, value, state.color.brightness, state.color.kelvin, 200, function(){})
          .catch((e)=>{console.log(LIFX_ERROR)});
        }
      })
      .catch((e)=>{console.log(LIFX_ERROR)});
    }
  }); 
};
module.exports.saturation_sliderGet = function(deviceId) {
  return new BluePromise((_resolve, _reject) => {
    getLifxState(deviceId).then((state) => {
      if (state && state.color && state.color.saturation) {
        _resolve(state.color.saturation)
      } else {
        _reject('Saturation expected, but not received.');
      }
    });
  });
};

//Infrared
module.exports.ir_sliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'power-slider', value);

  value = parseInt(value, 10);
  
  getLifxbyId(deviceId).then((lifx) => {
    if (lifx) {
      lifx.light.maxIR(value, function(){})
      .catch((e)=>{console.log(LIFX_ERROR)});
    }
  }); 
};
module.exports.ir_sliderGet = function(deviceId) {
  return new BluePromise((_resolve, _reject) => {
    getLifxMaxIR(deviceId).then((maxIR) => {
      if (maxIR) {
        _resolve(maxIR)
      } else {
        _reject('Brightness expected, but not received.');
      }
    })
  });
};

//buttons
module.exports.button = function(name, deviceId) {
  console.log(`[CONTROLLER] ${name} button pressed on ${deviceId}!`);
  getLifxbyId(deviceId).then((lifx) =>{
  if (lifx) {
      if (name === 'POWER ON'){
        updateComponent(deviceId, 'toggle', true);
        lifx.light.onAsync(0)
        .catch((e)=>{console.log(LIFX_ERROR)});
      } 
      if (name === 'POWER OFF'){
        updateComponent(deviceId, 'toggle', 'false');
        lifx.light.offAsync(0)
        .catch((e)=>{console.log(LIFX_ERROR)});
      }
    }
  });
};

//Notifications
module.exports.registerStateUpdateCallback = function(updateFunction) {
  console.log('[CONTROLLER] register update state for complicatedDevice');
  sendComponentUpdate = updateFunction;
};




//////////////////////
// Module Exports, Discovery

module.exports.discover_white = function() {
  return discover('White');
};
module.exports.discover_color = function() {
  return discover('Color');
};
module.exports.discover_plus = function() {
  return discover('+');
};
module.exports.discover_z = function() {
  return discover('Z');
};
module.exports.discover_simple = function() {
  return sharedDeviceDiscovery().map((device) => ({
    id: device.id,
    name: device.name,
    reachable: device.reachable,
  }));
};



//////////////////////
// Functions

function discover(type){
  return sharedDeviceDiscovery()
  .filter((device)=> device.type === type)
  .map((device) => ({
    id: device.id,
    name: device.name,
    reachable: device.reachable,
  }));
}

function sharedDeviceDiscovery() {
  return lifxlights;
}

function getLifxbyId (deviceId){
  return new BluePromise((_resolve, _reject) => {
    const lifx = sharedDeviceDiscovery().find((device)=> device.id === deviceId);
    if (lifx){
      _resolve(lifx);
    } else {
      _reject('Light not found.');
    }
  });
}

function getLifxState (deviceId){
  return new BluePromise((_resolve, _reject) => {
    getLifxbyId(deviceId).then((lifx) => {
      lifx.light.getStateAsync().then((state) => { 
        if (state && state.color){
          _resolve(state);
        } else {
          _reject('Received unexpected state format.');
        }
      })
      .catch((e)=>{console.log(LIFX_ERROR)});
    })
  });
}

function getLifxMaxIR (deviceId){
  return new BluePromise((_resolve, _reject) => {
    getLifxbyId(deviceId).then((lifx) => {
      lifx.light.getMaxIRAsync().then((MaxIR) => {
        if (MaxIR){
          _resolve(MaxIR);
        } else {
          _reject('Received unexpected MaxIR format.');
        }
      })
      .catch((e)=>{console.log(LIFX_ERROR)});
    })
  });
}

function updateComponent(uniqueDeviceId, component, value){
  if (sendComponentUpdate && uniqueDeviceId && component && value) {
    const updatePayload = {
      uniqueDeviceId: uniqueDeviceId,
      component: component,
      value: value
    };
    
    sendComponentUpdate(updatePayload)
    .catch((error) => {
      console.log('failed to send notification', error.message);
    });
  }
}

function lifxReachableSet (deviceId, reachable){
  for (var i in lifxlights){
    if(lifxlights[i].id === deviceId) {
      lifxlights[i].reachable = reachable;
    }
  }
}


