const TickTickAPI = require("./src/ticktick-core.js");

require("dotenv").config();

new TickTickAPI({
  username: process.env.TICKTICK_USERNAME,
  password: process.env.TICKTICK_PASSWORD,
});
