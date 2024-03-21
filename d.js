import XLSX from 'xlsx';

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
