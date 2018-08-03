<template>
  <div id="root">
    <div style="margin-top: 15px;">
      <el-input size="medium" placeholder="请输入内容" v-model="QueryTitle">
        <template slot="prepend">
          题目
        </template>
      </el-input>
      <el-input size="medium" placeholder="请输入内容" v-model="QueryLecturer">
        <template slot="prepend">
          讲师
        </template>
      </el-input>
      <el-input size="medium" placeholder="请输入内容" v-model="QueryKey">
        <template slot="prepend">
          关键词
        </template>
      </el-input>
      <el-button slot="append" icon="el-icon-search" @click="handleQuery()"></el-button>
    </div>
    <div style="margin-top:10px; width:30%;">
      <el-select v-model="xlsxField" placeholder="请选择">
        <el-option label="编号" value="id"></el-option>
        <el-option label="标题" value="title"></el-option>
      </el-select>
      <el-upload ref="xlsxUpload"
                 action="https://jsonplaceholder.typicode.com/posts/"
                 accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                 :limit="1"
                 :on-preview="handleXlsxPreview"
                 :on-remove="handleXlsxRemove"
                 :on-exceed="handleXlsxExceed"
                 :on-change="handleXlsxChange"
                 :file-list="xlsxList"
                 :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button size="small" type="success" @click="submitXlsx">查询</el-button>
        <div slot="tip">只能上传Excel文件<a href="simple.xlsx" @click="OldListDownload">示例下载</a></div>
      </el-upload>
    </div>
    <div>
      <el-table ref="MainTable"
                :data="QueryData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
                @selection-change="handleSelectionChange"
                v-loading="loading"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-table-column type="selection"
                         width="50">
        </el-table-column>
        <el-table-column prop="CourseId"
                         label="编号"
                         sortable
                         minWidth="80"
                         align="center">
        </el-table-column>
        <el-table-column prop="DataType"
                         label="新/旧"
                         sortable
                         minWidth="80"
                         align="center">
        </el-table-column>
        <el-table-column prop="title"
                         label="题目"
                         sortable
                         minWidth="150"
                         align="center">
        </el-table-column>
        <el-table-column prop="CreateDate"
                         label="日期"
                         sortable
                         minWidth="80"
                         align="center">
        </el-table-column>
        <el-table-column prop="lecturer_name"
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
                       @click="handleAdd(scope.$index, scope.row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="currentPage"
                     :page-sizes="[10, 20, 30]"
                     :page-size="pagesize"
                     layout="prev, pager, next, jumper,sizes,total"
                     :total="QueryData.length">
      </el-pagination>
      <div>
        <el-button size="mini" @click="BatchAdd()">添加所选</el-button>
        <el-button size="mini" @click="AllAdd()">全添</el-button>
      </div>
    </div>
    <div style="width:49%;float:left;clean:left; position:relative">
      <el-tag>新课队列</el-tag>
      <span v-for="item in DownloadData" :key="item.CourseId">
        <div>{{item.CourseId}}-->{{item.title}}</div>
      </span>
      <el-button size="mini" @click="SetupTask()">配置任务</el-button>
    </div>
    <div style="width:49%;float:left;clean:left; position:relative">
      <el-tag>旧课队列</el-tag>
      <el-table id="OldTable"
                :data="OldlistData">
        <el-table-column prop="CourseId"
                         label="编号"
                         sortable
                         minWidth="80"
                         align="center">
        </el-table-column>
        <el-table-column prop="title"
                         label="题目"
                         sortable
                         minWidth="150"
                         align="center">
        </el-table-column>
        <el-table-column prop="CreateDate"
                         label="日期"
                         sortable
                         minWidth="80"
                         align="center">
        </el-table-column>
        <el-table-column prop="lecturer_name"
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
                       @click="handleOldDel(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <a id="ExcelLink" download="" href="#">1</a>
      <a download="" href="#" @click="OldListDownload($event)">导出列表</a>
    </div>
    <el-button type="primary" style="margin-top:10px; float:right;clean:right; position:relative" @click="handleDownloadList()">加入下载队列</el-button>
    <div>
      <el-dialog title="配置任务"
                 :visible.sync="SetupTaskVisible"
                 width="80%"
                 :before-close="SetupTaskClose">
        <el-select v-model="TaskTypeVal" placeholder="选择任务种类"
                   @change="TaskTypeChange">
          <el-option v-for="item in TaskType"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value">
          </el-option>
        </el-select>
        <div v-show="DownloadTaskDetailsShow">
          <el-select v-model="DownloadTaskDetailsVal" placeholder="选择模板类型">
            <el-option v-for="item in DownloadTaskDetails"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div v-show="EncodeTaskDetailsShow">
          <el-select v-model="EncodeTaskDetailsVal" placeholder="选择输出格式">
            <el-option v-for="item in EncodeTaskDetails"
                       :key="item.value"
                       :label="item.label"
                       :value="item.value">
            </el-option>
          </el-select>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary">提交</el-button>
          <el-button @click="SetupTaskVisible = false">关闭</el-button>
        </span>
      </el-dialog>
      <el-dialog title="上传Excel"
                 :visible.sync="ExcelVisible"
                 width="80%"
                 :before-close="ExcelClose">
        <div><el-progress type="circle" :percentage="ExcelProgress"></el-progress></div>
        <el-tag>无结果数据列表</el-tag>
        <el-table :data="excelLog">
          <el-table-column prop="id"
                           label="编号"
                           sortable
                           minWidth="80"
                           align="center">
          </el-table-column>
          <el-table-column prop="title"
                           label="标题"
                           sortable
                           minWidth="80"
                           align="center">
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button @click="ExcelVisible = false">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script type="text/javascript">
import axios from 'axios'
// import ExcellentExport from 'excellentexport'
export default {
  created: function () {
  },
  data () {
    return {
      ListMode: '0',
      loading: false,
      xlsxList: [],
      xlsxFileList: [],
      excelData: [],
      excelLog: [],
      QueryData: [],
      NewData: [],
      OldData: [],
      multipleSelectionData: [],
      currentPage: 1,
      pagesize: 10,
      DownloadData: [],
      OldlistData: [],
      QueryLecturer: '',
      QueryTitle: '',
      QueryKey: '',
      ExcelProgress: 0,
      xlsxField: '',
      SetupTaskVisible: false,
      ExcelVisible: false,
      TaskTypeVal: '',
      TaskType: [{
        value: '1',
        label: '下载课件(套模板)'
      }, {
        value: '2',
        label: '下载视频(输出视频文件)'
      }],
      DownloadTaskDetailsVal: '',
      DownloadTaskDetails: [{
        value: '1',
        label: '模板1'
      }, {
        value: '2',
        label: '模板2'
      }, {
        value: '3',
        label: '模板3'
      }],
      EncodeTaskDetailsVal: '',
      EncodeTaskDetails: [{
        value: '1',
        label: '格式1'
      }, {
        value: '2',
        label: '格式2'
      }, {
        value: '3',
        label: '格式3'
      }],
      DownloadTaskDetailsShow: false,
      EncodeTaskDetailsShow: false
    }
  },
  methods: {
    handleQuery () {
      if (this.QueryTitle === '' && this.QueryKey === '' && this.QueryLecturer === '') {
        this.$message({
          message: '至少填写一项内容',
          type: 'success'
        })
      } else {
        this.QueryData = []
        this.$message({
          message: '开始检索',
          type: 'success'
        })
        let UrlParam = '?a=1'
        if (this.QueryTitle !== '') {
          UrlParam += '&title=' + encodeURIComponent(this.QueryTitle)
        }
        if (this.QueryLecturer !== '') {
          UrlParam += '&lecturer=' + encodeURIComponent(this.QueryLecturer)
        }
        if (this.QueryKey !== '') {
          UrlParam += '&key=' + encodeURIComponent(this.QueryKey)
        }
        axios.get('http://newpms.cei.cn/course/FieldQuery/' + UrlParam, {withCredentials: true})
          .then(function (response) {
            // console.log(response)
            this.NewData = response.data
            this.NewData.forEach((item, index) => {
              item['DataType'] = '新课件'
            })
            this.QueryData = this.QueryData.concat(this.NewData)
          }.bind(this))
          .catch(function (response) {
            // console.log(response)
          })
        this.loading = true
        axios.get('http://newpms.cei.cn/OldCourseQuery/' + UrlParam, { withCredentials: true })
          .then(function (response) {
            // console.log(response)
            this.OldData = response.data
            this.QueryData = this.QueryData.concat(this.OldData)
            this.loading = false
          }.bind(this))
          .catch(function (response) {
            // console.log(response)
          })
        // this.QueryData = this.NewData.concat(this.OldData)
      }
    },
    handleSelectionChange (val, row) {
      this.multipleSelectionData = val
    },
    handleSizeChange (size) {
      this.pagesize = size
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
    },
    BatchAdd () {
      this.multipleSelectionData.map((item) => {
        let check = true
        if (item['DataType'] === '新课件') {
          for (var DownloadItem of this.DownloadData) {
            if (DownloadItem['CourseId'] === item['CourseId']) {
              check = false
              break
            }
          }
          if (check) {
            this.DownloadData.push(item)
          }
        } else if (item['DataType'] === '旧课件') {
          for (var OldlistItem of this.OldlistData) {
            if (OldlistItem['CourseId'] === item['CourseId']) {
              check = false
              break
            }
          }
          if (check) {
            this.OldlistData.push(item)
          }
        }
      })
    },
    AllAdd () {
      this.QueryData.map((item) => {
        let check = true
        if (item['DataType'] === '新课件') {
          for (var DownloadItem of this.DownloadData) {
            if (DownloadItem['CourseId'] === item['CourseId']) {
              check = false
              break
            }
          }
          if (check) {
            this.DownloadData.push(item)
          }
        } else if (item['DataType'] === '旧课件') {
          for (var OldlistItem of this.OldlistData) {
            if (OldlistItem['CourseId'] === item['CourseId']) {
              check = false
              break
            }
          }
          if (check) {
            this.OldlistData.push(item)
          }
        }
      })
    },
    handleAdd (index, row) {
      this.DownloadData.push(this.QueryData[index])
      this.$message({
        // message: '已加入下载队列',
        // type: 'success'
      })
    },
    handleDownloadList () {
      this.$message({
        message: '已生成下载任务',
        type: 'success'
      })
    },
    SetupTask () {
      this.SetupTaskVisible = true
    },
    SetupTaskClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.SetupTaskVisible = false
          done()
        })
        .catch(_ => { })
    },
    TaskTypeChange () {
      console.log(1)
      if (this.TaskTypeVal === '1') {
        console.log(1)
        this.DownloadTaskDetailsShow = true
        this.EncodeTaskDetailsShow = false
      } else if (this.TaskTypeVal === '2') {
        console.log(2)
        this.DownloadTaskDetailsShow = false
        this.EncodeTaskDetailsShow = true
      }
    },
    XlsxClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          this.SetupTaskVisible = false
          done()
        })
        .catch(_ => { })
    },
    handleXlsxExceed (files, fileList) {
      this.$message.warning('请先删除前一个文件')
    },
    handleXlsxRemove (file, xlsxList) {
      console.log(file, xlsxList)
    },
    handleXlsxPreview (file) {
    },
    handleXlsxChange (file, xlsxList) {
      this.xlsxFileList = xlsxList
    },
    fixdata: function (data) { // 文件流转BinaryString
      var o = ''
      var l = 0
      var w = 10240
      for (; l < data.byteLength / w; ++l) {
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
      }
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
      return o
    },
    submitXlsx () {
      let _this = this
      _this.ExcelProgress = 0
      //
      if (this.xlsxField === '') {
        this.$message.warning('请先选择查询类型')
      } else {
        this.ExcelVisible = true
        //
        var outdata
        this.loading = true
        var rABS = false // 是否将文件读取为二进制字符串
        console.log(this.xlsxFileList)
        var f = this.xlsxFileList[0].raw
        var reader = new FileReader()
        FileReader.prototype.readAsBinaryString = function (f) {
          var binary = ''
          var rABS = false // 是否将文件读取为二进制字符串
          var wb // 读取完成的数据
          var reader = new FileReader()
          reader.onload = function (e) {
            var bytes = new Uint8Array(reader.result)
            var length = bytes.byteLength
            for (var i = 0; i < length; i++) {
              binary += String.fromCharCode(bytes[i])
            }
            var XLSX = require('xlsx')
            if (rABS) {
              wb = XLSX.read(btoa(this.fixdata(binary)), { // 手动转化
                type: 'base64'
              })
            } else {
              wb = XLSX.read(binary, {
                type: 'binary'
              })
            }
            outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])// outdata就是你想要的东西
            // console.log(outdata)
            if (outdata.length === 0) {
              // this.ExcelVisible = true
            } else {
              _this.QueryData = []
              _this.OldData = []
              _this.excelLog = []
              let count = 0
              outdata.forEach((item, index) => {
                // console.log(item.title, item.id, index)
                if (_this.xlsxField === 'id') {
                  axios.get('http://newpms.cei.cn/course/FieldQueryExacted/?field=id&val=' + encodeURIComponent(item.id), { withCredentials: true })
                    .then(function (response) {
                      if (response.data.length > 0) {
                        _this.NewData = response.data
                        _this.NewData.forEach((item, index) => {
                          item['DataType'] = '新课件'
                        })
                        _this.QueryData = this.QueryData.concat(_this.NewData)
                        count += 1
                        _this.ExcelProgress = parseInt((count / outdata.length) * 100)
                      } else {
                        axios.get('http://newpms.cei.cn/OldCourseQueryExacted/?field=id&val=' + encodeURIComponent(item.id), { withCredentials: true })
                          .then(function (response) {
                            if (response.data.length > 0) {
                              console.log(response.data)
                              _this.OldData = response.data
                              _this.QueryData = _this.QueryData.concat(_this.OldData)
                            } else {
                              _this.excelLog.push({ 'index': index, 'id': item.id, 'title': item.title })
                            }
                            count += 1
                            _this.ExcelProgress = parseInt((count / outdata.length) * 100)
                          })
                          .catch(function (response) {
                            // console.log(response)
                          })
                      }
                    }.bind(this))
                    .catch(function (response) {
                    })
                } else if (_this.xlsxField === 'title') {
                  axios.get('http://newpms.cei.cn/course/FieldQueryExacted/?field=title&val=' + encodeURIComponent(item.title), { withCredentials: true })
                    .then(function (response) {
                      if (response.data.length > 0) {
                        _this.NewData = response.data
                        _this.NewData.forEach((item, index) => {
                          item['DataType'] = '新课件'
                        })
                        _this.QueryData = _this.QueryData.concat(_this.NewData)
                        count += 1
                        _this.ExcelProgress = parseInt((count / outdata.length) * 100)
                      } else {
                        axios.get('http://newpms.cei.cn/OldCourseQueryExacted/?field=title&val=' + encodeURIComponent(item.title), { withCredentials: true })
                          .then(function (response) {
                            if (response.data.length > 0) {
                              _this.OldData = response.data
                              _this.QueryData = _this.QueryData.concat(_this.OldData)
                            } else {
                              _this.excelLog.push({ 'index': index, 'id': item.id, 'title': item.title })
                            }
                            count += 1
                            _this.ExcelProgress = parseInt((count / outdata.length) * 100)
                          })
                          .catch(function (response) {
                            // console.log(response)
                          })
                      }
                    })
                    .catch(function (response) {
                    })
                }
                // console.log(_this.excelLog)
              })
            }
          }
          reader.readAsArrayBuffer(f)
        }
        if (rABS) {
          reader.readAsArrayBuffer(f)
        } else {
          reader.readAsBinaryString(f)
        }
      }
      this.loading = false
    },
    OldListDownload (event) {
      /*
      var a = ExcellentExport.convert({
        anchor: 'ExcelLink',
        filename: 'book',
        format: 'xlsx'
      }, [{
        name: 'Sheet1',
        from: {
          array: [['line 1', 1234, 'CN 你好'],
            ['line 2', 1234.56, 'JP こんにちは']
          ]
        }
      }])
      */
      axios.get(document.getElementById('ExcelLink').href, { withCredentials: true, responseType: 'blob' }) // responseType防止response.data内容变化
        .then(function (response) {
          console.log(response)
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          window.navigator.msSaveBlob(blob, 'a.xlsx')
        })
        .catch(function (response) {
          // console.log(response)
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
.el-select .el-input {
    width: 130px;
  }
.input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>
