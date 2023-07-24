const turf = require('@turf/turf')
const fs = require('fs')

function slugify(string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

function generateIds(filePath, mapFunction) {
  fs.readFile('eu-appellations.json', 'utf-8', (err, euAppellationsRaw) => {
    if (err) {
      console.error('Failed to read eu appellations', err)
      return
    }

    const parsedEuAppellations = JSON.parse(euAppellationsRaw)

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Failed to read region appellations', err)
        return
      }

      const parsedData = JSON.parse(data)

      const mappedData = mapFunction(parsedEuAppellations, parsedData)

      const jsonString = JSON.stringify(mappedData)

      fs.writeFile(filePath, jsonString, 'utf8', err => {
        if (err) {
          console.error(`Failed to write ${filePath}`, err)
          return
        }

        console.log(`Successfully wrote to ${filePath}`)
      })
    })
  })
}

const getPropsFromEuAppellations = (featureId, euAppellations) => {
  const appellation = euAppellations.find(appellation => appellation.PDOid === featureId)

  if (!appellation) return {}

  console.log(appellation)

  return {
    name: appellation.PDOnam,
    id: `doc-${slugify(appellation.PDOnam)}`
  }
}

function mapEuAppellationsWithRegionAppellations(euAppellations, featureCollection) {
  const featuresWithId = featureCollection.features.map(feature => ({
    ...feature,
    properties: {
      regionId: feature.properties.regionId,
      ...getPropsFromEuAppellations(feature.properties.PDOid, euAppellations),
      category: 'appellation',
      area: turf.area(feature)
    }
  }))

  return {
    ...featureCollection,
    features: featuresWithId
  }
}

generateIds('it/trentino-alto-adige/docs-trentino-alto-adige-raw-outline.geojson', mapEuAppellationsWithRegionAppellations)
