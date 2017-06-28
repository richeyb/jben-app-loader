// Allow me to use a .env file
require('dotenv').config();

const UpdateCandidateCustomFields = require('./formulas/mckinsey_update_candidate_custom_fields');
UpdateCandidateCustomFields.perform({ inputFile: './inputs/candidate_extracts_sample.csv' });
