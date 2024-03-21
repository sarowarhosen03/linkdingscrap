import fs from 'fs';
import saveAsExel from './d.js';
const fileNmae = process.argv.slice(2)[0] || undefined;

if (fileNmae) {
    let fileRes = [
        ['A', "B", "C", "D", "E", "G"]
    ]
    let oldData = JSON.parse(fs.readFileSync(fileNmae, 'utf-8')) || {};
    Object.keys(oldData).forEach((key) => {
        console.log(oldData[key]);
        oldData[key].slice(1).forEach((item) => {
            fileRes.push([item?.A, item?.B, item?.C, item?.D, item?.E, item?.G])
        })
    })
    saveAsExel(fileNmae.split(".")[0] + "-new", fileRes);

}