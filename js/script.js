/**
 * Script to initialize a Leaflet map and load the Dutch BAG wfs layer based on the users screen location on the map
 * 
 */



/**
 * 1. Initialize CRS, map and background layers
 */


// initialize Dutch RDnew CRS
var RDnew = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs";

// initialize WGS84 CRS
var WGS84 = "WGS84";

// initialize the map
var map = L.map('map').setView([52.3667, 4.9000], 14);


// load a background tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

// BAG wms layer
var pand_wms = L.tileLayer.wms("https://geodata.nationaalgeoregister.nl/bag/wms/v1_1?request=getCapabilities&service=WMS", {
    layers: 'pand',
    format:'image/png',
    transparent: true
});
pand_wms.addTo(map);

// initialize bag layer group for wfs
var bag_layer = L.layerGroup();



/**
 * 2. Load wfs overlay layer based on zoom level and bounding box of screen
 */


// zoom level required for wfs layer to load
var load_wfs_zoom = 18;

// call function 'load_wfs' after interaction/move with map ends
map.on('moveend', load_wfs);


// load BAG wfs layer
function load_wfs() {
    bag_layer.clearLayers();
    // check if zoom level is at required zoom level
    if (map.getZoom() >= load_wfs_zoom) {
        var url = 'https://geodata.nationaalgeoregister.nl/bag/wfs?';
        var params = 'request=GetFeature&';
            params += 'service=WFS&';
            params += 'typeName=bag:pand&';
            params += 'count=500&';
            params += 'outputFormat=json&';
            params += 'srsName=EPSG:4326&';
            params += 'bbox=';
            params += proj4(WGS84, RDnew, [map.getBounds()._southWest.lng,map.getBounds()._southWest.lat]).toString();
            params += ',';
            params += proj4(WGS84, RDnew, [map.getBounds()._northEast.lng,map.getBounds()._northEast.lat]).toString();

        $.getJSON(url + params, function(data) {
            $.each(data.features, function(index, geometry) {
                L.geoJson(geometry, {
                    onEachFeature: onEachFeature
                }).addTo(bag_layer);
                bag_layer.addTo(map);
            });
        });
    } else {
        console.log("please zoom in to see the polygons! Currenct zoom level:", map.getZoom(), ", Required zoom level:", load_wfs_zoom);
    }
}

// attributes in popup when clicked
function onEachFeature(feature, layer) {
    layer.bindPopup(
        '<br><strong>ID:</strong> ' + feature.properties.identificatie.toString() 
    );
}