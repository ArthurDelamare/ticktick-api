const axios = require("axios").default;

module.exports = class TickTickAPI {
  /**
   *
   * @param {object} options the options to communicate with TickTick
   * @param {string} options.username the username to connect to TickTick
   * @param {string} options.password the password to connect to TickTick
   */
  constructor(options) {
    this.login(options.username, options.password);
  }

  login(username, password) {
    const url = "https://ticktick.com/api/v2/user/signon?wc=true&remember=true";

    const options = {
      username: username,
      password: password,
    };

    axios
      .post(url, options)
      .then((response) => console.log(response))
      .catch((reason) => console.log(reason));
  }
};
