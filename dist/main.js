(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var StartScene = require("./modules/scenes/StartScene");
var GameScene = require("./modules/scenes/GameScene");
var ResultScene = require("./modules/scenes/ResultScene");
var CardChoiseScene = require("./modules/scenes/CardChoiseScene");

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'mainCanvas', {}, true);

game.state.add("StartScene", StartScene);  // 游戏开始场景
game.state.add("GameScene", GameScene);    // 游戏场景
game.state.add("ResultScene", ResultScene); // 游戏结果场景
game.state.add("CardChoiseScene",CardChoiseScene); // 选择卡片的场景
game.state.start("StartScene");

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_f246bf70.js","/")
},{"./modules/scenes/CardChoiseScene":22,"./modules/scenes/GameScene":23,"./modules/scenes/ResultScene":24,"./modules/scenes/StartScene":25,"GcBRtC":26,"buffer":27}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 常用函数
 */

var Utils = {
    // 继承
    extend: function (child, parent) {
        var p = parent.prototype;
        var c = child.prototype;
        for (var i in p) {
            c[i] = p[i];
        }
        c.uber = p;
    },

    getChildByKey: function (parent, key) {
        var _child = [];
        for (var i = 0; i < parent.children; i++) {
            if (parent.children[i].key == key) {
                _child.push(parent.children[i]);
            }
        }

        if (_child.length == 0) {
            console.warn("没有在匹配的key: " + key);
        } else if (_child.length == 1) {
            return _child[0];
        } else if (_child.length > 1) {
            return _child;
        }
    }
}

module.exports = Utils;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/Utils.js","/modules")
},{"GcBRtC":26,"buffer":27}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 电脑AI
 */
var DataManager = require("./DataManager");
var EnemyFighter = require("./EnemyFighter");

function AI() {
    this.enemyChoise = null;
}

// 出牌
AI.prototype.shotCard = function (game) {
    this.enemyChoise = this.choiseCard();
    DataManager.turn = 0;

    if (!this.enemyChoise) {
        // 没有合适的卡牌
        DataManager.turnOverButton.loadTexture("hero_turn_button");
        alert("敌人选择不出牌,不知道有什么阴谋诡计");
        return;
    }

    try {
        if (DataManager.enemyFighters.fightObj.length >= 5) {
            DataManager.turnOverButton.loadTexture("hero_turn_button");
            alert("敌人选择不出牌,不知道有什么阴谋诡计");
            return;
        }
    } catch (e) {

    }

    if (DataManager.enemyFighters == null) {
        DataManager.enemyFighters = new EnemyFighter(game);
        DataManager.enemyFighters.buildFighter(game, this.enemyChoise.cardInfo.HP, this.enemyChoise.cardInfo.attack, this.enemyChoise.cardInfo.cnName, this.enemyChoise.cardInfo.fight);
    } else {
        DataManager.enemyFighters.buildFighter(game, this.enemyChoise.cardInfo.HP, this.enemyChoise.cardInfo.attack, this.enemyChoise.cardInfo.cnName, this.enemyChoise.cardInfo.fight);
    }

    this.enemyChoise.destroy();
    DataManager.enemyHandCard.reListHandCard();
    this.enemyChoise = null;

    DataManager.turnOverButton.loadTexture("hero_turn_button");
}

// 选择手牌
AI.prototype.choiseCard = function () {
    var shotList = [];
    var _fee = parseInt(DataManager.enemyFee.feeObj.text.split("/")[0]);

    for (var i = 0; i < DataManager.enemyHandCard.cardViewList.length; i++) {
        if (_fee >= DataManager.enemyHandCard.cardViewList[i].cardInfo.fee) {
            // 只要费用允许，就放入可出的牌之中
            shotList.push(DataManager.enemyHandCard.cardViewList[i]);
        }
    }

    if (shotList.length >= 1) {
        // 返回左手第一张牌
        return shotList[0];
    }
}

// 选择要攻击的目标
AI.prototype.choiseAttackTarget = function (game) {
    // 敌人没有随从
    if (!DataManager.enemyFighters || DataManager.enemyFighters.fightObj.length == 0) {
        return;
    }

    if (DataManager.heroFighters == null) { // 判断玩家的随从是否存在
        for (var i = 0; i < DataManager.enemyFighters.fightObj.length; i++) {
            if (DataManager.enemyFighters.fightObj[i].sleep == false) {
                alert("敌人的" + DataManager.enemyFighters.fightObj[i].cnName + "攻击了你的英雄");

                // 更新攻击之后的状态
                DataManager.enemyFighters.fightObj[i].sleep = true;
                DataManager.enemyFighters.fightObj[i].alpha = 0.7;
                DataManager.heroHead.HPObj.setText(parseInt(DataManager.heroHead.HPObj.text) - DataManager.enemyFighters.fightObj[i].attack);

                if (parseInt(DataManager.heroHead.HPObj.text) <= 0) {
                    DataManager.result = 0;
                    alert("敌人获取了胜利，玩家阵亡");
                    game.state.start("ResultScene");
                    return;
                }
            }
        }
    } else {

        var _heroFightersAttack = 0;
        var _enemyFightersAttack = 0;

        // 计算电脑AI的场攻
        for (var j = 0; j < DataManager.enemyFighters.fightObj.length; j++) {
            _enemyFightersAttack += DataManager.enemyFighters.fightObj[j].attack;
        }

        // 计算玩家战场上的场攻
        for (var k = 0; k < DataManager.heroFighters.fightObj.length; k++) {
            _heroFightersAttack += DataManager.heroFighters.fightObj[k].attack;
        }

        var _destroyList = [];
        for (var i = 0; i < DataManager.enemyFighters.fightObj.length; i++) {
            if (DataManager.enemyFighters.fightObj[i].sleep == false) {
                console.log("attack");

                if (_enemyFightersAttack >= _heroFightersAttack) { // AI场攻大于玩家随从的场攻
                    alert("敌人的" + DataManager.enemyFighters.fightObj[i].cnName + "攻击了你的英雄");
                    // 更新攻击之后的状态
                    DataManager.enemyFighters.fightObj[i].sleep = true;
                    DataManager.enemyFighters.fightObj[i].alpha = 0.7;
                    DataManager.heroHead.HPObj.setText(parseInt(DataManager.heroHead.HPObj.text) - DataManager.enemyFighters.fightObj[i].attack);

                    if (parseInt(DataManager.heroHead.HPObj.text) <= 0) {
                        DataManager.result = 0;
                        alert("敌人获取了胜利，玩家阵亡");
                        game.state.start("ResultScene");
                        return;
                    }

                } else {
                    // AI场攻小于玩家场攻则攻击随从
                    alert("敌方的" + DataManager.enemyFighters.fightObj[i].cnName + "攻击了我方的" + DataManager.heroFighters.fightObj[0].cnName);

                    var _heroFightHP = DataManager.enemyFighters.fightObj[i].hp - DataManager.heroFighters.fightObj[0].attack;
                    var _enemyFightHP = DataManager.heroFighters.fightObj[0].hp - DataManager.enemyFighters.fightObj[i].attack;

                    // 更新玩家的随从的hp
                    DataManager.enemyFighters.fightObj[i].hp = _heroFightHP;
                    DataManager.enemyFighters.fightObj[i].alpha = 0.7;
                    DataManager.enemyFighters.fightObj[i].sleep = true;
                    DataManager.enemyFighters.fightObj[i].children[2].alpha = 0;
                    DataManager.enemyFighters.fightObj[i].children[1].setText(_heroFightHP);

                    // 更新敌人的玩家的hp
                    DataManager.heroFighters.fightObj[0].hp = _enemyFightHP;
                    DataManager.heroFighters.fightObj[0].children[1].setText(_enemyFightHP);

                    if (_heroFightHP <= 0) {
                        _destroyList.push(DataManager.enemyFighters.fightObj[i]);
                    }

                    if (_enemyFightHP <= 0) {
                        DataManager.heroFighters.fightObj[0].destroy();
                        DataManager.heroFighters.reListObjs();
                    }
                }
            }
        }

        for (var n = 0; n < _destroyList.length; n++) {
            _destroyList[n].destroy();
        }
        DataManager.enemyFighters.reListObjs();
    }
}

module.exports = AI;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/AI.js","/modules/class")
},{"./DataManager":6,"./EnemyFighter":8,"GcBRtC":26,"buffer":27}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 背景类
 */

function BackGround(game) {
    this.picObj = null;
    this.init(game);
}

BackGround.prototype.init = function (game) {
    this.picObj = this.setPic(game);

}

BackGround.prototype.setPic = function (game) {
    var background = game.add.image(0, 0, "background");
    return background;
}

module.exports = BackGround;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/BackGround.js","/modules/class")
},{"GcBRtC":26,"buffer":27}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 卡组生成器
 */

function CardGenerator() {}

// 卡组生成器
// @param cardLength [number] 卡组最大的长度
// @param minIndex [number] 最小索引
// @param maxIndex [number] 最大索引
// @return cardList [array] 卡牌id生成数组
CardGenerator.prototype.buildCardList = function(cardLength, minIndex, maxIndex) {
    var cardList = [];
    for (var i = 0; i < cardLength; i++) {
        var ramdom = Math.floor(Math.random() * maxIndex) + minIndex;
        cardList.push(ramdom);
    }
    return cardList;
}

module.exports = CardGenerator;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/CardGenerater.js","/modules/class")
},{"GcBRtC":26,"buffer":27}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 游戏数据管理类
 */

var DataManager = {
	turn: 0, // 0代表自己回合,1代表敌人回合 
	fee: 1, // 初始化费用，和游戏回合相关
	AI: null,

	heroChoiseCard: null, // 英雄选择的卡牌
	heroFighters: null, // 英雄随从
	heroHandCard: null, // 英雄手牌
	heroFee: null, // 英雄的费用
	heroHead: null, // 英雄头像
	heroFighterChoise: null, // 战斗随从的选择
	heroCurrentFee: 1, // 玩家当前费用

	enemyHandCard: null, // 敌人手牌 
	enemyFee: null, // 敌人的费用
	enemyHead: null, // 敌人的头像
	enemyFighters: null, // 敌人战场的随从
	enemyCurrentFee: 1, // 敌人当前费用

	remainCard:null,
	turnOverButton: null, // 回合结束的按钮
	result:0 // 0 代表玩家失败，1代表玩家胜利
}

module.exports = DataManager;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/DataManager.js","/modules/class")
},{"GcBRtC":26,"buffer":27}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var utils = require("../Utils");
var Fee = require("./Fee");

/**
 * 敌人费用管理
 */

function EnemyFee(game, x, y) {
    Fee.apply(this, arguments);
}

utils.extend(EnemyFee, Fee);

module.exports = EnemyFee;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/EnemyFee.js","/modules/class")
},{"../Utils":2,"./Fee":11,"GcBRtC":26,"buffer":27}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 敌人的战场随从
 */
var DataManager = require("./DataManager");

var utils = require("../Utils");
var Fighter = require("./Fighter");

function EnemyFighter(game) {
    Fighter.apply(this, arguments);
    this.y = game.world.centerY - 130;

}

utils.extend(EnemyFighter, Fighter);

// 重写choiseFighter 
// 在玩家选择敌方随从时进行战斗结算
EnemyFighter.prototype.choiceFighter = function (fightBg) {
    if (DataManager.heroFighterChoise == null) {
        return;
    }
    else {

        alert("我方的" + DataManager.heroFighterChoise.cnName + "攻击了敌人的" + fightBg.cnName);

        var _heroFightHP = DataManager.heroFighterChoise.hp - fightBg.attack;
        var _enemyFightHP = fightBg.hp - DataManager.heroFighterChoise.attack;

        // 更新玩家的随从的hp
        DataManager.heroFighterChoise.hp = _heroFightHP;
        DataManager.heroFighterChoise.alpha = 0.7;
        DataManager.heroFighterChoise.sleep = true;
        DataManager.heroFighterChoise.children[2].alpha = 0;
        DataManager.heroFighterChoise.children[1].setText(_heroFightHP);

        // 更新敌人的玩家的hp
        fightBg.hp = _enemyFightHP;
        fightBg.children[1].setText(_enemyFightHP);

        if (_heroFightHP <= 0) {
            DataManager.heroFighterChoise.destroy();
            DataManager.heroFighters.reListObjs();
        }

        if (_enemyFightHP <= 0) {
            fightBg.destroy();
            DataManager.enemyFighters.reListObjs();
        }

        DataManager.heroFighterChoise = null;
        
    }
}

module.exports = EnemyFighter;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/EnemyFighter.js","/modules/class")
},{"../Utils":2,"./DataManager":6,"./Fighter":12,"GcBRtC":26,"buffer":27}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 敌人的手牌类
 */

var HandCarnd = require("./HandCard");
var utils = require("../Utils");
var CardConfig = require("../config/CardConfig");

function EnemyHandCard(game) {
    HandCarnd.apply(this, arguments);
    // this.setRealHandCard(game); // 真实卡面
    this.buildHandCardViewList(game); // 设置卡背

}

utils.extend(EnemyHandCard, HandCarnd);

// @override  
// 重写relistHandCard方法
EnemyHandCard.prototype.reListHandCard = function () {
    var self = this;
    var _temp = [];
    console.log(self.cardViewList);

    if (self.cardViewList.length == 0) { // 没有手牌的情况
        return;
    } else {
        for (var i = 0; i < self.cardViewList.length; i++) {
            if (self.cardViewList[i].alive == true) { // 清除掉已经销毁了的手牌
                _temp.push(self.cardViewList[i]);
            }
        }
        self.cardViewList = _temp;

        for (var j = 0; j < self.cardViewList.length; j++) { // 重新对手牌排序
            self.cardViewList[j].x = self.x + j * 70;
        }
    }
}

// @override 
// 重写回合开始时的补牌逻辑
EnemyHandCard.prototype.addCard = function (game) {
    var _cardList = this.cardIDList.splice(0, 1);

    if (this.cardViewList.length >= 8) {
        alert("敌人已达到上限，当前到的卡牌被销毁");
        return;
    }

    for (var j = 0; j < CardConfig.card_info.length; j++) {

        if (_cardList[0] == CardConfig.card_info[j].id) {
            var card = game.add.image(this.x + this.cardViewList.length * 70, this.y, "card_back");

            // 设置相应的数据
            card.cardInfo = {};
            card.cardInfo.HP = CardConfig.card_info[j].hp; // 血量
            card.cardInfo.attack = CardConfig.card_info[j].attack; // 攻击力
            card.cardInfo.cnName = CardConfig.card_info[j].cn_name; // 中文名称
            card.cardInfo.fee = CardConfig.card_info[j].fee; // 召唤费用
            card.cardInfo.fight = CardConfig.card_info[j].fight; // 战斗图片
            card.scale.set(0.5);
            this.cardViewList.push(card);
        }
    }
}

module.exports = EnemyHandCard;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/EnemyHandCard.js","/modules/class")
},{"../Utils":2,"../config/CardConfig":21,"./HandCard":13,"GcBRtC":26,"buffer":27}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 敌人头像
 */

var utils = require("../Utils");
var Head = require("./Head");
var DataManager = require("./DataManager");

function EnemyHead(game, textureName, positionX, positionY) {
    Head.apply(this, arguments);
}

// 设置敌人头像
// @override重写setPic
Head.prototype.setPic = function (game) {
    var pic = game.add.image(0, 0, this.textureName);

    pic.inputEnabled = true;
    pic.events.onInputDown.add(function () {
        if (DataManager.heroFighterChoise == null) {
            return;
        }

        else {
            var _hp = parseInt(this.HPObj.text) - DataManager.heroFighterChoise.attack;
            this.HPObj.setText(_hp);

            DataManager.heroFighterChoise.alpha = 0.7;
            DataManager.heroFighterChoise.sleep = true;
            DataManager.heroFighterChoise.children[2].alpha = 0;

            alert("我方的" + DataManager.heroFighterChoise.cnName + "攻击了敌人英雄");

            DataManager.heroFighterChoise = null;

            if (parseInt(this.HPObj.text) <= 0) {
                alert("玩家获取胜利，敌人阵亡");
                DataManager.result = 1;
                game.state.start("ResultScene");
            }
        }

    }, this);

    return pic;
}

utils.extend(EnemyHead, Head);

module.exports = EnemyHead;

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/EnemyHead.js","/modules/class")
},{"../Utils":2,"./DataManager":6,"./Head":14,"GcBRtC":26,"buffer":27}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 费用管理类
 */

function Fee(game, x, y) {
    this.feeObj = null;
    this.x = x || game.world.width - 30;
    this.y = y || 0;
    this.init(game);
}

Fee.prototype.init = function (game) {
    this.feeObj = this.setFeePic(game);
}

// 设置Fee背景以及文字
Fee.prototype.setFeePic = function (game) {
    var fee = game.add.image(this.x, this.y, "fee");
    var text = game.add.text(60, 28, "1/1", { fill: "#fff", fontSize: "18pt" });
    text.anchor.set(0.5);
    fee.addChild(text);
    return text;
}

module.exports = Fee;

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/Fee.js","/modules/class")
},{"GcBRtC":26,"buffer":27}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 战斗元素类
 * @param game 
 * @param x [number] 初始化的
 */

var DataManager = require("./DataManager");

function Fighter(game) {
    this.fightObj = []; // 战斗随从数组
    this.x = 150;
    this.y = game.world.centerY + 30;
}

Fighter.prototype.init = function (game) {
}

