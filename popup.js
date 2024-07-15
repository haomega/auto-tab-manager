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


// Function to create and populate the table
async function populateTable() {
  const tabGroups = await chrome.tabGroups.query({});
  console.log("tabGroups", tabGroups);

  const tableBody = document.getElementById('table-body');
  const template = document.getElementById('table-row-tpl');

  tabGroups.forEach(async item => {
    const row = template.content.cloneNode(true);

    // Fill in the data
    row.querySelector('.url').textContent = item.title;
    tabs = await chrome.tabs.query({ groupId: item.id });
    row.querySelector('.count').textContent = tabs.length;
    row.querySelector('.btn-focus').onclick = function () {
      focusTabGroup(item.id);
    }
    row.querySelector('.btn-del').onclick = function () {
      deleteTabGroup(item.id);
    }

    // Append the new row to the table body
    tableBody.appendChild(row);
  });
}

// Call the function when the page loads
window.onload = populateTable;


function focusTabGroup(groupId) {
  console.log("foucs")

  chrome.tabs.query({ groupId: groupId }, function (tabs) {
    console.log(tabs);
    if (tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
  });
}

function deleteTabGroup(groupId) {
  console.log("delete")
  chrome.tabs.query({ groupId: groupId }, function (tabs) {
    console.log(tabs);
    if (tabs.length > 0) {
      chrome.tabs.remove(tabs.map(({ id }) => id), () => {
        window.location.reload();
      });
    }
  });
}
