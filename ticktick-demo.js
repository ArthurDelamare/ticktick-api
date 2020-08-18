const TickTickAPI = require("./src/ticktick-core.js");
require("dotenv").config();

async function execute() {
  const api = new TickTickAPI();

  await api.login(process.env.TICKTICK_USERNAME, process.env.TICKTICK_PASSWORD);

  api
    .batchCheck()
    .then((response) => console.log(response.data))
    .catch((reason) => console.error(reason));
}
execute();
