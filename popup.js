const storage = chrome.storage.local;

const autoGroupEle = document.getElementById("switch-auto-group");
const autoCloseEle = document.getElementById("switch-auto-close-inactive");
const autoFoldEle = document.getElementById("switch-input-auto-fold-other-group");

storage.get(["autoGroup", "autoCloseInactive", "autoFoldOtherGroup"]).then((res) => {
  console.debug("get data", res);
  autoGroupEle.checked = res.autoGroup;
  autoCloseEle.checked = res.autoCloseInactive;
  autoFoldEle.checked = res.autoFoldOtherGroup;
});

autoGroupEle.addEventListener("change", (event) => {
  const enabled = event.target.checked;
  storage.set({ autoGroup: enabled });
});
autoCloseEle.addEventListener("change", (event) => {
  const enabled = event.target.checked;
  storage.set({ autoCloseInactive: enabled });
});
autoFoldEle.addEventListener("change", (event) => {
  const enabled = event.target.checked;
  storage.set({ autoFoldOtherGroup: enabled });
});

chrome.storage.onChanged.addListener((obj) => {
  console.debug("storage changed", obj);
});
