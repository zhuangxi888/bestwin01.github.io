var data = {
	defaultLang: "en",
	langItem: lang["en"],
	lang: lang,
	showNav: false,
	startTime: "2019-05-20",
	gameCurrent: "token",
	lotteryCurrent: "join",
	directRules: false,
	smallRules: false,
	seasonRules: false,
	countError: false,
	sendError: false,
	lotteryError:false,
	gameHistory: false,
	directPop: false,
	groupPop: false,
	seasonPop: false,
	copySuccess:false,
	balanceError:false,
	sdfBalanceError:false,
	canPlay:false,
	ethNumber: 1,
	joinNumber: 10,
	lotteryNumber: 1,
	playerID:"",
	winnerID:0,
	langList: {
		en: "English",
		kr: "한국어",
		jp: "日本語",
		ru: "Россия",
		sg: "中文（繁体）",
		lt: "Italiano"
	},
	gameData: {
		currentTimes:0,
		bonusPool: "--",
		ethRatio: "--",
		joinItem: {
			"1ETH": 1,
			"10ETH": 10,
			"20ETH": 20,
			"30ETH": 30,
		},
		link: {
			direct: null,
			count: null,
			id: null,
			address:null
		},
		history: []
	},
	lotteryData: {
		currentTimes: 1,
		collected: 0,
		lotteryRatio: 100,
		records: {
			term: 0,
			loginfor:0,
			bonusList: [{No: 1,code: [],bonus: 0},{No: 2,code: [],bonus: 0},{No: 3,code: [],bonus: 0}],
			myData: {
				code: [],
				myBonus: 0,
				luck_recommend: 0
			}
		}
	},
	rankData: {
		direct: {
			achievement: 0,
			rank: 0,
			top10: []
		},
		group: {
			achievement: 0,
			rank: 0,
			top10: []
		},
		season: {
			achievement: 0,
			rank: 0,
			term: 0,
			top60: []
		}
	},
	income: {
		total: {
			eth: 0,
			sdf: 0
		},
		unsettled: {
			eth: 0,
			sdf: 0
		},
		gameReward: {
			eth: 0,
			sdf: 0
		},
		list: {
			pool: 0,
			statics: 0,
			dynamic: {
				total: 0,
				share: 0,
				group: 0,
				rank: 0
			},
			distribution: 0,
			season: 0,
			luckDraw: 0,
			luckRecommend: 0,
			nodeIncome: 0,
			settled: {
				eth: 0,
				sdf: 0
			},
			limit: 0
		}
	},
	otherData: {
		myData: {
			grade:0,
			level: 0
		},
		direct: {
			nodes: 0,
			achievement: 0
		},
		group: {
			nodes: 0,
			largeArea: 0,
			smallArea: 0
		},
		list: {
			token: 0,
			burnDown: 0,
			v4Node: 0
		}
	},
	web3:null,
	web3Provider: null,
    contracts: {},
    superiorID:0,
    ethBalance:0,
    tokenBalance:0,
    isPlay:true,
    investTime:0,
    account: null,
    lotteryEnd:false,
	timeId:{"scoundDown":null,"show":null}
}