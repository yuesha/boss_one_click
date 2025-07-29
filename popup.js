// popup.js

// 向内容脚本发送消息的函数
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
            if(callback) callback(response);
        });
    });
}

// 添加日志到日志容器
function addLog(message, isError = false) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry' + (isError ? ' log-error' : '');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContainer.prepend(logEntry); // 在顶部添加

    // 限制日志数量
    if (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// 显示当前日期
function displayCurrentDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('zh-CN', options);
}

// 从localStorage获取并显示统计数据
function displayStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const stats = JSON.parse(localStorage.getItem('bossHelperStats') || '{}');
    const todayStats = stats[today] || { countSendJobs: 0, countSendMsgs: 0 };
    
    document.getElementById('todayApplied').textContent = todayStats.countSendJobs;
    document.getElementById('todayChatted').textContent = todayStats.countSendMsgs;
}

// 控制停止按钮显示状态
function toggleStopButton(show) {
    document.getElementById('stop').style.display = show ? 'block' : 'none';
}

// 初始化函数
function init() {
    displayCurrentDate();
    displayStatistics();
    toggleStopButton(false);
    // 一键投递按钮
    document.getElementById('startApply').addEventListener('click', function() {
        addLog('开始一键投递...');
        sendMessageToContentScript({action: 'startApply'}, function(response) {
            if (response && response.success) {
                addLog('一键投递已启动');
                toggleStopButton(true);
            } else {
                addLog('启动一键投递失败', true);
            }
        });
    });

    // 一键沟通按钮
    document.getElementById('startChat').addEventListener('click', function() {
        addLog('开始一键沟通...');
        sendMessageToContentScript({action: 'startChat'}, function(response) {
            if (response && response.success) {
                addLog('一键沟通已启动');
                toggleStopButton(true);
            } else {
                addLog('启动一键沟通失败', true);
            }
        });
    });

    // 停止按钮
    document.getElementById('stop').addEventListener('click', function() {
        addLog('停止所有操作...');
        sendMessageToContentScript({action: 'stop'}, function(response) {
            if (response && response.success) {
                addLog('已停止所有操作');
                toggleStopButton(false);
            } else {
                addLog('停止操作失败', true);
            }
        });
    });

    // 监听来自content.js的消息
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'log') {
            addLog(request.message, request.isError);
        } else if (request.action === 'updateStats') {
            displayStatistics();
        }
    });

    addLog('插件已加载就绪');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);