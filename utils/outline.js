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

const createOutlineFromPolygon = feature => turf.polygonToLine(feature)

const getOutlinesFeatureCollection = featureCollection => {
  const outlineCollections = featureCollection.features.map(
    createOutlineFromPolygon
  )

  console.log(outlineCollections)

  return {
    ...featureCollection,
    features: outlineCollections.reduce((features, currentCollection) => {
      const newFeatures = currentCollection.type === 'FeatureCollection' ? currentCollection.features : [currentCollection]
      return [features, ...newFeatures]
    }, [])
  }
}

mapJSONFile(
  'it/friuli-venezia-giulia/docs-friuli-venezia-giulia-outline.geojson',
  getOutlinesFeatureCollection
)
