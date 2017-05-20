'use strict';

const neeoapi = require('neeo-sdk');
const controller = require('./controller');


console.log('NEEO "LIFX" device adapter');
console.log('---------------------------------------------');


const devices = [
  lifxbuilder('Color'), 
  lifxbuilder('White'), 
  lifxbuilder('+'), 
  lifxbuilder('Z') 
];


function lifxbuilder(type){
  var light = neeoapi.buildDevice(type)
  .setManufacturer('LIFX')
  .addAdditionalSearchToken('light', 'bulb')
  .setType('LIGHT')
  .addSwitch({ name: 'toggle', label: 'Toggle On/Off' }, { setter: controller.toggleSet, getter: controller.toggleGet })
  .addSlider({ name: 'power-slider', label: 'Dimmer', range: [0, 100], unit: '%' }, { setter: controller.power_sliderSet, getter: controller.power_sliderGet })
  .addButton({ name: 'POWER ON', label: 'POWER ON' })
  .addButton({ name: 'POWER OFF', label: 'POWER OFF' })
  .addSlider({ name: 'temperature-slider', label: 'Temperature', range: [2500, 9000], unit: 'K' }, { setter: controller.temperature_sliderSet, getter: controller.temperature_sliderGet })
  .registerSubscriptionFunction(controller.registerStateUpdateCallback)
  .addButtonHander(controller.button);
   
  if (type === 'White') {
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discover_white);
  }

  if (type === 'Color') {
    light.addSlider({ name: 'hue-slider', label: 'HUE', range: [0, 360], unit: '°' }, { setter: controller.hue_sliderSet, getter: controller.hue_sliderGet })
    light.addSlider({ name: 'saturation-slider', label: 'Saturation', range: [0, 100], unit: '%' }, { setter: controller.saturation_sliderSet, getter: controller.saturation_sliderGet }) 
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discover_color);
  }

  if (type === '+') {
    light.addSlider({ name: 'hue-slider', label: 'HUE', range: [0, 360], unit: '°' }, { setter: controller.hue_sliderSet, getter: controller.hue_sliderGet })
    light.addSlider({ name: 'saturation-slider', label: 'Saturation', range: [0, 100], unit: '%' }, { setter: controller.saturation_sliderSet, getter: controller.saturation_sliderGet }) 
    light.addSlider({ name: 'iR-slider', label: 'iR', range: [0, 100], unit: '%' }, { setter: controller.ir_sliderSet, getter: controller.ir_sliderGet }) 
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discover_plus);
  }

  if (type === 'Z') {
    light.addSlider({ name: 'hue-slider', label: 'HUE', range: [0, 360], unit: '°' }, { setter: controller.hue_sliderSet, getter: controller.hue_sliderGet })
    light.addSlider({ name: 'saturation-slider', label: 'Saturation', range: [0, 100], unit: '%' }, { setter: controller.saturation_sliderSet, getter: controller.saturation_sliderGet }) 
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discover_z);
    //Multizone not yet supported in node module.
  }
  
  return light
}


console.log('- discover one NEEO Brain...');
neeoapi.discoverOneBrain()
  .then((brain) => {
    console.log('- Brain discovered:', brain.name);

    console.log('- Start server');
    return neeoapi.startServer({
      brain: '10.2.1.14',
      //brain,
      port: 6336,
      name: 'lifx-device-adapter',
      devices: devices
    });
  })
  .then(() => {
    console.log('# READY! use the NEEO app to search for "LIFX".');
  })
  .catch((err) => {
    console.error('ERROR!', err);
    process.exit(1);
  });



