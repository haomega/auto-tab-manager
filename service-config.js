const AUTO_GROUP = "autoGroup"; // 自动创建标签组
const AUTO_CLOSE_INACTIVE = "autoCloseInactive"; // 自动关闭不活跃的标签
const AUTO_FOLD_OTHER_GROUP = "autoFoldOtherGroup"; // 自动折叠其他标签

// Initialize default config
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.storage.local.set({
      AUTO_GROUP: true, // 自动创建标签组
      AUTO_CLOSE_INACTIVE: false, // 自动关闭不活跃的标签
      AUTO_FOLD_OTHER_GROUP: true, // 自动折叠其他标签
    });
  }
});

async function isAutoGroup() {
  return await chrome.storage.local.get([AUTO_GROUP]);
}

async function isAutoCLoseInactive() {
  return await chrome.storage.local.get([AUTO_CLOSE_INACTIVE]);
}

async function isAutoFoldOtherGroup() {
  return await chrome.storage.local.get([AUTO_FOLD_OTHER_GROUP]);
}

export { isAutoGroup, isAutoCLoseInactive, isAutoFoldOtherGroup };
