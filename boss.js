// ==UserScript==
// @name         Boss直聘一键投递按钮
// @namespace    http://tampermonkey.net/
// @version      2024-11-01
// @description  try to take over the world!
// @author       You
// @match        https://www.zhipin.com/web/geek/job-recommend*
// @match        https://www.zhipin.com/web/geek/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhipin.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let countAllJobs = 0;
    let countSendJobs = 0;
    let countAllMsgs = 0;
    let countSendMsgs = 0;
    let waitDealMsgs = [];

    // 高亮关键词
    let hightightKeyWords = [
        "php", "PHP", "前端", "全栈", "后端", "技术主管", "小程序开发",
        "程序员", "技术总监", "服务端", "软件开发", "后台开发", "web开发",
        "开发工程师", "软件工程师", "技术经理", "技术合伙人", "IT技术支持"
    ];
    // 设置的打招呼语
    let greeting = "您好，我对这份工作非常感兴趣，希望可以有机会与您进一步沟通。";
    // 常用语第一句的匹配
    let commonSendStrPatten = "您好，我有php处理日活百万数据访问经验";

    // 一键发起沟通
    function oneClickStartChat() {
        console.log("执行了oneClickStartChat函数");
        // 所有的职位
        let curJobs = document.getElementsByClassName('job-card-footer')

        if (curJobs.length < 1) {
            alert("拿不到职位列表")
            return ;
        }
        countAllJobs += curJobs.length;
        console.log(`已经浏览了${countAllJobs}个岗位，已沟通了${countSendJobs}个岗位`);

        for (var i = curJobs.length - 1; i >= 0; i--) {
            // 当前循环处理的职位信息
            let curJob = curJobs[i];

            // 当前工作信息
            let curJobInfo = curJob.previousElementSibling;
            // 职位名称
            let curJobName = curJobInfo.childNodes[0].childNodes[0]

            // 检索是否含有关键字
            for (var j = hightightKeyWords.length - 1; j >= 0; j--) {
                if (curJobName.innerText.indexOf(hightightKeyWords[j]) !== -1) {
                    // 符合条件设置
                    curJobInfo.style.backgroundColor = "lightcoral";
                    curJobName.style.color = "white";
                    curJobName.nextElementSibling.style.color = "white";
                    break;
                }
            }

            let btn = document.createElement('button');

            // 样式处理
            btn.style.border = "1px solid #00bebd";
            btn.style.backgroundColor = "#dbf5f2";
            btn.style.borderRadius = "7px";
            btn.style.padding = "5px";

            btn.setAttribute('class', 'mySendJobBtn')
            btn.innerText = '沟通';
            // 添加按钮
            curJob.append(btn)

            // 点击事件
            btn.onclick = function() {
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
                                alert("无法点击留在此页")
                                return ;
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
        }
    }

    // 一键发送常用语
    function oneClickSendMsg() {
        // 所有的消息
        let allMsgs = document.getElementsByClassName('last-msg-text')

        if (allMsgs.length < 1) {
            alert("拿不到消息列表")
            return ;
        }
        // countAllMsgs += allMsgs.length;
        // console.log(`已经浏览了${countAllMsgs}个消息，已发送了${countSendMsgs}个常用语`);

        for (var i = allMsgs.length - 1; i >= 0; i--) {
            // 当前循环处理的信息
            let curMsg = allMsgs[i];

            // 已经进行过沟通的，不再发送
            if (curMsg.innerText != greeting) {
                continue;
            }

            startSendMsg(curMsg);
            return ;
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

                console.log("给 " + msg.parentNode.previousElementSibling.childNodes[0].innerText + " 发送消息");

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
            return ;
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
        oneClickStartChat();

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
        let anchorDom = document.getElementsByClassName('recommend-search-more')
        if (anchorDom.length < 1) {
            alert("获取不到锚点位置，确认是否已经改版")
            return ;
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
            alert("获取不到锚点位置，确认是否已经改版")
            return ;
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
