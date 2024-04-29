const storage = chrome.storage.local;

// Initialize default config
chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.debug("storage ", reason);
  if (reason === "install") {
    storage.set({
      autoGroup: true, // 自动创建标签组
      autoCloseInactive: false, // 自动关闭不活跃的标签
      autoFoldOtherGroup: true, // 自动折叠其他标签
    });
  }
});

async function isAutoGroup() {
  const autoGroupEntry = await storage.get(["autoGroup"]);
  return autoGroupEntry.autoGroup;
}

async function isAutoCLoseInactive() {
  const entry = await storage.get(["autoCloseInactive"]);
  return entry.autoCloseInactive;
}

async function isAutoFoldOtherGroup() {
  const entry = await storage.get(["autoFoldOtherGroup"]);
  return entry.autoFoldOtherGroup;
}

export { isAutoGroup, isAutoCLoseInactive, isAutoFoldOtherGroup };