// 生成战斗随从
Fighter.prototype.buildFighter = function (game, hp, attack, cnName, picName) {
    var fightBg = game.add.image(this.x, this.y, picName);

    fightBg.hp = hp;
    fightBg.attack = attack;
    fightBg.cnName = cnName;
    fightBg.picName = picName;
    fightBg.sleep = true; // 休眠状态，在出牌的第一回合无法进行攻击
    var _style = {
        fill: "#fff",
        fontSize: "12pt"
    }
    // 设置生命值
    var hp_text = game.add.text(75, 105, hp, _style);
    hp_text.anchor.set(0.5);
    hp_text.key = "hp";

    // 设置
    var attack_text = game.add.text(17, 105, attack, _style);
    attack_text.anchor.set(0.5);
    attack_text.key = "attack";

    var attack_tag = game.add.image(48, -15, "attack_icon");
    attack_tag.key = "attack_tag";
    attack_tag.scale.set(0.5);
    attack_tag.anchor.set(0.5);
    attack_tag.alpha = 0;

    fightBg.addChild(attack_text);
    fightBg.addChild(hp_text);
    fightBg.addChild(attack_tag);
    fightBg.alpha = 0.7; // sleep状态无法攻击
    this.fightObj.push(fightBg);
    this.reListObjs();

    fightBg.inputEnabled = true;
    fightBg.events.onInputDown.add(function () {
        this.choiceFighter(fightBg);
    }, this);

}

Fighter.prototype.reListObjs = function () {
    if (this.fightObj.length == 0) {
        // 如果随从的队列为空，不进行排序
        return;
    } else {
        var _temp= [];

        for(var j = 0; j<this.fightObj.length;j++){
            if(this.fightObj[j].alive == true){
                _temp.push(this.fightObj[j]);
            }
        }

        this.fightObj = _temp;

        // 重排战斗随从的数组
        for (var i = 0; i < this.fightObj.length; i++) {
            this.fightObj[i].x = this.x + i * 95;
        }
    }
}

Fighter.prototype.awakeFighter = function () {
    if (this.fightObj.length == 0) {
        return;
    }
    else {
        for (var i = 0; i < this.fightObj.length; i++) {
            this.fightObj[i].sleep = false; // 解除睡眠状态
            this.fightObj[i].alpha = 1; // 解除睡眠状态后的view

        }
    }
}

Fighter.prototype.choiceFighter = function (fightBg) {
    if (fightBg.sleep == true) {
        alert("本回合无法操作该随从！");
    }

    else {
        for (var i = 0; i < this.fightObj.length; i++) {
            this.fightObj[i].children[2].alpha = 0;
        }
        fightBg.children[2].alpha = 1;
        DataManager.heroFighterChoise = fightBg;
    }
}

module.exports = Fighter;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/Fighter.js","/modules/class")
},{"./DataManager":6,"GcBRtC":26,"buffer":27}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 手牌类
 */

var CardGenerater = require("./CardGenerater");
var CardConfig = require("../config/CardConfig");
var DataManager = require("./DataManager");

function HandCard(game, x, y) {
    this.cardObjList = []; // 手牌对象数组
    this.cardViewList = []; // 手牌视图数组
    this.cardIDList = [];
    this.x = x || 140;
    this.y = y || 20;
    this.init(game);
}

HandCard.prototype.init = function (game) {
    this.cardIDList = this.setHandCardList();
    // this.buildHandCardViewList(game); // 设置卡背
    // this.setRealHandCard(game); // 真实卡面
}

// 构建手牌数组view
HandCard.prototype.buildHandCardViewList = function (game) {
    // 截取卡组中的前四张
    var _list = this.cardIDList.splice(0, 4);

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < CardConfig.card_info.length; j++) {

            if (_list[i] == CardConfig.card_info[j].id) {
                var card = game.add.image(this.x + i * 70, this.y, "card_back");

                // 设置相应的数据
                card.cardInfo = {};
                card.cardInfo.HP = CardConfig.card_info[j].hp; // 血量
                card.cardInfo.attack = CardConfig.card_info[j].attack; // 攻击力
                card.cardInfo.cnName = CardConfig.card_info[j].cn_name; // 中文名称
                card.cardInfo.fee = CardConfig.card_info[j].fee; // 召唤费用
                card.cardInfo.fight = CardConfig.card_info[j].fight; // 战斗图片
                card.scale.set(0.5);
                this.cardViewList.push(card);
            }
        }
    }
}

// 设置卡牌的数据显示
HandCard.prototype.setRealHandCard = function (game) {
    var _list = this.cardIDList.splice(0, 4);

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < CardConfig.card_info.length; j++) {
            if (_list[i] == CardConfig.card_info[j].id) {
                var card = game.add.image(this.x + i * 75, this.y, CardConfig.card_info[j].name);
                card.cardInfo = {};
                card.cardInfo.HP = CardConfig.card_info[j].hp; // 血量
                card.cardInfo.attack = CardConfig.card_info[j].attack; // 攻击力
                card.cardInfo.cnName = CardConfig.card_info[j].cn_name; // 中文名称
                card.cardInfo.fee = CardConfig.card_info[j].fee; // 召唤费用
                card.cardInfo.fight = CardConfig.card_info[j].fight; // 战斗图片
                card.scale.set(0.5);

                this.cardObjList.push(card);

                card.inputEnabled = true;
                card.events.onInputDown.add(function () {
                    this.inputEnabled = false; // 禁止玩家不停点击
                    if (DataManager.heroChoiseCard == null) {
                        DataManager.heroChoiseCard = this;
                    } else {
                        // 注册动画事件
                        var tween = game.add.tween(DataManager.heroChoiseCard).to({ y: DataManager.heroChoiseCard.y + 20 }, 200, "Linear", true);
                        DataManager.heroChoiseCard.inputEnabled = true;
                        // 执行动画
                        tween.start();
                        DataManager.heroChoiseCard = this;
                    }

                    var tween = game.add.tween(this).to({ y: this.y - 20 }, 200, "Linear", true);
                    tween.start();
                    tween.onComplete.add(function () {
                    });
                }, card);
            }
        }
    }
}

// 回合开始时的补牌逻辑
HandCard.prototype.addCard = function (game) {
    var _cardList = this.cardIDList.splice(0, 1);

    if (this.cardObjList.length >= 8) {
        alert("你的手牌已达到上限，当前到的卡牌被销毁");
        return;
    }

    for (var j = 0; j < CardConfig.card_info.length; j++) {
        if (_cardList[0] == CardConfig.card_info[j].id) {
            var card = game.add.image(this.x + (this.cardObjList.length) * 75, this.y, CardConfig.card_info[j].name);
            card.cardInfo = {};
            card.cardInfo.HP = CardConfig.card_info[j].hp; // 血量
            card.cardInfo.attack = CardConfig.card_info[j].attack; // 攻击力
            card.cardInfo.cnName = CardConfig.card_info[j].cn_name; // 中文名称
            card.cardInfo.fee = CardConfig.card_info[j].fee; // 召唤费用
            card.cardInfo.fight = CardConfig.card_info[j].fight; // 战斗图片
            card.scale.set(0.5);

            this.cardObjList.push(card);

            card.inputEnabled = true;
            card.events.onInputDown.add(function () {
                this.inputEnabled = false; // 禁止玩家不停点击
                if (DataManager.heroChoiseCard == null) {
                    DataManager.heroChoiseCard = this;
                } else {
                    // 注册动画事件
                    var tween = game.add.tween(DataManager.heroChoiseCard).to({ y: DataManager.heroChoiseCard.y + 20 }, 200, "Linear", true);
                    DataManager.heroChoiseCard.inputEnabled = true;
                    // 执行动画
                    tween.start();
                    DataManager.heroChoiseCard = this;
                }

                var tween = game.add.tween(this).to({ y: this.y - 20 }, 200, "Linear", true);
                tween.start();
                tween.onComplete.add(function () {
                });
            }, card);
        }
    }
}

// 重新对手牌排序
HandCard.prototype.reListHandCard = function () {
    var self = this;
    var _temp = [];
    if (self.cardObjList.length == 0) { // 没有手牌的情况
        return;
    } else {
        for (var i = 0; i < self.cardObjList.length; i++) {
            if (self.cardObjList[i].alive == true) { // 清除掉已经销毁了的手牌
                _temp.push(self.cardObjList[i]);
            }
        }
        self.cardObjList = _temp;

        for (var j = 0; j < self.cardObjList.length; j++) { // 重新对手牌排序
            self.cardObjList[j].x = self.x + j * 75;
        }
    }
}

/**
 *  生成卡牌id数组
 * @return {array} 卡组的ad数组
 */
HandCard.prototype.setHandCardList = function () {
    var cardGenerater = new CardGenerater();
    var cardIDList = cardGenerater.buildCardList(CardConfig.cardLength, 1, CardConfig.card_info.length);
    return cardIDList;
}

// 通过id构建真实手牌
module.exports = HandCard;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/HandCard.js","/modules/class")
},{"../config/CardConfig":21,"./CardGenerater":5,"./DataManager":6,"GcBRtC":26,"buffer":27}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 角色头像类
 * @param game [obj] 游戏场景对象
 * @param textureName [string] 图片key
 * @param positionX [number] 初始化的x坐标
 * @param positionY [number] 初始化的y坐标
 */

function Head(game, textureName, positionX, positionY) {
	this.headObj = null;
	this.x = positionX;
	this.y = positionY;
	this.HPObj = null;  // 英雄血量
	this.textureName = textureName;
	this.init(game);
}

Head.prototype.init = function (game) {
	this.headObj = this.setPic(game);
	this.HPObj = this.setHP(game);
}

// 设置英雄头像
Head.prototype.setPic = function (game) {
	var pic = game.add.image(this.x, this.y, this.textureName);
	return pic;
}

// 设置血量
Head.prototype.setHP = function (game) {
	var HPbg = game.add.image(10, 170, "hp_background");
	var HP = game.add.text(HPbg.width / 2, HPbg.height / 2 + 5, "30", { fill: "#fff", fontSize: "24pt" });
	HP.anchor.set(0.5);
	HPbg.addChild(HP);

	return HP;
}

module.exports = Head;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/Head.js","/modules/class")
},{"GcBRtC":26,"buffer":27}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 玩家水晶管理
 */

var Fee = require("./Fee");
var utils = require("../Utils");

function HeroFee(game) {
    Fee.apply(this, arguments);
}

utils.extend(HeroFee, Fee);

module.exports = HeroFee;

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/HeroFee.js","/modules/class")
},{"../Utils":2,"./Fee":11,"GcBRtC":26,"buffer":27}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * Hero战斗随从
 */

var Fighter = require("./Fighter");
var utils = require("../Utils");

function HeroFighter(game){
    Fighter.apply(this,arguments);
}

utils.extend(HeroFighter,Fighter);

module.exports = HeroFighter;


}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/HeroFighter.js","/modules/class")
},{"../Utils":2,"./Fighter":12,"GcBRtC":26,"buffer":27}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 英雄的手牌类
 */

var HandCarnd = require("./HandCard");
var utils = require("../Utils");

function HeroHandCard(game, x, y) {
    HandCarnd.apply(this, arguments);
    this.setRealHandCard(game); // 真实卡面
}

utils.extend(HeroHandCard, HandCarnd);

module.exports = HeroHandCard;

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/HeroHandCard.js","/modules/class")
},{"../Utils":2,"./HandCard":13,"GcBRtC":26,"buffer":27}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 玩家角色头像
 */
var utils = require("../Utils");
var Head = require("./Head");

function HeroHead(game, textureName, positionX, positionY) {
    Head.apply(this, arguments);
}

// HeroHead继承自Head类
utils.extend(HeroHead, Head);

/**
 *  @override 重写setHP方法
 */
HeroHead.prototype.setHP = function(game) {
    var HPbg = game.add.image(this.x, this.y - 55, "hp_background");
    var HP = game.add.text(HPbg.width / 2, HPbg.height / 2 + 5, "30", {
        fill: "#fff",
        fontSize: "24pt"
    });
    HP.anchor.set(0.5);
    HPbg.addChild(HP);

    return HP;
}

module.exports = HeroHead;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/HeroHead.js","/modules/class")
},{"../Utils":2,"./Head":14,"GcBRtC":26,"buffer":27}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 剩余的卡牌显示
 */

var DataManager = require("./DataManager");

function RemainCard(game) {
	this.heroRemainCard = null;
	this.enemyRemainCard = null;
	this.init(game);
}

RemainCard.prototype.init = function (game) {
	this.heroRemainCard = this.setHeroRemainCard(game);
	this.enemyRemainCard = this.setEnemyRemainCard(game);
	console.log(this.heroRemainCard); 
}

// 设置英雄的剩余卡片提示
RemainCard.prototype.setHeroRemainCard = function (game) {
	var image = game.add.image(680, game.world.centerY + 100, "card_back");
	image.scale.set(0.3);

	var text = game.add.text(680, game.world.centerY + 160,DataManager.heroHandCard.cardIDList.length,{
		fill:"#333333",
		fontSize:"18pt"
	});

	return {image,text}
}

// 设置敌人的剩余卡牌提示
RemainCard.prototype.setEnemyRemainCard = function (game) {
	var image = game.add.image(680, game.world.centerY - 160 , "card_back");
	image.scale.set(0.3);

	var text = game.add.text(680, game.world.centerY - 190,DataManager.enemyHandCard.cardIDList.length,{
		fill:"#333333",
		fontSize:"18pt"
	});
	return {image,text}
}

// 刷新剩余的卡牌数量
RemainCard.prototype.refresh = function(){
	this.heroRemainCard.text.setText(DataManager.heroHandCard.cardIDList.length);
	this.enemyRemainCard.text.setText(DataManager.enemyHandCard.cardIDList.length);
}

module.exports = RemainCard;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/RemainCard.js","/modules/class")
},{"./DataManager":6,"GcBRtC":26,"buffer":27}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * UI界面管理
 */

var BackGround = require("./BackGround");
var HeroHead = require("./HeroHead");
var EnemyHead = require("./EnemyHead");
var DataManager = require("./DataManager");
var HeroHandCard = require("./HeroHandCard");
var EnemyHandCard = require("./EnemyHandCard");
var HeroFee = require("./HeroFee");
var EnemyFee = require("./EnemyFee");
var AI = require("./AI");
var RemainCard = require("./RemainCard");

var HeroFighter = require("./HeroFighter");

function UIManager(game) {
    this.backgroundObj = null; // 背景图
    this.turnOverButton = null; // 回合结束
    this.shotCardButton = null; // 出牌按钮
    this.init(game);
}

UIManager.prototype.init = function(game) {
    // 生成背景图
    this.backgroundObj = this.setBackGround(game);
    // 生成玩家英雄头像
    DataManager.heroHead = new HeroHead(game, "fighter_hero", 0, game.world.height - 140);

    // 生成电脑英雄头像
    DataManager.enemyHead = new EnemyHead(game, "fighter_hero", 0, 0);

    // 设置回合结束按钮
    DataManager.turnOverButton = this.setTurnOverButton(game);
    // 设置敌人手牌
    DataManager.enemyHandCard = new EnemyHandCard(game);

    // 设置玩家手牌 
    DataManager.heroHandCard = new HeroHandCard(game, null, game.world.height - 120);

    this.shotCardButton = this.setShotCardButton(game); // 设置出牌按钮

    // 英雄费用管理
    DataManager.heroFee = new HeroFee(game, game.world.width - 110, game.world.centerY + 42); 
    
    // 敌人费用管理
    DataManager.enemyFee = new EnemyFee(game, game.world.width - 110, game.world.centerY - 90); 

    // 创建AI
    DataManager.AI = new AI(); 

    // 剩余的卡牌提示
    DataManager.remainCard = new RemainCard(game); 
    console.log(DataManager.remainCard);
}

// 设置背景
UIManager.prototype.setBackGround = function(game) {
    var background = new BackGround(game);
    return background;
}

// 回合结束
UIManager.prototype.setTurnOverButton = function(game) {
    var button = game.add.image(game.world.width - 150, game.world.centerY - 30, "hero_turn_button");
    button.inputEnabled = true;
    button.events.onInputDown.add(function() {
        if (DataManager.turn == 0) {
            button.loadTexture("enemy_turn_button");
            DataManager.turn = 1;
        }
        if (DataManager.enemyFighters) {
            DataManager.enemyFighters.awakeFighter(); // 解除敌人随从睡眠状态
        }

        DataManager.enemyFee.feeObj.setText(DataManager.fee + "/" + DataManager.fee);
        DataManager.enemyHandCard.addCard(game); // 敌人摸牌
        DataManager.remainCard.refresh();
        var time = setTimeout(function() {
            DataManager.AI.shotCard(game);
            DataManager.AI.choiseAttackTarget(game); // 电脑AI展开攻击
            if (DataManager.heroFighters) {
                DataManager.heroFighters.awakeFighter(); // 解除玩家随从睡眠状态
            }

            // 更新玩家费用的情况
            if (DataManager.fee < 9) {
                DataManager.fee += 1;
            }

            DataManager.heroCurrentFee = DataManager.fee;
            DataManager.heroFee.feeObj.setText(DataManager.fee + "/" + DataManager.fee);
            DataManager.heroHandCard.addCard(game); // 玩家摸牌
            DataManager.remainCard.refresh();

            clearTimeout(time);
        }, 1000);

    });
    return button;
}

