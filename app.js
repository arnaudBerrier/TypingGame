const sentence = document.querySelector(".sentence-to-write");
const textareaToTest = document.querySelector(".textarea-to-test");
let spansFromApiSentence;

const APIEndpoint = "http://api.quotable.io/random";

async function getNewSentence() {
  try {
    const response = await fetch(APIEndpoint);

    if (!response.ok) throw new Error();

    const { content } = await response.json();

    sentence.textContent = "";

    content.split("").forEach((character) => {
      const spanCharacter = document.createElement("span");
      spanCharacter.textContent = character;
      sentence.appendChild(spanCharacter);
    });
    spansFromApiSentence = sentence.querySelectorAll(".sentence-to-write span");

    textareaToTest.value = "";
    locked = false;
  } catch (error) {
    sentence.textContent = error;
  }
}
getNewSentence();

const timeDisplayed = document.querySelector(".time");
const scoreDisplayed = document.querySelector(".score");

window.addEventListener("keydown", handleStart);

let time;
let score;
let timerID;

function handleStart(e) {
  if (!sentence.textContent)
    sentence.textContent = "Attendez l'arrivée de la phrase.";

  if (e.key === "Escape") {
    if (timerID) {
      clearInterval(timerID);
      timerID = undefined;
    }
    time = 60;
    score = 0;

    timeDisplayed.classList.add("active");
    textareaToTest.classList.add("active");

    timeDisplayed.textContent = `Temps: ${time}`;
    scoreDisplayed.textContent = `Score: ${score}`;
    textareaToTest.value = "";

    spansFromApiSentence.forEach((span) => (span.className = ""));

    textareaToTest.addEventListener("input", handleTyping);
    textareaToTest.focus();
  }
}

let locked = false;

function handleTyping(e) {
  if (locked) return;

  if (!timerID) startTimer();

  const sentenceCompleted = checkSpans();

  if (sentenceCompleted) {
    locked = true;
    getNewSentence();
    score += spansFromApiSentence.length;
    scoreDisplayed.textContent = `Score: ${score}`;
  }
}

function startTimer() {
  time--;
  timeDisplayed.textContent = `Temps: ${time}`;

  timerID = setInterval(handleTime, 1000);
}

function handleTime() {
  time--;
  timeDisplayed.textContent = `Temps: ${time}`;

  if (time === 0) {
    clearInterval(timerID);

    timeDisplayed.classList.remove("active");
    textareaToTest.classList.remove("active");

    const spansFromApiSentence = sentence.querySelectorAll("span");
    spansFromApiSentence.forEach((span) =>
      span.classList.contains("correct") ? score++ : ""
    );

    scoreDisplayed.textContent = `Score: ${score}`;
    textareaToTest.removeEventListener("input", handleTyping);
  }
}

function checkSpans() {
  const textareaCharactersArray = textareaToTest.value.split("");
  let sentenceCompleted = true;
  let currentGoodLetters = 0;

  for (let i = 0; i < spansFromApiSentence.length; i++) {
    if (textareaCharactersArray[i] === undefined) {
      spansFromApiSentence[i].className = "";
      sentenceCompleted = false;
    } else if (
      textareaCharactersArray[i] === spansFromApiSentence[i].textContent
    ) {
      spansFromApiSentence[i].classList.remove("wrong");
      spansFromApiSentence[i].classList.add("correct");
      currentGoodLetters++;
    } else {
      spansFromApiSentence[i].classList.add("wrong");
      spansFromApiSentence[i].classList.remove("correct");
      sentenceCompleted = 0;
    }
  }

  scoreDisplayed.textContent = `Score: ${score + currentGoodLetters}`;

  return sentenceCompleted;
}
