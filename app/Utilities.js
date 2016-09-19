Object.defineProperty(String.prototype, "copy", {
	value() {
		let textarea = document.body.createChild(
			"textarea",
			{
				class: "string-copy-container",
				tabindex: -1,
			}
		);
		textarea.value = this;
		textarea.select();

		try {
			document.execCommand("copy");
		} catch (err) {
		}

		textarea.remove();
	},
});

Object.defineProperty(Array.prototype, "remove", {
	value(value) {
		for (let i = this.length - 1; i >= 0; --i) {
			if (this[i] === value)
				this.splice(i, 1);
		}
	}
});

const debounceSymbol = Symbol("function-debounce");
Object.defineProperty(Function.prototype, "debounce", {
	value(delay, context) {
		return (...args) => {
			clearTimeout(this[debounceSymbol]);
			this[debounceSymbol] = setTimeout(() => {
					this.apply(context, args);
			}, delay);
		};
	},
});

Object.defineProperty(Request, "make", {
	value(url, parameters = {}) {
		let keys = Object.keys(parameters);
		if (!keys.length)
			return Promise.resolve({});

		parameters = keys.map(key => encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])).join("&");
		return fetch(url + "?" + parameters)
			.then(response => response.json());
	},
});

Object.defineProperty(Element, "create", {
	value(tag, attributes = {}, ...children) {
		let element = document.createElement(tag);

		for (let key in attributes) {
			if (Array.isArray(attributes[key]))
				element.setAttribute(key, attributes[key].join(" "))
			else
				element.setAttribute(key, attributes[key]);
		}

		children.forEach(child => {
			if (typeof child === "string")
				child = document.createTextNode(child);

			element.appendChild(child);
		});

		return element;
	},
});

Object.defineProperty(Element.prototype, "createChild", {
	value(tag, attributes = {}, ...children) {
		return this.appendChild(Element.create(tag, attributes, ...children));
	},
});
