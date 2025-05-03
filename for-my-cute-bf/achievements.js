let achievementData;

fetch('/achievements.json', {cache: "no-store"})
    .then((response) => response.json())
    .then((json) => {
      achievementData = json;
      window.achievementData = achievementData;
});

async function loadAssets(namespace) {
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
}

function hasAchievement(namespace, achievementID) {
  return window.localStorage.getItem(namespace + ":" + achievementID) === 'true';
}

function waitForAchievementData(checkInterval = 100) {
  return new Promise((resolve) => {
    if(achievementData)
      resolve();

    const interval = setInterval(() => {
      if (achievementData) { 
        clearInterval(interval); 
        resolve(); 
      }
    }, checkInterval); 
  });
}

async function getAchievement(namespace, achievementID) {

  if(hasAchievement(namespace, achievementID)) {
    return;
  }

  await waitForAchievementData();

  if(!(achievementID in achievementData[namespace].achievements)) {
    return;
  }

  window.localStorage.setItem(namespace + ":" + achievementID, true);

  loadAssets(namespace).then(() => {
    const achievementTemplate = document.getElementById("toast-template-" + namespace);

    const clone = achievementTemplate.content.cloneNode(true);

    clone.querySelector(".achievement-toast").className += " " + achievementData[namespace].achievements[achievementID].class;
    clone.querySelector(".toast-icon").src = achievementData[namespace].achievements[achievementID].icon;
    clone.querySelector(".toast-title").textContent = achievementData[namespace].achievements[achievementID].title;
    clone.querySelector(".toast-description").textContent = achievementData[namespace].achievements[achievementID].description;

    let soundToPlay;
    soundToPlay = achievementData[namespace].sfx;
    if("sfx" in achievementData[namespace].achievements[achievementID])
      soundToPlay = achievementData[namespace].achievements[achievementID].sfx;

    if(soundToPlay) {
      let pienSFX = new Audio(soundToPlay);
      pienSFX.volume = 0.2;
      pienSFX.play();
    }

    const toast = clone.querySelector(".achievement-toast");
    setTimeout(() => {
      if(getComputedStyle(toast)["animation-name"] == "none") {
        toast.remove();
        return;
      }

      toast.style.animationDirection = "reverse";

      const elm = toast;
      var newone = elm.cloneNode(true);
      elm.parentNode.replaceChild(newone, elm);

      newone.addEventListener("animationend", (event) => {
        newone.remove();
      });
    }, 10000);

    document.body.appendChild(clone);
  });
}

window.addEventListener("message", (e) => {
  if("achievement" in e.data) {
    getAchievement(e.data.namespace, e.data.achievement);
  }
});