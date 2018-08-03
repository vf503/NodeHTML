<template>
  <div id="root">
    <div style="clean:both;position:relative">
    <el-tooltip :content="'模式: ' + ListMode" placement="top" >
      <el-switch v-model="ListMode"
                 active-color="#13ce66"
                 inactive-color="#1E90FF"
                 active-value="下载管理"
                 inactive-value="发布管理"
                 @change="ModeToggle">
      </el-switch>
    </el-tooltip>
    </div>
    <data-tables id="main"
                 v-bind:class="{ 'FullSizeTable' : isFull, 'HalfSizeTable': !isFull}"
                 :search-def="searchDef"
                 :data="data"
                 :pagination-def="paginationDef"
                 @cell-click="PlayCourse">
      <el-table-column prop="CourseId"
                       label="编号"
                       sortable
                       minWidth="80"
                       align="center"
                       >
      </el-table-column>
      <el-table-column prop="title"
                       label="题目"
                       sortable
                       minWidth="150"
                       align="center">
      </el-table-column>
      <el-table-column prop="date"
                       label="日期"
                       sortable
                       minWidth="80"
                       align="center">
      </el-table-column>
      <el-table-column prop="lecturer"
                       label="讲师"
                       sortable
                       minWidth="80"
                       align="center"
                       :formatter="formatter">
      </el-table-column>
      <el-table-column label="操作"
                       minWidth="180"
                       align="center">
        <template slot-scope="scope">
          <el-button size="mini"
                     v-show="!isDownloadTableShow"
                     @click="handleEdit(scope.$index, scope.row)">修改</el-button>
          <el-button size="mini"
                     v-show="!isDownloadTableShow"
                     @click="handlePublish(scope.$index, scope.row)">发布</el-button>
          <el-button size="mini"
                     type="danger"
                     v-show="!isDownloadTableShow"
                     @click="handleDelete(scope.$index, scope.row)">取消发布</el-button>
          <el-button size="mini"
                     v-show="isDownloadTableShow"
                     @click="handleAdd(scope.$index, scope.row)">添加</el-button>
        </template>
    </el-table-column>
    </data-tables>
    <div v-show="isDownloadTableShow" style="width:49%;margin-top:80px; float:right;clean:right; position:relative">
    <data-tables id="download" :search-def="DownloadTableSearchDef" :data="DownloadData" :pagination-def="paginationDef">
      <el-table-column prop="ProjectId"
                       label="编号"
                       sortable
                       minWidth="80"
                       align="center"
                       >
      </el-table-column>
      <el-table-column prop="title"
                       label="题目"
                       sortable
                       minWidth="100"
                       align="center">
      </el-table-column>
      <el-table-column prop="CreateDate"
                       label="日期"
                       sortable
                       minWidth="80"
                       align="center">
      </el-table-column>
      <el-table-column prop="lecturer__name"
                       label="讲师"
                       sortable
                       minWidth="80"
                       align="center"
                       :formatter="formatter">
      </el-table-column>
      <el-table-column label="操作"
                       minWidth="80"
                       align="center">
      <template slot-scope="scope">
        <el-button
          size="mini"
          type="danger"
          @click="handleDownloadDelete(scope.$index, scope.row)">删除</el-button>
      </template>
    </el-table-column>
    </data-tables>
    <el-select v-model="value" placeholder="选择模板" style="margin-top:10px; float:left;clean:right; position:relative">
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value">
    </el-option>
    </el-select>
     <el-button type="primary" style="margin-top:10px; float:right;clean:right; position:relative" @click="handleDownloadList()">加入下载队列</el-button>
    </div>
  </div>
</template>

<script type="text/javascript">
import axios from 'axios'

export default {
  created: function () {
    axios.get('/course/finished')
      .then(function (response) {
        console.log(response)
        this.data = response.data
      }.bind(this))
      .catch(function (response) {
        console.log(response)
      })
  },
  data () {
    return {
      ListMode: '0',
      isDownloadTableShow: false,
      isFull: true,
      data: [],
      DownloadData: [],
      options: [{
        value: '1',
        label: '标准'
      },
      {
        value: '2',
        label: '精品'
      },
      {
        value: '3',
        label: '微课'
      }],
      value: '',
      paginationDef: {
        pageSize: 1,
        pageSizes: [5, 10, 20],
        currentPage: 1
      },
      DownloadTableSearchDef: {
        show: false
      }
    }
  },
  methods: {
    PlayCourse (row, column) {
      if (column.id !== 'el-table_1_column_5') {
        window.open('http://newpms.cei.cn/CourseFile/2018/' + row.CourseId + '/index.html')
      }
    },
    handleEdit (index, row) {
      console.log(index, row)
      this.$message({
        message: '即将打开编辑页面',
        type: 'success'
      })
      window.open('')
    },
    handlePublish (index, row) {
      console.log(index, row)
      this.$message({
        // message: '成功发布',
        // type: 'success'
      })
    },
    handleDelete (index, row) {
      console.log(index, row)
      this.$message({
        // message: '已取消发布',
        // type: 'warning'
      })
    },
    handleAdd (index, row) {
      this.DownloadData.push(this.data[index])
      this.$message({
        // message: '已加入下载队列',
        // type: 'success'
      })
    },
    handleDownloadDelete (index, row) {
      this.DownloadData.splice(index, 1)
      this.$message({
        // message: '已清除',
        // type: 'warning'
      })
    },
    handleDownloadList () {
      this.$message({
        // message: '已生成下载任务',
        // type: 'success'
      })
    },
    ModeToggle () {
      this.isDownloadTableShow = !this.isDownloadTableShow
      this.isFull = !this.isFull
    }
  }
}
</script>

<style>
.FullSizeTable {
  width:100%;padding-top:40px;
}
  .FullSizeTable Table {
    min-width: 1200px;
  }
.HalfSizeTable {
  width:49%;padding-top:40px; float:left;clean:right; position:relative
}
</style>
