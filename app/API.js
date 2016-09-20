const API = {
	_key: "dc6zaTOxFJmzC",
};

API._Result = class APIResult {
	constructor(parameters, json) {
		this._parameters = {
			offset: json.pagination.offset || 0,
		};

		for (let key in parameters)
			this._parameters[key] = parameters[key];

		this._data = [];
		this._fetching = false;

		this._parseJSON(json);
	}

	get data() { return this._data; }

	get endpoint() {
		return "";
	}

	next() {
		if (!this._fetching) {
			this._fetching = Request.make(this.endpoint, this._parameters)
			.then(json => {
				this._fetching = null;
				return this._parseJSON(json);
			});
		}
		return this._fetching;
	}

	map(callback) {
		return this._data.map(callback);
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

		return data;
	}
};

API.Trending = class Trending extends API._Result {
	static request() {
		let parameters = {
			api_key: API._key,
		};

		return Request.make(API.Trending.endpoint, parameters)
		.then(json => new API.Trending(parameters, json));
	}

	get endpoint() {
		return API.Trending.endpoint;
	}
}
API.Trending.endpoint = "http://api.giphy.com/v1/gifs/trending";

API.Search = class Search extends API._Result {
	static request(query) {
		let parameters = {
			api_key: API._key,
			q: query,
		};

		return Request.make(API.Search.endpoint, parameters)
		.then(json => new API.Search(parameters, json));
	}

	get endpoint() {
		return API.Search.endpoint;
	}
}
API.Search.endpoint = "http://api.giphy.com/v1/gifs/search";
