<template>
  <div id="MainBox">
    <video id="MediaPlayer" :src="MediaSrc" style="width:100%;height:100px" controls="controls" autoplay="autoplay">
      浏览器不支持HTML5
    </video>
    <div id="Contrl">
      <el-switch disabled
        v-model="IsEditSentence"
        active-color="#00BB00"
        inactive-color="#00AEAE"
        active-text="整句剪切"
        inactive-text="句内剪切">
      </el-switch>
      <el-button id="SelectBtn" type="primary" size="small" v-on:click="SelectBtn">选中编辑</el-button>
      <el-button type="primary" size="small" v-on:click="submit">提交</el-button>
    </div>
    <div id="SubBox">
      <span v-for="item in SubData" :key="item.type+item.index">
        <div v-if="item.type.indexOf('TitleItem')===0" class="TitleBox">{{item.content}}</div>
        <span v-else-if="item.type==='SubItem'" class="SubSpanDefault" :id="'SubItem_'+item.index" :SubBeginTime="item.start" :SubEndTime="item.end" v-on:click="SelectSub">{{item.content}}</span>
        <div v-else>???</div>
      </span>
    </div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-tag>整句剪切队列</el-tag>
        <div class="EditData">
          <span v-for="item in SentenceEditDate" :key="item.begin">
            <div>{{item.begin}}-->{{item.end}}</div>
          </span>
        </div>
        </el-col>
      <el-col :span="12">
        <el-tag>句内剪切队列</el-tag>
        <div class="EditData">
          <span v-for="item in WordEditDate" :key="item.begin">
            <div>{{item.begin}}-->{{item.text}}</div>
          </span>
        </div>
        </el-col>
    </el-row>
    <el-dialog
      title="句内编辑"
      :visible.sync="WordEditVisible"
      width="80%"
      :before-close="WordEditClose">
      <!--<el-input id="CutBeginInput" placeholder="ms" v-model="WordCutBegin" v-on:blur="CutTimeValidate">
        <template slot="prepend">剪切起点</template>
      </el-input>
      <el-input id="CutEndInput" placeholder="ms" v-model="WordCutEnd" v-on:blur="CutTimeValidate">
        <template slot="prepend">剪切终点</template>
      </el-input>-->
      <el-input id="WordEditText" v-model="WordEditText"></el-input>
      <el-slider
        v-model="WordCutSelected"
        range
        :max="WordCutMax"
        :min="WordCutMin">
      </el-slider>
      <el-slider :max="WordCutMax" :min="WordCutMin" v-model="WordEditCurrent" disabled></el-slider>
      <div id="timedisplay">
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="playClick">试听</el-button>
        <el-button type="primary" @click="WordEditSave">提交</el-button>
        <el-button @click="WordEditVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
import axios from 'axios'

