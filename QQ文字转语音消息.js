/**
 * QQ聊天文字转语音发送
 */
var QQ = dialogs.rawInput("输入当前登陆QQ号", "1352183717");

var window = floaty.window(
    <frame><linear>
        <button id="action" text="运行" w="40" h="40" color="#ffffff" bg="#66000000" />
    </linear> </frame>
);

var execution = null;

//记录按键被按下时的触摸坐标
var x = 0, y = 0;
//记录按键被按下时的悬浮窗位置
var windowX, windowY;
//记录按键被按下的时间以便判断长按等动作
var downTime;
window.action.setOnTouchListener(function (view, event) {
    switch (event.getAction()) {
        case event.ACTION_DOWN:
            x = event.getRawX();
            y = event.getRawY();
            windowX = window.getX();
            windowY = window.getY();
            downTime = new Date().getTime();
            return true;
        case event.ACTION_MOVE:
            //移动手指时调整悬浮窗位置
            window.setPosition(windowX + (event.getRawX() - x),
                windowY + (event.getRawY() - y));
            //如果按下的时间超过1.5秒判断为长按，退出脚本
            if (new Date().getTime() - downTime > 1500) {
                exit();
            }
            return true;
        case event.ACTION_UP:
            //手指弹起时如果偏移很小则判断为点击
            if (Math.abs(event.getRawY() - y) < 5 && Math.abs(event.getRawX() - x) < 5) {
                onClick();
            }
            return true;
    }
    return true;
});

function onClick() {
    if (currentActivity() == "com.tencent.mobileqq.activity.SplashActivity") {
        threads.start(function () {
            run(1);
        });
    } else {
        alert("请打开QQ聊天窗口")
    }
}

function run(r) {
    var r = r;
    while (r) {
        var name = "tmp.mp3"
        var path = "/sdcard/脚本/"
        var str = id("input").findOne().text();
        if (str) {
            setText("文字转语音中……");
            语音合成(str, path+name);
            qqVoice(name, QQ, path);
        } else {
            alert("聊天文字输入框内容为空")
        }
        setText("");
        r = 0;
    }
}

/**
 * 语音合成API
 * 需要完善
 */
function 语音合成(str, path) {
    var str = str;
    var url = "http://www.xfyun.cn/herapi/solution/synthesis?vcn=x_yifeng&vol=7&spd=medium&textType=cn&textPut=" + str;
    var res = http.get(url).body.string();
    eval("res=" + res + ".data");
    var mp3 = http.get(res).body.bytes();
    files.writeBytes(path, mp3);
}

function f(str, leng) {
    str = str.toString();
    return new Array(leng - str.length + 1).join("0") + str;
}

setInterval(() => { }, 1000);


/**
 * qqVoice(name, QQ, originPath)
 * 调用方法：name为要发送语音的名称;QQ是你要用的QQ号;originpath是要发送语音的父文件夹的路径
 */
function qqVoice(name, QQ, originPath) {
    if (QQ == undefined) {
        QQ = "1352183717"
    }
    if (originPath == undefined) {
        originPath = "/sdcard/QQ测试语音/"
    }
    var date1 = (new Date().getYear() + 1900) * 100 + new Date().getMonth() + 1
    var date2 = new Date().getDate()
    var path = "/sdcard/tencent/MobileQQ/" + QQ + "/ptt/" + date1 + "/" + date2 + "/"
    sleep(200)
    if (desc("开始录音").find().empty()) {
        accessibilityFocused(false).checked(false).className("android.widget.ImageView").clickable(true).column(-1).columnCount(0).column(-1).contextClickable(false).depth(9).dismissable(false).findOne().click();
    }
    sleep(200)
    click("录音")
    sleep(200)
    desc("开始录音").find().click()
    sleep(1650)
    desc("停止录音").find().click()
    toast(path);
    sleep(800)
    var fileName = max(files.listDir(path))
    files.remove(path + fileName)
    files.copy(originPath + name, path + name)
    files.rename(path + name, fileName)
    sleep(200)
    id("listen_panel_send_tv").find().click()
}

function max(array) {

    var a = 0
    for (i = 0; i < array.length; i++) {
        re = /\d+/g
        name = array[i].match(re, "g")
        if (name > a) {
            a = name
        }
    }
    return "stream_" + a + ".slk";
}
