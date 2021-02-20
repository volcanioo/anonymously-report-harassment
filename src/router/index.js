import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Report from '../views/report';
import Login from '../views/Login.vue';
import AnonymousLogin from '../views/AnonymousLogin.vue';
import CaseDetail from '../views/CaseDetail.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Verify from '../views/Verify.vue';
import { auth } from '../firebase/index';
import store from "../store/index";
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/report',
    name: 'Report',
    component: Report,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      company: true
    }
  },
  {
    path: '/case-detail',
    name: 'CaseDetail',
    component: CaseDetail,
    meta: {
      case: true
    }
  },
  {
    path: '/anonymous-login',
    name: 'AnonymousLogin',
    component: AnonymousLogin,
    meta: {
      anonymous: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      company: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      auth: true
    }
  },
  {
    path: '/email-verification',
    name: 'Verify',
    component: Verify,
    meta: {
      auth: true
    },
  },
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

router.beforeEach((to, from, next) => {
  // TODO !! We need to update this function to optimize firebase connections.
  auth.onAuthStateChanged(user => {
    if (user) {
      store.dispatch('getCompanyData', {
        company_name: user.displayName,
        company_email: user.email,
        is_mail_verified: user.emailVerified,
        photo_url: user.photoURL,
        phone_number: user.phoneNumber,
        userUid: user.uid,
      });
    }
  })
  if (to.matched.some(record => record.meta.auth)) {
    auth.onAuthStateChanged(user => {
      if (user) {
        next()
      } else {
        next({
          path: "/login",
        })
      }
    })
  } else if (to.matched.some(record => record.meta.case)) {
    if (localStorage.getItem('report')) {
      store.dispatch('saveReport', JSON.parse(localStorage.getItem('report')));
      next()
    } else {
      next({
        path: "/anonymous-login",
      })
    }
  } else if (to.matched.some(record => record.meta.anonymous)) {
    if (localStorage.getItem('report')) {
      store.dispatch('saveReport', JSON.parse(localStorage.getItem('report')));
      next({
        path: "/case-detail",
      })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.company)) {
    auth.onAuthStateChanged(user => {
      if (user) {
        next({
          path: "/dashboard",
        })
      } else {
        next()
      }
    })

  } else {
    next()
  }

})

export default router;