// 出牌按钮
UIManager.prototype.setShotCardButton = function(game) {
    var shot = game.add.image(80, game.world.centerY - 10, "shot_card");
    shot.anchor.set(0.5);
    shot.inputEnabled = true;
    shot.events.onInputDown.add(function() {
        if (DataManager.turn != 0) {
            return;
        }

        // 控制玩家场上的随从
        try {
            if (DataManager.heroFighters.fightObj.length >= 5) {
                alert("您场上的随从已经到达了上限");
                return;
            }
        } catch (e) {}

        if (DataManager.heroChoiseCard) {

            // 检查选择卡牌的费用是否超出当前可用费用
            if (DataManager.heroCurrentFee < DataManager.heroChoiseCard.cardInfo.fee) {
                alert("你的费用不足，无法使用这张卡牌");
                return;
            }

            DataManager.heroCurrentFee = DataManager.heroCurrentFee - DataManager.heroChoiseCard.cardInfo.fee;
            DataManager.heroFee.feeObj.setText(DataManager.heroCurrentFee + "/" + DataManager.fee);

            if (DataManager.heroFighters == null) {
                DataManager.heroFighters = new HeroFighter(game);
                DataManager.heroFighters.buildFighter(game, DataManager.heroChoiseCard.cardInfo.HP, DataManager.heroChoiseCard.cardInfo.attack, DataManager.heroChoiseCard.cardInfo.cnName, DataManager.heroChoiseCard.cardInfo.fight);
            } else {
                DataManager.heroFighters.buildFighter(game, DataManager.heroChoiseCard.cardInfo.HP, DataManager.heroChoiseCard.cardInfo.attack, DataManager.heroChoiseCard.cardInfo.cnName, DataManager.heroChoiseCard.cardInfo.fight);
            }

            DataManager.heroChoiseCard.destroy();
            DataManager.heroHandCard.reListHandCard();
            DataManager.heroChoiseCard = null;
        }

    });
    return shot;
}
module.exports = UIManager;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/class/UIManager.js","/modules/class")
},{"./AI":3,"./BackGround":4,"./DataManager":6,"./EnemyFee":7,"./EnemyHandCard":9,"./EnemyHead":10,"./HeroFee":15,"./HeroFighter":16,"./HeroHandCard":17,"./HeroHead":18,"./RemainCard":19,"GcBRtC":26,"buffer":27}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 游戏卡牌的配置文件
 */

var CardConfig = {
    "card_info": [{
        "name": "fishman_baby",
        "fight": "fishman_baby_fight",
        "cn_name": "鱼人宝宝",
        "fee": 1,
        "attack": 1,
        "hp": 1,
        "id": 1
    }, {
        "name": "freshwater_crocodile",
        "fight": "freshwater_crocodile_fight",
        "cn_name": "淡水鳄",
        "fee": 2,
        "attack": 2,
        "hp": 3,
        "id": 2
    }, {
        "name": "ogre",
        "fight": "ogre_fight",
        "cn_name": "食人魔法师",
        "fee": 4,
        "attack": 4,
        "hp": 4,
        "id": 3
    }, {
        "name": "dead_wing",
        "fight": "dead_wing_fight",
        "cn_name": "死亡之翼",
        "fee": 9,
        "attack": 9,
        "hp": 9,
        "id": 4
    },{
        "name": "rose",
        "fight": "rose_fight",
        "cn_name": "拉格纳罗斯",
        "fee": 8,
        "attack": 8,
        "hp": 8,
        "id": 5
    },{
        "name": "velociraptor",
        "fight": "velociraptor_fight",
        "cn_name": "超级迅猛龙",
        "fee": 4,
        "attack": 4,
        "hp": 5,
        "id": 6
    }], // 卡牌的相关信息
    "cardLength": 30, // 卡组长度
    "cardInitialLength": 4, // 初始化手牌长度
}

module.exports = CardConfig;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/config/CardConfig.js","/modules/config")
},{"GcBRtC":26,"buffer":27}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 选择游戏卡组场景
 */

function CardChoiseScene(game) {
     this.preload = function () {
        // 加载提示声明
        var loadText = game.add.text(game.world.centerX, game.world.centerY, "Loading ... ", { fill: "#333", "fontSize": "28pt" });

        // 锚点设置
        loadText.anchor.set(0.5);

        game.load.image("background", "../../resource/background.png");
        game.load.image("card_back", "../../resource/card_back.png");
        game.load.image("enemy_turn_button", "../../resource/enemy_turn_button.png");
        game.load.image("fee", "../../resource/fee.png");
        game.load.image("hero_turn_button", "../../resource/hero_turn_button.png");
        game.load.image("hp_background", "../../resource/hp_background.png");
        game.load.image("attack_icon","../../resource/attack_icon.png");
        game.load.image("shot_card","../../resource/shot_card.png");
        game.load.image("fighter_hero", "../../resource/fighter_hero.png");
        
        game.load.image("dead_wing", "../../resource/dead_wing.png");
        game.load.image("dead_wing_fight", "../../resource/dead_wing_fight.png");
        game.load.image("fishman_baby", "../../resource/fishman_baby.png");
        game.load.image("fishman_baby_fight", "../../resource/fishman_baby_fight.png");
        game.load.image("freshwater_crocodile", "../../resource/freshwater_crocodile.png");
        game.load.image("freshwater_crocodile_fight", "../../resource/freshwater_crocodile_fight.png");
        game.load.image("ogre", "../../resource/ogre.png");
        game.load.image("ogre_fight", "../../resource/ogre_fight.png");
        game.load.image("rose","../../resource/rose.png");
        game.load.image("rose_fight","../../resource/rose_fight.png");
        game.load.image("velociraptor","../../resource/velociraptor.png");
        game.load.image("velociraptor_fight","../../resource/velociraptor_fight.png");

        // 单个文件加载完的回调
        game.load.onFileComplete.add(function () {
            loadText.setText("Loading ... " + arguments[0]);
        });

        // 所有文件加载完成回调
        game.load.onLoadComplete.add(function () {
            loadText.destroy();
        });
    }

    this.create = function () {
        var style = {
            fill: "#000",
            fontSize: "32pt"
        }

        var startButton = game.add.text(game.world.centerX, game.world.centerY + 70, "这是选择卡组的场景", { fill: "#333", fontSize: "24pt" });

        startButton.anchor.set(0.5);

        startButton.inputEnabled = true;
        startButton.events.onInputDown.add(function () {
            game.state.start("GameScene");
        },this);
    }
}

module.exports = CardChoiseScene;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/scenes/CardChoiseScene.js","/modules/scenes")
},{"GcBRtC":26,"buffer":27}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 游戏主场景
 */

var UIPanel = require("../class/UIManager");

function GameScene(game) {
   
    this.create = function () {
        // 添加ui界面
        var ui = new UIPanel(game);

    }
}

module.exports = GameScene;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/scenes/GameScene.js","/modules/scenes")
},{"../class/UIManager":20,"GcBRtC":26,"buffer":27}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 *  游戏结果场景
 */

var DataManager = require("../class/DataManager");

function ResultScene(game) {
    this.create = function () {
        if (DataManager.result == 0) {
            console.log("敌人胜利");
            var text = game.add.text(game.world.centerX, game.world.centerY, "You Loss", {
                fill: "#000",
            });

            text.anchor.set(0.5);

        } else {
            var text = game.add.text(game.world.centerX, game.world.centerY, "You Win", {
                fill: "#000",
                fontSize: "30pt"
            });
            text.anchor.set(0.5);
        }
    }
}

module.exports = ResultScene;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/scenes/ResultScene.js","/modules/scenes")
},{"../class/DataManager":6,"GcBRtC":26,"buffer":27}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 游戏开始场景 
 */

function StartScene(game) {

    this.create = function () {
        console.log(Phaser.ScaleManager.SHOW_ALL);
        // 缩放模式
        // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // game.scale.scaleMode.maxHeight ="400px";
        var style = {
            fill: "#000",
            fontSize: "32pt"
        }
        var text = game.add.text(game.world.centerX, game.world.centerY, "欢迎来到我的炉石传说", style);

        text.anchor.set(0.5);

        var startButton = game.add.text(game.world.centerX, game.world.centerY + 70, "开始游戏", { fill: "#333", fontSize: "24pt" });

        startButton.anchor.set(0.5);

        startButton.inputEnabled = true;
        startButton.events.onInputDown.add(function () {
            game.state.start("CardChoiseScene");
        },this);
    }
}

