const { proxyToCompiler } = require('./compiler');

module.exports = (req, res) => proxyToCompiler(req, res, '/compilePiboard');
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
