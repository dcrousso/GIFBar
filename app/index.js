"use strict";

const previewContainer = Element.create(
	"div",
	{
		class: "preview-container",
	}
);
previewContainer.addEventListener("scroll", event => {
	if (previewContainer.scrollTop - lastScroll < (previewContainer.scrollHeight - lastScroll) / 2)
		return;

	lastScroll = previewContainer.scrollHeight;

	apiResult.next()
	.then(addPreviews);
});

let apiResult = null;
let previews = null;
let columns = null;
let lastScroll = null;

function resetPreviews(keepAPIResult) {
	if (previews)
		previews.forEach(preview => preview.hide(keepAPIResult));

	if (!keepAPIResult)
		apiResult = null;

	previews = [];
	columns = {
		right: 24,
		left: 24,
	};
	lastScroll = 0;
}

const input = Element.create(
	"input",
	{
		class: "search",
		type: "search",
		placeholder: "Search",
	}
);
input.addEventListener("input", (event => {
	let query = input.value.trim();
	if (!query.length) {
		getTrending();
		return;
	}

	API.Search.request(query)
	.then(search => {
		resetPreviews();

		apiResult = search;
		addPreviews(apiResult.data);

		previewContainer.scrollTop = 0;
	});
}).debounce(500));

function addPreviews(data) {
	previews = previews.concat(data.map(item => {
		let side = null;
		let offset = null;
		if (columns.right < columns.left) {
			side = Preview.Side.Right;
			offset = columns.right++;
		} else {
			side = Preview.Side.Left;
			offset = columns.left++;
		}

		let preview = new Preview(item);
		preview.show(previewContainer, offset, side);

		switch (side) {
		case Preview.Side.Right:
			columns.right += preview.height;
			break;
		case Preview.Side.Left:
			columns.left += preview.height;
			break;
		}

		return preview;
	}));

	previewContainer.classList.toggle("empty", !previews.length);
}

function getTrending() {
	API.Trending.request()
	.then(trending => {
		resetPreviews();

		apiResult = trending;
		addPreviews(apiResult.data);

		previewContainer.scrollTop = 0;
	});
}

window.addEventListener("click", event => {
	input.focus();
});

window.addEventListener("focus", event => {
	if (apiResult)
		addPreviews(apiResult.data);

	input.focus();
});

window.addEventListener("blur", event => {
	const keepAPIResult = true;
	resetPreviews(keepAPIResult);
});

const main = document.body.createChild(
	"main",
	{},
	input,
	previewContainer
);

getTrending();
