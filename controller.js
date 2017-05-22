/*  LIFX Driver for NEEO. */


'use strict';

const BluePromise = require('bluebird');
let sendComponentUpdate;


//////////////////////
// LIFX
const LIFX_ERROR = '[LIFX] Light can not be reached.';
const LIFX_FADETIME = 200;  //Time in ms for a state fade.

const lifxnodeclient = require('node-lifx').Client;
const lifxclient = new lifxnodeclient();
let lifxlights = [];

lifxclient.on('light-new', (lifxlight) => {
  lifxlight.getLabel(() => {
    lifxlight.getHardwareVersion((e,hardware) =>{
      
      console.log("[LIFX] Discovered new lifx light: "+lifxlight.id);

      //Map known specs to Lifx types, default = White.
      let type = 'White';
      if (hardware.productFeatures){
        if (hardware.productFeatures.color === true && hardware.productFeatures.infrared === true && hardware.productFeatures.multizone === false ){type = '+';}
        if (hardware.productFeatures.color === true && hardware.productFeatures.infrared === false && hardware.productFeatures.multizone === false ){type = 'Color';}
        if (hardware.productFeatures.color === true && hardware.productFeatures.infrared === false && hardware.productFeatures.multizone === true ){type = 'Z';}
      }

      BluePromise.promisifyAll(lifxlight);
      
      lifxlights.push({
        id: lifxlight.id, 
        name: lifxlight.label, 
        reachable: true, 
        type: type, 
        light: lifxlight
      });

    });
  },false); // Do not cache while getting label //
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
  if (value === 'true'){ 
    lifxOn(deviceId); 
  } else if (value === 'false'){ 
    lifxOff(deviceId); 
  }
};

module.exports.toggleGet = function(deviceId) {
  return getLifxState(deviceId)
  .then((state) => { 
    if (state.power === 1){ 
      return true; 
    } else { 
      return false; 
    }
  })
  .catch((e)=>{console.log(LIFX_ERROR)});
};

//Brightness
module.exports.powerSliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'power-slider', value);

  value = parseInt(value, 10);
  
  getLifxState(deviceId, true).then((state) =>{
    state.lifx.light.colorAsync(state.color.hue, state.color.saturation, value, state.color.kelvin, LIFX_FADETIME, function(){})
    .catch((e)=>{console.log(LIFX_ERROR)});
  });
};
module.exports.powerSliderGet = function(deviceId) {
  return getLifxState(deviceId)
  .then((state) => { return state.color.brightness; })
  .catch((e)=>{console.log(LIFX_ERROR)});
};

//Temperature
module.exports.temperatureSliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] Color temperature set to', deviceId, value);
  updateComponent(deviceId, 'temperature-slider', value);

  value = parseInt(value, 10);
  
  getLifxState(deviceId, true).then((state) =>{
    state.lifx.light.colorAsync(state.color.hue, state.color.saturation, state.color.brightness, value, LIFX_FADETIME, function(){})
    .catch((e)=>{console.log(LIFX_ERROR)});
  });
};
module.exports.temperatureSliderGet = function(deviceId) {
  return getLifxState(deviceId)
  .then((state) => { return state.color.kelvin; })
  .catch((e)=>{console.log(LIFX_ERROR)});
};

//hue
module.exports.hueSliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'hue-slider', value);

  value = parseInt(value, 10);
  
  getLifxState(deviceId, true).then((state) =>{
    state.lifx.light.colorAsync(value, state.color.saturation, state.color.brightness, state.color.kelvin, LIFX_FADETIME, function(){})
    .catch((e)=>{console.log(LIFX_ERROR)});
  });
};
module.exports.hueSliderGet = function(deviceId) {
  return getLifxState(deviceId)
  .then((state) => { return state.color.hue; })
  .catch((e)=>{console.log(LIFX_ERROR)});
};

//saturation
module.exports.saturationSliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'saturation-slider', value);

  value = parseInt(value, 10);
  
  getLifxState(deviceId, true).then((state) =>{
    state.lifx.light.colorAsync(state.color.hue, value, state.color.brightness, state.color.kelvin, LIFX_FADETIME, function(){})
    .catch((e)=>{console.log(LIFX_ERROR)});
  });
};
module.exports.saturationSliderGet = function(deviceId) {
    return getLifxState(deviceId)
  .then((state) => { return state.color.saturation; })
  .catch((e)=>{console.log(LIFX_ERROR)});
};

