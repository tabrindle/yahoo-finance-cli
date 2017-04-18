const csv = require('csvtojson');
const request = require('request');
const properties = require('./properties.js');

module.exports = {
  objectKeyByValue: (obj, val) =>
    Object.entries(obj).find(i => i[1] === val)[0],
  getJSONquote(symbols, headers) {
    return new Promise((resolve, reject) => {
      const shortParams = headers
        .map(param => this.objectKeyByValue(properties, param))
        .join('');

      csv({
        noheader: true,
        headers,
      })
        .fromStream(
          request.get(
            `http://finance.yahoo.com/d/quotes.csv?s=${symbols}&f=${shortParams}`
          )
        )
        .on('end_parsed', (jsonArrObj) => {
          resolve(jsonArrObj);
        })
        .on('error', reject);
    });
  },
  getNASDAQsymbols() {
    return new Promise((resolve, reject) => {
      csv()
        .fromStream(
          request.get(
            'http://www.nasdaq.com/screening/companies-by-industry.aspx?exchange=NASDAQ&render=download'
          )
        )
        .on('end_parsed', (data) => {
          resolve(data);
        })
        .on('error', reject);
    });
  },
};
