<template>
  <div class="hello">
    <div v-for="file in files" :key="file.filePath" class="video-block">
      <h4>{{ printDate(file.date) }}</h4>
      <div>
        <video width="640" height="480" controls>
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
    fetchFiles() {
      this.$http.get('/files').then((res: any) => {
        this.files = res.data;
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
