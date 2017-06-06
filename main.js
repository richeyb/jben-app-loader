// Allow me to use a .env file
require('dotenv').config();

// Using axios to post the response
const axios = require('axios');
// And faker to fake the data
const faker = require('faker');
// And sleep to avoid slamming the JBEN API too hard
const sleep = require('sleep-promise');

// Some basic setup junk
const MAX_APPS = 500; // How many applications we want this to run for
const SLEEP_INTERVAL_IN_MS = 100; // How long to wait in between each request
const JOB_ID = '4000023002'; // Hardcoded ID
const FULL_PATH = `${process.env.JOB_BOARD_API_URL}/${JOB_ID}`; // The full API URL with the job id

// Stupid node not having btoa
const e64 = input => new Buffer(input).toString('base64');

// Copied this from the JBEN docs
const sampleBody = {
  first_name: 'Sammy',
  last_name: 'McSamson',
  email: 'sammy@example.com',
  phone: '3337778888',
  location: '110 5th Ave New York, NY, 10011',
  latitude: '40.7376671',
  longitude: '-73.9929196',
  resume_text: 'I have many years of experience as an expert basket weaver...',
  cover_letter_text: 'I have a very particular set of skills, skills I have acquired over a very long career. Skills that make me...',
  educations: [
    {
      school_name_id: '4020848002', // Hardcoded ID
      degree_id: '4024727002', // Hardcoded ID
      discipline_id: '4025590002', // Hardcoded ID
      start_date: { month: '1', year: '1989' },
      end_date: { month: '2', year: '1990' }
    }
  ]
};

// Function to actually send the request off to JBEN (just returns the promise so I can use async/await)
const sendRequest = index => {
  console.log(`Sending Application #${index + 1} to ${FULL_PATH}...`);
  const newApp = Object.assign({}, sampleBody, {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    location: faker.fake('{{address.streetAddress}} {{address.city}}, {{address.stateAbbr}}, {{address.zipCode}}'),
    latitide: faker.address.latitude(),
    longitude: faker.address.longitude(),
    resume_text: faker.lorem.sentence(),
    cover_letter_text: faker.lorem.sentence()
  });
  console.log('Building out:');
  console.log(newApp);
  return axios.post(FULL_PATH, newApp, {
    headers: {
      Authorization: 'Basic ' + e64(`${process.env.API_KEY}:`)
    }
  });
};

// And the actual main logic loop
const runLoop = async () => {
  for (let i = 0; i < MAX_APPS; i++) {
    try {
      const result = await sendRequest(i);
      console.log('Response received:');
      console.log(result.data);
      console.log(`Sleeping for ${SLEEP_INTERVAL_IN_MS}ms...`);
      await sleep(SLEEP_INTERVAL_IN_MS);
    } catch (error) {
      console.log(`Error sending application #${i}:`);
      console.log(error);
    }
  }
};

// Do the needful
runLoop();
