(function () 
{
    'use strict';
    class Preset
    {
        constructor(presetName)
        {
            if(presetName == null)
            {
                console.error("Tried to create a null preset!");
                return;
            }
            
            var self = this;
            console.log("Creating a new preset:", presetName);
            
            self.name = presetName;

            //Initialize the controller handle
            //This is where users can add a controller handle
            self.controllers = new Map();
        };

        //Preset Member functions
        addController(controllerName)
        {
            //Make sure we got a valid controller
            if(controllerName == null)
            {
                console.error("Tried to add a null controller to preset:", this.name);
                return;
            }

            //Make sure it doesn't already exist in our list
            if(controllerExists(this.controllers, controllerName))
            {
                console.error("Controller:", controllerName, "already exists in preset:", this.name,"Delete or update that controller instead of adding it")
                return;
            }

            console.log("Adding controller:", controllerName, "to preset:", this.name);
            
            //Adds a controller to the array of avaiable controllers to bind 
            var inputs = new Map();

            //Add to our existing list
            this.controllers.set(controllerName, inputs);
        };

        addInput(input)
        {
            var self = this;

            //Make sure we got a valid input
            if(input == null)
            {
                console.error("Tried to add an undefined input to preset:", this.name);
                return;
            }

            //Go through the controllers for this input
            input.bindings.forEach(function(binding) {

                //Add the binding
                addBinding(self.controllers, binding);
            });

            console.log(self.controllers);
        };

        doesInputExist(input)
        {
            var self = this;

            //Make sure we got a valid input
            if(input == null)
            {
                console.error("Tried to check if an undefined input exists!");
                return;
            }

            var inputController = input.controller;

            //Check this controller for this input

        }

        removeController(controllerName)
        {
            //Make sure we got a valid controller
            if(controllerName == null)
            {
                console.error("Tried to remove a null controller to preset:", this.name);
                return;
            }

            //Remove the controller from the list
            this.controllers.delete(controllerName);
        };
    };

    //Private helper functions
    function addBinding(controllers, binding)
    {
        //Make sure we get a valid binding
        if(binding == null)
        {
            console.error("Tried to add an undefined binding");
            return;
        }

        //Check to see if the controller is registered
        if(!controllers.has(binding.controller))
        {
            console.error("Controller:", binding.controller, "is not registered with preset!");
            return;
        }

        //Check to see if the key is registered
        var controller = controllers.get(binding.controller);
        if(controller.has(binding.input))
        {
            console.log("Key:", binding.input, "already exists");
            return;
        }
        else
        {
            //Add the new binding
            controller.set(binding.input, binding.actions);
        }
    }

    function controllerExists(controllers, key)
    {
        return controllers.has(key);
    };

    var systemPlugins = namespace('systemPlugin');
    systemPlugins.inputController.Preset = Preset;

})();