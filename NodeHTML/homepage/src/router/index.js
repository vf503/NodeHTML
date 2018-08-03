import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
//
import View1 from '@/views/view1.vue'
import ViewVideoEdit from '@/views/ViewVideoEdit.vue'
import ViewCourseQuery from '@/views/ViewCourseQuery.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/view1',
      component: View1
    },
    {
      path: '/VideoEdit',
      component: ViewVideoEdit
    },
    {
      path: '/CourseQuery',
      component: ViewCourseQuery
    }
  ]
})
