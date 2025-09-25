import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV;

let reset = '\x1b[0m';
let bright = '\x1b[1m';
let dim = '\x1b[2m';
let underscore = '\x1b[4m';
let blink = '\x1b[5m';
let reverse = '\x1b[7m';
let hidden = '\x1b[8m';

let fgBlack = '\x1b[30m';
let fgRed = '\x1b[31m';
let fgGreen = '\x1b[32m';
let fgYellow = '\x1b[33m';
let fgBlue = '\x1b[34m';
let fgMagenta = '\x1b[35m';
let fgCyan = '\x1b[36m';
let fgWhite = '\x1b[37m';

let bgBlack = '\x1b[40m';
let bgRed = '\x1b[41m';
let bgGreen = '\x1b[42m';
let bgYellow = '\x1b[43m';
let bgBlue = '\x1b[44m';
let bgMagenta = '\x1b[45m';
let bgCyan = '\x1b[46m';
let bgWhite = '\x1b[47m';

const log = (bg: string, message: string) => {
  console.log(`${eval(bg)}${message} ${reset}`);
};

export const logger = (color: string, message: string) => {
  console.log(`${eval(color)}${message} ${reset}`);
};

export const logDB = () => {
  log(
    `${
      NODE_ENV === 'dev'
        ? 'bgBlue'
        : NODE_ENV === 'preprod'
        ? 'bgYellow'
        : 'bgWhite'
    }`,
    `Files Service running on port ${process.env.PORT} and you are connected on : ${NODE_ENV}`
  );
};
