<template>
  <div>
    <div
      class="btn-group days"
      role="group"
      v-if="this.days.length > 0 && this.activeDay"
    >
      <button
        type="button"
        class="btn btn-outline-dark"
        :class="{ active: isActiveDay(day) }"
        v-for="(day, index) in days"
        :key="index"
        @click="setActiveDay(day)"
      >
        {{ day }}
      </button>
    </div>
    <div class="video-block" v-if="isActiveDay('Today')">
      <h4>Now</h4>
      <div>
        <img src="http://10.1.4.91:8080/?action=stream" class="video-preview" />
      </div>
    </div>
    <v-template v-for="(file, index) in files" :key="file.filePath">
      <div class="video-block" v-if="shouldShowVideo(file)">
        <h4>{{ printDate(file.date) }}</h4>
        <div style="display:flex; align-content: space-around;">
          <div style="margin-left: auto">
            <video
              class="video-preview"
              controls
              :id="'video-' + index"
              @durationchange="durationChangeEventHandler($event, file)"
            >
              <source
                :src="'/data/' + encodeURI(file.filePath)"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>

          <div
            style="text-align: left; margin-right: auto; padding-left: 1rem; width: 320px;"
          >
            <h5>Events:</h5>
            <v-template v-if="activePlayer.file == file">
              <v-template v-for="(entity, index) in entities" :key="index">
                <div>
                  <strong>{{ entity.name }}</strong
                  >: <span v-html="getLogItem(entity)" />
                </div>
                <ul v-if="entity.domain == 'person' || entity.domain == 'binary_sensor'">
                  <li
                    v-for="(log, index) in getLogChanges(entity)"
                    :key="'changes-' + index"
                  >
                    <small><strong>{{ log.time }}</strong>: {{ log.value }}</small>
                  </li>
                </ul>
              </v-template>
            </v-template>
          </div>
        </div>
        <div class="action-block">
          <a :href="'/data/' + encodeURI(file.filePath)"
            ><i class="fa fa-download" aria-hidden="true"></i> Download</a
          >
          <i>{{ prettyFilesize(file.stats.size) }}</i>
        </div>
      </div>
    </v-template>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import filesize from 'filesize';
import moment from 'moment';

moment.locale('nb');

interface Video {
  filePath: string;
  date: string;
  stats: {
    size: number;
    atime: string;
    mtime: string;
    ctime: string;
  };
}

interface Player {
  file?: Video;
  currentTime: number;
  currentDate?: Date;
  status?: string;
}

interface Entity {
  id: string;
  name: string;
  domain: string;
}

interface LogItem {
  file: string;
  timestamp: Date;
  time: string;
  name: string;
  domain: string;
  entity: string;
  value: string;
}

interface DataInterface {
  files: Video[];
  days: string[];
  activeDay: string;
  logs: LogItem[];
  entities: Entity[];
  activePlayer: Player;
}

