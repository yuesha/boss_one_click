// content.js

// 向background.js发送消息，确认注入成功
chrome.runtime.sendMessage({action: 'scriptInjected'}, (response) => {
    if (response && response.success) {
        console.log('内容脚本已成功注入');
        sendLog('内容脚本已成功注入');
    }
});

// 向popup发送日志
function sendLog(message, isError = false) {
    chrome.runtime.sendMessage({
        action: 'log',
        message: message,
        isError: isError
    });
    console.log(isError ? `[ERROR] ${message}` : message);
}

// 消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
        case 'startApply':
            if (isRunning) {
                sendLog('已有操作在运行，请先停止', true);
                sendResponse({success: false});
                return;
            }
            isRunning = true;
            currentOperation = 'apply';
            sendLog('开始一键投递');
            oneClickStartChat();
            sendResponse({success: true});
            break;
        case 'startChat':
            if (isRunning) {
                sendLog('已有操作在运行，请先停止', true);
                sendResponse({success: false});
                return;
            }
            isRunning = true;
            currentOperation = 'chat';
            sendLog('开始一键沟通');
            oneClickSendMsg();
            sendResponse({success: true});
            break;
        case 'stop':
            isRunning = false;
            currentOperation = null;
            sendLog('已停止所有操作');
            sendResponse({success: true});
            break;
        default:
            sendResponse({success: false});
    }
});

(function() {
    'use strict';

    // 初始化统计数据
    function initStatistics() {
        const today = new Date().toISOString().split('T')[0]; // 格式: YYYY-MM-DD
        let stats = JSON.parse(localStorage.getItem('bossHelperStats') || '{}');
        
        // 如果今天没有数据，初始化
        if (!stats[today]) {
            stats[today] = {
                countAllJobs: 0,
                countSendJobs: 0,
                countSendMsgs: 0
            };
        }
        
        // 从localStorage加载今天的数据
        window.countAllJobs = stats[today].countAllJobs;
        window.countSendJobs = stats[today].countSendJobs;
        window.countSendMsgs = stats[today].countSendMsgs;
        window.isRunning = false;
        window.currentOperation = null;
        window.today = today;
    }
    
    // 保存统计数据到localStorage
    function saveStatistics() {
        let stats = JSON.parse(localStorage.getItem('bossHelperStats') || '{}');
        stats[window.today] = {
            countAllJobs: window.countAllJobs,
            countSendJobs: window.countSendJobs,
            countSendMsgs: window.countSendMsgs
        };
        localStorage.setItem('bossHelperStats', JSON.stringify(stats));
        
        // 通知popup更新统计信息
        chrome.runtime.sendMessage({action: 'updateStats'});
    }
    
    // 初始化统计数据
    initStatistics();

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
    let greeting = "你好";
    // 常用语第一句的匹配
    let commonSendStrPatten = "您好，我拥有全栈开发及技术管理经验";

    // 移除旧的弹框代码，使用popup日志系统
    function customAlert(msg, isRed = false) {
        sendLog(msg, isRed);
    }

    // 一键发起沟通
    window.oneClickStartChat = function() {
        customAlert("执行了oneClickStartChat函数", true);
        // 是否高亮
        let isHight = false;
        // 点击事件
        let btnCliEven;
        let btnCliEvens = [];
        // 所有的职位
        let curJobs = document.getElementsByClassName('job-card-footer')

        if (curJobs.length < 1) {
            customAlert("拿不到职位列表")
            return;
        }
        countAllJobs += curJobs.length;
        customAlert(`已经浏览了${countAllJobs}个岗位，已沟通了${countSendJobs}个岗位`);

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
                if (!isRunning) return;

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
                                customAlert("无法点击留在此页，检查是否已达到沟通上限")
                                isRunning = false;
                                return;
                            }
                            // 继续留在本页
                            stayHeres[0].click()

                            toudiBtn.innerText = "已发起沟通，继续沟通"
                            customAlert("投递成功")

                            countSendJobs += 1;
                    saveStatistics();
                            btn.style.backgroundColor = "#fff";
                        }, 500)
                    } else {
                        btn.style.backgroundColor = "#fff";
                        customAlert("此岗位已沟通过")
                    }
                }, 500)
            }

            if (isHight) btnCliEvens.push(btnCliEven);

            btn.addEventListener('click', btnCliEven);
        }

        handleBtnCliEven(btnCliEvens);
    }

    function handleBtnCliEven(evens) {
            if (!isRunning) {
                customAlert('操作已停止', true);
                return;
            }

            let even = evens.pop();
            if (!even) {
                customAlert('已将当前页面所有高亮推荐岗位发起沟通', true);
                isRunning = false;
                return;
            }

            even();
            setTimeout(() => {
                handleBtnCliEven(evens);
            }, 2000)
        }

    // 一键发送常用语
      window.oneClickSendMsg = function() {
        // 所有的消息
        let allMsgs = document.getElementsByClassName('last-msg-text')

        if (allMsgs.length < 1) {
            customAlert("拿不到消息列表")
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

        customAlert('已经处理完全部消息', true);
    }

    // 开始发送常用语
    function startSendMsg(msg) {
            if (!isRunning) {
                customAlert('操作已停止', true);
                return;
            }

            // 进入聊天详情
            msg.click();

            setTimeout(() => {
                if (!isRunning) return;

                // 打开常用语
                let btnDict = document.getElementsByClassName('btn-dict')[0];
                if (!btnDict) {
                    customAlert("未找到打开常用语按钮");
                    return;
                }
                btnDict.click();

                setTimeout(() => {
                    if (!isRunning) return;

                    // 发送第一条常用语
                    let sentencePanel = document.getElementsByClassName('sentence-panel')[0];
                    if (!sentencePanel) {
                        customAlert("未找到常用语面板");
                        return;
                    }
                    let commonSend = sentencePanel.childNodes[1].childNodes[0];
                    if (!commonSend) {
                        customAlert("未找到第一条常用语");
                        return;
                    }
                    // 检测常用语的值
                    if (commonSend.innerText.indexOf(commonSendStrPatten) === -1) {
                        customAlert("请将常用语第一条设置为您要发送的内容");
                        return;
                    }

                    commonSend.click()

                    countSendJobs += 1;
                    saveStatistics();

                    let goalBoss = msg.parentNode.previousElementSibling.childNodes[0].innerText;
                    customAlert(`${countSendJobs} 给 ${goalBoss} 发送消息`);

                    setTimeout(() => {
                        if (isRunning) {
                            oneClickSendMsg();
                        }
                    }, 1000);
                }, 500);
            }, 500);
        }

    // 清除所有的已浏览职位
    function cleanMyBtns() {
        customAlert("执行清除");
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
        // 保留空函数以维持兼容性
    }

    // 职位沟通页面处理函数
    function jobChatHandle() {
        // 保留空函数以维持兼容性
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