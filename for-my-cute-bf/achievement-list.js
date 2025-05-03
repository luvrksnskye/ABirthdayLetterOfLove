function waitForAchievementData(checkInterval = 100) {
  return new Promise((resolve) => {
    if("achievementData" in window)
      resolve();

    const interval = setInterval(() => {

      if ("achievementData" in window) { 
        clearInterval(interval); 
        resolve(); 
      }
    }, checkInterval); 
  });
}

async function showAchievements(listObtainedFirst) {

  await waitForAchievementData();

  let achievementData = window["achievementData"];

  for (var namespace in achievementData) {
    const listByNamespace = document.getElementById("achievement-list-" + namespace);
    if(!listByNamespace) {
      continue;
    }

    listByNamespace.innerHTML = '';

    const toastStyleID = "toast-style-" + namespace;
    if(!document.getElementById(toastStyleID)) {

      let link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.id = toastStyleID;
      link.href = achievementData[namespace].style;
      document.head.appendChild(link);
    }

    const toastTemplateID = "toast-template-" + namespace;
    if(!document.getElementById(toastTemplateID)) {
      const response = await fetch(achievementData[namespace].template, {cache: "no-store"});
      const templateData = await response.text();
      document.body.insertAdjacentHTML("beforeend", "<template id=" + toastTemplateID + ">" + templateData + "</template>");
    }

    const achievementTemplate = document.getElementById(toastTemplateID);

    let obtainedCount = 0;

    for(var achievementName in achievementData[namespace].achievements) {
      let achievementInfo = achievementData[namespace].achievements[achievementName];

      const clone = achievementTemplate.content.cloneNode(true);

      const toast = clone.querySelector(".achievement-toast");
      const toastIcon = clone.querySelector(".toast-icon");
      const toastTitle = clone.querySelector(".toast-title");
      const toastDescription = clone.querySelector(".toast-description");

      toast.className += " " + achievementInfo.class;
      toastIcon.src = achievementInfo.icon;
      toastTitle.textContent = achievementInfo.title;
      toastDescription.textContent = achievementInfo.description;

      toast.style.animationName = "initial";
      toast.style.position = "initial";
      toast.style.left = "initial";
      toast.style.top = "initial";

      if(!hasAchievement(namespace, achievementName)) {

        if("hidden" in achievementInfo && "hidden" in achievementData[namespace]) {
          let hidden = achievementData[namespace].hidden;
          if("class" in hidden) toast.className += " " + hidden.class;
          if("icon" in hidden) toastIcon.src = hidden.icon;
          if("title" in hidden) toastTitle.textContent = hidden.title;
          if("description" in hidden) toastDescription.textContent = hidden.description;
        } else if("missing" in achievementData[namespace]) {
          let missing = achievementData[namespace].missing;
          if("class" in missing) toast.className += " " + missing.class;
          if("icon" in missing) toastIcon.src = missing.icon;
          if("title" in missing) toastTitle.textContent = missing.title;
          if("description" in missing) toastDescription.textContent = missing.description;
        }
      }

      if(listObtainedFirst) {
        if(hasAchievement(namespace, achievementName)) {
          listByNamespace.insertBefore(clone, listByNamespace.childNodes[obtainedCount]);
          obtainedCount++;
        } else {
          listByNamespace.appendChild(clone);
        }
      } else {
        listByNamespace.appendChild(clone);
      }
    }
  }

  let totalAchievementCount = 0;
  let foundTotalAchievements = 0;
  let achievementPerNamespace = {};
  let foundAchievementPerNamespace = {};
  for (var namespaceCount in achievementData) {
    achievementPerNamespace[namespaceCount] = 0;
    foundAchievementPerNamespace[namespaceCount] = 0;

    for(var achievementCount in achievementData[namespaceCount].achievements) {
      totalAchievementCount++;
      achievementPerNamespace[namespaceCount]++;
      if(hasAchievement(namespaceCount, achievementCount)) {
        foundTotalAchievements++;
        foundAchievementPerNamespace[namespaceCount]++;
      }
    }
  }

  let completed = foundTotalAchievements === totalAchievementCount;

  const achievementListCountNode = document.getElementById("achievement-list-count");
  if(achievementListCountNode) achievementListCountNode.textContent = foundTotalAchievements + "/" + totalAchievementCount;
  if(achievementListCountNode && completed) achievementListCountNode.classList.add("complete");

  const achievementListPercentageNode = document.getElementById("achievement-list-percentage");
  if(achievementListPercentageNode) achievementListPercentageNode.textContent = Math.round(foundTotalAchievements/totalAchievementCount*100) + "%";
  if(achievementListPercentageNode && completed) achievementListPercentageNode.classList.add("complete");

  const achievementListBarNode = document.getElementById("achievement-list-bar");
  if(achievementListBarNode) achievementListBarNode.style.width = (foundTotalAchievements/totalAchievementCount*100) + "%";
  if(achievementListBarNode && completed) achievementListBarNode.classList.add("complete");

  for (var ns in achievementData) {
    let achievementCompleted = foundAchievementPerNamespace[ns] === achievementPerNamespace[ns];

    const achievementNamespaceListCountNode = document.getElementById("achievement-list-count-" + ns);
    if(achievementNamespaceListCountNode) achievementNamespaceListCountNode.textContent = foundAchievementPerNamespace[ns] + "/" + achievementPerNamespace[ns];
    if(achievementNamespaceListCountNode && achievementCompleted) achievementNamespaceListCountNode.classList.add("complete");

    const achievementNamespaceListPercentageNode = document.getElementById("achievement-list-percentage-" + ns);
    if(achievementNamespaceListPercentageNode) achievementNamespaceListPercentageNode.textContent = Math.round(foundAchievementPerNamespace[ns]/achievementPerNamespace[ns]*100) + "%";
    if(achievementNamespaceListPercentageNode && achievementCompleted) achievementNamespaceListPercentageNode.classList.add("complete");

    const achievementNamespaceListBarNode = document.getElementById("achievement-list-bar-" + ns);
    if(achievementNamespaceListBarNode) achievementNamespaceListBarNode.style.width = (foundAchievementPerNamespace[ns]/achievementPerNamespace[ns]*100) + "%";
    if(achievementNamespaceListBarNode && achievementCompleted) achievementNamespaceListBarNode.classList.add("complete");
  }

}

