/*jshint multistr: true*/
(function(window, document) 
{
  'use strict';

  //Necessary for debug utils
  var log;
  var trace;
  var log_debug;
  $.getScript('components/visionmedia-debug/dist/debug.js', function() {
    log = debug('input-controller:log');
    trace = debug('input-controller:trace');
    log_debug = debug('input-controller:debug');
  });

  var inputConfigurator = namespace('plugin.inputConfigurator');
  inputConfigurator.InputConfigurator = class InputConfigurator
  {
    constructor(cockpit)
    {
      this.cockpit = cockpit;

      var self = this;
      
      self.settings = {
        presets: []
      };

      self.rov = self.cockpit.rov.withHistory;
      self.isSavingSettings = false;
           
    };


    listen()
    {
      var self = this;

      //Listen for server setting changes
      this.rov.on('settings-change.inputConfigurator', function(settings) {
        if(!self.isSavingSettings)
        {
          self.settings = settings.inputConfigurator;
        }
      });

      this.cockpit.on('plugin.inputConfigurator.savePreset', function(presetIn) {
        console.log("Saving preset to settings");

        //The preset we want to save to the settings manager
        var presetToSave = JSON.stringify(presetIn, null, 2);

        //Add this preset to our settings object
        var presetName = presetIn.name;
        
        //Remove this preset, if found
        for(var i = 0; i < self.settings.presets.length; ++i)
        {
          //Get the object
          var preset = JSON.parse(self.settings.presets[i], 'utf8');

          if(preset.name == presetName)
          {
            self.settings.presets.splice(i, 1);
            break;
          }
        }

        //Add the preset
        self.settings.presets.push(presetToSave);
        
        //Update the server settings to reflect this new preset
        self.cockpit.rov.emit('plugin.settings-manager.saveSettings', {inputConfigurator: self.settings});
        console.log(self.settings);
      });
      
      this.cockpit.on('plugin.inputConfigurator.loadPreset', function(presetNameIn) {
        
        console.log("Loading preset", presetNameIn);

        //Search the settings for the preset requested
        var result = $.grep(self.settings.presets, function(preset){ 
          return preset.name == presetNameIn; 
        });

        if(result.length == 0)
        {
          console.error("There is no preset in the settings:", presetNameIn);
          return;
        }
        else if(result.length == 1)
        {
          console.log(result[0]);
        }
        else
        {
          console.error("Multiple presets with this name found:", presetNameIn);
          return;
        }

      });

      this.cockpit.rov.on('plugin.inputConfigurator.loadedPreset', function(presetIn) {
        console.log("Got a preset from node", presetIn);
        self.cockpit.emit('plugin.inputController.updatedPreset', presetIn);
      });

    }
  };

  
  window.Cockpit.plugins.push(inputConfigurator.InputConfigurator);
}(window, document)); 

// (function (window, $, undefined) {
//   'use strict';
//   const plugin = 'plugin.inputConfigurator';

//   var InputConfigurator;
//   InputConfigurator = function InputConfigurator(cockpit) {
//     console.log('Loading InputConfigurator in the browser.');
//     this.cockpit = cockpit;
//     var self = this;
//     self.settings = undefined;

//     self.rov = self.cockpit.rov.withHistory;

//     self.savingSettings = false;

//   };

//   InputConfigurator.prototype.listen = function listen() {
//     var self = this;

//     self.cockpit.on(plugin + '.updateBinding', function(arg, callback) {
//       var mapping = self.settings.currentMap.find(function(item) { 
//         return item.name == arg.name; 
//       });

//       if( mapping ) {
//         mapping.bindings = arg.bindings;
//         self.savingSettings = true;
//         self.cockpit.rov.emit('plugin.settings-manager.saveSettings', { inputConfigurator: self.settings }, function() {
//           callback();
//           self.savingSettings = false;
//         });

//         // apply to inputConfigurator
//         self.sendToInputController(mapping);
//       }
//       // else handle error?
//     });

//     self.cockpit.on(plugin + '.loadPreset', function(preset, fn) {
//       preset.map.forEach(function(item) {
//         self.sendToInputController(item);
//       });
//       self.settings.currentMap = JSON.parse( JSON.stringify(preset.map)); //clone
//       self.cockpit.emit(plugin + '.currentMap.update', self.settings.currentMap);
//       if (fn) {fn();}
//     });

