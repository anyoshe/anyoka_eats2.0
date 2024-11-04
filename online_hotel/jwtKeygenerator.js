const crypto = require('crypto');

// Generate a 64-byte random string and convert it to hexadecimal format
const secretKey = crypto.randomBytes(64).toString('hex');

console.log('Generated JWT Secret Key:', secretKey);

$2a$10$j8CO4zS2t7toE4l.jYhD9ev.H6aNR4bvB4Y9yhRX97ypJTtQh50aC
$2a$10$i2thwFri7HUlbgKsYid99OihEmnWOSVrPJTPNeGMfnRd7O5Io2w5e