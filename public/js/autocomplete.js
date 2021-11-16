var autocomplete = (options) => {
  var doc = document,
    data = options.data,
    contEl = options.container,
    resultNodes = contEl.getElementsByTagName('A'),
    cache = {},
    handlers = {
      'enter': async (e) => {
        e.preventDefault()
        populate(e.target.innerHTML)//enter on selection from autocomplete
        if (e.target.parentNode === contEl && contEl.children[0].value) {
          populate(contEl.children[0].value)//enter when just typing in a city and pressing enter
        }
      },
      'up': (e) => {
        e.preventDefault()
        if (e.target.previousElementSibling && e.target.previousElementSibling.hasAttribute('href')) {
          e.target.previousElementSibling.focus()
        } else if (!e.target.previousElementSibling && e.target.parentNode === contEl.lastElementChild) {
          contEl.children[0].focus()
        }
      },
      'down': (e) => {
        e.preventDefault()
        if (e.target === contEl.children[0]) {
          contEl.lastElementChild.children[0].focus()
        } else if (e.target.nextElementSibling && e.target.nextElementSibling.hasAttribute('href')) {
          e.target.nextElementSibling.focus()
        }
      },
      'input': (e) => {
        var val = e.target.value.trim().replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
        return val ? insert(cacheFn(val, check)) : insert()
      }
    }

  setEls = () => {
    var wrapEl = contEl.querySelectorAll('.ac-results-wrapper')[0]
    var i = options.numResults
    while (i--) {
      var anchorEl = document.createElement('a')
      anchorEl.href = '#'
      anchorEl.innerHTML = 'a'
      wrapEl.appendChild(anchorEl)
    }
  }

  cacheFn = (q, fn) => {
    return cache[q] ? cache[q] : cache[q] = fn(q), cache[q]
  }

  check = (q) => {
    i = data.length
    testFn = (obj) => {
      var j = obj.tags.length
      while (j--) {
        if (obj.tags[j].toLowerCase().startsWith(q.toLowerCase())) {
          arr.push({
            'tag': obj.tags[j]
          })
        }
      }
    }
    arr = []
    while (i--) {
      testFn(data[i])
    }
    return arr
  }

  insert = async (d) => {
    var i = options.numResults
    while (i--) {
      if (d && d[i]) {
        resultNodes[i].style.display = 'block'
        resultNodes[i].firstChild.nodeValue = d[i].tag
        resultNodes[i].href = options.directPath + encodeURIComponent(d[i].tag)
        resultNodes[i].onclick = async (e) => {
          //console.log('city clicked')
          e.preventDefault()
          let cityStateRaw = e.target.innerHTML
          populate(cityStateRaw)
        }
      } else if (!d || !d[i]) {
        resultNodes[i].style.display = 'none'
      }
    }
  }

  multiHandler = (e) => {
    document.getElementsByClassName('ac-results-wrapper')[0].style.display = 'block'
    var k = e.keyCode,
      //assign a value to k if the up, down enter keys are pressed, or if the event is an input
      meth = k === 13 ? 'enter' : k === 38 ? 'up' : k === 40 ? 'down' : e.type === 'input' ? 'input' : null
    //if 'meth' was assigned a value earlier, return the associated function and pass the event to it
    return meth ? handlers[meth](e) : null
  }

  changeHandler = (e) => {
    window.setTimeout(() => {
      return doc.activeElement.parentNode === contEl || doc.activeElement.parentNode === contEl.lastElementChild ? null : insert()
    }, 50)
  }

  populate = async (cityStateRaw) => {
    if (cityStateRaw.includes(',')) {
      let cityRaw = cityStateRaw.split(',')[0].trim()
      let cityUrlified = URLify(cityRaw.toLowerCase())
      let stateAbbrev = cityStateRaw.split(',')[1].trim().toLowerCase()

      let apiUrl = `${url_prefix}cities/${cityUrlified}/${stateAbbrev}/trails?limit=10`
      apiUrl = `http://138.68.23.63:3000/cities/${cityUrlified}/${stateAbbrev}/trails?limit=10`

      console.log('apiUrl', apiUrl)

      setSpinnerVisibilityTo('visible')
      let mapData = await fetch(apiUrl).then(r => r.json())
      setSpinnerVisibilityTo('hidden')

      trailsArray = getTrailObjectsFrom(mapData)
      populateModalFrom(trailsArray, { "city": cityRaw, "state_abbrev": stateAbbrev })
      clearMapData(map)
      addSource(map, getFeatureCollectionFrom(trailsArray))
      addPointsLayer(map)
      setTrailLabels()

      if (trailsArray.length > 0) map.flyTo({ center: [trailsArray[0]['longitude'], trailsArray[0]['latitude']], essential: true, zoom: 10 })

      document.getElementById("input_search").value = cityStateRaw
      document.getElementsByClassName('ac-results-wrapper')[0].style.display = 'none'
    }
  }

  setEls()
  contEl.addEventListener('input', multiHandler)
  contEl.addEventListener('keydown', multiHandler)
  contEl.querySelectorAll('.search-button')[0].addEventListener('click', handlers.enter)
  contEl.firstElementChild.addEventListener('change', changeHandler)
}