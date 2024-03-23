import axios from 'axios';
import excelToJson from 'convert-excel-to-json';
import fs from 'fs';

import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import saveAsExel from './d.js';

const timeout = 3000;
const sleepTime = 15000;


const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const inFileName = process.argv.slice(2)[0] || "sheet.xlsx";
const OutPutFileName = inFileName.split(".")[0] + ".json";
if (!fs.existsSync(OutPutFileName)) {

    let result = excelToJson({
        sourceFile: inFileName
    });
    fs.writeFileSync(OutPutFileName, JSON.stringify(result));
}



let result = JSON.parse(fs.readFileSync(OutPutFileName, 'utf-8'));


const fileNames = Object.keys(result);

const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
        width: 756, height: 1080,
        deviceScaleFactor: 1
    },
    userDataDir: './user_data'
});
const page = await browser.newPage();


for (let j = 0; j < fileNames.length; j++) {

    const users = [...result[fileNames[j]]];
    users.shift();
    const outputFolderPath = `uploads/${inFileName.split(".")[0]}`;
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath);
    }
    for (let index = 0; index < users.length; index++) {
        let status = ""

        let outputPath = `${outputFolderPath}/${users[index].B}.jpg`
        if (users[index]?.C) {
            console.log(`Skiping already Downloded ${outputPath}`)
        }
        else {

            if (fs.existsSync(outputPath)) {
                console.log(`Skiping already Downloded ${outputPath}`)
                updateJsonFile(OutPutFileName, fileNames[j], users[index].G, "Y");
            } else {
                try {
                    await DownloadProfileImage(users[index].G, outputPath);
                    updateJsonFile(OutPutFileName, fileNames[j], users[index].G, "Y");

                } catch (error) {
                    console.error(error[0]);
                    if (error[1]) {
                        updateJsonFile(OutPutFileName, fileNames[j], users[index].G, "N");
                    }

                }
            }


        }

    }

}

function updateJsonFile(OutPutFileName, tabNmae, url, status) {
    const prevData = fs.readFileSync(OutPutFileName, 'utf-8') || {};
    const data = JSON.parse(prevData);
    fs.writeFileSync(OutPutFileName, JSON.stringify({
        ...data,
        [tabNmae]: data[tabNmae].map((item) => {
            if (item.G == url) {
                return {
                    ...item,
                    C: status
                }

            }
            return item;
        })

    }));
}

let fileRes = [
    ['A', "B", "C", "D", "E", "G"]
]
let oldData = JSON.parse(fs.readFileSync(OutPutFileName, 'utf-8')) || {};
Object.keys(oldData).forEach((key) => {
    oldData[key].slice(1).forEach((item) => {
        fileRes.push([item?.A, item?.B, item?.C, item?.D, item?.E, item?.G])
    })
})
saveAsExel(inFileName.split(".")[0] + "-new", fileRes);
fs.unlinkSync(OutPutFileName);
browser.close();
process.exit(0);
async function DownloadProfileImage(url, name) {

    return new Promise(async (resolve, reject) => {
        try {
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: timeout
            });

        } catch (error) {

        } finally {
            try {
                // await sleep(sleepTime);

                try {
                    await page.waitForSelector(`[aria-label="open profile picture"]`)
                } catch (error) {
                    reject(["not found", false])

                }
                const circleImage = await page.$eval(`[aria-label="open profile picture"]`, el => el.innerHTML);
                const rootImage = parse(circleImage);
                const imgExist = rootImage.querySelector('img').getAttribute('src');
                if (imgExist.startsWith('data:image')) {

                    return reject(['No profile picture found for -' + url, true]);


                }

                await page.click(`[aria-label="open profile picture"]`);

                try {
                    await page.waitForSelector(".pv-member-photo-modal__content-image-container");
                } catch (error) {
                    reject([error])

                }

                const html = await page.$eval(".pv-member-photo-modal__content-image-container", el => el.innerHTML);

                const root = parse(html);
                const img = root.querySelector('img').getAttribute('src');
                try {
                    const ouptputPath = await downloadFile(img, name);
                    return resolve(url);

                } catch (error) {
                    reject([error])

                }

            } catch (error) {
                return reject([error]);
            }
        }


    })

}

async function downloadFile(url, outputPath) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream'
    });

    // Create a writable stream and pipe the response data to it
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    // Return a promise that resolves when the file writing is finished
    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            console.log(`Downloaded to ${outputPath}`);

            resolve(outputPath)
        });
        writer.on('error', reject);
    });
}

