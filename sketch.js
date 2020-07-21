let inputImg, currentImg, inputCanvas, output, statusMsg, pix2pix, transferBtn, modelReady = false, isTransfering = false; 

let annotationToggle = true;
        
var canvas = document.getElementById('canvas');

function setup(){   
    output = select('#output');
    statusMsg = select('#status');
    transferBtn = select('#transferBtn');
    
    pixelDensity(1);
    pix2pix = ml5.pix2pix('models/model-8800.meta', modelLoaded);
}

function draw(video, context, width, height){
    var image, data, i, r1, g1, b1;
    image = context.getImageData(0,0,width,height);
    data = image.data;
            
    context.beginPath();    
    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0, 0, 512, 512);
}

function modelLoaded() { 
    modelReady = true;
    statusMsg.html('Model Loaded!');
    transfer();
    transferBtn.mousePressed(function(){ 
        var inputData = context.toDataURL();
        inputData.class('border-box').parent('input');   
        inputImg = loadImage(inputData, drawImage);
        currentImg = inputImg;
        transfer(); 
    });   
}
    
function drawImage() {
    image(inputImg,0,0, 256, 256);
}

function transfer() {
    statusMsg.html('Transfering...');
    isTransfering = true;
    const canvasElement = select('canvas').elt;
    // Apply pix2pix transformation
    pix2pix.transfer(canvasElement, function(err, result) {
        if (err) {
            console.log(err);
        }
        if (result && result.src) {
            statusMsg.html('Done!');
            isTransfering = false;    
            output.elt.src = result.src;
        }
    });
}











// This example is compatible with any ShapeDiver model ticket.

// ShapeDiver Viewer Initialisation
var initSdvApp = function(/*event*/) {
  // Settings can be defined here, or as attributes of the viewport container. Settings defined here take precedence.
  let _container = document.getElementById('sdv-container'); 
  let settings = {
    container: _container,
    ticket: "ba8b8e837d6a56bbcf4c9855da8ef812ca66ae015dcb339e1ed99aa042ba7e1d8c1a3cfe78f714dac31817e04ecc02e3ebcb288703fe02d2153fa09431ec66145ec26b951d7a32db7268b42416d4c73fd8090f8812f4137ac5af1c736c9f71362ba4b2cefbdc247aff9385e28d7edc42b962a42a7597-3cd5d6d5e0139f789bdb8c9539203ae6",
    modelViewUrl: "eu-central-1",
    showControlsInitial: true,
    showSettingsInitial: false,
  };
  // See https://viewer.shapediver.com/v2/2.14.0/doc/SDVApp.ParametricViewer.html for all settings available via the constructor.
  window.api = new SDVApp.ParametricViewer(settings);

  let viewerInit = false;
  let parameters;
  // VISIBILITY_ON is triggered after each scene update. We wait for the first time it is triggered to make sure the scene and parameters are ready.
  api.scene.addEventListener(api.scene.EVENTTYPE.VISIBILITY_ON, function() {
    if (!viewerInit) {
      var globalDiv = document.getElementById("parameters");
      parameters = api.parameters.get();
      parameters.data.sort(function(a, b) {
        return a.order - b.order;
      });
      console.log(parameters.data);
      for (let i = 0; i < parameters.data.length; i++) {
        let paramInput = null;
        let paramDiv = document.createElement("div");
        let param = parameters.data[i];
        let label = document.createElement("label");
        label.setAttribute("for", param.id);
        label.innerHTML = param.name;
        if (param.type == "Int" || param.type == "Float" || param.type == "Even" || param.type == "Odd") {
          paramInput = document.createElement("input");
          paramInput.setAttribute("id", param.id);
          paramInput.setAttribute("type", "range");
          paramInput.setAttribute("min", param.min);
          paramInput.setAttribute("max", param.max);
          paramInput.setAttribute("value", param.value);
          if (param.type == "Int") paramInput.setAttribute("step", 1);
          else if (param.type == "Even" || param.type == "Odd") paramInput.setAttribute("step", 2);
          else paramInput.setAttribute("step", 1 / Math.pow(10, param.decimalplaces));
          paramInput.onchange = function() {
            api.parameters.updateAsync({
              id: param.id,
              value: this.value
            });
          };
        } else if (param.type == "Bool") {
          paramInput = document.createElement("input");
          paramInput.setAttribute("id", param.id);
          paramInput.setAttribute("type", "checkbox");
          paramInput.setAttribute("checked", param.value);
          paramInput.onchange = function() {
            console.log(this);
            api.parameters.updateAsync({
              id: param.id,
              value: this.checked
            });
          };
        } else if (param.type == "String") {
          paramInput = document.createElement("input");
          paramInput.setAttribute("id", param.id);
          paramInput.setAttribute("type", "text");
          paramInput.setAttribute("value", param.value);
          paramInput.onchange = function() {
            api.parameters.updateAsync({
              id: param.id,
              value: this.value
            });
          };
        } else if (param.type == "Color") {
          paramInput = document.createElement("input");
          paramInput.setAttribute("id", param.id);
          paramInput.setAttribute("type", "color");
          paramInput.setAttribute("value", param.value);
          paramInput.onchange = function() {
            api.parameters.updateAsync({
              id: param.id,
              value: this.value
            });
          };
        } else if (param.type == "StringList") {
          paramInput = document.createElement("select");
          paramInput.setAttribute("id", param.id);
          for (let j = 0; j < param.choices.length; j++) {
            let option = document.createElement("option");
            option.setAttribute("value", j);
            option.setAttribute("name", param.choices[j]);
            option.innerHTML = param.choices[j];
            if (param.value == j) option.setAttribute("selected", "");
            paramInput.appendChild(option);
          }
          paramInput.onchange = function() {
            api.parameters.updateAsync({
              id: param.id,
              value: this.value
            });
          };
        }
        if (param.hidden) paramDiv.setAttribute("hidden", "");
        paramDiv.appendChild(label);
        paramDiv.appendChild(paramInput);
        globalDiv.appendChild(paramDiv);
      }

      var exports = api.exports.get();
      for (let i = 0; i < exports.data.length; i++) {
        let exportAsset = exports.data[i];
        let exportDiv = document.createElement("div");
        let exportInput = document.createElement("input");
        exportInput.setAttribute("id", exportAsset.id);
        exportInput.setAttribute("type", "button");
        exportInput.setAttribute("name", exportAsset.name);
        exportInput.setAttribute("value", exportAsset.name);
        exportInput.onclick = function() {
          api.exports.requestAsync({
            id: this.id
          }).then(
            function(response) {
              let link = response.data.content[0].href;
              window.location = link;
            }
          );
        };
        exportDiv.appendChild(exportInput);
        globalDiv.appendChild(exportDiv);
      }
      viewerInit = true;
    }
  });
};

// there is a slight chance that loading has been completed already
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSdvApp, false);
} else {
  initSdvApp();
}

