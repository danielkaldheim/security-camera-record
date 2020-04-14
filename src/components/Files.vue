<template>
  <div class="hello">
    <div class="video-block">
      <h4>Now</h4>
      <div>
        <img
          src="http://10.1.4.91:8080/?action=stream"
          width="640"
          height="480"
        />
      </div>
    </div>
    <div
      v-for="(file, index) in files"
      :key="file.filePath"
      class="video-block"
    >
      <h4>{{ printDate(file.date) }}</h4>
      <div>
        <video
          width="640"
          height="480"
          controls
          :id="'video-' + index"
          @durationchange="durationChangeEventHandler($event, file)"
        >
          <source :src="'/data/' + encodeURI(file.filePath)" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div class="action-block">
        <a :href="'/data/' + encodeURI(file.filePath)"
          ><i class="fa fa-download" aria-hidden="true"></i> Download</a
        >
        <i>{{ prettyFilesize(file.stats.size) }}</i>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import filesize from 'filesize';

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

const Files = Vue.extend({
  data() {
    return {
      files: []
    };
  },
  created() {
    this.fetchFiles();
  },
  methods: {
    durationChangeEventHandler($event: any, file: Video) {
      $event.target.addEventListener('timeupdate', (e: any) => {
        const currentTime = e.target.currentTime;
        console.log(file.date, currentTime);
      });
    },
    fetchFiles() {
      this.$http.get('/files').then((res: any) => {
        this.files = res.data.sort((a: Video, b: Video) => {
          const aDate = new Date(a.date);
          const bDate = new Date(b.date);
          return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
        });
      });
    },
    printDate(dateStr: string) {
      const d = new Date(dateStr);
      return d.toLocaleString('nb');
    },
    prettyFilesize(size: number) {
      return filesize(size);
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
  width: 640px;
  display: flex;
  padding-bottom: 1rem;
  justify-content: space-between;
}
</style>
