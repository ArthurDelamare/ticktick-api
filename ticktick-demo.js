const TickTickAPI = require("./src/ticktick-api.js");
require("dotenv").config();

async function execute() {
  const api = new TickTickAPI();

  await api.login({
    username: process.env.TICKTICK_USERNAME,
    password: process.env.TICKTICK_PASSWORD,
  });

  // const tasks = await api.getTasks({ name: "Ligue", status: 0 });
  // console.log(tasks);

  const projectID = await api.getProjectIdFromName("Ligue");
  console.log(projectID);

  const completedTasks = await api.getCompletedTasks({id: projectID});
  console.log(completedTasks);
}
execute();
