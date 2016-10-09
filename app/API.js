const API = {
	_key: "dc6zaTOxFJmzC",
	limit: 25,
	Trending : {
		GIF:     "http://api.giphy.com/v1/gifs/trending",
		Sticker: "http://api.giphy.com/v1/stickers/trending",
	},
	Search: {
		GIF:     "http://api.giphy.com/v1/gifs/search",
		Sticker: "http://api.giphy.com/v1/stickers/search",
	},
};

API.Result = class {
	constructor(endpoint, parameters) {
		this._endpoint = endpoint;

		this._parameters = parameters;
		this._parameters.api_key = API._key;
		this._parameters.limit = API.limit;
		this._parameters.offset = 0;

		this._data = [];
		this._fetching = false;
	}

	get data() { return this._data; }

	next() {
		if (!this._fetching) {
			this._fetching = Request.make(this._endpoint, this._parameters)
			.then(json => {
				this._fetching = null;
				return this._parseJSON(json);
			});
		}
		return this._fetching;
	}

	_parseJSON(json) {
		let data = [];
		if (Array.isArray(json.data)) {
			data = json.data.map(item => {
				return {
					url: item.images.original.url,
					page: item.url,
					fixedWidth: item.images.fixed_width.url,
					height: item.images.fixed_width.height,
				};
			});
			this._data = this._data.concat(data);
		}

		if (json.pagination)
			this._parameters.offset += json.pagination.count || 0;

		return {
			result: this,
			data,
		};
	}
};
