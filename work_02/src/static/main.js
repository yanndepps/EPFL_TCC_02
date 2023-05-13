// ——————————————————————————————————————————————————
// expand form inputs
// ——————————————————————————————————————————————————
// this fn is called on the login & register page's inputs
// it adds a nice opening animation fx
function expand(lbl) {
	// retrieve value of the for attribute from label el
	const elemId = lbl.getAttribute("for");
	// get the el with retrieved id & set height
	document.getElementById(elemId).style.height = "45px";
	// add new class to selected el
	document.getElementById(elemId).classList.add("my-style");
	// modify property & translate vertically for our fx
	lbl.style.transform = "translateY(-45px)";
}

// ——————————————————————————————————————————————————
// text scramble class
// ——————————————————————————————————————————————————
// takes an HTML el and scrambles its text content with rnd chars
// before revealing a final txt
class TextScramble {
	constructor(el) {
		this.el = el;
		this.chars = '▀▄▚▐─═0123.+?';
		this.update = this.update.bind(this);
	}
	// setText method
	// update the txt content with a scrambled txt fx
	// takes a newText param as the target txt to be displayed
	setText(newText) {
		// retrieves the current txt of the HTML el (oldText)
		const oldText = this.el.innerText;
		// calculate the max length between old and new txt
		const length = Math.max(oldText.length, newText.length);
		// create a Promise to indicate when the scrambling fx is complete
		const promise = new Promise((resolve) => this.resolve = resolve);
		// init an empty queue to store information about each char in the txt
		// including its original value (from), target value (to), and the starting
		// and ending frame nums for the scrambling txt fx
		this.queue = [];
		// iterate through the max length, create an object for each char with
		// aforedmentioned properties and push to the queue
		for (let i = 0; i < length; i++) {
			const from = oldText[i] || '';
			const to = newText[i] || '';
			const start = Math.floor(Math.random() * 160);
			const end = start + Math.floor(Math.random() * 160);
			this.queue.push({ from, to, start, end });
		}
		// cancel any ongoing animation frame requests
		// reset the frame count (this.frame)
		cancelAnimationFrame(this.frameRequest);
		this.frame = 0;
		// call the start of our scrambling fx on txt
		this.update();
		return promise;
	}

	// update method
	// create scrambling fx on txt and update the txt content
	// of the HTML el
	update() {
		// init an empty str (output) to store the updated txt content
		// adn a counter (complete) to track the num of chars that have
		// reached their final state
		let output = '';
		let complete = 0;
		// iterate through each char object in the (queue) ( generated in the
		// setText method )
		for (let i = 0, n = this.queue.length; i < n; i++) {
			let { from, to, start, end, char } = this.queue[i];
			// for each char object, check that :
			// 1. if the current frame (this.frame) >= to the end frame (end),
			// the char has reached the final state. Inc the (complete) counter
			// and append the target char (to) to the (output)
			// 2. if the current frame >= to the start frame, the char is
			// in scrambling phase -> generate a rnd char using the (randomChar) method
			// if it doesn't already exist or if a rnd condition is met
			// update the char object with the new rnd char and append it to the (output)
			// wrapped in a <span> el with the class (dud)
			// 3. if none of the above conditions are met, the char is still in its
			// original state -> append the original char (from) to the (output)
			if (this.frame >= end) {
				complete++;
				output += to;
			} else if (this.frame >= start) {
				if (!char || Math.random() < 0.28) {
					char = this.randomChar();
					this.queue[i].char = char;
				}
				output += `<span class="dud">${char}</span>`;
			} else {
				output += from;
			}
		}
		// update the innerHTML of the HTML el (this.el) with the (output) string
		this.el.innerHTML = output;
		// check if the (complete) counter is equal to the length of the (queue)
		// if true -> scrambling is complete -> the Promise is resolved
		// if false -> request next animation frame for the (update) method
		// and inc the frame counter (this.frame)
		if (complete === this.queue.length) {
			this.resolve();
		} else {
			this.frameRequest = requestAnimationFrame(this.update);
			this.frame++;
		}
	}

	// randomChar method
	// generate a rnd char from the predifined set of chars (this.chars)
	// calculate a rnd index by multiplying the rnd num between 0 and 1
	// ( generated by Math.random() ) with the length of the (chars) string
	// and round it down to the nearest int using ( Math.floor() )
	randomChar() {
		// return the char at the calculated rnd index from the (chars) string
		// also, we should check for an empty string ( although it should not happen )
		// if (!this.chars || this.chars.length === 0) {
		// handle the case where (chars) is empty or null
		// return "";
		// }
		return this.chars[Math.floor(Math.random() * this.chars.length)];
	}
}

// ——————————————————————————————————————————————————
// scramble -> home page
// ——————————————————————————————————————————————————
// assign the HTML el to a var
const homEl = document.getElementById("home-title");

// if the el is found (!null) -> proceed
if (homEl) {
	// create an array containing one or more string
	const phrases = [
		'Welcome !',
		'Login',
		'or',
		'Register',
	];

	// create new TextScramble instance and
	// pass the el as an argument
	const fx = new TextScramble(homEl);
	// init counter
	let counter = 0;

	// define the `next` fn
	// 1. call the `setText` method of the `fx` instance
	// with the argument `phrases` index pos set by `counter`
	// 2. when the promise resolves, set a timeout to call
	// the `next` fn again after x milliseconds
	// 3. inc the `counter` var and uses the modulo operator
	// to cycle through the `phrases` array
	const next = () => {
		fx.setText(phrases[counter]).then(() => {
			setTimeout(next, 800) // 0.8s
		});
		counter = (counter + 1) % phrases.length;
	}
	// call the `next` fn to start the animation
	next();
}

// ——————————————————————————————————————————————————
// scramble -> login page
// ——————————————————————————————————————————————————
const logEl = document.getElementById("log-title");

if (logEl) {
	const phrases = [
		'Login',
	];

	const fx = new TextScramble(logEl);
	let counter = 0;
	const next = () => {
		fx.setText(phrases[counter]).then(() => {
			setTimeout(next, 3000) // 3s
		});
		counter = (counter + 1) % phrases.length;
	}

	next();
}

// ——————————————————————————————————————————————————
// scramble -> register page
// ——————————————————————————————————————————————————
const regEl = document.getElementById("reg-title");

if (regEl) {
	const phrases = [
		'Register',
	];

	const fx = new TextScramble(regEl);
	let counter = 0;
	const next = () => {
		fx.setText(phrases[counter]).then(() => {
			setTimeout(next, 3000)
		});
		counter = (counter + 1) % phrases.length;
	}

	next();
}

// ——————————————————————————————————————————————————
// scramble -> notes page
// ——————————————————————————————————————————————————
const notEl = document.getElementById("notes-title");

if (notEl) {
	const phrases = [
		'Notes',
	];

	const fx = new TextScramble(notEl);
	let counter = 0;
	const next = () => {
		fx.setText(phrases[counter]).then(() => {
			setTimeout(next, 3000)
		});
		counter = (counter + 1) % phrases.length;
	}

	next();
}

// ——————————————————————————————————————————————————
