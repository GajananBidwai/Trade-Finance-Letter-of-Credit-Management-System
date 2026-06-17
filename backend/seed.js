const http = require('http');

const data = JSON.stringify({
  applicant: "Global Tech Imports LLC",
  beneficiary: "Shenzhen Electronics Mfg Co.",
  amount: 1250000.00,
  currency: "USD",
  paymentType: "AT_SIGHT",
  partialShipments: "ALLOWED",
  transshipment: "NOT_ALLOWED",
  documentsRequired: ["BILL_OF_LADING", "COMMERCIAL_INVOICE", "CERTIFICATE_OF_ORIGIN"]
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/lc',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    // Add mock authorization since the gateway enforces it
    'Authorization': 'Bearer test-token'
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
