import puppeteer from "puppeteer";

const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
        width: 756, height: 1080,
        deviceScaleFactor: 1
    },
    userDataDir: './user_data'
});
await browser.newPage();