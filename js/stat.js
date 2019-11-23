var app = new Vue({
	el: "#app",
	data: data,
	methods: {
		setCookie: function(name, value) {
			var Days = 7;
			var exp = new Date();
			exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
			document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
		},
		getCookie: function(name) {
			var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
			if(arr = document.cookie.match(reg))
				return unescape(arr[2]);
			else
				return null;
		},
		initLang: function() {
			var _this = this;
			var value = this.getCookie("lang");
			for(var key in _this.lang) {
				if(key == value) {
					_this.langItem = _this.lang[key];
					break;
				}

			}
		},
		changeLang: function(index) {
			this.setCookie("lang", index);
			this.initLang();
			this.showNav = false
		},
		getNavs: function() {
			this.showNav = !this.showNav;
		},
		showPop: function(arg, callback) {
			if(arg == "directPop") {
				this.directPop = true;
			} else if(arg == "groupPop") {
				this.groupPop = true;				
			} else if(arg == "seasonPop") {
				this.seasonPop = true;
			}
		},
		hidePop: function() {			
			this.directPop = false;
			this.groupPop = false;
			this.seasonPop = false;
		},
		
		init: async function() {
			this.initLang();
			return await this.initWeb3();
		},
		initWeb3: async function() {
			if(window.ethereum) {
				window.web3 = new Web3(ethereum);
				try {
					await ethereum.enable();
					this.web3Provider = ethereum;
				} catch(error) {}
			} else if(window.web3) {
				this.web3Provider = web3.currentProvider;
				window.web3 = new Web3(web3.currentProvider);
			} else {
				console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
			}
			this.checkAccount();
			return this.initGame();
		},
		initTop: function() {
			var _this = this;
			$.getJSON('abi/DarkTop.json', function(data) {
				_this.contracts.DarkTop = TruffleContract(data);
				_this.contracts.DarkTop.setProvider(_this.web3Provider);
				app.initTopData();
			});
		},
		initTopData: function() {
			var _this = this;
			_this.contracts.DarkTop.deployed().then(function(instance) {
				return instance.json(web3.eth.coinbase);
			}).then(function(result) {
				//console.log(result + " at initTopData");
				_this.getPlayerInfo(result);
			}).catch(function(err) {
			});
			
		},
		initGameData: function() {
			var _this = this;
			_this.initTop();
		},	
		initGame: function() {
			var _this = this;
			$.getJSON('abi/DarkTokenGame.json', function(data) {
				_this.contracts.DarkGame = TruffleContract(data);
				_this.contracts.DarkGame.setProvider(_this.web3Provider);
				app.initGameData();
			});
		},
		
	
		getPlayerInfo: function(name) {
			var _this = this,
				account = web3.eth.coinbase;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				contract = instance;
				return contract.getPlayerInfo(account)
			}).then(function(result) {
				_this.playerID = parseInt(result[0]);				
				console.log(_this.playerID + " at getPlayerInfo");
				_this.jsonData(name);
			}).catch(function(err) {
				console.log(err.message + " at getPlayerInfo error");
			});
		},
		
		jsonData:function(n){
			var _this=this;
			if(_this.playerID==0)return;
			$.getJSON(n[0]+n[1]+'.json?t='+Math.random(), function(data) {
				console.log(data[""+_this.playerID] +"at jsonData")
				_this.rankData.direct.achievement =data[""+_this.playerID][0];
				_this.rankData.direct.rank =data[""+_this.playerID][1];
				
				_this.rankData.group.achievement = data[""+_this.playerID][2];
				_this.rankData.group.rank = data[""+_this.playerID][3];
				
				_this.rankData.season.achievement = data[""+_this.playerID][4];
				_this.rankData.season.rank = data[""+_this.playerID][5];
				_this.rankData.season.term = data[""+_this.playerID][15];
							
				_this.otherData.group.nodes=data[""+_this.playerID][6]
				_this.otherData.group.largeArea=data[""+_this.playerID][7]
				_this.otherData.group.smallArea=data[""+_this.playerID][8]
				
				_this.income.list.dynamic.share = data[""+_this.playerID][9];
				_this.income.list.dynamic.group = data[""+_this.playerID][10];
				_this.income.list.dynamic.rank = data[""+_this.playerID][11];
				
				_this.income.list.distribution = data[""+_this.playerID][12];
				_this.income.list.season = data[""+_this.playerID][13];
				_this.income.list.nodeIncome = data[""+_this.playerID][14];
				
				_this.rankData.direct.top10=data["invite"];
				_this.rankData.group.top10=data["galaxy"];
				_this.rankData.season.top60=data["light"];
			});
		},
		checkAccount: function() {
			var _this = this;
			_this.account = web3.eth.coinbase;
			setInterval(function() {
				if(_this.account != web3.eth.coinbase) {
					_this.account = web3.eth.coinbase;
					window.location.reload();
				}
			}, 3000);
		},
	},
	mounted: function() {
		var value = this.getCookie("lang");
		if(!value) {
			this.setCookie("lang", this.defaultLang);
		}
		this.init();
	}
})