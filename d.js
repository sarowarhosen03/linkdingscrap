import XLSX from 'xlsx';

const fileNmae = process.argv.slice(2)[0] || undefined;

export default function saveAsExel(fileName, data) {


    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert the data array to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook to a file
    const excelFilePath = fileName + '.xlsx';
    XLSX.writeFile(workbook, excelFilePath);

    console.log(`Excel file "${excelFilePath}" has been created.`);


}
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
    saveAsExel(inFileName.split(".")[0] + "-new", fileRes);

}