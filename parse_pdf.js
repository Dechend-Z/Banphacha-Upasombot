const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:/Users/ACER/Desktop/My Project/Banphacha Upasombot/asset/คำขอบรรพชาอุปสมบท-ธรรมยุต.pdf');

pdf(dataBuffer).then(function (data) {
    fs.writeFileSync('c:/Users/ACER/Desktop/My Project/Banphacha Upasombot/asset/pdf_text.txt', data.text);
    console.log("PDF parsed and saved to pdf_text.txt");
}).catch(function (error) {
    console.error("Error parsing PDF:", error);
});
