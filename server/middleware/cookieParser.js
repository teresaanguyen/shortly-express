const parseCookies = (req, res, next) => {
  var cookie = req.headers.cookie || '';
  if (cookie === '') {
    req.cookies = null;
  } else {
    var keyValueArr = cookie.split(';').map(prop => prop.split('='));
    keyValueArr.reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
    req.cookies = keyValueArr;
  }
  next();
};

module.exports = parseCookies;