//Infrared
module.exports.irSliderSet = function(deviceId, value) {
  console.log('[CONTROLLER] dimmer set to', deviceId, value);
  updateComponent(deviceId, 'power-slider', value);

  value = parseInt(value, 10);
  
  getLifxbyId(deviceId).then((lifx) => {
    lifx.light.getMaxIRAsync(value, function(){})
    .catch((e)=>{console.log(LIFX_ERROR)});
  }); 
};
module.exports.irSliderGet = function(deviceId) {
  return getLifxMaxIR(deviceId).then((maxIR) => { return(maxIR); });
};

//buttons
module.exports.button = function(name, deviceId) {
  console.log(`[CONTROLLER] ${name} button pressed on ${deviceId}!`);
  if (name === 'Light ON'){ 
    lifxOn(deviceId); 
  } else if (name === 'Light OFF'){ 
    lifxOff(deviceId); 
  }
};

//Notifications
module.exports.registerStateUpdateCallback = function(updateFunction) {
  console.log('[CONTROLLER] register update state for LIFX');
  sendComponentUpdate = updateFunction;
};




//////////////////////
// Module Exports, Discovery

module.exports.discoverWhite = function() {
  return discover('White');
};
module.exports.discoverColor = function() {
  return discover('Color');
};
module.exports.discoverPlus = function() {
  return discover('+');
};
module.exports.discoverZ = function() {
  return discover('Z');
};
module.exports.discoverLight = function() {
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
  return new BluePromise((resolve, reject) => {
    const lifx = sharedDeviceDiscovery().find((device)=> device.id === deviceId);
    if (lifx){
      resolve(lifx);
    } else {
      reject('Light not found.');
    }
  });
}

function getLifxState (deviceId, returnLifx){
  return getLifxbyId(deviceId)
  .then((lifx) => { 
    if (lifx){
      return lifx.light.getStateAsync()
      .then((state) => { 
        if (state && typeof state.power === 'number' && state.color && state.color.brightness && state.color.hue && state.color.kelvin && state.color.saturation){
          if (returnLifx) {
            state.lifx = lifx;
          }
          return state;
        } else {
          BluePromise.reject('[LIFX] Received unexpected state format.');
        }
      })
      .catch((e)=>{console.log(LIFX_ERROR)});
    } else {
      BluePromise.reject('[LIFX] Light not registered.');
    }
  })
}

function getLifxMaxIR (deviceId){
  return getLifxbyId(deviceId)
  .then((lifx) => {
    return lifx.light.getMaxIRAsync()
    .then((MaxIR) => {
      if (MaxIR){
        return(MaxIR);
      } else {
        BluePromise.reject('[LIFX] Received unexpected MaxIR format.');
      }
    })
    .catch((e)=>{console.log(LIFX_ERROR)});
  });
}

function updateComponent(uniqueDeviceId, component, value){
  if (sendComponentUpdate && uniqueDeviceId && component && value) {

    sendComponentUpdate({
      uniqueDeviceId: uniqueDeviceId,
      component: component,
      value: value
    })
    .catch((error) => {
      console.log('[CONTROLLER] Failed to send notification', error.message);
    });

  }
}

function lifxOn (deviceId){
  getLifxbyId(deviceId).then((lifx) => {
    updateComponent(deviceId, 'toggle', true);
    lifx.light.onAsync(LIFX_FADETIME)
    .catch((e)=>{console.log(LIFX_ERROR)});
  });
}

function lifxOff (deviceId){
  getLifxbyId(deviceId).then((lifx) => {
    updateComponent(deviceId, 'toggle', 'false');
    lifx.light.offAsync(LIFX_FADETIME)
    .catch((e)=>{console.log(LIFX_ERROR)});
  });
}

function lifxReachableSet (deviceId, reachable){
  for (let i in lifxlights){
    if(lifxlights[i].id === deviceId) {
      lifxlights[i].reachable = reachable;
    }
  }
}