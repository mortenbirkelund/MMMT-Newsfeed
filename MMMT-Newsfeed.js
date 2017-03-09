/* global Module */

/* Magic Mirror
 * Module: NewsFeed
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMMT-Newsfeed",{

	// Default module config.
	defaults: {
		feeds: [
			{
				title: "Mazhar's Blog",
				url: "http://mightymaze.github.io/feed.xml",
				encoding: "UTF-8" //ISO-8859-1
			}
		],
		showSourceTitle: true,
		showPublishDate: true,
		showDescription: false,
		reloadInterval:  5 * 60 * 1000, // every 5 minutes
		updateInterval: 5 * 60 * 1000,
		//updateInterval: 10 * 1000,
		animationSpeed: 2.5 * 1000,
		maxNewsItems: 0, // 0 for unlimited
		removeStartTags: "",
		removeEndTags: "",
		startTags: [],
		endTags: []

	},

	// Define required scripts.
	getScripts: function() {
		return [
			"moment.js",
			this.file("node_modules/swiper/dist/js/swiper.min.js")
		];
	},

	// Define required styles
	getStyles: function() {
		return [
			'MMMT-Newsfeed.css',
			// this file will be loaded from the bootstrapcdn servers.
			this.file("node_modules/swiper/dist/css/swiper.min.css")
		]
	},

	// Define required translations.
	getTranslations: function() {
		// The translations for the defaut modules are defined in the core translation files.
		// Therefor we can just return false. Otherwise we should have returned a dictionairy.
		// If you're trying to build yiur own module including translations, check out the documentation.
		return false;
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.newsItems = [];
		this.loaded = false;
		this.activeItem = 0;

		this.registerFeeds();

	},

	// Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "NEWS_ITEMS") {
			this.generateFeed(payload);

			if (!this.loaded) {
				this.scheduleUpdateInterval();
			}

			this.loaded = true;

			// load the slider here
			// now do my things here
			// var mySwiper = new Swiper ('.swiper-container', {
			//     loop: true,
			    
			//     // Navigation arrows
			//     nextButton: '.swiper-button-next',
			//     prevButton: '.swiper-button-prev',
			// });
			setTimeout(function(){
				// now do my things here
				var mySwiper = new Swiper ('.swiper-container', {
				    loop: true,
				    
				    // Navigation arrows
				    nextButton: '.swiper-button-next',
				    prevButton: '.swiper-button-prev',
				});
			}, 1000);
		}
	},

	// Override dom generator.
	getDom: function() {

		// test goes here ===========================================================

		var container = document.createElement("div");
		container.className = 'swiper-container';

		if (this.config.feedUrl) {
			container.className = "small bright";
			container.innerHTML = "The configuration options for the newsfeed module have changed.<br>Please check the documentation.";
			return container;
		}

		var wrapper = document.createElement("div");
		wrapper.className = 'swiper-wrapper';

        if (this.newsItems.length > 0) {
        	for (var i = 0; i < this.newsItems.length; i++) {
        		var elem = document.createElement("div");
        		elem.className = 'swiper-slide';
        		// do your things here

        		if (this.config.showSourceTitle || this.config.showPublishDate) {
					var sourceAndTimestamp = document.createElement("div");
					sourceAndTimestamp.className = "light small dimmed";

					if (this.config.showSourceTitle && this.newsItems[i].sourceTitle !== "") {
						sourceAndTimestamp.innerHTML = this.newsItems[i].sourceTitle;
					}
					if (this.config.showSourceTitle && this.newsItems[i].sourceTitle !== "" && this.config.showPublishDate) {
						sourceAndTimestamp.innerHTML += ", ";
					}
					if (this.config.showPublishDate) {
						sourceAndTimestamp.innerHTML += moment(new Date(this.newsItems[i].pubdate)).fromNow();
					}
					if (this.config.showSourceTitle && this.newsItems[i].sourceTitle !== "" || this.config.showPublishDate) {
						sourceAndTimestamp.innerHTML += ":";
					}

					elem.appendChild(sourceAndTimestamp);
				}

				//Remove selected tags from the beginning of rss feed items (title or description)
				if (this.config.removeStartTags == "title" || "both") {

					for (f=0; f<this.config.startTags.length;f++) {
						if (this.newsItems[i].title.slice(0,this.config.startTags[f].length) == this.config.startTags[f]) {
							this.newsItems[i].title = this.newsItems[i].title.slice(this.config.startTags[f].length,this.newsItems[i].title.length);
						}
					}

				}

				if (this.config.removeStartTags == "description" || "both") {

					if (this.config.showDescription) {
						for (f=0; f<this.config.startTags.length;f++) {
							if (this.newsItems[i].description.slice(0,this.config.startTags[f].length) == this.config.startTags[f]) {
								this.newsItems[i].title = this.newsItems[i].description.slice(this.config.startTags[f].length,this.newsItems[i].description.length);
							}
						}
					}

				}

				//Remove selected tags from the end of rss feed items (title or description)
				if (this.config.removeEndTags) {
					for (f=0; f<this.config.endTags.length;f++) {
						if (this.newsItems[i].title.slice(-this.config.endTags[f].length)==this.config.endTags[f]) {
							this.newsItems[i].title = this.newsItems[i].title.slice(0,-this.config.endTags[f].length);
						}
					}

					if (this.config.showDescription) {
						for (f=0; f<this.config.endTags.length;f++) {
							if (this.newsItems[i].description.slice(-this.config.endTags[f].length)==this.config.endTags[f]) {
								this.newsItems[i].description = this.newsItems[i].description.slice(0,-this.config.endTags[f].length);
							}
						}
					}

				}

				var title = document.createElement("div");
				title.className = "bright medium light";
				title.innerHTML = this.newsItems[i].title;
				elem.appendChild(title);

				if (this.config.showDescription) {
					var description = document.createElement("div");
					description.className = "small light";
					description.innerHTML = this.newsItems[i].description;
					elem.appendChild(description);
				}

        		// append the div
        		wrapper.appendChild(elem);
        	}
        }

		container.appendChild(wrapper);
		var elem = document.createElement("div");
    	elem.className = 'swiper-button-prev';
    	container.appendChild(elem);

		elem = document.createElement("div");
    	elem.className = 'swiper-button-next';
    	container.appendChild(elem);


		return container;

		// ============== ========================================== ================


		var wrapper = document.createElement("div");
		// wrapper.className = 'swiper-wrapper';

		if (this.config.feedUrl) {
			wrapper.className = "small bright";
			wrapper.innerHTML = "The configuration options for the newsfeed module have changed.<br>Please check the documentation.";
			return wrapper;
		}

		if (this.activeItem >= this.newsItems.length) {
			this.activeItem = 0;
		}

		if (this.newsItems.length > 0) {

			if (this.config.showSourceTitle || this.config.showPublishDate) {
				var sourceAndTimestamp = document.createElement("div");
				sourceAndTimestamp.className = "light small dimmed";

				if (this.config.showSourceTitle && this.newsItems[this.activeItem].sourceTitle !== "") {
					sourceAndTimestamp.innerHTML = this.newsItems[this.activeItem].sourceTitle;
				}
				if (this.config.showSourceTitle && this.newsItems[this.activeItem].sourceTitle !== "" && this.config.showPublishDate) {
					sourceAndTimestamp.innerHTML += ", ";
				}
				if (this.config.showPublishDate) {
					sourceAndTimestamp.innerHTML += moment(new Date(this.newsItems[this.activeItem].pubdate)).fromNow();
				}
				if (this.config.showSourceTitle && this.newsItems[this.activeItem].sourceTitle !== "" || this.config.showPublishDate) {
					sourceAndTimestamp.innerHTML += ":";
				}

				wrapper.appendChild(sourceAndTimestamp);
			}

			//Remove selected tags from the beginning of rss feed items (title or description)
			if (this.config.removeStartTags == "title" || "both") {

				for (f=0; f<this.config.startTags.length;f++) {
					if (this.newsItems[this.activeItem].title.slice(0,this.config.startTags[f].length) == this.config.startTags[f]) {
						this.newsItems[this.activeItem].title = this.newsItems[this.activeItem].title.slice(this.config.startTags[f].length,this.newsItems[this.activeItem].title.length);
					}
				}

			}

			if (this.config.removeStartTags == "description" || "both") {

				if (this.config.showDescription) {
					for (f=0; f<this.config.startTags.length;f++) {
						if (this.newsItems[this.activeItem].description.slice(0,this.config.startTags[f].length) == this.config.startTags[f]) {
							this.newsItems[this.activeItem].title = this.newsItems[this.activeItem].description.slice(this.config.startTags[f].length,this.newsItems[this.activeItem].description.length);
						}
					}
				}

			}

			//Remove selected tags from the end of rss feed items (title or description)
			if (this.config.removeEndTags) {
				for (f=0; f<this.config.endTags.length;f++) {
					if (this.newsItems[this.activeItem].title.slice(-this.config.endTags[f].length)==this.config.endTags[f]) {
						this.newsItems[this.activeItem].title = this.newsItems[this.activeItem].title.slice(0,-this.config.endTags[f].length);
					}
				}

				if (this.config.showDescription) {
					for (f=0; f<this.config.endTags.length;f++) {
						if (this.newsItems[this.activeItem].description.slice(-this.config.endTags[f].length)==this.config.endTags[f]) {
							this.newsItems[this.activeItem].description = this.newsItems[this.activeItem].description.slice(0,-this.config.endTags[f].length);
						}
					}
				}

			}

			var title = document.createElement("div");
			title.className = "bright medium light";
			title.innerHTML = this.newsItems[this.activeItem].title;
			wrapper.appendChild(title);

			if (this.config.showDescription) {
				var description = document.createElement("div");
				description.className = "small light";
				description.innerHTML = this.newsItems[this.activeItem].description;
				wrapper.appendChild(description);
			}

		} else {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "small dimmed";
		}

		return wrapper;
	},

	/* registerFeeds()
	 * registers the feeds to be used by the backend.
	 */

	registerFeeds: function() {
		for (var f in this.config.feeds) {
			var feed = this.config.feeds[f];
			this.sendSocketNotification("ADD_FEED", {
				feed: feed,
				config: this.config
			});
		}
	},

	/* registerFeeds()
	 * Generate an ordered list of items for this configured module.
	 *
	 * attribute feeds object - An object with feeds returned by the nod helper.
	 */
	generateFeed: function(feeds) {
		var newsItems = [];
		for (var feed in feeds) {
			var feedItems = feeds[feed];
			if (this.subscribedToFeed(feed)) {
				for (var i in feedItems) {
					var item = feedItems[i];
					item.sourceTitle = this.titleForFeed(feed);
					newsItems.push(item);
				}
			}
		}
		newsItems.sort(function(a,b) {
			var dateA = new Date(a.pubdate);
			var dateB = new Date(b.pubdate);
			return dateB - dateA;
		});
		if(this.config.maxNewsItems > 0) {
			newsItems = newsItems.slice(0, this.config.maxNewsItems);
		}
		this.newsItems = newsItems;
	},

	/* subscribedToFeed(feedUrl)
	 * Check if this module is configured to show this feed.
	 *
	 * attribute feedUrl string - Url of the feed to check.
	 *
	 * returns bool
	 */
	subscribedToFeed: function(feedUrl) {
		for (var f in this.config.feeds) {
			var feed = this.config.feeds[f];
			if (feed.url === feedUrl) {
				return true;
			}
		}
		return false;
	},

	/* subscribedToFeed(feedUrl)
	 * Returns title for a specific feed Url.
	 *
	 * attribute feedUrl string - Url of the feed to check.
	 *
	 * returns string
	 */
	titleForFeed: function(feedUrl) {
		for (var f in this.config.feeds) {
			var feed = this.config.feeds[f];
			if (feed.url === feedUrl) {
				return feed.title || "";
			}
		}
		return "";
	},

	/* scheduleUpdateInterval()
	 * Schedule visual update.
	 */
	scheduleUpdateInterval: function() {
		var self = this;

		self.updateDom(self.config.animationSpeed);

		setInterval(function() {
			self.activeItem++;
			self.updateDom(self.config.animationSpeed);
		}, this.config.updateInterval);
	},

	/* capitalizeFirstLetter(string)
	 * Capitalizes the first character of a string.
	 *
	 * argument string string - Input string.
	 *
	 * return string - Capitalized output string.
	 */
	capitalizeFirstLetter: function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},


});
