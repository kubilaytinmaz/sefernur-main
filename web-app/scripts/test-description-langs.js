// Test script - check all available languages in description
// Run: node web-app/scripts/test-description-langs.js

const http = require('http');

// WebBeds API'yi doğrudan çağırarak description1 yapısını inceliyoruz
const crypto = require('crypto');

// .env.local'dan config okuyalım
const fs = require('fs');
const envPath = require('path').join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) env[key.trim()] = vals.join('=').trim();
});

const username = env.WEBBEDS_USERNAME || env.NEXT_PUBLIC_WEBBEDS_USERNAME;
const password = env.WEBBEDS_PASSWORD || env.NEXT_PUBLIC_WEBBEDS_PASSWORD;
const companyId = env.WEBBEDS_COMPANY_ID || env.NEXT_PUBLIC_WEBBEDS_COMPANY_ID;
const baseUrl = env.WEBBEDS_BASE_URL || env.NEXT_PUBLIC_WEBBEDS_BASE_URL || 'https://xmldev.dotwconnect.com/gatewayV4.dotw';

console.log('Config:', { username, companyId, baseUrl: baseUrl.substring(0, 50) });

const md5Password = crypto.createHash('md5').update(password).digest('hex');

// Mekke'deki bir otel ile test edelim - ID 30714 (Dubai) yerine Mekke otelleri
const hotelId = '30714';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<customer xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <username>${username}</username>
    <password>${md5Password}</password>
    <id>${companyId}</id>
    <source>1</source>
    <product>hotel</product>
    <language>2</language>
    <request command="searchhotels">
    <bookingDetails>
        <fromDate>2026-04-09</fromDate>
        <toDate>2026-04-12</toDate>
        <currency>520</currency>
        <rooms no="1">
            <room runno="0">
                <adultsCode>1</adultsCode>
                <children no="0"></children>
                <rateBasis>-1</rateBasis>
                <passengerNationality>5</passengerNationality>
                <passengerCountryOfResidence>5</passengerCountryOfResidence>
            </room>
        </rooms>
    </bookingDetails>
    <return>
        <filters xmlns:a="http://us.dotwconnect.com/xsd/atomicCondition" xmlns:c="http://us.dotwconnect.com/xsd/complexCondition">
            <noPrice>true</noPrice>
            <c:condition>
                <a:condition>
                    <fieldName>hotelId</fieldName>
                    <fieldTest>in</fieldTest>
                    <fieldValues>
                        <fieldValue>${hotelId}</fieldValue>
                    </fieldValues>
                </a:condition>
            </c:condition>
        </filters>
        <fields>
            <field>hotelName</field>
            <field>description1</field>
            <field>description2</field>
        </fields>
    </return>
</request>
</customer>`;

const https = require('https');
const url = new URL(baseUrl);

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'text/xml; charset=utf-8',
    'Accept': 'text/xml',
    'Accept-Encoding': 'identity',
    'Content-Length': Buffer.byteLength(xml),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    // description1 bölümünü bul ve göster
    const desc1Match = data.match(/<description1>([\s\S]*?)<\/description1>/);
    const desc2Match = data.match(/<description2>([\s\S]*?)<\/description2>/);
    
    console.log('\n=== description1 raw XML ===');
    console.log(desc1Match ? desc1Match[0].substring(0, 1000) : 'NOT FOUND');
    
    console.log('\n=== description2 raw XML ===');
    console.log(desc2Match ? desc2Match[0].substring(0, 1000) : 'NOT FOUND');
    
    // Dilleri listele
    const langMatches = data.matchAll(/<language[^>]*id="(\d+)"[^>]*name="([^"]*)"[^>]*>([^<]*)</g);
    console.log('\n=== Mevcut Diller ===');
    for (const match of langMatches) {
      console.log(`  id=${match[1]} name=${match[2]} text="${match[3].substring(0, 100)}..."`);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(xml);
req.end();
