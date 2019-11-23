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
		tabGame: function(index) {
			this.gameCurrent = index
		},
		tabLottery: function(index) {
			this.lotteryCurrent = index
		},
		showPop: function(arg, callback) {
			if(arg == "directRules") {
				this.directRules = true
			} else if(arg == "smallRules") {
				this.smallRules = true
			} else if(arg == "seasonRules") {
				this.seasonRules = true
			} else if(arg == "gameHistory") {
				this.gameHistory = true;
				this.getRoundInfo();
			} else if(arg == "directPop") {
				this.directPop = true;
			} else if(arg == "groupPop") {
				this.groupPop = true;
			} else if(arg == "seasonPop") {
				this.seasonPop = true;
			}

		},
		hidePop: function() {
			this.directRules = false;
			this.smallRules = false;
			this.seasonRules = false;
			this.countError = false;
			this.sendError = false;
			this.gameHistory = false;
			this.directPop = false;
			this.groupPop = false;
			this.seasonPop = false;
			this.lotteryError = false;
			this.copySuccess = false;
			this.balanceError = false;
			this.sdfBalanceError = false;
			this.canPlay = false;
		},
		getJoin: function(val) {
			this.joinNumber = val;
		},
		init: async function() {
			this.initLang();
			this.initSuperiorID();
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
		initToken: function() {
			var _this = this;
			$.getJSON('abi/DarkTokenERC20.json', function(data) {
				_this.contracts.DarkToken = TruffleContract(data);
				_this.contracts.DarkToken.setProvider(_this.web3Provider);
				app.initGameData();
			});
		},
		initGameData: function() {
			var _this = this;
			_this.gameGetInfo();
			_this.getTimeLeft();
			_this.getsTimeLeft();
			_this.getPlayerInfo();

			setTimeout(function() {
				_this.tokenGetInfo(true);
			}, 3000);

			_this.getRewardInfo();
			_this.getTokenBalance();
			_this.getEthBalance();

			setInterval(function() {
				_this.gameGetInfo();
				_this.getTimeLeft();
				_this.getPlayerInfo();
				_this.tokenGetInfo(true);
				_this.getRewardInfo();
				_this.getTokenBalance();
				_this.getEthBalance();
			}, 30000);

		},
		copy: function() {
			var _this = this;
			var clipboard = new ClipboardJS('.btn');
			clipboard.on('success', function(e) {
				e.clearSelection();
				_this.copySuccess = true;
			});

			clipboard.on('error', function(e) {
				alert("copy failed!")
			});
		},
		initGame: function() {
			var _this = this;
			$.getJSON('abi/DarkTokenGame.json', function(data) {
				_this.contracts.DarkGame = TruffleContract(data);
				_this.contracts.DarkGame.setProvider(_this.web3Provider);
				app.initToken();
			});

		},

		getPlayerInfo: function() {
			var _this = this,
				account = web3.eth.coinbase;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				contract = instance;
				return contract.getPlayerInfo(account)
			}).then(function(result) {
				_this.playerID = parseInt(result[0]);
				_this.gameData.link.direct = _this.protectAddress(result[5]);
				_this.gameData.link.count = parseInt(result[9]);
				_this.gameData.link.id = parseInt(result[0]);
				_this.gameData.link.address = _this.protectAddress(account);
				_this.isPlay = result[7];
				_this.income.list.limit = (parseInt(result[8]) * 3 - parseInt(result[10])) / 10 ** 18;

				console.log(result + " at getPlayerInfo");
			}).catch(function(err) {
				console.log(err.message + " at getPlayerInfo error");
			});
		},
		protectAddress: function(addr) {
			return(addr + "").length == 42 ? addr.substring(0, 8) + "****" + addr.substring(36, 42) : addr;
		},
		initSuperiorID: function() {
			var reg = new RegExp('(^|&)' + 'id' + '=([^&]*)(&|$)');
			var r = window.location.search.substr(1).match(reg);
			if(r != null) {
				console.log(decodeURIComponent(r[2]) + " initSuperiorID");
				this.superiorID = parseInt(decodeURIComponent(r[2]));
			} else {
				this.superiorID = 0;
				console.log("initSuperiorID = 0");
			}
		},

		getEthBalance: function() {
			var _this = this;
			var account = web3.eth.coinbase;
			web3.eth.getBalance(account, function(error, result) {
				_this.ethBalance = result / 10 ** 18;
				console.log(result + " at getEthBalance")
			})
		},
		handleBuy: function(event) {
			event.preventDefault();
			var amount = this.ethNumber,
				_this = this;
			var value = amount * 10 ** 18;
			var contract;
			if(amount < 0.1) {
				this.countError = true;
				this.ethNumber = 1;
				return false;
			} else if(this.ethNumber >= this.ethBalance) {
				_this.balanceError = true;
				return false;
			}
			var account = web3.eth.coinbase;
			_this.contracts.DarkToken.deployed().then(function(instance) {
				contract = instance;
				return contract.buy(_this.superiorID, {
					from: account,
					value: value
				});
			}).then(function(result) {
				console.log(result + " at contract.buy(" + _this.superiorID + ")");
				setTimeout(function() {
					_this.getEthBalance();
					_this.getTokenBalance();
					_this.getPlayerInfo();
				}, 5000);
			}).catch(function(err) {
				console.log(err.message + " at contract.buy(" + _this.superiorID + ") error");
			});

		},
		getTokenBalance: function() {
			var account = web3.eth.coinbase,
				_this = this;
			this.contracts.DarkToken.deployed().then(function(instance) {
				contract = instance;
				return contract.balanceOf(account);
			}).then(function(result) {
				console.log(result + " at token.balanceOf");
				_this.tokenBalance = result / 10 ** 8;
			}).catch(function(err) {
				console.log(err.message + " at token.balanceOf error");
			});
		},
		getRoundInfo: function() {
			var _this = this;
			_this.gameData.history = [];
			var times = _this.gameData.currentTimes - 1;
			var low = Math.max(times - 5, 1);
			if(times <= 5) low -= 1;
			for(var i = times; i > low; i--) {
				console.log(i);
				_this.contracts.DarkGame.deployed().then((function(i) {
					return function(instance) {
						contract = instance;
						return contract.getRoundInfo(i)
					};
				})(i)).then((function(i) {
					return function(result) {
						console.log(result + " at getRoundInfo");
						_this.gameData.history.push({
							times: i,
							pool: parseInt(result[6]) / 10 ** 18,
							winner: _this.protectAddress(result[8]),
							get: parseInt(result[6]) * 0.5 / 10 ** 18,
							winnerID: parseInt(result[2]),
						});
						_this.gameData.history.sort(compare);

					};

				})(i)).catch(function(err) {
					console.log(err.message + " at getRoundInfo error");
				});
			}

		},
		handleGame: function() {
			var _this = this,
				amount = parseFloat(this.joinNumber);
			if(amount < 1) {
				this.sendError = true;
				this.joinNumber = 1;
				return false;
			} else if(this.joinToken > this.tokenBalance) {
				_this.sdfBalanceError = true;
				return false
			} else if(_this.isPlay == false && _this.playerID > 0) {
				_this.canPlay = true;
				return false;
			}
			var account = web3.eth.coinbase;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				contract = instance;
				return contract.meetFuturePlay.sendTransaction(_this.superiorID, {
					from: account,
					value: amount * 10 ** 18
				})
			}).then(function(result) {
				console.log(result + " at handleGame");
				setTimeout(function() {
					_this.getTokenBalance();
					_this.getEthBalance();
					_this.getsTimeLeft();
					_this.getTimeLeft();
					_this.gameGetInfo();
				}, 5000);

			}).catch(function(err) {
				console.log(err.message + " at handleGame error");
			});
		},
		getTimeLeft: function() {
			var _this = this;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				contract = instance;
				return contract.getTimeLeft.call()
			}).then(function(result) {
				console.log(result + " at getTimeLeft");
				if(_this.timeId["show"]) clearTimeout(_this.timeId["show"]);
				_this.TimeDown("show", ~~result);
			}).catch(function(err) {
				console.log(err.message + " at getTimeLeft error");
			});
		},
		getsTimeLeft: function() {
			var _this = this;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				contract = instance;
				return contract.getsTimeLeft.call()
			}).then(function(result) {
				console.log(result + " at getsTimeLeft");
				_this.investTime = parseInt(result[1]);
				console.log(_this.investTime + " at investTime");
//				var n = Math.floor((parseInt(result[0]) - parseInt(result[1])) / parseInt(result[2]));
//				var time = parseInt(result[1]) + (n + 1) * parseInt(result[2]) - parseInt(new Date().getTime() / 1000);
				var time = parseInt(result[6]);//parseInt(result[2]) - Math.floor((parseInt(result[0]) - parseInt(result[1])) % parseInt(result[2]));
				if(parseInt(result[1])==0)time=0;
				if(_this.timeId["scoundDown"]) clearTimeout(_this.timeId["scoundDown"]);
				_this.TimeDown("scoundDown", ~~time, parseInt(result[2]))
			}).catch(function(err) {
				console.log(err.message + " at getsTimeLeft error");
			});
		},
		TimeDisplay: function(id, totalSeconds) {
			var hours = Math.floor(totalSeconds / (60 * 60));
			if(hours < 10) {
				hours = "0" + hours;
			}
			var modulo = totalSeconds % (60 * 60);
			var minutes = Math.floor(modulo / 60);
			if(minutes < 10) {
				minutes = "0" + minutes;
			}
			modulo = modulo % 60;
			var seconds = modulo % 60;
			if(seconds < 10) {
				seconds = "0" + seconds;
			}

			$("#" + id).html("<span>" + hours + "</span>:<span>" + minutes + "</span>:<span>" + seconds + "</span>");
		},
		TimeDown: function(id, totalSeconds, interval_time) {
			var _this = this;
			if(totalSeconds <= 0) {
				setTimeout(function() {
					_this.getRewardInfo();
				}, 3000);
				totalSeconds = interval_time || 0;
			};

			_this.TimeDisplay(id, totalSeconds);

			if(totalSeconds > 0) {
				_this.timeId[id] = setTimeout(function() {
					_this.TimeDown(id, --totalSeconds, interval_time);
				}, 1000);
			}

		},
		handleLottery: function() {
			var _this = this,
				amount = parseInt(this.lotteryNumber);
			if(amount < 1 || amount > 10) {
				_this.lotteryError = true;
				return false;
			} else if(this.lotteryToken > this.tokenBalance) {
				_this.sdfBalanceError = true;
				return false;
			}

			var account = web3.eth.coinbase;
			_this.contracts.DarkToken.deployed().then(function(instance) {
				contract = instance;
				console.log(_this.superiorID + " superiorID");
				return contract.lotteryPlay.sendTransaction(amount * 100, _this.superiorID, {
					from: account
				});
			}).then(function(result) {
				console.log(result + " at handleLottery");

				setTimeout(function() {
					_this.getTokenBalance();
					_this.tokenGetInfo();
					_this.getLotteryInfo();
				}, 5000);

			}).catch(function(err) {
				console.log(err.message + " at handleLottery error");
			});
		},
		getLotteryInfo: function() {
			var _this = this,
				account = web3.eth.coinbase;
			var times = this.lotteryData.records.term;
			_this.contracts.DarkToken.deployed().then(function(instance) {
				return instance.getLotteryInfo(times, _this.playerID)
			}).then(function(result) {
				console.log(result + " at getLotteryInfo");
				_this.lotteryEnd = result[2];

				_this.lotteryData.records.term = parseInt(result[0]);

				_this.lotteryData.records.bonusList[0].code = result[4].slice(0, 1).map(n => parseInt(n));
				_this.lotteryData.records.bonusList[0].bonus = result[3][0] / 10 ** 8;

				_this.lotteryData.records.bonusList[1].code = result[4].slice(1, 4).map(n => parseInt(n));
				_this.lotteryData.records.bonusList[1].bonus = result[3][1] / 10 ** 8;

				_this.lotteryData.records.bonusList[2].code = result[4].slice(4, 10).map(n => parseInt(n));
				_this.lotteryData.records.bonusList[2].bonus = result[3][2] / 10 ** 8;

				_this.lotteryData.records.myData.code = result[6].map(n => parseInt(n));
				_this.lotteryData.records.myData.myBonus = result[8] / 10 ** 8;
				_this.lotteryData.records.myData.luck_recommend = result[9] / 10 ** 8;

			}).catch(function(err) {
				console.log(err.message + " at getLotteryInfo error");
			});
		},
		previous: function() {
			this.lotteryData.records.term--;
			if(this.lotteryData.records.term <= 1) {
				this.lotteryData.records.term = 1
			}
			this.getLotteryInfo();
		},
		next: function() {
			this.lotteryData.records.term++;
			if(this.lotteryData.records.term >= this.lotteryData.currentTimes) {
				this.lotteryData.records.term = this.lotteryData.currentTimes
			}
			this.getLotteryInfo();
		},
		CalcReward: function() {
			var _this = this,
				account = web3.eth.coinbase;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				return instance.CalcReward.sendTransaction({
					from: account
				})
			}).then(function(result) {
				console.log(result + " at CalcReward");
				setTimeout(function() {
					_this.getRewardInfo();
					_this.tokenGetInfo();
				}, 5000);
			}).catch(function(err) {
				console.log(err.message + " at CalcReward error");
			});
		},
		gameReward: function() {
			var _this = this,
				account = web3.eth.coinbase;
			if(_this.getFee > _this.tokenBalance) {
				_this.sdfBalanceError = true;
				return false
			}
			_this.contracts.DarkGame.deployed().then(function(instance) {
				return instance.gameReward.sendTransaction({
					from: account
				})
			}).then(function(result) {
				console.log(result + " at gameReward");

				setTimeout(function() {
					_this.getRewardInfo();
				}, 5000);
			}).catch(function(err) {
				console.log(err.message + " at gameReward error");
			});
		},
		getRewardInfo: function() {
			var _this = this,
				account = web3.eth.coinbase;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				contract = instance;
				return contract.getRewardInfo()
			}).then(function(result) {
				_this.income.list.pool = result[0][0] / 10 ** 18;
				_this.income.list.statics = result[0][1] / 10 ** 18;;

				_this.income.list.luckDraw = result[0][2] / 10 ** 8;
				_this.income.list.luckRecommend = result[0][3] / 10 ** 8;

				_this.income.list.settled.eth = result[0][4] / 10 ** 18;
				_this.income.list.settled.sdf = result[0][6] / 10 ** 8;

				_this.income.unsettled.eth = result[1][0] / 10 ** 18;
				_this.income.gameReward.eth = result[1][1] / 10 ** 18;
				_this.income.gameReward.sdf = result[1][2] / 10 ** 8;
				_this.income.list.dynamic.total=result[1][3] / (10 ** 18);

				console.log(result + " at getRewardInfo");
				console.log(result[1] + " at result[1]")
			}).catch(function(err) {
				console.log(err.message + " at getRewardInfo error");
			});
		},
		gameGetInfo: function() {
			var _this = this,
				account = web3.eth.coinbase;
			_this.contracts.DarkGame.deployed().then(function(instance) {
				return instance.getInfo(account)
			}).then(function(result) {
				console.log(result + " at gameGetInfo");
				_this.playerID = parseInt(result[0]);
				_this.otherData.direct.nodes = parseInt(result[1]);
				_this.otherData.direct.achievement = result[2] / (10 ** 18);

				_this.otherData.list.v4Node = parseInt(result[3]);
				_this.otherData.myData.grade = parseInt(result[4]);
				_this.otherData.myData.level = parseInt(result[5]);
				
				_this.gameData.currentTimes = parseInt(result[6]);
				_this.gameData.bonusPool = result[7] / (10 ** 18);

                

			}).catch(function(err) {
				console.log(err.message + " at gameGetInfo Error");
			});
		},

		tokenGetInfo: function(update) {
			var _this = this,
				account = web3.eth.coinbase;
			_this.contracts.DarkToken.deployed().then(function(instance) {
				return instance.getInfo(_this.playerID)
			}).then(function(result) {
				console.log(result + " at tokenGetInfo getInfo");

				_this.lotteryData.currentTimes = parseInt(result[0]);
				_this.lotteryData.collected = parseInt(result[1]);

				_this.income.unsettled.sdf = result[2] / 10 ** 8;
				_this.otherData.list.token = result[4] / 10 ** 8;
				_this.otherData.list.burnDown = result[3] / 10 ** 8;

				_this.gameData.ethRatio = parseInt(result[5]);
				_this.rankData.season.term = parseInt(result[6]);

				if(update) {
					_this.lotteryData.records.term = _this.lotteryData.currentTimes;
					_this.getLotteryInfo();
				}

			}).catch(function(err) {
				console.log(err.message + " at tokenGetInfo getInfo Error");
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
	computed: {
		getToken: function() {
			if(isNaN(this.gameData.ethRatio)) {
				return "--"
			}
			return parseFloat(this.ethNumber * this.gameData.ethRatio).toFixed(4)
		},
		joinToken: function() {
			if(isNaN(this.gameData.ethRatio)) {
				return "--"
			}
			return parseFloat(this.joinNumber * this.gameData.ethRatio / 10).toFixed(4)
		},
		lotteryToken: function() {
			return parseFloat(this.lotteryNumber * this.lotteryData.lotteryRatio).toFixed(4)
		},
		getFee: function() {
			if(isNaN(this.gameData.ethRatio)) {
				return "--"
			}
			return parseFloat(this.income.gameReward.eth * this.gameData.ethRatio * 3 / 100).toFixed(4)
		},
		getLink:function(){
			var url=window.location.href;
			if(url.indexOf("?") != -1){
				var offest=url.indexOf("?");
				var newUrl=url.substr(0,offest);
				return newUrl+"?id="+this.gameData.link.id;
			}else{
				return url+"?id="+this.gameData.link.id;
			}
		}
	},
	mounted: function() {
		var value = this.getCookie("lang");
		if(!value) {
			this.setCookie("lang", this.defaultLang);
		}
		this.init();
	}
})