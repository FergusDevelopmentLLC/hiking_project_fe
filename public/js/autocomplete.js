    var autocomplete = function (options) {
      var doc = document,
        data = options.data,
        contEl = options.container,
        resultNodes = contEl.getElementsByTagName('A'),
        cache = {},
        handlers = {
          'enter': async function (e) {
            e.preventDefault()
            //TODO: refactor
            let city_state_raw = e.target.innerHTML
            if (city_state_raw.includes(',')) {
              let city_raw = city_state_raw.split(',')[0].trim()
              let city_urlified = URLify(city_raw.toLowerCase())
              let state_abbrev = city_state_raw.split(',')[1].trim().toLowerCase()
              let api_url = `${url_prefix}/cities/${city_urlified}/${state_abbrev}/trails?limit=15`

              document.getElementById('loading').style.visibility = 'visible'  
              let data = await fetch(api_url).then(r => r.json())
              document.getElementById('loading').style.visibility = 'hidden'
              
              populateModal(data, { "city": city_raw, "state_abbrev": state_abbrev })
              clearMapData(map)
              addSource(map, getFeatureCollection(data))
              addPointsLayer(map)
              
              if (data.length > 0) map.flyTo({ center: [data[0]['longitude'], data[0]['latitude']], essential: true, zoom: 10 })
              document.getElementById("input_search").value = city_state_raw

              document.getElementsByClassName('ac-results-wrapper')[0].style.display = 'none'

              if (e.target.parentNode === contEl && contEl.children[0].value) {
                //TODO: when does it ever get here?
                window.location = options.searchPath + encodeURIComponent(contEl.children[0].value)
              }
            }
          },
          'up': function (e) {
            e.preventDefault();
            if (e.target.previousElementSibling && e.target.previousElementSibling.hasAttribute('href')) {
              e.target.previousElementSibling.focus();
            } else if (!e.target.previousElementSibling && e.target.parentNode === contEl.lastElementChild) {
              contEl.children[0].focus();
            }
          },
          'down': function (e) {
            e.preventDefault();
            if (e.target === contEl.children[0]) {
              contEl.lastElementChild.children[0].focus();
            } else if (e.target.nextElementSibling && e.target.nextElementSibling.hasAttribute('href')) {
              e.target.nextElementSibling.focus();
            }
          },
          'input': function (e) 
          {
            var val = e.target.value.trim().replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            return val ? insert(cacheFn(val, check)) : insert();
          }
        };

      function setEls() {
        var wrapEl = contEl.querySelectorAll('.ac-results-wrapper')[0];
        var i = options.numResults;
        while (i--) {
          var anchorEl = document.createElement('a');
          anchorEl.href = '#';
          anchorEl.innerHTML = 'a';
          wrapEl.appendChild(anchorEl);
        }
      }

      function cacheFn(q, fn) {
        return cache[q] ? cache[q] : cache[q] = fn(q), cache[q];
      }

      function check(q) {
        
        i = data.length
        
        function testFn(obj) {
          var j = obj.tags.length;
          while (j--) {
            if (obj.tags[j].toLowerCase().startsWith(q.toLowerCase())) {
              arr.push({
                'tag': obj.tags[j]
              });
            }
          }
        }
        
        arr = []
        
        while (i--) {
          testFn(data[i]);
        }
        
        return arr;
      }

      async function insert(d) {
        var i = options.numResults;
        while (i--) {
          if (d && d[i]) {
            resultNodes[i].style.display = 'block'
            resultNodes[i].firstChild.nodeValue = d[i].tag
            resultNodes[i].href = options.directPath + encodeURIComponent(d[i].tag)
            resultNodes[i].onclick = async (e) => {

              //TODO refactor
              e.preventDefault()
              let city_state_raw = e.target.innerHTML
              let city_raw = city_state_raw.split(',')[0].trim()
              let city_urlified = URLify(city_raw.toLowerCase())
              let state_abbrev = city_state_raw.split(',')[1].trim().toLowerCase()
              let api_url = `${url_prefix}/${city_urlified}/${state_abbrev}/trails?limit=15`

              document.getElementById('loading').style.visibility = 'visible'  
              let data = await fetch(api_url).then(r => r.json())
              document.getElementById('loading').style.visibility = 'hidden'
              
              populateModal(data, { "city": city_raw, "state_abbrev": state_abbrev })
              clearMapData(map)
              addSource(map, getFeatureCollection(data))
              addPointsLayer(map)

              if (data.length > 0) map.flyTo({ center: [data[0]['longitude'], data[0]['latitude']], essential: true, zoom: 10 })
              document.getElementById("input_search").value = city_state_raw

              document.getElementsByClassName('ac-results-wrapper')[0].style.display = 'none';

            }
          } else if (!d || !d[i]) {
            resultNodes[i].style.display = 'none';
          }
        }
      }

      function multiHandler(e) {
        
        //TODO: redo this
        document.getElementsByClassName('ac-results-wrapper')[0].style.display = 'block';

        var k = e.keyCode,
          //assign a value to k if the up, down enter keys are pressed, or if the event is an input
          meth = k === 13 ? 'enter' : k === 38 ? 'up' : k === 40 ? 'down' : e.type === 'input' ? 'input' : null;
        //if 'meth' was assigned a value earlier, return the associated function and pass the event to it
        return meth ? handlers[meth](e) : null;

        
      }

      function changeHandler(e) {
        window.setTimeout(function () {
          return doc.activeElement.parentNode === contEl || doc.activeElement.parentNode === contEl.lastElementChild ? null : insert();
        }, 50);
      }
      setEls();
      contEl.addEventListener('input', multiHandler);
      contEl.addEventListener('keydown', multiHandler);
      contEl.querySelectorAll('.search-button')[0].addEventListener('click', handlers.enter);
      contEl.firstElementChild.addEventListener('change', changeHandler);
    };

    

  