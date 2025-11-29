const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

(async () => {
  try {
    console.log('Testing login with teacher@example');
    const loginResponse = await post('/api/auth/login', { email: 'teacher@test.ru', password: 'password123' });
    console.log('Login response:', loginResponse.status, loginResponse.body);

    console.log('\nTesting registration');
    const regResponse = await post('/api/auth/register', { email: 'newuser@test.ru', password: 'password123', firstName: 'New', lastName: 'User', role: 'student' });
    console.log('Register response:', regResponse.status, regResponse.body);
  } catch (err) {
    console.error('Error sending request:', err.message);
  }
})();
