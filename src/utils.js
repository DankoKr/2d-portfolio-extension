export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  const closeBtn = document.getElementById("close");
  const kaboomCanvas = document.querySelector("game");

  dialogueUI.style.display = "block";
  let index = 0;
  let currentText = "";

  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }
    clearInterval(intervalRef);
  }, 10);

  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);

    closeBtn.removeEventListener("click", onCloseBtnClick);
    removeEventListener("keydown", onKeyDown);

    if (kaboomCanvas) {
      kaboomCanvas.focus();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      closeBtn.click();
    }
  }

  closeBtn.addEventListener("click", onCloseBtnClick);
  addEventListener("keydown", onKeyDown);
}

  
export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
  } else {
    k.camScale(k.vec2(1.5));
  }
}