//     self.cockpit.on(plugin + '.deletePreset', function(preset, fn) {
//       var preset = self.settings.maps.find(function(map) {return map.name == preset.name});
//       if (preset) {
//         var index = self.settings.maps.indexOf(preset);
//         self.settings.maps.splice(index, 1);
//       }
//       self.cockpit.emit(plugin + '.presets.update', self.settings.maps);
//       self.cockpit.rov.emit('plugin.settings-manager.saveSettings', { inputConfigurator: self.settings }, fn);
      
//       if (fn) {fn();}
//     });

//     self.cockpit.on(plugin + '.saveNewPreset', function(presetName, fn){
//         self.settings.maps.push({ name: presetName, map: JSON.parse(JSON.stringify(self.settings.currentMap))})
//         self.cockpit.emit(plugin + '.presets.update', self.settings.maps);
//         self.cockpit.rov.emit('plugin.settings-manager.saveSettings', { inputConfigurator: self.settings }, fn);

//         if (fn) {fn();}
//     });

//     self.cockpit.on(plugin + '.savePreset', function(preset, fn){
//         var preset = self.settings.maps.find(function(map) {return map.name == preset.name});
//         if (preset) {
//           var index = self.settings.maps.indexOf(preset);
//           self.settings.maps.splice(index, 1);
//         }

//         self.settings.maps.push({ name: preset.name, map: JSON.parse(JSON.stringify(self.settings.currentMap))})
//         self.cockpit.emit(plugin + '.presets.update', self.settings.maps);
//         self.cockpit.rov.emit('plugin.settings-manager.saveSettings', { inputConfigurator: self.settings }, fn);

//         if (fn) {fn();} 
//     });

//     self.rov.on('settings-change.inputConfigurator', function (settings) {
//       if (!self.savingSettings) {
//         self.loadSettings(settings.inputConfigurator, function(loadedSettings) {
//           self.settings = loadedSettings;
//           self.cockpit.emit(plugin + '.currentMap.update', loadedSettings.currentMap);
//           self.cockpit.emit(plugin + '.presets.update', loadedSettings.maps);

//           //load mapping into input controller
//           loadedSettings.currentMap.forEach(function(item) {
//             self.sendToInputController(item);
//           });
//         });
//       }
//     });
//   };

//   InputConfigurator.prototype.sendToInputController = function (mapping) {
//     var self = this;
//     var control = { 
//       name: mapping.name, 
//       bindings: {}
//     };
    
//     mapping.bindings.forEach(function(aBinding) {
//       control.bindings[aBinding.name] = aBinding.binding 
//     })
    
//     console.log("Sending update binding call");
//     self.cockpit.emit('InputController.updateBinding', control, function() {  
//       console.log('done');  
//     });
//   };

//   InputConfigurator.prototype.loadSettings = function (settings, loaded) {
//     var self = this;
//     var current = settings.currentMap;
//     var result = settings;

//     //TODO: What happens when another mapping from a new plugin is added after
//     //the default has been generated.  I suspect we need to regenerate the OpenROV default each
//     //time we load.
//     self.loadDefaultMapping(function(defaultMap) {
//       if (current.length == 1 && current[0] === null) { // the default mapping isn't setup as the current map yet.
//         result = { 
//           currentMap: defaultMap, 
//           maps: [
//             { 
//               name: 'OpenROV Default',
//               default: true,
//               map: JSON.parse(JSON.stringify(defaultMap)) 
//             }
//           ]
//         };
//         self.cockpit.rov.emit('plugin.settings-manager.saveSettings', { inputConfigurator: result });
//       }
//       else {
//         result = settings;
//         result.currentMap.forEach(function(mapping) {
//           var defaultItem = defaultMap.find(function(item) {
//             return mapping.name == item.name;
//           });
//           if (defaultItem) { 
//             mapping.description = defaultItem.description;
//             mapping.defaults = defaultItem.defaults; 
//           } // copy description and defaults
//         });
//       }
//       loaded(result);
//     });
//   };

//   InputConfigurator.prototype.loadDefaultMapping = function (callback) {
//     var self = this;
//     self.cockpit.emit('InputController.getCommands', function (commands) {
//       var currentMap = commands.map(function (command) {
//         var result = { name: command.name, bindings: [], description: command.description, defaults: command.defaults };
//         for (var bindingName in command.bindings) {
//           result.bindings.push({ name: bindingName, binding: command.bindings[bindingName] });
//         }
//         return result;
//       });
//       callback(currentMap);
//     });

//   }

//   window.Cockpit.plugins.push(InputConfigurator);
// } (window, jQuery));
