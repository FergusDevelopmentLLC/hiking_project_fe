let trailsArray = []

setCursors = () => {

  let message

  if (cursorMode == 'pointer') {
    document.getElementById('pointer').style.display = "none"
    document.getElementById('crosshair').style.display = "block"
    message = "Or, click the <strong>crosshair</strong> to search by specific location"
  }
  else {
    document.getElementById('pointer').style.display = "block"
    document.getElementById('crosshair').style.display = "none"
    message = "Or, click the <strong>pointer</strong> to pan the map"
  }

  document.getElementById('search-subtitle').innerHTML = message
}

handlePopup = () => {

  // Create a popup, but don't add it to the map yet.
  let popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  })

  map.on('mouseenter', 'points', function (e) {

    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer'

    let coordinates = [e.features[0].properties.longitude, e.features[0].properties.latitude]

    // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
    }

    let tooltip_msg = '<strong>Details</strong><br/>'

    for (const feature of e.features) {
      for (let [key, value] of Object.entries(feature.properties)) {
        if (!`${key}`.includes('img') && !`${key}`.includes('url') && !`${key}`.includes('hiking_project_id') && !`${key}`.includes('id')) {
          tooltip_msg += `${key}: ${value}<br/>`
        }
      }
    }

    // Populate the popup and set its coordinates based on the feature found.
    popup.setLngLat(coordinates)
      .setHTML(tooltip_msg)
      .addTo(map)

    hoverMode = 'onTrail'

  })

  map.on('mouseleave', 'points', function () {
    map.getCanvas().style.cursor = cursorMode
    popup.remove()
    hoverMode = 'offTrail'
  })
}

zoomToLatLng = (latitude, longitude) => {
  map.flyTo({ center: [longitude, latitude], essential: true, zoom: 17 })
}

goToDetailView = async (trail_id) => {
  trail = new Trail({})
  trail.id = trail_id

  let apiUrl = `${url_prefix}/trails/${trail.id}`
  let latestTrail =  await fetch(apiUrl).then(r => r.json())
  trail.detail_views = parseInt(latestTrail['detail_views']) + 1
        
  const options = {
    method: 'PATCH',
    headers: new Headers({'content-type': 'application/json'}),
    body: JSON.stringify( { trail: trail } )
  }

  let updatedTrail = await fetch(apiUrl, options).then(r => r.json())
  window.open(updatedTrail['url'])
}

populateModalFrom = (trails, opts) => {

  if (document.getElementById('trails_title')) {
    document.getElementById('trails_title').remove()
  }

  if (document.getElementById('trails_ol')) {
    document.getElementById('trails_ol').remove()
  }

  let title = document.createElement('h1');
  title["id"] = "trails_title"
  if (trails.length > 0) {
    if (opts["city"] && opts["state_abbrev"]) {
      title.appendChild(document.createTextNode(`Trails for the city: ${opts["city"]}, ${opts["state_abbrev"].toUpperCase()}`))
    }
    else if (opts["latitude"] && opts["longitude"]) {
      title.appendChild(document.createTextNode(`Trails for the coords: ${opts["latitude"].toFixed(2)}, ${opts["longitude"].toFixed(2)}`))
    }

    let list = document.createElement('ol');
    list["id"] = "trails_ol"
    trails.forEach((trail) => {
      let item = document.createElement('li')
      item.innerHTML = `<a href="javascript:goToDetailView(${trail["id"]});">${trail["name"]}</a> [views: ${trail["detail_views"]}] - ${trail["location"]} - ${trail["summary"]} - <a href="javascript:zoomToLatLng(${trail["latitude"]}, ${trail["longitude"]});">zoom to trail</a>`
      list.appendChild(item);
    })
    document.getElementById('modal').appendChild(title)
    document.getElementById('modal').appendChild(list)
  }
  else {
    if (opts["city"] && opts["state_abbrev"]) {
      title.appendChild(document.createTextNode(`No trails found for: ${opts["city"]}, ${opts["state_abbrev"].toUpperCase()}`))
    }
    else if (opts["latitude"] && opts["longitude"]) {
      title.appendChild(document.createTextNode(`Trails for the coords: ${opts["latitude"].toFixed(2)}, ${opts["longitude"].toFixed(2)}`))
    }
    document.getElementById('modal').appendChild(title)
  }
  document.getElementById('modal').style.display = "block"
}

addSource = (map, featureCollection) => {
  map.addSource('points', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': featureCollection
    }
  });
}

getFeatureCollectionFrom = (trailsArray) => {

  var featureCollection = [];

  if (trailsArray.length > 0) {
    trailsArray.forEach((trail) => {
      featureCollection.push({
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [ parseFloat(trail["longitude"]), parseFloat(trail["latitude"]) ]
        },
        "properties": {
          "id": trail["id"],
          "hiking_project_id": trail["hiking_project_id"],
          "name": trail["name"],
          "length": trail["length"],
          "summary": trail["summary"],
          "stars": trail["stars"],
          "starVotes": trail["starVotes"],
          "location": trail["location"],
          "imgSqSmall": trail["imgSqSmall"],
          "imgSmall": trail["imgSmall"],
          "imgSmallMed": trail["imgSmallMed"],
          "imgMedium": trail["imgMedium"],
          "difficulty": trail["difficulty"],
          "ascent": trail["ascent"],
          "descent": trail["descent"],
          "high": trail["high"],
          "low": trail["low"],
          "longitude": trail["longitude"],
          "latitude": trail["latitude"],
          "url": trail["url"],
          "conditionStatus": trail["conditionStatus"],
          "conditionDetails": trail["conditionDetails"],
          "conditionDate": trail["conditionDate"],
          "detail_views": trail["detail_views"]
        }
      });
    })
  }

  return featureCollection;
}

clearMapData = (map) => {
  if (map.getLayer("points")) {
    map.removeLayer("points");
  }

  if (map.getSource("points")) {
    map.removeSource("points");
  }
}

addPointsLayer = (map) => {
  map.addLayer({
    'id': 'points',
    'type': 'circle',
    'source': 'points',
    'paint': {
      'circle-radius': 5,
      'circle-color': '#e6550d'
    }
  })
}

getTrailObjectsFrom = (mapData) => {
  let returnArray = []
  mapData.forEach((t) => {
    returnArray.push(new Trail(t))
  })
  return returnArray
}

setSpinnerVisibilityTo = (state) => {
  document.getElementById('loading').style.visibility = state
}

displayTrailsByLatLng = async (e) => {
  let lng = e.lngLat.lng
  let lat = e.lngLat.lat
  let apiUrl = `${url_prefix}/trails/${lat}/${lng}/5/15`

  setSpinnerVisibilityTo('visible')
  let mapData = await fetch(apiUrl).then(r => r.json())
  setSpinnerVisibilityTo('hidden')

  trailsArray = getTrailObjectsFrom(mapData)
  
  populateModalFrom(trailsArray, { "latitude": lat, "longitude": lng })
  clearMapData(map)
  addSource(map, getFeatureCollectionFrom(trailsArray))
  addPointsLayer(map)
  
  map.flyTo({ center: [lng, lat], essential: true, zoom: 10 })
}

switchLayer = () => {
  let basemap = 'outdoors-v11'
  if (document.getElementById('satellite-v9').checked) {
    basemap = 'satellite-v9'
  }
  map.setStyle(`mapbox://styles/mapbox/${basemap}`)
}