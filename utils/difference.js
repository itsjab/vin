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

const sortByArea = (featureA, featureB) =>
   turf.area(featureB) - turf.area(featureA)

function getDiffedFeatureCollection(featureCollection) {
  const diffedFeatures = featureCollection.features
    .sort(sortByArea)
    .map(computeDifferenceFromFollowingFeatures)

  return {
    ...featureCollection,
    features: diffedFeatures
  }
}

const computeDifferenceFromFollowingFeatures = (
  currentFeature,
  currentFeatureIndex,
  allFeatures
) => {
  const nextFeatureIndex = currentFeatureIndex + 1
  if (nextFeatureIndex === allFeatures.length) {
    return currentFeature
  }

  const difference =
    turf.difference(currentFeature, allFeatures[nextFeatureIndex]) ||
    currentFeature
  return computeDifferenceFromFollowingFeatures(
    difference,
    nextFeatureIndex,
    allFeatures
  )
}

mapJSONFile('it/trentino-alto-adige/docs-trentino-alto-adige.geojson', getDiffedFeatureCollection)
