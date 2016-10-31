(function (window) {
  'use strict';
  var plugins = namespace('plugins');

  var Laser = function Laser(cockpit) {
    console.log("Loading laser plugin.");
    var self = this;
    self.cockpit = cockpit;
    
    self.laserState = {
      enabled: false
    };
    
    this.inputDefaults = [{
      name: 'plugin.laser.Toggle',
      shortName: "Toggle Lasers",
      description: 'Toggles the lasers on or off',
      controllers: new Map([["keyboard", "l"]]),    
      actions:
      {
        down: function() {
          cockpit.rov.emit('plugin.laser.set', self.laserState.enabled == true ? 0 : 1);
        }
      }
    }];

    //If this was loaded after the input manager, let it know we are ready to be loaded
    cockpit.emit('plugin.inputController.defaults', self.inputDefaults);
  };
  
  plugins.Laser = Laser;

  plugins.Laser.prototype.getTelemetryDefinitions = function getTelemetryDefinitions() {
    return [{
        name: 'claser',
        description: 'Scaling Laser power 0 to 255'
      }];
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.Laser.prototype.listen = function listen() {
    var self = this;
    /* Forward calls on the COCKPIT emitter to the ROV  */
    self.cockpit.on('plugin.laser.set', function (value) {
      cockpit.rov.emit('plugin.laser.set', value);
    });
    self.cockpit.rov.withHistory.on('plugin.laser.state', function (data) {
      self.laserState = data;
      cockpit.emit('plugin.laser.state', data);
    });
  };
  window.Cockpit.plugins.push(plugins.Laser);
}(window));