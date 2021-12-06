// Store our API endpoint inside queryUrl

var queryUrl =   "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Perform a GET request to the query URL
myMap=""
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  
  earthquakeData=data.features;
  var myMap = L.map("map", {
    center: [
      30.09, -65.71
    ],
    zoom: 3.5
  });
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  var earthquakes = new L.LayerGroup();

  for(i=0;i<earthquakeData.length;i++) {
    color="";
      // Loop through the cities array and create one marker for each city object
    color=getColor(earthquakeData[i]["properties"]["mag"]); 
    // Add circles to map
    // console.log("latitude/longitude: ",earthquakeData[i]["geometry"]["coordinates"], "color:", color);
    // console.log("latitude: ", earthquakeData[i]["geometry"]["coordinates"][0]," longitude: ", earthquakeData[i]["geometry"]["coordinates"][1]);
    coordinates=[];
    coordinates[1]=earthquakeData[i]["geometry"]["coordinates"][0];
    coordinates[0]=earthquakeData[i]["geometry"]["coordinates"][1];
    // console.log("coordinates: ",coordinates);
    // console.log("radius: ",earthquakeData[i]["properties"]["mag"] * 1500 *.5);
    L.circle(coordinates, {
      fillOpacity: 0.5,
      color: "white",
      fillColor: color,
      // Adjust radius
      radius: earthquakeData[i]["properties"]["mag"] * 15000 
    }).bindPopup("<h3>" + earthquakeData[i]["properties"]["place"] +
    "</h3><hr><p>" + new Date(earthquakeData[i]["properties"]["time"]) + "</p>" + 
    "<p>" + "Magnitude: " + earthquakeData[i]["properties"]["mag"] + "</p>").addTo(earthquakes);
  }
  
  // Add legend to map
  var legend = L.control({position: 'bottomright'});
  category_values=[0.5, 1.5,2.5,3.5,4.5,5.5];

  legend.onAdd = function (myMap) {

      var div = L.DomUtil.create('div', 'info legend'),
          categories = ['0-1','1-2','2-3','3-4','4-5','5+'],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      div.innerHTML = '';
      for (var i = 0; i < categories.length; i++) {
              
        labels.push(
          '<i class = "rectangle" style="background:' + getColor(category_values[i]) + '"></i> ' +
          (categories[i] ? categories[i] : '+'));
      }
      div.innerHTML = labels.join('<br>');
      return div;
  };

legend.addTo(myMap);

// Use this link to get the geojson data.
var link = "data/PB2002_boundaries.json";   

// Grabbing our GeoJSON data..
var faultlines = new L.LayerGroup();

d3.json(link).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data).addTo(faultlines);

var baseLayers = {
  "Satellite" : satellite,
  "Grayscale" : darkmap,
  "Outdoors" :  streetmap
};

var overlays = {
  "Earthquakes" : earthquakes,
  "Fault Lines" : faultlines
};

L.control.layers(baseLayers, overlays, {collapsed: false}).addTo(myMap);

});

});


// Create a colour based on the magnitude
function getColor(magnitude) {
  switch (true) {
    case magnitude < 1:
      return "#99FF66";
    case magnitude < 2:
      return "#EAFF80";  
    case magnitude < 3:
      return "#FFE14D";  
    case magnitude < 4:
      return "#FFB319";
    case magnitude < 5:
    return "#CC6600";  
    default:
      return "red";  
  }
}
