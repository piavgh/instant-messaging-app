const config = require('./config.json');

const AUTH0_TOKEN = config.auth0_token;
const SYSTEM_MESSAGE_NAME = config.system_message_name;

module.exports = {AUTH0_TOKEN, SYSTEM_MESSAGE_NAME};