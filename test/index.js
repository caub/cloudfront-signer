const AWS = require('aws-sdk');

const cfUrl = 'https://d123.cloudfront.net';
const cfKeypairId = '__cfKeypairId__';
const cfPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA3SqsHlVmqP6OxcMBZm96sObwGHK3pM7LHl6F8TZ3poPzFgut
SVt2sBfHQZC2vXIN/lnwlExtixzttgd9F4VkGij5LX/crLZ8JV7he0/+c0Y/slAg
dqe2AMRNuxAL+s/FpqVnB7iiePIxlA9sDFhsYyHz6QtwzIRAaxnlC/ZWzJCYRHxE
hIwZMC1oZsPdSc9k5D60vIxJLHwQ/OOIhVjk6h+szS3uRUYpHiyywF09lwaCeKR0
FqxqSBb5yJv9lzLqhJkhHM6t0y88rNWggwj3nE3YmlCHcp/B81BTbyXT2EpF6mbt
CQbmDO118YHDDuXGiTuSimGx9oFyw9tMe8Nx/QIBIwKCAQEAl6g7goO0HBxEpN19
TY5FgJ5bfnqMjkSoidpqeYRvTZxO6ouqBmqah2DDJaUPl9kuKsFUgvKUQiJ3Hbv+
AYAKIJEf5K9yv5MTTNNYyZXwTwuZZFQzhJBCSast/J1KCxIhIdCBKd2xPP3Y2o47
di4BLginQLdjSmlQvngoCDPjv3fRNhvyoTNvKoiCXWFbw+Rnax1UpzAGL1u6JHjE
dfLfRmJNdnOQVpnfUQ2ELoF6iTTB2/mJsbDcfAmKIGeWmXFa006f1RO3YxS+925t
/7eoyPEAJ/fRBBzUZrkhoVjGaZXgEgmOw3k3rVQFbixZf0FXQpehwXyE4WCkY3rc
F1AZawKBgQD6Rq/u9S8xhR9nvibntCqko/jBhqqBD2hhXh+w0WWSZcISLPoKNC1F
L3ThiuBEm/jRpbxWJtfMNd0jcd4Nad8EoAHDxI7VYfsoYwVm2xnUe5ynAtpReOCC
2t6xMNdYIy4X+CtkM/1uYFZkGAb3nN1a9ZvQoh1Crb+5pxcIKsYuTwKBgQDiOY4+
ZEc64lxCixmlF/epbrstF2Zpwq3q1D5j3UZ3kw4+/iCxks3TmIQbHFV7naDAx3GK
d11ciAFCPNGJ4uPsGxoJlthtALXTIPnZPa33plG8B9d6fmqJV/j73a0FBcxHLULt
9/ixJSc0mM9zmHPMUoKgrhmC1WoetlvDWahz8wKBgQDzIBie/M7CZA/hHx56rwTa
c2atXj87i090h1H8OSDXW4lTfCYYinUeoyEVnNncP76Cg75FD8pRWOVy46SCDxMp
EHa+LKgCfHBTHl0E1NdDcMQP9CSJqJ+VDyF47Z392Qg0iq3PDe7gQFPsNJkNy5Uz
ygUT0K61zVspYHzGGuxnfwKBgQCbICcGNiI3AZ5Zg/RT8y17fyFDfcKRqhDbijlp
DMKbIwJ0VnzRiTyuWfQv2Ooo4R3GBRqoF1X2TqHHBSH4Jo2pNyfMD6pZX5KfZxG5
iWFZXBrKFAF4kTMcWZTJ9xeOamAwzpRLaDWAyQTw3dAUwE9niQkduTYQkldlhFwu
LtnpGwKBgHblG0jaKbPGeE2QANZ1koiOoOHV007tGunmq/Bv2paRpgn/yzjpU/l8
oLWSvbabIU3ANxu6Ich6OGTikQqo+b+Pi0v5lv66nSb1lZSGk2NIll3SEF4/rmx/
5ijGogq7y/I62ZoYUy4oZ/tKVQMqIgn3tGJ3sGImxeSwfKzxfLer
-----END RSA PRIVATE KEY-----
`; // dummy pem


const signer = new AWS.CloudFront.Signer(cfKeypairId, cfPrivateKey);



const assert = require('assert');
const cfSign = require('../');
const urlParse = require('url').parse;
const qsParse = require('querystring').parse;

var d = Math.floor(new Date(2017, 4, 20)/1000);

assert.deepEqual(
	qsParse(cfSign(cfUrl+'/test', d, cfKeypairId, cfPrivateKey)),
	urlParse(signer.getSignedUrl({url:cfUrl+'/test', expires:d}), true).query
);

const policy = JSON.stringify({
		'Statement': [{
			'Resource': cfUrl+'/*',
			'Condition': {
				'DateLessThan': {
					'AWS:EpochTime': d
				}
			}
		}]
	});

assert.deepEqual(
	qsParse(cfSign(cfUrl+'/*', d, cfKeypairId, cfPrivateKey, true)),
	urlParse(signer.getSignedUrl({url:cfUrl+'/wat/foo', policy}), true).query
);

console.time(1);
for (let i=0; i<1e3; i++) {
	const url = cfUrl+'/test_'+i+'?v=8978';
	const surl =url + '&'+ cfSign(url, d, cfKeypairId, cfPrivateKey);
}
console.timeEnd(1);

console.time(2);
for (let i=0; i<1e3; i++) {
	const url = cfUrl+'/test_'+i+'?v=8978';
	const surl = signer.getSignedUrl({url:url, expires:d});
}
console.timeEnd(2);