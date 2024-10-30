const express = require('express');
const server = express();
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('node:fs/promises');
const bodyParser = require('body-parser')

const blacklistChars = ['】', '【', '&', '›', '.', '🌱', '-'];

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
    for (const asin of asinList) {
        const relPath = `../keywordgrap/listings/${asin}`;
        const testHtml = await readFile(relPath);
        const dom = convertToDom(testHtml);
        let result = parseBulletpoints(dom);
        result = result.textContent;
        result = getWordStringFromBulletpointsText(result);
        result = result.split(' ');

        result = result.map((word) => {
            blacklistChars.forEach((blacklistChar) => word = word.replace(blacklistChar, ' '));
            return word;
        });

        // remove empty strings
        result = result.filter(elem => elem != ' ');

        // split element again if there is a white space
        result = result.map(elem => elem.split(' '));

        // flatten
        result = result.flat();

        // remove empty elements
        result = result.filter(elem => elem);

        for (const keyword of result) {
            if (keywordCount.has(keyword)) {
                let count = keywordCount.get(keyword);
                count = count + 1;
                keywordCount.set(keyword, count);
            } else {
                keywordCount.set(keyword, 1);
            }
        }
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