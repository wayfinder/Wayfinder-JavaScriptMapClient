/**
 * Class
 * Holds all the configuration variables.
 *
 * @name config
 */
var config = {
	tileSize		: 256,
	zoomRanges		: {"1":["-1280","-1280","1024","1024"],"2":["-2560","-2560","2304","2304"],"3":["-5120","-5120","4864","4864"],"4":["-10240","-10240","9984","9984"],"5":["-20480","-20480","20224","20224"],"6":["-40960","-40960","40704","40704"],"7":["-81920","-81920","81664","81664"],"8":["-163840","-163840","163584","163584"],"9":["-327680","-327680","327424","327424"],"10":["-655360","-655360","655104","655104"],"11":["-1310720","-1310720","1310464","1310464"],"12":["-2621440","-2621440","2621184","2621184"],"13":["-5242880","-5242880","5242624","5242624"],"14":["-10485760","-10485760","10485504","10485504"],"15":["-20971520","-20971520","20971264","20971264"]},
	mc2factor		: 11930464.7111,
	mc2RadianFactor : Math.PI/2147483648,
	tileServers		: ['oss-xml.services.wayfinder.com'],
	cursorOpenHand	: "url('img/grab.cur'), default",
	cursorCloseHand	: "url('img/grabbing.cur'), default"
};

var BrowserDetect = {
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
			this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";
		},
		searchString: function (data) {
			for (var i=0;i<data.length;i++)	{
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1) {
						return data[i].identity;
               }
				}
				else if (dataProp) {
					return data[i].identity;
            }
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) {
            return;
         }
			return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
		},
		dataBrowser: [
			{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			},
			{	string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			},
			{
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			},
			{
				prop: window.opera,
				identity: "Opera"
			},
			{
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			},
			{
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			},
			{
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			},
			{
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			},
			{		// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			},
			{
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Explorer",
				versionSearch: "MSIE"
			},
			{
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			},
			{		// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],
		dataOS : [
			{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			},
			{
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			},
			{
				   string: navigator.userAgent,
				   subString: "iPhone",
				   identity: "iPhone/iPod"
		    },
			{
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		]

	};
	BrowserDetect.init();
