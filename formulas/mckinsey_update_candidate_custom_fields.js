// Using axios to post the response
const axios = require('axios');
// And faker to fake the data
const faker = require('faker');
// And sleep to avoid slamming the API too hard
const sleep = require('sleep-promise');
// And our CSV library
const csv = require('fast-csv');
const fs = require('fs');

const Library = require('../library');
// Stupid node not having btoa
const { patch } = require('../util');

// Some basic setup junk
//const MAX_APPS = 500; // How many applications we want this to run for
const SLEEP_INTERVAL_IN_MS = 50; // How long to wait in between each request

const FULL_PATH = `${process.env.API_URL}/v1/candidates`;

const opQueue = [];
const exceptions = [];

const sendUpdate = ({ ghId, reachUrl, reachId }) => {
  const path = `${FULL_PATH}/${ghId}`;
  console.log(`Sending update for user ${ghId}...`);
  const body = {
    custom_fields: [{ name_key: 'candidate_id_auto', value: reachId }, { name_key: 'reach_url', value: reachUrl }]
  };
  return patch(path, body);
};
const readDataFromCsv = (inputFile, columns) => {
  let stream = fs.createReadStream(inputFile);
  csv
    .fromStream(stream, { headers: true })
    .on('data', data => {
      const { GREENHOUSE_ID__C: ghId, RECORD_URL__C: reachUrl, UNIQUE_ID__C: reachId } = data;
      console.log({ ghId, reachUrl, reachId });
      opQueue.push({ ghId, reachUrl, reachId });
    })
    .on('end', () => {
      console.log('Complete!');
      parseOpQueue();
    });
};
const parseOpQueue = async () => {
  for (let row of opQueue) {
    try {
      const result = await sendUpdate(row);
      console.log('Result:', result);
      console.log(`Sleeping ${SLEEP_INTERVAL_IN_MS}ms...`);
      await sleep(SLEEP_INTERVAL_IN_MS);
    } catch (exception) {
      console.log(exception);
      exceptions.push(row);
    }
  }
  if (exceptions.length > 0) {
    outputExceptions();
  }
};
const outputExceptions = () => {
  let csvStream = csv.createWriteStream({ headers: true });
  let ws = fs.createWriteStream('./input/mckinsey_custom_fields_update_exceptions.csv');
  ws.on('finish', () => {
    console.log('Done writing exceptions...');
  });
  csvStream.pipe(ws);
  csvStream.write(['GREENHOUSE_ID__C', 'RECORD_URL__C', 'UNIQUE_ID__C']);
  exceptions.forEach(row => {
    csvStream.write([row.ghId, row.reachUrl, row.reachId]);
  });
  csvStream.end();
};
const perform = ({ inputFile }) => {
  readDataFromCsv(inputFile);
};

module.exports = {
  perform
};
