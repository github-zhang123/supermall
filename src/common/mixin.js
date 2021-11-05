import { debounce } from "./utils"
import BackTop from "components/content/backTop/BackTop.vue";

export const itemListenerMixin = {

}

export const backTopMixin = {
    components: {
        BackTop
    },
    data() {
        return {
            isShowBackTop: false,
        }
    },
    methods: {
        backClick() {
            this.$refs.scroll.scrollTo(0, 0, 300);
        },
        listenShowBackTop(position) {
            this.isShowBackTop = -position.y > 1000;
        }
    }
}