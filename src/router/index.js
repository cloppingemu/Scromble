import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
    props: true
  },
  {
    path: "/about",
    name: "About",
    component: () => import(/* webpackChunkName: "about" */ "@/views/ViewAbout.vue"),
    props: true
  },
  {
    path: "*",
    name: "404",
    component: () => import(/* webpackChunkName: "four0four" */ "@/views/ViewNotFound.vue"),
    props: true
  },
  {
    path: "/game",
    name: "Game",
    component: () => import(/* webpackChunkName: "game" */ "@/views/Game.vue"),
    props: true
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
