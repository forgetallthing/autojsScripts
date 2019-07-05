toast('开始机器学习~支持腾讯新闻极速版v1.6.20版本');

var config = {
    mode: "new",
    startNewNo: 7, //从第几个新闻开始(0-10)
    continuReadNum: 20, //连续阅读数,防止app出现不能通过向上滑动切换新闻的情况
    workTime: 60000 * 45, //工作时间
    restTime: 60000 * 1, //休息时间
    noRest: false, //不休模式
}

var assemblyId = {
    newList: "as", //列表页新闻标题id
    redPacket: "aw6", //红包id
    commentNum: "nk", //新闻页最下方评论总数id
    sofa:"ahx",//抢沙发id
    commentTime:"ne",//每一条评论下的时间id
    isHomePage:"b1d",//视频新闻页有而首页没有的组件id,目前为右下角
}

setScreenMetrics(1080, 1920);
var continuReadNum = config.continuReadNum,
    workTime = config.workTime;

start()

function start() {
    log("启动！！！")
    openAPP();
    backAndEnter(8);
    text("首页").findOne().click();
    waitList(500)
    text("热点").findOne().click();
    text("热点").findOne().click();
    sleep(1000)
    text("推荐").findOne().click();
    text("推荐").findOne().click();
    sleep(1000)
    var ar = id(assemblyId.newList).find();
    log("start" + ar.size());
    var num = config.startNewNo >= ar.size() ? ar.size() - 1 : config.startNewNo;
    ar.get([num]).parent().click();
    sleep(1000);
    if (config.mode === "new") {
        readNews();
    }
}

//等待新闻列表出现
function waitList(i) {
    if (!id(assemblyId.newList).exists() && i > 0) {
        sleep(10);
        waitList(--i);
    } else if (i < 0) {
        start();
    }
}

//读新闻
function readNews() {
    if (!config.noRest && workTime < 0) {
        log("要休息了~");
        resting();
    } else {
        if (isNewsPage()) {
            sleep(1500);
            log("readNews")
            log(id(assemblyId.redPacket).exists())
            if (id(assemblyId.redPacket).exists() && continuReadNum > 0) {
                continuReadNum--;
                toastLog("再读" + continuReadNum + "篇后刷新");
                if (!config.noRest) {
                    workTime -= 24000;
                }
                sleep(1000);
                toNextNew();
            } else {
                backAndEnter(8)
                refreshNews()
            }
        } else {
            log("不是新闻页,重新开始")
            backAndEnter(8)
            refreshNews()
        }
    }
}

//等待红包打开,超过8秒未打开则继续
function waitTipOpen(i) {
    if (id(assemblyId.redPacket).exists() && i > 0) {
        sleep(10);
        waitTipOpen(--i);
    }
}

//滑动到最后
function toNextNew() {
    log("toNextNew")
    scrollDown();
    log("滑动完成,等待红包")
    waitTipOpen(500);
    log("判断暂无相关内容")
    if (text("暂无相关内容").exists()) {
        backAndEnter(8);
        refreshNews();
    } else {
        randomSwipeDown(1000, 300);
        readNews();
    }
}

//滑动到最后
function scrollDown() {
    // log(text("查看更多评论").exists())
    //防止没评论或者评论小于5
    var commentNum = id(assemblyId.commentNum).findOne(200).text(),
        flag;
    log("评论总数:" + commentNum)
    if (commentNum) {
        commentNum = parseInt(commentNum.replace("万", "0000"));
        if (commentNum < 5) {
            flag = commentNum;
        }
    }

    log("开始while循环:" + flag)
    log(text("查看更多评论").exists())
    log(id(assemblyId.sofa).exists())
    log(id(assemblyId.commentTime).find().size())

    var waitArr = [800, 1100, 1200, 1000, 800, 500, 600, 500],
        waitFlag = 0,
        swipeNum = 0;
    //sofa为抢沙发,commentTime为每一条评论下的时间
    while (!(text("查看更多评论").exists() || id(assemblyId.sofa).exists() || (flag && id(assemblyId.commentTime).find().size() == flag))) {
        if (waitArr[waitFlag]) {
            sleep(waitArr[waitFlag++])
        }
        randomSwipeDown(1100, 300);
        if (swipeNum++ > 60) break;
    }
    log("滚动次数:" + swipeNum)

    if (swipeNum > 60) {
        log("下拉超过60次，重新开始")
        backAndEnter(8);
        refreshNews();
    } else if (id(assemblyId.sofa).exists()) {
        log("抢沙发")
        //防止没有滚到最后
        for (var index = 0; index < 6; index++) {
            swipe(random(200, 300), 800, random(200, 300), 700, 300)
        }
    } else {
        //防止没有滚到最后
        log("other")
        swipe(random(200, 300), 800, random(200, 300), 700, random(400, 500))
        swipe(random(200, 300), 800, random(200, 300), 700, random(400, 500))
    }
}

//刷新新闻
function refreshNews() {
    log("刷新新闻")
    continuReadNum = config.continuReadNum;
    // text("推荐").findOne().click();
    sleep(500);
    start();
}

//休息时间,防被封
function resting() {
    backAndEnter(8);
    back();
    back();
    back();
    back();
    toastLog('开始休息,请勿操作手机');
    var remainTime = config.restTime;
    var stop = setInterval(function () {
        remainTime -= 4000;
        swipe(300, 600, 315, 600, 300)
        toast('休息中,距离开工还有' + remainTime / 1000 + "秒");
    }, 4000)
    setTimeout(function () {
        clearInterval(stop)
        toastLog('休息结束,开始干活');
        workTime = config.workTime;
        start();
    }, config.restTime)
}

//防止封号,模拟滚动
function randomSwipeDown(startY, endY) {
    swipe(random(200, 300), random(startY - 100, startY + 100), random(200, 300), random(endY - 100, endY + 100), random(300, 400))
}

//启动程序
function openAPP() {
    app.launchApp("腾讯新闻极速版");
    // app.launch("com.tencent.news.lite");
    // waitForActivity("com.tencent.news.activity.SplashActivity");
}

//关闭app,有bug,无法调用:result返回true,但是没有跳转到设置页
function closeAPP() {
    var result = app.openAppSetting("com.tencent.news.lite");
    id("button2_negative").click();
    text("确定").findOne().click();
}

//返回主页
function backAndEnter(flag) {
    log("返回主页函数调用次数" + flag)
    if (flag < 0) {
        start();
    } else if (!isHomePage()) {
        back()
        sleep(1500)
        backAndEnter(--flag)
    }
}

//是否是新闻页
function isNewsPage() {
    return currentActivity() === "com.tencent.news.ui.NewsDetailActivity";
}

//是否是主页
function isHomePage() {
    //判断有无评论组件,防止把视频新闻页面误判为首页
    return currentActivity() === "com.tencent.news.activity.SplashActivity" && id(assemblyId.isHomePage).findOne(200) == null;
}