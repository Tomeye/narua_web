const JSONdb = require('simple-json-db');
const express = require('express');
const server = express();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('node:fs/promises');
const bodyParser = require('body-parser')

const bulletPointsDb = new JSONdb('bulletPoints.json');

const blacklistChars = ['】', '【', '&', '›', '.', '🌱', '-', '/', '❗', '✔︎', '🎧', ',', '"', '–', '('];

server.use(bodyParser.json());

server.use(express.static('docs'));

server.listen(3000, async () => {
    console.log('Static Server listening on port 3000');
    // const asin = 'B0D9KZKYWX';
    // crawl(`https://www.amazon.de/dp/${asin}`).then(html => console.log(html));
});

/*
 curl --location 'http://localhost:3000/analyzeBulletpoints' \
--header 'Content-Type: application/json' \
--data '{
    "asinList" : ["B0D9KZKYWX", "B0BVB8STGS", "B0BPHJ8LJD", "B01N9BE85S", "B01H6FC8KQ", "B08NVMDVSJ", "B07JN1BGK9", "B07WZLZCPJ", "B07712VZ68", "B0CTKKCYRF"]
 */
server.post('/analyzeBulletpoints', async function (req, res) {
    const asinList = req.body['asinList'];
    const keywordCount = await analyzeBulletpoints(asinList);
    const obj = Object.fromEntries(keywordCount);
    res.status(200);
    res.send(JSON.stringify(obj));
});

async function analyzeBulletpoints(asinList) {
    let keywordCount = new Map();
    let needSync = false;
    for (const asin of asinList) {
        needSync = true;
        let result = bulletPointsDb.get(asin);
        if (result === undefined) {
            console.log(`bulletpoints of ${asin} not yet in db. parsing ...`);
            try {
                // read html
                const relPath = `test/res/listings/${asin}`;
                const testHtml = await readFile(relPath);

                // convert html to dom
                // TODO: this is time consuming
                const dom = convertToDom(testHtml);

                // parse bullet points
                result = parseBulletpoints(dom);

                // get text from dom
                result = result.textContent;

                // remove blacklist chars
                for (const blacklistChar of blacklistChars) {
                    result = result.replaceAll(blacklistChar, ' ');
                }
                result = getWordStringFromBulletpointsText(result);

                // split space separated string into words
                result = result.split(' ');

                // remove empty strings
                result = result.filter(elem => elem != ' ');

                // remove numbers
                result = result.filter(elem => !isNumeric(elem));

                // split element again if there is a white space
                result = result.map(elem => elem.split(' '));

                // flatten
                result = result.flat();

                // remove empty elements
                result = result.filter(elem => elem);

                bulletPointsDb.set(asin, JSON.stringify(result));
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log(`found bullet points for asin ${asin}`);
            result = JSON.parse(result);
        }

        for (const keyword of result) {
            const jsonStr = keyword.toString();
            if (keywordCount.has(jsonStr)) {
                let count = keywordCount.get(jsonStr);
                count = count + 1;
                keywordCount.set(jsonStr, count);
            } else {
                keywordCount.set(jsonStr, 1);
            }
        }
    }

    if (needSync) {
        bulletPointsDb.sync();
    }

    keywordCount = new Map([...keywordCount.entries()].sort((a, b) => b[1] - a[1]));

    return keywordCount;
}

async function crawl(url) {
    let html;
    try {
        const res = await fetch(url);
        html = await res.text();
    } catch (err) {
        console.log(err.message);
    }
    return html;
}

function convertToDom(htmlString) {
    let dom;
    try {
        dom = new JSDOM(htmlString);
    } catch (err) {
        console.log(err.message);
    }
    return dom;
}

function parseBulletpoints(dom) {
    return dom.window.document.getElementById('feature-bullets');
}

function getWordStringFromBulletpointsText(bulletpointsStr) {
    return bulletpointsStr.replace(/\s+/g, ' ').trim();
}

async function readFile(relPath) {
    let data;
    try {
        data = await fs.readFile(relPath, { encoding: 'utf8' });
    } catch (err) {
        console.log(err);
    }
    return data;
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}