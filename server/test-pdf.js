const pdfLib = require('pdf-parse');

async function test() {
    console.log('Testing pdfLib.PDFParse...');
    console.log('Type of PDFParse:', typeof pdfLib.PDFParse);

    // If it is a function/class, let's try to inspect it
    if (typeof pdfLib.PDFParse === 'function') {
        console.log('PDFParse is a function/class');
    }

    try {
        const buffer = Buffer.from('%PDF-1.7\n%EOF'); 
        // Try calling it as main function
        // Or if it's the class, maybe default export is missing
        
        // Standard pdf-parse usage: require('pdf-parse')(buffer).
        // Since that failed, maybe this is 'pdf-parse-debugging-proxy' or something.
        
        // Let's try require('pdf-parse/lib/pdf-parse.js') if list_dir shows it.
    } catch (e) {
        console.log(e);
    }
}

test();