const Files = Vue.extend({
  data() {
    const d: DataInterface = {
      activeDay: 'Today',
      files: [],
      days: [],
      logs: [],
      entities: [],
      activePlayer: {
        file: undefined,
        currentTime: 0,
        currentDate: undefined,
        status: undefined
      }
    };
    return d;
  },
  created() {
    this.fetchFiles();
  },
  methods: {
    durationChangeEventHandler($event: any, file: Video) {
      $event.target.addEventListener('play', () => {
        const date = new Date(file.date);
        this.fetchLog(file, date);
        this.activePlayer.file = file;
        this.activePlayer.status = 'play';
      });
      $event.target.addEventListener('timeupdate', (e: any) => {
        const currentTime = e.target.currentTime;
        const date = new Date(file.date);
        date.setSeconds(date.getSeconds() + currentTime);
        this.activePlayer.file = file;
        this.activePlayer.status = 'playing';
        this.activePlayer.currentTime = currentTime;
        this.activePlayer.currentDate = date;
      });
    },
    isActiveDay(day: string): boolean {
      return day == this.activeDay;
    },
    setActiveDay(day: string) {
      this.activeDay = day;
    },
    shouldShowVideo(file: Video) {
      const date = new Date(file.date);
      const today = new Date();
      let dateString: string = this.dateString(date);
      const todayString: string = this.dateString(today);
      if (dateString == todayString) {
        dateString = 'Today';
      }
      return dateString == this.activeDay;
    },
    fetchFiles() {
      this.$http.get('/files').then((res: any) => {
        this.files = res.data.sort((a: Video, b: Video) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
        });
        this.files.splice(0, 1);

        this.files.forEach((item: Video) => {
          const date = new Date(item.date);
          const today = new Date();
          let dateString: string = this.dateString(date);
          const todayString: string = this.dateString(today);
          if (dateString == todayString) {
            dateString = 'Today';
          }
          if (this.days.indexOf(dateString) <= -1) {
            this.days.push(dateString);
          }
        });
      });
    },
    dateString(date: Date): string {
      return (
        date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
      );
    },
    printDate(dateStr: string) {
      const d = new Date(dateStr);
      return d.toLocaleString('nb');
    },
    prettyFilesize(size: number) {
      return filesize(size);
    },
    getLogChanges(entity: Entity) {
      let logElements: LogItem[] = this.logs.filter((log: LogItem) => {
        if (log.entity == entity.id) {
          return true;
        }
      }).sort((a: LogItem, b: LogItem) => {
          const aDate = new Date(a.timestamp);
          const bDate = new Date(b.timestamp);
          return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
        });

      let prevValue = logElements[0].value;
      const changes: LogItem[] = [];
      for (const log of logElements) {
        if (prevValue != log.value) {
          changes.push(log);
          prevValue = log.value;
        }
      }
      return changes;
    },
    getLogItem(entity: Entity) {
      let logElements: LogItem[] = this.logs
        .filter((log: LogItem) => {
          if (log.entity == entity.id) {
            return true;
          }
        })
        .sort((a: LogItem, b: LogItem) => {
          const aDate = new Date(a.timestamp);
          const bDate = new Date(b.timestamp);
          return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
        });

      if (logElements.length > 0) {
        const item = logElements.find((log: LogItem) => {
          if (this.activePlayer.currentDate) {
            if (log.timestamp <= this.activePlayer.currentDate) {
              return true;
            }
          }
        });
        if (item) {
          let result = item.value;
          if (entity.domain == 'binary_sensor') {
            result = item.value == '1' ? 'Åpen' : 'Lukket';
          } else if (entity.domain == 'input_boolean') {
            if (item.value == '1') {
              result =
                '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
            } else {
              result = '<i class="fa fa-square-o" aria-hidden="true"></i>';
            }
          } else if (entity.domain == 'person') {
            result = item.value == '1' ? 'Hjemme' : 'Borte';
          } else if (entity.domain == 'sensor') {
            result = parseFloat(item.value).toFixed(2);
          }
          return result + ' &ndash; <small><em>' + item.time + '</em></small>';
        }
      }
      return 'N/A';
    },
    fetchLog(file: Video, timeStamp: Date) {
      const from = new Date(timeStamp.getTime());
      from.setMinutes(from.getMinutes() - 10);
      const to = new Date(timeStamp.getTime());
      to.setHours(to.getHours() + 1);

      this.$http
        .post('/log', {
          from: from.toUTCString(),
          to: to.toUTCString()
        })
        .then((res: any) => {
          const logData: any = res.data;
          if (logData.hits.total > 0) {
            const hits = logData.hits.hits;
            hits.forEach((hit: any) => {
              const entity: Entity = {
                id: hit['_source']['hass.entity_id'],
                name: hit['_source']['hass.attributes']['friendly_name'],
                domain: hit['_source']['hass.domain']
              };
              let found = false;
              for (const ent of this.entities) {
                if (ent.id == hit['_source']['hass.entity_id']) {
                  found = true;
                }
              }
              if (!found) {
                this.entities.push(entity);
              }
              const time = new Date(hit['_source']['@timestamp']);
              this.logs.push({
                file: file.filePath,
                timestamp: new Date(hit['_source']['@timestamp']),
                time: moment(time).format('LTS'),
                name: hit['_source']['hass.attributes']['friendly_name'],
                domain: hit['_source']['hass.domain'],
                entity: hit['_source']['hass.entity_id'],
                value: hit['_source']['hass.value']
              });
            });
            this.entities = this.entities
              .sort((a: Entity, b: Entity) => {
                return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
              })
              .sort((a: Entity, b: Entity) => {
                return a.domain < b.domain ? -1 : a.domain > b.domain ? 1 : 0;
              });
          }
        });
    }
  }
});
export default Files;
</script>

<style scoped>
.video-block {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  text-align: center;
}
.action-block {
  margin: 0 auto;
  max-width: 960px;
  display: flex;
  padding-bottom: 1rem;
  justify-content: space-between;
}
.video-preview {
  object-fit: cover;
  margin: 0 auto;
  display: block;
  max-width: 640px;
  max-height: 480px;
  width: 100%;
  height: auto;
  margin-bottom: 1rem;
}
.days {
  display: block;
  margin: 0.5rem auto;
  max-width: 960px;
  text-align: center;
}
</style>
