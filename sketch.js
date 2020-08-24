// ShapeDiver Viewer Initialisation
var initSdvApp = function(/*event*/) {
  // Settings can be defined here, or as attributes of the viewport container. Settings defined here take precedence.
  let _container = document.getElementById('sdv-container'); 
  let settings = {
    container: _container,
    ticket: "237911c1b27eb729677f17d526320e8042c234b07f8d98c560a5389a0a617d9bf769c0edb13e59952cb32f0524a11a80c8854c9122b1280dfdc63c004d500c2de5c7b2439715682864514832059e86e2a75cbc615a92ffaaa84c401f6b76e64fc9d30fa1ae3734dc1fc7a9bb9f089bce57ad4ef3cfce-275bf90bdc942e21aae79e958739d366",
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











let inputImg, currentImg, inputCanvas, output, statusMsg, pix2pix, transferBtn, modelReady = false, isTransfering = false; 

let annotationToggle = true;
 
var sdv_ = document.querySelector("#sdv-container");
var canvas = document.getElementById('canvas');
var context= canvas.getContext('2d');


function setup(){   

    output = select('#output');
    statusMsg = select('#status');

    transferBtn = select('#transferBtn');
    pix2pix = ml5.pix2pix('model/model.pict', modelLoaded);
    
}

function draw(context, width, height){

}


function modelLoaded() { 
    statusMsg.html('Model Loaded!');
    transferBtn.mousePressed(function(){ 

      transfer();

  });
}
    
function drawImage() {
      image(inputImg,0,0, 256, 256);
}

function transfer() {
    statusMsg.html('Transfering...');
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


html2canvas(document.querySelector("#capture")).then(canvas => {
  document.body.appendChild(canvas)
});


(function (exports) {    
  function urlsToAbsolute(nodeList) {    
      if (!nodeList.length) {    
          return [];    
      }    
      var attrName = 'href';    
      if (nodeList[0].__proto__ === HTMLImageElement.prototype || nodeList[0].__proto__ ===         
       HTMLScriptElement.prototype) {    
          attrName = 'src';    
      }    
      nodeList = [].map.call(nodeList, function (el, i) {    
          var attr = el.getAttribute(attrName);    
          if (!attr) {    
              return;    
          }    
          var absURL = /^(https?|data):/i.test(attr);    
          if (absURL) {    
              return el;    
          } else {    
              return el;    
          }    
      });    
      return nodeList;    
  }    

  function screenshotPage() {    
      urlsToAbsolute(document.images);    
      urlsToAbsolute(document.querySelectorAll("link[rel='stylesheet']"));    
      var screenshot = document.documentElement.cloneNode(true);    
      var b = document.createElement('base');    
      b.href = document.location.protocol + '//' + location.host;    
      var head = screenshot.querySelector('head');    
      head.insertBefore(b, head.firstChild);    
      screenshot.style.pointerEvents = 'none';    
      screenshot.style.overflow = 'hidden';    
      screenshot.style.webkitUserSelect = 'none';    
      screenshot.style.mozUserSelect = 'none';    
      screenshot.style.msUserSelect = 'none';    
      screenshot.style.oUserSelect = 'none';    
      screenshot.style.userSelect = 'none';    
      screenshot.dataset.scrollX = window.scrollX;    
      screenshot.dataset.scrollY = window.scrollY;    
      var script = document.createElement('script');    
      script.textContent = '(' + addOnPageLoad_.toString() + ')();';    
      screenshot.querySelector('body').appendChild(script);    
      var blob = new Blob([screenshot.outerHTML], {    
          type: 'text/html'    
      });    
      return blob;    
  }    

  function addOnPageLoad_() {    
      window.addEventListener('DOMContentLoaded', function (e) {    
          var scrollX = document.documentElement.dataset.scrollX || 0;    
          var scrollY = document.documentElement.dataset.scrollY || 0;    
          window.scrollTo(scrollX, scrollY);    
      });    
  }    

  function generate() {    
      window.URL = window.URL || window.webkitURL;    
      window.open(window.URL.createObjectURL(screenshotPage()));    
  }    
  exports.screenshotPage = screenshotPage;    
  exports.generate = generate;    
})(window);    
  
