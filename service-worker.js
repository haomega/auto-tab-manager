import { isAutoGroup, isAutoCLoseInactive, isAutoFoldOtherGroup } from "./service-config.js";

console.log("service worker started!");

// 自动创建标签分组
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info && info.status !== "complete") {
    return;
  }
  console.debug("tab updted ", tabId, info, tab);

  const isEnableAutoGroup = await isAutoGroup();
  if (isEnableAutoGroup) {
    await groupTabs(tab);
    const currTab = await getCurrentTab();
    console.debug("auto group currTab", currTab.groupId, currTab);
    if (currTab.groupId > 0) {
      await chrome.tabGroups.update(currTab.groupId, { collapsed: false });
      foldOtherGroup(currTab);
    }
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
// 自动折叠其他分组
chrome.tabs.onHighlighted.addListener(async ({ tabIds, windowId }) => {
  console.debug("highlighted ", tabIds, windowId);
  if (tabIds.length > 0) {
    const tab = await chrome.tabs.get(tabIds[0]);
    foldOtherGroup(tab);
  }
});
// 关闭不活跃的tab
setInterval(() => {
  isAutoCLoseInactive().then((res) => {
    if (res) {
      chrome.tabs.query({ status: "unloaded" }).then((res) => {
        console.log(res);
        const tabIds = res.map(({ id }) => id);
        chrome.tabs.remove(tabIds);
      });
    }
  });
}, 10000);

// 折叠除当前分组外的其他分组
async function foldOtherGroup(currTab) {
  const isEnable = await isAutoFoldOtherGroup();
  if (!isEnable) {
    return;
  }

  const currTabGroupId = currTab.groupId;
  const windowId = currTab.windowId;
  if (currTabGroupId == -1) {
    return;
  }

  // 折叠其他分组
  const tabGroups = await chrome.tabGroups.query({ collapsed: false, windowId: windowId });
  console.debug("fold group", tabGroups);
  for (const group of tabGroups) {
    if (currTabGroupId != group.id) {
      setTimeout(() => {
        chrome.tabGroups.update(group.id, { collapsed: true });
      }, 100);
    }
  }
}

// 自动分组
async function groupTabs(currTab) {
  if (!currTab || currTab.groupId != -1) {
    return;
  }

  const windowId = currTab.windowId;
  const tabs = await chrome.tabs.query({ groupId: chrome.tabGroups.TAB_GROUP_ID_NONE });

  const newDomainMap = new Map();

  for (const tab of tabs) {
    const domain = getDomain(tab.url);
    if (domain == null || isChromeOriginalTab(tab)) {
      continue;
    }
    const existsGroups = await chrome.tabGroups.query({ windowId: windowId, title: domain });
    if (existsGroups && existsGroups.length > 0) {
      const existsGroup = existsGroups[0];
      console.log("add to exists ", tab);
      // add to exists group
      const existsGroupTabs = await chrome.tabs.query({ groupId: existsGroup.id });
      const existsGroupTabsIds = existsGroupTabs.map(({ id }) => id);
      existsGroupTabsIds.push(tab.id);
      const chromeGroup = await chrome.tabs.group({ createProperties: { windowId: windowId }, tabIds: existsGroupTabsIds });
      chrome.tabGroups.update(chromeGroup, { title: domain, color: existsGroup.color });
    } else {
      const domainTabs = newDomainMap.get(domain) || [];
      domainTabs.push(tab);
      newDomainMap.set(domain, domainTabs);
    }
  }

  for (const [domain, tabsArr] of newDomainMap) {
    if (tabsArr && tabsArr.length >= 2) {
      const tabIds = tabsArr.map(({ id }) => id);
      const chromeGroup = await chrome.tabs.group({ createProperties: { windowId: windowId }, tabIds: tabIds });
      chrome.tabGroups.update(chromeGroup, { title: domain, collapsed: true });
    }
  }
}

function group(array, supplier) {
  const tabGroupByDomain = {};
  for (const tab of array) {
    const domain = supplier(tab);
    if (domain) {
      var arr = tabGroupByDomain[domain];
      if (arr) {
        arr.push(tab);
      } else {
        arr = new Array();
        arr.push(tab);
        tabGroupByDomain[domain] = arr;
      }
    }
  }
  return tabGroupByDomain;
}

// get domain for url, eg: abc.com/xxx -> abc.com
function getDomain(url) {
  const arr = url.split("/");
  var domain = arr[2];
  if (domain == undefined) {
    return null;
  }
  return domain.split(":")[0];
}

function isChromeOriginalTab(tab) {
  return tab.url.startsWith("chrome://");
}
