const { proxyToCompiler } = require('./compiler');

module.exports = (req, res) => proxyToCompiler(req, res, '/compileEsp32');
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
