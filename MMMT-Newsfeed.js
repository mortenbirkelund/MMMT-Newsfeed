/* global Module */

/* Magic Mirror
 * Module: MMMT-NewsFeed (Magic Mirror Module Touch)
 *
 * By Morten Birkelund
 * Based on the work of Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

Module.register("MMMT-Newsfeed",{

	// Default module config.
	defaults: {
		feeds: [
			{
				title: "New York Times",
				url: "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
				encoding: "UTF-8" //ISO-8859-1
			}
		],
		showSourceTitle: true,
		showPublishDate: true,
		showDescription: false,
		reloadInterval:  5 * 60 * 1000, // every 5 minutes
		updateInterval: 1 * 1000,
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
			//this.file("node_modules/swiper/dist/js/swiper.jquery.min.js"),
			this.file("node_modules/swiper/dist/js/swiper.min.js")
		];
	},
	// Define required styles
	getStyles: function() {
		return [
			'MMMT-Newsfeed.css', 
			this.file("node_modules/swiper/dist/css/swiper.min.css")// this file will be loaded from the bootstrapcdn servers.
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
		}
	},


	
	// Override dom generator.
	getDom: function() {
		/*
		var swiper = new Swiper('.swiper-container');
				
		var container2 = document.createElement("div");
		container2.className = "swiper-container";
			
		var wrapper2 = document.createElement("div");
		wrapper2.className = "swiper-wrapper";
		
				
	
		for (var i = 0; i < 5; i++){
			var Slide2 = document.createElement("div");
			Slide2.className = "swiper-slide";

			Slide2.innerHTML = "Test";
			wrapper2.appendChild(Slide2);
		}
		container2.appendChild(wrapper2);
		
		return container2;
		*/
		//TEST	
		var swiper = new Swiper('.swiper-container');
		
		var container = document.createElement("div");
		container.className = "swiper-container";
		var wrapper = document.createElement("div");
		wrapper.className = "swiper-wrapper";
		
		if (this.config.feedUrl) {
			wrapper.className = "small bright";
			wrapper.innerHTML = "The configuration options for the newsfeed module have changed.<br>Please check the documentation.";
			return wrapper;
		}

		if (this.activeItem >= this.newsItems.length) {
			this.activeItem = 0;
		}
		
		//Adding the arrows
		var arrowLeft = document.createElement("i");
		var arrowRight = document.createElement("i");
		var self = this;
		
		arrowLeft.className = "fa fa-angle-left fa-2x";
		arrowLeft.style.display = "inline-block";
		arrowLeft.style.float = "left";
		arrowLeft.style.width = "5%";
		arrowLeft.addEventListener("click", function () {
            self.activeItem--;
			self.updateDom(self.config.animationSpeed);
            });

		
		arrowRight.className = "fa fa-angle-right fa-2x";
		arrowRight.style.display = "inline-block";
		arrowRight.style.float = "right";
		arrowRight.style.width = "5%";
		arrowRight.addEventListener("click", function () {
            self.activeItem++;
			self.updateDom(self.config.animationSpeed);
            });
		
		

		
		if (this.newsItems.length > 0){
			for (var i = 0; i < this.newsItems.length; i++) {


				// Create a div for all the content between the arrows
				var div = document.createElement("div");
				//div.style.display = "inline-block";
				//div.style.width = "90%";
				div.className = "swiper-slide";
				
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

					div.appendChild(sourceAndTimestamp);
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
				div.appendChild(title);

				if (this.config.showDescription) {
					var description = document.createElement("div");
					description.className = "small light";
					description.innerHTML = this.newsItems[this.activeItem].description;
					div.appendChild(description);
				}

				
				var url = this.newsItems[this.activeItem].url;
				var self = this;
				
				div.addEventListener("click", function () {
					//self.sendNotification("OPEN_URL",url)
					window.open(url,"","menubar=no,left=50%,scrollbars=yes,width=600,height=1000",true);

				});
	
				//wrapper.appendChild(arrowLeft);
				wrapper.appendChild(div);
				//wrapper.appendChild(arrowRight);
			}
		} else {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "small dimmed";
		}

		container.appendChild(wrapper);
		
		return container;
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
