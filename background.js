// background.js

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(() => {
    console.log('扩展程序已安装');
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'injectScript') {
        // 注入脚本到当前活动标签页
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                files: ['content.js']
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error('脚本注入失败:', chrome.runtime.lastError);
                    sendResponse({success: false, error: chrome.runtime.lastError.message});
                } else {
                    console.log('脚本注入成功');
                    sendResponse({success: true});
                }
            });
        });
        // 表示异步响应
        return true;
    }
});

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 当标签页加载完成并且URL匹配目标网站时
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('zhipin.com')) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content.js']
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error('自动注入脚本失败:', chrome.runtime.lastError);
            } else {
                console.log('自动注入脚本成功');
            }
        });
    }
});