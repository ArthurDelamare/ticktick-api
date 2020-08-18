const axios = require("axios").default;
axios.defaults.withCredentials = true;

module.exports = class TickTickAPI {
  constructor() {}

  /**
   * Login to TickTick, necessary to make any other request
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
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
  async batchCheck(id = 0) {
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
   * @param {string} name
   */
  async getTasksByProjectName(name) {
    const batch = await this.batchCheck(1);
    const projectID = this._getProjectIdFromProjectProfiles(
      batch.data["projectProfiles"],
      name
    );
    const tasks = this._getTaskByProjectIdAndBatch(projectID, batch.data);
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
   *
   * @param {string} projectId
   * @param {Object} batchData
   * @param {number} batch.checkpoint
   * @param {Object} batch.syncTaskBean
   * @param {Object[]} batch.syncTaskBean.update
   * @param {string} batch.syncTaskBean.update[].id the task ID
   * @param {string} batch.syncTaskBean.update[].projectId
   * @param {string} batch.syncTaskBean.update[].title
   * @param {string} batch.syncTaskBean.update[].modifiedTime
   * @param {string} batch.syncTaskBean.update[].createdTime
   */
  _getTaskByProjectIdAndBatch(projectId, batchData) {
    if (
      !batchData.syncTaskBean.update ||
      batchData.syncTaskBean.update.length === 0
    ) {
      throw new Error("Task list was empty.");
    }

    const projectTasks = batchData.syncTaskBean.update.filter(
      (task) => task.projectId === projectId
    );
    return projectTasks;
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
   * @param {string} id the project ID
   */
  async getCompletedTasksOnProject(id = "all") {
    if (!this.cookieHeader) {
      throw new Error("Cookie header is not set.");
    }
    const url = `https://api.ticktick.com/api/v2/project/${id}/completed/`;

    const headers = {
      Cookie: this.cookieHeader,
    };

    const request = await axios.get(url, { headers: headers });

    return request.data;
  }
};