module.exports = StartScene;
}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/modules/scenes/StartScene.js","/modules/scenes")
},{"GcBRtC":26,"buffer":27}],26:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/.0.7.0@process/browser.js","/node_modules/.0.7.0@process")
},{"GcBRtC":26,"buffer":27}],27:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/.2.1.13@buffer/index.js","/node_modules/.2.1.13@buffer")
},{"GcBRtC":26,"base64-js":28,"buffer":27,"ieee754":29}],28:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/.2.1.13@buffer/node_modules/base64-js/lib/b64.js","/node_modules/.2.1.13@buffer/node_modules/base64-js/lib")
},{"GcBRtC":26,"buffer":27}],29:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("GcBRtC"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/.2.1.13@buffer/node_modules/ieee754/index.js","/node_modules/.2.1.13@buffer/node_modules/ieee754")
},{"GcBRtC":26,"buffer":27}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9zYW5nbGlhbmcvRG9jdW1lbnRzL05vZGVQcm9qZWN0L1BoYXNlckRlbW8vbm9kZV9tb2R1bGVzLy4yLjAuMUBicm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL2Zha2VfZjI0NmJmNzAuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvVXRpbHMuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvY2xhc3MvQUkuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvY2xhc3MvQmFja0dyb3VuZC5qcyIsIi9Vc2Vycy9zYW5nbGlhbmcvRG9jdW1lbnRzL05vZGVQcm9qZWN0L1BoYXNlckRlbW8vbW9kdWxlcy9jbGFzcy9DYXJkR2VuZXJhdGVyLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NsYXNzL0RhdGFNYW5hZ2VyLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NsYXNzL0VuZW15RmVlLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NsYXNzL0VuZW15RmlnaHRlci5qcyIsIi9Vc2Vycy9zYW5nbGlhbmcvRG9jdW1lbnRzL05vZGVQcm9qZWN0L1BoYXNlckRlbW8vbW9kdWxlcy9jbGFzcy9FbmVteUhhbmRDYXJkLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NsYXNzL0VuZW15SGVhZC5qcyIsIi9Vc2Vycy9zYW5nbGlhbmcvRG9jdW1lbnRzL05vZGVQcm9qZWN0L1BoYXNlckRlbW8vbW9kdWxlcy9jbGFzcy9GZWUuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvY2xhc3MvRmlnaHRlci5qcyIsIi9Vc2Vycy9zYW5nbGlhbmcvRG9jdW1lbnRzL05vZGVQcm9qZWN0L1BoYXNlckRlbW8vbW9kdWxlcy9jbGFzcy9IYW5kQ2FyZC5qcyIsIi9Vc2Vycy9zYW5nbGlhbmcvRG9jdW1lbnRzL05vZGVQcm9qZWN0L1BoYXNlckRlbW8vbW9kdWxlcy9jbGFzcy9IZWFkLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NsYXNzL0hlcm9GZWUuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvY2xhc3MvSGVyb0ZpZ2h0ZXIuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvY2xhc3MvSGVyb0hhbmRDYXJkLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NsYXNzL0hlcm9IZWFkLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NsYXNzL1JlbWFpbkNhcmQuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvY2xhc3MvVUlNYW5hZ2VyLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL2NvbmZpZy9DYXJkQ29uZmlnLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9tb2R1bGVzL3NjZW5lcy9DYXJkQ2hvaXNlU2NlbmUuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvc2NlbmVzL0dhbWVTY2VuZS5qcyIsIi9Vc2Vycy9zYW5nbGlhbmcvRG9jdW1lbnRzL05vZGVQcm9qZWN0L1BoYXNlckRlbW8vbW9kdWxlcy9zY2VuZXMvUmVzdWx0U2NlbmUuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL21vZHVsZXMvc2NlbmVzL1N0YXJ0U2NlbmUuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL25vZGVfbW9kdWxlcy8uMC43LjBAcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL3NhbmdsaWFuZy9Eb2N1bWVudHMvTm9kZVByb2plY3QvUGhhc2VyRGVtby9ub2RlX21vZHVsZXMvLjIuMS4xM0BidWZmZXIvaW5kZXguanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL25vZGVfbW9kdWxlcy8uMi4xLjEzQGJ1ZmZlci9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCIvVXNlcnMvc2FuZ2xpYW5nL0RvY3VtZW50cy9Ob2RlUHJvamVjdC9QaGFzZXJEZW1vL25vZGVfbW9kdWxlcy8uMi4xLjEzQGJ1ZmZlci9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBTdGFydFNjZW5lID0gcmVxdWlyZShcIi4vbW9kdWxlcy9zY2VuZXMvU3RhcnRTY2VuZVwiKTtcbnZhciBHYW1lU2NlbmUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL3NjZW5lcy9HYW1lU2NlbmVcIik7XG52YXIgUmVzdWx0U2NlbmUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL3NjZW5lcy9SZXN1bHRTY2VuZVwiKTtcbnZhciBDYXJkQ2hvaXNlU2NlbmUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL3NjZW5lcy9DYXJkQ2hvaXNlU2NlbmVcIik7XG5cbnZhciBnYW1lID0gbmV3IFBoYXNlci5HYW1lKDgwMCwgNjAwLCBQaGFzZXIuQVVUTywgJ21haW5DYW52YXMnLCB7fSwgdHJ1ZSk7XG5cbmdhbWUuc3RhdGUuYWRkKFwiU3RhcnRTY2VuZVwiLCBTdGFydFNjZW5lKTsgIC8vIOa4uOaIj+W8gOWni+WcuuaZr1xuZ2FtZS5zdGF0ZS5hZGQoXCJHYW1lU2NlbmVcIiwgR2FtZVNjZW5lKTsgICAgLy8g5ri45oiP5Zy65pmvXG5nYW1lLnN0YXRlLmFkZChcIlJlc3VsdFNjZW5lXCIsIFJlc3VsdFNjZW5lKTsgLy8g5ri45oiP57uT5p6c5Zy65pmvXG5nYW1lLnN0YXRlLmFkZChcIkNhcmRDaG9pc2VTY2VuZVwiLENhcmRDaG9pc2VTY2VuZSk7IC8vIOmAieaLqeWNoeeJh+eahOWcuuaZr1xuZ2FtZS5zdGF0ZS5zdGFydChcIlN0YXJ0U2NlbmVcIik7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV9mMjQ2YmY3MC5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog5bi455So5Ye95pWwXG4gKi9cblxudmFyIFV0aWxzID0ge1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZDogZnVuY3Rpb24gKGNoaWxkLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIHAgPSBwYXJlbnQucHJvdG90eXBlO1xuICAgICAgICB2YXIgYyA9IGNoaWxkLnByb3RvdHlwZTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwKSB7XG4gICAgICAgICAgICBjW2ldID0gcFtpXTtcbiAgICAgICAgfVxuICAgICAgICBjLnViZXIgPSBwO1xuICAgIH0sXG5cbiAgICBnZXRDaGlsZEJ5S2V5OiBmdW5jdGlvbiAocGFyZW50LCBrZXkpIHtcbiAgICAgICAgdmFyIF9jaGlsZCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcmVudC5jaGlsZHJlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50LmNoaWxkcmVuW2ldLmtleSA9PSBrZXkpIHtcbiAgICAgICAgICAgICAgICBfY2hpbGQucHVzaChwYXJlbnQuY2hpbGRyZW5baV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9jaGlsZC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwi5rKh5pyJ5Zyo5Yy56YWN55qEa2V5OiBcIiArIGtleSk7XG4gICAgICAgIH0gZWxzZSBpZiAoX2NoaWxkLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gX2NoaWxkWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKF9jaGlsZC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICByZXR1cm4gX2NoaWxkO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFV0aWxzO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL1V0aWxzLmpzXCIsXCIvbW9kdWxlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog55S16ISRQUlcbiAqL1xudmFyIERhdGFNYW5hZ2VyID0gcmVxdWlyZShcIi4vRGF0YU1hbmFnZXJcIik7XG52YXIgRW5lbXlGaWdodGVyID0gcmVxdWlyZShcIi4vRW5lbXlGaWdodGVyXCIpO1xuXG5mdW5jdGlvbiBBSSgpIHtcbiAgICB0aGlzLmVuZW15Q2hvaXNlID0gbnVsbDtcbn1cblxuLy8g5Ye654mMXG5BSS5wcm90b3R5cGUuc2hvdENhcmQgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIHRoaXMuZW5lbXlDaG9pc2UgPSB0aGlzLmNob2lzZUNhcmQoKTtcbiAgICBEYXRhTWFuYWdlci50dXJuID0gMDtcblxuICAgIGlmICghdGhpcy5lbmVteUNob2lzZSkge1xuICAgICAgICAvLyDmsqHmnInlkIjpgILnmoTljaHniYxcbiAgICAgICAgRGF0YU1hbmFnZXIudHVybk92ZXJCdXR0b24ubG9hZFRleHR1cmUoXCJoZXJvX3R1cm5fYnV0dG9uXCIpO1xuICAgICAgICBhbGVydChcIuaVjOS6uumAieaLqeS4jeWHuueJjCzkuI3nn6XpgZPmnInku4DkuYjpmLTosIvor6HorqFcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBpZiAoRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9iai5sZW5ndGggPj0gNSkge1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIudHVybk92ZXJCdXR0b24ubG9hZFRleHR1cmUoXCJoZXJvX3R1cm5fYnV0dG9uXCIpO1xuICAgICAgICAgICAgYWxlcnQoXCLmlYzkurrpgInmi6nkuI3lh7rniYws5LiN55+l6YGT5pyJ5LuA5LmI6Zi06LCL6K+h6K6hXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuXG4gICAgfVxuXG4gICAgaWYgKERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMgPT0gbnVsbCkge1xuICAgICAgICBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzID0gbmV3IEVuZW15RmlnaHRlcihnYW1lKTtcbiAgICAgICAgRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5idWlsZEZpZ2h0ZXIoZ2FtZSwgdGhpcy5lbmVteUNob2lzZS5jYXJkSW5mby5IUCwgdGhpcy5lbmVteUNob2lzZS5jYXJkSW5mby5hdHRhY2ssIHRoaXMuZW5lbXlDaG9pc2UuY2FyZEluZm8uY25OYW1lLCB0aGlzLmVuZW15Q2hvaXNlLmNhcmRJbmZvLmZpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmJ1aWxkRmlnaHRlcihnYW1lLCB0aGlzLmVuZW15Q2hvaXNlLmNhcmRJbmZvLkhQLCB0aGlzLmVuZW15Q2hvaXNlLmNhcmRJbmZvLmF0dGFjaywgdGhpcy5lbmVteUNob2lzZS5jYXJkSW5mby5jbk5hbWUsIHRoaXMuZW5lbXlDaG9pc2UuY2FyZEluZm8uZmlnaHQpO1xuICAgIH1cblxuICAgIHRoaXMuZW5lbXlDaG9pc2UuZGVzdHJveSgpO1xuICAgIERhdGFNYW5hZ2VyLmVuZW15SGFuZENhcmQucmVMaXN0SGFuZENhcmQoKTtcbiAgICB0aGlzLmVuZW15Q2hvaXNlID0gbnVsbDtcblxuICAgIERhdGFNYW5hZ2VyLnR1cm5PdmVyQnV0dG9uLmxvYWRUZXh0dXJlKFwiaGVyb190dXJuX2J1dHRvblwiKTtcbn1cblxuLy8g6YCJ5oup5omL54mMXG5BSS5wcm90b3R5cGUuY2hvaXNlQ2FyZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2hvdExpc3QgPSBbXTtcbiAgICB2YXIgX2ZlZSA9IHBhcnNlSW50KERhdGFNYW5hZ2VyLmVuZW15RmVlLmZlZU9iai50ZXh0LnNwbGl0KFwiL1wiKVswXSk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IERhdGFNYW5hZ2VyLmVuZW15SGFuZENhcmQuY2FyZFZpZXdMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChfZmVlID49IERhdGFNYW5hZ2VyLmVuZW15SGFuZENhcmQuY2FyZFZpZXdMaXN0W2ldLmNhcmRJbmZvLmZlZSkge1xuICAgICAgICAgICAgLy8g5Y+q6KaB6LS555So5YWB6K6477yM5bCx5pS+5YWl5Y+v5Ye655qE54mM5LmL5LitXG4gICAgICAgICAgICBzaG90TGlzdC5wdXNoKERhdGFNYW5hZ2VyLmVuZW15SGFuZENhcmQuY2FyZFZpZXdMaXN0W2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzaG90TGlzdC5sZW5ndGggPj0gMSkge1xuICAgICAgICAvLyDov5Tlm57lt6bmiYvnrKzkuIDlvKDniYxcbiAgICAgICAgcmV0dXJuIHNob3RMaXN0WzBdO1xuICAgIH1cbn1cblxuLy8g6YCJ5oup6KaB5pS75Ye755qE55uu5qCHXG5BSS5wcm90b3R5cGUuY2hvaXNlQXR0YWNrVGFyZ2V0ID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICAvLyDmlYzkurrmsqHmnInpmo/ku45cbiAgICBpZiAoIURhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMgfHwgRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9iai5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKERhdGFNYW5hZ2VyLmhlcm9GaWdodGVycyA9PSBudWxsKSB7IC8vIOWIpOaWreeOqeWutueahOmaj+S7juaYr+WQpuWtmOWcqFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMuZmlnaHRPYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLnNsZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCLmlYzkurrnmoRcIiArIERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMuZmlnaHRPYmpbaV0uY25OYW1lICsgXCLmlLvlh7vkuobkvaDnmoToi7Hpm4RcIik7XG5cbiAgICAgICAgICAgICAgICAvLyDmm7TmlrDmlLvlh7vkuYvlkI7nmoTnirbmgIFcbiAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLnNsZWVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLmFscGhhID0gMC43O1xuICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9IZWFkLkhQT2JqLnNldFRleHQocGFyc2VJbnQoRGF0YU1hbmFnZXIuaGVyb0hlYWQuSFBPYmoudGV4dCkgLSBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLmF0dGFjayk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoRGF0YU1hbmFnZXIuaGVyb0hlYWQuSFBPYmoudGV4dCkgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5yZXN1bHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBhbGVydChcIuaVjOS6uuiOt+WPluS6huiDnOWIqe+8jOeOqeWutumYteS6oVwiKTtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZS5zdGF0ZS5zdGFydChcIlJlc3VsdFNjZW5lXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcblxuICAgICAgICB2YXIgX2hlcm9GaWdodGVyc0F0dGFjayA9IDA7XG4gICAgICAgIHZhciBfZW5lbXlGaWdodGVyc0F0dGFjayA9IDA7XG5cbiAgICAgICAgLy8g6K6h566X55S16ISRQUnnmoTlnLrmlLtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBfZW5lbXlGaWdodGVyc0F0dGFjayArPSBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2pdLmF0dGFjaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOiuoeeul+eOqeWutuaImOWcuuS4iueahOWcuuaUu1xuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IERhdGFNYW5hZ2VyLmhlcm9GaWdodGVycy5maWdodE9iai5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgX2hlcm9GaWdodGVyc0F0dGFjayArPSBEYXRhTWFuYWdlci5oZXJvRmlnaHRlcnMuZmlnaHRPYmpba10uYXR0YWNrO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF9kZXN0cm95TGlzdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMuZmlnaHRPYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLnNsZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJhdHRhY2tcIik7XG5cbiAgICAgICAgICAgICAgICBpZiAoX2VuZW15RmlnaHRlcnNBdHRhY2sgPj0gX2hlcm9GaWdodGVyc0F0dGFjaykgeyAvLyBBSeWcuuaUu+Wkp+S6jueOqeWutumaj+S7jueahOWcuuaUu1xuICAgICAgICAgICAgICAgICAgICBhbGVydChcIuaVjOS6uueahFwiICsgRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9ialtpXS5jbk5hbWUgKyBcIuaUu+WHu+S6huS9oOeahOiLsembhFwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8g5pu05paw5pS75Ye75LmL5ZCO55qE54q25oCBXG4gICAgICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMuZmlnaHRPYmpbaV0uc2xlZXAgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLmFscGhhID0gMC43O1xuICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvSGVhZC5IUE9iai5zZXRUZXh0KHBhcnNlSW50KERhdGFNYW5hZ2VyLmhlcm9IZWFkLkhQT2JqLnRleHQpIC0gRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9ialtpXS5hdHRhY2spO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChEYXRhTWFuYWdlci5oZXJvSGVhZC5IUE9iai50ZXh0KSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5yZXN1bHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCLmlYzkurrojrflj5bkuobog5zliKnvvIznjqnlrrbpmLXkuqFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnN0YXRlLnN0YXJ0KFwiUmVzdWx0U2NlbmVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFJ5Zy65pS75bCP5LqO546p5a625Zy65pS75YiZ5pS75Ye76ZqP5LuOXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwi5pWM5pa555qEXCIgKyBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLmNuTmFtZSArIFwi5pS75Ye75LqG5oiR5pa555qEXCIgKyBEYXRhTWFuYWdlci5oZXJvRmlnaHRlcnMuZmlnaHRPYmpbMF0uY25OYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgX2hlcm9GaWdodEhQID0gRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9ialtpXS5ocCAtIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVycy5maWdodE9ialswXS5hdHRhY2s7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfZW5lbXlGaWdodEhQID0gRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzLmZpZ2h0T2JqWzBdLmhwIC0gRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9ialtpXS5hdHRhY2s7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5pu05paw546p5a6255qE6ZqP5LuO55qEaHBcbiAgICAgICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9ialtpXS5ocCA9IF9oZXJvRmlnaHRIUDtcbiAgICAgICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9ialtpXS5hbHBoYSA9IDAuNztcbiAgICAgICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5maWdodE9ialtpXS5zbGVlcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMuZmlnaHRPYmpbaV0uY2hpbGRyZW5bMl0uYWxwaGEgPSAwO1xuICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLmZpZ2h0T2JqW2ldLmNoaWxkcmVuWzFdLnNldFRleHQoX2hlcm9GaWdodEhQKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDmlYzkurrnmoTnjqnlrrbnmoRocFxuICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlcnMuZmlnaHRPYmpbMF0uaHAgPSBfZW5lbXlGaWdodEhQO1xuICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlcnMuZmlnaHRPYmpbMF0uY2hpbGRyZW5bMV0uc2V0VGV4dChfZW5lbXlGaWdodEhQKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX2hlcm9GaWdodEhQIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kZXN0cm95TGlzdC5wdXNoKERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMuZmlnaHRPYmpbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF9lbmVteUZpZ2h0SFAgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzLmZpZ2h0T2JqWzBdLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVycy5yZUxpc3RPYmpzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBuID0gMDsgbiA8IF9kZXN0cm95TGlzdC5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgX2Rlc3Ryb3lMaXN0W25dLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICBEYXRhTWFuYWdlci5lbmVteUZpZ2h0ZXJzLnJlTGlzdE9ianMoKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQUk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2xhc3MvQUkuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDog4zmma/nsbtcbiAqL1xuXG5mdW5jdGlvbiBCYWNrR3JvdW5kKGdhbWUpIHtcbiAgICB0aGlzLnBpY09iaiA9IG51bGw7XG4gICAgdGhpcy5pbml0KGdhbWUpO1xufVxuXG5CYWNrR3JvdW5kLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICB0aGlzLnBpY09iaiA9IHRoaXMuc2V0UGljKGdhbWUpO1xuXG59XG5cbkJhY2tHcm91bmQucHJvdG90eXBlLnNldFBpYyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgdmFyIGJhY2tncm91bmQgPSBnYW1lLmFkZC5pbWFnZSgwLCAwLCBcImJhY2tncm91bmRcIik7XG4gICAgcmV0dXJuIGJhY2tncm91bmQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFja0dyb3VuZDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jbGFzcy9CYWNrR3JvdW5kLmpzXCIsXCIvbW9kdWxlcy9jbGFzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog5Y2h57uE55Sf5oiQ5ZmoXG4gKi9cblxuZnVuY3Rpb24gQ2FyZEdlbmVyYXRvcigpIHt9XG5cbi8vIOWNoee7hOeUn+aIkOWZqFxuLy8gQHBhcmFtIGNhcmRMZW5ndGggW251bWJlcl0g5Y2h57uE5pyA5aSn55qE6ZW/5bqmXG4vLyBAcGFyYW0gbWluSW5kZXggW251bWJlcl0g5pyA5bCP57Si5byVXG4vLyBAcGFyYW0gbWF4SW5kZXggW251bWJlcl0g5pyA5aSn57Si5byVXG4vLyBAcmV0dXJuIGNhcmRMaXN0IFthcnJheV0g5Y2h54mMaWTnlJ/miJDmlbDnu4RcbkNhcmRHZW5lcmF0b3IucHJvdG90eXBlLmJ1aWxkQ2FyZExpc3QgPSBmdW5jdGlvbihjYXJkTGVuZ3RoLCBtaW5JbmRleCwgbWF4SW5kZXgpIHtcbiAgICB2YXIgY2FyZExpc3QgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhcmRMZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmFtZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbWF4SW5kZXgpICsgbWluSW5kZXg7XG4gICAgICAgIGNhcmRMaXN0LnB1c2gocmFtZG9tKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhcmRMaXN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhcmRHZW5lcmF0b3I7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2xhc3MvQ2FyZEdlbmVyYXRlci5qc1wiLFwiL21vZHVsZXMvY2xhc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIOa4uOaIj+aVsOaNrueuoeeQhuexu1xuICovXG5cbnZhciBEYXRhTWFuYWdlciA9IHtcblx0dHVybjogMCwgLy8gMOS7o+ihqOiHquW3seWbnuWQiCwx5Luj6KGo5pWM5Lq65Zue5ZCIIFxuXHRmZWU6IDEsIC8vIOWIneWni+WMlui0ueeUqO+8jOWSjOa4uOaIj+WbnuWQiOebuOWFs1xuXHRBSTogbnVsbCxcblxuXHRoZXJvQ2hvaXNlQ2FyZDogbnVsbCwgLy8g6Iux6ZuE6YCJ5oup55qE5Y2h54mMXG5cdGhlcm9GaWdodGVyczogbnVsbCwgLy8g6Iux6ZuE6ZqP5LuOXG5cdGhlcm9IYW5kQ2FyZDogbnVsbCwgLy8g6Iux6ZuE5omL54mMXG5cdGhlcm9GZWU6IG51bGwsIC8vIOiLsembhOeahOi0ueeUqFxuXHRoZXJvSGVhZDogbnVsbCwgLy8g6Iux6ZuE5aS05YOPXG5cdGhlcm9GaWdodGVyQ2hvaXNlOiBudWxsLCAvLyDmiJjmlpfpmo/ku47nmoTpgInmi6lcblx0aGVyb0N1cnJlbnRGZWU6IDEsIC8vIOeOqeWutuW9k+WJjei0ueeUqFxuXG5cdGVuZW15SGFuZENhcmQ6IG51bGwsIC8vIOaVjOS6uuaJi+eJjCBcblx0ZW5lbXlGZWU6IG51bGwsIC8vIOaVjOS6uueahOi0ueeUqFxuXHRlbmVteUhlYWQ6IG51bGwsIC8vIOaVjOS6uueahOWktOWDj1xuXHRlbmVteUZpZ2h0ZXJzOiBudWxsLCAvLyDmlYzkurrmiJjlnLrnmoTpmo/ku45cblx0ZW5lbXlDdXJyZW50RmVlOiAxLCAvLyDmlYzkurrlvZPliY3otLnnlKhcblxuXHRyZW1haW5DYXJkOm51bGwsXG5cdHR1cm5PdmVyQnV0dG9uOiBudWxsLCAvLyDlm57lkIjnu5PmnZ/nmoTmjInpkq5cblx0cmVzdWx0OjAgLy8gMCDku6PooajnjqnlrrblpLHotKXvvIwx5Luj6KGo546p5a626IOc5YipXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YU1hbmFnZXI7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2xhc3MvRGF0YU1hbmFnZXIuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL1V0aWxzXCIpO1xudmFyIEZlZSA9IHJlcXVpcmUoXCIuL0ZlZVwiKTtcblxuLyoqXG4gKiDmlYzkurrotLnnlKjnrqHnkIZcbiAqL1xuXG5mdW5jdGlvbiBFbmVteUZlZShnYW1lLCB4LCB5KSB7XG4gICAgRmVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbnV0aWxzLmV4dGVuZChFbmVteUZlZSwgRmVlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmVteUZlZTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jbGFzcy9FbmVteUZlZS5qc1wiLFwiL21vZHVsZXMvY2xhc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIOaVjOS6uueahOaImOWcuumaj+S7jlxuICovXG52YXIgRGF0YU1hbmFnZXIgPSByZXF1aXJlKFwiLi9EYXRhTWFuYWdlclwiKTtcblxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL1V0aWxzXCIpO1xudmFyIEZpZ2h0ZXIgPSByZXF1aXJlKFwiLi9GaWdodGVyXCIpO1xuXG5mdW5jdGlvbiBFbmVteUZpZ2h0ZXIoZ2FtZSkge1xuICAgIEZpZ2h0ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnkgPSBnYW1lLndvcmxkLmNlbnRlclkgLSAxMzA7XG5cbn1cblxudXRpbHMuZXh0ZW5kKEVuZW15RmlnaHRlciwgRmlnaHRlcik7XG5cbi8vIOmHjeWGmWNob2lzZUZpZ2h0ZXIgXG4vLyDlnKjnjqnlrrbpgInmi6nmlYzmlrnpmo/ku47ml7bov5vooYzmiJjmlpfnu5PnrpdcbkVuZW15RmlnaHRlci5wcm90b3R5cGUuY2hvaWNlRmlnaHRlciA9IGZ1bmN0aW9uIChmaWdodEJnKSB7XG4gICAgaWYgKERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgICBhbGVydChcIuaIkeaWueeahFwiICsgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJDaG9pc2UuY25OYW1lICsgXCLmlLvlh7vkuobmlYzkurrnmoRcIiArIGZpZ2h0QmcuY25OYW1lKTtcblxuICAgICAgICB2YXIgX2hlcm9GaWdodEhQID0gRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJDaG9pc2UuaHAgLSBmaWdodEJnLmF0dGFjaztcbiAgICAgICAgdmFyIF9lbmVteUZpZ2h0SFAgPSBmaWdodEJnLmhwIC0gRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJDaG9pc2UuYXR0YWNrO1xuXG4gICAgICAgIC8vIOabtOaWsOeOqeWutueahOmaj+S7jueahGhwXG4gICAgICAgIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlLmhwID0gX2hlcm9GaWdodEhQO1xuICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlckNob2lzZS5hbHBoYSA9IDAuNztcbiAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJDaG9pc2Uuc2xlZXAgPSB0cnVlO1xuICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlckNob2lzZS5jaGlsZHJlblsyXS5hbHBoYSA9IDA7XG4gICAgICAgIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlLmNoaWxkcmVuWzFdLnNldFRleHQoX2hlcm9GaWdodEhQKTtcblxuICAgICAgICAvLyDmm7TmlrDmlYzkurrnmoTnjqnlrrbnmoRocFxuICAgICAgICBmaWdodEJnLmhwID0gX2VuZW15RmlnaHRIUDtcbiAgICAgICAgZmlnaHRCZy5jaGlsZHJlblsxXS5zZXRUZXh0KF9lbmVteUZpZ2h0SFApO1xuXG4gICAgICAgIGlmIChfaGVyb0ZpZ2h0SFAgPD0gMCkge1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJDaG9pc2UuZGVzdHJveSgpO1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzLnJlTGlzdE9ianMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfZW5lbXlGaWdodEhQIDw9IDApIHtcbiAgICAgICAgICAgIGZpZ2h0QmcuZGVzdHJveSgpO1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIuZW5lbXlGaWdodGVycy5yZUxpc3RPYmpzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlckNob2lzZSA9IG51bGw7XG4gICAgICAgIFxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmVteUZpZ2h0ZXI7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2xhc3MvRW5lbXlGaWdodGVyLmpzXCIsXCIvbW9kdWxlcy9jbGFzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog5pWM5Lq655qE5omL54mM57G7XG4gKi9cblxudmFyIEhhbmRDYXJuZCA9IHJlcXVpcmUoXCIuL0hhbmRDYXJkXCIpO1xudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL1V0aWxzXCIpO1xudmFyIENhcmRDb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnL0NhcmRDb25maWdcIik7XG5cbmZ1bmN0aW9uIEVuZW15SGFuZENhcmQoZ2FtZSkge1xuICAgIEhhbmRDYXJuZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIC8vIHRoaXMuc2V0UmVhbEhhbmRDYXJkKGdhbWUpOyAvLyDnnJ/lrp7ljaHpnaJcbiAgICB0aGlzLmJ1aWxkSGFuZENhcmRWaWV3TGlzdChnYW1lKTsgLy8g6K6+572u5Y2h6IOMXG5cbn1cblxudXRpbHMuZXh0ZW5kKEVuZW15SGFuZENhcmQsIEhhbmRDYXJuZCk7XG5cbi8vIEBvdmVycmlkZSAgXG4vLyDph43lhplyZWxpc3RIYW5kQ2FyZOaWueazlVxuRW5lbXlIYW5kQ2FyZC5wcm90b3R5cGUucmVMaXN0SGFuZENhcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBfdGVtcCA9IFtdO1xuICAgIGNvbnNvbGUubG9nKHNlbGYuY2FyZFZpZXdMaXN0KTtcblxuICAgIGlmIChzZWxmLmNhcmRWaWV3TGlzdC5sZW5ndGggPT0gMCkgeyAvLyDmsqHmnInmiYvniYznmoTmg4XlhrVcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5jYXJkVmlld0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzZWxmLmNhcmRWaWV3TGlzdFtpXS5hbGl2ZSA9PSB0cnVlKSB7IC8vIOa4hemZpOaOieW3sue7j+mUgOavgeS6hueahOaJi+eJjFxuICAgICAgICAgICAgICAgIF90ZW1wLnB1c2goc2VsZi5jYXJkVmlld0xpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYuY2FyZFZpZXdMaXN0ID0gX3RlbXA7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzZWxmLmNhcmRWaWV3TGlzdC5sZW5ndGg7IGorKykgeyAvLyDph43mlrDlr7nmiYvniYzmjpLluo9cbiAgICAgICAgICAgIHNlbGYuY2FyZFZpZXdMaXN0W2pdLnggPSBzZWxmLnggKyBqICogNzA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIEBvdmVycmlkZSBcbi8vIOmHjeWGmeWbnuWQiOW8gOWni+aXtueahOihpeeJjOmAu+i+kVxuRW5lbXlIYW5kQ2FyZC5wcm90b3R5cGUuYWRkQ2FyZCA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgdmFyIF9jYXJkTGlzdCA9IHRoaXMuY2FyZElETGlzdC5zcGxpY2UoMCwgMSk7XG5cbiAgICBpZiAodGhpcy5jYXJkVmlld0xpc3QubGVuZ3RoID49IDgpIHtcbiAgICAgICAgYWxlcnQoXCLmlYzkurrlt7Lovr7liLDkuIrpmZDvvIzlvZPliY3liLDnmoTljaHniYzooqvplIDmr4FcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IENhcmRDb25maWcuY2FyZF9pbmZvLmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgaWYgKF9jYXJkTGlzdFswXSA9PSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5pZCkge1xuICAgICAgICAgICAgdmFyIGNhcmQgPSBnYW1lLmFkZC5pbWFnZSh0aGlzLnggKyB0aGlzLmNhcmRWaWV3TGlzdC5sZW5ndGggKiA3MCwgdGhpcy55LCBcImNhcmRfYmFja1wiKTtcblxuICAgICAgICAgICAgLy8g6K6+572u55u45bqU55qE5pWw5o2uXG4gICAgICAgICAgICBjYXJkLmNhcmRJbmZvID0ge307XG4gICAgICAgICAgICBjYXJkLmNhcmRJbmZvLkhQID0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uaHA7IC8vIOihgOmHj1xuICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5hdHRhY2sgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5hdHRhY2s7IC8vIOaUu+WHu+WKm1xuICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5jbk5hbWUgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5jbl9uYW1lOyAvLyDkuK3mloflkI3np7BcbiAgICAgICAgICAgIGNhcmQuY2FyZEluZm8uZmVlID0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uZmVlOyAvLyDlj6zllKTotLnnlKhcbiAgICAgICAgICAgIGNhcmQuY2FyZEluZm8uZmlnaHQgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5maWdodDsgLy8g5oiY5paX5Zu+54mHXG4gICAgICAgICAgICBjYXJkLnNjYWxlLnNldCgwLjUpO1xuICAgICAgICAgICAgdGhpcy5jYXJkVmlld0xpc3QucHVzaChjYXJkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmVteUhhbmRDYXJkO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL2NsYXNzL0VuZW15SGFuZENhcmQuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDmlYzkurrlpLTlg49cbiAqL1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vVXRpbHNcIik7XG52YXIgSGVhZCA9IHJlcXVpcmUoXCIuL0hlYWRcIik7XG52YXIgRGF0YU1hbmFnZXIgPSByZXF1aXJlKFwiLi9EYXRhTWFuYWdlclwiKTtcblxuZnVuY3Rpb24gRW5lbXlIZWFkKGdhbWUsIHRleHR1cmVOYW1lLCBwb3NpdGlvblgsIHBvc2l0aW9uWSkge1xuICAgIEhlYWQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuLy8g6K6+572u5pWM5Lq65aS05YOPXG4vLyBAb3ZlcnJpZGXph43lhplzZXRQaWNcbkhlYWQucHJvdG90eXBlLnNldFBpYyA9IGZ1bmN0aW9uIChnYW1lKSB7XG4gICAgdmFyIHBpYyA9IGdhbWUuYWRkLmltYWdlKDAsIDAsIHRoaXMudGV4dHVyZU5hbWUpO1xuXG4gICAgcGljLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgcGljLmV2ZW50cy5vbklucHV0RG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJDaG9pc2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgX2hwID0gcGFyc2VJbnQodGhpcy5IUE9iai50ZXh0KSAtIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlLmF0dGFjaztcbiAgICAgICAgICAgIHRoaXMuSFBPYmouc2V0VGV4dChfaHApO1xuXG4gICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlckNob2lzZS5hbHBoYSA9IDAuNztcbiAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlLnNsZWVwID0gdHJ1ZTtcbiAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlLmNoaWxkcmVuWzJdLmFscGhhID0gMDtcblxuICAgICAgICAgICAgYWxlcnQoXCLmiJHmlrnnmoRcIiArIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlLmNuTmFtZSArIFwi5pS75Ye75LqG5pWM5Lq66Iux6ZuEXCIpO1xuXG4gICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlckNob2lzZSA9IG51bGw7XG5cbiAgICAgICAgICAgIGlmIChwYXJzZUludCh0aGlzLkhQT2JqLnRleHQpIDw9IDApIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIueOqeWutuiOt+WPluiDnOWIqe+8jOaVjOS6uumYteS6oVwiKTtcbiAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5yZXN1bHQgPSAxO1xuICAgICAgICAgICAgICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJSZXN1bHRTY2VuZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gcGljO1xufVxuXG51dGlscy5leHRlbmQoRW5lbXlIZWFkLCBIZWFkKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbmVteUhlYWQ7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jbGFzcy9FbmVteUhlYWQuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDotLnnlKjnrqHnkIbnsbtcbiAqL1xuXG5mdW5jdGlvbiBGZWUoZ2FtZSwgeCwgeSkge1xuICAgIHRoaXMuZmVlT2JqID0gbnVsbDtcbiAgICB0aGlzLnggPSB4IHx8IGdhbWUud29ybGQud2lkdGggLSAzMDtcbiAgICB0aGlzLnkgPSB5IHx8IDA7XG4gICAgdGhpcy5pbml0KGdhbWUpO1xufVxuXG5GZWUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIHRoaXMuZmVlT2JqID0gdGhpcy5zZXRGZWVQaWMoZ2FtZSk7XG59XG5cbi8vIOiuvue9rkZlZeiDjOaZr+S7peWPiuaWh+Wtl1xuRmVlLnByb3RvdHlwZS5zZXRGZWVQaWMgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIHZhciBmZWUgPSBnYW1lLmFkZC5pbWFnZSh0aGlzLngsIHRoaXMueSwgXCJmZWVcIik7XG4gICAgdmFyIHRleHQgPSBnYW1lLmFkZC50ZXh0KDYwLCAyOCwgXCIxLzFcIiwgeyBmaWxsOiBcIiNmZmZcIiwgZm9udFNpemU6IFwiMThwdFwiIH0pO1xuICAgIHRleHQuYW5jaG9yLnNldCgwLjUpO1xuICAgIGZlZS5hZGRDaGlsZCh0ZXh0KTtcbiAgICByZXR1cm4gdGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGZWU7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jbGFzcy9GZWUuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDmiJjmlpflhYPntKDnsbtcbiAqIEBwYXJhbSBnYW1lIFxuICogQHBhcmFtIHggW251bWJlcl0g5Yid5aeL5YyW55qEXG4gKi9cblxudmFyIERhdGFNYW5hZ2VyID0gcmVxdWlyZShcIi4vRGF0YU1hbmFnZXJcIik7XG5cbmZ1bmN0aW9uIEZpZ2h0ZXIoZ2FtZSkge1xuICAgIHRoaXMuZmlnaHRPYmogPSBbXTsgLy8g5oiY5paX6ZqP5LuO5pWw57uEXG4gICAgdGhpcy54ID0gMTUwO1xuICAgIHRoaXMueSA9IGdhbWUud29ybGQuY2VudGVyWSArIDMwO1xufVxuXG5GaWdodGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGdhbWUpIHtcbn1cblxuLy8g55Sf5oiQ5oiY5paX6ZqP5LuOXG5GaWdodGVyLnByb3RvdHlwZS5idWlsZEZpZ2h0ZXIgPSBmdW5jdGlvbiAoZ2FtZSwgaHAsIGF0dGFjaywgY25OYW1lLCBwaWNOYW1lKSB7XG4gICAgdmFyIGZpZ2h0QmcgPSBnYW1lLmFkZC5pbWFnZSh0aGlzLngsIHRoaXMueSwgcGljTmFtZSk7XG5cbiAgICBmaWdodEJnLmhwID0gaHA7XG4gICAgZmlnaHRCZy5hdHRhY2sgPSBhdHRhY2s7XG4gICAgZmlnaHRCZy5jbk5hbWUgPSBjbk5hbWU7XG4gICAgZmlnaHRCZy5waWNOYW1lID0gcGljTmFtZTtcbiAgICBmaWdodEJnLnNsZWVwID0gdHJ1ZTsgLy8g5LyR55yg54q25oCB77yM5Zyo5Ye654mM55qE56ys5LiA5Zue5ZCI5peg5rOV6L+b6KGM5pS75Ye7XG4gICAgdmFyIF9zdHlsZSA9IHtcbiAgICAgICAgZmlsbDogXCIjZmZmXCIsXG4gICAgICAgIGZvbnRTaXplOiBcIjEycHRcIlxuICAgIH1cbiAgICAvLyDorr7nva7nlJ/lkb3lgLxcbiAgICB2YXIgaHBfdGV4dCA9IGdhbWUuYWRkLnRleHQoNzUsIDEwNSwgaHAsIF9zdHlsZSk7XG4gICAgaHBfdGV4dC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgaHBfdGV4dC5rZXkgPSBcImhwXCI7XG5cbiAgICAvLyDorr7nva5cbiAgICB2YXIgYXR0YWNrX3RleHQgPSBnYW1lLmFkZC50ZXh0KDE3LCAxMDUsIGF0dGFjaywgX3N0eWxlKTtcbiAgICBhdHRhY2tfdGV4dC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgYXR0YWNrX3RleHQua2V5ID0gXCJhdHRhY2tcIjtcblxuICAgIHZhciBhdHRhY2tfdGFnID0gZ2FtZS5hZGQuaW1hZ2UoNDgsIC0xNSwgXCJhdHRhY2tfaWNvblwiKTtcbiAgICBhdHRhY2tfdGFnLmtleSA9IFwiYXR0YWNrX3RhZ1wiO1xuICAgIGF0dGFja190YWcuc2NhbGUuc2V0KDAuNSk7XG4gICAgYXR0YWNrX3RhZy5hbmNob3Iuc2V0KDAuNSk7XG4gICAgYXR0YWNrX3RhZy5hbHBoYSA9IDA7XG5cbiAgICBmaWdodEJnLmFkZENoaWxkKGF0dGFja190ZXh0KTtcbiAgICBmaWdodEJnLmFkZENoaWxkKGhwX3RleHQpO1xuICAgIGZpZ2h0QmcuYWRkQ2hpbGQoYXR0YWNrX3RhZyk7XG4gICAgZmlnaHRCZy5hbHBoYSA9IDAuNzsgLy8gc2xlZXDnirbmgIHml6Dms5XmlLvlh7tcbiAgICB0aGlzLmZpZ2h0T2JqLnB1c2goZmlnaHRCZyk7XG4gICAgdGhpcy5yZUxpc3RPYmpzKCk7XG5cbiAgICBmaWdodEJnLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgZmlnaHRCZy5ldmVudHMub25JbnB1dERvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jaG9pY2VGaWdodGVyKGZpZ2h0QmcpO1xuICAgIH0sIHRoaXMpO1xuXG59XG5cbkZpZ2h0ZXIucHJvdG90eXBlLnJlTGlzdE9ianMgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuZmlnaHRPYmoubGVuZ3RoID09IDApIHtcbiAgICAgICAgLy8g5aaC5p6c6ZqP5LuO55qE6Zif5YiX5Li656m677yM5LiN6L+b6KGM5o6S5bqPXG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgX3RlbXA9IFtdO1xuXG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGo8dGhpcy5maWdodE9iai5sZW5ndGg7aisrKXtcbiAgICAgICAgICAgIGlmKHRoaXMuZmlnaHRPYmpbal0uYWxpdmUgPT0gdHJ1ZSl7XG4gICAgICAgICAgICAgICAgX3RlbXAucHVzaCh0aGlzLmZpZ2h0T2JqW2pdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZmlnaHRPYmogPSBfdGVtcDtcblxuICAgICAgICAvLyDph43mjpLmiJjmlpfpmo/ku47nmoTmlbDnu4RcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZpZ2h0T2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmZpZ2h0T2JqW2ldLnggPSB0aGlzLnggKyBpICogOTU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkZpZ2h0ZXIucHJvdG90eXBlLmF3YWtlRmlnaHRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5maWdodE9iai5sZW5ndGggPT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZmlnaHRPYmoubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZmlnaHRPYmpbaV0uc2xlZXAgPSBmYWxzZTsgLy8g6Kej6Zmk552h55yg54q25oCBXG4gICAgICAgICAgICB0aGlzLmZpZ2h0T2JqW2ldLmFscGhhID0gMTsgLy8g6Kej6Zmk552h55yg54q25oCB5ZCO55qEdmlld1xuXG4gICAgICAgIH1cbiAgICB9XG59XG5cbkZpZ2h0ZXIucHJvdG90eXBlLmNob2ljZUZpZ2h0ZXIgPSBmdW5jdGlvbiAoZmlnaHRCZykge1xuICAgIGlmIChmaWdodEJnLnNsZWVwID09IHRydWUpIHtcbiAgICAgICAgYWxlcnQoXCLmnKzlm57lkIjml6Dms5Xmk43kvZzor6Xpmo/ku47vvIFcIik7XG4gICAgfVxuXG4gICAgZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5maWdodE9iai5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5maWdodE9ialtpXS5jaGlsZHJlblsyXS5hbHBoYSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZmlnaHRCZy5jaGlsZHJlblsyXS5hbHBoYSA9IDE7XG4gICAgICAgIERhdGFNYW5hZ2VyLmhlcm9GaWdodGVyQ2hvaXNlID0gZmlnaHRCZztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlnaHRlcjtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jbGFzcy9GaWdodGVyLmpzXCIsXCIvbW9kdWxlcy9jbGFzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog5omL54mM57G7XG4gKi9cblxudmFyIENhcmRHZW5lcmF0ZXIgPSByZXF1aXJlKFwiLi9DYXJkR2VuZXJhdGVyXCIpO1xudmFyIENhcmRDb25maWcgPSByZXF1aXJlKFwiLi4vY29uZmlnL0NhcmRDb25maWdcIik7XG52YXIgRGF0YU1hbmFnZXIgPSByZXF1aXJlKFwiLi9EYXRhTWFuYWdlclwiKTtcblxuZnVuY3Rpb24gSGFuZENhcmQoZ2FtZSwgeCwgeSkge1xuICAgIHRoaXMuY2FyZE9iakxpc3QgPSBbXTsgLy8g5omL54mM5a+56LGh5pWw57uEXG4gICAgdGhpcy5jYXJkVmlld0xpc3QgPSBbXTsgLy8g5omL54mM6KeG5Zu+5pWw57uEXG4gICAgdGhpcy5jYXJkSURMaXN0ID0gW107XG4gICAgdGhpcy54ID0geCB8fCAxNDA7XG4gICAgdGhpcy55ID0geSB8fCAyMDtcbiAgICB0aGlzLmluaXQoZ2FtZSk7XG59XG5cbkhhbmRDYXJkLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKGdhbWUpIHtcbiAgICB0aGlzLmNhcmRJRExpc3QgPSB0aGlzLnNldEhhbmRDYXJkTGlzdCgpO1xuICAgIC8vIHRoaXMuYnVpbGRIYW5kQ2FyZFZpZXdMaXN0KGdhbWUpOyAvLyDorr7nva7ljaHog4xcbiAgICAvLyB0aGlzLnNldFJlYWxIYW5kQ2FyZChnYW1lKTsgLy8g55yf5a6e5Y2h6Z2iXG59XG5cbi8vIOaehOW7uuaJi+eJjOaVsOe7hHZpZXdcbkhhbmRDYXJkLnByb3RvdHlwZS5idWlsZEhhbmRDYXJkVmlld0xpc3QgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIC8vIOaIquWPluWNoee7hOS4reeahOWJjeWbm+W8oFxuICAgIHZhciBfbGlzdCA9IHRoaXMuY2FyZElETGlzdC5zcGxpY2UoMCwgNCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IENhcmRDb25maWcuY2FyZF9pbmZvLmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgIGlmIChfbGlzdFtpXSA9PSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5pZCkge1xuICAgICAgICAgICAgICAgIHZhciBjYXJkID0gZ2FtZS5hZGQuaW1hZ2UodGhpcy54ICsgaSAqIDcwLCB0aGlzLnksIFwiY2FyZF9iYWNrXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8g6K6+572u55u45bqU55qE5pWw5o2uXG4gICAgICAgICAgICAgICAgY2FyZC5jYXJkSW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgIGNhcmQuY2FyZEluZm8uSFAgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5ocDsgLy8g6KGA6YePXG4gICAgICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5hdHRhY2sgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5hdHRhY2s7IC8vIOaUu+WHu+WKm1xuICAgICAgICAgICAgICAgIGNhcmQuY2FyZEluZm8uY25OYW1lID0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uY25fbmFtZTsgLy8g5Lit5paH5ZCN56ewXG4gICAgICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5mZWUgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5mZWU7IC8vIOWPrOWUpOi0ueeUqFxuICAgICAgICAgICAgICAgIGNhcmQuY2FyZEluZm8uZmlnaHQgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5maWdodDsgLy8g5oiY5paX5Zu+54mHXG4gICAgICAgICAgICAgICAgY2FyZC5zY2FsZS5zZXQoMC41KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhcmRWaWV3TGlzdC5wdXNoKGNhcmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyDorr7nva7ljaHniYznmoTmlbDmja7mmL7npLpcbkhhbmRDYXJkLnByb3RvdHlwZS5zZXRSZWFsSGFuZENhcmQgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIHZhciBfbGlzdCA9IHRoaXMuY2FyZElETGlzdC5zcGxpY2UoMCwgNCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IENhcmRDb25maWcuY2FyZF9pbmZvLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoX2xpc3RbaV0gPT0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FyZCA9IGdhbWUuYWRkLmltYWdlKHRoaXMueCArIGkgKiA3NSwgdGhpcy55LCBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5uYW1lKTtcbiAgICAgICAgICAgICAgICBjYXJkLmNhcmRJbmZvID0ge307XG4gICAgICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5IUCA9IENhcmRDb25maWcuY2FyZF9pbmZvW2pdLmhwOyAvLyDooYDph49cbiAgICAgICAgICAgICAgICBjYXJkLmNhcmRJbmZvLmF0dGFjayA9IENhcmRDb25maWcuY2FyZF9pbmZvW2pdLmF0dGFjazsgLy8g5pS75Ye75YqbXG4gICAgICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5jbk5hbWUgPSBDYXJkQ29uZmlnLmNhcmRfaW5mb1tqXS5jbl9uYW1lOyAvLyDkuK3mloflkI3np7BcbiAgICAgICAgICAgICAgICBjYXJkLmNhcmRJbmZvLmZlZSA9IENhcmRDb25maWcuY2FyZF9pbmZvW2pdLmZlZTsgLy8g5Y+s5ZSk6LS555SoXG4gICAgICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5maWdodCA9IENhcmRDb25maWcuY2FyZF9pbmZvW2pdLmZpZ2h0OyAvLyDmiJjmlpflm77niYdcbiAgICAgICAgICAgICAgICBjYXJkLnNjYWxlLnNldCgwLjUpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYXJkT2JqTGlzdC5wdXNoKGNhcmQpO1xuXG4gICAgICAgICAgICAgICAgY2FyZC5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNhcmQuZXZlbnRzLm9uSW5wdXREb3duLmFkZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXRFbmFibGVkID0gZmFsc2U7IC8vIOemgeatoueOqeWutuS4jeWBnOeCueWHu1xuICAgICAgICAgICAgICAgICAgICBpZiAoRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5rOo5YaM5Yqo55S75LqL5Lu2XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHdlZW4gPSBnYW1lLmFkZC50d2VlbihEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZCkudG8oeyB5OiBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZC55ICsgMjAgfSwgMjAwLCBcIkxpbmVhclwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9DaG9pc2VDYXJkLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmiafooYzliqjnlLtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR3ZWVuLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdHdlZW4gPSBnYW1lLmFkZC50d2Vlbih0aGlzKS50byh7IHk6IHRoaXMueSAtIDIwIH0sIDIwMCwgXCJMaW5lYXJcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHR3ZWVuLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHR3ZWVuLm9uQ29tcGxldGUuYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgY2FyZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIOWbnuWQiOW8gOWni+aXtueahOihpeeJjOmAu+i+kVxuSGFuZENhcmQucHJvdG90eXBlLmFkZENhcmQgPSBmdW5jdGlvbiAoZ2FtZSkge1xuICAgIHZhciBfY2FyZExpc3QgPSB0aGlzLmNhcmRJRExpc3Quc3BsaWNlKDAsIDEpO1xuXG4gICAgaWYgKHRoaXMuY2FyZE9iakxpc3QubGVuZ3RoID49IDgpIHtcbiAgICAgICAgYWxlcnQoXCLkvaDnmoTmiYvniYzlt7Lovr7liLDkuIrpmZDvvIzlvZPliY3liLDnmoTljaHniYzooqvplIDmr4FcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IENhcmRDb25maWcuY2FyZF9pbmZvLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChfY2FyZExpc3RbMF0gPT0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uaWQpIHtcbiAgICAgICAgICAgIHZhciBjYXJkID0gZ2FtZS5hZGQuaW1hZ2UodGhpcy54ICsgKHRoaXMuY2FyZE9iakxpc3QubGVuZ3RoKSAqIDc1LCB0aGlzLnksIENhcmRDb25maWcuY2FyZF9pbmZvW2pdLm5hbWUpO1xuICAgICAgICAgICAgY2FyZC5jYXJkSW5mbyA9IHt9O1xuICAgICAgICAgICAgY2FyZC5jYXJkSW5mby5IUCA9IENhcmRDb25maWcuY2FyZF9pbmZvW2pdLmhwOyAvLyDooYDph49cbiAgICAgICAgICAgIGNhcmQuY2FyZEluZm8uYXR0YWNrID0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uYXR0YWNrOyAvLyDmlLvlh7vliptcbiAgICAgICAgICAgIGNhcmQuY2FyZEluZm8uY25OYW1lID0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uY25fbmFtZTsgLy8g5Lit5paH5ZCN56ewXG4gICAgICAgICAgICBjYXJkLmNhcmRJbmZvLmZlZSA9IENhcmRDb25maWcuY2FyZF9pbmZvW2pdLmZlZTsgLy8g5Y+s5ZSk6LS555SoXG4gICAgICAgICAgICBjYXJkLmNhcmRJbmZvLmZpZ2h0ID0gQ2FyZENvbmZpZy5jYXJkX2luZm9bal0uZmlnaHQ7IC8vIOaImOaWl+WbvueJh1xuICAgICAgICAgICAgY2FyZC5zY2FsZS5zZXQoMC41KTtcblxuICAgICAgICAgICAgdGhpcy5jYXJkT2JqTGlzdC5wdXNoKGNhcmQpO1xuXG4gICAgICAgICAgICBjYXJkLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBjYXJkLmV2ZW50cy5vbklucHV0RG93bi5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXRFbmFibGVkID0gZmFsc2U7IC8vIOemgeatoueOqeWutuS4jeWBnOeCueWHu1xuICAgICAgICAgICAgICAgIGlmIChEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9DaG9pc2VDYXJkID0gdGhpcztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyDms6jlhozliqjnlLvkuovku7ZcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR3ZWVuID0gZ2FtZS5hZGQudHdlZW4oRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQpLnRvKHsgeTogRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQueSArIDIwIH0sIDIwMCwgXCJMaW5lYXJcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9DaG9pc2VDYXJkLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIOaJp+ihjOWKqOeUu1xuICAgICAgICAgICAgICAgICAgICB0d2Vlbi5zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHR3ZWVuID0gZ2FtZS5hZGQudHdlZW4odGhpcykudG8oeyB5OiB0aGlzLnkgLSAyMCB9LCAyMDAsIFwiTGluZWFyXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgIHR3ZWVuLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgY2FyZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIOmHjeaWsOWvueaJi+eJjOaOkuW6j1xuSGFuZENhcmQucHJvdG90eXBlLnJlTGlzdEhhbmRDYXJkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgX3RlbXAgPSBbXTtcbiAgICBpZiAoc2VsZi5jYXJkT2JqTGlzdC5sZW5ndGggPT0gMCkgeyAvLyDmsqHmnInmiYvniYznmoTmg4XlhrVcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5jYXJkT2JqTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHNlbGYuY2FyZE9iakxpc3RbaV0uYWxpdmUgPT0gdHJ1ZSkgeyAvLyDmuIXpmaTmjonlt7Lnu4/plIDmr4HkuobnmoTmiYvniYxcbiAgICAgICAgICAgICAgICBfdGVtcC5wdXNoKHNlbGYuY2FyZE9iakxpc3RbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHNlbGYuY2FyZE9iakxpc3QgPSBfdGVtcDtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHNlbGYuY2FyZE9iakxpc3QubGVuZ3RoOyBqKyspIHsgLy8g6YeN5paw5a+55omL54mM5o6S5bqPXG4gICAgICAgICAgICBzZWxmLmNhcmRPYmpMaXN0W2pdLnggPSBzZWxmLnggKyBqICogNzU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogIOeUn+aIkOWNoeeJjGlk5pWw57uEXG4gKiBAcmV0dXJuIHthcnJheX0g5Y2h57uE55qEYWTmlbDnu4RcbiAqL1xuSGFuZENhcmQucHJvdG90eXBlLnNldEhhbmRDYXJkTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FyZEdlbmVyYXRlciA9IG5ldyBDYXJkR2VuZXJhdGVyKCk7XG4gICAgdmFyIGNhcmRJRExpc3QgPSBjYXJkR2VuZXJhdGVyLmJ1aWxkQ2FyZExpc3QoQ2FyZENvbmZpZy5jYXJkTGVuZ3RoLCAxLCBDYXJkQ29uZmlnLmNhcmRfaW5mby5sZW5ndGgpO1xuICAgIHJldHVybiBjYXJkSURMaXN0O1xufVxuXG4vLyDpgJrov4dpZOaehOW7uuecn+WunuaJi+eJjFxubW9kdWxlLmV4cG9ydHMgPSBIYW5kQ2FyZDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jbGFzcy9IYW5kQ2FyZC5qc1wiLFwiL21vZHVsZXMvY2xhc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIOinkuiJsuWktOWDj+exu1xuICogQHBhcmFtIGdhbWUgW29ial0g5ri45oiP5Zy65pmv5a+56LGhXG4gKiBAcGFyYW0gdGV4dHVyZU5hbWUgW3N0cmluZ10g5Zu+54mHa2V5XG4gKiBAcGFyYW0gcG9zaXRpb25YIFtudW1iZXJdIOWIneWni+WMlueahHjlnZDmoIdcbiAqIEBwYXJhbSBwb3NpdGlvblkgW251bWJlcl0g5Yid5aeL5YyW55qEeeWdkOagh1xuICovXG5cbmZ1bmN0aW9uIEhlYWQoZ2FtZSwgdGV4dHVyZU5hbWUsIHBvc2l0aW9uWCwgcG9zaXRpb25ZKSB7XG5cdHRoaXMuaGVhZE9iaiA9IG51bGw7XG5cdHRoaXMueCA9IHBvc2l0aW9uWDtcblx0dGhpcy55ID0gcG9zaXRpb25ZO1xuXHR0aGlzLkhQT2JqID0gbnVsbDsgIC8vIOiLsembhOihgOmHj1xuXHR0aGlzLnRleHR1cmVOYW1lID0gdGV4dHVyZU5hbWU7XG5cdHRoaXMuaW5pdChnYW1lKTtcbn1cblxuSGVhZC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChnYW1lKSB7XG5cdHRoaXMuaGVhZE9iaiA9IHRoaXMuc2V0UGljKGdhbWUpO1xuXHR0aGlzLkhQT2JqID0gdGhpcy5zZXRIUChnYW1lKTtcbn1cblxuLy8g6K6+572u6Iux6ZuE5aS05YOPXG5IZWFkLnByb3RvdHlwZS5zZXRQaWMgPSBmdW5jdGlvbiAoZ2FtZSkge1xuXHR2YXIgcGljID0gZ2FtZS5hZGQuaW1hZ2UodGhpcy54LCB0aGlzLnksIHRoaXMudGV4dHVyZU5hbWUpO1xuXHRyZXR1cm4gcGljO1xufVxuXG4vLyDorr7nva7ooYDph49cbkhlYWQucHJvdG90eXBlLnNldEhQID0gZnVuY3Rpb24gKGdhbWUpIHtcblx0dmFyIEhQYmcgPSBnYW1lLmFkZC5pbWFnZSgxMCwgMTcwLCBcImhwX2JhY2tncm91bmRcIik7XG5cdHZhciBIUCA9IGdhbWUuYWRkLnRleHQoSFBiZy53aWR0aCAvIDIsIEhQYmcuaGVpZ2h0IC8gMiArIDUsIFwiMzBcIiwgeyBmaWxsOiBcIiNmZmZcIiwgZm9udFNpemU6IFwiMjRwdFwiIH0pO1xuXHRIUC5hbmNob3Iuc2V0KDAuNSk7XG5cdEhQYmcuYWRkQ2hpbGQoSFApO1xuXG5cdHJldHVybiBIUDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL2NsYXNzL0hlYWQuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDnjqnlrrbmsLTmmbbnrqHnkIZcbiAqL1xuXG52YXIgRmVlID0gcmVxdWlyZShcIi4vRmVlXCIpO1xudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL1V0aWxzXCIpO1xuXG5mdW5jdGlvbiBIZXJvRmVlKGdhbWUpIHtcbiAgICBGZWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxudXRpbHMuZXh0ZW5kKEhlcm9GZWUsIEZlZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVyb0ZlZTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL2NsYXNzL0hlcm9GZWUuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiBIZXJv5oiY5paX6ZqP5LuOXG4gKi9cblxudmFyIEZpZ2h0ZXIgPSByZXF1aXJlKFwiLi9GaWdodGVyXCIpO1xudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL1V0aWxzXCIpO1xuXG5mdW5jdGlvbiBIZXJvRmlnaHRlcihnYW1lKXtcbiAgICBGaWdodGVyLmFwcGx5KHRoaXMsYXJndW1lbnRzKTtcbn1cblxudXRpbHMuZXh0ZW5kKEhlcm9GaWdodGVyLEZpZ2h0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhlcm9GaWdodGVyO1xuXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jbGFzcy9IZXJvRmlnaHRlci5qc1wiLFwiL21vZHVsZXMvY2xhc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIOiLsembhOeahOaJi+eJjOexu1xuICovXG5cbnZhciBIYW5kQ2FybmQgPSByZXF1aXJlKFwiLi9IYW5kQ2FyZFwiKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi9VdGlsc1wiKTtcblxuZnVuY3Rpb24gSGVyb0hhbmRDYXJkKGdhbWUsIHgsIHkpIHtcbiAgICBIYW5kQ2FybmQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB0aGlzLnNldFJlYWxIYW5kQ2FyZChnYW1lKTsgLy8g55yf5a6e5Y2h6Z2iXG59XG5cbnV0aWxzLmV4dGVuZChIZXJvSGFuZENhcmQsIEhhbmRDYXJuZCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSGVyb0hhbmRDYXJkO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2xhc3MvSGVyb0hhbmRDYXJkLmpzXCIsXCIvbW9kdWxlcy9jbGFzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog546p5a626KeS6Imy5aS05YOPXG4gKi9cbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi9VdGlsc1wiKTtcbnZhciBIZWFkID0gcmVxdWlyZShcIi4vSGVhZFwiKTtcblxuZnVuY3Rpb24gSGVyb0hlYWQoZ2FtZSwgdGV4dHVyZU5hbWUsIHBvc2l0aW9uWCwgcG9zaXRpb25ZKSB7XG4gICAgSGVhZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG4vLyBIZXJvSGVhZOe7p+aJv+iHqkhlYWTnsbtcbnV0aWxzLmV4dGVuZChIZXJvSGVhZCwgSGVhZCk7XG5cbi8qKlxuICogIEBvdmVycmlkZSDph43lhplzZXRIUOaWueazlVxuICovXG5IZXJvSGVhZC5wcm90b3R5cGUuc2V0SFAgPSBmdW5jdGlvbihnYW1lKSB7XG4gICAgdmFyIEhQYmcgPSBnYW1lLmFkZC5pbWFnZSh0aGlzLngsIHRoaXMueSAtIDU1LCBcImhwX2JhY2tncm91bmRcIik7XG4gICAgdmFyIEhQID0gZ2FtZS5hZGQudGV4dChIUGJnLndpZHRoIC8gMiwgSFBiZy5oZWlnaHQgLyAyICsgNSwgXCIzMFwiLCB7XG4gICAgICAgIGZpbGw6IFwiI2ZmZlwiLFxuICAgICAgICBmb250U2l6ZTogXCIyNHB0XCJcbiAgICB9KTtcbiAgICBIUC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgSFBiZy5hZGRDaGlsZChIUCk7XG5cbiAgICByZXR1cm4gSFA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVyb0hlYWQ7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2xhc3MvSGVyb0hlYWQuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDliankvZnnmoTljaHniYzmmL7npLpcbiAqL1xuXG52YXIgRGF0YU1hbmFnZXIgPSByZXF1aXJlKFwiLi9EYXRhTWFuYWdlclwiKTtcblxuZnVuY3Rpb24gUmVtYWluQ2FyZChnYW1lKSB7XG5cdHRoaXMuaGVyb1JlbWFpbkNhcmQgPSBudWxsO1xuXHR0aGlzLmVuZW15UmVtYWluQ2FyZCA9IG51bGw7XG5cdHRoaXMuaW5pdChnYW1lKTtcbn1cblxuUmVtYWluQ2FyZC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uIChnYW1lKSB7XG5cdHRoaXMuaGVyb1JlbWFpbkNhcmQgPSB0aGlzLnNldEhlcm9SZW1haW5DYXJkKGdhbWUpO1xuXHR0aGlzLmVuZW15UmVtYWluQ2FyZCA9IHRoaXMuc2V0RW5lbXlSZW1haW5DYXJkKGdhbWUpO1xuXHRjb25zb2xlLmxvZyh0aGlzLmhlcm9SZW1haW5DYXJkKTsgXG59XG5cbi8vIOiuvue9ruiLsembhOeahOWJqeS9meWNoeeJh+aPkOekulxuUmVtYWluQ2FyZC5wcm90b3R5cGUuc2V0SGVyb1JlbWFpbkNhcmQgPSBmdW5jdGlvbiAoZ2FtZSkge1xuXHR2YXIgaW1hZ2UgPSBnYW1lLmFkZC5pbWFnZSg2ODAsIGdhbWUud29ybGQuY2VudGVyWSArIDEwMCwgXCJjYXJkX2JhY2tcIik7XG5cdGltYWdlLnNjYWxlLnNldCgwLjMpO1xuXG5cdHZhciB0ZXh0ID0gZ2FtZS5hZGQudGV4dCg2ODAsIGdhbWUud29ybGQuY2VudGVyWSArIDE2MCxEYXRhTWFuYWdlci5oZXJvSGFuZENhcmQuY2FyZElETGlzdC5sZW5ndGgse1xuXHRcdGZpbGw6XCIjMzMzMzMzXCIsXG5cdFx0Zm9udFNpemU6XCIxOHB0XCJcblx0fSk7XG5cblx0cmV0dXJuIHtpbWFnZSx0ZXh0fVxufVxuXG4vLyDorr7nva7mlYzkurrnmoTliankvZnljaHniYzmj5DnpLpcblJlbWFpbkNhcmQucHJvdG90eXBlLnNldEVuZW15UmVtYWluQ2FyZCA9IGZ1bmN0aW9uIChnYW1lKSB7XG5cdHZhciBpbWFnZSA9IGdhbWUuYWRkLmltYWdlKDY4MCwgZ2FtZS53b3JsZC5jZW50ZXJZIC0gMTYwICwgXCJjYXJkX2JhY2tcIik7XG5cdGltYWdlLnNjYWxlLnNldCgwLjMpO1xuXG5cdHZhciB0ZXh0ID0gZ2FtZS5hZGQudGV4dCg2ODAsIGdhbWUud29ybGQuY2VudGVyWSAtIDE5MCxEYXRhTWFuYWdlci5lbmVteUhhbmRDYXJkLmNhcmRJRExpc3QubGVuZ3RoLHtcblx0XHRmaWxsOlwiIzMzMzMzM1wiLFxuXHRcdGZvbnRTaXplOlwiMThwdFwiXG5cdH0pO1xuXHRyZXR1cm4ge2ltYWdlLHRleHR9XG59XG5cbi8vIOWIt+aWsOWJqeS9meeahOWNoeeJjOaVsOmHj1xuUmVtYWluQ2FyZC5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uKCl7XG5cdHRoaXMuaGVyb1JlbWFpbkNhcmQudGV4dC5zZXRUZXh0KERhdGFNYW5hZ2VyLmhlcm9IYW5kQ2FyZC5jYXJkSURMaXN0Lmxlbmd0aCk7XG5cdHRoaXMuZW5lbXlSZW1haW5DYXJkLnRleHQuc2V0VGV4dChEYXRhTWFuYWdlci5lbmVteUhhbmRDYXJkLmNhcmRJRExpc3QubGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW1haW5DYXJkO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL2NsYXNzL1JlbWFpbkNhcmQuanNcIixcIi9tb2R1bGVzL2NsYXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiBVSeeVjOmdoueuoeeQhlxuICovXG5cbnZhciBCYWNrR3JvdW5kID0gcmVxdWlyZShcIi4vQmFja0dyb3VuZFwiKTtcbnZhciBIZXJvSGVhZCA9IHJlcXVpcmUoXCIuL0hlcm9IZWFkXCIpO1xudmFyIEVuZW15SGVhZCA9IHJlcXVpcmUoXCIuL0VuZW15SGVhZFwiKTtcbnZhciBEYXRhTWFuYWdlciA9IHJlcXVpcmUoXCIuL0RhdGFNYW5hZ2VyXCIpO1xudmFyIEhlcm9IYW5kQ2FyZCA9IHJlcXVpcmUoXCIuL0hlcm9IYW5kQ2FyZFwiKTtcbnZhciBFbmVteUhhbmRDYXJkID0gcmVxdWlyZShcIi4vRW5lbXlIYW5kQ2FyZFwiKTtcbnZhciBIZXJvRmVlID0gcmVxdWlyZShcIi4vSGVyb0ZlZVwiKTtcbnZhciBFbmVteUZlZSA9IHJlcXVpcmUoXCIuL0VuZW15RmVlXCIpO1xudmFyIEFJID0gcmVxdWlyZShcIi4vQUlcIik7XG52YXIgUmVtYWluQ2FyZCA9IHJlcXVpcmUoXCIuL1JlbWFpbkNhcmRcIik7XG5cbnZhciBIZXJvRmlnaHRlciA9IHJlcXVpcmUoXCIuL0hlcm9GaWdodGVyXCIpO1xuXG5mdW5jdGlvbiBVSU1hbmFnZXIoZ2FtZSkge1xuICAgIHRoaXMuYmFja2dyb3VuZE9iaiA9IG51bGw7IC8vIOiDjOaZr+WbvlxuICAgIHRoaXMudHVybk92ZXJCdXR0b24gPSBudWxsOyAvLyDlm57lkIjnu5PmnZ9cbiAgICB0aGlzLnNob3RDYXJkQnV0dG9uID0gbnVsbDsgLy8g5Ye654mM5oyJ6ZKuXG4gICAgdGhpcy5pbml0KGdhbWUpO1xufVxuXG5VSU1hbmFnZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihnYW1lKSB7XG4gICAgLy8g55Sf5oiQ6IOM5pmv5Zu+XG4gICAgdGhpcy5iYWNrZ3JvdW5kT2JqID0gdGhpcy5zZXRCYWNrR3JvdW5kKGdhbWUpO1xuICAgIC8vIOeUn+aIkOeOqeWutuiLsembhOWktOWDj1xuICAgIERhdGFNYW5hZ2VyLmhlcm9IZWFkID0gbmV3IEhlcm9IZWFkKGdhbWUsIFwiZmlnaHRlcl9oZXJvXCIsIDAsIGdhbWUud29ybGQuaGVpZ2h0IC0gMTQwKTtcblxuICAgIC8vIOeUn+aIkOeUteiEkeiLsembhOWktOWDj1xuICAgIERhdGFNYW5hZ2VyLmVuZW15SGVhZCA9IG5ldyBFbmVteUhlYWQoZ2FtZSwgXCJmaWdodGVyX2hlcm9cIiwgMCwgMCk7XG5cbiAgICAvLyDorr7nva7lm57lkIjnu5PmnZ/mjInpkq5cbiAgICBEYXRhTWFuYWdlci50dXJuT3ZlckJ1dHRvbiA9IHRoaXMuc2V0VHVybk92ZXJCdXR0b24oZ2FtZSk7XG4gICAgLy8g6K6+572u5pWM5Lq65omL54mMXG4gICAgRGF0YU1hbmFnZXIuZW5lbXlIYW5kQ2FyZCA9IG5ldyBFbmVteUhhbmRDYXJkKGdhbWUpO1xuXG4gICAgLy8g6K6+572u546p5a625omL54mMIFxuICAgIERhdGFNYW5hZ2VyLmhlcm9IYW5kQ2FyZCA9IG5ldyBIZXJvSGFuZENhcmQoZ2FtZSwgbnVsbCwgZ2FtZS53b3JsZC5oZWlnaHQgLSAxMjApO1xuXG4gICAgdGhpcy5zaG90Q2FyZEJ1dHRvbiA9IHRoaXMuc2V0U2hvdENhcmRCdXR0b24oZ2FtZSk7IC8vIOiuvue9ruWHuueJjOaMiemSrlxuXG4gICAgLy8g6Iux6ZuE6LS555So566h55CGXG4gICAgRGF0YU1hbmFnZXIuaGVyb0ZlZSA9IG5ldyBIZXJvRmVlKGdhbWUsIGdhbWUud29ybGQud2lkdGggLSAxMTAsIGdhbWUud29ybGQuY2VudGVyWSArIDQyKTsgXG4gICAgXG4gICAgLy8g5pWM5Lq66LS555So566h55CGXG4gICAgRGF0YU1hbmFnZXIuZW5lbXlGZWUgPSBuZXcgRW5lbXlGZWUoZ2FtZSwgZ2FtZS53b3JsZC53aWR0aCAtIDExMCwgZ2FtZS53b3JsZC5jZW50ZXJZIC0gOTApOyBcblxuICAgIC8vIOWIm+W7ukFJXG4gICAgRGF0YU1hbmFnZXIuQUkgPSBuZXcgQUkoKTsgXG5cbiAgICAvLyDliankvZnnmoTljaHniYzmj5DnpLpcbiAgICBEYXRhTWFuYWdlci5yZW1haW5DYXJkID0gbmV3IFJlbWFpbkNhcmQoZ2FtZSk7IFxuICAgIGNvbnNvbGUubG9nKERhdGFNYW5hZ2VyLnJlbWFpbkNhcmQpO1xufVxuXG4vLyDorr7nva7og4zmma9cblVJTWFuYWdlci5wcm90b3R5cGUuc2V0QmFja0dyb3VuZCA9IGZ1bmN0aW9uKGdhbWUpIHtcbiAgICB2YXIgYmFja2dyb3VuZCA9IG5ldyBCYWNrR3JvdW5kKGdhbWUpO1xuICAgIHJldHVybiBiYWNrZ3JvdW5kO1xufVxuXG4vLyDlm57lkIjnu5PmnZ9cblVJTWFuYWdlci5wcm90b3R5cGUuc2V0VHVybk92ZXJCdXR0b24gPSBmdW5jdGlvbihnYW1lKSB7XG4gICAgdmFyIGJ1dHRvbiA9IGdhbWUuYWRkLmltYWdlKGdhbWUud29ybGQud2lkdGggLSAxNTAsIGdhbWUud29ybGQuY2VudGVyWSAtIDMwLCBcImhlcm9fdHVybl9idXR0b25cIik7XG4gICAgYnV0dG9uLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgYnV0dG9uLmV2ZW50cy5vbklucHV0RG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChEYXRhTWFuYWdlci50dXJuID09IDApIHtcbiAgICAgICAgICAgIGJ1dHRvbi5sb2FkVGV4dHVyZShcImVuZW15X3R1cm5fYnV0dG9uXCIpO1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIudHVybiA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMpIHtcbiAgICAgICAgICAgIERhdGFNYW5hZ2VyLmVuZW15RmlnaHRlcnMuYXdha2VGaWdodGVyKCk7IC8vIOino+mZpOaVjOS6uumaj+S7juedoeecoOeKtuaAgVxuICAgICAgICB9XG5cbiAgICAgICAgRGF0YU1hbmFnZXIuZW5lbXlGZWUuZmVlT2JqLnNldFRleHQoRGF0YU1hbmFnZXIuZmVlICsgXCIvXCIgKyBEYXRhTWFuYWdlci5mZWUpO1xuICAgICAgICBEYXRhTWFuYWdlci5lbmVteUhhbmRDYXJkLmFkZENhcmQoZ2FtZSk7IC8vIOaVjOS6uuaRuOeJjFxuICAgICAgICBEYXRhTWFuYWdlci5yZW1haW5DYXJkLnJlZnJlc2goKTtcbiAgICAgICAgdmFyIHRpbWUgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIuQUkuc2hvdENhcmQoZ2FtZSk7XG4gICAgICAgICAgICBEYXRhTWFuYWdlci5BSS5jaG9pc2VBdHRhY2tUYXJnZXQoZ2FtZSk7IC8vIOeUteiEkUFJ5bGV5byA5pS75Ye7XG4gICAgICAgICAgICBpZiAoRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzKSB7XG4gICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzLmF3YWtlRmlnaHRlcigpOyAvLyDop6PpmaTnjqnlrrbpmo/ku47nnaHnnKDnirbmgIFcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5pu05paw546p5a626LS555So55qE5oOF5Ya1XG4gICAgICAgICAgICBpZiAoRGF0YU1hbmFnZXIuZmVlIDwgOSkge1xuICAgICAgICAgICAgICAgIERhdGFNYW5hZ2VyLmZlZSArPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvQ3VycmVudEZlZSA9IERhdGFNYW5hZ2VyLmZlZTtcbiAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9GZWUuZmVlT2JqLnNldFRleHQoRGF0YU1hbmFnZXIuZmVlICsgXCIvXCIgKyBEYXRhTWFuYWdlci5mZWUpO1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0hhbmRDYXJkLmFkZENhcmQoZ2FtZSk7IC8vIOeOqeWutuaRuOeJjFxuICAgICAgICAgICAgRGF0YU1hbmFnZXIucmVtYWluQ2FyZC5yZWZyZXNoKCk7XG5cbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lKTtcbiAgICAgICAgfSwgMTAwMCk7XG5cbiAgICB9KTtcbiAgICByZXR1cm4gYnV0dG9uO1xufVxuXG4vLyDlh7rniYzmjInpkq5cblVJTWFuYWdlci5wcm90b3R5cGUuc2V0U2hvdENhcmRCdXR0b24gPSBmdW5jdGlvbihnYW1lKSB7XG4gICAgdmFyIHNob3QgPSBnYW1lLmFkZC5pbWFnZSg4MCwgZ2FtZS53b3JsZC5jZW50ZXJZIC0gMTAsIFwic2hvdF9jYXJkXCIpO1xuICAgIHNob3QuYW5jaG9yLnNldCgwLjUpO1xuICAgIHNob3QuaW5wdXRFbmFibGVkID0gdHJ1ZTtcbiAgICBzaG90LmV2ZW50cy5vbklucHV0RG93bi5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChEYXRhTWFuYWdlci50dXJuICE9IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOaOp+WItueOqeWutuWcuuS4iueahOmaj+S7jlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKERhdGFNYW5hZ2VyLmhlcm9GaWdodGVycy5maWdodE9iai5sZW5ndGggPj0gNSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwi5oKo5Zy65LiK55qE6ZqP5LuO5bey57uP5Yiw6L6+5LqG5LiK6ZmQXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgICBpZiAoRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQpIHtcblxuICAgICAgICAgICAgLy8g5qOA5p+l6YCJ5oup5Y2h54mM55qE6LS555So5piv5ZCm6LaF5Ye65b2T5YmN5Y+v55So6LS555SoXG4gICAgICAgICAgICBpZiAoRGF0YU1hbmFnZXIuaGVyb0N1cnJlbnRGZWUgPCBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZC5jYXJkSW5mby5mZWUpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIuS9oOeahOi0ueeUqOS4jei2s++8jOaXoOazleS9v+eUqOi/meW8oOWNoeeJjFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIERhdGFNYW5hZ2VyLmhlcm9DdXJyZW50RmVlID0gRGF0YU1hbmFnZXIuaGVyb0N1cnJlbnRGZWUgLSBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZC5jYXJkSW5mby5mZWU7XG4gICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmVlLmZlZU9iai5zZXRUZXh0KERhdGFNYW5hZ2VyLmhlcm9DdXJyZW50RmVlICsgXCIvXCIgKyBEYXRhTWFuYWdlci5mZWUpO1xuXG4gICAgICAgICAgICBpZiAoRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvRmlnaHRlcnMgPSBuZXcgSGVyb0ZpZ2h0ZXIoZ2FtZSk7XG4gICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzLmJ1aWxkRmlnaHRlcihnYW1lLCBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZC5jYXJkSW5mby5IUCwgRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQuY2FyZEluZm8uYXR0YWNrLCBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZC5jYXJkSW5mby5jbk5hbWUsIERhdGFNYW5hZ2VyLmhlcm9DaG9pc2VDYXJkLmNhcmRJbmZvLmZpZ2h0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0ZpZ2h0ZXJzLmJ1aWxkRmlnaHRlcihnYW1lLCBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZC5jYXJkSW5mby5IUCwgRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQuY2FyZEluZm8uYXR0YWNrLCBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZC5jYXJkSW5mby5jbk5hbWUsIERhdGFNYW5hZ2VyLmhlcm9DaG9pc2VDYXJkLmNhcmRJbmZvLmZpZ2h0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0Nob2lzZUNhcmQuZGVzdHJveSgpO1xuICAgICAgICAgICAgRGF0YU1hbmFnZXIuaGVyb0hhbmRDYXJkLnJlTGlzdEhhbmRDYXJkKCk7XG4gICAgICAgICAgICBEYXRhTWFuYWdlci5oZXJvQ2hvaXNlQ2FyZCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgIH0pO1xuICAgIHJldHVybiBzaG90O1xufVxubW9kdWxlLmV4cG9ydHMgPSBVSU1hbmFnZXI7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvY2xhc3MvVUlNYW5hZ2VyLmpzXCIsXCIvbW9kdWxlcy9jbGFzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog5ri45oiP5Y2h54mM55qE6YWN572u5paH5Lu2XG4gKi9cblxudmFyIENhcmRDb25maWcgPSB7XG4gICAgXCJjYXJkX2luZm9cIjogW3tcbiAgICAgICAgXCJuYW1lXCI6IFwiZmlzaG1hbl9iYWJ5XCIsXG4gICAgICAgIFwiZmlnaHRcIjogXCJmaXNobWFuX2JhYnlfZmlnaHRcIixcbiAgICAgICAgXCJjbl9uYW1lXCI6IFwi6bG85Lq65a6d5a6dXCIsXG4gICAgICAgIFwiZmVlXCI6IDEsXG4gICAgICAgIFwiYXR0YWNrXCI6IDEsXG4gICAgICAgIFwiaHBcIjogMSxcbiAgICAgICAgXCJpZFwiOiAxXG4gICAgfSwge1xuICAgICAgICBcIm5hbWVcIjogXCJmcmVzaHdhdGVyX2Nyb2NvZGlsZVwiLFxuICAgICAgICBcImZpZ2h0XCI6IFwiZnJlc2h3YXRlcl9jcm9jb2RpbGVfZmlnaHRcIixcbiAgICAgICAgXCJjbl9uYW1lXCI6IFwi5reh5rC06bOEXCIsXG4gICAgICAgIFwiZmVlXCI6IDIsXG4gICAgICAgIFwiYXR0YWNrXCI6IDIsXG4gICAgICAgIFwiaHBcIjogMyxcbiAgICAgICAgXCJpZFwiOiAyXG4gICAgfSwge1xuICAgICAgICBcIm5hbWVcIjogXCJvZ3JlXCIsXG4gICAgICAgIFwiZmlnaHRcIjogXCJvZ3JlX2ZpZ2h0XCIsXG4gICAgICAgIFwiY25fbmFtZVwiOiBcIumjn+S6uumtlOazleW4iFwiLFxuICAgICAgICBcImZlZVwiOiA0LFxuICAgICAgICBcImF0dGFja1wiOiA0LFxuICAgICAgICBcImhwXCI6IDQsXG4gICAgICAgIFwiaWRcIjogM1xuICAgIH0sIHtcbiAgICAgICAgXCJuYW1lXCI6IFwiZGVhZF93aW5nXCIsXG4gICAgICAgIFwiZmlnaHRcIjogXCJkZWFkX3dpbmdfZmlnaHRcIixcbiAgICAgICAgXCJjbl9uYW1lXCI6IFwi5q275Lqh5LmL57+8XCIsXG4gICAgICAgIFwiZmVlXCI6IDksXG4gICAgICAgIFwiYXR0YWNrXCI6IDksXG4gICAgICAgIFwiaHBcIjogOSxcbiAgICAgICAgXCJpZFwiOiA0XG4gICAgfSx7XG4gICAgICAgIFwibmFtZVwiOiBcInJvc2VcIixcbiAgICAgICAgXCJmaWdodFwiOiBcInJvc2VfZmlnaHRcIixcbiAgICAgICAgXCJjbl9uYW1lXCI6IFwi5ouJ5qC857qz572X5pavXCIsXG4gICAgICAgIFwiZmVlXCI6IDgsXG4gICAgICAgIFwiYXR0YWNrXCI6IDgsXG4gICAgICAgIFwiaHBcIjogOCxcbiAgICAgICAgXCJpZFwiOiA1XG4gICAgfSx7XG4gICAgICAgIFwibmFtZVwiOiBcInZlbG9jaXJhcHRvclwiLFxuICAgICAgICBcImZpZ2h0XCI6IFwidmVsb2NpcmFwdG9yX2ZpZ2h0XCIsXG4gICAgICAgIFwiY25fbmFtZVwiOiBcIui2hee6p+i/heeMm+m+mVwiLFxuICAgICAgICBcImZlZVwiOiA0LFxuICAgICAgICBcImF0dGFja1wiOiA0LFxuICAgICAgICBcImhwXCI6IDUsXG4gICAgICAgIFwiaWRcIjogNlxuICAgIH1dLCAvLyDljaHniYznmoTnm7jlhbPkv6Hmga9cbiAgICBcImNhcmRMZW5ndGhcIjogMzAsIC8vIOWNoee7hOmVv+W6plxuICAgIFwiY2FyZEluaXRpYWxMZW5ndGhcIjogNCwgLy8g5Yid5aeL5YyW5omL54mM6ZW/5bqmXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FyZENvbmZpZztcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9jb25maWcvQ2FyZENvbmZpZy5qc1wiLFwiL21vZHVsZXMvY29uZmlnXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDpgInmi6nmuLjmiI/ljaHnu4TlnLrmma9cbiAqL1xuXG5mdW5jdGlvbiBDYXJkQ2hvaXNlU2NlbmUoZ2FtZSkge1xuICAgICB0aGlzLnByZWxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOWKoOi9veaPkOekuuWjsOaYjlxuICAgICAgICB2YXIgbG9hZFRleHQgPSBnYW1lLmFkZC50ZXh0KGdhbWUud29ybGQuY2VudGVyWCwgZ2FtZS53b3JsZC5jZW50ZXJZLCBcIkxvYWRpbmcgLi4uIFwiLCB7IGZpbGw6IFwiIzMzM1wiLCBcImZvbnRTaXplXCI6IFwiMjhwdFwiIH0pO1xuXG4gICAgICAgIC8vIOmUmueCueiuvue9rlxuICAgICAgICBsb2FkVGV4dC5hbmNob3Iuc2V0KDAuNSk7XG5cbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwiYmFja2dyb3VuZFwiLCBcIi4uLy4uL3Jlc291cmNlL2JhY2tncm91bmQucG5nXCIpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJjYXJkX2JhY2tcIiwgXCIuLi8uLi9yZXNvdXJjZS9jYXJkX2JhY2sucG5nXCIpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJlbmVteV90dXJuX2J1dHRvblwiLCBcIi4uLy4uL3Jlc291cmNlL2VuZW15X3R1cm5fYnV0dG9uLnBuZ1wiKTtcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwiZmVlXCIsIFwiLi4vLi4vcmVzb3VyY2UvZmVlLnBuZ1wiKTtcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwiaGVyb190dXJuX2J1dHRvblwiLCBcIi4uLy4uL3Jlc291cmNlL2hlcm9fdHVybl9idXR0b24ucG5nXCIpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJocF9iYWNrZ3JvdW5kXCIsIFwiLi4vLi4vcmVzb3VyY2UvaHBfYmFja2dyb3VuZC5wbmdcIik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcImF0dGFja19pY29uXCIsXCIuLi8uLi9yZXNvdXJjZS9hdHRhY2tfaWNvbi5wbmdcIik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcInNob3RfY2FyZFwiLFwiLi4vLi4vcmVzb3VyY2Uvc2hvdF9jYXJkLnBuZ1wiKTtcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwiZmlnaHRlcl9oZXJvXCIsIFwiLi4vLi4vcmVzb3VyY2UvZmlnaHRlcl9oZXJvLnBuZ1wiKTtcbiAgICAgICAgXG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcImRlYWRfd2luZ1wiLCBcIi4uLy4uL3Jlc291cmNlL2RlYWRfd2luZy5wbmdcIik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcImRlYWRfd2luZ19maWdodFwiLCBcIi4uLy4uL3Jlc291cmNlL2RlYWRfd2luZ19maWdodC5wbmdcIik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcImZpc2htYW5fYmFieVwiLCBcIi4uLy4uL3Jlc291cmNlL2Zpc2htYW5fYmFieS5wbmdcIik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcImZpc2htYW5fYmFieV9maWdodFwiLCBcIi4uLy4uL3Jlc291cmNlL2Zpc2htYW5fYmFieV9maWdodC5wbmdcIik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcImZyZXNod2F0ZXJfY3JvY29kaWxlXCIsIFwiLi4vLi4vcmVzb3VyY2UvZnJlc2h3YXRlcl9jcm9jb2RpbGUucG5nXCIpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJmcmVzaHdhdGVyX2Nyb2NvZGlsZV9maWdodFwiLCBcIi4uLy4uL3Jlc291cmNlL2ZyZXNod2F0ZXJfY3JvY29kaWxlX2ZpZ2h0LnBuZ1wiKTtcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwib2dyZVwiLCBcIi4uLy4uL3Jlc291cmNlL29ncmUucG5nXCIpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJvZ3JlX2ZpZ2h0XCIsIFwiLi4vLi4vcmVzb3VyY2Uvb2dyZV9maWdodC5wbmdcIik7XG4gICAgICAgIGdhbWUubG9hZC5pbWFnZShcInJvc2VcIixcIi4uLy4uL3Jlc291cmNlL3Jvc2UucG5nXCIpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJyb3NlX2ZpZ2h0XCIsXCIuLi8uLi9yZXNvdXJjZS9yb3NlX2ZpZ2h0LnBuZ1wiKTtcbiAgICAgICAgZ2FtZS5sb2FkLmltYWdlKFwidmVsb2NpcmFwdG9yXCIsXCIuLi8uLi9yZXNvdXJjZS92ZWxvY2lyYXB0b3IucG5nXCIpO1xuICAgICAgICBnYW1lLmxvYWQuaW1hZ2UoXCJ2ZWxvY2lyYXB0b3JfZmlnaHRcIixcIi4uLy4uL3Jlc291cmNlL3ZlbG9jaXJhcHRvcl9maWdodC5wbmdcIik7XG5cbiAgICAgICAgLy8g5Y2V5Liq5paH5Lu25Yqg6L295a6M55qE5Zue6LCDXG4gICAgICAgIGdhbWUubG9hZC5vbkZpbGVDb21wbGV0ZS5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbG9hZFRleHQuc2V0VGV4dChcIkxvYWRpbmcgLi4uIFwiICsgYXJndW1lbnRzWzBdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5omA5pyJ5paH5Lu25Yqg6L295a6M5oiQ5Zue6LCDXG4gICAgICAgIGdhbWUubG9hZC5vbkxvYWRDb21wbGV0ZS5hZGQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbG9hZFRleHQuZGVzdHJveSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN0eWxlID0ge1xuICAgICAgICAgICAgZmlsbDogXCIjMDAwXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogXCIzMnB0XCJcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdGFydEJ1dHRvbiA9IGdhbWUuYWRkLnRleHQoZ2FtZS53b3JsZC5jZW50ZXJYLCBnYW1lLndvcmxkLmNlbnRlclkgKyA3MCwgXCLov5nmmK/pgInmi6nljaHnu4TnmoTlnLrmma9cIiwgeyBmaWxsOiBcIiMzMzNcIiwgZm9udFNpemU6IFwiMjRwdFwiIH0pO1xuXG4gICAgICAgIHN0YXJ0QnV0dG9uLmFuY2hvci5zZXQoMC41KTtcblxuICAgICAgICBzdGFydEJ1dHRvbi5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgICBzdGFydEJ1dHRvbi5ldmVudHMub25JbnB1dERvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJHYW1lU2NlbmVcIik7XG4gICAgICAgIH0sdGhpcyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhcmRDaG9pc2VTY2VuZTtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbW9kdWxlcy9zY2VuZXMvQ2FyZENob2lzZVNjZW5lLmpzXCIsXCIvbW9kdWxlcy9zY2VuZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIOa4uOaIj+S4u+WcuuaZr1xuICovXG5cbnZhciBVSVBhbmVsID0gcmVxdWlyZShcIi4uL2NsYXNzL1VJTWFuYWdlclwiKTtcblxuZnVuY3Rpb24gR2FtZVNjZW5lKGdhbWUpIHtcbiAgIFxuICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDmt7vliqB1aeeVjOmdolxuICAgICAgICB2YXIgdWkgPSBuZXcgVUlQYW5lbChnYW1lKTtcblxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHYW1lU2NlbmU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvc2NlbmVzL0dhbWVTY2VuZS5qc1wiLFwiL21vZHVsZXMvc2NlbmVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiAg5ri45oiP57uT5p6c5Zy65pmvXG4gKi9cblxudmFyIERhdGFNYW5hZ2VyID0gcmVxdWlyZShcIi4uL2NsYXNzL0RhdGFNYW5hZ2VyXCIpO1xuXG5mdW5jdGlvbiBSZXN1bHRTY2VuZShnYW1lKSB7XG4gICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChEYXRhTWFuYWdlci5yZXN1bHQgPT0gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCLmlYzkurrog5zliKlcIik7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGdhbWUuYWRkLnRleHQoZ2FtZS53b3JsZC5jZW50ZXJYLCBnYW1lLndvcmxkLmNlbnRlclksIFwiWW91IExvc3NcIiwge1xuICAgICAgICAgICAgICAgIGZpbGw6IFwiIzAwMFwiLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRleHQuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGdhbWUuYWRkLnRleHQoZ2FtZS53b3JsZC5jZW50ZXJYLCBnYW1lLndvcmxkLmNlbnRlclksIFwiWW91IFdpblwiLCB7XG4gICAgICAgICAgICAgICAgZmlsbDogXCIjMDAwXCIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IFwiMzBwdFwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRleHQuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3VsdFNjZW5lO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9tb2R1bGVzL3NjZW5lcy9SZXN1bHRTY2VuZS5qc1wiLFwiL21vZHVsZXMvc2NlbmVzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyoqXG4gKiDmuLjmiI/lvIDlp4vlnLrmma8gXG4gKi9cblxuZnVuY3Rpb24gU3RhcnRTY2VuZShnYW1lKSB7XG5cbiAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coUGhhc2VyLlNjYWxlTWFuYWdlci5TSE9XX0FMTCk7XG4gICAgICAgIC8vIOe8qeaUvuaooeW8j1xuICAgICAgICAvLyBnYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XG4gICAgICAgIC8vIGdhbWUuc2NhbGUuc2NhbGVNb2RlLm1heEhlaWdodCA9XCI0MDBweFwiO1xuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICBmaWxsOiBcIiMwMDBcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiBcIjMycHRcIlxuICAgICAgICB9XG4gICAgICAgIHZhciB0ZXh0ID0gZ2FtZS5hZGQudGV4dChnYW1lLndvcmxkLmNlbnRlclgsIGdhbWUud29ybGQuY2VudGVyWSwgXCLmrKLov47mnaXliLDmiJHnmoTngonnn7PkvKDor7RcIiwgc3R5bGUpO1xuXG4gICAgICAgIHRleHQuYW5jaG9yLnNldCgwLjUpO1xuXG4gICAgICAgIHZhciBzdGFydEJ1dHRvbiA9IGdhbWUuYWRkLnRleHQoZ2FtZS53b3JsZC5jZW50ZXJYLCBnYW1lLndvcmxkLmNlbnRlclkgKyA3MCwgXCLlvIDlp4vmuLjmiI9cIiwgeyBmaWxsOiBcIiMzMzNcIiwgZm9udFNpemU6IFwiMjRwdFwiIH0pO1xuXG4gICAgICAgIHN0YXJ0QnV0dG9uLmFuY2hvci5zZXQoMC41KTtcblxuICAgICAgICBzdGFydEJ1dHRvbi5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgICBzdGFydEJ1dHRvbi5ldmVudHMub25JbnB1dERvd24uYWRkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJDYXJkQ2hvaXNlU2NlbmVcIik7XG4gICAgICAgIH0sdGhpcyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXJ0U2NlbmU7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21vZHVsZXMvc2NlbmVzL1N0YXJ0U2NlbmUuanNcIixcIi9tb2R1bGVzL3NjZW5lc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIkdjQlJ0Q1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL25vZGVfbW9kdWxlcy8uMC43LjBAcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvbm9kZV9tb2R1bGVzLy4wLjcuMEBwcm9jZXNzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9ub2RlX21vZHVsZXMvLjIuMS4xM0BidWZmZXIvaW5kZXguanNcIixcIi9ub2RlX21vZHVsZXMvLjIuMS4xM0BidWZmZXJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJHY0JSdENcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9ub2RlX21vZHVsZXMvLjIuMS4xM0BidWZmZXIvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvbm9kZV9tb2R1bGVzLy4yLjEuMTNAYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwiR2NCUnRDXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvbm9kZV9tb2R1bGVzLy4yLjEuMTNAYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvbm9kZV9tb2R1bGVzLy4yLjEuMTNAYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0XCIpIl19
