setCursors = () => {

    let message;
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
          if (!`${key}`.includes('img') && !`${key}`.includes('url')) {
            tooltip_msg += `${key}: ${value}<br/>`
          }
        }
      }

      // Populate the popup and set its coordinates based on the feature found.
      popup.setLngLat(coordinates)
        .setHTML(tooltip_msg)
        .addTo(map)
    })

    map.on('mouseleave', 'points', function () {
      map.getCanvas().style.cursor = cursorMode
      popup.remove()
    })
  }

  populateModal = (data, opts) => {

    if (document.getElementById('trails_title')) {
      document.getElementById('trails_title').remove()
    }

    if (document.getElementById('trails_ol')) {
      document.getElementById('trails_ol').remove()
    }

    let title = document.createElement('h1');
    title["id"] = "trails_title"

    if (data.length > 0) {

      if (opts["city"] && opts["state_abbrev"]) {
        title.appendChild(document.createTextNode(`Trails for the city: ${opts["city"]}, ${opts["state_abbrev"].toUpperCase()}`))
      }
      else if (opts["latitude"] && opts["longitude"]) {
        title.appendChild(document.createTextNode(`Trails for the coords: ${opts["latitude"].toFixed(2)}, ${opts["longitude"].toFixed(2)}`))
      }

      let list = document.createElement('ol');
      list["id"] = "trails_ol"
      data.forEach((trail) => {
        let item = document.createElement('li')
        item.innerHTML = `<a href='${trail["url"]}' target='_blank'>${trail["name"]}</a> - ${trail["location"]} - ${trail["summary"]}`
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

  getFeatureCollection = (data) => {

    var featureCollection = [];

    if (data.length > 0) {
      data.forEach(function (trail) {
        coordinates = new Array()
        coordinates.push(parseFloat(trail["longitude"]))
        coordinates.push(parseFloat(trail["latitude"]))
        featureCollection.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": coordinates
          },
          "properties": {
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
            "conditionDate": trail["conditionDate"]
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
        'circle-radius': 4,
        'circle-color': '#0072ff'
      }
    })
  }

  ///////////////////////////////////////////

  displayTrailsByLatLng = async (e) => {
    let lng = e.lngLat.lng
    let lat = e.lngLat.lat
    let api_url = `${url_prefix}/trails/${lat}/${lng}/5/15`
    document.getElementById('loading').style.visibility = 'visible'
    let data = await fetch(api_url).then(r => r.json())
    document.getElementById('loading').style.visibility = 'hidden'
    populateModal(data, { "latitude": lat, "longitude": lng })
    clearMapData(map)
    addSource(map, getFeatureCollection(data))
    addPointsLayer(map)
    map.flyTo({ center: [lng, lat], essential: true, zoom: 10 })
  }