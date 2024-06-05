const { createApp } = Vue;
const app = createApp({
  data() {
    return {
      customImg: null,
      result: null,
      loading: false,
      modal: null
    }
  },
  computed: {
    resultText() {
      if (!this.result) return '尚未辨識';
      return this.result.map(p => `${p.class} (${(p.score * 100).toFixed(2)}%)`).join(', ');
    }
  },
  methods: {
    async photoHandler() {
      const file = this.$refs.photo.files[0];
      if (!file) return;

      this.loading = true;

      // 載入 COCO-SSD 模型
      this.model = this.model || await cocoSsd.load();

      const imageElement = document.createElement('img');
      imageElement.src = URL.createObjectURL(file);

      imageElement.onload = async () => {
        this.result = await this.model.detect(imageElement);
        console.log(this.result);


        this.drawBox(imageElement, this.result);

        // 清除暫時創建的 URL 資源
        URL.revokeObjectURL(imageElement.src);

      };
    },
    // 標示範圍
    async drawBox(imageElement, predictions) {
      const canvas = document.getElementById('canvas');
      const context = canvas.getContext('2d');

      // 設定畫布大小與圖片一致
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;

      // 畫圖片到畫布上
      context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

      for (let prediction of predictions) {
        const [x, y, width, height] = prediction.bbox;
        const text = `${prediction.class} (${(prediction.score * 100).toFixed(2)}%)`;

        // 畫框
        context.strokeStyle = 'yellow';
        context.lineWidth = 8;
        context.strokeRect(x, y, width, height);

        // 設定字體樣式
        context.font = '28px Arial';
        context.fillStyle = 'yellow';

        // 量測文字寬度與高度
        const textWidth = context.measureText(text).width;
        const textHeight = 28 * 1.5;
        const padding = 8;

        // 畫白色背景框，包含 padding
        context.fillStyle = 'white';
        context.fillRect(x - padding, y - 20 - textHeight - padding, textWidth + padding * 2, textHeight + padding * 2);

        // 畫文字
        context.fillStyle = 'black'; // 文字顏色
        context.fillText(text, x + padding / 2, y - 10 - textHeight / 2);
      }

      this.loading = false;
    }

  },
  mounted() {
    console.log('App mounted!');

  }
});

app.mount('#app')