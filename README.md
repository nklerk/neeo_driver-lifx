# LIFX driver for NEEO

This driver adds support for LIFX to NEEO.

depending on the device, the following features are availeble:
- Power (switch)
- Light On (button)
- Light Off (button)
- Dimmer (Slider)
- Temperature (Slider)
- HUE (slider)
- Saturation (Slider)
- iR (Slider)

Currently only LIFX Light is offered. to get the other drivers remove the comment markers in index.js

# Release notes
## 0.2.3
- Fixed an issue that occured when a switch was set to false.

## 0.2.2
- Fixed an issue that occured when one of the lifx values was 0.
- Fixed an issue that occured when a light coud not be found.
- Fixed an issue that occured when a lightid never registered

## 0.2.1
- Commented out all specific LIFX drivers as sliders currently mess things up.
- Renamed "general" driver to LIFX Light.

Thanks @Michael for being your padawan, and reporting these:
- Reworked all functions to match promise.
- Changed object validation
- Changed function names
- Changed var, let, const

## 0.0.3
- Added Error handeling in case lights could not be reached.

## 0.0.2
- Added driver LIFX Simple (On/Off, Dimmer) for any LIFX type.

## 0.0.1
- Initial LIFX driver
- Added support for LIFX White bulbs
- Added support for LIFX Color bulbs
- Added support for LIFX + bulbs
- Added support for LIFX Z strip