export default {
  name: 'ViewVideoEdit',
  created: function () {
    this.CourseId = this.$route.query.id
    this.UserId = this.$route.query.userid
    this.MediaSrc = 'http://203.207.118.112/CourseFile/' + this.CourseId.substring(0, 4) + '/' + this.CourseId + '/rip.mp4'
    let JsonUrl = 'http://203.207.118.112/CourseFile/' + this.CourseId.substring(0, 4) + '/' + this.CourseId + '/captions.json'
    console.log(JsonUrl)
    axios.get(JsonUrl)
      .then(function (response) {
        // console.log(response)
        this.SubData = response.data
      }.bind(this))
      .catch(function (response) {
        console.log(response)
      })
    this.$message({
      showClose: true,
      message: '欢迎来到字幕编辑，请善用 Ctrl+F 搜索'
    })
  },
  data () {
    return {
      UserId: '',
      CourseId: '',
      MediaSrc: '',
      IsEditSentence: true,
      SelectedSub: '',
      SelectedBeginSub: '',
      EditIng: false,
      SubData: [],
      SentenceEditDate: [],
      WordEditDate: [],
      WordEditVisible: false,
      WordCutMax: 0,
      WordCutMin: 0,
      WordCutBegin: 0,
      WordCutEnd: 0,
      WordCutSelected: [],
      WordEditText: '',
      WordEditCurrent: 0
    }
  },
  methods: {
    // 用event前必须设置标签ID
    SelectSub (event) {
      // 已选中过字幕
      if (this.SelectedSub !== '') {
        // 整句模式编辑中
        if (this.IsEditSentence === true && this.EditIng === true) {
          this.SelectedBeginSub = this.SelectedSub
          let SelectedEndSub = event.target.id.replace('SubItem_', '')
          let SubCheck = true
          //
          let SelectedEndSubIndex = this.SubData.findIndex((value, index, arr) => {
            return (value.index === SelectedEndSub && value.type === 'SubItem')
          })
          let SelectedBeginSubIndex = this.SubData.findIndex((value, index, arr) => {
            return (value.index === this.SelectedBeginSub && value.type === 'SubItem')
          })
          console.log(SelectedBeginSubIndex + '/' + SelectedEndSubIndex + '/' + this.SelectedBeginSub + '/' + SelectedEndSub)
          //
          for (var i = SelectedEndSubIndex; i >= SelectedBeginSubIndex; i--) {
            if (this.SubData[i].type === 'SubItem' && this.SubData[i].PPTOutline === '' && this.SubData[i].IsBeginningOfParagraph === 'false') {
            } else {
              console.log(this.SubData[i].PPTOutline + '/' + this.SubData[i].IsBeginningOfParagraph + '/' + this.SubData[i].content)
              SubCheck = false
              return
            }
          }
          if (SubCheck === true && parseInt(SelectedEndSub) >= parseInt(this.SelectedBeginSub)) {
            console.log(SelectedEndSub)
            console.log(this.SelectedBeginSub)
            this.SentenceEditDate.push({ 'type': 'sentence', 'begin': this.SelectedBeginSub, 'end': SelectedEndSub })
            console.log(this.SentenceEditDate)
            this.EditIng = false
            this.SelectedSub = ''
            console.log('added')
          } else {
            console.log('add error' + '/' + SubCheck + '/' + SelectedEndSub + '/' + this.SelectedBeginSub)
            this.EditIng = false
            this.SelectedSub = ''
            this.$message({
              showClose: true,
              type: 'warning',
              message: '请不要选中对应幻灯片的字幕，段落起始，以及标题,并确保起始位置在截止位置之前 '
            })
          }
          // 词模式
        } else if (this.IsEditSentence === false && this.EditIng === true) {
          if (this.SelectedBeginSub !== '') {
            document.getElementById('SubItem_' + this.SelectedBeginSub).className = 'SubSpanDefault'
            this.SelectedBeginSub = ''
          }
          document.getElementById('SubItem_' + this.SelectedSub).className = 'SubSpanDefault'
        } else {
          if (this.SelectedBeginSub !== '') {
            document.getElementById('SubItem_' + this.SelectedBeginSub).className = 'SubSpanDefault'
            this.SelectedBeginSub = ''
          }
          document.getElementById('SubItem_' + this.SelectedSub).className = 'SubSpanDefault'
        }
      }
      var SubId = event.target.id
      this.SelectedSub = SubId.replace('SubItem_', '')
      document.getElementById(SubId).className = 'SubSpanSelected'
    },
    SelectBtn () {
      this.EditIng = true
      if (this.SelectedSub === '') {
        this.$message({
          showClose: true,
          type: 'warning',
          message: '请先选中字幕'
        })
      } else {
        if (this.IsEditSentence === true) {
          this.$message({
            showClose: true,
            type: 'warning',
            message: '已选定起始位置，请选择截止位置'
          })
        } else {
          this.$message({
            showClose: true,
            type: 'warning',
            message: '准备开始句内编辑'
          })
          var player = document.querySelector('#MediaPlayer')
          player.pause()
          this.WordCutBegin = parseInt(document.getElementById('SubItem_' + this.SelectedSub).getAttribute('SubBeginTime'))
          this.WordCutEnd = parseInt(document.getElementById('SubItem_' + this.SelectedSub).getAttribute('SubEndTime'))
          this.WordCutSelected.splice(0, this.WordCutSelected)
          this.WordCutSelected.push(this.WordCutBegin + 50)
          this.WordCutSelected.push(this.WordCutEnd - 50)
          this.WordCutMin = this.WordCutBegin
          this.WordCutMax = this.WordCutEnd
          this.WordEditText = document.getElementById('SubItem_' + this.SelectedSub).innerText
          this.WordEditCurrent = this.WordCutBegin
          this.WordEditVisible = true
        }
      }
    },
    WordEditClose (done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    CutTimeValidate (event) {
      // console.log(this.WordCutMin + '/' + this.WordCutMax)
      if (event.target.id === 'CutBeginInput') {
        if (event.target.value > this.WordCutEnd) {
          this.WordCutBegin = this.WordCutEnd
        }
        if (event.target.value < this.WordCutMin) {
          this.WordCutBegin = this.WordCutMin
        }
        this.WordCutSelected.splice(0, 1, this.WordCutBegin)
      } else {
        if (event.target.value < this.WordCutBegin) { this.WordCutEnd = this.WordCutBegin }
        if (event.target.value > this.WordCutMax) { this.WordCutEnd = this.WordCutMax }
        this.WordCutSelected.splice(1, 1, this.WordCutEnd)
      }
    },
    playClick () {
      var player = document.querySelector('#MediaPlayer')
      var EndTime = this.WordCutMax / 1000
      player.currentTime = this.WordCutMin / 1000
      player.play()
      setTimeout(() => {
        player.currentTime = this.WordCutSelected[1] / 1000
      }, this.WordCutSelected[0] - this.WordCutMin)
      const that = this
      player.ontimeupdate = function () {
        document.getElementById('timedisplay').innerHTML = player.currentTime
        that.WordEditCurrent = player.currentTime * 1000
        // console.log(this.WordEditCurrent)
        if (player.currentTime >= EndTime) {
          player.pause()
        }
      }
    },
    WordEditSave () {
      this.WordEditDate.push({'type': 'word', 'begin': this.WordCutSelected[0], 'end': this.WordCutSelected[0], 'text': this.WordEditText})
      console.log(this.WordEditDate)
      this.WordEditVisible = false
    },
    submit () {
      let data = {}
      let course = []
      course.push(this.CourseId)
      data['course'] = course
      data['TaskType'] = 'VideoEdit'
      data['TaskState'] = 'Created'
      data['ExtendedData'] = JSON.stringify(this.SentenceEditDate)
      data['creator'] = this.UserId
      console.log(data)
      console.log(JSON.stringify(data))
      axios.post('http://newpms.cei.cn/edittaskdetail/', JSON.stringify(data))
        .then(function (response) {
          // console.log(response)
          this.$message({
            showClose: true,
            type: 'success',
            message: '已添加任务'
          })
        }.bind(this))
        .catch(function (response) {
          console.log(response)
        })
    }
  }
}
</script>

<style>
 .el-row {
    padding: 10px
  }
  .el-col {
    border-radius: 2px;
  }
#SubBox {
  border: solid 1px LightSteelBlue;
  height: 600px;
  padding: 20px 10px;
  overflow-y: scroll;
}
#Contrl {
  padding: 10px 0;
  text-align: left
}
#SelectBtn {
  margin-left: 300px
}
.TitleBox {
  width: 100%;
  clear: both;
  display: block;
  padding: 8px 0;
}
.SubSpanDefault {
  border: solid 1px LightSteelBlue;
  padding: 2px 2px 2px 5px;
  margin: 0px 2px 5px 2px;
  display: block;
  float: left;
  cursor:pointer;
}
.SubSpanSelected {
  border:solid 1px SteelBlue;
  color:MidnightBlue;
  background: LightCyan;
  padding:2px 2px 2px 5px;
  margin:0px 2px 5px 2px;
  display:block;
  float:left;
  cursor:pointer;
}
.EditData {
  color:MidnightBlue;
  border: solid 1px LightSteelBlue;
  margin: 5px;
}
</style>
