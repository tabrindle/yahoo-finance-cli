#!/usr/bin/env node

require('babel-register');
require('babel-polyfill');
const fs = require('fs');
const cli = require('commander');
const packageJson = require('../package.json');
const helpers = require('./helpers');
const defaults = require('./defaults');

cli
  .command('quote-all')
  .alias('all')
  .description('Get all stock quotes from Yahoo CSV api on NASDAQ')
  .option('-h, --headers <optional>', 'headers')
  .option('-u, --upper_price_threshold <optional>', 'upperPrice')
  .option('-l, --lower_price_threshold <optional>', 'lowerPrice')
  .option('-o, --output <optional>', 'output')
  .action((options) => {
    const headers = options.headers || defaults.headers;
    const upperPrice = options.upperPrice || 10;
    const lowerPrice = options.lowerPrice || 1;
    const output = options.output || 'file';

    helpers
      .getNASDAQsymbols()
      .then(NASDAQsymbols =>
        helpers.getJSONquote(
          NASDAQsymbols
            .filter(
              obj =>
                parseInt(obj.LastSale, 10) <= upperPrice &&
                parseInt(obj.LastSale, 10) >= lowerPrice
            )
            .map(obj => obj.Symbol),
          headers,
          'file'
        )
      )
      .then((data) => {
        const filteredData = data.filter(
          obj => obj.averageDailyVolume !== 'N/A'
        );
        if (output === 'file') {
          fs.writeFile('data.json', JSON.stringify(filteredData, null, '  '));
        } else {
          console.log(JSON.stringify(filteredData, null, '  '));
        }
      })
      .catch(console.log);
  });

cli
  .command('quote [symbol(s)]')
  .description('Get JSON stock quotes from Yahoo CSV api')
  .option('-h, --headers <required>', 'headers')
  .action((symbols, options) => {
    const headers = options.headers || defaults.headers;

    helpers
      .getJSONquote(symbols, headers)
      .then((data) => {
        console.log(JSON.stringify(data, null, '  '));
      })
      .catch(console.log);
  });

cli.command('*').action(() => cli.help());
cli.version(packageJson.version).parse(process.argv);

if (cli.args.length === 0) cli.help();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.log(`ERROR: ${err}`);
  process.exit();
});
