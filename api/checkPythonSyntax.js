const { proxyToCompiler } = require('./compiler');

module.exports = (req, res) => proxyToCompiler(req, res, '/checkPythonSyntax');
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
