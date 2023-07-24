const fs = require('fs')
const turf = require('@turf/turf')

function mapJSONFile(filePath, mapFunction) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    const parsedData = JSON.parse(data)

    const mappedData = mapFunction(parsedData)

    const jsonString = JSON.stringify(mappedData)

    fs.writeFile(filePath, jsonString, 'utf8', err => {
      if (err) {
        console.error(err)
        return
      }

      console.log(`Successfully wrote to ${filePath}`)
    })
  })
}

function calculateFeatureArea(featureCollection) {
  const features = featureCollection.features.map(feature => ({
    ...feature,
    properties: {
      ...feature.properties,
      area: (turf.area(feature) / 1000000).toFixed(1) // convert to square kilometer
    }
  }))

  return {
    ...featureCollection,
    features
  }
}

mapJSONFile('it/friuli-venezia-giulia/docs-friuli-venezia-giulia-raw.geojson', calculateFeatureArea)
