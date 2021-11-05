<template>
  <div id="detail">
    <!-- 导航 -->
    <detail-nav-bar @titleClick="titleClick" ref="nav" class="detail-nav" />
    <scroll
      class="content"
      ref="scroll"
      :probe-type="3"
      @scroll="contentScroll"
    >
      <detail-swiper :top-images="topImages" />
      <detail-base-info :goods="goods" />
      <detail-shop-info :shop="shop" />
      <detail-goods-info
        :detailInfo="detailInfo"
        @imageLoad="imageLoad"
      ></detail-goods-info>
      <!-- 参数 -->
      <detail-param-info
        ref="params"
        :paramInfo="paramInfo"
      ></detail-param-info>
      <!-- 评论 -->
      <detail-comment-info
        ref="comment"
        :comment-info="commentInfo"
      ></detail-comment-info>
    </scroll>
    <detail-bottom-bar @addCart="addToCart" />

    <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>
  </div>
</template>

<script>
import DetailNavBar from "./childComps/DetailNavBar.vue";
import DetailSwiper from "./childComps/DetailSwiper.vue";
import DetailBaseInfo from "./childComps/DetailBaseInfo.vue";
import DetailShopInfo from "./childComps/DetailShopInfo.vue";
import DetailGoodsInfo from "./childComps/DetailGoodsInfo.vue";
import DetailParamInfo from "./childComps/DetailParamInfo.vue";
import DetailCommentInfo from "./childComps/DetailCommentInfo.vue";
import DetailBottomBar from "./childComps/DetailBottomBar.vue";

import Scroll from "components/common/scroll/Scroll.vue";
// import BackTop from "components/content/backTop/BackTop.vue";

import { debounce } from "common/utils.js";
import { backTopMixin } from "common/mixin.js";

import {
  getDetail,
  Goods,
  Shop,
  GoodsParam,
  getRecommend,
} from "network/detail";

export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    DetailBottomBar,

    Scroll,
    // BackTop,
  },
  mixins: [backTopMixin],
  data() {
    return {
      iid: null,
      topImages: [],
      goods: {},
      shop: {},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommends: [],
      themeTopYs: [],
      getThemeTopY: null,
      currentIndex: 0,
      // isShowBackTop: false,
    };
  },
  created() {
    // 1、保存传入的iid
    this.iid = this.$route.params.iid;

    // 2、根据iid请求详情数据
    getDetail(this.iid).then((res) => {
      // console.log(res);
      // 1.获取数据
      const data = res.result;
      // 2.取出顶部的轮播图片数据
      this.topImages = data.itemInfo.topImages;

      // 3.创建商品的对象
      this.goods = new Goods(
        data.itemInfo,
        data.columns,
        data.shopInfo.services
      );
      // 4.取出店铺信息
      this.shop = new Shop(data.shopInfo);
      // 5.取出商品的详情数据
      this.detailInfo = data.detailInfo;
      // 6.取出参数的信息
      this.paramInfo = new GoodsParam(
        data.itemParams.info,
        data.itemParams.rule
      );
      // 7.取出评论的信息
      if (data.rate.cRate !== 0) {
        this.commentInfo = data.rate.list[0];
      }

      /*
      // 1.第一次获取，值不对，
      // 值不对的原因：this.$refs.params.$el压根没有渲染
      this.themeTopYs = [];

      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop);

      console.log(this.themeTopYs);

      this.$nextTick(() => {
        // 2.第二次获取：值依然不对
        // 值不对的原因：图片没有计算在内
        // 根据最新的数据，对应的DOM是已经被渲染出来
        // 但是图片依然是没有加载完（目前获取到offsetTop不包含其中的图片）
        // offsetTop值不对的时候，都是因为图片的问题
        this.themeTopYs = [];

        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.params.$el.offsetTop);
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop);

        console.log(this.themeTopYs);
      });
      */
    });

    // 3、请求推荐数据
    getRecommend().then((res) => {
      this.recommends = res.data.list;
    });

    // 4、给getThemeTopY赋值（给this.themeTopYs赋值的操作进行了防抖）
    this.getThemeTopY = debounce(() => {
      this.themeTopYs = [];

      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      this.themeTopYs.push(Number.MAX_VALUE);

      // console.log(this.themeTopYs);
    }, 100);
  },
  mounted() {
    // console.log("mounted");
  },
  updated() {},
  methods: {
    imageLoad() {
      this.$refs.scroll.refresh();
      this.getThemeTopY();
    },
    titleClick(index) {
      // console.log(index);
      this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 100);
    },
    contentScroll(position) {
      // 1、获取y值
      const positionY = -position.y;

      // 2、positionY和主题中值进行比较
      // [0, 2901, 4322, Number.MAX_VALUE]
      // console.log(Number.MAX_VALUE);

      // positionY 在 0 和 2901 之间，index = 0
      // positionY 在 =2902 和 4322 之间，index = 1

      // positionY 在 >=4322 值，index = 2
      let length = this.themeTopYs.length;
      for (let i = 0; i < length - 1; i++) {
        // if (
        //   positionY > this.themeTopYs[i] &&
        //   positionY < this.themeTopYs[i + 1]
        // ) {
        //   console.log(i);
        // }
        if (
          this.currentIndex !== i &&
          positionY >= this.themeTopYs[i] &&
          positionY < this.themeTopYs[i + 1]
        ) {
          this.currentIndex = i;
          this.$refs.nav.currentIndex = this.currentIndex;
        }
        // if (
        //   this.currentIndex !== i &&
        //   ((i < length - 1 &&
        //     positionY >= this.themeTopYs[i] &&
        //     positionY < this.themeTopYs[i + 1]) ||
        //     (i === length - 1 && positionY >= this.themeTopYs[i]))
        // ) {
        //   this.currentIndex = i;
        //   this.$refs.nav.currentIndex = this.currentIndex;
        // }
      }

      // 3、是否显示回到顶部
      // this.isShowBackTop = -position.y > 1000;
      this.listenShowBackTop(position);
    },
    // backClick() {
    //   this.$refs.scroll.scrollTo(0, 0, 300);
    // },
    addToCart() {
      // 1、获取购物车需要展示的信息
      const product = {};
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.realPrice;
      product.iid = this.iid;

      // 2、将商品添加到购物车中
      // this.$store.cartList.push(product)
      // this.$store.commit("addCart", product);
      this.$store.dispatch("addCart", product);
    },
  },
};
</script>

<style scoped>
#detail {
  position: relative;
  z-index: 9;
  background-color: #fff;
  height: 100vh;
}

.detail-nav {
  position: relative;
  z-index: 9;
  background-color: #fff;
}

.content {
  height: calc(100% - 44px - 58px);
}
</style>