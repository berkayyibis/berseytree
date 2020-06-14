
var baseMapLayer = new ol.layer.Tile({
  source: new ol.source.OSM()
});
var layer = new ol.layer.Tile({
source: new ol.source.OSM()
});

var center = ol.proj.fromLonLat([35,40]);
var view = new ol.View({
center: center,
zoom: 6
});
var map = new ol.Map({
  target: 'map',
  view: view,
  layers: [layer]
});




var styles = [];

styles['default'] = new ol.style.Style({
  image: new ol.style.Icon({
    anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: 0.5,
    src: '/images/kok3.png'
  })
});

styles['palm'] = new ol.style.Style({
image: new ol.style.Icon({
  anchor: [1, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: 0.5,
  src: '/images/oak2.png'
})
});
styles['oak'] = new ol.style.Style({
image: new ol.style.Icon({
  anchor: [1, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: 0.7,
  src: '/images/kavak2.png'
})
});
styles['pine'] = new ol.style.Style({
image: new ol.style.Icon({
  anchor: [1, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale: 0.5,
  src: '/images/cam3.png'
})
});

var vectorSource = new ol.source.Vector({
      url:"/api/data",
      format: new ol.format.GeoJSON({ featureProjection: "EPSG:4326" })  
});

var markerVectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: function(feature, resolution){
          var type = feature.getProperties().tree_type;

          if(type == 'Çam Ağacı'){
            return styles['pine'];
          }else if(type == 'Kavak Ağacı'){
            return styles['oak'];
            }else if(type == 'Mese Ağacı'){
            return styles['palm'];
          }else{
            return styles['default'];
          }
      }

});

map.addLayer(markerVectorLayer);
document.getElementById('export-png').addEventListener('click', function() {
  map.once('rendercomplete', function() {
    var mapCanvas = document.createElement('canvas');
    var size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    var mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(document.querySelectorAll('.ol-layer canvas'), function(canvas) {
      if (canvas.width > 0) {
        var opacity = canvas.parentNode.style.opacity;
        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
        var transform = canvas.style.transform;
        // Get the transform parameters from the style's transform matrix
        var matrix = transform.match(/^matrix\(([^\(]*)\)$/)[1].split(',').map(Number);
        // Apply the transform to the export map context
        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
        mapContext.drawImage(canvas, 0, 0);
      }
    });
    if (navigator.msSaveBlob) {
      // link download attribuute does not work on MS browsers
      navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
    } else {
      var link = document.getElementById('image-download');
      link.href = mapCanvas.toDataURL();
      link.click();
    }
  });
  map.renderSync();
});

var select = new ol.interaction.Select({multiple:false});
select.on('select', fnHandler);
map.addInteraction(select);
map.on("click",handleMapClick);
function handleMapClick(evt)
{
var coord=ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
document.getElementById("Latitude").value=coord[1];
document.getElementById("Longitude").value=coord[0];
}

function fnHandler(e)
{
  var coord = e.mapBrowserEvent.coordinate;
  let features = e.target.getFeatures();
  features.forEach( (feature) => {
      console.log(feature.getProperties().tree_type);
  


  document.getElementById("tree_type").value=feature.getProperties().tree_type;
  document.getElementById("height").value=feature.getProperties().tree_height;
  document.getElementById("age").value=feature.getProperties().age;
  });
  if (e.selected[0])
  {
  var coords=ol.proj.transform(e.selected[0].getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
  document.getElementById("Latitude").value=coords[1];
  document.getElementById("Longitude").value=coords[0];
  console.log(coords);
  }
}

function submit()
{
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/post", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    var data=JSON.stringify({

        Latitude: document.getElementById('Latitude').value,
        Longitude: document.getElementById('Longitude').value,
        tree_type: document.getElementById('tree_type').value,
        tree_height:document.getElementById('height').value,
        age:document.getElementById('age').value,
    });
    xhr.send(data);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          location.reload();
          console.log(xhr.responseText);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    
    
}

