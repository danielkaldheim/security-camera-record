import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import * as fs from 'fs';
// initialize configuration
dotenv.config();

const port = process.env.SERVER_PORT;
const dataDir = process.env.DATA_DIR;

const app = express();

app.use('/data', express.static(dataDir));
app.use('/css', express.static(__dirname + '/css'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/files', (req, res) => {
  const files: any[] = [];

  fs.readdirSync(dataDir).forEach(file => {
    if (/.*\.mp4$/.test(file)) {
      const stats = fs.statSync(dataDir + '/' + file);
      const res = file.match(/(?<name>[\w]+)_(?<year>[\d]{4})-(?<month>[\d]{2})-(?<day>[\d]{2}):(?<time>[\d:\d:\d]+)/);
      files.push({
        filePath: file,
        date: new Date(res[2]+'-'+res[3]+'-'+res[4]+' '+res[5]),
        stats: {
          size: stats.size,
          atime: stats.atime,
          mtime: stats.mtime,
          ctime: stats.ctime,
        }
      });
    }
  });
  res.json(files);
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
