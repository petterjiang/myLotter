<script setup>
import { ref, reactive } from "vue";

defineProps({
  msg: String,
});

const redAppeared = ref([]);
const blueAppeared = ref([]);
const num = ref(2);
const numBlue = ref(1);
const numBefore = ref(4);
let lastLottery = ref([]);
let rel = reactive({
  result: [],
});
let myBoll = reactive([]);
const init = () => {
  return new Promise((resolve, reject) => {
    // 获取前几次开奖信息
    ajax().get(
      "/findDrawNotice?name=ssq&issueCount=&issueStart=&issueEnd=&dayStart=&dayEnd=&pageNo=1&pageSize=" +
        numBefore.value +
        "&week=&systemType=PC",
      (res) => {
        // const rel = JSON.parse(res).result
        // //console.log(rel);
        rel.result = JSON.parse(res).result;
        lastLottery.value = rel.result.map((e) => {
          return {
            red: e.red.split(","),
            blue: e.blue,
            date: e.date,
          };
        });
        redAppeared.value = [];
        blueAppeared.value = [];
        console.log(lastLottery.value);
        filterNumAppearedBefore();
        resolve();
      }
    );
  });
};
// 简单ajax请求
const ajax = function () {
  var xhr = new XMLHttpRequest();
  xhr.get = function (url, callback) {
    xhr.open("GET", url);
    xhr.send();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(xhr.responseText);
      }
    };
  };
  return xhr;
};
//选号
const redMax = 33;
const blueMax = 16;
const round = (minNum, maxNum) => {
  return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
};
const roundNum = (maxNum, arr) => {
  let num = num2String(round(1, maxNum));
  while (arr.includes(num)) {
    num = num2String(round(1, maxNum));
  }
  return num;
};
const num2String = (num) => {
  return num < 10 ? "0" + num : num.toString();
};
const filterNumAppearedBefore = () => {
  //筛选前N期出现过num次以上的红球
  //筛选出前N期出现num的蓝球
  let tempRedArr = [];
  let tempBlueArr = [];
  lastLottery.value.forEach((e) => {
    tempRedArr.push(...e.red);
    tempBlueArr.push(e.blue);
  });
  if (num.value > 1) {
    getArr(tempRedArr, redAppeared, num);
  } else if (num.value == 1) {
    let temp = [];
    tempRedArr.forEach((e) => {
      !temp.includes(e) && temp.push(e);
    });
    redAppeared.value = temp;
  }
  if (numBlue.value > 1) {
    getArr(tempBlueArr, blueAppeared, numBlue);
  } else if (numBlue.value == 1) {
    let temp = [];
    tempBlueArr.forEach((e) => {
      !temp.includes(e) && temp.push(e);
    });
    blueAppeared.value = temp;
  }

  function getArr(arr, filterArr, number) {
    let tempRedArr = [...arr];
    let slow = 0;
    let fast = 1;
    let sameTime = 1;
    while (fast < tempRedArr.length) {
      if (filterArr.value.includes(tempRedArr[slow])) {
        slow++;
        fast = slow + 1;
        sameTime = 1;
        continue;
      }
      if (tempRedArr[fast] === tempRedArr[slow]) {
        sameTime++;
      }
      if (sameTime === number.value) {
        filterArr.value.push(tempRedArr[slow]);
      }
      fast++;
      if (fast === tempRedArr.length - 1) {
        slow++;
        fast = slow + 1;
        sameTime = 1;
      }
    }
    return tempRedArr;
  }
};

const lottery1 = async () => {
  await init();
  let red = [];
  let blue = "";
  const rule = 1;
  let filterArrRed = [...redAppeared.value];
  console.log(redAppeared.value.length, blueAppeared.value.length);
  if (redAppeared.value.length > 32 || blueAppeared.value.length > 15) {
    alert("选不出来啦，可随机号不足！");
    return;
  }
  for (let index = 0; index < 6; index++) {
    const num = roundNum(redMax, filterArrRed);
    filterArrRed.push(num);
    red.push(num);
  }
  red.sort((a, b) => a - b);
  blue = roundNum(blueMax, blueAppeared.value);
  myBoll.push({
    num: num.value,
    numBlue: numBlue.value,
    numBefore: numBefore.value,
    red,
    blue,
    rule,
  });
};
const lottery2 = () => {
  let red = [];
  let blue = "";
  const rule = 2;
  for (let index = 0; index < 6; index++) {
    const num = roundNum(redMax, red);
    red.push(num);
  }
  red.sort((a, b) => a - b);
  blue = num2String(round(1, blueMax));
  myBoll.push({
    red,
    blue,
    rule,
  });
};

init();
</script>

<template>
  <div class="box">
    <div class="last">
      <h2 class="title">近{{ numBefore }}期号码展示：</h2>
      <div class="list">
        <div
          style="margin-bottom: 10px"
          class=""
          v-for="(lottery, index) in lastLottery"
          :key="index"
        >
          <div style="font-size: 18px">
            <strong>日期:</strong> {{ lottery.date }}
          </div>
          <div class="boll_box">
            <strong>红球：</strong
            ><span class="red boll" v-for="(num, i) in lottery.red" :key="i">{{
              num
            }}</span>
            <strong>蓝球</strong>
            <span class="blue boll">{{ lottery.blue }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="read-the-docs">
      <div class="sticky">
        <h3>自己抽双色球</h3>
        <p>筛选范围:</p>
        <div class="flex">
          <p>最近</p>
          <p>
            <input class="input" type="number" v-model="numBefore" /> 期出现
          </p>
          <p><input type="number" v-model="num" /> 次的红球不选</p>
          <p><input type="number" v-model="numBlue" /> 次的蓝球不选</p>
        </div>
        <div>
          <button @click="lottery1">点我选号</button>
        </div>
      </div>

      <div class="show_boll">
        <div v-for="(boll, index) in myBoll" :key="index">
          <p>
            号码 {{ index + 1 }}: 最近
            <span style="color: red"
              >{{ boll.numBefore }} 期出现 {{ boll.num }} 次</span
            >次的红球不选，最近<span style="color: red"
              >{{ boll.numBefore }}期出现 {{ boll.numBlue }}次</span
            >的蓝球不选
          </p>
          <div class="flex">
            <span class="red boll" v-for="(num, i) in boll.red" :key="i">{{
              num
            }}</span>
            <span class="blue boll">{{ boll.blue }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  /* text-align: left; */
  color: #333;
  font-size: 14px;
  height: 100vh;
  position: relative;
  overflow: auto;
  flex: 1;
}
.flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
.flex input {
  width: 20px;
}
.sticky {
  position: sticky;
  background: #fff;
  top: 0;
  z-index: 2;
  padding-bottom: 10px;
}
.boll_box {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
}
.last {
  height: 100vh;
  position: relative;
  overflow: auto;
  flex: 1;
}
.title {
  position: sticky;
  background: #fff;
  top: 0;
}

.boll_box strong {
  display: block;
  width: 50px;
}
.boll {
  width: 26px;
  height: 26px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #fff;
  margin: 3px 3px;
}
.red {
  background: red;
}
.blue {
  background: blue;
}
h1,
h2,
h3 {
  margin: 0;
  padding: 10px 0;
}
.show_boll .flex {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
}
.list {
  overflow: auto;
}
.box {
  display: flex;
  justify-content: space-around;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
