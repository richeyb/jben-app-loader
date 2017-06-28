module.exports = {
  e64(input) {
    return new Buffer(input).toString('base64');
  },
  patch(url, body) {
    return axios.patch(path, body, {
      headers: {
        Authorization: 'Basic ' + e64(`${process.env.API_KEY}:`),
        'On-Behalf-Of': process.env.ON_BEHALF_OF
      }
    });
  }
};
