const axios = require("axios").default;
axios.defaults.withCredentials = true;

module.exports = class TickTickAPI {
  constructor() {}

  /**
   * Login to TickTick, necessary to make any other request
   * @param {Object} credentials
   * @param {string} credentials.username
   * @param {string} credentials.password
   */
  async login({ username, password }) {
    const url = "https://ticktick.com/api/v2/user/signon?wc=true&remember=true";

    const options = {
      username: username,
      password: password,
    };
    const result = await axios.post(url, options, {
      headers: { "Content-Type": "application/json" },
    });

    this.cookies = result.headers["set-cookie"];
    this.cookieHeader = this.cookies.join("; ") + ";";

    return result;
  }

  /**
   * @description send a request to https://ticktick.com/api/v2/batch/check/{id} endpoint
   * @param {number} id
   */
  async _batchCheck(id = 0) {
    if (!this.cookieHeader) {
      throw new Error("Cookie header is not set.");
    }
    const url = `https://ticktick.com/api/v2/batch/check/${id}`;

    return axios.get(url, {
      headers: {
        Cookie: this.cookieHeader,
      },
    });
  }

  /**
   * @param {Object} options
   * @param {string} options.name name of the project
   * @param {number} options.status 0 = uncompleted tasks, 2 = completed tasks
   *
   */
  async getTasks({ name, status }) {
    const batch = await this._batchCheck(1);

    if (
      !batch.data.syncTaskBean.update ||
      batch.data.syncTaskBean.update.length === 0
    ) {
      throw new Error("Task list was empty.");
    }

    let tasks = batch.data.syncTaskBean.update;

    if (name) {
      const projectId = this._getProjectIdFromProjectProfiles(
        batch.data["projectProfiles"],
        name
      );
      tasks = batch.data.syncTaskBean.update.filter(
        (task) => task.projectId === projectId
      );
    }

    if (status != null && status != undefined) {
      tasks = tasks.filter((task) => task.status === status);
    }

    return tasks;
  }

  /**
   * @param {Object[]} projectProfiles an Array of project details
   * @param {string} projectProfiles[].id project ID
   * @param {string} projectProfiles[].name project name
   * @param {string} projectProfiles[].modifiedTime date of the project last modification
   * @param {string} name
   */
  _getProjectIdFromProjectProfiles(projectProfiles, name = "Ligue") {
    if (!projectProfiles || projectProfiles.length === 0) {
      throw new Error("No project has been found.");
    }
    const project = projectProfiles.find((project) => project.name === name);
    if (!project) {
      throw new Error(`${name} project was not found.`);
    }
    return project.id;
  }

  /**
   * @typedef {Object} Project
   * @property {string} id
   * @property {string} name
   * @property {string} modifiedTime
   */

  /**
   * @returns {Project[]}
   */
  async getProjects() {
    if (!this.cookieHeader) {
      throw new Error("Cookie header is not set.");
    }
    const url = "https://api.ticktick.com/api/v2/projects";

    const headers = {
      Cookie: this.cookieHeader,
    };

    const request = await axios.get(url, { headers: headers });

    return request.data;
  }

  /**
   * @param {string} name name of the project
   */
  async getProjectIdFromName(name) {
    const projects = await this.getProjects();

    const project = projects.find((project) => project.name === name);

    if (!project) {
      throw new Error("Project not found.");
    }

    return project.id;
  }

  /**
   *
   * @param {object} options
   * @param {string} options.id the project ID, all projects by default
   * @param {Date} options.beginDate start of the date interval
   * @param {Date} options.endDate end of the date interval
   */
  async getCompletedTasksOnProject({id = "all", beginDate = initBeginDate(), endDate = new Date()}) {
    if (!this.cookieHeader) {
      throw new Error("Cookie header is not set.");
    }

    const beginDateString = `${beginDate.getFullYear()}-${beginDate.getMonth() + 1}-${beginDate.getDate()}%20${beginDate.getUTCHours()}:${beginDate.getMinutes()}:${beginDate.getSeconds()}`;

    const endDateString = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}%20${endDate.getUTCHours()}:${endDate.getMinutes()}:${endDate.getSeconds()}`;
    
    const url = `https://api.ticktick.com/api/v2/project/${id}/completed/?from=${beginDateString}&to=${endDateString}&limit=50`;

    const headers = {
      Cookie: this.cookieHeader,
    };

    const request = await axios.get(url, { headers: headers });

    return request.data;
  }
};

function initBeginDate() {
  const date = new Date();
  date.setDate(date.getDate() - 31);
  return date;
}