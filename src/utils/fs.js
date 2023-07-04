import fs from 'fs';
const { log } = console;

export const readFile = (path) => {
  if (fs.existsSync(process.cwd() + path)) {
    return fs.readFileSync(process.cwd() + path, 'utf-8');
  } else log('Cannot read file in ' + path);
};

export const writeFile = (path, data) => {
  return fs.writeFileSync(process.cwd() + path, JSON.stringify(data, null, 2));
};
