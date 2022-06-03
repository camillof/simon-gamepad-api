const start_button = document.querySelector('#start_button');
const total_score_span = document.querySelector('#title');
const simon_speed_input = document.querySelector('[name="simon_speed"]');
const gamepad_buttons = document.querySelectorAll('[data-key]');
// * Sound Effects *
const sounds = {
  green: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
  red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
  blue: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
  pink: new Audio ("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
};


let simonPath;
let userPath;
let isSimonPlaying = true;
let availableButtons = [];
let simonSpeed = 0.5;
let pressedButtons = {};

function startNewGame() {
  simonPath = [];
  userPath = [];
  availableButtons = [];
  
  
  const fooo += "            aa "
  
  

  gamepad_buttons.forEach(button => {
    availableButtons.push(
      {
        key: button.dataset.key,
        color: button.dataset.color,
        node: button
      }
    );
  })
  playSimonTurn();
}

function playSimonTurn(){
  simonSpeed = 1 - parseFloat(simon_speed_input.value);
  document.documentElement.style.setProperty('--animation_speed', simonSpeed + 's');
  isSimonPlaying=true;
  updateTitle("Simon is playing...");
  userPath=[];
  // Add a random value from the available buttons to the simonPath
  simonPath.push(availableButtons[Math.floor(Math.random() * availableButtons.length)]);
  // Show simon path to user with a timeout between each value
  simonPath.forEach(function(el, index) {
    setTimeout(function() {
      animateButton(el);
      el.node.addEventListener('animationend', () => {
        if(index == simonPath.length-1) {
          isSimonPlaying=false;
          updateTitle("Your turn...");
        }
      }, {once: true});
    }, index * (simonSpeed * 1000 + 300));
  })
  console.log(simonPath);
}

function handleUserInput(event) {
  // Start button pressed
  if (event.detail == 9) {
    startNewGame();
  }

  else if(!isSimonPlaying){
    buttonPressed = availableButtons.find(button => button.key == event.detail);

    // If the player pressed one of the available buttons
    if (buttonPressed) {
      document.documentElement.style.setProperty('--animation_speed', '0.3s');

      animateButton(buttonPressed);
      userPath.push(buttonPressed);
      compareUserVsSimonPaths();
    }
  }
}

function compareUserVsSimonPaths() {
  if(JSON.stringify(simonPath.slice(0, userPath.length)) != JSON.stringify(userPath)) {
    updateTitle(`LOOSER! total score: ${simonPath.length -1}`);
    // Shake the poor looser a bit.
    navigator.getGamepads()[0].vibrationActuator.playEffect("dual-rumble", {startDelay: 0, duration: 1000, weakMagintude: 0.5, strongMagnitude: 0.5});
    isSimonPlaying = true;
    return;
  }

  if(JSON.stringify(simonPath) == JSON.stringify(userPath)){
    isSimonPlaying = true;
    setTimeout(function() {
      playSimonTurn();
    }, 500);
    return;
  }

}

function animateButton(button) {
  document.documentElement.style.setProperty('--color', button.color);
  button.node.classList.add('animate');
  sounds[button.color].currentTime = 0;
  sounds[button.color].play();
  button.node.addEventListener('animationend', () => {
    button.node.classList.remove('animate');
  }, {once: true});
}

function updateTitle(text) {
  total_score_span.innerHTML = text;
}

start_button.addEventListener('click', startNewGame);

window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
});

// Start polling gamepad state
setInterval(() => {
  // If there is a gamepad connected
  if (navigator.getGamepads()[0]) {
    gamepadButtons = navigator.getGamepads()[0].buttons;
    gamepadButtons.forEach((button, index) => {
      lastState = pressedButtons[index];
      if(!button.pressed && lastState){
        let event = new CustomEvent('gamepad_button_pressed', { detail: index });
        window.dispatchEvent(event);
      }
      pressedButtons[index] = button.pressed;
    });
  }
}, 30);

window.addEventListener('gamepad_button_pressed', handleUserInput);
