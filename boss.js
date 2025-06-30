// ==UserScript==
// @name         Boss直聘一键投递按钮
// @namespace    http://tampermonkey.net/
// @version      2025-05-12
// @description  点击后一键沟通，一键发送常用语言
// @author       yuesha
// @match        https://www.zhipin.com/web/geek/job-recommend*
// @match        https://www.zhipin.com/web/geek/jobs*
// @match        https://www.zhipin.com/web/geek/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhipin.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let countAllJobs = 0;
    let countSendJobs = 0;
    let countSendMsgs = 0;
    let pause = false;

    // 高亮关键词条件
    let hightightKeyWords = [
        'php', 'PHP', '前端', '全栈', '后端', '主管', '小程序开发',
        '程序员', '技术总监', '服务端', '软件开发', '后台开发', 'web开发',
        '技术经理', '技术合伙人', 'IT', 'it', '软件经理', '工程师',
        'web', '网页设计师', '网站设计师', '技术部负责人', '技术负责人',
        '网站建设', 'uniapp', 'APP', 'app', 'UNIAPP', '技术支持',
        '技术部主管', '开发工程师', '技术主管'
    ];
    // 不允许高亮的关键词
    let unHightightKeyWords = [
        'Go', 'go', 'GO', 'Java', 'JAVA', 'java', 'Golang', 'golang',
        'flutter', 'Flutter', '本科', 'python', 'Python', 'Angular',
        '安卓', '苹果', 'IOS', 'Ios', 'ios', 'android', 'Android',
        'ERP', 'erp', 'rpa', 'RPA', 'delphi', 'React', 'react', 'Laya',
        '实习生', '运营', 'C#', '单片机', '嵌入式', 'kotlin', 'Kotlin',
        '物联网', 'Erlang', 'erlang', 'net', 'NET', 'C++', 'c++', 'lua',
        'LUA', 'Lua', 'QT', 'qt', 'Qt', 'SDK', 'sdk', 'Ruby', 'ruby',
        'Three', 'three', '上位机', '助理', 'k8s', '测试', '发货', '拣',
        '得物', '配送', '生产', '销售', '运维', '美工', '美术', '弱电',
        '电气'
    ];
    // 设置的打招呼语
    let greeting = "您好，我对这份工作非常感兴趣，希望可以有机会与您进一步沟通。";
    // 常用语第一句的匹配
    let commonSendStrPatten = "您好，我拥有全栈开发及技术管理经验";

    // 一键发起沟通
    function oneClickStartChat() {
        console.log("执行了oneClickStartChat函数");
        // 是否高亮
        let isHight = false;
        // 点击事件
        let btnCliEven;
        let btnCliEvens = [];
        // 所有的职位
        let curJobs = document.getElementsByClassName('job-card-footer')

        if (curJobs.length < 1) {
            alert("拿不到职位列表")
            return;
        }
        countAllJobs += curJobs.length;
        console.log(`已经浏览了${countAllJobs}个岗位，已沟通了${countSendJobs}个岗位`);

        for (var i = curJobs.length - 1; i >= 0; i--) {
            // 每次循环的默认值都是非高亮
            isHight = false;

            // 当前循环处理的职位信息
            let curJob = curJobs[i];

            // 当前工作信息
            let curJobInfo = curJob.previousElementSibling;
            // 职位名称
            let curJobName = curJobInfo.childNodes[0].childNodes[0]

            // 检索是否含有关键字
            for (var j = hightightKeyWords.length - 1; j >= 0; j--) {
                if (curJobName.innerText.indexOf(hightightKeyWords[j]) !== -1) {
                    isHight = true;
                    break;
                }
            }

            // 检索是否含有不允许高亮的关键字
            if (isHight) {
                for (var k = unHightightKeyWords.length - 1; k >= 0; k--) {
                    if (curJobName.innerText.indexOf(unHightightKeyWords[k]) !== -1) {
                        isHight = false;
                        break;
                    }
                }
            }

            let btn = document.createElement('button');

            // 样式处理
            btn.style.border = "1px solid #00bebd";
            btn.style.backgroundColor = "#dbf5f2";
            btn.style.borderRadius = "7px";
            btn.style.padding = "5px";

            if (isHight) {
                // 符合条件设置
                curJobInfo.style.backgroundColor = "lightcoral";
                curJobName.style.color = "white";
                curJobName.nextElementSibling.style.color = "white";
            }

            btn.setAttribute('class', 'mySendJobBtn')
            btn.innerText = '沟通';
            // 添加按钮
            curJob.append(btn)

            // 点击事件
            btnCliEven = function() {
                if (pause) return;

                // 进入职位详情
                curJob.click()

                // 等待职位详情内容渲染
                setTimeout(() => {
                    // 模拟投递
                    let toudiBtn = document.getElementsByClassName('op-btn-chat')[0]
                    if (toudiBtn.innerText == "立即沟通") {
                        toudiBtn.click()

                        // 等待职位发起沟通结果
                        setTimeout(() => {
                            let stayHeres = document.getElementsByClassName('cancel-btn');
                            if (stayHeres.length < 1) {
                                alert("无法点击留在此页，检查是否已达到沟通上限")
                                pause = true;
                                return;
                            }
                            // 继续留在本页
                            stayHeres[0].click()

                            toudiBtn.innerText = "已发起沟通，继续沟通"
                            console.log("投递成功")

                            countSendJobs += 1;
                            btn.style.backgroundColor = "#fff";
                        }, 500)
                    } else {
                        btn.style.backgroundColor = "#fff";
                        console.log("此岗位已沟通过")
                    }
                }, 500)
            }

            if (isHight) btnCliEvens.push(btnCliEven);

            btn.onclick = btnCliEven;
        }

        handleBtnCliEven(btnCliEvens);
    }

    function handleBtnCliEven(evens) {
        let even = evens.pop();
        if (!even) {
            alert('已将当前页面所有高亮推荐岗位发起沟通');
            return;
        }

        even();
        setTimeout(() => {
            handleBtnCliEven(evens);
        }, 2000)
    }

    // 一键发送常用语
    function oneClickSendMsg() {
        // 所有的消息
        let allMsgs = document.getElementsByClassName('last-msg-text')

        if (allMsgs.length < 1) {
            alert("拿不到消息列表")
            return;
        }

        for (var i = allMsgs.length - 1; i >= 0; i--) {
            // 当前循环处理的信息
            let curMsg = allMsgs[i];

            // 已经进行过沟通的，不再发送
            if (curMsg.innerText.indexOf(greeting) === -1) {
                continue;
            }

            startSendMsg(curMsg);
            return;

        }

        return alert('已经处理完全部消息');
    }

    // 开始发送常用语
    function startSendMsg(msg) {
        // 进入聊天详情
        msg.click();

        setTimeout(() => {
            // 打开常用语
            document.getElementsByClassName('btn-dict')[0].click();

            setTimeout(() => {
                // 发送第一条常用语
                let commonSend = document.getElementsByClassName('sentence-panel')[0].childNodes[1].childNodes[0];
                // 检测常用语的值
                if (commonSend.innerText.indexOf(commonSendStrPatten) === false)
                    return alert("请将常用语第一条设置为您要发送的内容")

                commonSend.click()

                countSendJobs += 1;

                let goalBoss = msg.parentNode.previousElementSibling.childNodes[0].innerText;
                console.log(countSendJobs, "给 " + goalBoss + " 发送消息");

                setTimeout(() => {
                    oneClickSendMsg();
                }, 1000);
            }, 500);
        }, 500);
    }

    // 清除所有的已浏览职位
    function cleanMyBtns() {
        console.log("执行清除");
        let allMyBtns = document.getElementsByClassName('mySendJobBtn');
        if (allMyBtns.length < 1) {
            return;
        }

        for (var i = allMyBtns.length - 1; i >= 0; i--) {
            allMyBtns[i].parentElement.parentElement.parentElement.remove()
        }

        // 返回顶部
        window.scrollTo(0, 0)
    }

    // 职位推荐页面处理函数
    function jobRecommendHandle() {
        // 先执行一次
        // oneClickStartChat();

        // 外部包裹的盒子
        let startScriptDiv = document.createElement('div');
        startScriptDiv.className = 'condition-filter-select';
        startScriptDiv.style.backgroundColor = 'lightcoral';

        // 外部包裹的盒子2
        let startScriptDiv2 = document.createElement('div');
        startScriptDiv2.className = 'current-select';

        let startScriptSpan = document.createElement('span');
        startScriptSpan.style.color = 'white';
        startScriptSpan.innerText = '点击开始执行脚本';

        // 实际点击
        startScriptSpan.onclick = function() {
            cleanMyBtns();

            oneClickStartChat();
        }

        // 锚点查找
        let anchorDom = document.getElementsByClassName('c-filter-condition')
        if (anchorDom.length < 1) {
            alert("获取不到锚点位置，确认是否已经改版，可联系脚本作者更新")
            return;
        }

        // 锚点包含内容
        anchorDom[0].appendChild(startScriptDiv)
        startScriptDiv.appendChild(startScriptDiv2);
        startScriptDiv2.appendChild(startScriptSpan);
    }

    // 职位沟通页面处理函数
    function jobChatHandle() {
        // 外部包裹的盒子
        let startScriptDiv = document.createElement('li');

        startScriptDiv.innerHTML = `<li class="dropdown-wrap dropdown-help-and-feedback"><div title="一键批量发送常用语第一条">一键发送</div></li>`

        // 实际点击
        startScriptDiv.onclick = function() {
            oneClickSendMsg();
        }

        // 锚点查找
        let anchorDom = document.getElementsByClassName('user-nav')
        if (anchorDom.length < 1) {
            alert("获取不到锚点位置，确认是否已经改版，可联系脚本作者更新")
            return;
        }

        // 锚点包含内容
        anchorDom[0].prepend(startScriptDiv)
    }

    function main() {
        let isChatPage = window.location.href.search('web/geek/chat') !== -1;
        console.clear();

        if (isChatPage) {
            jobChatHandle();
        } else {
            jobRecommendHandle();
        }
    }

    // 防止页面没加载完
    setTimeout(main, 1000)
})();
