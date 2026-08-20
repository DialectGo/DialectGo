const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles('frontend');

// Build a map of filename -> new folder path
const iconDirs = ['bottombar', 'nav', 'actions', 'status', 'profile'];
const iconMap = {};

for (const dir of iconDirs) {
  const filesInDir = fs.readdirSync(`frontend/assets/icons/${dir}`);
  for (const file of filesInDir) {
    iconMap[file] = `assets/icons/${dir}/${file}`;
  }
}

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace assets/icons/file.png -> assets/icons/dir/file.png
  for (const [filename, newPath] of Object.entries(iconMap)) {
    // Regex to match exact filename in require or import
    const regex1 = new RegExp(`assets/icons/${filename}`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, newPath);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated paths in ${filePath}`);
  }
}
