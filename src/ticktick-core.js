const axios = require("axios").default;
axios.defaults.withCredentials = true;

module.exports = class TickTickAPI {
  constructor() {}

  async login(username, password) {
    const url = "https://ticktick.com/api/v2/user/signon?wc=true&remember=true";

    const options = {
      username: username,
      password: password,
    };
    const result = await axios.post(url, options, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    this.cookies = result.headers["set-cookie"];
    this.cookieHeader = this.cookies.join("; ") + ";";

    return result;
  }

  async batchCheck(id = 0) {
    console.log("batch check");
    const url = `https://ticktick.com/api/v2/batch/check/${id}`;

    return axios.get(url, {
      withCredentials: true,
      headers: {
        Cookie: this.cookieHeader,
      },
    });
  }
};
