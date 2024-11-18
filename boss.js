// ==UserScript==
// @name         Boss直聘一键投递按钮
// @namespace    http://tampermonkey.net/
// @version      2024-11-01
// @description  try to take over the world!
// @author       You
// @match        https://www.zhipin.com/web/geek/job-recommend*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhipin.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let countAllJobs = 0;
    let countSendJobs = 0;

    function oneClickSend() {
        console.log("执行了oneClickSend函数");
        // 所有的职位
        let curJobs = document.getElementsByClassName('job-card-footer')

        if (curJobs.length < 1) {
            alert("拿不到职位列表")
            return ;
        }
        countAllJobs += curJobs.length;
        console.log(`已经浏览了${countAllJobs}个岗位，已沟通了${countSendJobs}个岗位`);

        for (var i = curJobs.length - 1; i >= 0; i--) {
            let curJob = curJobs[i];

            let btn = document.createElement('button');
            btn.setAttribute('class', 'mySendJobBtn')
            btn.innerText = '沟通';
            // 添加按钮
            curJob.append(btn)

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
                        }, 1000)
                    } else {
                        console.log("此岗位已沟通过")
                    }
                }, 500)
            }
        }
    }

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

    function main() {
        console.clear();

        // 先执行一次
        oneClickSend();

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

            oneClickSend();
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

    // 防止页面没加载完
    setTimeout(main, 1000)
})();
