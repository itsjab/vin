const fs = require('fs');

function mapJSONFile(filePath, mapFunction) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const parsedData = JSON.parse(data);

    const mappedData = mapFunction(parsedData);

    const jsonString = JSON.stringify(mappedData);

    fs.writeFile(filePath, jsonString, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Successfully wrote to ${filePath}`);
    });
  });
}


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

function addFeatureId(featureCollection) {
  const featuresWithId = featureCollection.features.map(feature => ({
    ...feature,
    properties: {
      ...feature.properties,
      id: slugify(`doc-${feature.properties.id}`)
    }
  }))

  return {
    ...featureCollection,
    features: featuresWithId
  }
}

mapJSONFile('docs-liguria.geojson', addFeatureId)