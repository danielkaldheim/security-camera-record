import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import * as fs from 'fs';
import ES from '@elastic/elasticsearch';
import { exception } from 'console';

// initialize configuration
dotenv.config();

const zeroPad = (num: number, places: number) =>
  String(num).padStart(places, '0');

const client = new ES.Client({ node: process.env.ES_SERVER });

const port = process.env.SERVER_PORT;
const dataDir = process.env.DATA_DIR;

const app = express();
app.use(express.json());

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
      const res = file.match(
        /(?<name>[\w]+)_(?<year>[\d]{4})-(?<month>[\d]{2})-(?<day>[\d]{2}):(?<time>[\d:\d:\d]+)/
      );
      files.push({
        filePath: file,
        date: new Date(res[2] + '-' + res[3] + '-' + res[4] + ' ' + res[5]),
        stats: {
          size: stats.size,
          atime: stats.atime,
          mtime: stats.mtime,
          ctime: stats.ctime
        }
      });
    }
  });
  res.json(files);
});

app.post('/log', async (req, res) => {
  if (!req.body || !req.body.from || !req.body.to) {
    res.json({ error: true, message: 'Invalid date' });
  }
  const from = new Date(req.body.from);
  from.setHours(from.getHours() - 2);
  const to = new Date(req.body.to);
  to.setHours(to.getHours() - 2);

  // console.log(
  //   from.getFullYear() +
  //     '-' +
  //     zeroPad(from.getMonth() + 1, 2) +
  //     '-' +
  //     zeroPad(from.getDate(), 2) +
  //     'T' +
  //     zeroPad(from.getHours(), 2) +
  //     ':' +
  //     zeroPad(from.getMinutes(), 2) +
  //     ':' +
  //     zeroPad(from.getSeconds(), 2) +
  //     ' -> ' +
  //     to.getFullYear() +
  //     '-' +
  //     zeroPad(to.getMonth() + 1, 2) +
  //     '-' +
  //     zeroPad(to.getDate(), 2) +
  //     'T' +
  //     zeroPad(to.getHours(), 2) +
  //     ':' +
  //     zeroPad(to.getMinutes(), 2) +
  //     ':' +
  //     zeroPad(to.getSeconds(), 2)
  // );
  try {
    const result = await client.search({
      index: 'hass-events-v3-*',
      body: {
        from: 0,
        size: 1000,
        query: {
          bool: {
            must: [
              {
                query_string: {
                  query:
                    '(binary_sensor.hoveddor) OR (binary_sensor.sportsbod_dor) OR (person.jeanette_kaldheim) OR (person.daniel_rufus_kaldheim) OR (input_boolean.is_home) OR (sensor.oregon_scientific_temperature) OR (alarm_control_panel.skeisvold_60_alarm)',
                  fields: ['hass.entity_id']
                }
              }
            ],
            filter: [
              {
                range: {
                  '@timestamp': {
                    gte:
                      from.getFullYear() +
                      '-' +
                      zeroPad(from.getMonth() + 1, 2) +
                      '-' +
                      zeroPad(from.getDate(), 2) +
                      'T' +
                      zeroPad(from.getHours(), 2) +
                      ':' +
                      zeroPad(from.getMinutes(), 2) +
                      ':' +
                      zeroPad(from.getSeconds(), 2), // '2020-04-27T10:46:06'
                    lte:
                      to.getFullYear() +
                      '-' +
                      zeroPad(to.getMonth() + 1, 2) +
                      '-' +
                      zeroPad(to.getDate(), 2) +
                      'T' +
                      zeroPad(to.getHours(), 2) +
                      ':' +
                      zeroPad(to.getMinutes(), 2) +
                      ':' +
                      zeroPad(to.getSeconds(), 2) // '2020-04-27T10:46:06'
                  }
                }
              }
            ]
          }
        }
      }
    });
    if (result.statusCode == 200) {
      res.json(result.body);
    } else {
      res.json(result);
    }
  } catch (error) {
    res.json(error);
  }
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
