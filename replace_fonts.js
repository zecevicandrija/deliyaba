const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\Projekti\\BitniProjekti\\Deliyaba\\my-app\\src';

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir(srcDir, function (filePath) {
    if (filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Zamena stare fontove za glavne naslove u Bebas Neue Pro Bold
        content = content.replace(/['"]?Empera Soft['"]?/g, "'Bebas Neue Pro Bold'");
        content = content.replace(/['"]?Chosence Bold['"]?/g, "'Bebas Neue Pro Bold'");

        // Zamena Josefin Sans u svim CSS fajlovima
        content = content.replace(/['"]?Josefin Sans['"]?/g, "'Outfit'");

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Modified:', filePath);
        }
    }
});
