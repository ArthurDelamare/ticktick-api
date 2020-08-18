const TickTickAPI = require("./src/ticktick-core.js");
require("dotenv").config();

async function execute() {
  const api = new TickTickAPI();

  await api.login(process.env.TICKTICK_USERNAME, process.env.TICKTICK_PASSWORD);

  const tasks = await api.getTasksByProjectName("Ligue");

  const projects = await api.getProjects();
  console.log(projects);
}
execute();
