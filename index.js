'use strict';

const neeoapi = require('neeo-sdk');
const controller = require('./controller');


console.log('NEEO "LIFX" device adapter');
console.log('---------------------------------------------');


const devices = [
  lifxbuilder('Light'),
  //lifxbuilder('Color'), 
  ///lifxbuilder('White'), 
  //lifxbuilder('+'), 
  //lifxbuilder('Z') 
];


function lifxbuilder(type){
  var light = neeoapi.buildDevice(type)
  .setManufacturer('LIFX')
  .addAdditionalSearchToken('light', 'bulb')
  .setType('LIGHT')
  .addSwitch({ name: 'toggle', label: 'Toggle On/Off' }, { setter: controller.toggleSet, getter: controller.toggleGet })
  .addSlider({ name: 'power-slider', label: 'Dimmer', range: [0, 100], unit: '%' }, { setter: controller.powerSliderSet, getter: controller.powerSliderGet })
  .addButton({ name: 'Light ON', label: 'Light ON' })
  .addButton({ name: 'Light OFF', label: 'Light OFF' })
  .registerSubscriptionFunction(controller.registerStateUpdateCallback)
  .addButtonHander(controller.button);
  
  if (type === 'Light') {
    light.addSlider({ name: 'temperature-slider', label: 'Temperature', range: [2500, 9000], unit: 'K' }, { setter: controller.temperatureSliderSet, getter: controller.temperatureSliderGet })
    light.enableDiscovery({ headerText: 'Discover any LIFX type', description: 'Make sure that the light(s) are powered on.'}, controller.discoverLight);
  }

  if (type === 'White') {
    light.addSlider({ name: 'temperature-slider', label: 'Temperature', range: [2500, 9000], unit: 'K' }, { setter: controller.temperatureSliderSet, getter: controller.temperatureSliderGet })
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discoverWhite);
  }

  if (type === 'Color') {
    light.addSlider({ name: 'temperature-slider', label: 'Temperature', range: [2500, 9000], unit: 'K' }, { setter: controller.temperatureSliderSet, getter: controller.temperatureSliderGet })
    light.addSlider({ name: 'hue-slider', label: 'HUE', range: [0, 360], unit: '°' }, { setter: controller.hueSliderSet, getter: controller.hueSliderGet })
    light.addSlider({ name: 'saturation-slider', label: 'Saturation', range: [0, 100], unit: '%' }, { setter: controller.saturationSliderSet, getter: controller.saturationSliderGet }) 
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discoverColor);
  }

  if (type === '+') {
    light.addSlider({ name: 'temperature-slider', label: 'Temperature', range: [2500, 9000], unit: 'K' }, { setter: controller.temperatureSliderSet, getter: controller.temperatureSliderGet })
    light.addSlider({ name: 'hue-slider', label: 'HUE', range: [0, 360], unit: '°' }, { setter: controller.hueSliderSet, getter: controller.hueSliderGet })
    light.addSlider({ name: 'saturation-slider', label: 'Saturation', range: [0, 100], unit: '%' }, { setter: controller.saturationSliderSet, getter: controller.saturationSliderGet }) 
    light.addSlider({ name: 'iR-slider', label: 'iR', range: [0, 100], unit: '%' }, { setter: controller.irSliderSet, getter: controller.irSliderGet }) 
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discoverPlus);
  }

  if (type === 'Z') {
    light.addSlider({ name: 'temperature-slider', label: 'Temperature', range: [2500, 9000], unit: 'K' }, { setter: controller.temperatureSliderSet, getter: controller.temperatureSliderGet })
    light.addSlider({ name: 'hue-slider', label: 'HUE', range: [0, 360], unit: '°' }, { setter: controller.hueSliderSet, getter: controller.hueSliderGet })
    light.addSlider({ name: 'saturation-slider', label: 'Saturation', range: [0, 100], unit: '%' }, { setter: controller.saturationSliderSet, getter: controller.saturationSliderGet }) 
    light.enableDiscovery({ headerText: 'Discover LIFX '+type, description: 'Make sure that the light(s) are powered on.'}, controller.discoverZ);
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
      //brain,
      brain: '10.2.1.14',
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



