import { lib, _status, game, get, ui } from "noname";
const isJiubianQizhen$1 = (card) => get.cardtag(card, "qizhen") || get.cardtag(card, "gz_qizhen");
const cards = {
  junling1: {
    type: "junling",
    vanish: true,
    derivation: "guozhan"
  },
  junling2: {
    type: "junling",
    vanish: true,
    derivation: "guozhan"
  },
  junling3: {
    type: "junling",
    vanish: true,
    derivation: "guozhan"
  },
  junling4: {
    type: "junling",
    vanish: true,
    derivation: "guozhan"
  },
  junling5: {
    type: "junling",
    vanish: true,
    derivation: "guozhan"
  },
  junling6: {
    type: "junling",
    vanish: true,
    derivation: "guozhan"
  },
  zhulian_card: {
    cardimage: "wuzhong"
  },
  duoduo: {
    audio: true,
    fullskin: true,
    type: "trick",
    enable: true,
    selectTarget: 1,
    filterTarget(card, player2, target) {
      return target.identity !== "unknown";
    },
    async content(event2, trigger, player2) {
      const target = event2.target;
      await target.mayChangeVice(true);
      await target.damage();
    },
    ai: {
      basic: {
        order: 6,
        useful: 4,
        value: 6
      },
      result: {
        target(player2, target) {
          return get.damageEffect(target, player2, target);
        }
      },
      tag: {
        damage: 1
      }
    }
  },
  qiaoqu: {
    audio: true,
    fullskin: true,
    type: "trick",
    enable: true,
    selectTarget: [1, 2],
    filterTarget(card, player2, target) {
      return target !== player2;
    },
    async content(event2, trigger, player2) {
      const target = event2.target;
      const cards2 = target.getCards("h");
      if (!cards2.length) {
        return;
      }
      await target.showCards(cards2, `${get.translation(target)}展示了所有手牌`);
      const equips = cards2.filter((card) => get.type(card) === "equip" && get.owner(card) === target && get.position(card) === "h");
      if (equips.length) {
        await player2.gain({ cards: equips, source: target, animate: "giveAuto" });
      }
    },
    ai: {
      basic: {
        order: 7,
        useful: 4,
        value: 6
      },
      result: {
        target(player2, target) {
          return -target.countCards("h", (card) => get.type(card) === "equip");
        }
      },
      tag: {
        gain: 1,
        loseCard: 1
      }
    }
  },
  fendao: {
    audio: true,
    fullskin: true,
    type: "trick",
    enable: true,
    selectTarget: 1,
    filterTarget(card, player2, target) {
      if (lib.skill.gz_gouni?.subSkill?.effect?.blocksCard?.(card, player2, target)) {
        return false;
      }
      return target !== player2 && player2.identity !== "unknown" && player2.identity !== "ye" && target.identity === player2.identity;
    },
    async content(event2, trigger, player2) {
      const target = event2.target;
      await player2.draw(6);
      const result2 = await player2.chooseCard({ position: "h", selectCard: 3, forced: true, prompt: `交给${get.translation(target)}三张手牌` }).set("ai", (card) => 6 - get.value(card)).forResult();
      if (result2.cards?.length) {
        await player2.give(result2.cards, target);
      }
      if (get.is.jun(player2.name1) || get.zhu(player2) || player2.identity == "ye") {
        return;
      }
      const next = game.createEvent("changeGroupInGuozhan", false);
      next.player = player2;
      next.targets = [player2];
      next.fromGroups = [player2.identity];
      next.toGroup = "ye";
      next.setContent("emptyEvent");
      game.broadcastAll((player3) => {
        player3.identity = "ye";
        player3.identityShown = true;
        player3.setIdentity("ye");
        player3.node.identity.classList.remove("guessing");
      }, player2);
      game.addVideo("setIdentity", player2, "ye");
      game.log(player2, "成为了", "#g野心家");
      await next;
      game.tryResult();
    },
    recastable: true,
    ai: {
      basic: {
        order: 5,
        useful: 5,
        value: 5
      },
      result: {
        target(player2, target) {
          return get.attitude(player2, target) > 0 ? 2 : -1;
        }
      },
      tag: {
        draw: 6,
        gain: 1
      }
    }
  },
  tuqiong: {
    audio: true,
    fullskin: true,
    type: "trick",
    enable: true,
    selectTarget: 1,
    filterTarget(card, player2, target) {
      return target !== player2;
    },
    async content(event2, trigger, player2) {
      const target = event2.target;
      const cards2 = Array.from(ui.discardPile.childNodes).filter((card) => isJiubianQizhen$1(card));
      if (cards2.length) {
        const result2 = await player2.chooseButton({ createDialog: ["选择弃牌堆中的一张奇珍牌", cards2], forced: true }).set("ai", (button) => get.value(button.link, target)).forResult();
        if (result2.links?.length) {
          await target.chooseUseTarget({ card: result2.links[0], forced: true, nopopup: true });
        }
      }
      player2.addTempSkill("tuqiong_range", "phaseAfter");
      player2.markAuto("tuqiong_range", [target]);
    },
    ai: {
      basic: {
        order: 4,
        useful: 4,
        value: 5
      },
      result: {
        target(player2, target) {
          return get.attitude(player2, target) > 0 ? 1 : -0.5;
        }
      }
    }
  },
  gouwei: {
    audio: true,
    fullskin: true,
    type: "trick",
    enable: true,
    selectTarget: -1,
    filterTarget: true,
    async content(event2, trigger, player2) {
      const target = event2.target;
      const cards2 = Array.from(ui.discardPile.childNodes).filter((card) => isJiubianQizhen$1(card));
      if (!cards2.length) {
        await target.draw();
        return;
      }
      const result2 = await target.chooseButton({ createDialog: ["选择并使用弃牌堆中的一张奇珍牌", cards2], forced: true }).set("ai", (button) => get.value(button.link, target)).forResult();
      if (result2.links?.length) {
        await target.chooseUseTarget({ card: result2.links[0], forced: true, nopopup: true });
      }
    },
    ai: {
      basic: {
        order: 3,
        useful: 5,
        value: 5
      },
      result: {
        target(player2, target) {
          return 1;
        }
      },
      tag: {
        draw: 1
      }
    }
  },
  lveshan: {
    audio: "shan",
    fullskin: true,
    type: "basic",
    cardcolor: "red",
    notarget: true,
    nodelay: true,
    async content(event2, trigger, player2) {
      event2.result = "shaned";
      event2.getParent().delayx = false;
      await game.delay(0.5);
    },
    ai: {
      order: 3,
      basic: {
        useful: [7.5, 5.6, 2.4],
        value: [7.5, 5.6, 2.4]
      },
      result: { player: 1 },
      tag: {
        respondShan: 1
      }
    }
  },
  yangsuiqiang: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip1",
    distance: { attackFrom: -2 },
    ai: {
      basic: {
        equipValue: 4
      }
    },
    skills: ["yangsuiqiang_skill"]
  },
  yangsuiqiang_skill: {
    equipSkill: true,
    forced: true,
    trigger: { source: "damageSource" },
    filter(event2, player2) {
      return event2.card?.name == "sha" && event2.player?.isIn();
    },
    async content(event2, trigger, player2) {
      await trigger.player.damage({ nature: "fire", nosource: true });
    }
  },
  dunjiatianshu: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip5",
    ai: {
      basic: {
        equipValue: 5
      }
    },
    skills: ["dunjiatianshu_skill"]
  },
  dunjiatianshu_skill: {
    equipSkill: true,
    audio: true,
    enable: "phaseUse",
    usable: 2,
    async content(event2, trigger, player2) {
      await player2.changeVice().set("repeat", true);
    },
    ai: {
      order: 8,
      result: {
        player(player2) {
          return get.guozhanRank(player2.name2, player2) <= 3 ? 1 : 0.2;
        }
      }
    }
  },
  huohuanyi: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip2",
    ai: {
      basic: {
        equipValue: 6
      }
    },
    skills: ["huohuanyi_prevent", "huohuanyi_damage"]
  },
  huohuanyi_prevent: {
    equipSkill: true,
    forced: true,
    trigger: { player: "damageBegin4" },
    filter(event2, player2) {
      return event2.hasNature();
    },
    async content(event2, trigger, player2) {
      trigger.cancel();
    }
  },
  huohuanyi_damage: {
    equipSkill: true,
    ai: {
      effect: {
        target(card, player2, target) {
          if (card.name != "sha" || !target.countCards("h") || get.attitude(target, player2) >= 0) {
            return;
          }
          const hasTengjia = player2.getEquips("tengjia").length > 0 && !player2.hasSkillTag("unequip2");
          const cannotSave = player2.hp <= 1 && !player2.countCards("hs", (card2) => get.tag(card2, "save")) && !player2.hasSkillTag("save", true);
          if (hasTengjia || cannotSave) {
            return [0, 0, 0, -1];
          }
        }
      }
    },
    trigger: { target: "useCardToTargeted" },
    filter(event2, player2) {
      return event2.card?.name == "sha" && event2.player?.isIn() && player2.countCards("h") > 0;
    },
    async content(event2, trigger, player2) {
      const result2 = await player2.chooseToDiscard({ position: "h", prompt: `是否弃置一张手牌，对${get.translation(trigger.player)}造成1点火焰伤害？` }).set("ai", (card) => {
        if (get.damageEffect(trigger.player, player2, player2, "fire") <= 0) {
          return 0;
        }
        return 6 - get.value(card);
      }).forResult();
      if (result2.bool) {
        await trigger.player.damage({ nature: "fire" });
      }
    }
  },
  zhanshejian: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip1",
    distance: { attackFrom: -1 },
    ai: {
      basic: {
        equipValue: 5
      }
    },
    skills: ["zhanshejian_skill"]
  },
  zhanshejian_skill: {
    equipSkill: true,
    forced: true,
    trigger: { source: "damageSource" },
    filter(event2, player2) {
      return event2.card?.name == "sha";
    },
    async content(event2, trigger, player2) {
      if (player2.isDamaged()) {
        await player2.recover();
      }
      if (trigger.player?.isIn() && (get.is.jun(trigger.player.name1) || trigger.player.identity == "ye")) {
        await trigger.player.die(player2);
      }
    }
  },
  baiqilin: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip3",
    distance: { globalTo: 2 },
    ai: {
      basic: {
        equipValue: 5
      },
      tag: {
        damage: 1,
        thunderDamage: 1
      }
    },
    skills: ["baiqilin_skill"]
  },
  baiqilin_skill: {
    equipSkill: true,
    forced: true,
    trigger: { player: "useCardAfter" },
    filter(event2, player2) {
      return event2.card?.name == "baiqilin";
    },
    async content(event2, trigger, player2) {
      const hp = player2.hp;
      const targets = game.filterPlayer((current) => current.isIn() && current != player2 && current.hp > hp).sortBySeat();
      for (const target of targets) {
        if (target.isIn()) {
          await target.damage({ nature: "thunder", nosource: true });
        }
      }
    }
  },
  yingwubei: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip5",
    ai: {
      basic: {
        equipValue: 6
      }
    },
    skills: ["yingwubei_skill"]
  },
  yingwubei_skill: {
    equipSkill: true,
    audio: true,
    enable: "chooseToUse",
    usable: 9,
    hiddenCard(player2, name) {
      return name == "jiu" && player2.hasCard((card) => card.name == "yingwubei", "e");
    },
    filter(event2, player2) {
      if (!player2.hasCard((card) => card.name == "yingwubei", "e")) return false;
      return event2.filterCard(get.autoViewAs({ name: "jiu", isCard: true }, "unsure"), player2, event2);
    },
    viewAs(cards2, player2) {
      return { name: "jiu", isCard: true };
    },
    filterCard: () => false,
    selectCard: -1,
    prompt: "将牌堆顶的牌当【酒】使用",
    log: false,
    async precontent(event2, trigger, player2) {
      player2.logSkill("yingwubei_skill");
      const cards2 = get.cards();
      event2.result.card = get.autoViewAs({ name: "jiu", isCard: true }, cards2);
      event2.result.cards = cards2;
      game.cardsGotoOrdering(cards2);
    },
    ai: {
      order: 4,
      result: {
        player(player2) {
          return player2.hp <= 1 ? 1 : 0.4;
        }
      }
    }
  },
  jiuzhouding: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip5",
    async onEquip(event2, trigger, player2) {
      if (_status.mode == "jiubian" && !_status.overing && player2.hasCard((card) => card.name == "jiuzhouding", "e") && player2.countCards("e", (card) => isJiubianQizhen$1(card)) >= 4) {
        game.broadcastAll((id) => {
          game.winner_id = id;
        }, player2.playerid);
        game.log(player2, "因", "#y九州鼎", "达成胜利条件");
        game.checkResult();
      }
    },
    ai: {
      basic: {
        equipValue: 8
      }
    },
    skills: ["jiuzhouding_skill"]
  },
  jiuzhouding_skill: {
    equipSkill: true,
    forced: true,
    trigger: { player: "equipAfter" },
    filter(event2, player2) {
      return _status.mode == "jiubian" && !_status.overing && player2.hasCard((card) => card.name == "jiuzhouding", "e") && player2.countCards("e", (card) => isJiubianQizhen$1(card)) >= 4;
    },
    async content(event2, trigger, player2) {
      game.broadcastAll((id) => {
        game.winner_id = id;
      }, player2.playerid);
      game.log(player2, "因", "#y九州鼎", "达成胜利条件");
      game.checkResult();
    }
  },
  tianlu: {
    audio: true,
    fullskin: true,
    type: "equip",
    subtype: "equip4",
    distance: { globalFrom: -3 },
    ai: {
      basic: {
        equipValue: 7
      }
    },
    skills: ["tianlu_skill"]
  },
  tianlu_skill: {
    equipSkill: true,
    charlotte: true,
    forced: true,
    silent: true,
    trigger: {
      player: ["equipAfter", "showCharacterEnd", "changeGroupAfter"],
      global: ["gameStart", "showCharacterEnd", "changeGroupAfter", "dieAfter", "phaseBefore"]
    },
    lordSkillMap: {
      wei: "jianan",
      shu: "shouyue",
      wu: "jiahe",
      qun: "hongfa",
      jin: "gz_jiaping"
    },
    lordMarkMap: {
      jianan: "wuziliangjiangdao",
      shouyue: "wuhujiangdaqi",
      jiahe: "yuanjiangfenghuotu",
      hongfa: "huangjintianbingfu",
      gz_jiaping: "bahuangsishiling"
    },
    getLordSkill(player2) {
      if (_status.mode != "jiubian" || !player2?.isIn?.() || !player2.hasCard((card) => card.name == "tianlu", "e")) {
        return null;
      }
      const group = player2.identity;
      if (!group || group == "unknown" || group == "ye") {
        return null;
      }
      const skill = lib.skill.tianlu_skill.lordSkillMap[group];
      if (!skill || !lib.skill[skill]) {
        return null;
      }
      if (game.hasPlayer((current) => current != player2 && get.is.jun(current) && !current.isUnseen() && current.isFriendOf(player2))) {
        return null;
      }
      return skill;
    },
    isTianluZhu(player2, skill, group) {
      if (!skill || group && player2.identity != group) {
        return false;
      }
      return lib.skill.tianlu_skill.getLordSkill(player2) == skill;
    },
    clear(player2) {
      const skill = player2.storage.tianlu_skill;
      if (skill) {
        player2.removeAdditionalSkill("tianlu_skill");
        const mark = lib.skill.tianlu_skill.lordMarkMap[skill];
        if (mark) {
          player2.unmarkSkill(mark);
        }
        delete player2.storage.tianlu_skill;
      }
    },
    onremove(player2) {
      lib.skill.tianlu_skill.clear(player2);
    },
    filter(event2, player2) {
      return _status.mode == "jiubian";
    },
    async content(event2, trigger, player2) {
      const skill = lib.skill.tianlu_skill.getLordSkill(player2);
      const oldSkill = player2.storage.tianlu_skill;
      if (oldSkill == skill) {
        return;
      }
      if (oldSkill) {
        await player2.removeAdditionalSkills("tianlu_skill");
        const mark = lib.skill.tianlu_skill.lordMarkMap[oldSkill];
        if (mark) {
          player2.unmarkSkill(mark);
        }
        delete player2.storage.tianlu_skill;
      }
      if (skill) {
        player2.storage.tianlu_skill = skill;
        await player2.addAdditionalSkills("tianlu_skill", skill);
      }
    }
  }
};
const jiubianQizhenNames = ["zhanshejian", "yangsuiqiang", "huohuanyi", "baiqilin", "tianlu", "yingwubei", "dunjiatianshu", "jiuzhouding"];
const isJiubianQizhen = (card) => get.cardtag(card, "qizhen") || get.cardtag(card, "gz_qizhen");
const markJiubianQizhen = (card) => {
  if (!card || !jiubianQizhenNames.includes(card.name)) return;
  if (!Array.isArray(card.cardtags)) card.cardtags = [];
  if (!card.cardtags.includes("qizhen")) card.cardtags.push("qizhen");
  if (!card.cardtags.includes("gz_qizhen")) card.cardtags.push("gz_qizhen");
};
const syncJiubianQizhenTags = () => {
  for (const node of [ui.cardPile, ui.discardPile, ui.ordering]) {
    if (!node) continue;
    for (const card of Array.from(node.childNodes)) {
      markJiubianQizhen(card);
    }
  }
  for (const player2 of game.players || []) {
    for (const card of player2.getCards("hej")) {
      markJiubianQizhen(card);
    }
  }
};
const guozhanAozhanEvents = ["_aozhan_event_bujinzetui", "_aozhan_event_shengzheweiwang", "_aozhan_event_jili", "_aozhan_event_huoqi", "_aozhan_event_luoshi", "_aozhan_event_jianli"];
const initGuozhanAozhanEvents = () => {
  if (!Array.isArray(_status.gzAozhanEventDeck)) {
    _status.gzAozhanEventDeck = guozhanAozhanEvents.slice().randomSort();
  }
  if (!Array.isArray(_status.gzAozhanEventDiscard)) {
    _status.gzAozhanEventDiscard = [];
  }
};
const drawGuozhanAozhanEvent = () => {
  initGuozhanAozhanEvents();
  if (_status.gzAozhanCurrentEvent) {
    _status.gzAozhanEventDiscard.add(_status.gzAozhanCurrentEvent);
    delete _status.gzAozhanCurrentEvent;
  }
  if (!_status.gzAozhanEventDeck.length) {
    _status.gzAozhanEventDeck = _status.gzAozhanEventDiscard.slice().randomSort();
    _status.gzAozhanEventDiscard.length = 0;
  }
  if (!_status.gzAozhanEventDeck.length) {
    return null;
  }
  return _status.gzAozhanCurrentEvent = _status.gzAozhanEventDeck.shift();
};
const getGuozhanAozhanMode = () => {
  const config = _status.connectMode ? lib.configOL.aozhan : get.config("aozhan");
  if (config === true) return "normal";
  if (config === false || config == "off" || config == "disabled") return "off";
  return config || "off";
};
const isJiubianAozhan = () => _status._aozhan && _status._aozhanMode == "jiubian";
const isJiubianCardRuleActive = () => _status.mode == "jiubian" || isJiubianAozhan() || get.mode() == "guozhan" && jiubianQizhenNames.some((name) => lib.card[name]);
const isGuozhanAozhanEvent = (name) => isJiubianAozhan() && _status.gzAozhanCurrentEvent == name;
const guozhanZhenfaEnabled = () => game.players.length >= (_status.mode == "jiubian" ? 3 : 4);
const getGuozhanAozhanTreasureCards = () => {
  const cards2 = [];
  for (let i = 0; i < ui.discardPile.childElementCount; i++) {
    const card = ui.discardPile.childNodes[i];
    if (isJiubianQizhen(card)) {
      cards2.push(card);
    }
  }
  return cards2;
};
const guozhanSkills = {
  //马云騄
  gzfengpo: {
    audio: "fengpo",
    trigger: { player: "useCardToPlayered" },
    filter(event2, player2) {
      if (event2.targets.length !== 1 || !["sha", "juedou"].includes(event2.card.name)) {
        return false;
      }
      const evtx = event2.getParent();
      return !player2.hasHistory(
        "useCard",
        (evt) => {
          return evt !== evtx && evt.card.name === event2.card.name;
        },
        evtx
      );
    },
    async cost(event2, trigger, player2) {
      const result2 = await player2.chooseControl({ controls: ["摸牌", "加伤", "cancel2"], prompt: get.prompt2(event2.skill, trigger.target) }).forResult();
      if (result2.control !== "cancel2") {
        event2.result = {
          bool: true,
          cost_data: result2.index
        };
      }
    },
    logTarget: "target",
    async content(event2, trigger, player2) {
      const {
        cost_data: index,
        targets: [target]
      } = event2;
      const nd = target.countCards("h", { suit: "diamond" });
      if (event2.cost_data === "摸牌") {
        await player2.draw(nd);
      } else {
        let evt = trigger.getParent();
        evt.baseDamage ??= 1;
        evt.baseDamage += nd;
      }
    }
  },
  //OL许攸
  gz_ol_chenglve: {
    audio: "gzchenglve",
    trigger: {
      global: "phaseUseBegin"
    },
    filter(event2, player2) {
      if (!player2.hasCards("he")) {
        return false;
      }
      return event2.player.isFriendOf(player2);
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCard({
        prompt: get.prompt2(event2.skill),
        position: "he",
        ai: (card) => {
          const { player: player3, att } = get.event();
          if (att <= 0) {
            return 0;
          }
          return 7 - get.value(card);
        }
      }).set("att", get.attitude(player2, trigger.player)).forResult();
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      const {
        targets: [target],
        cards: cards2
      } = event2;
      await player2.lose({ cards: cards2, position: ui.cardPile, insert_card: true });
      const result2 = await target.chooseToDiscard({
        position: "he",
        selectCard: 2,
        prompt: `弃置两张牌，你使用同花色的牌无距离次数限制；或点取消选择是否与${get.translation(player2)}副将易位`,
        ai: (card) => {
          const { player: player3, resultx } = get.event();
          if (!resultx) {
            return 0;
          }
          const suit = get.suit(card, player3);
          if (resultx.includes(suit)) {
            if (!player3.hasValueTarget(card, false, false)) {
              return 16 - get.value(card);
            }
            return 5 - get.value(card);
          }
          return 7 - get.value(card);
        }
      }).set(
        "resultx",
        (() => {
          const cards3 = target.getCards("h").filter((i) => {
            return get.tag(i, "damage") && get.type(i) !== "delay" && target.hasValueTarget(i, false, false);
          });
          let map = {};
          for (const card of cards3) {
            let suit = get.suit(card, target);
            if (typeof map[suit] !== "number") {
              map[suit] = 0;
            }
            map[suit]++;
          }
          const list = Object.keys(map).map((suit) => [suit, map[suit]]).sort((a, b) => b[1] - a[1]).slice(0, 2);
          if (!list.length) {
            return false;
          }
          const num = list.reduce((sum, arr) => sum + arr[1], 0);
          if (target.countCards("h") / 2 <= num && num >= 2) {
            return list.map((arr) => arr[0]);
          }
          return false;
        })()
      ).forResult();
      if (result2?.bool && result2.cards?.length) {
        const suits = result2.cards.map((card) => get.suit(card, target)).toUniqued();
        const skill = `${event2.name}_effect`;
        target.addTempSkill(skill);
        target.markAuto(skill, suits);
        target.addTip(
          skill,
          `成略${target.getStorage(skill).map((suit) => get.translation(suit)).join("")}`
        );
      } else {
        const result3 = target === player2 ? {
          bool: false
        } : await target.chooseBool({ prompt: `是否与${get.translation(player2)}交换副将？` }).set("choice", Math.random() > 0.5).forResult();
        if (result3.bool) {
          await player2.transCharacter(target);
        }
        const targetx = result3.bool ? target : player2;
        if (targetx?.isIn()) {
          await targetx.draw();
        }
      }
    },
    subSkill: {
      effect: {
        charlotte: true,
        onremove(player2, skill) {
          delete player2.storage[skill];
          player2.removeTip(skill);
        },
        mod: {
          cardUsable(card, player2) {
            const suit = get.suit(card);
            if (suit === "unsure" || player2.getStorage("gz_ol_chenglve_effect").includes(suit)) {
              return Infinity;
            }
          },
          targetInRange(card, player2) {
            const suit = get.suit(card);
            if (suit === "unsure" || player2.getStorage("gz_ol_chenglve_effect").includes(suit)) {
              return true;
            }
          }
        },
        marktext: "略",
        intro: {
          content: "本回合使用$花色的牌无距离和次数限制"
        }
      }
    }
  },
  gz_ol_fushi: {
    trigger: {
      global: ["phaseBegin", "showCharacterEnd", "hideCharacterEnd", "dieAfter", "changeGroupInGuozhan", "diaohulishanAfter"]
    },
    filter(event2, player2) {
      return player2.hasSkill("gz_ol_fushi");
    },
    silent: true,
    forced: true,
    direct: true,
    init(player2, skill) {
      const list = [];
      const previous = player2.getPrevious();
      const next = player2.getNext();
      if (previous?.isIn() && previous.identity === "qun") {
        list.add("gz_ol_zezhu");
      }
      if (next?.isIn() && next.identity === "wei") {
        list.add("gz_ol_chenggong");
      }
      if (list.length) {
        player2.addAdditionalSkill(skill, list);
      } else {
        player2.removeAdditionalSkill(skill);
      }
    },
    onremove(player2, skill) {
      player2.removeAdditionalSkill(skill);
    },
    async content(event2, trigger, player2) {
      get.info(event2.name).init(player2, event2.name);
    },
    derivation: ["gz_ol_zezhu", "gz_ol_chenggong"]
  },
  gz_ol_zezhu: {
    audio: "gzshicai",
    enable: "phaseUse",
    usable: 1,
    filterTarget(card, player2, target) {
      if (target !== player2.getNext() && target !== player2.getPrevious()) {
        return false;
      }
      return target.hasGainableCards(player2, "he");
    },
    selectTarget: -1,
    filter(event2, player2) {
      return game.hasPlayer((current) => get.info("gz_ol_zezhu").filterTarget(null, player2, current));
    },
    async content(event2, trigger, player2) {
      await player2.gainPlayerCard({ target: event2.target, position: "he", forced: true });
    },
    async contentAfter(event2, trigger, player2) {
      for (const target of event2.targets) {
        if (player2.hasGainableCards(target, "he")) {
          await player2.chooseToGive(target, "he", true);
        }
      }
    },
    ai: {
      order: 10,
      result: {
        player: 1
      }
    }
  },
  gz_ol_chenggong: {
    audio: "chenggong",
    trigger: {
      global: "useCardToPlayered"
    },
    filter(event2, player2) {
      if (event2.player !== player2.getNext() && event2.player !== player2.getPrevious()) {
        return false;
      }
      return event2.isFirstTarget && event2.targets?.length > 1;
    },
    usable: 1,
    logTarget: "player",
    check(event2, player2) {
      const att = get.attitude(player2, event2.player);
      const targets = event2.targets.filter((target) => target.hasDiscardableCards(event2.player, "he"));
      if (!targets.length) {
        return true;
      }
      if (att > 0) {
        return targets.some((target) => get.effect(target, { name: "guohe_copy2" }, event2.player, player2) > 0);
      }
      return targets.every((target) => get.effect(target, { name: "guohe_copy2" }, event2.player, player2) > 0);
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      await player2.draw();
      const targets = trigger.targets.filter((current) => current.hasDiscardableCards(target, "he"));
      if (!targets?.length) {
        return;
      }
      const result2 = await target.chooseTarget({
        prompt: "逞功：弃置一名目标角色一张牌",
        filterTarget: (card, player3, target2) => {
          return get.event().targetx.includes(target2);
        },
        forced: true,
        ai: (target2) => {
          const player3 = get.player();
          return get.effect(target2, { name: "guohe_copy2" }, player3, player3);
        }
      }).set("targetx", targets).forResult();
      if (result2?.bool && result2.targets?.length) {
        const func = async (targetx) => {
          target.line(targetx);
          await target.discardPlayerCard({ target: targetx, position: "he", forced: true });
        };
        await game.doAsyncInOrder(result2.targets, func);
      }
    }
  },
  //OL程普
  gz_ol_daohuo: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    filterCard(card) {
      return ui.selected.cards.every((cardx) => get.color(cardx) !== get.color(card));
    },
    complexCard: true,
    selectCard: 2,
    position: "hes",
    viewAs: {
      name: "sha",
      nature: "fire"
    },
    viewAsFilter(player2) {
      return player2.getCards("hes").map((card) => get.color(card)).toUniqued().length > 1;
    },
    prompt: "将两张颜色不同的牌当火杀使用",
    check(card) {
      return 6 - get.value(card);
    },
    async precontent(event2, trigger, player2) {
      player2.when("useCardToPlayered").filter((evt) => evt.getParent(2) === event2.getParent() && evt.getParent().targets.length === 1).step(async (event3, trigger2, player3) => {
        const target = trigger2.target;
        const bool1 = !player3.hasMark("yinyang_mark");
        const bool2 = game.hasPlayer((current) => current !== target && current.isFriendOf(target));
        if (!bool1 && !bool2) {
          return;
        }
        const result2 = await target.chooseButton({
          createDialog: [
            "蹈火：选择一项",
            [
              [
                ["yinyang", `令${get.translation(player3)}获得1枚“阴阳鱼”标记`],
                ["change", `令${get.translation(player3)}选择一名与你同势力的其他角色，你与该角色副将易位`]
              ],
              "textbutton"
            ]
          ],
          forced: true,
          filterButton: (button) => {
            const { bool1: bool12, bool2: bool22 } = get.event();
            if (button.link === "yinyang") {
              return bool12;
            }
            return bool22;
          },
          ai: (button) => {
            return Math.random();
          }
        }).set("bool1", bool1).set("bool2", bool2).forResult();
        if (!result2?.bool || !result2.links?.length) {
          return;
        }
        if (result2.links.includes("yinyang")) {
          if (!player3.countMark("yinyang_mark")) {
            player3.addMark("yinyang_mark", 1, false);
            game.log(player3, "获得了一个", "#g“阴阳鱼”");
          }
        }
        if (result2.links.includes("change")) {
          const targets = game.filterPlayer((current) => current !== target && current.isFriendOf(target));
          if (!targets?.length) {
            return;
          }
          const result22 = await player3.chooseTarget({
            prompt: `选择一名角色，令其与${get.translation(target)}副将易位`,
            filterTarget: (card, player4, target2) => {
              return get.event().targetx.includes(target2);
            },
            forced: true,
            ai: () => Math.random()
          }).set("targetx", targets).forResult();
          if (result22?.bool && result22.targets?.length) {
            await target.transCharacter(result22.targets[0]);
          }
        }
      });
    }
  },
  gz_ol_chunlao: {
    audio: "chunlao",
    global: "gz_ol_chunlao_jiu",
    subSkill: {
      jiu: {
        enable: "chooseToUse",
        filter(event2, player2) {
          if (!game.hasPlayer((current) => current.isFriendOf(player2) && current.hasSkill("gz_ol_chunlao"))) {
            return false;
          }
          if (!player2.hasMark("yinyang_mark") && !player2.hasMark("zhulianbihe_mark")) {
            return false;
          }
          const jiu = new lib.element.VCard({ name: "jiu", isCard: true });
          return event2.filterCard(jiu, player2, event2);
        },
        hiddenCard(player2, name) {
          if (name !== "jiu" || !game.hasPlayer((current) => current.isFriendOf(player2) && current.hasSkill("gz_ol_chunlao"))) {
            return false;
          }
          return player2.hasMark("yinyang_mark") || player2.hasMark("zhulianbihe_mark");
        },
        chooseButton: {
          dialog(event2, player2) {
            return ui.create.dialog("###醇醪###弃置一枚“阴阳鱼”或“珠联璧合”，视为使用一张【酒】");
          },
          chooseControl(event2, player2) {
            const list = [];
            if (player2.hasMark("zhulianbihe_mark")) {
              list.push("珠联璧合");
            }
            if (player2.hasMark("yinyang_mark")) {
              list.push("阴阳鱼");
            }
            list.push("cancel2");
            return list;
          },
          check(button) {
            const player2 = get.player();
            const card = new lib.element.VCard({ name: "jiu", isCard: true });
            if (!player2.getUseValue(card)) {
              return "cancel2";
            }
            if (player2.hasMark("yinyang_mark")) {
              return "阴阳鱼";
            }
            if (player2.hasMark("zhulianbihe_mark")) {
              if (player2.getUseValue("tao") < player2.getUseValue("jiu")) {
                return "珠联璧合";
              }
            }
            return "cancel2";
          },
          backup(result2, player2) {
            return {
              link: result2.control,
              filterCard: () => false,
              selectCard: -1,
              viewAs: {
                name: "jiu",
                isCard: true
              },
              async precontent(event2, trigger, player3) {
                delete event2.result.skill;
                player3.logSkill("gz_ol_chunlao");
                const map = {
                  阴阳鱼: "yinyang_mark",
                  珠联璧合: "zhulianbihe_mark"
                };
                player3.removeMark(map[get.info("gz_ol_chunlao_jiu_backup").link], 1, false);
              }
            };
          },
          prompt(result2, player2) {
            return `移去一个${result2.control}标记，视为使用一张【酒】`;
          }
        },
        ai: {
          order(item, player2) {
            return get.order({ name: "jiu" }, player2) + 0.1;
          },
          result: {
            player: 1
          }
        }
      }
    }
  },
  //OL吴懿
  gz_ol_benxi: {
    audio: "benxi",
    trigger: {
      player: "useCard"
    },
    filter(event2, player2) {
      return player2 === _status.currentPhase;
    },
    forced: true,
    async content(event2, trigger, player2) {
      const name = `${event2.name}_effect`;
      player2.addTempSkill(name);
      player2.addMark(name, 1, false);
    },
    subSkill: {
      effect: {
        charlotte: true,
        onremove: true,
        intro: {
          markcount(storage, player2) {
            return -1 * (storage || 0);
          },
          content: "计算与其他角色距离-#"
        },
        mod: {
          globalFrom(from, to, distance) {
            return distance - from.countMark("gz_ol_benxi_effect");
          }
        }
      }
    }
  },
  gz_ol_zhuanzheng: {
    audio: 2,
    enable: "phaseUse",
    filter(event2, player2) {
      if (player2.countMark("gz_ol_zhuanzheng_used") >= 1 + player2.countMark("gz_ol_zhuanzheng_more")) {
        return false;
      }
      return game.hasPlayer((current) => player2.isFriendOf(current));
    },
    filterTarget(card, player2, target) {
      return player2.isFriendOf(target) && get.distance(player2, target) <= 1;
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      const name = `${event2.name}_used`;
      player2.addTempSkill(name, { global: "roundStart" });
      player2.addMark(name, 1, false);
      let num = -1;
      let left = player2;
      let right = player2;
      while (target?.isIn()) {
        if (left === target || right === target) {
          break;
        }
        left = left.getPrevious();
        right = right.getNext();
        num++;
      }
      await player2.draw(Math.max(1, num));
      if (target !== player2) {
        const result2 = await target.chooseBool({ prompt: `是否与${get.translation(player2)}交换副将？` }).set("choice", Math.random() > 0.5).forResult();
        if (result2.bool) {
          player2.addTempSkill(`${event2.name}_more`, { global: "roundStart" });
          player2.addMark(`${event2.name}_more`, 1, false);
          await player2.transCharacter(target);
        }
      }
    },
    subSkill: {
      used: {
        charlotte: true,
        onremove: true
      },
      more: {
        charlotte: true,
        onremove: true
      }
    }
  },
  //手杀陆逊
  gz_mb_qianxun: {
    audio: "sbqianxun",
    trigger: {
      target: "useCardToTarget"
    },
    filter(event2, player2) {
      return get.type2(event2.card) === "trick" && event2.targets?.length === 1 && player2.countExpansions("gz_mb_qianxun") < 3;
    },
    forced: true,
    async content(event2, trigger, player2) {
      trigger.getParent().all_excluded = true;
      trigger.getParent().targets.length = 0;
      trigger.untrigger();
      const cards2 = trigger.cards?.filterInD("od");
      if (cards2?.length) {
        const next = player2.addToExpansion({ cards: cards2, animate: "gain2" });
        next.gaintag.add(event2.name);
        await next;
      }
    },
    marktext: "节",
    intro: {
      name: "节",
      markcount: "expansion",
      content: "expansion"
    },
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    },
    ai: {
      effect: {
        target(card, player2, target, current) {
          if (!card?.name || target.countExpansions("gz_mb_qianxun") >= 3) {
            return;
          }
          const info = lib.card[card.name];
          if (!info || !["trick", "delay"].includes(info.type)) {
            return;
          }
          if (info.notarget) {
            return;
          }
          const select = info.selectTarget;
          let range;
          if (select == null) {
            range = [1, 1];
          } else if (typeof select === "number") {
            range = [select, select];
          } else if (get.itemtype(select) === "select") {
            range = select;
          } else if (typeof select === "function") {
            range = select(card, player2);
            if (typeof range === "number") {
              range = [range, range];
            }
          }
          game.checkMod(card, player2, range, "selectTarget", player2);
          if ((() => {
            if (range[1] !== -1) {
              return !ui.selected.targets.length;
            }
            return !game.hasPlayer((current2) => current2 !== target && player2.canUse(card, current2));
          })()) {
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  gz_mb_duoshi: {
    audio: "sblianying",
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      if (player2.hasCards("hs", (card) => {
        if (get.color(card) !== "red") {
          return false;
        }
        const viewAs = get.autoViewAs({ name: "yiyi" }, [card]);
        return event2.filterCard(viewAs, player2, event2);
      })) {
        return true;
      }
      if (player2.countExpansions("gz_mb_qianxun") < 3) {
        return false;
      }
      return get.inpileVCardList((info) => {
        if (!["basic", "trick"].includes(info[0])) {
          return false;
        }
        const card = new lib.element.VCard({ name: info[2], nature: info[3], isCard: true });
        return get.tag(card, "fireDamage") && event2.filterCard(card, player2, event2);
      }).length > 0;
    },
    chooseButton: {
      dialog(event2, player2) {
        const list = get.inpileVCardList((info) => {
          if (!["basic", "trick"].includes(info[0])) {
            return false;
          }
          if (info[2] === "yiyi") {
            return player2.countCards("hs", (card2) => {
              if (get.color(card2) !== "red") {
                return false;
              }
              const viewAs = get.autoViewAs({ name: "yiyi" }, [card2]);
              return event2.filterCard(viewAs, player2, event2);
            });
          }
          if (player2.countExpansions("gz_mb_qianxun") < 3) {
            return false;
          }
          const card = new lib.element.VCard({ name: info[2], nature: info[3], isCard: true });
          return get.tag(card, "fireDamage") && event2.filterCard(card, player2, event2);
        });
        let dialog = ui.create.dialog("度势", [list, "vcard"], "hidden");
        if (list.length === 1 && list[0][2] === "yiyi") {
          dialog.direct = true;
        }
        return dialog;
      },
      check(button) {
        const player2 = get.player();
        const card = get.autoViewAs({ name: button.link[2], nature: button.link[3] }, "unsure");
        return player2.getUseValue(card);
      },
      backup(links, player2) {
        const [_1, _2, name, nature] = links[0];
        let backup = get.copy(get.info(`gz_mb_duoshi_${name === "yiyi" ? "yiyi" : "fire"}`));
        if (name !== "yiyi") {
          backup.viewAs = {
            name,
            nature,
            isCard: true
          };
        }
        return backup;
      },
      prompt(links, player2) {
        if (links[0][2] === "yiyi") {
          return "###度势###将一张红色手牌当作【以逸待劳】使用";
        }
        return `###度势###移去三张“节”，视为使用一张${get.translation(links[0][3] || "")}${get.translation(links[0][2])}`;
      }
    },
    ai: {
      order() {
        return get.order({ name: "yiyi" }) + 0.1;
      },
      result: {
        player: 1
      }
    },
    subSkill: {
      backup: {},
      yiyi: {
        audio: "gz_mb_duoshi",
        logAudio: () => "sblianying2.mp3",
        viewAs: {
          name: "yiyi"
        },
        filterCard: {
          color: "red"
        },
        position: "hs",
        check(card) {
          return 5 - get.value(card);
        }
      },
      fire: {
        audio: "gz_mb_duoshi",
        logAudio: () => "sblianying1.mp3",
        viewAs: {
          name: "sha",
          nature: "fire",
          isCard: true
        },
        filterCard: () => false,
        selectCard: -1,
        async precontent(event2, trigger, player2) {
          const cards2 = player2.getExpansions("gz_mb_qianxun");
          const result2 = cards2.length > 3 ? await player2.chooseButton({ createDialog: ["移去三张“节”", cards2], selectButton: 3, forced: true }).forResult() : { bool: true, links: cards2 };
          if (result2?.bool && result2.links?.length) {
            await player2.loseToDiscardpile({ cards: result2.links });
          }
        }
      }
    }
  },
  //OL钟会
  gz_ol_quanji: {
    audio: "quanji",
    trigger: {
      player: "damageEnd"
    },
    frequent: true,
    filter(event2, player2) {
      return event2.num > 0;
    },
    async content(event2, trigger, player2) {
      await player2.draw();
      if (!player2.hasCards("h")) {
        return;
      }
      const result2 = await player2.chooseCard({ prompt: "将一张牌置于武将牌上作为“权”", position: "he", forced: true }).forResult();
      if (result2?.bool && result2?.cards?.length) {
        const next = player2.addToExpansion({ cards: result2.cards, source: player2, animate: "give" });
        next.gaintag.add(event2.name);
        await next;
      }
    },
    intro: {
      content: "expansion",
      markcount: "expansion"
    },
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    },
    ai: {
      maixie: true,
      maixie_hp: true,
      threaten: 0.8,
      effect: {
        target(card, player2, target) {
          if (get.tag(card, "damage")) {
            if (player2.hasSkillTag("jueqing", false, target)) {
              return [1, -2];
            }
            if (!target.hasFriend()) {
              return;
            }
            if (target.hp >= 4) {
              return [0.5, get.tag(card, "damage") * 2];
            }
            if (!target.hasSkill("paiyi") && target.hp > 1) {
              return [0.5, get.tag(card, "damage") * 1.5];
            }
            if (target.hp === 3) {
              return [0.5, get.tag(card, "damage") * 1.5];
            }
            if (target.hp === 2) {
              return [1, get.tag(card, "damage") * 0.5];
            }
          }
        }
      }
    }
  },
  gz_ol_paiyi: {
    audio: "paiyi",
    mainSkill: true,
    init(player2) {
      if (player2.checkMainSkill("gz_ol_paiyi")) {
        player2.removeMaxHp();
      }
    },
    trigger: {
      player: "phaseDiscardEnd"
    },
    filter(event2, player2) {
      const cards2 = [];
      player2.getHistory("lose", (evt) => {
        if (evt.type === "discard" && evt.getParent(event2.name) === event2) {
          cards2.addArray(evt.cards2);
        }
      });
      return cards2.length < player2.countExpansions("gz_ol_quanji");
    },
    async cost(event2, trigger, player2) {
      const result2 = await player2.chooseButtonTarget({
        createDialog: [get.prompt(event2.skill), player2.getExpansions("gz_ol_quanji")],
        selectButton: [1, Infinity],
        filterTarget: true,
        allowChooseAll: true,
        ai1(card) {
          return get.value(card);
        },
        ai2(target) {
          const cards2 = ui.selected.cards;
          if (!cards2?.length) {
            return 0;
          }
          const vals = cards2.reduce((sum, card) => {
            return sum + get.value(card, target);
          }, 0);
          if (target !== player2 && target.countCards("h") + cards2.length > player2.countCards("h")) {
            return vals + get.damageEffect(target, player2, player2);
          }
          return vals;
        }
      }).forResult();
      if (result2.bool) {
        event2.result = {
          bool: true,
          cards: result2.links,
          targets: result2.targets
        };
      }
    },
    async content(event2, trigger, player2) {
      const {
        cards: cards2,
        targets: [target]
      } = event2;
      await target.gain({ cards: cards2, animate: "give", source: player2 });
      if (target.countCards("h") > player2.countCards("h")) {
        await target.damage();
      }
    }
  },
  gz_yaopan: {
    audio: 2,
    viceSkill: true,
    init(player2) {
      player2.checkViceSkill("gz_yaopan");
    },
    trigger: {
      global: "phaseEnd"
    },
    filter(event2, player2) {
      const targets = game.getGlobalHistory("everything", (evt) => {
        if (evt.name !== "dying" || evt.player === player2) {
          return false;
        }
        return (evt.reason ?? {}).source === player2;
      }).map((evt) => evt.player);
      return targets.some((target) => !player2.getStorage("gz_yaopan_used").includes(target));
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2(event2.skill),
        filterTarget: (card, player3, target) => {
          return player3 === target || player3.isFriendOf(target);
        },
        ai: (target) => {
          return get.attitude(get.player(), target);
        }
      }).forResult();
    },
    async content(event2, trigger, player2) {
      player2.addSkill("gz_yaopan_used");
      player2.markAuto(
        "gz_yaopan_used",
        game.getGlobalHistory("everything", (evt) => {
          if (evt.name !== "dying" || evt.player === player2) {
            return false;
          }
          return (evt.reason ?? {}).source === player2;
        }).map((evt) => evt.player)
      );
      const target = event2.targets[0];
      const result2 = target === player2 ? {
        bool: false
      } : await target.chooseBool({ prompt: `是否与${get.translation(player2)}交换副将？` }).set("choice", Math.random() > 0.5).forResult();
      if (result2.bool) {
        await player2.transCharacter(target);
      }
      const targetx = result2.bool ? target : player2;
      const cards2 = targetx?.getExpansions("gz_ol_quanji");
      if (cards2.length) {
        if (targetx) {
          await targetx.gain({ cards: cards2, animate: "give", source: player2 });
        } else {
          await player2.loseToDiscardpile({ cards: cards2 });
        }
      }
      if (targetx) {
        let next = targetx.insertPhase();
        next.phaseList = ["phaseUse"];
      }
    },
    subSkill: {
      used: {
        charlotte: true,
        onremove: true
      }
    }
  },
  //国战典藏2024-2025，启动！
  //国战限定
  //卑弥呼
  gzguishu: {
    audio: "bmcanshi",
    enable: "phaseUse",
    filter(event2, player2) {
      return player2.hasCards("hs", { suit: "spade" });
    },
    chooseButton: {
      dialog(event2, player2) {
        const list = ["yuanjiao", "zhibi"].map((name) => ["锦囊", "", name]);
        return ui.create.dialog("鬼术", [list, "vcard"]);
      },
      filter(button, player2) {
        const name = button.link[2];
        if (player2.storage.gzguishu_used === 1 && name === "yuanjiao") {
          return false;
        }
        if (player2.storage.gzguishu_used === 2 && name === "zhibi") {
          return false;
        }
        return lib.filter.filterCard({ name }, player2, _status.event.getParent());
      },
      check(button) {
        const player2 = _status.event.player;
        if (button.link === "yuanjiao") {
          return 3;
        }
        if (button.link === "zhibi") {
          if (player2.countCards("hs", { suit: "spade" }) > 2) {
            return 1;
          }
          return 0;
        }
      },
      backup(links, player2) {
        return {
          audio: "bmcanshi",
          filterCard: { suit: "spade" },
          position: "hs",
          popname: true,
          ai(card) {
            return 6 - get.value(card);
          },
          viewAs: { name: links[0][2] },
          async precontent(event2, trigger, player3) {
            player3.addTempSkill("gzguishu_used");
            player3.storage.gzguishu_used = ["yuanjiao", "zhibi"].indexOf(event2.result.card.name) + 1;
          }
        };
      },
      prompt(links, player2) {
        return `###鬼术###将一张黑桃手牌当作【${get.translation(links[0][2])}】使用`;
      }
    },
    ai: {
      order: 4,
      result: { player: 1 },
      threaten: 2
    },
    subSkill: {
      backup: {},
      used: {
        charlotte: true,
        onremove: true
      }
    }
  },
  gzyuanyu: {
    inherit: "hmkyuanyu",
    filter(event2, player2) {
      return !event2.source?.inRange(player2);
    },
    async content(event2, trigger, player2) {
      trigger.num--;
    },
    ai: {
      effect: {
        target(card, player2, target) {
          if (player2.hasSkillTag("jueqing", false, target)) {
            return;
          }
          if (player2.inRange(target)) {
            return;
          }
          const num = get.tag(card, "damage");
          if (num) {
            if (num > 1) {
              return 0.5;
            }
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  //伏完
  gzmoukui: {
    audio: "moukui",
    trigger: { player: "useCardToPlayered" },
    filter(event2, player2) {
      return event2.card?.name === "sha";
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      const list = ["选项一"];
      if (trigger.target.hasDiscardableCards(player2, "he")) {
        list.push("选项二");
      }
      list.push("背水！");
      list.push("cancel2");
      const { control } = await player2.chooseControl({
        controls: list,
        choiceList: ["摸一张牌", `弃置${get.translation(trigger.target)}的一张牌`, "背水！依次执行以上两项。然后若此【杀】未对其造成过伤害，则其弃置你的一张牌。"],
        prompt: get.prompt(event2.skill, trigger.target)
      }).setHiddenSkill(event2.skill).forResult();
      event2.result = { bool: control !== "cancel2", targets: [trigger.target], cost_data: control };
    },
    async content(event2, trigger, player2) {
      const control = event2.cost_data;
      if (control !== "cancel2") {
        const target = event2.targets[0];
        if (control === "选项一" || control === "背水！") {
          await player2.draw();
        }
        if (control === "选项二" || control === "背水！") {
          await player2.discardPlayerCard({ target, forced: true, position: "he" });
        }
        if (control === "背水！") {
          player2.addTempSkill(`${event2.name}_effect`);
          let evt = trigger.getParent();
          if (!evt[`${event2.name}_effect`]) {
            evt[`${event2.name}_effect`] = [];
          }
          evt[`${event2.name}_effect`].add(target);
        }
      }
    },
    subSkill: {
      effect: {
        charlotte: true,
        trigger: { player: "useCardAfter" },
        filter(event2, player2) {
          return event2.gzmoukui_effect?.some((current) => {
            return current.isIn() && !current.hasHistory("damage", (evt) => evt.card === event2.card);
          });
        },
        forced: true,
        popup: false,
        async content(event2, trigger, player2) {
          const list = trigger.gzmoukui_effect.filter((current) => {
            return current.isIn() && !current.hasHistory("damage", (evt) => evt.card === trigger.card);
          }).sortBySeat();
          for (const current of list) {
            let discardEvent = current.discardPlayerCard({ target: player2, forced: true, position: "he" });
            discardEvent.boolline = true;
            await discardEvent;
          }
        }
      }
    }
  },
  //南华老仙
  gzjinghe_new: {
    inherit: "gzjinghe",
    filter: () => true,
    filterCard: () => false,
    selectCard: -1,
    filterTarget: true,
    selectTarget: 1,
    usable: 1,
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const skill = get.info(event2.name).derivation?.randomGet();
      if (!skill) {
        return;
      }
      let cardname = `gzrejinghe_${skill}`;
      const videoId = lib.status.videoId++;
      lib.card[cardname] = {
        fullimage: true,
        image: "character:re_nanhualaoxian"
      };
      lib.translate[cardname] = get.translation(skill);
      game.broadcastAll(
        (player3, id, card) => {
          ui.create.dialog(`${get.translation(player3)}发动了【经合】`, [[card], "card"]).videoId = id;
        },
        player2,
        videoId,
        game.createCard(cardname, " ", " ")
      );
      await game.delay(3);
      game.broadcastAll("closeDialog", videoId);
      player2.addTempSkill("gzjinghe_new_clear", { player: "phaseBegin" });
      target.addAdditionalSkills(`gzjinghe_new_${player2.playerid}`, skill);
      target.popup(skill);
    },
    subSkill: {
      clear: {
        charlotte: true,
        onremove(player2) {
          game.countPlayer((current) => current.removeAdditionalSkills(`gzjinghe_new_${player2.playerid}`));
        }
      }
    }
  },
  //凌操
  gzdujin: {
    audio: "dujin",
    inherit: "dujin",
    filter(event2, player2) {
      return !event2.numFixed;
    },
    async content(event2, trigger, player2) {
      trigger.num += Math.floor(player2.countCards("e") / 2) + 1;
    },
    group: "gzdujin_first",
    subSkill: {
      first: {
        audio: "dujin",
        trigger: { player: "showCharacterEnd" },
        filter(event2, player2) {
          if (game.getAllGlobalHistory(
            "everything",
            (evt) => {
              return evt.name === "showCharacter" && evt.player === player2 && evt.toShow.some((i) => get.character(i, 3).includes("gzdujin"));
            },
            event2
          ).indexOf(event2) !== 0) {
            return false;
          }
          return game.getAllGlobalHistory("everything", (evt) => {
            return evt.name === "showCharacter" && evt.player.isFriendOf(player2);
          })[0].player === player2;
        },
        forced: true,
        locked: false,
        async content(event2, trigger, player2) {
          player2.addMark("xianqu_mark", 1);
        }
      }
    }
  },
  //王基
  gzqizhi: {
    audio: "qizhi",
    inherit: "qizhi",
    usable: 4
  },
  gzjinqu: {
    audio: "jinqu",
    trigger: { player: "phaseJieshuBegin" },
    check(event2, player2) {
      return player2.getHistory("custom", (evt) => {
        return evt.gzqizhi === true;
      }).length >= player2.countCards("h");
    },
    prompt(event2, player2) {
      const num = player2.getHistory("custom", (evt) => {
        return evt.gzqizhi === true;
      }).length;
      return `进趋：是否摸两张牌并将手牌弃置至${get.cnNumber(num)}张？`;
    },
    async content(event2, trigger, player2) {
      await player2.draw(2);
      const dh = player2.countCards("h") - player2.getHistory("custom", (evt) => {
        return evt.gzqizhi === true;
      }).length;
      if (dh > 0) {
        await player2.chooseToDiscard({ selectCard: dh, forced: true, allowChooseAll: true });
      }
    },
    ai: { combo: "gzqizhi" }
  },
  //徐荣
  gzxionghuo: {
    audio: "xinfu_xionghuo",
    enable: "phaseUse",
    filter(event2, player2) {
      return player2.countMark("gzxionghuo_used") < 3;
    },
    filterTarget(card, player2, target) {
      return target.isEnemyOf(player2);
    },
    usable: 1,
    async content(event2, trigger, player2) {
      const { target } = event2;
      player2.addSkill("gzxionghuo_used");
      player2.addMark("gzxionghuo_used", 1, false);
      player2.addSkill("gzxionghuo_effect");
      const targets = player2.getStorage("gzxionghuo_effect").slice().concat([target]);
      player2.setStorage("gzxionghuo_effect", targets, true);
    },
    ai: {
      order: 9,
      result: { target: -1 }
    },
    subSkill: {
      used: {
        charlotte: true,
        onremove: true,
        intro: { content: "已发动过#次" }
      },
      effect: {
        charlotte: true,
        intro: { content: "已指定$" },
        trigger: {
          source: "damageBegin1",
          global: "phaseUseBegin"
        },
        filter(event2, player2) {
          if (!player2.getStorage("gzxionghuo_effect").includes(event2.player)) {
            return false;
          }
          return event2.name === "phaseUse" || event2.card && !player2.hasHistory("sourceDamage", (evt) => evt.player === event2.player);
        },
        forced: true,
        logTarget: "player",
        async content(event2, trigger, player2) {
          let num = player2.getStorage("gzxionghuo_effect").filter((i) => i === trigger.player).length;
          if (trigger.name === "damage") {
            trigger.num += num;
          } else {
            const target = trigger.player;
            while (player2.getStorage("gzxionghuo_effect").includes(target)) {
              player2.unmarkAuto("gzxionghuo_effect", [target]);
            }
            while (num > 0) {
              num--;
              switch (get.rand(1, 3)) {
                case 1:
                  player2.line(target, "fire");
                  await target.damage({ num: 1, nature: "fire" });
                  target.addTempSkill("xinfu_xionghuo_disable");
                  target.markAuto("xinfu_xionghuo_disable", [player2]);
                  break;
                case 2:
                  player2.line(target, "water");
                  await target.loseHp();
                  target.addTempSkill("xinfu_xionghuo_low");
                  target.addMark("xinfu_xionghuo_low", 1, false);
                  break;
                case 3:
                  player2.line(target, "green");
                  for (const pos of ["e", "h"]) {
                    await player2.gainPlayerCard({ target, position: pos, forced: true });
                  }
                  break;
              }
            }
          }
        }
      }
    }
  },
  //向郎
  gzkanji: {
    audio: "dckanji",
    inherit: "dckanji",
    usable: 1,
    async content(event2, trigger, player2) {
      await player2.showHandcards();
      const suits = player2.getCards("h").slice().map((card) => get.suit(card, player2)).unique();
      if (suits.length === player2.countCards("h")) {
        event2.suitsLength = suits.length;
        player2.addTempSkill("gzkanji_check");
        await player2.draw(2);
      }
    },
    subSkill: {
      check: {
        charlotte: true,
        trigger: { player: "gainAfter" },
        filter(event2, player2) {
          if (event2.getParent(2).name !== "gzkanji") {
            return false;
          }
          const len = event2.getParent(2).suitsLength;
          const suits = player2.getCards("h").slice().map((card) => get.suit(card, player2)).unique();
          return suits.length >= 4 && len < 4;
        },
        forced: true,
        popup: false,
        async content(event2, trigger, player2) {
          player2.addTempSkill("gzkanji_hand");
          player2.addMark("gzkanji_hand", 4, false);
        }
      },
      hand: {
        charlotte: true,
        onremove: true,
        intro: { content: "手牌上限+#" },
        mod: {
          maxHandcard(player2, num) {
            return num + player2.countMark("gzkanji_hand");
          }
        }
      }
    }
  },
  //滕胤
  gzchenjian: {
    audio: "chenjian",
    trigger: { player: "phaseZhunbeiBegin" },
    async content(event2, trigger, player2) {
      const cards2 = get.cards(3);
      event2.cards = cards2;
      await player2.showCards(cards2, `${get.translation(player2)}发动了【陈见】`);
      const list = [];
      if (player2.hasCards("he", (i) => lib.filter.cardDiscardable(i, player2, "gzchenjian"))) {
        list.push("选项一");
      }
      if (cards2.some((i) => player2.hasUseTarget(i))) {
        list.push("选项二");
      }
      if (!list.length) {
        return;
      }
      let control;
      if (list.length === 1) {
        control = list[0];
      } else {
        const result2 = await player2.chooseControl({
          controls: list,
          choiceList: ["弃置一张牌，然后令一名角色获得与你弃置牌花色相同的牌", `使用${get.translation(cards2)}中的一张牌`],
          prompt: "陈见：请选择一项",
          ai: () => {
            const current = _status.event.player;
            const shownCards = _status.event.getParent().cards;
            if (shownCards.some((i) => current.getUseValue(i) > 0)) {
              return "选项二";
            }
            return "选项一";
          }
        }).forResult();
        control = result2.control;
      }
      if (control === "cancel2") {
        return;
      }
      if (control === "选项一" && player2.hasCards("he", (i) => lib.filter.cardDiscardable(i, player2, "chenjian"))) {
        const discardResult = await player2.chooseToDiscard({
          position: "he",
          forced: true,
          ai: (card) => {
            const evt = _status.event.getParent();
            let val = evt.player.countMark("chenjian") < 2 ? 0 : -get.value(card);
            const suit2 = get.suit(card);
            for (const shownCard of evt.cards) {
              if (get.suit(shownCard, false) === suit2) {
                val += get.value(shownCard, "raw");
              }
            }
            return val;
          },
          prompt: `陈见：请弃置一张牌，然后令一名角色获得${get.translation(cards2)}中花色与之相同的牌${event2.goon ? "？" : ""}`
        }).forResult();
        if (!discardResult.bool) {
          return;
        }
        const suit = get.suit(discardResult.cards[0], player2);
        const matchingCards = cards2.filter((i) => get.suit(i, false) === suit);
        if (!matchingCards.length) {
          return;
        }
        const targetResult = await player2.chooseTarget({
          forced: true,
          prompt: `选择一名角色获得${get.translation(matchingCards)}`,
          ai: (target) => {
            const att = get.attitude(_status.event.player, target);
            return att > 0 ? att + Math.max(0, 5 - target.countCards("h")) : att;
          }
        }).forResult();
        if (targetResult.bool) {
          const target = targetResult.targets[0];
          player2.line(target, "green");
          await target.gain({ cards: matchingCards, animate: "gain2" });
        }
        return;
      }
      if (control !== "选项一" && control !== "选项二") {
        return;
      }
      const usableCards = cards2.filter((i) => player2.hasUseTarget(i));
      if (!usableCards.length) {
        return;
      }
      const buttonResult = await player2.chooseButton({
        createDialog: [`陈见：${event2.goon ? "是否" : "请"}使用其中一张牌${event2.goon ? "？" : ""}`, usableCards],
        forced: !event2.goon,
        ai: (button) => player2.getUseValue(button.link)
      }).forResult();
      if (buttonResult.bool) {
        await player2.chooseUseTarget({ forced: true, card: buttonResult.links[0], addCount: false });
      }
    }
  },
  gzxixiu: {
    audio: "xixiu",
    trigger: {
      player: "loseBegin",
      target: "useCardToTargeted"
    },
    filter(event2, player2) {
      if (event2.name === "lose") {
        if (event2.type !== "discard" || event2.getlx === false) {
          return false;
        }
        if (event2.getParent(2).player === player2 || player2.countCards("e") !== 1) {
          return false;
        }
        return event2.cards.includes(player2.getCards("e")[0]);
      }
      if (player2 === event2.player || !player2.hasCards("e")) {
        return false;
      }
      const suit = get.suit(event2.card, false);
      if (suit === "none") {
        return false;
      }
      return player2.hasCard((card) => {
        return get.suit(card, player2) === suit;
      }, "e");
    },
    forced: true,
    async content(event2, trigger, player2) {
      if (trigger.name === "lose") {
        trigger.cards.remove(player2.getCards("e")[0]);
      } else {
        await player2.draw();
      }
    },
    ai: {
      effect: {
        target_use(card, player2, target) {
          if (typeof card === "object" && player2 !== target) {
            const suit = get.suit(card);
            if (suit === "none") {
              return;
            }
            if (player2.hasCard((card2) => {
              return get.suit(card2, player2) === suit;
            }, "e")) {
              return [1, 0.08];
            }
          }
        }
      }
    }
  },
  //潘淑
  gzyaner: {
    audio: "yaner",
    inherit: "yaner",
    prompt2: "与该角色各摸一张牌",
    async content(event2, trigger, player2) {
      await game.asyncDraw([_status.currentPhase, player2]);
    }
  },
  //曹真
  gzsidi: {
    audio: "sidi",
    trigger: { player: "damageEnd" },
    filter(event2, player2) {
      if (!player2.hasCard((card) => {
        if (get.position(card) === "h" && _status.connectMode) {
          return true;
        }
        return !player2.getExpansions("gzsidi").some((cardx) => get.type2(cardx) === get.type2(card));
      }, "he")) {
        return false;
      }
      return player2.isFriendOf(event2.player);
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCard({
        prompt: get.prompt("gzsidi"),
        filterCard: (card, player3) => {
          return !player3.getExpansions("gzsidi").some((cardx) => get.type2(cardx) === get.type2(card));
        },
        prompt2: "将一张与武将牌上的“驭”类别均不同的牌置于武将牌上",
        position: "he",
        ai: (card) => {
          return 6 - get.value(card);
        }
      }).forResult();
    },
    async content(event2, trigger, player2) {
      await player2.addToExpansion({ cards: event2.cards, source: player2, animate: "give", gaintag: ["gzsidi"] });
    },
    intro: {
      content: "expansion",
      markcount: "expansion"
    },
    marktext: "驭",
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    },
    group: "gzsidi_effect",
    subSkill: {
      effect: {
        audio: "sidi",
        trigger: { global: "phaseBegin" },
        filter(event2, player2) {
          if (!event2.player.isEnemyOf(player2)) {
            return false;
          }
          return player2.getExpansions("gzsidi").length;
        },
        async cost(event2, trigger, player2) {
          event2.result = await player2.chooseButton({
            createDialog: [`###${get.prompt("sidi", trigger.player)}###<div class="text center">将至多三张“驭”置入弃牌堆，然后执行等量条效果</div>`, player2.getExpansions("gzsidi")],
            selectButton: [1, 3],
            ai: (button) => {
              const player3 = get.player();
              const target = get.event().getTrigger().player;
              if (get.attitude(player3, target) >= 0) {
                return 0;
              }
              return ["equip", "trick", "basic"].indexOf(get.type2(button.link)) + 2;
            }
          }).forResult();
          if (event2.result?.bool && event2.result.links?.length) {
            event2.result.cards = event2.result.links;
          }
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          const cards2 = event2.cards;
          const target = trigger.player;
          await player2.loseToDiscardpile({ cards: cards2 });
          let num = cards2.length;
          let result2;
          const list = cards2.slice().map((i) => get.type2(i, false));
          if (num !== 3) {
            list.add("cancel2");
          }
          result2 = await player2.chooseControl({
            controls: list,
            ai: () => {
              return get.event().controls.randomGet();
            },
            prompt: `${num === 3 ? "" : "是否"}封禁其本回合一种类别的牌${num === 3 ? "" : `？（还可选择${num}次）`}`
          }).forResult();
          if (result2.control !== "cancel2") {
            num--;
            player2.popup(result2.control);
            game.log(player2, "选择了", `#g${get.translation(result2.control)}`);
            target.addTempSkill("gzsidi_ban");
            target.markAuto("gzsidi_ban", [result2.control]);
            if (!num) {
              return;
            }
          }
          const skills = target.getStockSkills(null, true);
          if (skills.length) {
            if (num !== 2) {
              skills.add("cancel2");
            }
            result2 = await player2.chooseControl({
              controls: skills,
              ai: () => {
                return get.event().controls.randomGet();
              },
              prompt: `${num === 2 ? "" : "是否"}封禁其明置武将牌上的一个技能${num === 3 ? "" : `？（还可选择${num}次）`}`
            }).forResult();
            if (result2.control !== "cancel2") {
              num--;
              player2.popup(result2.control);
              game.log(player2, "选择了", `#g${get.translation(result2.control)}`);
              target.addTempSkill("gzsidi_disable");
              target.disableSkill("gzsidi_disable", result2.control);
              if (!num) {
                return;
              }
            }
          }
          if (game.hasPlayer((target2) => target2 !== player2 && target2.isDamaged() && target2.isFriendOf(player2))) {
            result2 = await player2.chooseTarget({
              prompt: "是否令一名与你势力相同的其他角色回复1点体力？",
              filterTarget: (card, player3, target2) => {
                return target2 !== player3 && target2.isDamaged() && target2.isFriendOf(player3);
              },
              ai: (target2) => {
                const player3 = get.player();
                return get.recoverEffect(target2, player3, player3);
              }
            }).forResult();
            if (result2.bool) {
              player2.line(result2.targets[0]);
              await result2.targets[0].recover();
            }
          }
        }
      },
      ban: {
        charlotte: true,
        onremove: true,
        intro: { content: "不能使用$牌" },
        mod: {
          cardEnabled(card, player2) {
            if (player2.getStorage("gzsidi_ban").includes(get.type2(card))) {
              const hs = player2.getCards("h");
              const cards2 = [card];
              if (Array.isArray(card.cards)) {
                cards2.addArray(card.cards);
              }
              for (const i of cards2) {
                if (hs.includes(i)) {
                  return false;
                }
              }
            }
          },
          cardSavable(card, player2) {
            if (player2.getStorage("gzsidi_ban").includes(get.type2(card))) {
              const hs = player2.getCards("h");
              const cards2 = [card];
              if (Array.isArray(card.cards)) {
                cards2.addArray(card.cards);
              }
              for (const i of cards2) {
                if (hs.includes(i)) {
                  return false;
                }
              }
            }
          }
        }
      },
      disable: {
        charlotte: true,
        onremove(player2, skill) {
          player2.enableSkill(skill);
        }
      }
    }
  },
  //甘夫人
  //徐盛
  //陆逊
  //臧霸
  gzshushen_new: {
    audio: "shushen",
    trigger: { player: "recoverEnd" },
    getIndex: (event2) => event2.num || 1,
    preHidden: true,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2("gzshushen_new"),
        filterTarget: lib.filter.notMe,
        ai: (target) => {
          const player3 = get.player();
          return get.effect(target, { name: "draw" }, player3, player3) * (1 + !target.hasCards("h"));
        }
      }).setHiddenSkill("gzshushen_new").forResult();
    },
    async content(event2, trigger, player2) {
      await event2.targets[0].draw(event2.targets[0].hasCards("h") ? 1 : 2);
    },
    ai: {
      threaten: 0.8,
      expose: 0.1
    }
  },
  //徐盛
  gzyicheng_new: {
    audio: "yicheng",
    trigger: { global: ["useCardToPlayered", "useCardToTargeted"] },
    filter(event2, player2, name) {
      const bool = name === "useCardToPlayered";
      if (bool && !event2.isFirstTarget) {
        return false;
      }
      return event2.card.name === "sha" && event2[bool ? "player" : "target"].isFriendOf(player2);
    },
    logTarget(event2, player2, name) {
      return event2[name === "useCardToPlayered" ? "player" : "target"];
    },
    async content(event2, trigger, player2) {
      await event2.targets[0].draw();
      await event2.targets[0].chooseToDiscard({ position: "he", forced: true });
    }
  },
  //陆逊
  gzduoshi: {
    audio: "duoshi",
    trigger: { player: "phaseUseBegin" },
    filter(event2, player2) {
      return player2.hasUseTarget(new lib.element.VCard({ name: "yiyi", isCard: true }));
    },
    direct: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      let next = player2.chooseUseTarget({ prompt: get.prompt2(event2.name), card: new lib.element.VCard({ name: "yiyi", isCard: true }), addCount: false }).set("hiddenSkill", event2.name);
      next.logSkill = event2.name;
      await next;
    }
  },
  //臧霸
  gzhengjiang: {
    audio: "hengjiang",
    trigger: { player: "damageEnd" },
    preHidden: true,
    check(event2, player2) {
      return get.attitude(player2, _status.currentPhase) < 0 || !_status.currentPhase.needsToDiscard(2);
    },
    filter(event2) {
      return _status.currentPhase && _status.currentPhase.isIn() && event2.num > 0;
    },
    logTarget() {
      return _status.currentPhase;
    },
    async content(event2, trigger, player2) {
      let source = _status.currentPhase;
      const num = Math.max(source.countVCards("e"), 1);
      if (source.hasSkill("gzhengjiang_effect")) {
        source.storage.gzhengjiang_effect += num;
        source.storage.gzhengjiang3.add(player2);
        source.updateMarks();
      } else {
        source.storage.gzhengjiang3 = [player2];
        source.storage.gzhengjiang_effect = num;
        source.addTempSkill("gzhengjiang_effect");
      }
    },
    ai: { maixie_defend: true },
    subSkill: {
      effect: {
        mark: true,
        charlotte: true,
        intro: { content: "手牌上限-#" },
        mod: {
          maxHandcard(player2, num) {
            return num - player2.storage.gzhengjiang_effect;
          }
        },
        onremove(player2) {
          delete player2.storage.gzhengjiang_effect;
          delete player2.storage.gzhengjiang3;
        },
        trigger: { player: "phaseDiscardEnd" },
        filter(event2, player2) {
          if (event2.cards?.length) {
            return false;
          }
          return player2.storage.gzhengjiang3.some((target) => target?.isIn() && target.countCards("h") < target.maxHp);
        },
        forced: true,
        popup: false,
        async content(event2, trigger, player2) {
          const players = player2.storage.gzhengjiang3;
          for (const item of players) {
            const target = item;
            if (target.isIn() && target.countCards("h") < target.maxHp) {
              target.logSkill("gzhengjiang", player2);
              await target.drawTo(target.maxHp);
            }
          }
        }
      }
    }
  },
  //宗预
  gzchengshang: {
    audio: "chengshang",
    trigger: { player: "useCardAfter" },
    filter(event2, player2) {
      if (player2.hasHistory("sourceDamage", (evt) => evt.card === event2.card)) {
        return false;
      }
      return event2.targets?.some((i) => i.isIn() && i.hasCards("he"));
    },
    usable: 1,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2("gzchengshang"),
        filterTarget: (card, player3, target) => {
          return get.event().getTrigger().targets.includes(target) && target.countCards("he");
        },
        ai: (target) => {
          if (_status.event.player === target) {
            return 0;
          }
          const att = get.attitude(_status.event.player, target);
          if (att > 0) {
            return Math.sqrt(att) / 10;
          }
          return 5 - att;
        }
      }).forResult();
    },
    async content(event2, trigger, player2) {
      const result2 = await event2.targets[0].chooseToGive(player2, "he", true, `承赏：交给${get.translation(player2)}一张牌，若为${get.translation(trigger.card.suit)}${get.strNumber(trigger.card.number)}则${get.translation(player2)}失去此技能`).set("ai", (card) => {
        const player3 = get.player();
        const source = get.event().getParent().player;
        const cardx = get.event().getTrigger().card;
        if (get.suit(card) === get.suit(cardx) && get.number(card) === get.number(cardx)) {
          return 1145141919810 * get.sgn(-get.attitude(player3, source));
        }
        return -get.value(card);
      }).forResult();
      if (result2?.bool && result2.cards?.length) {
        const card = result2.cards[0];
        if (get.suit(card) === get.suit(trigger.card) && get.number(card) === get.number(trigger.card)) {
          await player2.removeSkills("gzchengshang");
        }
      }
    }
  },
  //官盗2023
  fakexiaoguo: {
    audio: "xiaoguo",
    audioname2: { gz_jun_caocao: "jianan_xiaoguo" },
    trigger: { global: "phaseZhunbeiBegin" },
    filter(event2, player2) {
      return event2.player !== player2 && player2.hasCards("h", (card) => {
        if (_status.connectMode) {
          return true;
        }
        return get.type(card) === "basic" && lib.filter.cardDiscardable(card, player2);
      });
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseToDiscard({
        prompt: get.prompt2("fakexiaoguo", trigger.player),
        filterCard: (card, player3) => {
          return get.type(card) === "basic";
        },
        selectCard: [1, Infinity],
        ai: (card) => {
          const player3 = get.event().player;
          const target = get.event().getTrigger().player;
          const effect = get.damageEffect(target, player3, player3);
          const cards2 = target.getCards("e", (card2) => get.attitude(player3, target) * get.value(card2, target) < 0);
          if (effect <= 0 && !cards2.length) {
            return 0;
          }
          if (ui.selected.cards.length > cards2.length - (effect <= 0 ? 1 : 0)) {
            return 0;
          }
          return 1 / (get.value(card) || 0.5);
        }
      }).set("complexSelect", true).set("logSkill", ["fakexiaoguo", trigger.player]).setHiddenSkill("fakexiaoguo").forResult();
    },
    popup: false,
    preHidden: true,
    async content(event2, trigger, player2) {
      const num = trigger.player.countCards("e");
      const num2 = event2.cards.length;
      await player2.discardPlayerCard({ target: trigger.player, position: "e", selectButton: num2, forced: true });
      if (num2 > num) {
        await trigger.player.damage();
      }
    }
  },
  fakeduanbing: {
    audio: "duanbing",
    inherit: "reduanbing",
    preHidden: ["fakeduanbing_sha"],
    group: ["fakeduanbing", "fakeduanbing_sha"],
    subSkill: {
      sha: {
        audio: "duanbing",
        trigger: { player: "useCardToPlayered" },
        filter(event2, player2) {
          return event2.card.name === "sha" && !event2.getParent().directHit.includes(event2.target) && event2.targets.length === 1;
        },
        forced: true,
        logTarget: "target",
        async content(event2, trigger, player2) {
          let id = trigger.target.playerid;
          let map = trigger.getParent().customArgs;
          if (!map[id]) {
            map[id] = {};
          }
          if (typeof map[id].shanRequired === "number") {
            map[id].shanRequired++;
          } else {
            map[id].shanRequired = 2;
          }
        },
        ai: {
          directHit_ai: true,
          skillTagFilter(player2, tag, arg) {
            if (!arg || !arg.card || !arg.target || arg.card.name !== "sha" || arg.target.countCards("h", "shan") > 1 || get.distance(player2, arg.target) > 1) {
              return false;
            }
          }
        }
      }
    }
  },
  fakeduoshi: {
    audio: "duoshi",
    global: "fakeduoshi_global",
    subSkill: {
      global: {
        audio: "duoshi",
        forceaudio: true,
        enable: "phaseUse",
        filter(event2, player2) {
          const info = get.info("fakeduoshi").subSkill.global;
          return game.hasPlayer((target) => {
            return info.filterTarget(null, player2, target);
          }) && player2.hasCards("hs", (card) => {
            return info.filterCard(card, player2);
          });
        },
        filterTarget(card, player2, target) {
          return target.hasSkill("fakeduoshi") && !target.isTempBanned("fakeduoshi") && target.isFriendOf(player2);
        },
        filterCard(card, player2) {
          if (!game.checkMod(card, player2, "unchanged", "cardEnabled2", player2)) {
            return false;
          }
          return get.color(card) === "red" && player2.hasUseTarget(get.autoViewAs({ name: "yiyi" }, [card]));
        },
        discard: false,
        lose: false,
        delay: false,
        line: false,
        prompt: "选择一张红色手牌当作【以逸待劳】使用，并选择一名拥有【度势】的角色",
        async content(event2, trigger, player2) {
          const target = event2.target;
          target.tempBanSkill("fakeduoshi", "roundStart", false);
          const result2 = await player2.chooseUseTarget({ forced: true, card: { name: "yiyi" }, cards: event2.cards }).forResult();
          if (result2.bool && result2.targets.length && target.isNotMajor()) {
            const num = result2.targets.length;
            const str = `将${get.cnNumber(num)}张手牌当作不可被响应的【火烧连营】使用？`;
            const { bool, targets } = await player2.chooseTarget({
              prompt: `是否令一名友方角色${str}`,
              filterTarget: (card, player3, target2) => {
                return target2.isFriendOf(player3) && target2.countCards("h", (card2) => {
                  if (!target2.hasUseTarget(get.autoViewAs({ name: "huoshaolianying" }, [card2]))) {
                    return false;
                  }
                  return target2 !== player3 || game.checkMod(card2, player3, "unchanged", "cardEnabled2", player3);
                }) >= get.event().num;
              },
              ai: (target2) => {
                return target2.getUseValue(new lib.element.VCard({ name: "huoshaolianying", isCard: true }));
              }
            }).set("num", num).forResult();
            if (bool) {
              player2.line(targets[0]);
              game.broadcastAll((num2) => {
                lib.skill.fakeduoshi_backup.selectCard = num2;
                lib.skill.fakeduoshi.subSkill.backup.selectCard = num2;
              }, num);
              await targets[0].chooseToUse().set("openskilldialog", `度势：是否${str}`).set("norestore", true).set("_backupevent", "fakeduoshi_backup").set("custom", {
                add: {},
                replace: { window() {
                } }
              }).set("addCount", false).set("oncard", () => _status.event.directHit.addArray(game.players)).backup("fakeduoshi_backup");
            }
          }
        },
        ai: {
          order(item, player2) {
            const card = new lib.element.VCard({ name: "huoshaolianying", isCard: true });
            return get.order(card, player2) + 0.1;
          },
          result: { target: 1 }
        }
      },
      backup: {
        filterCard(card) {
          return get.itemtype(card) === "card";
        },
        position: "hs",
        check(card) {
          return 7 - get.value(card);
        },
        log: false,
        viewAs: { name: "huoshaolianying" }
      }
    }
  },
  fakehanzhan: {
    audio: "hanzhan",
    trigger: {
      player: ["chooseToCompareAfter", "compareMultipleAfter"],
      target: ["chooseToCompareAfter", "compareMultipleAfter"]
    },
    filter(event2, player2) {
      if (event2.preserve) {
        return false;
      }
      const list = [event2.player, event2.target];
      const targets = list.slice().filter((i) => (event2.num1 - event2.num2) * get.sgn(0.5 - list.indexOf(i)) <= 0);
      return targets.some((i) => {
        const target = list[1 - list.indexOf(i)];
        return target.hasCard((card) => {
          return lib.filter.canBeGained(card, i, target);
        }, "e");
      });
    },
    async cost(event2, trigger, player2) {
      const users = [];
      const list = [trigger.player, trigger.target];
      let targets = list.slice().filter((i) => (trigger.num1 - trigger.num2) * get.sgn(0.5 - list.indexOf(i)) <= 0);
      targets = targets.filter((i) => {
        const target = list[1 - list.indexOf(i)];
        return target.hasCard((card) => {
          return lib.filter.canBeGained(card, i, target);
        }, "e");
      }).sortBySeat(player2);
      for (const i of targets) {
        const aim = list[1 - list.indexOf(i)];
        const { bool } = await i.chooseBool({ prompt: get.prompt("fakehanzhan"), prompt2: `获得${get.translation(aim)}装备区的一张牌` }).set(
          "choice",
          aim.hasCard((card) => {
            return get.value(card, aim) * get.attitude(i, aim) < 0;
          }, "e")
        ).forResult();
        if (bool) {
          users.push(i);
        }
      }
      event2.result = { bool: Boolean(users.length), targets: users };
    },
    logLine: false,
    async content(event2, trigger, player2) {
      const list = [trigger.player, trigger.target];
      let targets = list.slice().filter((i) => (trigger.num1 - trigger.num2) * get.sgn(0.5 - list.indexOf(i)) <= 0);
      targets = targets.filter((i) => {
        const target = list[1 - list.indexOf(i)];
        return target.hasCard((card) => {
          return lib.filter.canBeGained(card, i, target);
        }, "e");
      }).sortBySeat(player2);
      for (const i of targets) {
        const aim = list[1 - list.indexOf(i)];
        i.line(aim, "green");
        await i.gainPlayerCard({ target: aim, position: "e", forced: true });
      }
    }
  },
  fakeshuangxiong: {
    audio: "shuangxiong",
    subfrequent: ["tiandu"],
    group: ["fakeshuangxiong_effect", "fakeshuangxiong_tiandu"],
    subSkill: {
      effect: {
        audio: "shuangxiong1",
        inherit: "shuangxiong1",
        async content(event2, trigger, player2) {
          const next = player2.judge().set("callback", get.info("fakeshuangxiong").subSkill.effect.callback);
          trigger.changeToZero();
          await next;
        },
        async callback(event2, trigger, player2) {
          player2.addTempSkill("shuangxiong2");
          player2.markAuto("shuangxiong2", [event2.judgeResult.color]);
        }
      },
      tiandu: {
        audio: "shuangxiong",
        inherit: "tiandu",
        filter(event2, player2) {
          return _status.currentPhase === player2 && get.info("tiandu").filter(event2, player2);
        }
      }
    }
  },
  fakeyicheng: {
    audio: "yicheng",
    inherit: "yicheng",
    async content(event2, trigger, player2) {
      const target = trigger.target;
      await target.draw();
      await target.chooseToUse({
        filterCard: (card) => {
          if (get.type(card) !== "equip") {
            return false;
          }
          return lib.filter.cardEnabled(card, _status.event.player, _status.event);
        },
        prompt: "疑城：是否使用装备牌？"
      });
      if (!target.storage.fakeyicheng) {
        target.when({ global: "phaseEnd" }).step(async (event3, trigger2, player3) => {
          await player3.chooseToDiscard({ position: "he", selectCard: player3.countMark("fakeyicheng"), forced: true });
          delete player3.storage.fakeyicheng;
        });
      }
      target.addMark("fakeyicheng", 1, false);
    }
  },
  fakefenming: {
    audio: "fenming",
    enable: "phaseUse",
    filter(event2, player2) {
      return player2.isLinked();
    },
    filterTarget(card, player2, target) {
      return target.isLinked();
    },
    selectTarget: -1,
    usable: 1,
    multiline: true,
    multitarget: true,
    async content(event2, trigger, player2) {
      for (const target of event2.targets) {
        if (player2 === target) {
          await player2.chooseToDiscard({ forced: true, position: "he" });
        } else {
          await player2.discardPlayerCard({ forced: true, position: "he", target });
        }
      }
    },
    ai: {
      order(item, player2) {
        return get.order({ name: "sha" }, player2) + 0.1;
      },
      result: {
        target(player2, target) {
          return get.sgn(get.attitude(player2, target)) * get.effect(target, { name: "guohe_copy2" }, player2, player2);
        }
      }
    }
  },
  fakebaoling: {
    audio: "baoling",
    inherit: "baoling",
    init(player2) {
      player2.checkMainSkill("fakebaoling");
    },
    async content(event2, trigger, player2) {
      await player2.removeCharacter(1);
      const gainMaxHpEvent = player2.gainMaxHp(3);
      const recoverEvent = player2.recover(3);
      await gainMaxHpEvent;
      await recoverEvent;
      await player2.addSkills("fakebenghuai");
    },
    derivation: "fakebenghuai"
  },
  fakebenghuai: {
    audio: "benghuai",
    inherit: "benghuai",
    async content(event2, trigger, player2) {
      const { control } = await player2.chooseControl({
        controls: ["体力", "上限", "背水！"],
        prompt: "崩坏：请选择一项",
        choiceList: ["失去1点体力", "减1点体力上限", "背水！依次执行前两项，然后执行一个额外的摸牌阶段"],
        ai: () => {
          const player3 = get.event().player;
          if (player3.maxHp > 1 && (player3.getHp() === 2 || !player3.hasCards("h"))) {
            return "背水！";
          }
          return player3.isDamaged() ? "上限" : "体力";
        }
      }).forResult();
      player2.popup(control);
      game.log(player2, "选择了", `#g${control}`);
      if (control !== "上限") {
        await player2.loseHp();
      }
      if (control !== "体力") {
        await player2.loseMaxHp();
      }
      if (control === "背水！") {
        const num = trigger.getParent().num + 1;
        trigger.getParent().phaseList.splice(num, 0, `phaseDraw|${event2.name}`);
      }
    }
  },
  fakediaodu: {
    audio: "diaodu",
    inherit: "xindiaodu",
    group: "fakediaodu_use",
    subSkill: {
      use: {
        trigger: { global: "useCard" },
        filter(event2, player2) {
          if (!lib.skill.xindiaodu.isFriendOf(player2, event2.player) || !(event2.targets || []).includes(player2)) {
            return false;
          }
          return (player2 === event2.player || player2.hasSkill("fakediaodu")) && !event2.player.getStorage("fakediaodu_temp").includes(get.type2(event2.card));
        },
        direct: true,
        async content(event2, trigger, player2) {
          const target = trigger.target;
          const next = target.chooseBool({ prompt: get.prompt("fakediaodu"), prompt2: "摸一张牌？" });
          if (player2.hasSkill("fakediaodu")) {
            next.set("frequentSkill", "fakediaodu");
          }
          if (player2 === trigger.player) {
            next.setHiddenSkill("fakediaodu");
          }
          const { bool } = await next.forResult();
          if (bool) {
            player2.logSkill("fakediaodu", target);
            const next2 = target.draw({ nodelay: true });
            target.addTempSkill("fakediaodu_temp");
            target.markAuto("fakediaodu_temp", [get.type2(trigger.card)]);
            await next2;
          }
        }
      },
      temp: {
        charlotte: true,
        onremove: true
      }
    }
  },
  fakeyigui: {
    audio: "yigui",
    hiddenCard(player2, name) {
      if (["shan", "wuxie"].includes(name) || !["basic", "trick"].includes(get.type(name))) {
        return false;
      }
      return lib.inpile.includes(name) && player2.getStorage("fakeyigui").length && !player2.getStorage("fakeyigui2").includes(get.type2(name));
    },
    enable: "chooseToUse",
    filter(event2, player2) {
      if (event2.type === "wuxie" || event2.type === "respondShan") {
        return false;
      }
      const storage = player2.getStorage("fakeyigui");
      const storage2 = player2.getStorage("fakeyigui2");
      if (!storage.length || storage2.length > 1) {
        return false;
      }
      if (event2.type === "dying") {
        if (storage2.includes("basic")) {
          return false;
        }
        if (!event2.filterCard({ name: "tao" }, player2, event2) && !event2.filterCard({ name: "jiu" }, player2, event2)) {
          return false;
        }
        const target = event2.dying;
        return target.identity === "unknown" || target.identity === "ye" || storage.some((i) => {
          const group = get.character(i, 1);
          if (group === "ye" || target.identity === group) {
            return true;
          }
          const double = get.is.double(i, true);
          if (double && double.includes(target.identity)) {
            return true;
          }
        });
      }
      return get.inpileVCardList((info) => {
        const name = info[2];
        if (storage2.includes(get.type(name))) {
          return false;
        }
        return get.type(name) === "basic" || get.type(name) === "trick";
      }).some((cardx) => {
        const card = { name: cardx[2], nature: cardx[3] };
        const info = get.info(card);
        return storage.some((character) => {
          if (!lib.filter.filterCard(card, player2, event2)) {
            return false;
          }
          if (event2.filterCard && !event2.filterCard(card, player2, event2)) {
            return false;
          }
          const group = get.character(character, 1);
          const double = get.is.double(character, true);
          if (info.changeTarget) {
            const list = game.filterPlayer((current) => player2.canUse(card, current));
            for (const item of list) {
              let giveup = false;
              const targets = [item];
              info.changeTarget(player2, targets);
              for (const item2 of targets) {
                if (group !== "ye" && item2.identity !== "unknown" && item2.identity !== "ye" && item2.identity !== group && (!double || !double.includes(item2.identity))) {
                  giveup = true;
                  break;
                }
              }
              if (giveup) {
                continue;
              }
              if (!giveup) {
                return true;
              }
            }
            return false;
          }
          return game.hasPlayer((current) => {
            return event2.filterTarget(card, player2, current) && (group === "ye" || current.identity === "unknown" || current.identity === "ye" || current.identity === group || double && double.includes(current.identity));
          });
        });
      });
    },
    chooseButton: {
      select: 2,
      dialog(event2, player2) {
        const dialog = ui.create.dialog("役鬼", "hidden");
        dialog.add([player2.getStorage("fakeyigui"), "character"]);
        const list = get.inpileVCardList((info) => {
          const name = info[2];
          if (player2.getStorage("fakeyigui2").includes(get.type(name))) {
            return false;
          }
          return get.type(name) === "basic" || get.type(name) === "trick";
        });
        dialog.add([list, "vcard"]);
        return dialog;
      },
      filter(button, player2) {
        const evt = _status.event.getParent("chooseToUse");
        if (!ui.selected.buttons.length) {
          if (typeof button.link !== "string") {
            return false;
          }
          if (evt.type === "dying") {
            if (evt.dying.identity === "unknown" || evt.dying.identity === "ye") {
              return true;
            }
            const double = get.is.double(button.link, true);
            return evt.dying.identity === lib.character[button.link][1] || lib.character[button.link][1] === "ye" || double && double.includes(evt.dying.identity);
          }
          return true;
        } else {
          if (typeof ui.selected.buttons[0].link !== "string") {
            return false;
          }
          if (typeof button.link !== "object") {
            return false;
          }
          const name = button.link[2];
          if (player2.getStorage("fakeyigui2").includes(get.type(name))) {
            return false;
          }
          let card = { name };
          if (button.link[3]) {
            card.nature = button.link[3];
          }
          const info = get.info(card);
          const group = lib.character[ui.selected.buttons[0].link][1];
          const double = get.is.double(ui.selected.buttons[0].link, true);
          if (evt.type === "dying") {
            return evt.filterCard(card, player2, evt);
          }
          if (!lib.filter.filterCard(card, player2, evt)) {
            return false;
          } else if (evt.filterCard && !evt.filterCard(card, player2, evt)) {
            return false;
          }
          if (info.changeTarget) {
            const list = game.filterPlayer((current) => {
              return player2.canUse(card, current);
            });
            for (const item of list) {
              let giveup = false;
              const targets = [item];
              info.changeTarget(player2, targets);
              for (const item2 of targets) {
                if (group !== "ye" && item2.identity !== "unknown" && item2.identity !== "ye" && item2.identity !== group && (!double || !double.includes(item2.identity))) {
                  giveup = true;
                  break;
                }
              }
              if (giveup) {
                continue;
              }
              if (giveup === false) {
                return true;
              }
            }
            return false;
          } else {
            return game.hasPlayer((current) => {
              return evt.filterTarget(card, player2, current) && (group === "ye" || current.identity === "unknown" || current.identity === "ye" || current.identity === group || double && double.includes(current.identity));
            });
          }
        }
      },
      check(button) {
        if (ui.selected.buttons.length) {
          const evt = _status.event.getParent("chooseToUse");
          const name = button.link[2];
          const group = lib.character[ui.selected.buttons[0].link][1];
          const double = get.is.double(ui.selected.buttons[0].link, true);
          const player2 = _status.event.player;
          if (evt.type === "dying") {
            if (evt.dying !== player2 && get.effect(evt.dying, { name }, player2, player2) <= 0) {
              return 0;
            }
            if (name === "jiu") {
              return 2.1;
            }
            return 2;
          }
          if (!["tao", "juedou", "guohe", "shunshou", "wuzhong", "xietianzi", "yuanjiao", "taoyuan", "wugu", "wanjian", "nanman", "huoshaolianying"].includes(name)) {
            return 0;
          }
          if (["taoyuan", "wugu", "wanjian", "nanman", "huoshaolianying"].includes(name)) {
            const list = game.filterPlayer((current) => {
              return (group === "ye" || current.identity === "unknown" || current.identity === "ye" || current.identity === group || double && double.includes(current.identity)) && player2.canUse({ name }, current);
            });
            let num = 0;
            for (const item of list) {
              num += get.effect(item, { name }, player2, player2);
            }
            if (num <= 0) {
              return 0;
            }
            if (list.length > 1) {
              return (1.7 + Math.random()) * Math.max(num, 1);
            }
          }
        }
        return 1 + Math.random();
      },
      backup(links, player2) {
        const name = links[1][2];
        const nature = links[1][3] || null;
        const character = links[0];
        const group = lib.character[character][1];
        const next = {
          character,
          group,
          filterCard: () => false,
          selectCard: -1,
          popname: true,
          audio: "yigui",
          viewAs: {
            name,
            nature,
            isCard: true
          },
          filterTarget(card, player3, target) {
            const xx = lib.skill.fakeyigui_backup;
            const evt = _status.event;
            const group2 = xx.group;
            const double = get.is.double(xx.character, true);
            const info = get.info(card);
            if (!(info.singleCard && ui.selected.targets.length) && group2 !== "ye" && target.identity !== "unknown" && target.identity !== "ye" && target.identity !== group2 && (!double || !double.includes(target.identity))) {
              return false;
            }
            if (info.changeTarget) {
              const targets = [target];
              info.changeTarget(player3, targets);
              for (const item of targets) {
                if (group2 !== "ye" && item.identity !== "unknown" && item.identity !== "ye" && item.identity !== group2 && (!double || !double.includes(item.identity))) {
                  return false;
                }
              }
            }
            if (evt._backup && evt._backup.filterTarget) {
              return evt._backup.filterTarget(card, player3, target);
            }
            return lib.filter.filterTarget(card, player3, target);
          },
          onuse(result2, player3) {
            const character2 = lib.skill.fakeyigui_backup.character;
            player3.flashAvatar("fakeyigui", character2);
            player3.unmarkAuto("fakeyigui", [character2]);
            _status.characterlist.add(character2);
            game.log(player3, "移去了一张", `#g“魂（${get.translation(character2)}）”`);
            if (!player3.storage.fakeyigui2) {
              player3.when({ global: "phaseBefore" }).step(async () => delete player3.storage.fakeyigui2);
            }
            player3.markAuto("fakeyigui2", [get.type(result2.card.name)]);
          }
        };
        return next;
      },
      prompt(links, player2) {
        const name = links[1][2];
        const character = links[0];
        const nature = links[1][3];
        return `移除「${get.translation(character)}」并视为使用${get.translation(nature) || ""}${get.translation(name)}`;
      }
    },
    ai: {
      order: () => 1 + 10 * Math.random(),
      result: { player: 1 }
    },
    group: "fakeyigui_init",
    marktext: "魂",
    intro: {
      onunmark(storage) {
        _status.characterlist.addArray(storage);
        storage = [];
      },
      mark(dialog, storage, player2) {
        if (storage && storage.length) {
          if (player2.isUnderControl(true)) {
            dialog.addSmall([storage, "character"]);
          } else {
            return `共有${get.cnNumber(storage.length)}张“魂”`;
          }
        } else {
          return "没有“魂”";
        }
      },
      content(storage) {
        return `共有${get.cnNumber(storage.length)}张“魂”`;
      }
    },
    gainHun(player2, num) {
      const list = _status.characterlist.randomGets(num);
      if (list.length) {
        _status.characterlist.removeArray(list);
        player2.markAuto("fakeyigui", list);
        get.info("rehuashen").drawCharacter(player2, list);
        game.log(player2, `获得了${get.cnNumber(list.length)}张`, "#g“魂”");
      }
    },
    subSkill: {
      backup: {},
      init: {
        audio: "fakeyigui",
        trigger: { player: "showCharacterAfter" },
        filter(event2, player2) {
          if (!event2.toShow.some((i) => get.character(i, 3).includes("fakeyigui"))) {
            return false;
          }
          return game.getAllGlobalHistory(
            "everything",
            (evt) => {
              return evt.name === "showCharacter" && evt.player === player2 && evt.toShow.some((i) => get.character(i, 3).includes("fakeyigui"));
            },
            event2
          ).indexOf(event2) === 0;
        },
        forced: true,
        locked: false,
        async content(event2, trigger, player2) {
          get.info("fakeyigui").gainHun(player2, 2);
        }
      }
    }
  },
  fakejihun: {
    audio: "jihun",
    inherit: "jihun",
    async content(event2, trigger, player2) {
      get.info("fakeyigui").gainHun(player2, 1);
    },
    ai: { combo: "fakeyigui" },
    group: "fakejihun_zhiheng",
    subSkill: {
      zhiheng: {
        audio: "jihun",
        trigger: { player: "phaseZhunbeiBegin" },
        filter(event2, player2) {
          return player2.getStorage("fakeyigui").length;
        },
        async cost(event2, trigger, player2) {
          const { bool, links } = await player2.chooseButton({
            createDialog: [get.prompt("fakejihun"), '<div class="text center">弃置至多两张“魂”，然后获得等量的“魂”</div>', [player2.getStorage("fakeyigui"), "character"]],
            selectButton: [1, 2],
            ai: (button) => {
              const getNum = (character) => {
                return game.countPlayer((target) => {
                  const group = get.character(character, 1);
                  if (group === "ye" || target.identity === group) {
                    return true;
                  }
                  const double = get.is.double(character, true);
                  if (double && double.includes(target.identity)) {
                    return true;
                  }
                }) + 1;
              };
              return game.countPlayer() - getNum(button.link);
            }
          }).forResult();
          event2.result = { bool, cost_data: links };
        },
        async content(event2, trigger, player2) {
          player2.unmarkAuto("fakeyigui", event2.cost_data);
          _status.characterlist.addArray(event2.cost_data);
          game.log(player2, `移除了${get.cnNumber(event2.cost_data.length)}张`, "#g“魂”");
          get.info("fakeyigui").gainHun(player2, event2.cost_data.length);
        }
      }
    }
  },
  fakejueyan: {
    mainSkill: true,
    init(player2) {
      if (player2.checkMainSkill("fakejueyan")) {
        player2.removeMaxHp();
      }
    },
    audio: "drlt_jueyan",
    derivation: "fakejizhi",
    trigger: { player: "phaseZhunbeiBegin" },
    async cost(event2, trigger, player2) {
      const { control } = await player2.chooseControl({
        controls: ["判定区", "装备区", "手牌区", "cancel2"],
        prompt: `###${get.prompt("fakejueyan")}###<div class="text center">于本回合结束阶段弃置一个区域的所有牌，然后…</div>`,
        choiceList: ["判定区：跳过判定阶段，获得〖集智〗直到回合结束", "装备区：摸三张牌，本回合手牌上限+3", "手牌区：本回合使用【杀】的额定次数+3"],
        ai: () => {
          const player3 = get.event().player;
          if (player3.hasCards("j", { type: "delay" })) {
            return "判定区";
          }
          if (player3.countCards("h") < 3) {
            return "装备区";
          }
          if (player3.countCards("hs", (card) => {
            return get.name(card) === "sha" && player3.hasUseTarget(card);
          }) > player3.getCardUsable("sha")) {
            return "手牌区";
          }
          return "判定区";
        }
      }).forResult();
      event2.result = { bool: control !== "cancel2", cost_data: control };
    },
    async content(event2, trigger, player2) {
      const position = { 判定区: "j", 装备区: "e", 手牌区: "h" }[event2.cost_data];
      switch (position) {
        case "j":
          player2.skip("phaseJudge");
          player2.addTempSkills("fakejizhi");
          break;
        case "e":
          await player2.draw(3);
          player2.addTempSkill("drlt_jueyan3");
          break;
        case "h":
          player2.addTempSkill("drlt_jueyan1");
          break;
      }
      player2.when("phaseJieshuBegin").step(async () => {
        if (player2.hasCards(position)) {
          await player2.discard({ cards: player2.getCards(position) });
        }
      });
    }
  },
  fakejizhi: {
    audio: "rejizhi",
    audioname2: {
      gz_lukang: "rejizhi_lukang",
      new_simayi: "rejizhi_new_simayi"
    },
    inherit: "jizhi"
  },
  fakequanji: {
    audio: "gzquanji",
    inherit: "gzquanji",
    filter(event2, player2, name) {
      return !player2.hasHistory("useSkill", (evt) => {
        return evt.skill === "fakequanji" && evt.event.triggername === name;
      });
    },
    async content(event2, trigger, player2) {
      const num = Math.max(1, Math.min(player2.maxHp, player2.getExpansions("fakequanji").length));
      await player2.draw(num);
      const hs = player2.getCards("he");
      let result2;
      if (hs.length > 0) {
        if (hs.length <= num) {
          result2 = { bool: true, cards: hs };
        } else {
          result2 = await player2.chooseCard({ position: "he", forced: true, prompt: `选择${get.cnNumber(num)}张牌作为“权”`, selectCard: num, allowChooseAll: true }).forResult();
        }
        if (result2?.bool) {
          const cards2 = result2.cards;
          const next = player2.addToExpansion({ cards: cards2, source: player2, animate: "give" });
          next.gaintag.add("fakequanji");
          await next;
        }
      }
    },
    mod: {
      maxHandcard(player2, num) {
        return num + Math.max(1, Math.min(player2.maxHp, player2.getExpansions("fakequanji").length));
      }
    },
    ai: {
      notemp: true
    }
  },
  fakepaiyi: {
    audio: "gzpaiyi",
    enable: "phaseUse",
    filterTarget: true,
    usable: 1,
    async content(event2, trigger, player2) {
      const target = event2.target;
      const { junling, targets } = await player2.chooseJunlingFor(target).forResult();
      if (junling) {
        const str = get.translation(player2);
        const num = Math.max(1, Math.min(player2.maxHp, player2.getExpansions("fakequanji").length));
        const cnNum = get.cnNumber(num);
        const { index } = await target.chooseJunlingControl(player2, junling, targets).set("prompt", "排异").set("choiceList", [`执行此军令，然后${str}摸${cnNum}张牌并将一张“权”置入弃牌堆`, `不执行此军令，然后${str}可以对至多${cnNum}名与你势力相同的角色各造成1点伤害并移去等量的“权”`]).set("ai", () => {
          const all = Math.max(1, Math.min(player2.maxHp, player2.getExpansions("fakequanji").length));
          const effect = get.junlingEffect(player2, junling, target, targets, target);
          const eff1 = effect + get.effect(player2, { name: "draw" }, player2, target) * all;
          const eff2 = ((source, player3, num2) => {
            const targets2 = game.filterPlayer((current) => {
              return current.isFriendOf(player3) && get.damageEffect(current, source, source) > 0 && get.damageEffect(current, source, player3) < 0;
            }).sort((a, b) => {
              return (get.damageEffect(b, source, source) > 0 - get.damageEffect(b, source, player3)) - (get.damageEffect(a, source, source) > 0 - get.damageEffect(a, source, player3));
            }).slice(0, num2);
            return targets2.reduce((sum, target2) => {
              return sum + (get.damageEffect(target2, source, source) - get.damageEffect(target2, source, player3)) / 2;
            }, 0);
          })(player2, target, all);
          return Math.max(0, get.sgn(eff2 - eff1));
        }).forResult();
        if (index === 0) {
          await target.carryOutJunling(player2, junling, targets);
          await player2.draw(num);
          if (player2.getExpansions("fakequanji").length) {
            const { bool, links } = await player2.chooseButton({ createDialog: ["排异：请移去一张“权”", player2.getExpansions("fakequanji")], forced: true }).forResult();
            if (bool) {
              await player2.loseToDiscardpile({ cards: links });
            }
          }
        } else {
          const result2 = await player2.chooseTarget({
            prompt: `排异：是否对至多${cnNum}名与${get.translation(target)}势力相同的角色各造成1点伤害并移去等量的“权”？`,
            filterTarget: (card, player3, target2) => {
              return target2.isFriendOf(get.event().target);
            },
            selectTarget: [1, num],
            ai: (target2) => {
              return get.damageEffect(target2, get.event().player, get.event().player);
            }
          }).set("target", target).forResult();
          if (result2.bool) {
            const targetx = result2.targets.sortBySeat();
            player2.line(targetx);
            for (const i of targetx) {
              await i.damage();
            }
            if (player2.getExpansions("fakequanji").length) {
              const { bool, links } = await player2.chooseButton({ createDialog: [`排异：请移去${get.cnNumber(targetx.length)}张“权”`, player2.getExpansions("fakequanji")], selectButton: targetx.length, forced: true }).forResult();
              if (bool) {
                await player2.loseToDiscardpile({ cards: links });
              }
            }
          }
        }
      }
    },
    ai: {
      order: 1,
      result: {
        target(player2, target) {
          return -game.countPlayer((current) => {
            return current === target || current.isFriendOf(target);
          });
        }
      },
      combo: "fakequanji"
    }
  },
  fakeshilu: {
    audio: "zyshilu",
    trigger: { player: ["phaseZhunbeiBegin", "phaseUseEnd"] },
    filter(event2, player2) {
      if (event2.name === "phaseZhunbei") {
        return player2.getStorage("fakeshilu").length;
      }
      if (!player2.hasViceCharacter()) {
        return false;
      }
      const skills = get.character(player2.name2, 3).filter((i) => !get.is.locked(i, player2));
      return !player2.hasHistory("useSkill", (evt) => skills.includes(evt.sourceSkill || evt.skill));
    },
    forced: true,
    //locked: false,
    async content(event2, trigger, player2) {
      if (trigger.name === "phaseZhunbei") {
        const num = player2.getStorage("fakeshilu").length;
        await player2.chooseToDiscard({ selectCard: num, position: "h", forced: true });
        await player2.draw(num);
      } else {
        await player2.changeVice().setContent(get.info("fakeshilu").changeVice);
      }
    },
    getGroups(player2) {
      return player2.getStorage("fakeshilu").map((i) => {
        const double = get.is.double(i, true);
        return double ? double : [get.character(i, 1)];
      }).reduce((all, groups) => {
        all.addArray(groups);
        return all;
      }, []);
    },
    async changeVice(event2, trigger, player2) {
      player2.showCharacter(2);
      if (!event2.num) {
        event2.num = 3;
      }
      let group = player2.identity;
      if (!lib.group.includes(group)) {
        group = lib.character[player2.name1][1];
      }
      _status.characterlist.randomSort();
      const tochange = [];
      for (const character of _status.characterlist) {
        if (character.indexOf("gz_jun_") === 0) {
          continue;
        }
        let goon = false;
        const group2 = lib.character[character][1];
        if (group === "ye") {
          if (group2 !== "ye") {
            goon = true;
          }
        } else {
          if (group === group2) {
            goon = true;
          } else {
            const double = get.is.double(character, true);
            if (double && double.includes(group)) {
              goon = true;
            }
          }
        }
        if (goon) {
          tochange.push(character);
        }
      }
      const candidates = tochange.filter((character) => {
        const groups = get.info("fakeshilu").getGroups(player2);
        const doublex = get.is.double(character, true);
        const group2 = doublex ? doublex : [get.character(character, 1)];
        return !group2.some((j) => groups.includes(j));
      }).randomGets(event2.num);
      if (!candidates.length) {
        return;
      }
      const name = candidates.length === 1 ? candidates[0] : (await player2.chooseButton({
        forced: true,
        createDialog: ["请选择要变更的武将牌，并将原副将武将牌置于武将牌上", [candidates, "character"]],
        ai: (button) => get.guozhanRank(button.link)
      }).forResult()).links[0];
      _status.characterlist.remove(name);
      if (player2.hasViceCharacter()) {
        event2.change = true;
      }
      event2.toRemove = player2.name2;
      event2.toChange = name;
      if (event2.change) {
        await event2.trigger("removeCharacterBefore");
      }
      if (event2.hidden && !player2.isUnseen(1)) {
        await player2.hideCharacter(1);
      }
      if (event2.hidden) {
        game.log(player2, "替换了副将", `#g${get.translation(player2.name2)}`);
      } else {
        game.log(player2, "将副将从", `#g${get.translation(player2.name2)}`, "变更为", `#g${get.translation(name)}`);
      }
      player2.viceChanged = true;
      await player2.reinitCharacter(player2.name2, name, false);
      if (event2.change && event2.toRemove) {
        const list = [event2.toRemove];
        player2.markAuto("fakeshilu", list);
        game.log(player2, "将", `#g${get.translation(list)}`, "置于武将牌上作为", "#y“戮”");
        game.broadcastAll(
          (player3, list2) => {
            const cards2 = [];
            for (const character of list2) {
              let cardname = `huashen_card_${character}`;
              lib.card[cardname] = {
                fullimage: true,
                image: `character:${character}`
              };
              lib.translate[cardname] = get.rawName2(character);
              cards2.push(game.createCard(cardname, "", ""));
            }
            player3.$draw(cards2, "nobroadcast");
          },
          player2,
          list
        );
      }
    },
    marktext: "戮",
    intro: {
      content: "character",
      onunmark(storage, player2) {
        if (storage && storage.length) {
          _status.characterlist.addArray(storage);
          storage = [];
        }
      },
      mark(dialog, storage, player2) {
        if (storage && storage.length) {
          dialog.addSmall([storage, "character"]);
        } else {
          return "没有“戮”";
        }
      }
    }
  },
  fakexiongnve: {
    audio: "zyxiongnve",
    trigger: {
      source: "damageBegin1",
      player: ["damageBegin3", "damageBegin4"]
    },
    filter(event2, player2, name) {
      if (!event2.source) {
        return false;
      }
      const num = parseInt(name.slice("damageBegin".length));
      const groups = get.info("fakeshilu").getGroups(player2);
      const goon = event2.card && event2.card.name === "sha";
      if (num !== 4) {
        return goon && (groups.includes(event2.source.identity) || groups.includes(event2.player.identity));
      }
      return !goon && groups.includes(event2.source.identity);
    },
    forced: true,
    //locked: false,
    logTarget(event2, player2) {
      return event2.source === player2 ? event2.player : event2.source;
    },
    async content(event2, trigger, player2) {
      if (parseInt(event2.triggername.slice("damageBegin".length)) === 4) {
        trigger.num--;
      } else {
        trigger.num++;
      }
    },
    ai: {
      combo: "fakeshilu",
      effect: {
        target(card, player2, target) {
          if (card && card.name === "sha") {
            return;
          }
          if (player2.hasSkillTag("jueqing", false, target)) {
            return;
          }
          const groups = get.info("fakeshilu").getGroups(target);
          if (groups.includes(player2.identity)) {
            const num = get.tag(card, "damage");
            if (num) {
              if (num > 1) {
                return 0.5;
              }
              return 0;
            }
          }
        }
      }
    }
  },
  fakehuaiyi: {
    audio: "gzhuaiyi",
    enable: "phaseUse",
    filter(event2, player2) {
      if (!game.hasPlayer((target) => target.isMajor())) {
        return false;
      }
      return player2.hasViceCharacter() || ["h", "e", "j"].some((pos) => {
        const cards2 = player2.getCards(pos);
        return cards2.length && cards2.every((card) => lib.filter.cardDiscardable(card, player2));
      });
    },
    usable: 1,
    chooseButton: {
      dialog() {
        return ui.create.dialog(`###怀异###${get.translation("fakehuaiyi_info")}`);
      },
      chooseControl(event2, player2) {
        const list = [];
        const map = { h: "手牌区", e: "装备区", j: "判定区" };
        list.addArray(
          ["h", "e", "j"].filter((pos) => {
            const cards2 = player2.getCards(pos);
            return cards2.length && cards2.every((card) => lib.filter.cardDiscardable(card, player2));
          }).map((i) => map[i])
        );
        if (player2.hasViceCharacter()) {
          list.push("移除副将");
        }
        list.push("cancel2");
        return list;
      },
      check() {
        const player2 = get.event().player;
        const count = (pos) => {
          const cards2 = player2.getCards(pos);
          return cards2.length && cards2.every((card) => lib.filter.cardDiscardable(card, player2));
        };
        if (count("j")) {
          return "判定区";
        }
        if (player2.hasViceCharacter() && get.guozhanRank(player2.name2, player2) <= 3) {
          return "移除副将";
        }
        if (count("e") && player2.getCards("e") <= 1) {
          return "装备区";
        }
        if (count("h") && player2.getCards("h") <= 2) {
          return "手牌区";
        }
        return "cancel2";
      },
      backup(result2, player2) {
        return {
          audio: "gzhuaiyi",
          filterCard: () => false,
          selectCard: -1,
          info: result2.control,
          async content(event2, trigger, player3) {
            const control = get.info("fakehuaiyi_backup").info;
            if (control === "移除副将") {
              await player3.removeCharacter(1);
            } else {
              const map = { 手牌区: "h", 装备区: "e", 判定区: "j" };
              await player3.discard({ cards: player3.getCards(map[control]) });
            }
            let num = {};
            const targetx = game.filterPlayer((target) => target.isMajor());
            for (const target of targetx) {
              if (typeof num[target.identity] !== "number") {
                num[target.identity] = 0;
              }
            }
            const groups = Object.keys(num);
            const competition = groups.length > 1;
            for (const target of targetx) {
              if (target === player3) {
                continue;
              }
              const { bool, cards: cards2 } = await target.chooseToGive(player3, "he", true, [1, Infinity], `怀异：交给${get.translation(player3)}至少一张牌`).set("ai", (card) => {
                const player4 = get.event().player;
                get.event().targetx;
                if (!get.event().competition || !game.hasPlayer((target2) => {
                  return target2.isFriendOf(player4) && target2.hasViceCharacter() && get.guozhanRank(target2.name2, target2) > 4;
                })) {
                  return -get.value(card);
                }
                if (ui.selected.cards.length >= get.rand(2, 3)) {
                  return 0;
                }
                return 7.5 - get.value(card);
              }).set("targets", targetx).set("num", num).set("prompt2", competition ? "交牌最少的势力的一名角色的副将会被移除" : "").set("complexCard", true).set("competition", competition).forResult();
              if (bool) {
                num[target.identity] += cards2.length;
              }
            }
            groups.sort((a, b) => num[a] - num[b]);
            const group = groups[0];
            if (num[group] < num[groups[groups.length - 1]]) {
              player3.line(targetx.filter((target) => target.identity === group));
              if (targetx.some((target) => target.identity === group && target.hasViceCharacter())) {
                const { bool, targets } = await player3.chooseTarget({
                  prompt: `怀异：移除${get.translation(group)}势力的其中一名角色的副将`,
                  filterTarget: (card, player4, target) => {
                    return target.identity === get.event().group && target.hasViceCharacter();
                  },
                  forced: true,
                  ai: (target) => -get.guozhanRank(target.name2, target)
                }).set("group", group).forResult();
                if (bool) {
                  const target = targets[0];
                  player3.line(target);
                  game.log(player3, "选择了", target);
                  await target.removeCharacter(1);
                }
              }
            }
          },
          ai: { result: { player: 1 } }
        };
      }
    },
    ai: {
      order: 10,
      result: {
        player(player2, target) {
          if (!game.hasPlayer((i) => i.isMajor() && get.attitude(player2, i) < 0)) {
            return 0;
          }
          if (player2.getCards("j").every((card) => lib.filter.cardDiscardable(card, player2))) {
            return 1;
          }
          if (player2.hasViceCharacter() && get.guozhanRank(player2.name2, player2) <= 3) {
            return 1;
          }
          if (player2.getCards("e").every((card) => lib.filter.cardDiscardable(card, player2)) && player2.getCards("e") <= 1) {
            return 1;
          }
          if (player2.getCards("h").every((card) => lib.filter.cardDiscardable(card, player2)) && player2.getCards("h") <= 1) {
            return 1;
          }
          return 0;
        }
      }
    },
    subSkill: { backup: {} }
  },
  fakezisui: {
    audio: "gzzisui",
    trigger: { global: "removeCharacterEnd" },
    filter(event2, player2) {
      return event2.getParent().player === player2;
    },
    forced: true,
    async content(event2, trigger, player2) {
      const list = [trigger.toRemove];
      player2.markAuto("fakezisui", list);
      game.log(player2, "将", `#g${get.translation(list)}`, "置于武将牌上作为", "#y“异”");
      game.broadcastAll(
        (player3, list2) => {
          const cards2 = [];
          for (const item of list2) {
            let cardname = `huashen_card_${item}`;
            lib.card[cardname] = {
              fullimage: true,
              image: `character:${item}`
            };
            lib.translate[cardname] = get.rawName2(item);
            cards2.push(game.createCard(cardname, "", ""));
          }
          player3.$draw(cards2, "nobroadcast");
        },
        player2,
        list
      );
    },
    marktext: "异",
    intro: {
      content: "character",
      onunmark(storage, player2) {
        if (storage && storage.length) {
          _status.characterlist.addArray(storage);
          storage = [];
        }
      },
      mark(dialog, storage, player2) {
        if (storage && storage.length) {
          dialog.addSmall([storage, "character"]);
        } else {
          return "没有“异”";
        }
      }
    },
    group: "fakezisui_effect",
    subSkill: {
      effect: {
        audio: "gzzisui",
        trigger: { player: ["phaseDrawBegin2", "phaseJieshuBegin"] },
        filter(event2, player2) {
          const num = player2.getStorage("fakezisui").length;
          if (!num) {
            return false;
          }
          if (event2.name === "phaseDraw") {
            return !event2.numFixed;
          }
          return num > player2.maxHp;
        },
        forced: true,
        async content(event2, trigger, player2) {
          const num = player2.getStorage("fakezisui").length;
          if (trigger.name === "phaseDraw") {
            trigger.num += num;
          } else {
            await player2.die();
          }
        }
      }
    }
  },
  fakejujian: {
    audio: "gzjujian",
    init(player2) {
      if (player2.checkViceSkill("fakejujian") && !player2.viceChanged) {
        player2.removeMaxHp();
      }
    },
    viceSkill: true,
    filter(event2, player2) {
      return player2.hasCards("he", (card) => {
        return _status.connectMode || get.type(card) !== "basic" && lib.filter.cardDiscardable(card, player2);
      });
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCardTarget({
        prompt: get.prompt2("fakejujian"),
        filterTarget(card, player3, target) {
          return target.isFriendOf(player3);
        },
        filterCard(card, player3) {
          return get.type(card) !== "basic" && lib.filter.cardDiscardable(card, player3);
        },
        position: "he",
        ai1(card) {
          return 7.5 - get.value(card);
        },
        ai2(target) {
          const player3 = get.event().player;
          return Math.max(get.effect(target, { name: "wuzhong" }, player3, player3), get.recoverEffect(target, player3, player3));
        }
      });
    },
    async content(event2, trigger, player2) {
      await player2.discard({ cards: event2.cards });
      const target = event2.targets[0];
      await target.chooseDrawRecover(2, "举荐：摸两张牌或回复1点体力", true);
      await target.mayChangeVice();
    }
  },
  fakexibing: {
    audio: "xibing",
    filter(event2, player2) {
      if (player2 === event2.player || event2.targets.length !== 1 || event2.player.countCards("h") >= event2.player.hp) {
        return false;
      }
      const isBlackShaOrTrick = (card) => {
        return (card.name === "sha" || get.type(card, null, false) === "trick") && get.color(card, false) === "black";
      };
      if (!isBlackShaOrTrick(event2.card)) {
        return false;
      }
      const evt = event2.getParent("phaseUse");
      if (evt.player !== event2.player) {
        return false;
      }
      return event2.player.getHistory("useCard", (evtx) => {
        return isBlackShaOrTrick(evtx.card) && evtx.getParent("phaseUse") === evt;
      })[0] === event2.getParent();
    },
    logTarget: "player",
    check(event2, player2) {
      const target = event2.player;
      const att = get.attitude(player2, target);
      const num2 = Math.min(5, target.hp) - target.countCards("h");
      if (num2 <= 0) {
        return att <= 0;
      }
      const num = target.countCards("h", (card) => {
        return target.hasValueTarget(card, null, true);
      });
      if (!num) {
        return att > 0;
      }
      return (num - num2) * att < 0;
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      const num = trigger.player.hp - trigger.player.countCards("h");
      if (num > 0) {
        await trigger.player.draw(num);
      }
      trigger.player.addTempSkill("fakexibing_banned");
      if (get.mode() !== "guozhan" || player2.isUnseen(2) || trigger.player.isUnseen(2)) {
        return;
      }
      const target = trigger.player;
      const players1 = [player2.name1, player2.name2];
      const players2 = [target.name1, target.name2];
      const result2 = await player2.chooseButton({
        selectButton: 2,
        createDialog: [`是否暗置自己和${get.translation(target)}的各一张武将牌？`, '<div class="text center">你的武将牌</div>', [players1, "character"], `<div class="text center">${get.translation(target)}的武将牌</div>`, [players2, "character"]],
        complexSelect: true,
        filterButton: (button) => {
          return !get.is.jun(button.link) && ui.selected.buttons.length === 0 === _status.event.players.includes(button.link);
        }
      }).set("players", players1).forResult();
      if (!result2.bool) {
        return;
      }
      player2.hideCharacter(player2.name1 === result2.links[0] ? 0 : 1);
      target.hideCharacter(target.name1 === result2.links[1] ? 0 : 1);
      player2.addTempSkill("fakexibing_nomingzhi");
      target.addTempSkill("fakexibing_nomingzhi");
    },
    subSkill: {
      banned: {
        mod: {
          cardEnabled2(card) {
            if (get.position(card) === "h") {
              return false;
            }
          }
        }
      },
      nomingzhi: {
        ai: { nomingzhi: true }
      }
    }
  },
  fakechengshang: {
    audio: "chengshang",
    trigger: { player: "useCardAfter" },
    filter(event2, player2) {
      if (!lib.suit.includes(get.suit(event2.card, false)) || typeof get.number(event2.card) !== "number") {
        return false;
      }
      if (player2.getHistory("sourceDamage", (evt) => {
        return evt.card === event2.card;
      }).length) {
        return false;
      }
      const phsu = event2.getParent("phaseUse");
      if (!phsu || phsu.player !== player2) {
        return false;
      }
      return event2.targets.some((i) => i.isEnemyOf(player2));
    },
    usable: 1,
    preHidden: true,
    async content(event2, trigger, player2) {
      await player2.draw();
      player2.tempBanSkill("fakechengshang", "phaseUseAfter", false);
      player2.addTempSkill("fakechengshang_effect");
      player2.markAuto("fakechengshang_effect", [[get.suit(trigger.card), get.number(trigger.card), trigger.card.name]]);
    },
    subSkill: {
      effect: {
        charlotte: true,
        onremove: true,
        hiddenCard(player2, name) {
          const type2 = get.type(name);
          if (type2 !== "basic" && type2 !== "trick") {
            return false;
          }
          const storage = player2.getStorage("fakechengshang_effect");
          return lib.card.list.some((list) => {
            return name === list[2] && storage.some((card) => {
              return card[0] === list[0] && card[1] === list[1] && card[2] !== list[2];
            });
          });
        },
        audio: "chengshang",
        enable: "phaseUse",
        chooseButton: {
          dialog(event2, player2) {
            const storage = player2.getStorage("fakechengshang_effect");
            const list = lib.card.list.filter((list2) => {
              const type2 = get.type(list2[2]);
              if (type2 !== "basic" && type2 !== "trick") {
                return false;
              }
              return storage.some((card) => card[0] === list2[0] && card[1] === list2[1] && card[2] !== list2[2]);
            }).map((card) => [get.translation(get.type2(card[2])), "", card[2], card[3]]);
            return ui.create.dialog("承赏", [list, "vcard"]);
          },
          filter(button, player2) {
            return get.event().getParent().filterCard({ name: button.link[2], nature: button.link[3] }, player2, event);
          },
          check(button) {
            const player2 = get.event().player;
            const card = { name: button.link[2], nature: button.link[3] };
            if (player2.hasCards("hes", (cardx) => cardx.name === card.name)) {
              return 0;
            }
            return player2.getUseValue(card);
          },
          backup(links, player2) {
            return {
              audio: "chengshang",
              filterCard: true,
              position: "hs",
              popname: true,
              log: false,
              async precontent(event2, trigger, player3) {
                player3.logSkill("fakechengshang_effect");
                const cardx = event2.result.card;
                const removes = player3.getStorage("fakechengshang_effect").filter((card) => {
                  return lib.card.list.some((list) => {
                    return cardx.name === list[2] && card[0] === list[0] && card[1] === list[1] && card[2] !== list[2];
                  });
                });
                player3.unmarkAuto("fakechengshang_effect", removes);
              },
              viewAs: {
                name: links[0][2],
                nature: links[0][3]
              }
            };
          },
          prompt(links, player2) {
            return `将一张手牌当作${get.translation(links[0][3]) || ""}${get.translation(links[0][2])}使用`;
          }
        }
      }
    }
  },
  fakezhente: {
    audio: "zhente",
    inherit: "zhente",
    filter(event2, player2) {
      const color = get.color(event2.card);
      const type2 = get.type(event2.card);
      if (player2 === event2.player || event2.player.isDead() || color === "none") {
        return false;
      }
      return type2 === "trick" || type2 === "basic" && color === "black";
    }
  },
  fakezhiwei: {
    unique: true,
    audio: "zhiwei",
    inherit: "zhiwei",
    direct: false,
    filter(event2, player2) {
      if (!game.hasPlayer((current) => current !== player2)) {
        return false;
      }
      return event2.name === "showCharacter" && event2.toShow.some((name) => {
        return get.character(name, 3).includes("fakezhiwei");
      });
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: "请选择【至微】的目标",
        prompt2: lib.translate.fakezhiwei_info,
        forced: true,
        filterTarget: lib.filter.notMe,
        ai: (target) => {
          const attitude = get.attitude(_status.event.player, target);
          return attitude > 0 ? 1 + attitude : Math.random();
        }
      }).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      player2.storage.fakezhiwei_effect = target;
      player2.addSkill("fakezhiwei_effect");
    },
    onremove(player2) {
      player2.removeSkill("fakezhiwei_effect");
    },
    subSkill: {
      effect: {
        charlotte: true,
        onremove: true,
        audio: "zhiwei",
        trigger: { player: "hideCharacterBefore" },
        filter(event2, player2) {
          return get.character(event2.toHide, 3).includes("fakezhiwei");
        },
        forced: true,
        async content(event2, trigger, player2) {
          trigger.cancel();
        },
        mark: "character",
        intro: { content: "已选择$" },
        group: ["fakezhiwei_draw", "fakezhiwei_discard", "fakezhiwei_gain", "fakezhiwei_clear"]
      },
      draw: {
        audio: "zhiwei",
        trigger: { global: "damageSource" },
        forced: true,
        filter(event2, player2) {
          return event2.source === player2.storage.fakezhiwei_effect;
        },
        logTarget: "source",
        async content(event2, trigger, player2) {
          await player2.draw();
        }
      },
      discard: {
        audio: "zhiwei",
        trigger: { global: "damageEnd" },
        forced: true,
        filter(event2, player2) {
          return event2.player === player2.storage.fakezhiwei_effect && player2.hasCard((card) => {
            return _status.connectMode || lib.filter.cardDiscardable(card, player2);
          }, "h");
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          await player2.chooseToDiscard({ position: "h", forced: true });
        }
      },
      gain: {
        audio: "zhiwei",
        trigger: {
          player: "loseAfter",
          global: "loseAsyncAfter"
        },
        forced: true,
        filter(event2, player2) {
          if (event2.type !== "discard" || event2.getlx === false || event2.getParent("phaseDiscard").player !== player2 || !player2.storage.fakezhiwei_effect?.isIn()) {
            return false;
          }
          const evt = event2.getl(player2);
          return evt && evt.cards2.filterInD("d").length > 0;
        },
        logTarget(event2, player2) {
          return player2.storage.fakezhiwei_effect;
        },
        async content(event2, trigger, player2) {
          if (trigger.delay === false) {
            await game.delay();
          }
          await player2.storage.fakezhiwei_effect.gain({
            cards: trigger.getl(player2).cards2.filterInD("d"),
            animate: "gain2"
          });
        }
      },
      clear: {
        audio: "zhiwei",
        trigger: {
          global: "die",
          player: ["hideCharacterEnd", "removeCharacterEnd"]
        },
        forced: true,
        filter(event2, player2) {
          if (event2.name === "die") {
            return event2.player === player2.storage.fakezhiwei_effect;
          }
          if (event2.name === "removeCharacter") {
            return get.character(event2.toRemove, 3).includes("fakezhiwei");
          }
          return get.character(event2.toHide, 3).includes("fakezhiwei");
        },
        async content(event2, trigger, player2) {
          player2.removeSkill("fakezhiwei_effect");
          if (trigger.name !== "die") {
            return;
          }
          const hideEvents = [];
          if (get.character(player2.name1, 3).includes("fakezhiwei")) {
            hideEvents.push(player2.hideCharacter(0));
          }
          if (get.character(player2.name2, 3).includes("fakezhiwei")) {
            hideEvents.push(player2.hideCharacter(1));
          }
          for (const hideEvent of hideEvents) {
            await hideEvent;
          }
        }
      }
    }
  },
  fakekuangcai: {
    inherit: "gzrekuangcai",
    async content(event2, trigger, player2) {
      const goon = Boolean(player2.getHistory("useCard").length);
      get.info("rekuangcai").change(player2, goon ? -1 : 1);
      player2.when({ global: "phaseAfter" }).step(async () => {
        get.info("rekuangcai").change(player2, goon ? 1 : -1);
      });
    }
  },
  faketunchu: {
    audio: "tunchu",
    trigger: { player: "phaseDrawBegin2" },
    filter(event2, player2) {
      return !event2.numFixed;
    },
    check(event2, player2) {
      return player2.countCards("h") <= 2;
    },
    locked: false,
    preHidden: true,
    async content(event2, trigger, player2) {
      trigger.num += 2;
      player2.when(["phaseDrawEnd", "phaseDrawSkipped", "phaseDrawCancelled"]).filter((evt) => evt === trigger).step(async (event3, trigger2, player3) => {
        let expansionEvent;
        const nh = player3.countCards("h");
        if (nh) {
          const result2 = await player3.chooseCard({
            position: "h",
            selectCard: [1, Math.min(nh, 2)],
            prompt: "将至多两张手牌置于你的武将牌上",
            forced: true,
            ai: (card) => {
              return 7.5 - get.value(card);
            }
          }).forResult();
          if (result2.bool) {
            expansionEvent = player3.addToExpansion({ cards: result2.cards, source: player3, animate: "giveAuto", gaintag: ["faketunchu"] });
          }
        }
        player3.addTempSkill("faketunchu_effect");
        if (expansionEvent) {
          await expansionEvent;
        }
      });
    },
    intro: {
      content: "expansion",
      markcount: "expansion"
    },
    marktext: "粮",
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    },
    subSkill: {
      effect: {
        charlotte: true,
        mod: {
          cardEnabled(card, player2) {
            if (card.name === "sha") {
              return false;
            }
          }
        },
        mark: true,
        intro: { content: "本回合不能使用【杀】" }
      }
    }
  },
  fakeshuliang: {
    audio: "shuliang",
    trigger: { global: "phaseJieshuBegin" },
    filter(event2, player2) {
      const num = player2.getExpansions("faketunchu").length;
      if (!num || !event2.player.isFriendOf(player2)) {
        return false;
      }
      return event2.player.isIn() && get.distance(player2, event2.player) <= num;
    },
    async cost(event2, trigger, player2) {
      const { bool, links } = await player2.chooseButton({
        createDialog: [get.prompt2("fakeshuliang", trigger.player), player2.getExpansions("faketunchu")],
        ai: (button) => {
          if (get.attitude(get.event().player, get.event().getTrigger().player) <= 0) {
            return 0;
          }
          return 1 + Math.random();
        }
      }).setHiddenSkill("fakeshuliang").forResult();
      event2.result = { bool, cost_data: links };
    },
    preHidden: true,
    logTarget: "player",
    async content(event2, trigger, player2) {
      const discardEvent = player2.loseToDiscardpile({ cards: event2.cost_data });
      const drawEvent = trigger.player.draw(2);
      await discardEvent;
      await drawEvent;
    },
    ai: { combo: "faketunchu" }
  },
  fakedujin: {
    audio: "dujin",
    inherit: "dujin",
    filter(event2, player2) {
      return player2.hasCards("e") && !event2.numFixed;
    },
    async content(event2, trigger, player2) {
      trigger.num += Math.ceil(player2.countCards("e") / 2);
    },
    group: "fakedujin_first",
    subSkill: {
      first: {
        audio: "dujin",
        trigger: { player: "showCharacterEnd" },
        filter(event2, player2) {
          if (game.getAllGlobalHistory(
            "everything",
            (evt) => {
              return evt.name === "showCharacter" && evt.player === player2 && evt.toShow.some((i) => get.character(i, 3).includes("fakedujin"));
            },
            event2
          ).indexOf(event2) !== 0) {
            return false;
          }
          return game.getAllGlobalHistory("everything", (evt) => {
            return evt.name === "showCharacter" && evt.player.isFriendOf(player2);
          })[0].player === player2;
        },
        forced: true,
        locked: false,
        async content(event2, trigger, player2) {
          player2.addMark("xianqu_mark", 1);
        }
      }
    }
  },
  fakezhufu: {
    audio: "spwuku",
    enable: "phaseUse",
    filter(event2, player2) {
      return player2.hasCard((card) => {
        return get.info("fakezhufu").filterCard(card, player2);
      }, "he");
    },
    filterCard(card, player2) {
      if (!lib.suit.includes(get.suit(card))) {
        return false;
      }
      return lib.filter.cardDiscardable(card, player2) && !player2.getStorage("fakezhufu_effect").includes(get.suit(card));
    },
    position: "he",
    check(card) {
      const player2 = get.event().player;
      const cards2 = player2.getCards("hs", (card2) => player2.hasValueTarget(card2, true, true));
      const discards = player2.getCards("he", (card2) => get.info("fakezhufu").filterCard(card2, player2));
      for (let i = 1; i < discards.length; i++) {
        if (discards.slice(0, i).some((card2) => get.suit(card2) === get.suit(discards[i]))) {
          discards.splice(i--, 1);
        }
      }
      cards2.removeArray(discards);
      if (!cards2.length || !discards.length) {
        return 0;
      }
      cards2.sort((a, b) => {
        return (player2.getUseValue(b, true, true) > 0 ? get.order(b) : 0) - (player2.getUseValue(a, true, true) > 0 ? get.order(a) : 0);
      });
      const cardx = cards2[0];
      if (get.order(cardx, player2) > 0 && discards.includes(card)) {
        if (get.suit(card) === "heart" && get.type(cardx) !== "equip" && ((card2, player3) => {
          const num = get.info("fakezhufu").getMaxUseTarget(card2, player3);
          return num !== -1 && game.countPlayer((target) => player3.canUse(card2, target, true, true) && get.effect(target, card2, player3, player3) > 0) > num;
        })(cardx, player2) && game.hasPlayer((target) => {
          return target.isFriendOf(player2) && target.hasCard((cardy) => {
            return lib.filter.cardDiscardable(cardy, target) && get.type2(cardy) === get.type2(cardx);
          }, "h");
        }) || get.suit(card) === "diamond" && get.type(cardx) !== "equip" && !game.hasPlayer((target) => {
          return target.countCards("h") > player2.countCards("h") - (get.position(card) === "h" ? 1 : 0) - (get.position(cardx) === "h" ? 1 : 0);
        }) || get.suit(card) === "spade" && player2.getHp() === 1 || get.suit(card) === "club" && get.tag(cardx, "damage") && player2.countCards("h") - (get.position(card) === "h" ? 1 : 0) - (get.position(cardx) === "h" ? 1 : 0) === 0) {
          return 1 / (get.value(card) || 0.5);
        }
      }
      return 0;
    },
    async content(event2, trigger, player2) {
      const suit = get.suit(event2.cards[0], player2);
      player2.addTempSkill("fakezhufu_effect", "phaseUseAfter");
      player2.markAuto("fakezhufu_effect", [[suit, false]]);
    },
    ai: {
      order(item, player2) {
        const cards2 = player2.getCards("hs", (card) => player2.hasValueTarget(card, true, true));
        const discards = player2.getCards("he", (card) => get.info("fakezhufu").filterCard(card, player2));
        for (let i = 1; i < discards.length; i++) {
          if (discards.slice(0, i).some((card) => get.suit(card) === get.suit(discards[i]))) {
            discards.splice(i--, 1);
          }
        }
        cards2.removeArray(discards);
        if (!cards2.length || !discards.length) {
          return 0;
        }
        cards2.sort((a, b) => {
          return (player2.getUseValue(b, true, true) > 0 ? get.order(b) : 0) - (player2.getUseValue(a, true, true) > 0 ? get.order(a) : 0);
        });
        const cardx = cards2[0];
        return get.order(cardx, player2) > 0 && (discards.some((card) => {
          return get.suit(card) === "heart";
        }) && get.type(cardx) !== "equip" && ((card, player3) => {
          const num = get.info("fakezhufu").getMaxUseTarget(card, player3);
          return num !== -1 && game.countPlayer((target) => player3.canUse(card, target, true, true) && get.effect(target, card, player3, player3) > 0) > num;
        })(cardx, player2) && game.hasPlayer((target) => {
          return target.isFriendOf(player2) && target.hasCard((cardy) => {
            return lib.filter.cardDiscardable(cardy, target) && get.type2(cardy) === get.type2(cardx);
          }, "h");
        }) || get.type(cardx) !== "equip" && discards.some((card) => {
          return get.suit(card) === "diamond" && !game.hasPlayer((target) => {
            return target.countCards("h") > player2.countCards("h") - (get.position(card) === "h" ? 1 : 0) - (get.position(cardx) === "h" ? 1 : 0);
          });
        }) || discards.some((card) => {
          return get.suit(card) === "spade";
        }) && player2.getHp() === 1 || get.tag(cardx, "damage") && discards.some((card) => {
          return get.suit(card) === "club" && player2.countCards("h") - (get.position(card) === "h" ? 1 : 0) - (get.position(cardx) === "h" ? 1 : 0) === 0;
        })) ? get.order(cardx, player2) + 1e-5 : 0;
      },
      result: {
        player(player2, target) {
          const cards2 = player2.getCards("hs", (card) => player2.hasValueTarget(card, true, true));
          let discards = player2.getCards("he", (card) => get.info("fakezhufu").filterCard(card, player2));
          discards = discards.sort((a, b) => get.value(a) - get.value(b));
          for (let i = 1; i < discards.length; i++) {
            if (discards.slice(0, i).some((card) => get.suit(card) === get.suit(discards[i]))) {
              discards.splice(i--, 1);
            }
          }
          cards2.removeArray(discards);
          if (!cards2.length || !discards.length) {
            return 0;
          }
          if (discards.some((card) => {
            return get.suit(card) === "heart";
          }) && cards2.some((card) => {
            return get.type(card) !== "equip" && ((card2, player3) => {
              const num = get.info("fakezhufu").getMaxUseTarget(card2, player3);
              return num !== -1 && game.countPlayer((target2) => player3.canUse(card2, target2, true, true) && get.effect(target2, card2, player3, player3) > 0) > num;
            })(card, player2) && game.hasPlayer((target2) => {
              return target2.isFriendOf(player2) && target2.hasCard((cardx) => {
                return lib.filter.cardDiscardable(cardx, target2) && get.type2(cardx) === get.type2(card);
              }, "h");
            });
          }) || discards.some((card) => {
            return get.suit(card) === "diamond" && cards2.some((cardx) => {
              return get.type(cardx) !== "equip" && !game.hasPlayer((target2) => {
                return target2.countCards("h") > player2.countCards("h") - (get.position(card) === "h" ? 1 : 0) - (get.position(cardx) === "h" ? 1 : 0);
              });
            });
          }) || discards.some((card) => {
            return get.suit(card) === "spade";
          }) && player2.getHp() === 1 || discards.some((card) => {
            return get.suit(card) === "club" && cards2.some((cardx) => {
              return get.tag(cardx, "damage") && player2.countCards("h") - (get.position(card) === "h" ? 1 : 0) - (get.position(cardx) === "h" ? 1 : 0) === 0;
            });
          })) {
            return 1;
          }
          return 0;
        }
      }
    },
    subSkill: {
      effect: {
        charlotte: true,
        onremove: true,
        intro: {
          content(storage) {
            const suitStorage = storage.slice().sort((a, b) => lib.suit.indexOf(a[0]) - lib.suit.indexOf(b[0]));
            const suits = suitStorage.reduce((str2, list) => str2 + get.translation(list[0]), "");
            const usedSuits = suitStorage.filter((list) => list[1]).reduce((str2, list) => str2 + get.translation(list[0]), "");
            let str = "";
            str += "<li>已弃置过的花色：";
            str += suits;
            if (usedSuits.length) {
              str += "<br><li>已触发过的花色：";
              str += usedSuits;
            }
            return str;
          }
        },
        audio: "spwuku",
        trigger: { player: "yingbian" },
        filter(event2, player2) {
          return player2.getStorage("fakezhufu_effect").some((list) => !list[1]);
        },
        forced: true,
        firstDo: true,
        async content(event2, trigger, player2) {
          const list = player2.getStorage("fakezhufu_effect").filter((i) => !i[1]);
          const forced = ((trigger2, player3) => {
            if (trigger2.forceYingbian || player3.hasSkillTag("forceYingbian")) {
              return true;
            }
            const list2 = trigger2.temporaryYingbian || [];
            return list2.includes("force") || get.cardtag(trigger2.card, "yingbian_force");
          })(trigger, player2);
          if (forced) {
            player2.popup("yingbian_force_tag", lib.yingbian.condition.color.get("force"));
            game.log(player2, "触发了", "#g【注傅】", "为", trigger.card, "添加的应变条件");
          }
          const hasYingBian = trigger.temporaryYingbian || [];
          const map = get.info("fakezhufu").YingBianMap;
          for (const j of list) {
            player2.storage.fakezhufu_effect[player2.getStorage("fakezhufu_effect").indexOf(j)][1] = true;
            const tag = map[j[0]][0];
            const eff = map[j[0]][1];
            if (get.cardtag(trigger.card, `yingbian_${tag}`)) {
              continue;
            }
            if (j[0] === "heart") {
              if (!forced && !hasYingBian.includes("add")) {
                const result2 = await lib.yingbian.condition.complex.get("zhuzhan")(trigger).forResult();
                if (result2.bool) {
                  game.log(player2, "触发了", "#g【注傅】", "为", trigger.card, "添加的应变条件（", `#g${get.translation(j[0])}`, "）");
                  trigger.yingbian_addTarget = true;
                  player2.addTempSkill("yingbian_changeTarget");
                }
              } else {
                if (!forced) {
                  game.log(player2, "触发了", "#g【注傅】", "为", trigger.card, "添加的应变条件（", `#g${get.translation(j[0])}`, "）");
                }
                trigger.yingbian_addTarget = true;
                player2.addTempSkill("yingbian_changeTarget");
              }
            } else {
              const goon = hasYingBian.includes(eff) || lib.yingbian.condition.simple.get(tag)(trigger);
              if (!forced && goon) {
                player2.popup("yingbian_force_tag", lib.yingbian.condition.color.get(eff));
                game.log(player2, "触发了", "#g【注傅】", "为", trigger.card, "添加的应变条件（", `#g${get.translation(j[0])}`, "）");
              }
              if (forced || goon) {
                await game.yingbianEffect(trigger, lib.yingbian.effect.get(eff));
              }
            }
          }
        }
      }
    },
    YingBianMap: {
      heart: ["zhuzhan", "add"],
      diamond: ["fujia", "hit"],
      spade: ["canqu", "draw"],
      club: ["kongchao", "damage"]
    },
    getMaxUseTarget(card, player2) {
      let range;
      const select = get.copy(get.info(card).selectTarget);
      if (select == null) {
        range = [1, 1];
      } else if (typeof select === "number") {
        range = [select, select];
      } else if (get.itemtype(select) === "select") {
        range = select;
      } else if (typeof select === "function") {
        range = select(card, player2);
        if (typeof range === "number") {
          range = [range, range];
        }
      }
      game.checkMod(card, player2, range, "selectTarget", player2);
      return range;
    }
  },
  fakeguishu: {
    inherit: "hmkguishu",
    usable: 1
  },
  fakeyuanyu: {
    inherit: "hmkyuanyu",
    filter(event2, player2) {
      if (event2.num <= 0 || !event2.source) {
        return false;
      }
      return !event2.source.inRange(player2);
    },
    async content(event2, trigger, player2) {
      trigger.num--;
    },
    ai: {
      effect: {
        target(card, player2, target) {
          if (player2.hasSkillTag("jueqing", false, target)) {
            return;
          }
          if (player2.inRange(target)) {
            return;
          }
          const num = get.tag(card, "damage");
          if (num) {
            if (num > 1) {
              return 0.5;
            }
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  fakemibei: {
    audio: "mibei",
    trigger: { player: "phaseZhunbeiBegin" },
    filter(event2, player2) {
      return !player2.isMaxHandcard();
    },
    async cost(event2, trigger, player2) {
      const filterTarget = (card, player3, target) => {
        return target !== player3 && target.isMaxHandcard();
      };
      const targetx = game.filterPlayer((current) => filterTarget(null, player2, current));
      if (targetx.length === 1) {
        event2.result = { bool: true, targets: targetx };
      } else {
        event2.result = await player2.chooseTarget({
          filterTarget,
          forced: true,
          prompt2: lib.translate.fakemibei_info,
          prompt: "请选择【秘备】的目标",
          ai: (target) => {
            const player3 = get.event().player;
            return get.attitude(player3, target);
          }
        }).forResult();
      }
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const { junling, targets } = await target.chooseJunlingFor(player2).forResult();
      const { index } = await player2.chooseJunlingControl(target, junling, targets).set("prompt", "秘备：是否执行军令？").forResult();
      if (index === 0) {
        await player2.carryOutJunling(target, junling, targets);
      }
    },
    group: "fakemibei_junling",
    subSkill: {
      junling: {
        audio: "mibei",
        trigger: { player: ["carryOutJunlingEnd", "chooseJunlingControlEnd"] },
        filter(event2, player2) {
          if (event2.name === "carryOutJunling") {
            return event2.source.countCards("h") > player2.countCards("h");
          }
          return event2.result.index === 1 && player2.hasCards("h");
        },
        forced: true,
        locked: false,
        async content(event2, trigger, player2) {
          if (trigger.name === "carryOutJunling") {
            const num = Math.min(5, trigger.source.countCards("h") - player2.countCards("h"));
            await player2.draw(num);
          } else {
            const { bool, cards: cards2 } = await player2.chooseCard({
              prompt: "秘备：展示一至三张手牌，本回合你可以将其中一张牌当作另一张基本牌或普通锦囊牌使用一次",
              selectCard: [1, 3],
              forced: true,
              ai: (card) => {
                const player3 = get.event().player;
                const goon = _status.currentPhase === player3;
                if (goon) {
                  return player3.getUseValue(card) / get.value(card);
                }
                return get.value(card);
              }
            }).forResult();
            if (bool) {
              await player2.showCards(cards2, `${get.translation(player2)}发动了【秘备】`);
              player2.addGaintag(cards2, "fakemibei_effect");
              player2.addTempSkill("fakemibei_effect");
            }
          }
        }
      },
      effect: {
        charlotte: true,
        onremove(player2) {
          player2.removeGaintag("fakemibei_effect");
        },
        hiddenCard(player2, name) {
          const cards2 = player2.getCards("h", (card) => card.hasGaintag("fakemibei_effect"));
          if (cards2.length < 2) {
            return false;
          }
          const type2 = get.type(name);
          if (type2 !== "basic" && type2 !== "trick") {
            return false;
          }
          return cards2.slice().map((i) => i.name).includes(name);
        },
        audio: "mibei",
        enable: "phaseUse",
        chooseButton: {
          dialog(event2, player2) {
            const list = player2.getCards("h", (card) => {
              const type2 = get.type(card);
              if (type2 !== "basic" && type2 !== "trick") {
                return false;
              }
              return card.hasGaintag("fakemibei_effect");
            }).sort((a, b) => {
              return lib.inpile.indexOf(a.name) + get.natureList(a, false).reduce((sum, nature) => {
                return sum + lib.inpile_nature.indexOf(nature);
              }, 0) - lib.inpile.indexOf(b.name) - get.natureList(b, false).reduce((sum, nature) => {
                return sum + lib.inpile_nature.indexOf(nature);
              }, 0);
            }).slice().map((card) => [get.translation(get.type(card)), "", card.name, card.nature]);
            return ui.create.dialog("秘备", [list, "vcard"]);
          },
          filter(button, player2) {
            const event2 = get.event().getParent();
            return event2.filterCard({ name: button.link[2], nature: button.link[3] }, player2, event2);
          },
          check(button) {
            const player2 = get.event().player;
            const card = { name: button.link[2], nature: button.link[3] };
            if (player2.hasCards("hes", (cardx) => cardx.name === card.name)) {
              return 0;
            }
            return player2.getUseValue(card);
          },
          backup(links, player2) {
            return {
              audio: "chengshang",
              filterCard(card, player3) {
                const cardx = get.info("fakemibei_effect_backup").viewAs;
                if (cardx.name === card.name && cardx.nature === card.nature) {
                  return false;
                }
                return card.hasGaintag("fakemibei_effect");
              },
              position: "h",
              popname: true,
              log: false,
              async precontent(event2, trigger, player3) {
                player3.logSkill("fakemibei_effect");
                player3.tempBanSkill("fakemibei_effect", null, false);
              },
              viewAs: {
                name: links[0][2],
                nature: links[0][3]
              }
            };
          },
          prompt(links, player2) {
            return `将一张“秘备”牌当作${get.translation(links[0][3]) || ""}${get.translation(links[0][2])}使用`;
          }
        }
      }
    }
  },
  fakeqizhi: {
    audio: "qizhi",
    trigger: { player: "useCard1" },
    filter(event2, player2) {
      if (!event2.targets || !event2.targets.length) {
        return false;
      }
      if (_status.currentPhase !== player2) {
        return false;
      }
      if (get.type(event2.card) === "equip") {
        return false;
      }
      return game.hasPlayer((target) => !event2.targets.includes(target) && target.hasCards("he"));
    },
    direct: false,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2("fakeqizhi"),
        filterTarget: (card, player3, target) => {
          return !get.event().getTrigger().targets.includes(target) && target.hasCards("he");
        },
        ai: (target) => {
          const player3 = get.event().player;
          if (target === player3) {
            return 2;
          }
          if (get.attitude(player3, target) <= 0) {
            return 1;
          }
          return 0.5;
        }
      }).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const { bool, cards: cards2 } = await player2.discardPlayerCard({ target, position: "he", forced: true }).forResult();
      if (bool) {
        await target.draw();
        if (cards2.some((i) => get.suit(i, target) === get.suit(trigger.card))) {
          trigger.forceYingbian = true;
        }
      }
    }
  },
  fakejinqu: {
    audio: "jinqu",
    trigger: { player: "phaseJieshuBegin" },
    check(event2, player2) {
      return player2.getHistory("useSkill", (evt) => {
        return evt.skill === "fakeqizhi";
      }).length >= player2.countCards("h");
    },
    prompt2(event2, player2) {
      const num = player2.getHistory("useSkill", (evt) => evt.skill === "fakeqizhi").length;
      return `摸两张牌，然后将手牌弃置至${get.cnNumber(num)}张`;
    },
    async content(event2, trigger, player2) {
      await player2.draw(2);
      const discardNum = player2.countCards("h") - player2.getHistory("useSkill", (evt) => {
        return evt.skill === "fakeqizhi";
      }).length;
      if (discardNum > 0) {
        await player2.chooseToDiscard({ selectCard: discardNum, forced: true });
      }
    },
    ai: { combo: "fakeqizhi" }
  },
  fakejuzhan: {
    zhuanhuanji: true,
    locked: false,
    marktext: "☯",
    intro: {
      content(storage) {
        if (storage) {
          return "当你使用【杀】指定目标后，你可以获得其X张牌，然后若你的武将牌均明置，则其可以暗置此武将牌，且你本回合不能明置此武将牌（X为你已损失的体力值且至少为1）";
        }
        return "当你成为【杀】的目标后，你可以与其各摸X张牌，然后其武将牌均明置，则你可以暗置其一张武将牌，且其本回合不能明置此武将牌（X为其已损失的体力值且至少为1）";
      }
    },
    audio: "nzry_juzhan_1",
    trigger: {
      player: "useCardToPlayered",
      target: "useCardToTargeted"
    },
    filter(event2, player2, name) {
      if (event2.card.name !== "sha" || player2._isInJuzhan === name) {
        return false;
      }
      const storage = player2.storage.fakejuzhan;
      if (event2.player === player2 !== Boolean(storage)) {
        return false;
      }
      if (storage && !event2.target.hasCards("he")) {
        return false;
      }
      return true;
    },
    async cost(event2, trigger, player2) {
      const storage = player2.storage.fakejuzhan;
      const target = trigger[storage ? "target" : "player"];
      event2.result = await player2.chooseBool({ prompt: get.prompt2(event2.skill, target) }).setHiddenSkill("fakejuzhan").forResult();
      if (event2.result.bool) {
        player2._isInJuzhan = event2.triggername;
      }
    },
    async content(event2, trigger, player2) {
      delete player2._isInJuzhan;
      const storage = player2.storage.fakejuzhan;
      player2.changeZhuanhuanji("fakejuzhan");
      const target = trigger[storage ? "target" : "player"];
      const num = Math.max(target.getDamagedHp(), 1);
      if (!storage) {
        await player2.draw({ num, nodelay: true });
        await target.draw(num);
        if (!target.isUnseen(2)) {
          const { bool, links } = await player2.chooseButton({ createDialog: [`拒战：是否暗置${get.translation(target)}的一张武将牌？`, `<div class="text center">${get.translation(target)}的武将牌</div>`, [[target.name1, target.name2], "character"]], filterButton: (button) => !get.is.jun(button.link) }).forResult();
          if (bool) {
            await target.hideCharacter(target.name1 === links[0] ? 0 : 1);
            target.addTempSkill("donggui2");
          }
        }
      } else {
        await player2.gainPlayerCard({ target, selectButton: num, position: "he", forced: true, allowChooseAll: true });
        const names = [player2.name1, player2.name2].filter((i) => {
          return get.character(i, 3).includes("fakejuzhan");
        });
        if (!player2.isUnseen(2) && names.length) {
          const { bool, links } = await target.chooseBool({ prompt: `拒战：是否暗置${get.translation(player2)}的${names.includes(player2.name1) ? "主将" : ""}${names.length > 1 ? "和" : ""}${names.includes(player2.name2) ? "副将" : ""}?` }).forResult();
          if (bool) {
            if (names.includes(player2.name1)) {
              await player2.hideCharacter(0);
            }
            if (names.includes(player2.name2)) {
              await player2.hideCharacter(1);
            }
            player2.addTempSkill("donggui2");
          }
        }
      }
    },
    group: "fakejuzhan_mark",
    subSkill: {
      mark: {
        charlotte: true,
        trigger: { player: ["hideCharacterBegin", "showCharacterEnd"] },
        filter(event2, player2) {
          if (event2.name === "hideCharacter") {
            return get.character(event2.toHide, 3).includes("fakejuzhan");
          }
          return event2.toShow?.some((name) => {
            return get.character(name, 3).includes("fakejuzhan");
          });
        },
        forced: true,
        popup: false,
        firstDo: true,
        async content(event2, trigger, player2) {
          player2[`${trigger.name === "hideCharacter" ? "un" : ""}markSkill`]("fakejuzhan");
        }
      }
    }
  },
  fakedanshou: {
    audio: "mobiledanshou",
    trigger: { global: "phaseZhunbeiBegin" },
    filter(event2, player2) {
      return ["h", "e", "j"].some((pos) => {
        const cards2 = player2.getCards(pos);
        return cards2.length > 0 && cards2.every((card) => lib.filter.cardDiscardable(card, player2));
      });
    },
    async cost(event2, trigger, player2) {
      const list = [];
      const map = { h: "手牌区", e: "装备区", j: "判定区" };
      list.addArray(
        ["h", "e", "j"].filter((pos) => {
          const cards2 = player2.getCards(pos);
          return cards2.length > 0 && cards2.every((card) => lib.filter.cardDiscardable(card, player2));
        }).map((i) => map[i])
      );
      list.push("cancel2");
      const { control } = await player2.chooseControl({
        controls: list,
        prompt: get.prompt2("fakedanshou", trigger.player),
        ai: () => {
          const player3 = get.event().player;
          const controls = get.event().controls.slice();
          if (controls.includes("判定区")) {
            return "判定区";
          }
          if (controls.includes("装备区") && player3.countCards("e") < 3) {
            return "装备区";
          }
          if (controls.includes("手牌区") && player3.countCards("e") < 5) {
            return "手牌区";
          }
          return "cancel2";
        }
      }).forResult();
      event2.result = { bool: control !== "cancel2", cost_data: control };
    },
    round: 1,
    logTarget: "player",
    async content(event2, trigger, player2) {
      player2.popup(event2.cost_data);
      await player2.discard({ cards: player2.getCards({ 手牌区: "h", 装备区: "e", 判定区: "j" }[event2.cost_data]) });
      player2.addTempSkill("fakedanshou_effect");
      player2.addMark("fakedanshou_effect", 1, false);
    },
    subSkill: {
      effect: {
        charlotte: true,
        onremove(player2) {
          delete player2.storage.fakedanshou_effect;
          delete player2._fakedanshou_effect;
        },
        audio: "mobiledanshou",
        trigger: {
          global: ["phaseJudgeBegin", "phaseDrawBegin", "phaseUseBegin", "phaseDiscardBegin"]
        },
        async cost(event2, trigger, player2) {
          const { control } = await player2.chooseControl({
            controls: ["摸牌", "增加摸牌数"],
            prompt: `胆守：请选择一项（当前为${get.translation(trigger.name)}）`,
            ai: () => {
              let player3 = get.event().player;
              const trigger2 = get.event().getTrigger();
              if (trigger2.name === "phaseJudge") {
                return "增加摸牌数";
              }
              if (trigger2.name === "phaseDiscard") {
                return "摸牌";
              }
              if (trigger2.name === "phaseDraw") {
                if (get.damageEffect(trigger2.player, player3, player3) > 0) {
                  player3._fakedanshou_effect = true;
                  return "增加摸牌数";
                }
              }
              return player3._fakedanshou_effect ? "增加摸牌数" : "摸牌";
            }
          }).forResult();
          event2.result = { bool: true, cost_data: control };
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          if (event2.cost_data === "增加摸牌数") {
            player2.addMark("fakedanshou_effect", 1, false);
          } else {
            const num = player2.countMark("fakedanshou_effect");
            await player2.draw(num);
            if (num >= 4) {
              const { bool } = await player2.chooseBool({ prompt: `胆守：是否对${get.translation(trigger.player)}造成1点伤害？` }).set("choice", get.damageEffect(trigger.player, player2, player2) > 0).forResult();
              if (bool) {
                player2.line(trigger.player);
                await trigger.player.damage();
              }
            }
          }
        }
      }
    }
  },
  fakexunxi: {
    trigger: { global: "showCharacterEnd" },
    filter(event2, player2) {
      const card = new lib.element.VCard({ name: "sha", isCard: true });
      return event2.player !== player2 && event2.player !== _status.currentPhase && player2.canUse(card, event2.player, false);
    },
    check(event2, player2) {
      const card = new lib.element.VCard({ name: "sha", isCard: true });
      return get.effect(event2.player, card, player2, player2) > 0;
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      const card = new lib.element.VCard({ name: "sha", isCard: true });
      await player2.useCard({ card, targets: [trigger.player], addCount: false });
    }
  },
  fakehuanjia: {
    trigger: {
      player: "useCardToPlayered",
      target: "useCardToTargeted"
    },
    filter(event2, player2) {
      if (event2.card.name !== "sha") {
        return false;
      }
      if (event2.target === player2) {
        if (player2.getStorage("fakehuanjia_used").includes(2)) {
          return false;
        }
        return event2.player.getEquips(2).length;
      }
      if (event2.targets.length !== 1) {
        return false;
      }
      if (player2.getStorage("fakehuanjia_used").includes(1)) {
        return false;
      }
      return event2.target.getEquips(1).length;
    },
    logTarget(event2, player2) {
      return event2.target === player2 ? event2.player : event2.target;
    },
    forced: true,
    async content(event2, trigger, player2) {
      player2.addTempSkill("fakehuanjia_used");
      if (trigger.target === player2) {
        player2.markAuto("fakehuanjia_used", [2]);
        if (!player2.getEquips(2).length && player2.hasEmptySlot(2)) {
          player2.addSkill("fakehuanjia_equip2");
          player2.markAuto("fakehuanjia_equip2", [trigger.player]);
          player2.when({
            global: "phaseAfter",
            player: ["equipEnd", "disableEquipEnd", "die"]
          }).filter((evt, player3) => {
            if (evt.name === "phase" || evt.name === "die") {
              return true;
            }
            if (evt.name === "discardEquip") {
              return !player3.hasEmptySlot(2);
            }
            return get.type(evt.card) === "equip2";
          }).step(async () => player2.removeSkill("fakehuanjia_equip2"));
          const cards2 = trigger.player.getEquips(2);
          if (cards2.length) {
            player2.addExtraEquip("fakehuanjia_equip2", cards2);
            const skills = cards2.reduce((list, card) => {
              if (get.info(card) && get.info(card).skills) {
                list.addArray(get.info(card).skills);
              }
              return list;
            }, []);
            if (skills.length) {
              player2.addAdditionalSkill("fakehuanjia_equip2", skills);
            }
          }
        }
      } else {
        player2.markAuto("fakehuanjia_used", [1]);
        if (!player2.getEquips(1).length && player2.hasEmptySlot(1)) {
          player2.addSkill("fakehuanjia_equip1");
          player2.markAuto("fakehuanjia_equip1", [trigger.target]);
          player2.when({
            global: "phaseAfter",
            player: ["equipEnd", "disableEquipEnd", "die"]
          }).filter((evt, player3) => {
            if (evt.name === "phase" || evt.name === "die") {
              return true;
            }
            if (evt.name === "discardEquip") {
              return !player3.hasEmptySlot(1);
            }
            return get.type(evt.card) === "equip1";
          }).step(async () => player2.removeSkill("fakehuanjia_equip1"));
          const cards2 = trigger.target.getEquips(1);
          if (cards2.length) {
            player2.addExtraEquip("fakehuanjia_equip1", cards2);
            const skills = cards2.reduce((list, card) => {
              if (get.info(card) && get.info(card).skills) {
                list.addArray(get.info(card).skills);
              }
              return list;
            }, []);
            if (skills.length) {
              player2.addAdditionalSkill("fakehuanjia_equip1", skills);
            }
          }
        }
      }
    },
    subSkill: {
      used: {
        charlotte: true,
        onremove: true
      },
      equip1: {
        charlotte: true,
        onremove(player2, skill) {
          delete player2.storage[skill];
          player2.removeExtraEquip(skill);
        },
        mark: true,
        marktext: "攻",
        mod: {
          attackRange(player2, num) {
            const targets = player2.getStorage("fakehuanjia_equip1").filter((i) => i.isIn());
            return num + targets.reduce((sum, target) => {
              return sum + target.getEquipRange();
            }, 0);
          }
        },
        intro: { content: "视为装备$的武器" },
        trigger: {
          global: ["loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter", "die"]
        },
        filter(event2, player2) {
          return game.hasPlayer((target) => {
            if (!player2.getStorage("fakehuanjia_equip1").includes(target)) {
              return false;
            }
            if (event2.name === "die" && event2.player === target) {
              return true;
            }
            if (event2.name === "equip" && event2.player === target) {
              return get.subtype(event2.card) === "equip1";
            }
            if (event2.getl) {
              const evt = event2.getl(target);
              return evt && evt.player === target && evt.es && evt.es.some((i) => get.subtype(i) === "equip1");
            }
            return false;
          });
        },
        forced: true,
        popup: false,
        async content(event2, trigger, player2) {
          const targets = player2.getStorage("fakehuanjia_equip1").filter((i) => i.isIn());
          const list = targets.reduce(
            (list2, target) => {
              const cards2 = target.getEquips(1);
              if (cards2.length) {
                list2.equips.addArray(cards2.map((card) => card.name));
                const skills = cards2.reduce((listx, card) => {
                  if (get.info(card) && get.info(card).skills) {
                    listx.addArray(get.info(card).skills);
                  }
                  return listx;
                }, []);
                if (skills.length) {
                  list2.skills.addArray(skills);
                }
              }
              return list2;
            },
            { equips: [], skills: [] }
          );
          player2.addExtraEquip("fakehuanjia_equip1", list.equips);
          player2.addAdditionalSkill("fakehuanjia_equip1", list.skills);
        }
      },
      equip2: {
        charlotte: true,
        onremove(player2, skill) {
          delete player2.storage[skill];
          player2.removeExtraEquip(skill);
        },
        mark: true,
        marktext: "防",
        intro: { content: "视为装备$的防具" },
        trigger: {
          global: ["loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter", "die"]
        },
        filter(event2, player2) {
          return game.hasPlayer((target) => {
            if (!player2.getStorage("fakehuanjia_equip2").includes(target)) {
              return false;
            }
            if (event2.name === "die" && event2.player === target) {
              return true;
            }
            if (event2.name === "equip" && event2.player === target) {
              return get.subtype(event2.card) === "equip2";
            }
            if (event2.getl) {
              const evt = event2.getl(target);
              return evt && evt.player === target && evt.es && evt.es.some((i) => get.subtype(i) === "equip2");
            }
            return false;
          });
        },
        forced: true,
        popup: false,
        async content(event2, trigger, player2) {
          const targets = player2.getStorage("fakehuanjia_equip2").filter((i) => i.isIn());
          const list = targets.reduce(
            (list2, target) => {
              const cards2 = target.getEquips(2);
              if (cards2.length) {
                list2.equips.addArray(cards2.map((card) => card.name));
                const skills = cards2.reduce((listx, card) => {
                  if (get.info(card) && get.info(card).skills) {
                    listx.addArray(get.info(card).skills);
                  }
                  return listx;
                }, []);
                if (skills.length) {
                  list2.skills.addArray(skills);
                }
              }
              return list2;
            },
            { equips: [], skills: [] }
          );
          player2.addExtraEquip("fakehuanjia_equip1", list.equips);
          player2.addAdditionalSkill("fakehuanjia_equip1", list.skills);
        }
      }
    }
  },
  fakehuyuan: {
    audio: "yuanhu",
    trigger: { player: "phaseJieshuBegin" },
    filter(event2, player2) {
      return player2.hasCards("he", (card) => {
        if (get.position(card) === "h" && _status.connectMode) {
          return true;
        }
        return get.type(card) === "equip";
      });
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCardTarget({
        prompt: get.prompt2("fakehuyuan"),
        filterCard(card) {
          return get.type(card) === "equip";
        },
        position: "he",
        filterTarget(card, player3, target) {
          return target.canEquip(card);
        },
        ai1(card) {
          return 6 - get.value(card);
        },
        ai2(target) {
          return get.attitude(_status.event.player, target) - 3;
        }
      }).setHiddenSkill("fakehuyuan").forResult();
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      const card = event2.cards[0];
      const target = event2.targets[0];
      if (target !== player2) {
        player2.$give(card, target, false);
      }
      await target.equip(card);
    },
    group: "fakehuyuan_discard",
    subSkill: {
      discard: {
        trigger: { global: "equipEnd" },
        filter(event2, player2) {
          return _status.currentPhase === player2 && game.hasPlayer((target) => {
            return get.distance(event2.player, target) <= 1 && target !== event2.player && target.hasCards("hej");
          });
        },
        async cost(event2, trigger, player2) {
          event2.result = await player2.chooseTarget({
            prompt: get.prompt("fakehuyuan"),
            prompt2: `弃置一名与${get.translation(trigger.player)}距离为1以内的另一名角色区域里的一张牌`,
            filterTarget: (card, player3, target) => {
              const trigger2 = get.event().getTrigger();
              return get.distance(trigger2.player, target) <= 1 && target !== trigger2.player && target.countCards("hej");
            },
            ai: (target) => {
              const player3 = get.event().player;
              return get.effect(target, { name: "guohe" }, player3, player3);
            }
          }).setHiddenSkill("fakehuyuan").forResult();
        },
        popup: false,
        async content(event2, trigger, player2) {
          const target = event2.targets[0];
          player2.logSkill("fakehuyuan", target);
          await player2.discardPlayerCard({ target, position: "hej", forced: true });
        }
      }
    }
  },
  fakekeshou: {
    audio: "keshou",
    trigger: { player: "damageBegin3" },
    filter(event2, player2) {
      return event2.num > 0;
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseToDiscard({
        prompt: get.prompt("fakekeshou"),
        prompt2: "弃置两张颜色相同的牌，令即将受到的伤害-1",
        position: "he",
        selectCard: 2,
        filterCard: (card) => {
          return !ui.selected.cards.length || get.color(card) === get.color(ui.selected.cards[0]);
        },
        complexCard: true,
        ai: (card) => {
          if (!_status.event.check) {
            return 0;
          }
          const player3 = _status.event.player;
          if (player3.hp === 1) {
            if (!player3.hasCards("h", (card2) => {
              return get.tag(card2, "save");
            }) && !player3.hasSkillTag("save", true)) {
              return 10 - get.value(card);
            }
            return 7 - get.value(card);
          }
          return 6 - get.value(card);
        }
      }).set("logSkill", "fakekeshou").setHiddenSkill("fakekeshou").set("check", player2.countCards("h", { color: "red" }) > 1 || player2.countCards("h", { color: "black" }) > 1).forResult();
    },
    popup: false,
    async content(event2, trigger, player2) {
      trigger.num--;
    },
    group: "fakekeshou_draw",
    subSkill: {
      draw: {
        audio: "keshou",
        trigger: {
          player: "loseAfter",
          global: "loseAsyncAfter"
        },
        filter(event2, player2) {
          if (event2.type !== "discard" || event2.getlx === false) {
            return false;
          }
          if (!(!player2.isUnseen() && !game.hasPlayer((current) => {
            return current !== player2 && current.isFriendOf(player2);
          }))) {
            return false;
          }
          const evt = event2.getl(player2);
          return evt && evt.cards2 && evt.cards2.length > 1;
        },
        prompt2: "进行一次判定，若为红色，则你摸一张牌",
        async content(event2, trigger, player2) {
          const result2 = await player2.judge({
            judge: (card) => {
              return get.color(card) === "red" ? 1 : 0;
            }
          }).forResult();
          if (result2.judge > 0) {
            await player2.draw();
          }
        }
      }
    }
  },
  //国战典藏2023补充
  //吕范
  gzdiaodu: {
    audio: "diaodu",
    trigger: {
      player: "phaseUseBegin"
    },
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        if (!current.isFriendOf(player2)) {
          return false;
        }
        return current.hasGainableCards(player2, "e");
      });
    },
    frequent: true,
    preHidden: true,
    async cost(event2, trigger, player2) {
      const next = player2.chooseTarget({ prompt: get.prompt2("gzdiaodu"), filterTarget: (_card, player3, current) => current.isFriendOf(player3) && current.hasGainableCards(player3, "e") });
      next.set("ai", (target) => {
        let num = 0;
        if (target.hasSkill("gz_xiaoji")) {
          num += 2.5;
        }
        if (target.isDamaged() && target.getEquip("baiyin")) {
          num += 2.5;
        }
        if (target.hasSkill("xuanlve")) {
          num += 2;
        }
        return num;
      });
      next.setHiddenSkill("gzdiaodu");
      event2.result = await next.forResult();
    },
    logTarget: "targets",
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const result2 = await player2.gainPlayerCard({ target, position: "e", forced: true }).forResult();
      if (!result2.bool) {
        return;
      }
      const card = result2.cards[0];
      if (!player2.getCards("h").includes(card)) {
        return;
      }
      const result22 = await player2.chooseTarget({ prompt: `将${get.translation(card, void 0)}交给另一名角色`, filterTarget: (_card, player3, current) => current !== player3 && current !== _status.event.target, forced: true }).set("target", target).forResult();
      if (result22.bool) {
        const target2 = result22.targets[0];
        player2.line(target2, "green");
        await player2.give(card, target2);
      }
    },
    group: "gzdiaodu_use",
    subSkill: {
      use: {
        audio: "diaodu",
        trigger: {
          global: "useCard"
        },
        filter(event2, player2) {
          if (get.type(event2.card) !== "equip") {
            return false;
          }
          if (!event2.player.isIn()) {
            return false;
          }
          if (!event2.player.isFriendOf(player2)) {
            return false;
          }
          return player2 === event2.player || player2.hasSkill("gzdiaodu");
        },
        logTarget: "player",
        async cost(event2, trigger, player2) {
          const next = trigger.player.chooseBool({ prompt: get.prompt("gzdiaodu"), prompt2: "摸一张牌" });
          if (player2.hasSkill("gzdiaodu")) {
            next.set("frequentSkill", "gzdiaodu");
          }
          if (player2 === trigger.player) {
            next.setHiddenSkill("gzdiaodu");
          }
          event2.result = await next.forResult();
        },
        async content(event2, trigger, player2) {
          await trigger.player.draw({ nodelay: true });
        }
      }
    }
  },
  // 回来吧老调度
  gzdiaodu_backports: {
    audio: "diaodu",
    trigger: {
      player: "phaseUseBegin"
    },
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        if (!current.isFriendOf(player2)) {
          return false;
        }
        return current.hasGainableCards(player2, "e");
      });
    },
    frequent: true,
    preHidden: true,
    async cost(event2, trigger, player2) {
      const next = player2.chooseTarget({ prompt: get.prompt2("gzdiaodu_backports"), filterTarget: (_card, player3, current) => current.isFriendOf(player3) && current.hasGainableCards(player3, "e") });
      next.set("ai", (target) => {
        let num = 0;
        if (target.hasSkill("gz_xiaoji")) {
          num += 2.5;
        }
        if (target.isDamaged() && target.getEquip("baiyin")) {
          num += 2.5;
        }
        if (target.hasSkill("xuanlve")) {
          num += 2;
        }
        return num;
      });
      next.setHiddenSkill("gzdiaodu_backports");
      event2.result = await next.forResult();
    },
    logTarget: "targets",
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const result2 = await player2.gainPlayerCard({ target, position: "e", forced: true }).forResult();
      if (!result2.bool) {
        return;
      }
      const card = result2.cards[0];
      if (!player2.getCards("h").includes(card)) {
        return;
      }
      const next = player2.chooseTarget({ prompt: `是否将${get.translation(card)}交给一名其他角色？` });
      next.set("filterTarget", (_card, player3, current) => {
        return current !== player3 && current !== _status.event.target && player3.isFriendOf(current);
      });
      next.set("target", target);
      const result22 = await next.forResult();
      if (result22.bool) {
        const target2 = result22.targets[0];
        player2.line(target2, "green");
        await player2.give(card, target2);
      }
    },
    group: "gzdiaodu_backports_use",
    subSkill: {
      use: {
        audio: "diaodu",
        trigger: {
          global: "useCard"
        },
        filter(event2, player2) {
          if (get.type(event2.card) !== "equip") {
            return false;
          }
          if (!event2.player.isIn()) {
            return false;
          }
          if (!event2.player.isFriendOf(player2)) {
            return false;
          }
          return player2 === event2.player || player2.hasSkill("gzdiaodu_backports");
        },
        logTarget: "player",
        async cost(event2, trigger, player2) {
          const next = trigger.player.chooseBool({ prompt: get.prompt("gzdiaodu_backports"), prompt2: "摸一张牌" });
          if (player2.hasSkill("gzdiaodu_backports")) {
            next.set("frequentSkill", "gzdiaodu_backports");
          }
          if (player2 === trigger.player) {
            next.setHiddenSkill("gzdiaodu_backports");
          }
          event2.result = await next.forResult();
        },
        async content(event2, trigger, player2) {
          await trigger.player.draw({ nodelay: true });
        }
      }
    }
  },
  //徐庶
  gzqiance: {
    trigger: { global: "useCardToPlayered" },
    filter(event2, player2) {
      if (!event2.isFirstTarget || get.type(
        /*2*/
        event2.card
      ) !== "trick") {
        return false;
      }
      return event2.player.isFriendOf(player2) && event2.targets.some((target) => target.isMajor());
    },
    check(event2, player2) {
      let num = 0;
      const targets = event2.targets.filter((target) => target.isMajor());
      for (const target of targets) {
        num += get.sgn(get.attitude(player2, target) * get.effect(target, event2.card, event2.player, player2));
      }
      return num >= 0;
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      trigger.getParent().directHit.addArray(trigger.targets.filter((target) => target.isMajor()));
    }
  },
  gzjujian: {
    init(player2) {
      if (player2.checkViceSkill("gzjujian") && !player2.viceChanged) {
        player2.removeMaxHp();
      }
    },
    viceSkill: true,
    audio: "gzjiancai",
    trigger: { global: "dying" },
    filter(event2, player2) {
      return event2.player.isFriendOf(player2);
    },
    forced: true,
    logTarget: "player",
    async content(event2, trigger, player2) {
      const recoverEvent = trigger.player.recover(1 - trigger.player.hp);
      const changeEvent = player2.changeVice();
      await recoverEvent;
      await changeEvent;
    }
  },
  //彭羕
  gztongling: {
    audio: "daming",
    trigger: { source: "damageSource" },
    filter(event2, player2) {
      if (event2.player.isFriendOf(player2)) {
        return false;
      }
      return player2.isPhaseUsing() && event2.player.isIn() && !player2.hasSkill("gztongling_used");
    },
    async cost(event2, trigger, player2) {
      let str = "";
      if (get.itemtype(trigger.cards) === "cards" && trigger.cards.filterInD().length) {
        str = `；未造成伤害，其获得${get.translation(trigger.cards.filterInD())}`;
      }
      event2.result = await player2.chooseTarget({
        prompt: get.prompt(event2.skill),
        prompt2: `令一名势力与你相同的角色选择是否对其使用一张牌。若使用且此牌：造成伤害，你与其各摸两张牌${str}`,
        filterTarget: (card, player3, target) => target.isFriendOf(player3),
        ai: (target) => {
          const aim = _status.event.aim;
          const cards2 = target.getCards("hs", (card) => target.canUse(card, aim, false) && get.effect(aim, card, target, player2) > 0 && get.effect(aim, card, target, target) > 0);
          if (cards2.length) {
            return cards2.some((card) => get.tag(card, "damage")) ? 2 : 1;
          }
          return 0;
        }
      }).set("aim", trigger.player).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      player2.addTempSkill("gztongling_used", "phaseUseAfter");
      player2.line2([target, trigger.player]);
      const result2 = await target.chooseToUse({
        filterCard: lib.filter.filterCard,
        prompt: `通令：是否对${get.translation(trigger.player)}使用一张牌？`,
        complexTarget: true,
        filterTarget: (card, player3, target2) => {
          if (target2 !== _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) {
            return false;
          }
          return lib.filter.targetEnabled(card, player3, target2);
        }
      }).set("targetRequired", true).set("complexSelect", true).set("sourcex", trigger.player).set("addCount", false).forResult();
      if (!result2.bool) {
        return;
      }
      if (target.hasHistory("sourceDamage", (evt) => evt.getParent(4).name === "gztongling")) {
        const drawEvent = player2.draw({ num: 2, nodelay: true });
        const targetDrawEvent = target.draw(2);
        await drawEvent;
        await targetDrawEvent;
      } else if (get.itemtype(trigger.cards) === "cards" && trigger.cards.filterInD().length && trigger.player.isIn()) {
        await trigger.player.gain({ cards: trigger.cards.filterInD(), animate: "gain2" });
      }
    },
    subSkill: { used: { charlotte: true } }
  },
  gzjinyu: {
    audio: "xiaoni",
    trigger: { player: "showCharacterAfter" },
    filter(event2, player2) {
      if (!game.hasPlayer((current) => get.distance(player2, current) <= 1)) {
        return false;
      }
      return event2.toShow.some((name) => get.character(name, 3).includes("gzjinyu"));
    },
    logTarget(event2, player2) {
      return game.filterPlayer((current) => get.distance(player2, current) <= 1).sortBySeat(player2);
    },
    forced: true,
    locked: false,
    async content(event2, trigger, player2) {
      const targets = game.filterPlayer((current) => get.distance(player2, current) <= 1).sortBySeat(player2);
      for (const target of targets) {
        if (target.isUnseen(2)) {
          await target.chooseToDiscard({ selectCard: 2, position: "he", forced: true });
          continue;
        }
        let control = "副将";
        if (!get.is.jun(target)) {
          ({ control } = await target.chooseControl({
            controls: ["主将", "副将"],
            prompt: "近谀：请暗置一张武将牌",
            ai: (_event, player3) => {
              if (get.character(player3.name, 3).includes("gzjinyu")) {
                return "主将";
              }
              if (get.character(player3.name2, 3).includes("gzjinyu")) {
                return "副将";
              }
              if (lib.character[player3.name][3].some((skill) => {
                const info = get.info(skill);
                return info && info.ai && info.ai.maixie;
              })) {
                return "主将";
              }
              if (player3.name === "gz_zhoutai") {
                return "副将";
              }
              if (player3.name2 === "gz_zhoutai") {
                return "主将";
              }
              return "副将";
            }
          }).forResult());
        }
        await target.hideCharacter(control === "主将" ? 0 : 1);
      }
    }
  },
  //公孙渊
  gzrehuaiyi: {
    audio: "gzhuaiyi",
    enable: "phaseUse",
    locked: false,
    filter(event2, player2) {
      return player2.hasCards("h");
    },
    usable: 1,
    delay: false,
    async content(event2, trigger, player2) {
      await player2.showHandcards();
      const hs = player2.getCards("h");
      const color = get.color(hs[0], player2);
      if (hs.length === 1 || !hs.some((card, index) => {
        return index > 0 && get.color(card) !== color;
      })) {
        return;
      }
      const list = [];
      const bannedList = [];
      const indexs = Object.keys(lib.color);
      player2.getCards("h").forEach((card) => {
        const color2 = get.color(card, player2);
        list.add(color2);
        if (!lib.filter.cardDiscardable(card, player2, "gzrehuaiyi")) {
          bannedList.add(color2);
        }
      });
      list.removeArray(bannedList);
      list.sort((a, b) => indexs.indexOf(a) - indexs.indexOf(b));
      if (!list.length) {
        return;
      }
      const control = list.length === 1 ? list[0] : (await player2.chooseControl({
        controls: list.map((i) => `${i}2`),
        ai: () => {
          const player3 = _status.event.player;
          if (player3.countCards("h", { color: "red" }) === 1 && player3.countCards("h", { color: "black" }) > 1) {
            return 1;
          }
          return 0;
        },
        prompt: "请选择弃置一种颜色的所有手牌"
      }).forResult()).control;
      const selectedColor = control.slice(0, control.length - 1);
      let cards2 = player2.getCards("h", { color: selectedColor });
      await player2.discard({ cards: cards2 });
      const num = cards2.length;
      const result2 = await player2.chooseTarget({
        prompt: `请选择至多${get.cnNumber(num)}名有牌的其他角色，获得这些角色的各一张牌。`,
        selectTarget: [1, num],
        filterTarget: (card, player3, target) => target !== player3 && target.hasCards("he"),
        ai: (target) => -get.attitude(_status.event.player, target) + 0.5
      }).forResult();
      if (!result2.bool || !result2.targets) {
        return;
      }
      player2.line(result2.targets, "green");
      const targets = result2.targets.sort(lib.sort.seat);
      if (!player2.isIn() || !targets.length) {
        return;
      }
      while (player2.isIn() && targets.length) {
        const result3 = await player2.gainPlayerCard({ target: targets.shift(), position: "he", forced: true }).forResult();
        if (result3.bool && result3.cards && result3.cards.length) {
          cards2.addArray(result3.cards);
        }
      }
      if (targets.length) {
        return;
      }
      const handcards = player2.getCards("h");
      cards2 = cards2.filter((card) => get.type(card) === "equip" && handcards.includes(card));
      if (!cards2.length) {
        return;
      }
      player2.$give(cards2, player2, false);
      game.log(player2, "将", cards2, "置于了武将牌上");
      let lose = player2.loseToSpecial(cards2, "gzrehuaiyi");
      lose.visible = true;
      await lose;
      player2.addSkill("gzrehuaiyi_unmark");
      player2.markSkill("gzrehuaiyi");
      game.delayx();
    },
    ai: {
      order: 10,
      result: {
        player(player2, target) {
          let map = {};
          for (const i of ["red", "black", "none"]) {
            if (player2.hasCards("h", { color: i })) {
              map[i] = true;
            }
          }
          if (Object.keys(map).length < 2) {
            return 0;
          }
          const num = player2.maxHp - player2.countCards("s", (card) => {
            return card.hasGaintag("gzrehuaiyi");
          });
          if (player2.countCards("h", { color: "red" }) <= num) {
            return 1;
          }
          if (player2.countCards("h", { color: "black" }) <= num) {
            return 1;
          }
          return 0;
        }
      }
    },
    marktext: "异",
    intro: {
      mark(dialog, storage, player2) {
        const cards2 = player2.getCards("s", (card) => {
          return card.hasGaintag("gzrehuaiyi");
        });
        if (!cards2 || !cards2.length) {
          return;
        }
        dialog.addAuto(cards2);
      },
      markcount(storage, player2) {
        return player2.countCards("s", (card) => {
          return card.hasGaintag("gzrehuaiyi");
        });
      },
      onunmark(storage, player2) {
        const cards2 = player2.getCards("s", (card) => {
          return card.hasGaintag("gzrehuaiyi");
        });
        if (cards2.length) {
          player2.loseToDiscardpile({ cards: cards2 });
        }
      }
    },
    mod: {
      aiOrder(player2, card, num) {
        if (get.itemtype(card) === "card" && card.hasGaintag("gzrehuaiyi")) {
          return num + (player2.countCards("s", (card2) => {
            return card2.hasGaintag("gzrehuaiyi");
          }) > player2.maxHp ? 0.5 : -0.5);
        }
      }
    },
    subSkill: {
      unmark: {
        trigger: { player: "loseAfter" },
        filter(event2, player2) {
          if (!event2.ss || !event2.ss.length) {
            return false;
          }
          return !player2.hasCards("s", (card) => {
            return card.hasGaintag("gzrehuaiyi");
          });
        },
        charlotte: true,
        forced: true,
        silent: true,
        async content(event2, trigger, player2) {
          player2.unmarkSkill("gzrehuaiyi");
          player2.removeSkill("gzrehuaiyi_unmark");
        }
      }
    }
  },
  gzrezisui: {
    audio: "gzzisui",
    trigger: { player: "phaseDrawBegin2" },
    filter(event2, player2) {
      return !event2.numFixed && player2.hasCards("s", (card) => {
        return card.hasGaintag("gzrehuaiyi");
      });
    },
    forced: true,
    async content(event2, trigger, player2) {
      trigger.num += player2.countCards("s", (card) => {
        return card.hasGaintag("gzrehuaiyi");
      });
    },
    group: "gzrezisui_die",
    subSkill: {
      die: {
        audio: "gzzisui",
        trigger: { player: "phaseJieshuBegin" },
        filter(event2, player2) {
          return player2.countCards("s", (card) => {
            return card.hasGaintag("gzrehuaiyi");
          }) > player2.maxHp;
        },
        forced: true,
        async content(event2, trigger, player2) {
          await player2.die();
        }
      }
    }
  },
  //南华老仙
  gztaidan: {
    derivation: "taipingyaoshu",
    audio: "tianshu",
    init(player2, skill) {
      player2.addExtraEquip(skill, "taipingyaoshu", true, (player3) => player3.hasEmptySlot(2) && lib.card.taipingyaoshu && !game.hasPlayer((current) => current.getEquip("taipingyaoshu")));
    },
    onremove(player2, skill) {
      player2.removeExtraEquip(skill);
    },
    locked: true,
    group: "gztaidan_taipingyaoshu"
  },
  gztaidan_taipingyaoshu: {
    equipSkill: true,
    mod: {
      maxHandcard(player2, num) {
        if (!player2.hasEmptySlot(2) || game.hasPlayer((target) => target.getVEquip("taipingyaoshu"))) {
          return;
        }
        if (player2.hasSkill("hongfa")) {
          num += player2.getExpansions("huangjintianbingfu").length;
        }
        return num + game.countPlayer((current) => {
          return current.isFriendOf(player2);
        });
      }
    },
    audio: "tianshu",
    inherit: "taipingyaoshu",
    filter(event2, player2) {
      if (!player2.hasEmptySlot(2) || game.hasPlayer((target) => target.getVEquip("taipingyaoshu"))) {
        return false;
      }
      return lib.skill.taipingyaoshu.filter(event2, player2);
    },
    noHidden: true,
    ai: {
      effect: {
        target(card, player2, target) {
          if (!target.hasEmptySlot(2) || game.hasPlayer((targetx) => targetx.getVEquip("taipingyaoshu"))) {
            return;
          }
          if (player2 === target && get.subtype(card) === "equip2") {
            if (get.equipValue(card) <= 7.5) {
              return 0;
            }
          }
          return lib.skill.taipingyaoshu.ai.effect.target.apply(this, arguments);
        }
      }
    }
  },
  gzrejinghe: {
    audio: "jinghe",
    enable: "phaseUse",
    usable: 1,
    //delay:0,
    async content(event2, trigger, player2) {
      if (!player2.storage.gzrejinghe_tianshu) {
        const list = lib.skill.gzrejinghe.derivation.slice(0);
        list.remove("gzrejinghe_faq");
        const list2 = list.slice(0, get.rand(0, list.length));
        list.removeArray(list2);
        list.addArray(list2);
        player2.storage.gzrejinghe_tianshu = list;
      } else {
        const first = player2.storage.gzrejinghe_tianshu[0];
        player2.storage.gzrejinghe_tianshu.remove(first);
        player2.storage.gzrejinghe_tianshu.push(first);
      }
      game.log(player2, "转动了", "#g“天书”");
      player2.markSkill("gzrejinghe");
      const skill = player2.storage.gzrejinghe_tianshu[0];
      event2.skill = skill;
      let cardname = `gzrejinghe_${skill}`;
      lib.card[cardname] = {
        fullimage: true,
        image: "character:re_nanhualaoxian"
      };
      lib.translate[cardname] = get.translation(skill);
      event2.videoId = lib.status.videoId++;
      game.broadcastAll(
        (player3, id, card) => {
          ui.create.dialog(`${get.translation(player3)}转动了“天书”`, [[card], "card"]).videoId = id;
        },
        player2,
        event2.videoId,
        game.createCard(cardname, " ", " ")
      );
      await game.delay(3);
      game.broadcastAll("closeDialog", event2.videoId);
      const targets = game.filterPlayer((current) => !current.hasSkill(skill));
      if (!targets.length) {
        return;
      }
      const result2 = await player2.chooseTarget({
        prompt: `经合：令一名角色获得技能【${get.translation(skill)}】`,
        filterTarget: (card, player3, target) => _status.event.targets.includes(target),
        forced: true,
        ai: (target) => get.attitude(_status.event.player, target)
      }).set("targets", targets).forResult();
      if (result2.bool) {
        const target = result2.targets[0];
        player2.line(target);
        player2.addTempSkill("gzrejinghe_clear", { player: "phaseBegin" });
        const addSkillsEvent = target.addAdditionalSkills(`gzrejinghe_${player2.playerid}`, skill);
        target.popup(skill);
        await addSkillsEvent;
      }
    },
    intro: {
      name: "写满技能的天书",
      markcount: () => 8,
      mark(dialog, storage, player2) {
        dialog.content.style["overflow-x"] = "visible";
        const list = player2.storage.gzrejinghe_tianshu;
        const core = document.createElement("div");
        const centerX = -10;
        const centerY = 80;
        const radius = 80;
        const radian = Math.PI * 2 / list.length;
        for (const [i, skill] of list.entries()) {
          let td = document.createElement("div");
          td.innerHTML = get.translation(skill).slice(0, 1);
          td.style.position = "absolute";
          core.appendChild(td);
          td.style.left = `${centerX + radius * Math.sin(radian * i)}px`;
          td.style.top = `${centerY - radius * Math.cos(radian * i)}px`;
        }
        dialog.content.appendChild(core);
      }
    },
    ai: {
      order: 10,
      result: { target: 1 }
    },
    derivation: ["gzrejinghe_faq", "leiji", "nhyinbing", "nhhuoqi", "nhguizhu", "nhxianshou", "nhlundao", "nhguanyue", "nhyanzheng"],
    subSkill: {
      clear: {
        onremove(player2) {
          game.countPlayer((current) => {
            current.removeAdditionalSkills(`gzrejinghe_${player2.playerid}`);
          });
        }
      }
    }
  },
  //张鲁·新
  gzrebushi: {
    onremove: true,
    onunmark: true,
    intro: { content: "mark" },
    group: "gzrebushi_give",
    audio: "gzbushi",
    trigger: { player: ["phaseZhunbeiBegin", "phaseAfter"] },
    check(event2, player2) {
      return event2.name === "phase";
    },
    forced: true,
    locked: false,
    async content(event2, trigger, player2) {
      if (trigger.name === "phaseZhunbei") {
        const num = game.countPlayer() - player2.hp - 2;
        if (num > 0) {
          await player2.chooseToDiscard({ selectCard: num, position: "he", forced: true });
        }
      } else {
        player2.addMark("gzrebushi", player2.hp);
        return;
      }
      player2.removeMark("gzrebushi", player2.countMark("gzrebushi"));
      if (!player2.hasMark("gzrebushi")) {
        player2.unmarkSkill("gzrebushi");
      }
    },
    ai: { mingzhi_no: true },
    subSkill: {
      give: {
        trigger: { global: "phaseZhunbeiBegin" },
        filter(event2, player2) {
          if (event2.player === player2) {
            return false;
          }
          return player2.hasMark("gzrebushi") && player2.hasCards("he");
        },
        direct: true,
        async content(event2, trigger, player2) {
          const result2 = await player2.chooseCard({
            prompt: get.prompt("gzrebushi"),
            position: "he",
            prompt2: `失去1个“义舍”标记，将一张牌交给${get.translation(trigger.player)}并摸两张牌`,
            ai: (card) => {
              const target = trigger.player;
              let num = 0;
              let current = target;
              while (current !== player2) {
                if (current.isFriendOf(player2) && !current.isTurnedOver()) {
                  num++;
                }
                current = current.next;
              }
              if (num >= player2.countMark("gzrebushi") && !target.isFriendOf(player2)) {
                return -1;
              }
              return 6 - get.value(card);
            }
          }).forResult();
          if (!result2.bool) {
            return;
          }
          player2.logSkill("gzrebushi", trigger.player);
          player2.removeMark("gzrebushi", 1);
          if (!player2.hasMark("gzrebushi")) {
            player2.unmarkSkill("gzrebushi");
          }
          const gainEvent = trigger.player.gain({ cards: result2.cards, source: player2, animate: "giveAuto" });
          const drawEvent = player2.draw(2);
          await gainEvent;
          await drawEvent;
        }
      }
    }
  },
  gzremidao: {
    group: "gzremidao_change",
    audio: "gzmidao",
    trigger: { player: "phaseJieshuBegin" },
    filter(event2, player2) {
      return !player2.getExpansions("gzremidao").length;
    },
    async content(event2, trigger, player2) {
      await player2.draw(2);
      const cards2 = player2.getCards("he");
      if (!cards2.length) {
        return;
      }
      let selectedCards = cards2;
      if (cards2.length > 2) {
        const result2 = await player2.chooseCard({ selectCard: 2, position: "he", forced: true, prompt: "选择两张牌作为“米”" }).forResult();
        if (!result2.bool) {
          return;
        }
        selectedCards = result2.cards;
      }
      await player2.addToExpansion({ cards: selectedCards, source: player2, animate: "give", gaintag: ["gzremidao"] });
    },
    marktext: "米",
    intro: {
      content: "expansion",
      markcount: "expansion"
    },
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    },
    subSkill: {
      change: {
        trigger: { global: "judge" },
        filter(event2, player2) {
          return player2.getExpansions("gzremidao").length && event2.player.isAlive();
        },
        direct: true,
        async content(event2, trigger, player2) {
          const list = player2.getExpansions("gzremidao");
          const result2 = await player2.chooseButton({
            createDialog: [`${get.translation(trigger.player)}的${trigger.judgestr || ""}判定为${get.translation(trigger.player.judging[0])}，${get.prompt("gzremidao")}`, list, "hidden"],
            ai: (button) => {
              const card2 = button.link;
              const trigger2 = _status.event.getTrigger();
              const player3 = _status.event.player;
              const judging = _status.event.judging;
              const difference = trigger2.judge(card2) - trigger2.judge(judging);
              const attitude = get.attitude(player3, trigger2.player);
              if (difference === 0) {
                return 0.5;
              }
              return difference * attitude;
            },
            filterButton: (button) => {
              const player3 = _status.event.player;
              const card2 = button.link;
              const mod2 = game.checkMod(card2, player3, "unchanged", "cardEnabled2", player3);
              if (mod2 !== "unchanged") {
                return mod2;
              }
              const mod = game.checkMod(card2, player3, "unchanged", "cardRespondable", player3);
              if (mod !== "unchanged") {
                return mod;
              }
              return true;
            }
          }).set("judging", trigger.player.judging[0]).forResult();
          if (!result2.bool) {
            return;
          }
          event2.forceDie = true;
          const cards2 = result2.links;
          const card = cards2[0];
          const respondEvent = player2.respond({ cards: cards2, skill: "gzremidao", highlight: true, noOrdering: true });
          event2.card = card;
          await respondEvent;
          const oldCard = trigger.player.judging[0];
          if (oldCard.clone) {
            oldCard.clone.classList.remove("thrownhighlight");
            game.broadcast((card2) => {
              if (card2.clone) {
                card2.clone.classList.remove("thrownhighlight");
              }
            }, oldCard);
            game.addVideo("deletenode", player2, get.cardsInfo([oldCard.clone]));
          }
          player2.$gain2(oldCard);
          const gainEvent = player2.gain({ cards: [oldCard] });
          trigger.player.judging[0] = card;
          trigger.orderingCards.addArray(cards2);
          game.log(trigger.player, "的判定牌改为", card);
          const delay = game.delay(2);
          await gainEvent;
          await delay;
        },
        ai: {
          rejudge: true,
          tag: { rejudge: 0.6 }
        }
      }
    }
  },
  //许贡
  gzbiaozhao: {
    audio: "biaozhao",
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      const players = game.filterPlayer((current) => current !== player2);
      if (players.length < 2) {
        return false;
      }
      for (const [index, current] of players.entries()) {
        for (const other of players.slice(index + 1)) {
          if (current.isEnemyOf(other)) {
            return true;
          }
        }
      }
      return false;
    },
    multitarget: true,
    complexTarget: true,
    complexSelect: true,
    selectTarget: 2,
    filterTarget(card, player2, target) {
      if (target === player2) {
        return false;
      }
      const targets = ui.selected.targets;
      if (targets.length === 0) {
        return player2.canUse("zhibi", target);
      }
      return target.isEnemyOf(targets[0]);
    },
    targetprompt: ["被知己知彼", "获得牌"],
    async content(event2, trigger, player2) {
      const [firstTarget, secondTarget] = event2.targets;
      await player2.useCard({ card: { name: "zhibi", isCard: true }, targets: [firstTarget] });
      if (!player2.hasCards("he") || !secondTarget.isAlive()) {
        return;
      }
      const result2 = await player2.chooseCard({ position: "he", forced: true, prompt: `交给${get.translation(secondTarget)}一张牌` }).forResult();
      const giveEvent = player2.give(result2.cards, secondTarget);
      const drawEvent = player2.draw();
      await giveEvent;
      await drawEvent;
    },
    ai: {
      order: 6,
      result: {
        player(player2, target) {
          if (ui.selected.targets.length) {
            return 0.1;
          }
          return get.effect(target, { name: "zhibi" }, player2, player2) + 0.1;
        },
        target(player2, target) {
          if (ui.selected.targets.length) {
            return 2;
          }
          return 0;
        }
      }
    }
  },
  gzyechou: {
    audio: "yechou",
    trigger: { player: "die" },
    forced: true,
    forceDie: true,
    skillAnimation: true,
    animationColor: "gray",
    logTarget: "source",
    filter(event2, player2) {
      return event2.source && event2.source.isIn() && player2.canUse("sha", event2.source, false);
    },
    async content(event2, trigger, player2) {
      const target = trigger.source;
      target.addTempSkill("gzyechou_unsavable");
      await player2.useCard({ card: { name: "sha", isCard: true }, targets: [target] }).set("forceDie", true).set("oncard", () => {
        _status.event.directHit.addArray(game.filterPlayer());
      });
      player2.addTempSkill("gzyechou_unequip");
      if (!target.isIn() || !player2.canUse("sha", target, false)) {
        player2.removeSkill("gzyechou_unequip");
        target.removeSkill("gzyechou_unsavable");
        return;
      }
      await player2.useCard({
        card: {
          name: "sha",
          isCard: true,
          storage: { gzyechou: true }
        },
        targets: [target]
      }).set("forceDie", true);
      player2.removeSkill("gzyechou_unequip");
      if (!target.isIn() || !player2.canUse("sha", target, false)) {
        target.removeSkill("gzyechou_unsavable");
        return;
      }
      await player2.useCard({ card: { name: "sha", isCard: true }, targets: [target] }).set("forceDie", true).set("oncard", () => {
        _status.event.baseDamage++;
      });
      target.removeSkill("gzyechou_unsavable");
    },
    ai: {
      threaten: 1e-3
    },
    subSkill: {
      unsavable: {
        charlotte: true,
        mod: {
          targetEnabled(card, player2, target) {
            if (card.name === "tao" && target.isDying() && player2.isFriendOf(target) && target !== player2) {
              return false;
            }
          }
        }
      },
      unequip: {
        charlotte: true,
        ai: {
          unequip: true,
          skillTagFilter(player2, tag, arg) {
            if (!arg || !arg.card || !arg.card.storage || !arg.card.storage.gzyechou) {
              return false;
            }
          }
        }
      }
    }
  },
  //陈宫
  gzyinpan: {
    enable: "phaseUse",
    usable: 1,
    filterTarget: lib.filter.notMe,
    async content(event2, trigger, player2) {
      const victim = event2.target;
      event2.targets = game.filterPlayer((current) => current !== victim && current.isEnemyOf(victim)).sortBySeat();
      while (event2.targets.length) {
        if (!victim.isIn()) {
          return;
        }
        const attacker = event2.targets.shift();
        if (attacker.isIn() && (_status.connectMode || !lib.config.skip_shan || attacker.hasSha())) {
          await attacker.chooseToUse({
            filterCard: (card, player3, chooseEvent) => {
              if (get.name(card) !== "sha") {
                return false;
              }
              return lib.filter.filterCard(card, player3, chooseEvent);
            },
            prompt: `是否对${get.translation(victim)}使用一张【杀】？`,
            complexTarget: true,
            filterTarget: (card, player3, target) => {
              if (target !== _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) {
                return false;
              }
              return lib.filter.targetEnabled(card, player3, target);
            }
          }).set("targetRequired", true).set("complexSelect", true).set("addCount", false).set("sourcex", victim);
        }
      }
      if (!victim.isIn()) {
        return;
      }
      let dying = false;
      const num = victim.getHistory("damage", (evt) => {
        if (evt.card?.name !== "sha") {
          return false;
        }
        const useCardEvent = evt.getParent("useCard");
        if (evt.card !== useCardEvent.card || useCardEvent.getParent(2) !== event2) {
          return false;
        }
        if (evt._dyinged) {
          dying = true;
        }
        return true;
      }).length;
      if (num > 0) {
        victim.addTempSkill("gzyinpan_effect", { player: "phaseAfter" });
        victim.addMark("gzyinpan_effect", num, false);
        if (dying) {
          await victim.recover();
        }
      }
    },
    ai: {
      order: 1,
      result: { target: -1 }
    },
    subSkill: {
      effect: {
        mod: {
          cardUsable(card, player2, num) {
            if (card.name === "sha") {
              return num + player2.countMark("gzyinpan_effect");
            }
          }
        },
        onremove: true,
        charlotte: true,
        intro: { content: "使用【杀】的次数上限+#" }
      }
    }
  },
  gzxingmou: {
    trigger: { global: "gainAfter" },
    forced: true,
    preHidden: true,
    filter(event2, player2) {
      return event2.getParent().name === "draw" && event2.getParent(2).name === "die";
    },
    async content(event2, trigger, player2) {
      await player2.draw();
    },
    ai: {
      noDieAfter: true,
      noDieAfter2: true
    }
  },
  //朱儁
  gzgongjian: {
    audio: "gongjian",
    trigger: { global: "useCardToPlayered" },
    filter(event2, player2) {
      if (!event2.isFirstTarget || event2.card.name !== "sha") {
        return false;
      }
      const history = game.getAllGlobalHistory("useCard", (evt2) => {
        return evt2.card.name === "sha";
      });
      const evt = event2.getParent();
      const index = history.indexOf(evt);
      if (index < 1) {
        return false;
      }
      const evt0 = history[index - 1];
      for (const i of evt.targets) {
        if (evt0.targets.includes(i) && i.hasCards("he")) {
          return true;
        }
      }
      return false;
    },
    usable: 1,
    prompt2: "弃置这些角色的各两张牌",
    preHidden: ["gzgongjian_gain"],
    subfrequent: ["gain"],
    logTarget(event2, player2) {
      const history = game.getAllGlobalHistory("useCard", (evt2) => {
        return evt2.card.name === "sha";
      });
      const evt = event2.getParent();
      const index = history.indexOf(evt);
      const evt0 = history[index - 1];
      return evt.targets.filter((target) => {
        return evt0.targets.includes(target) && target.hasCards("he");
      });
    },
    check(event2, player2) {
      const targets = lib.skill.gzgongjian.logTarget(event2, player2);
      let att = 0;
      for (const i of targets) {
        att += get.attitude(player2, i);
      }
      return att < 0;
    },
    async content(event2, trigger, player2) {
      const history = game.getAllGlobalHistory("useCard", (evt2) => evt2.card.name === "sha");
      const evt = trigger.getParent();
      const index = history.indexOf(evt);
      const previous = history[index - 1];
      const targets = evt.targets.filter((target) => previous.targets.includes(target)).sortBySeat();
      const events = targets.map((target) => target.chooseToDiscard({ forced: true, position: "he", selectCard: 2 }));
      for (const next of events) {
        await next;
      }
    },
    group: "gzgongjian_gain",
    subSkill: {
      gain: {
        audio: "gongjian",
        trigger: {
          global: ["loseAfter", "loseAsyncAfter"]
        },
        filter(event2, player2) {
          if (event2.name === "lose") {
            if (event2.type !== "discard" || event2.player === player2) {
              return false;
            }
            if ((event2.getParent(event2.getParent(2).name === "chooseToDiscard" ? 3 : 2).player || event2.discarder) !== player2) {
              return false;
            }
            for (const i of event2.cards2) {
              if (i.name === "sha") {
                return true;
              }
            }
          } else if (event2.type === "discard") {
            if (!event2.discarder || event2.discarder !== player2) {
              return false;
            }
            const cards2 = event2.getd(null, "cards2");
            cards2.removeArray(event2.getd(player2, "cards2"));
            for (const i of cards2) {
              if (i.name === "sha") {
                return true;
              }
            }
          }
          return false;
        },
        frequent: true,
        prompt2(event2, player2) {
          let cards2 = event2.getd(null, "cards2");
          cards2.removeArray(event2.getd(player2, "cards2"));
          cards2 = cards2.filter((card) => card.name === "sha");
          return `获得${get.translation(cards2)}`;
        },
        async content(event2, trigger, player2) {
          let cards2 = trigger.getd(null, "cards2");
          cards2.removeArray(trigger.getd(player2, "cards2"));
          cards2 = cards2.filter((card) => card.name === "sha");
          if (cards2.length) {
            await player2.gain({ cards: cards2, animate: "gain2" });
          }
        }
      }
    }
  },
  gzkuimang: {
    audio: "kuimang",
    trigger: { source: "die" },
    forced: true,
    preHidden: true,
    filter(event2, player2) {
      const target = event2.player;
      if (target.isFriendOf(player2)) {
        return false;
      }
      const prev = target.getPrevious();
      const next = target.getNext();
      return prev && prev.isFriendOf(target) || next && next.isFriendOf(target);
    },
    async content(event2, trigger, player2) {
      await player2.draw(2);
    }
  },
  //毌丘俭
  gzzhengrong: {
    audio: "drlt_zhenrong",
    trigger: {
      source: "damageBegin3",
      player: ["damageBegin1", "chooseJunlingForBegin"]
    },
    forced: true,
    preHidden: true,
    filter(event2, player2) {
      if (event2.name !== "damage") {
        return true;
      }
      if (player2.identity !== "unknown") {
        return !game.hasPlayer((current) => {
          return current !== player2 && current.isFriendOf(player2);
        });
      }
      return !player2.wontYe("wei") || !game.hasPlayer((current) => current.identity === "wei");
    },
    check(event2, player2) {
      return !event2.player.hasSkillTag("filterDamage", null, {
        player: event2.source,
        card: event2.card
      }) && get.damageEffect(event2.player, event2.source, player2, _status.event.player) > 0;
    },
    async content(event2, trigger, player2) {
      trigger.num++;
    },
    mod: {
      globalFrom(player2, target, num) {
        if (target.isMajor()) {
          return num - 1;
        }
      }
    },
    ai: { halfneg: true }
  },
  gzhongju: {
    audio: "drlt_hongju",
    enable: "phaseUse",
    limited: true,
    skillAnimation: true,
    animationColor: "thunder",
    filterTarget: lib.filter.notMe,
    async content(event2, trigger, player2) {
      player2.awakenSkill("gzhongju");
      const { target } = event2;
      const players = game.filterPlayer((current) => {
        return current !== player2 && current !== target;
      }).sortBySeat();
      await game.delayx();
      const { junling, targets } = await player2.chooseJunlingFor(players[0]).set("prompt", "请选择一项“军令”").forResult();
      event2.junling = junling;
      event2.targets = targets;
      await player2.carryOutJunling(player2, junling, targets);
      for (const current of players) {
        event2.current = current;
        if (current.isAlive()) {
          player2.line(current);
          const result2 = await current.chooseJunlingControl(player2, junling, targets).set("prompt", "鸿举").set("choiceList", ["执行该军令", "不执行该军令，且被“调虎离山”化"]).set("ai", () => {
            const evt = _status.event.getParent(2);
            return get.junlingEffect(evt.player, evt.junling, evt.current, evt.targets, evt.current) > 0 ? 0 : 1;
          }).forResult();
          if (result2.index === 0) {
            await current.carryOutJunling(player2, junling, targets);
          } else {
            current.addTempSkill("diaohulishan");
          }
        }
        await game.delayx();
      }
    }
  },
  //郭淮
  gzduanshi: {
    audio: "yuzhang",
    trigger: { global: "drawBegin" },
    forced: true,
    mainSkill: true,
    preHidden: true,
    init(player2) {
      if (player2.checkMainSkill("gzduanshi")) {
        player2.removeMaxHp();
      }
    },
    filter(event2, player2) {
      const evt = event2.getParent();
      if (evt.name !== "die") {
        return false;
      }
      if (player2.identity === "unknown") {
        return player2.wontYe("wei") && evt.player.identity === "wei";
      }
      return evt.player.isFriendOf(player2);
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      trigger.num--;
      if (trigger.num < 1) {
        trigger.cancel();
      }
      if (!trigger.gzduanshi) {
        trigger.gzduanshi = [];
      }
      trigger.gzduanshi.add(player2);
      player2.addTempSkill("gzduanshi_draw");
    },
    subSkill: {
      draw: {
        trigger: { global: ["drawAfter", "drawCancelled"] },
        forced: true,
        charlotte: true,
        popup: false,
        filter(event2, player2) {
          return event2.gzduanshi && event2.gzduanshi.includes(player2);
        },
        async content(event2, trigger, player2) {
          await player2.draw();
        }
      }
    }
  },
  gzjingce: {
    audio: "decadejingce",
    getDiscardNum() {
      const cards2 = [];
      game.getGlobalHistory("cardMove", (evt) => {
        if (evt.name === "cardsDiscard" || evt.name === "lose" && evt.position === ui.discardPile) {
          cards2.addArray(evt.cards);
        }
      });
      return cards2.length;
    },
    trigger: { player: "phaseEnd" },
    filter(event2, player2) {
      if (player2.getHistory("useCard").length >= player2.hp) {
        return true;
      }
      return lib.skill.gzjingce.getDiscardNum() >= player2.hp;
    },
    prompt2(event2, player2) {
      const num1 = player2.getHistory("useCard").length;
      const num2 = lib.skill.gzjingce.getDiscardNum();
      if (num1 >= player2.hp && num2 >= player2.hp) {
        return "执行一套额外的摸牌阶段和出牌阶段";
      }
      return `执行一个额外的${num1 > num2 ? "出牌阶段" : "摸牌阶段"}`;
    },
    preHidden: true,
    frequent: true,
    async content(event2, trigger, player2) {
      const num1 = player2.getHistory("useCard").length;
      const num2 = lib.skill.gzjingce.getDiscardNum();
      const num3 = player2.hp;
      if (num1 >= num3) {
        trigger.phaseList.splice(trigger.num, 0, `phaseUse|${event2.name}`);
      }
      if (num2 >= num3) {
        trigger.phaseList.splice(trigger.num, 0, `phaseDraw|${event2.name}`);
      }
    },
    ai: { threaten: 2.6 }
  },
  //黄权
  gzdianhu: {
    unique: true,
    audio: "xinfu_dianhu",
    trigger: { player: "showCharacterAfter" },
    forced: true,
    filter(event2, player2) {
      return event2.toShow.some((name) => {
        return get.character(name, 3).includes("gzdianhu");
      }) && !player2.storage.gzdianhu_effect;
    },
    content() {
      "step 0";
      player.chooseTarget("请选择【点虎】的目标", true, "给一名角色标上“虎”标记。当你或你的队友对该角色造成伤害后摸一张牌。", lib.filter.notMe).set("ai", function(target2) {
        var player2 = _status.event.player;
        var distance = game.countPlayer(function(current) {
          if (current.isFriendOf(player2)) {
            return Math.pow(get.distance(current, target2), 1.2);
          }
        });
        return 10 / distance;
      });
      if (result.bool) {
        var target = result.targets[0];
        player.logSkill("gzdianhu", target);
        target.markSkill("gzdianhu_mark");
        player.addSkill("gzdianhu_effect");
        player.markAuto("gzdianhu_effect", [target]);
      }
    },
    subSkill: {
      mark: {
        mark: true,
        marktext: "虎",
        intro: { content: "已成为“点虎”目标" }
      },
      effect: {
        trigger: { global: "damageEnd" },
        forced: true,
        charlotte: true,
        filter(event2, player2) {
          if (!player2.getStorage("gzdianhu_effect").includes(event2.player)) {
            return false;
          }
          const source = event2.source;
          return source && source.isAlive() && source.isFriendOf(player2);
        },
        logTarget: "source",
        async content(event2, trigger, player2) {
          await trigger.source.draw();
        }
      }
    }
  },
  gzjianji: {
    audio: "xinfu_jianji",
    inherit: "xinfu_jianji",
    filterTarget: true,
    async content(event2, trigger, player2) {
      const { target } = event2;
      const { cards: cards2 } = await target.draw({ visible: true }).forResult();
      const card = cards2?.[0];
      if (!card || !game.hasPlayer((current) => target.canUse(card, current)) || get.owner(card) !== target) {
        return;
      }
      const useEvent = target.chooseToUse({
        prompt: `是否使用${get.translation(card)}？`,
        filterCard: (cardx) => cardx === _status.event.cardx
      }).set("cardx", card);
      await useEvent;
    },
    ai: {
      order: 10,
      result: { target: 1 }
    }
  },
  //杨婉
  gzyouyan: {
    audio: "youyan",
    trigger: {
      player: "loseAfter",
      global: "loseAsyncAfter"
    },
    filter(event2, player2) {
      if (event2.type !== "discard" || event2.getlx === false || player2 !== _status.currentPhase) {
        return false;
      }
      const evt = event2.getl(player2);
      if (!evt || !evt.cards2 || !evt.cards2.length) {
        return false;
      }
      const list = [];
      for (const i of evt.cards2) {
        list.add(get.suit(i, player2));
        if (list.length >= lib.suit.length) {
          return false;
        }
      }
      return true;
    },
    usable: 1,
    preHidden: true,
    async content(event2, trigger, player2) {
      let cards2 = get.cards(4, true);
      await player2.showCards(cards2, `${get.translation(player2)}发动了【诱言】`);
      const evt = trigger.getl(player2);
      const list = [];
      for (const i of evt.cards2) {
        list.add(get.suit(i, player2));
      }
      cards2 = cards2.filter((card) => !list.includes(get.suit(card, false)));
      if (cards2.length) {
        await player2.gain({ cards: cards2, animate: "gain2" });
      }
    },
    ai: {
      effect: {
        player_use(card, player2, target) {
          if (typeof card === "object" && player2 === _status.currentPhase && (!player2.storage.counttrigger || !player2.storage.counttrigger.gzyouyan) && player2.needsToDiscard() === 1 && card.cards && card.cards.filter((i) => {
            return get.position(i) === "h";
          }).length > 0 && !get.tag(card, "draw") && !get.tag(card, "gain") && !get.tag(card, "discard")) {
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  gzzhuihuan: {
    audio: "zhuihuan",
    trigger: { player: "phaseJieshuBegin" },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        selectTarget: [1, 2],
        prompt: `###${get.prompt(event2.skill)}###选择至多两名角色获得“追还”效果`,
        ai: (target) => {
          return get.attitude(get.player(), target);
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const prompt2 = "被选择的目标角色下次受到伤害后，其对伤害来源造成1点伤害；未被选择的目标角色下次受到伤害后，伤害来源弃置两张牌。";
      const next = player2.chooseTarget({
        prompt: "选择一名角色获得反伤效果",
        prompt2,
        filterTarget: (card, player3, target) => {
          return get.event().allTargets.includes(target);
        },
        ai: (target) => {
          return get.attitude(get.player(), target);
        }
      }).set("allTargets", event2.targets);
      if (event2.targets.length > 1) {
        next.set("forced", true);
      }
      const result2 = await next.forResult();
      player2.addTempSkill("gzzhuihuan_timeout", { player: "phaseZhunbeiBegin" });
      const id = `gzzhuihuan_${player2.playerid}`;
      event2.targets.forEach((target) => {
        if (result2?.bool && result2.targets?.includes(target)) {
          player2.line(target, "fire");
          target.addAdditionalSkill(id, "gzzhuihuan_damage");
        } else {
          player2.line(target, "thunder");
          target.addAdditionalSkill(id, "gzzhuihuan_discard");
        }
      });
    },
    subSkill: {
      timeout: {
        charlotte: true,
        onremove(player2) {
          const id = `gzzhuihuan_${player2.playerid}`;
          game.countPlayer((current) => current.removeAdditionalSkill(id));
        }
      },
      damage: {
        charlotte: true,
        trigger: { player: "damageEnd" },
        forced: true,
        forceDie: true,
        filter(event2, player2) {
          return event2.source && event2.source.isAlive();
        },
        logTarget: "source",
        async content(event2, trigger, player2) {
          player2.removeSkill("gzzhuihuan_damage");
          await trigger.source.damage();
        },
        mark: true,
        marktext: "追",
        intro: {
          content: "当你下次受到伤害后，你对伤害来源造成1点伤害。"
        },
        ai: {
          threaten: 0.5
        }
      },
      discard: {
        charlotte: true,
        trigger: { player: "damageEnd" },
        forced: true,
        forceDie: true,
        filter(event2, player2) {
          return event2.source && event2.source.isAlive();
        },
        logTarget: "source",
        async content(event2, trigger, player2) {
          player2.removeSkill("gzzhuihuan_discard");
          await trigger.source.chooseToDiscard({ selectCard: 2, position: "he", forced: true });
        },
        mark: true,
        marktext: "还",
        intro: {
          content: "当你下次受到伤害后，你令伤害来源弃置两张牌。"
        },
        ai: {
          threaten: 0.8
        }
      }
    }
  },
  //海外田豫
  gzzhenxi: {
    audio: "twzhenxi",
    trigger: { player: "useCardToPlayered" },
    filter(event2, player2) {
      if (event2.card.name !== "sha") {
        return false;
      }
      if (event2.target.hasCards("he") || player2.hasCard((card) => get.suit(card) === "diamond" && get.type2(card) !== "trick" && player2.canUse(get.autoViewAs({ name: "lebu" }, [card]), event2.target), "he") || player2.hasCard((card) => get.suit(card) === "club" && get.type2(card) !== "trick" && player2.canUse(get.autoViewAs({ name: "bingliang" }, [card]), event2.target, false), "he")) {
        return true;
      }
      return false;
    },
    check(event2, player2) {
      return get.attitude(player2, event2.target) < 0;
    },
    async cost(event2, trigger, player2) {
      const target = trigger.target;
      const list = [];
      let choiceList = [`弃置${get.translation(target)}一张牌`, `将一张♦非锦囊牌当做【乐不思蜀】或♣非锦囊牌当做【兵粮寸断】对${get.translation(target)}使用`, "背水！若其有暗置的武将牌且你的武将牌均明置，你依次执行上述两项"];
      if (target.hasDiscardableCards(player2, "he")) {
        list.push("选项一");
      } else {
        choiceList[0] = `<span style="opacity:0.5">${choiceList[0]}</span>`;
      }
      if (player2.hasCards("he", (card) => get.suit(card) === "diamond" && get.type2(card) !== "trick" && player2.canUse(get.autoViewAs({ name: "lebu" }, [card]), target)) || player2.hasCards("he", (card) => get.suit(card) === "club" && get.type2(card) !== "trick" && player2.canUse(get.autoViewAs({ name: "bingliang" }, [card]), target))) {
        list.push("选项二");
      } else {
        choiceList[1] = `<span style="opacity:0.5">${choiceList[1]}</span>`;
      }
      if (target.isUnseen(2) && !player2.isUnseen(2)) {
        list.push("背水！");
      } else {
        choiceList[2] = `<span style="opacity:0.5">${choiceList[2]}</span>`;
      }
      const result2 = await player2.chooseControl({
        controls: [...list, "cancel2"],
        prompt: get.prompt(event2.skill, target),
        choiceList,
        ai: () => {
          const player3 = _status.event.player;
          const trigger2 = _status.event.getTrigger();
          const list2 = _status.event.list;
          if (get.attitude(player3, trigger2.target) > 0) {
            return "cancel2";
          }
          if (list2.includes("背水！")) {
            return "背水！";
          }
          if (list2.includes("选项二")) {
            return "选项二";
          }
          return "选项一";
        }
      }).set("list", list).setHiddenSkill(event2.skill).forResult();
      event2.result = {
        bool: result2.control !== "cancel2",
        targets: [target],
        cost_data: result2.control
      };
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      event2.target = target;
      const choice = event2.cost_data;
      if (choice !== "选项二" && target.hasDiscardableCards(player2, "he")) {
        await player2.discardPlayerCard({ target, position: "he", forced: true });
      }
      if (choice !== "选项一" && (player2.hasCard((card) => get.suit(card) === "diamond" && get.type2(card) !== "trick" && player2.canUse(get.autoViewAs({ name: "lebu" }, [card]), target), "he") || player2.hasCard((card) => get.suit(card) === "club" && get.type2(card) !== "trick" && player2.canUse(get.autoViewAs({ name: "bingliang" }, [card]), target, false), "he"))) {
        let next = game.createEvent("gzzhenxi_use");
        next.player = player2;
        next.target = target;
        next.setContent(lib.skill.gzzhenxi.contentx);
        await next;
      }
    },
    ai: { unequip_ai: true },
    async contentx(event2, trigger, player2) {
      const { target } = event2;
      const result2 = await player2.chooseCard({
        position: "hes",
        forced: true,
        prompt: "震袭",
        prompt2: `将一张♦非锦囊牌当做【乐不思蜀】或♣非锦囊牌当做【兵粮寸断】对${get.translation(target)}使用`,
        filterCard(card, player3) {
          if (get.itemtype(card) !== "card" || get.type2(card) === "trick" || !["diamond", "club"].includes(get.suit(card))) {
            return false;
          }
          const cardx = { name: get.suit(card) === "diamond" ? "lebu" : "bingliang" };
          return player3.canUse(get.autoViewAs(cardx, [card]), _status.event.getParent().target, false);
        }
      }).forResult();
      if (result2.bool) {
        await player2.useCard({
          card: { name: get.suit(result2.cards[0], player2) === "diamond" ? "lebu" : "bingliang" },
          targets: [target],
          cards: result2.cards
        });
      }
    }
  },
  gzjiansu: {
    init(player2) {
      if (player2.checkViceSkill("gzjiansu") && !player2.viceChanged) {
        player2.removeMaxHp();
      }
    },
    viceSkill: true,
    audio: 2,
    trigger: {
      player: "gainAfter",
      global: "loseAsyncAfter"
    },
    filter(event2, player2) {
      if (player2 === _status.currentPhase) {
        return false;
      }
      return event2.getg(player2).length;
    },
    frequent: true,
    group: "gzjiansu_use",
    preHidden: ["gzjiansu_use"],
    async content(event2, trigger, player2) {
      player2.showCards(trigger.getg(player2), `${get.translation(player2)}发动了【俭素】`);
      player2.addGaintag(trigger.getg(player2), "gzjiansu_tag");
      player2.markSkill("gzjiansu");
    },
    intro: {
      mark(dialog, content, player2) {
        const hs = player2.getCards("h", (card) => {
          return card.hasGaintag("gzjiansu_tag");
        });
        if (!hs.length) {
          dialog.addText("无已展示手牌");
          return;
        }
        dialog.addSmall(hs);
      },
      content(content, player2) {
        const hs = player2.getCards("h", (card) => {
          return card.hasGaintag("gzjiansu_tag");
        });
        if (!hs.length) {
          return "无已展示手牌";
        }
        return get.translation(hs);
      }
    },
    subSkill: {
      use: {
        audio: "gzjiansu",
        trigger: { player: "phaseUseBegin" },
        filter(event2, player2) {
          const num = player2.countCards("h", (card) => {
            return card.hasGaintag("gzjiansu_tag");
          });
          return num > 0 && game.hasPlayer((current) => {
            return current.isDamaged() && current.getDamagedHp() <= num;
          });
        },
        async cost(event2, trigger, player2) {
          event2.result = await player2.chooseCardTarget({
            prompt: get.prompt("gzjiansu"),
            prompt2: "弃置任意张“俭”，令一名体力值不大于你以此法弃置的牌数的角色回复1点体力",
            filterCard: (card) => get.itemtype(card) === "card" && card.hasGaintag("gzjiansu_tag"),
            selectCard: [1, Infinity],
            filterTarget: (_card, targetPlayer, target) => target.isDamaged(),
            filterOk: () => ui.selected.targets.length && ui.selected.targets[0].hp <= ui.selected.cards.length,
            ai1: (card) => {
              if (ui.selected.targets.length && ui.selected.targets[0].hp <= ui.selected.cards.length) {
                return 0;
              }
              return 6 - get.value(card);
            },
            ai2: (target) => get.recoverEffect(target, get.player(), get.player()),
            allowChooseAll: true
          }).setHiddenSkill(event2.skill).forResult();
        },
        async content(event2, trigger, player2) {
          const target = event2.targets[0];
          const discardEvent = player2.discard({ cards: event2.cards });
          const recoverEvent = target.recover();
          await discardEvent;
          await recoverEvent;
        }
      }
    }
  },
  //海外刘夫人
  gzzhuidu: {
    audio: "twzhuidu",
    trigger: { source: "damageBegin3" },
    filter(event2, player2) {
      return player2.isPhaseUsing();
    },
    check(event2, player2) {
      return get.attitude(player2, event2.player) < 0;
    },
    usable: 1,
    logTarget: "player",
    async content(event2, trigger, player2) {
      const target = trigger.player;
      let control;
      if (target.hasSex("female") && target.hasCards("e")) {
        const discardResult = await player2.chooseToDiscard({
          position: "he",
          prompt: "追妒：是否弃置一张牌并令其执行两项？",
          ai: (card) => 8 - get.value(card)
        }).forResult();
        if (discardResult.bool) {
          control = "我全都要！";
        }
      }
      if (control !== "我全都要！") {
        if (target.hasCards("e")) {
          const result2 = await target.chooseControl({
            prompt: "追妒：请选择一项",
            choiceList: [`令${get.translation(player2)}此次对你造成的伤害+1`, "弃置装备区里的所有牌"],
            ai: (_event, player3) => {
              const cards2 = player3.getCards("e");
              if (player3.hp <= 2) {
                return 1;
              }
              if (get.value(cards2) <= 7) {
                return 1;
              }
              return 0;
            }
          }).forResult();
          control = result2.control;
        } else {
          control = "选项一";
        }
      }
      player2.line(target);
      if (control !== "选项二") {
        trigger.num++;
      }
      if (control !== "选项一") {
        await target.chooseToDiscard({ selectCard: target.countCards("e"), forced: true, position: "e" });
      }
    }
  },
  gzshigong: {
    audio: "twshigong",
    trigger: { player: "dying" },
    filter(event2, player2) {
      return _status.currentPhase && _status.currentPhase !== player2 && _status.currentPhase.isIn() && player2.hasViceCharacter() && player2.hp <= 0;
    },
    skillAnimation: true,
    animationColor: "gray",
    limited: true,
    logTarget: () => _status.currentPhase,
    check(event2, player2) {
      if (player2.countCards("h", (card) => {
        const mod2 = game.checkMod(card, player2, "unchanged", "cardEnabled2", player2);
        if (mod2 !== "unchanged") {
          return mod2;
        }
        const mod = game.checkMod(card, player2, event2.player, "unchanged", "cardSavable", player2);
        if (mod !== "unchanged") {
          return mod;
        }
        let savable = get.info(card).savable;
        if (typeof savable === "function") {
          savable = savable(card, player2, event2.player);
        }
        return savable;
      }) >= 1 - event2.player.hp) {
        return false;
      }
      return true;
    },
    async content(event2, trigger, player2) {
      const target = _status.currentPhase;
      player2.awakenSkill("gzshigong");
      const list = lib.character[player2.name2][3].filter((skill) => get.skillCategoriesOf(skill, player2).length === 0);
      await player2.removeCharacter(1);
      if (!list.length) {
        await player2.recover(1 - player2.hp);
        return;
      }
      const result2 = await target.chooseControl({
        controls: [...list, "cancel2"],
        choiceList: list.map((skill) => `<div class="skill">【${get.translation(lib.translate[`${skill}_ab`] || get.translation(skill).slice(0, 2))}】</div><div>${get.skillInfoTranslation(skill, target, false)}</div>`),
        ai: (event3) => {
          if (get.attitude(event3.player, event3.getParent().player) > 0) {
            return 0;
          }
          return [0, 1].randomGet();
        },
        prompt: `${get.translation(player2)}对你发动了【示恭】`,
        prompt2: "获得一个技能并令其将体力回复至体力上限；或点击“取消”，令其将体力值回复至1点。"
      }).set("displayIndex", false).forResult();
      if (result2.control === "cancel2") {
        await player2.recover(1 - player2.hp);
        return;
      }
      await target.addSkills(result2.control);
      target.line(player2);
      await player2.recover(player2.maxHp - player2.hp);
    }
  },
  //海外服华雄
  gzyaowu: {
    audio: "new_reyaowu",
    limited: true,
    trigger: { source: "damageSource" },
    filter(event2, player2) {
      if (player2.isUnseen(0) && lib.character[player2.name1][3].includes("gzyaowu")) {
        return true;
      }
      if (player2.isUnseen(1) && lib.character[player2.name2][3].includes("gzyaowu")) {
        return true;
      }
      return false;
    },
    skillAnimation: true,
    animationColor: "fire",
    check(event2, player2) {
      return player2.isDamaged() || player2.hp <= 2;
    },
    async content(event2, trigger, player2) {
      player2.awakenSkill("gzyaowu");
      const gainEvent = player2.gainMaxHp(2);
      const recoverEvent = player2.recover(2);
      player2.addSkill("gzyaowu_die");
      await gainEvent;
      await recoverEvent;
    },
    ai: { mingzhi_no: true },
    subSkill: {
      die: {
        audio: "new_reyaowu",
        trigger: { player: "dieAfter" },
        filter(event2, player2) {
          return game.hasPlayer((current) => {
            return current !== player2 && current.isFriendOf(player2);
          });
        },
        forced: true,
        forceDie: true,
        charlotte: true,
        skillAnimation: true,
        animationColor: "fire",
        logTarget(event2, player2) {
          return game.filterPlayer((current) => {
            return current !== player2 && current.isFriendOf(player2);
          });
        },
        async content(event2, trigger, player2) {
          const events = lib.skill.gzyaowu_die.logTarget(trigger, player2).map((target) => target.loseHp());
          for (const next of events) {
            await next;
          }
        }
      }
    }
  },
  gzshiyong: {
    audio: "shiyong",
    derivation: "gzshiyongx",
    trigger: { player: "damageEnd" },
    filter(event2, player2) {
      if (!event2.card) {
        return false;
      }
      if (player2.awakenedSkills.includes("gzyaowu")) {
        return event2.source && event2.source.isIn() && get.color(event2.card) !== "black";
      }
      return get.color(event2.card) !== "red";
    },
    forced: true,
    logTarget(event2, player2) {
      if (player2.awakenedSkills.includes("gzyaowu")) {
        return event2.source;
      }
      return;
    },
    async content(event2, trigger, player2) {
      await (lib.skill.gzshiyong.logTarget(trigger, player2) || player2).draw();
    }
  },
  //海外服夏侯尚
  gztanfeng: {
    audio: "twtanfeng",
    trigger: { player: "phaseZhunbeiBegin" },
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        return !current.isFriendOf(player2) && current.hasDiscardableCards(player2, "hej");
      });
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2(event2.skill),
        filterTarget: (card, player3, target) => !target.isFriendOf(player3) && target.hasDiscardableCards(player3, "hej"),
        ai: (target) => {
          const player3 = _status.event.player;
          if (target.hp + target.countCards("hs", { name: ["tao", "jiu"] }) <= 2) {
            return 3 * get.effect(target, { name: "guohe" }, player3, player3);
          }
          return get.effect(target, { name: "guohe" }, player3, player3);
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      await player2.discardPlayerCard({ target, position: "hej", forced: true });
      const { bool } = await target.chooseBool({
        prompt: `是否受到${get.translation(player2)}造成的1点火焰伤害，令其跳过一个阶段？`,
        ai: () => _status.event.choice,
        choice: get.damageEffect(target, player2, target, "fire") >= -5
      }).forResult();
      if (!bool) {
        return;
      }
      player2.line(target);
      await target.damage({ num: 1, nature: "fire" });
      const list = [];
      const list2 = [];
      const map = {
        phaseJudge: "判定阶段",
        phaseDraw: "摸牌阶段",
        phaseUse: "出牌阶段",
        phaseDiscard: "弃牌阶段"
      };
      for (const phase of ["phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard"]) {
        if (!player2.skipList.includes(phase)) {
          const name = map[phase];
          list.push(name);
          if (name !== "判定阶段" && name !== "弃牌阶段") {
            list2.push(name);
          }
        }
      }
      let choice;
      const att = get.attitude(target, player2);
      const num = player2.countCards("j");
      if (att > 0) {
        choice = list.includes("判定阶段") && num > 0 ? "判定阶段" : "弃牌阶段";
      } else if (list.includes("摸牌阶段") && player2.hasJudge("lebu")) {
        choice = "摸牌阶段";
      } else if (list.includes("出牌阶段") && player2.hasJudge("bingliang") || player2.needsToDiscard() > 0) {
        choice = "出牌阶段";
      } else {
        choice = list2.randomGet();
      }
      const { control } = await target.chooseControl({
        controls: list,
        prompt: `探锋：令${get.translation(player2)}跳过一个阶段`,
        ai: () => _status.event.choice
      }).set("choice", choice).forResult();
      for (const phase in map) {
        if (map[phase] === control) {
          player2.skip(phase);
        }
      }
      target.popup(control);
      target.line(player2);
      game.log(player2, "跳过了", `#y${control}`);
    }
  },
  //十周年羊祜
  gzdeshao: {
    audio: "dcdeshao",
    trigger: { target: "useCardToTargeted" },
    usable(skill, player2) {
      return player2.hp;
    },
    preHidden: true,
    countUnseen(player2) {
      let num = 0;
      if (player2.isUnseen(0)) {
        num++;
      }
      if (player2.isUnseen(1)) {
        num++;
      }
      return num;
    },
    filter(event2, player2) {
      if (player2 === event2.player || event2.targets.length !== 1 || get.color(event2.card) !== "black") {
        return false;
      }
      if (lib.skill.gzdeshao.countUnseen(event2.player) < lib.skill.gzdeshao.countUnseen(player2)) {
        return false;
      }
      return event2.player.hasDiscardableCards(player2, "he");
    },
    check(event2, player2) {
      return get.effect(event2.player, { name: "guohe_copy2" }, player2, player2) > 0;
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      await player2.discardPlayerCard({ target: trigger.player, forced: true, position: "he" });
    }
  },
  gzmingfa: {
    audio: "dcmingfa",
    enable: "phaseUse",
    usable: 1,
    filterTarget(card, player2, target) {
      return player2 !== target && target.isEnemyOf(player2);
    },
    async content(event2, trigger, player2) {
      const { targets } = event2;
      player2.markAuto("gzmingfa", targets);
      game.delayx();
    },
    onremove: true,
    ai: {
      order: 1,
      result: { target: -1 }
    },
    group: "gzmingfa_effect",
    subSkill: {
      effect: {
        audio: "dcmingfa",
        trigger: { global: "phaseEnd" },
        forced: true,
        filter(event2, player2) {
          return player2.getStorage("gzmingfa").includes(event2.player);
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          const target = trigger.player;
          player2.unmarkAuto("gzmingfa", [target]);
          if (!target.isIn()) {
            return;
          }
          const num = player2.countCards("h") - target.countCards("h");
          if (num > 0) {
            const damageEvent = target.damage();
            const gainEvent = player2.gainPlayerCard({ target, forced: true, position: "h" });
            await damageEvent;
            await gainEvent;
          } else if (num < 0) {
            await player2.draw(Math.min(5, -num));
          }
        }
      }
    }
  },
  //海外服国战
  //杨修
  gzdanlao: {
    audio: "danlao",
    inherit: "danlao",
    preHidden: true,
    filter(event2, player2) {
      return get.type2(event2.card) === "trick" && event2.targets?.length > 1;
    }
  },
  gzjilei: {
    inherit: "jilei",
    preHidden: true,
    async cost(event2, trigger, player2) {
      const source = trigger.source;
      const result2 = await player2.chooseControl({
        controls: ["basic", "trick", "equip", "cancel2"],
        prompt: get.prompt2("jilei", source),
        ai: () => {
          if (get.attitude(player2, source) > 0) {
            return "cancel2";
          }
          const list = ["basic", "trick", "equip"].filter((name) => {
            return !source.storage.jilei2 || !source.storage.jilei2.includes(name);
          });
          if (!list.length) {
            return "cancel2";
          }
          if (list.includes("trick") && source.countCards("h", (card) => {
            return get.type(card, null, source) === "trick" && source.hasValueTarget(card);
          }) > 1) {
            return "trick";
          }
          return list[0];
        }
      }).setHiddenSkill(event2.skill).forResult();
      event2.result = {
        bool: result2.control !== "cancel2",
        targets: [source],
        cost_data: result2.control
      };
    },
    async content(event2, trigger, player2) {
      const control = event2.cost_data;
      player2.chat(`${get.translation(control)}牌`);
      game.log(player2, "声明了", `#y${get.translation(control)}牌`);
      trigger.source.addTempSkill("jilei2");
      trigger.source.storage.jilei2.add(control);
      trigger.source.updateMarks("jilei2");
      await game.delayx();
    }
  },
  //诸葛瑾
  gzhuanshi: {
    audio: "huanshi",
    trigger: { global: "judge" },
    popup: false,
    preHidden: true,
    filter(event2, player2) {
      return player2.hasCards("hes") && event2.player.isFriendOf(player2);
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCard({
        prompt: `${get.translation(trigger.player)}的${trigger.judgestr || ""}判定为${get.translation(trigger.player.judging[0])}，${get.prompt(event2.skill)}`,
        position: "hes",
        filterCard: (card) => {
          const player3 = get.player();
          const mod2 = game.checkMod(card, player3, "unchanged", "cardEnabled2", player3);
          if (mod2 !== "unchanged") {
            return mod2;
          }
          const mod = game.checkMod(card, player3, "unchanged", "cardRespondable", player3);
          if (mod !== "unchanged") {
            return mod;
          }
          return true;
        },
        ai: (card) => {
          const trigger2 = get.event().getTrigger();
          const { player: player3, judging } = get.event();
          const result2 = trigger2.judge(card) - trigger2.judge(judging);
          const attitude = get.attitude(player3, trigger2.player);
          if (attitude === 0 || result2 === 0) {
            return 0;
          }
          if (attitude > 0) {
            return result2 - get.value(card) / 2;
          } else {
            return -result2 - get.value(card) / 2;
          }
        }
      }).set("judging", trigger.player.judging[0]).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const next = player2.respond({ cards: event2.cards, skill: event2.name, highlight: true, noOrdering: true });
      await next;
      const { cards: cards2 } = next;
      if (cards2?.length) {
        if (trigger.player.judging[0].clone) {
          trigger.player.judging[0].clone.classList.remove("thrownhighlight");
          game.broadcast((card) => {
            if (card.clone) {
              card.clone.classList.remove("thrownhighlight");
            }
          }, trigger.player.judging[0]);
          game.addVideo("deletenode", player2, get.cardsInfo([trigger.player.judging[0].clone]));
        }
        await game.cardsDiscard(trigger.player.judging[0]);
        trigger.player.judging[0] = cards2[0];
        trigger.orderingCards.addArray(cards2);
        game.log(trigger.player, "的判定牌改为", cards2);
        await game.delay(2);
      }
    },
    ai: {
      rejudge: true,
      tag: { rejudge: 1 }
    }
  },
  gzhongyuan: {
    audio: "hongyuan",
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return player2.hasCard((card) => {
        return lib.skill.gzhongyuan.filterCard(card);
      }, "h");
    },
    filterCard(card) {
      return !card.hasTag("lianheng") && !card.hasGaintag("_lianheng");
    },
    position: "h",
    discard: false,
    lose: false,
    async content(event2, trigger, player2) {
      const card = event2.cards[0];
      card.addGaintag("_lianheng");
      player2.addTempSkill("gzhongyuan_clear");
    },
    check(card) {
      return 4.5 - get.value(card);
    },
    group: "gzhongyuan_draw",
    preHidden: true,
    ai: { order: 2, result: { player: 1 } },
    subSkill: {
      clear: {
        charlotte: true,
        onremove(player2) {
          player2.removeGaintag("_lianheng");
        }
      },
      draw: {
        audio: "hongyuan",
        trigger: { player: "drawBefore" },
        filter(event2, player2) {
          return event2.getParent().name === "_lianheng" && game.hasPlayer((current) => {
            return current !== player2 && current.isFriendOf(player2);
          });
        },
        async cost(event2, trigger, player2) {
          event2.result = await player2.chooseTarget({
            prompt: get.prompt("gzhongyuan"),
            prompt2: `将摸牌（${get.cnNumber(trigger.num)}张）转移给一名同势力角色`,
            filterTarget: (_card, targetPlayer, target) => target !== targetPlayer && target.isFriendOf(targetPlayer),
            ai: () => -1
          }).setHiddenSkill("gzhongyuan").forResult();
        },
        async content(event2, trigger, player2) {
          const target = event2.targets[0];
          trigger.cancel();
          await target.draw(trigger.num);
        }
      }
    }
  },
  gzmingzhe: {
    audio: "mingzhe",
    trigger: {
      player: ["loseAfter", "useCard", "respond"],
      global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"]
    },
    filter(event2, player2) {
      if (player2 === _status.currentPhase) {
        return false;
      }
      if (event2.name === "useCard" || event2.name === "respond") {
        return get.color(event2.card, false) === "red" && player2.hasHistory("lose", (evt2) => {
          return (evt2.relatedEvent || evt2.getParent()) === event2 && evt2.hs && evt2.hs.length > 0;
        });
      }
      const evt = event2.getl(player2);
      if (!evt || !evt.es || !evt.es.length) {
        return false;
      }
      for (const i of evt.es) {
        if (get.color(i, player2) === "red") {
          return true;
        }
      }
      return false;
    },
    frequent: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      await player2.draw();
    }
  },
  //廖化
  gzdangxian: {
    trigger: { global: "phaseBegin" },
    forced: true,
    preHidden: true,
    audio: "dangxian",
    audioname2: {
      guansuo: "dangxian_guansuo"
    },
    filter(event2, player2) {
      return event2.player.isFriendOf(player2) && event2.player.hasMark("xianqu_mark");
    },
    async content(event2, trigger, player2) {
      trigger.phaseList.splice(trigger.num, 0, `phaseUse|${event2.name}`);
    },
    group: "gzdangxian_show",
    global: "gzdangxian_ai",
    subSkill: {
      ai: {
        ai: {
          keepXianqu: true,
          skillTagFilter(player2, tag, arg) {
            if (player2.countMark("xianqu_mark") > 1) {
              return false;
            }
            if (!game.hasPlayer((current) => current.isFriendOf(player2) && current.hasSkill("gzdangxian"))) {
              return false;
            }
          }
        }
      },
      show: {
        audio: "dangxian",
        trigger: { player: "showCharacterAfter" },
        forced: true,
        filter(event2, player2) {
          return event2.toShow.some((name) => {
            return get.character(name, 3).includes("gzdangxian");
          }) && !player2.storage.gzdangxian_draw;
        },
        async content(event2, trigger, player2) {
          player2.storage.gzdangxian_draw = true;
          player2.addMark("xianqu_mark", 1);
        }
      }
    }
  },
  //新国标2022
  //许褚
  gzluoyi: {
    audio: "luoyi",
    trigger: { player: "phaseDrawEnd" },
    preHidden: true,
    filter(event2, player2) {
      return player2.hasCards("he");
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseToDiscard({
        position: "he",
        prompt: get.prompt2(event2.skill),
        chooseonly: true,
        ai: (card) => {
          const hasAttack = player2.hasCard((cardx) => {
            if (cardx === card) {
              return false;
            }
            return (cardx.name === "sha" || cardx.name === "juedou") && player2.hasValueTarget(cardx, null, true);
          }, "hs");
          return hasAttack ? 5 - get.value(card) : -get.value(card);
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      await player2.discard({ cards: event2.cards });
      player2.addTempSkill("gzluoyi_buff");
    },
    subSkill: {
      buff: {
        audio: "luoyi",
        charlotte: true,
        forced: true,
        trigger: { source: "damageBegin1" },
        filter(event2, player2) {
          return event2.card && (event2.card.name === "sha" || event2.card.name === "juedou") && event2.getParent().type === "card";
        },
        async content(event2, trigger, player2) {
          trigger.num++;
        }
      }
    }
  },
  //典韦
  gzqiangxi: {
    audio: "qiangxi",
    inherit: "qiangxi",
    filterTarget(card, player2, target) {
      return target !== player2;
    }
  },
  //小乔
  gztianxiang: {
    audio: "tianxiang",
    audioname: ["daxiaoqiao", "re_xiaoqiao", "ol_xiaoqiao"],
    trigger: { player: "damageBegin4" },
    preHidden: true,
    usable: 1,
    filter(event2, player2) {
      return player2.hasCards("h", (card) => {
        return _status.connectMode || get.suit(card, player2) === "heart" && lib.filter.cardDiscardable(card, player2);
      }) && event2.num > 0;
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCardTarget({
        filterCard(card, player3) {
          return get.suit(card) === "heart" && lib.filter.cardDiscardable(card, player3);
        },
        filterTarget: lib.filter.notMe,
        ai1(card) {
          return 10 - get.value(card);
        },
        ai2(target) {
          const att = get.attitude(get.player(), target);
          const trigger2 = get.event().getTrigger();
          let da = 0;
          if (get.player().hp === 1) {
            da = 10;
          }
          const eff = get.damageEffect(target, trigger2.source, target);
          if (att === 0) {
            return 0.1 + da;
          }
          if (eff >= 0 && att > 0) {
            return att + da;
          }
          if (att > 0 && target.hp > 1) {
            if (target.maxHp - target.hp >= 3) {
              return att * 1.1 + da;
            }
            if (target.maxHp - target.hp >= 2) {
              return att * 0.9 + da;
            }
          }
          return -att + da;
        },
        prompt: get.prompt(event2.skill),
        prompt2: lib.translate[`${event2.skill}_info`]
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const {
        cards: cards2,
        targets: [target]
      } = event2;
      trigger.cancel();
      await player2.discard({ cards: cards2 });
      const result2 = await player2.chooseControlList(true, (event3, player3) => get.event().index, [`令${get.translation(target)}受到伤害来源对其造成的1点伤害，然后摸X张牌（X为其已损失体力值且至多为5）`, `令${get.translation(target)}失去1点体力，然后获得${get.translation(cards2)}`]).set(
        "index",
        (() => {
          let att = get.attitude(player2, target);
          if (target.hasSkillTag("maihp")) {
            att = -att;
          }
          return att > 0 ? 0 : 1;
        })()
      ).forResult();
      if (typeof result2.index !== "number") {
        return;
      }
      if (result2.index === 0) {
        await target.damage({ source: trigger.source || void 0, nosource: !trigger.source, nocard: true });
        if (target.getDamagedHp()) {
          await target.draw(Math.min(5, target.getDamagedHp()));
        }
      } else {
        await target.loseHp();
        if (cards2[0].isInPile()) {
          await target.gain({ cards: cards2, animate: "gain2" });
        }
      }
    },
    ai: {
      maixie_defend: true,
      effect: {
        target(card, player2, target) {
          if (player2.hasSkillTag("jueqing", false, target)) {
            return;
          }
          if (get.tag(card, "damage") && target.countCards("he") > 1) {
            return 0.7;
          }
        }
      }
    }
  },
  gzhongyan: {
    mod: {
      suit(card, suit) {
        if (suit === "spade") {
          return "heart";
        }
      },
      maxHandcard(player2, num) {
        if (player2.hasCard((card) => {
          return get.suit(card, player2) === "heart";
        }, "e")) {
          return num + 1;
        }
      }
    }
  },
  //黄忠
  gzliegong: {
    audio: "liegong",
    audioname2: { gz_jun_liubei: "shouyue_liegong" },
    locked: false,
    mod: {
      targetInRange(card, player2, target) {
        if (card.name === "sha" && target.countCards("h") < player2.countCards("h")) {
          return true;
        }
      },
      attackRange(player2, distance) {
        if (get.zhu(player2, "shouyue")) {
          return distance + 1;
        }
      }
    },
    trigger: { player: "useCardToPlayered" },
    filter(event2, player2) {
      return event2.card.name === "sha" && player2.hp <= event2.target.hp;
    },
    preHidden: true,
    logTarget: "target",
    async cost(event2, trigger, player2) {
      const target = get.translation(trigger.target);
      const card = get.translation(trigger.card);
      const result2 = await player2.chooseControl({
        controls: ["cancel2"],
        choiceList: [`令${card}对${target}的伤害+1`, `令${target}不能响应${card}`],
        prompt: get.prompt("gzliegong", trigger.target),
        ai: (_event, player3) => {
          const target2 = _status.event.getTrigger().target;
          if (get.attitude(player3, target2) > 0) {
            return 2;
          }
          return target2.mayHaveShan(player3, "use") ? 1 : 0;
        }
      }).setHiddenSkill("gzliegong").forResult();
      event2.result = {
        bool: result2.control !== "cancel2",
        cost_data: result2.index
      };
    },
    async content(event2, trigger, player2) {
      const target = trigger.target;
      if (event2.cost_data === 1) {
        game.log(trigger.card, "不可被", target, "响应");
        trigger.directHit.add(target);
        return;
      }
      game.log(trigger.card, "对", target, "的伤害+1");
      let map = trigger.getParent().customArgs;
      let id = target.playerid;
      if (!map[id]) {
        map[id] = {};
      }
      if (!map[id].extraDamage) {
        map[id].extraDamage = 0;
      }
      map[id].extraDamage++;
    }
  },
  //潘凤
  gzkuangfu: {
    audio: "kuangfu",
    trigger: { player: "useCardToPlayered" },
    preHidden: true,
    logTarget: "target",
    filter(event2, player2) {
      return event2.card.name === "sha" && player2.isPhaseUsing() && !player2.hasSkill("gzkuangfu_extra") && event2.target.hasGainableCards(player2, "e");
    },
    check(event2, player2) {
      if (get.attitude(player2, event2.target) > 0 || !event2.target.hasCard((card) => {
        return lib.filter.canBeGained(card, player2, event2.target) && get.value(card, event2.target) > 0;
      }, "e")) {
        return false;
      }
      return true;
    },
    async content(event2, trigger, player2) {
      trigger.getParent()._gzkuangfued = true;
      const next = player2.gainPlayerCard({ target: trigger.target, position: "e", forced: true });
      player2.addTempSkill("gzkuangfu_extra", "phaseUseAfter");
      await next;
    },
    subSkill: {
      extra: {
        trigger: { player: "useCardAfter" },
        charlotte: true,
        forced: true,
        filter(event2, player2) {
          return event2._gzkuangfued && !player2.hasHistory("sourceDamage", (evt) => {
            return evt.card && event2.card;
          }) && player2.hasCards("h");
        },
        async content(event2, trigger, player2) {
          await player2.chooseToDiscard({ position: "h", selectCard: 2, forced: true });
        }
      }
    }
  },
  //吕布
  gzwushuang: {
    audio: "wushuang",
    audioname2: { gz_lvlingqi: "wushuang_lvlingqi" },
    forced: true,
    locked: true,
    group: ["wushuang1", "wushuang2"],
    preHidden: ["wushuang1", "wushuang2", "gzwushuang"],
    trigger: { player: "useCard1" },
    direct: true,
    filter(event2, player2) {
      if (event2.card.name !== "juedou" || !event2.card.isCard) {
        return false;
      }
      if (event2.targets) {
        if (game.hasPlayer((current) => !event2.targets.includes(current) && lib.filter.targetEnabled2(event2.card, player2, current))) {
          return true;
        }
      }
      return false;
    },
    async content(event2, trigger, player2) {
      const num = game.countPlayer((current) => !trigger.targets.includes(current) && lib.filter.targetEnabled2(trigger.card, player2, current));
      const result2 = await player2.chooseTarget({
        prompt: `无双：是否为${get.translation(trigger.card)}增加${num > 1 ? "至多两个" : "一个"}目标？`,
        selectTarget: [1, Math.min(2, num)],
        filterTarget: (_card, player3, target) => {
          const currentTrigger = _status.event.getTrigger();
          return !currentTrigger.targets.includes(target) && lib.filter.targetEnabled2(currentTrigger.card, player3, target);
        },
        ai: (target) => {
          const player3 = _status.event.player;
          const card = _status.event.getTrigger().card;
          return get.effect(target, card, player3, player3);
        }
      }).setHiddenSkill("gzwushuang").forResult();
      if (!result2.bool) {
        return;
      }
      if (player2 !== game.me && !player2.isOnline()) {
        await game.delayx();
      }
      const targets = result2.targets.sortBySeat();
      player2.logSkill("gzwushuang", targets);
      trigger.targets.addArray(targets);
    }
  },
  //夏侯渊
  gzshensu: {
    audio: "shensu1",
    audioname: ["xiahouba", "re_xiahouyuan", "ol_xiahouyuan"],
    group: ["gzshensu_1", "gzshensu_2"],
    preHidden: ["gzshensu_1", "gzshensu_2", "gzshensu"],
    trigger: { player: "phaseDiscardBegin" },
    filter(event2, player2) {
      return player2.hp > 0;
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt(event2.skill),
        prompt2: "失去1点体力并跳过弃牌阶段，视为对一名其他角色使用一张无距离限制的【杀】",
        filterTarget: (card, player3, target) => player3.canUse("sha", target, false),
        ai: (target) => {
          const player3 = _status.event.player;
          if (!_status.event.goon || player3.hp <= target.hp) {
            return false;
          }
          return get.effect(target, { name: "sha", isCard: true }, player3, player3);
        }
      }).set("goon", player2.needsToDiscard()).setHiddenSkill("gzshensu").forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const loseHpEvent = player2.loseHp();
      trigger.cancel();
      await loseHpEvent;
      await player2.useCard({
        card: { name: "sha", isCard: true },
        targets: [target],
        addCount: false
      });
    },
    subSkill: {
      1: {
        audio: "shensu1",
        inherit: "shensu1",
        sourceSkill: "gzshensu"
      },
      2: {
        inherit: "shensu2",
        sourceSkill: "gzshensu"
      }
    }
  },
  //吕玲绮
  gzshenwei: {
    audio: "llqshenwei",
    mainSkill: true,
    init(player2) {
      if (player2.checkMainSkill("gzshenwei")) {
        player2.removeMaxHp();
      }
    },
    trigger: { player: "phaseDrawBegin2" },
    forced: true,
    locked: false,
    filter: (event2, player2) => !event2.numFixed && player2.isMaxHandcard(),
    preHidden: true,
    async content(event2, trigger, player2) {
      trigger.num += 2;
    },
    mod: {
      maxHandcard: (player2, num) => num + 2
    }
  },
  gzzhuangrong: {
    audio: "zhuangrong",
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return !player2.hasSkill("gz_wushuang") && player2.hasCard((card) => {
        return get.type2(card, player2) === "trick";
      }, "h");
    },
    filterCard(card, player2) {
      return get.type2(card, player2) === "trick";
    },
    async content(event2, trigger, player2) {
      await player2.addTempSkills("gz_wushuang", "phaseUseEnd");
    },
    derivation: "gz_wushuang"
  },
  wushuang_lvlingqi: { audio: 2 },
  //荀谌
  gzfenglve: {
    audio: "refenglve",
    derivation: "gzfenglve_zongheng",
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return player2.hasCards("h") && !player2.hasSkillTag("noCompareSource") && game.hasPlayer((current) => {
        return current !== player2 && current.hasCards("h") && !current.hasSkillTag("noCompareTarget");
      });
    },
    filterTarget(card, player2, target) {
      return target !== player2 && target.hasCards("h") && !target.hasSkillTag("noCompareTarget");
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      const compareResult = await player2.chooseToCompare(target).forResult();
      if (compareResult.bool && target.hasCards("hej")) {
        const result2 = await target.choosePlayerCard({ target, forced: true, position: "hej", selectButton: 2, prompt: `交给${get.translation(player2)}两张牌` }).forResult();
        if (result2.bool) {
          await target.give(result2.cards, player2, "giveAuto");
        }
      } else if (!compareResult.bool && !compareResult.tie && player2.hasCards("he")) {
        const result2 = await player2.chooseCard({ forced: true, position: "he", prompt: `交给${get.translation(target)}一张牌` }).forResult();
        if (result2.bool) {
          await player2.give(result2.cards, target, "giveAuto");
        }
      }
      if (target.isIn()) {
        const result2 = await player2.chooseBool({
          prompt: `纵横：是否令${get.translation(target)}获得【锋略】？`,
          ai: () => {
            const evt = _status.event.getParent();
            return get.attitude(evt.player, evt.target) > 0;
          }
        }).forResult();
        if (result2.bool) {
          target.addTempSkill("gzfenglve_zongheng", { player: "phaseEnd" });
          game.log(player2, "发起了", "#y纵横", "，令", target, "获得了技能", "#g【锋略】");
        }
      }
    },
    ai: {
      order: 8,
      result: {
        target(player2, target) {
          if (!player2.hasCard((card) => {
            if (get.position(card) !== "h") {
              return false;
            }
            const val = get.value(card);
            if (val < 0) {
              return true;
            }
            if (val <= 5) {
              return card.number >= 10;
            }
            if (val <= 6) {
              return card.number >= 13;
            }
            return false;
          })) {
            return 0;
          }
          return -Math.sqrt(1 + target.countCards("he")) / (1 + target.countCards("j"));
        }
      }
    }
  },
  gzfenglve_zongheng: {
    inherit: "gzfenglve",
    async content(event2, trigger, player2) {
      const { target } = event2;
      const compareResult = await player2.chooseToCompare(target).forResult();
      if (compareResult.bool) {
        if (!target.hasCards("hej")) {
          return;
        }
        const result2 = await target.choosePlayerCard({ target, forced: true, position: "hej", prompt: `交给${get.translation(player2)}一张牌` }).forResult();
        if (result2.bool) {
          await target.give(result2.cards, player2, "giveAuto");
        }
      } else if (!compareResult.tie) {
        if (!player2.hasCards("he")) {
          return;
        }
        const result2 = await player2.chooseCard({ forced: true, position: "he", selectCard: 2, prompt: `交给${get.translation(target)}两张牌` }).forResult();
        if (result2.bool) {
          await player2.give(result2.cards, target, "giveAuto");
        }
      }
    },
    ai: {
      order: 8,
      result: {
        target(player2, target) {
          if (!player2.hasCard((card) => {
            if (get.position(card) !== "h") {
              return false;
            }
            const val = get.value(card);
            if (val < 0) {
              return true;
            }
            if (val <= 5) {
              return card.number >= 12;
            }
            if (val <= 6) {
              return card.number >= 13;
            }
            return false;
          })) {
            return 0;
          }
          return -Math.sqrt(1 + target.countCards("he")) / (1 + target.countCards("j"));
        }
      }
    }
  },
  gzanyong: {
    audio: "anyong",
    trigger: { global: "damageBegin1" },
    usable: 1,
    filter(event2, player2) {
      return event2.source && event2.player !== event2.source && event2.source.isFriendOf(player2) && event2.player.isIn();
    },
    check(event2, player2) {
      if (get.attitude(player2, event2.player) > 0) {
        return false;
      }
      if (event2.player.hasSkillTag("filterDamage", null, {
        player: event2.source,
        card: event2.card
      })) {
        return false;
      }
      if (event2.player.isUnseen()) {
        return true;
      }
      if (event2.player.hp > event2.num && event2.player.hp <= event2.num * 2) {
        return player2.hp > 1 || event2.player.isUnseen(2);
      }
      return false;
    },
    logTarget: "player",
    preHidden: true,
    async content(event2, trigger, player2) {
      trigger.num *= 2;
      if (!trigger.player.isUnseen(2)) {
        const next = player2.loseHp();
        player2.removeSkill("gzanyong");
        await next;
      } else if (!trigger.player.isUnseen()) {
        await player2.chooseToDiscard({ position: "h", selectCard: 2, forced: true });
      }
    }
  },
  //周夷
  gzzhukou: {
    audio: "zhukou",
    trigger: { source: "damageSource" },
    preHidden: true,
    filter(event2, player2) {
      if (!player2.getHistory("useCard").length) {
        return false;
      }
      const evt = event2.getParent("phaseUse");
      if (!evt || !evt.player) {
        return false;
      }
      return player2.getHistory("sourceDamage", (evtx) => {
        return evtx.getParent("phaseUse") === evt;
      }).indexOf(event2) === 0;
    },
    frequent: true,
    async content(event2, trigger, player2) {
      await player2.draw(Math.min(player2.getHistory("useCard").length, 5));
    }
  },
  gzduannian: {
    audio: 2,
    trigger: { player: "phaseUseEnd" },
    preHidden: true,
    filter(event2, player2) {
      return player2.hasCards("h") && !player2.hasCard((card) => {
        return !lib.filter.cardDiscardable(card, player2, "gzduannian");
      }, "h");
    },
    check(event2, player2) {
      return player2.countCards("h", (card) => get.value(card) >= 6) <= Math.max(1, player2.countCards("h") / 2);
    },
    async content(event2, trigger, player2) {
      const cards2 = player2.getCards("h", (card) => {
        return lib.filter.cardDiscardable(card, player2, "gzduannian");
      });
      if (!cards2.length) {
        return;
      }
      await player2.discard({ cards: cards2 });
      await player2.drawTo(player2.maxHp);
    }
  },
  gzlianyou: {
    trigger: { player: "die" },
    forceDie: true,
    skillAnimation: true,
    animationColor: "fire",
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        filterTarget: lib.filter.notMe,
        prompt: get.prompt(event2.skill),
        prompt2: "令一名其他角色获得〖兴火〗",
        ai: (target) => 10 + get.attitude(_status.event.player, target) * (target.hasSkillTag("fireAttack", null, null, true) ? 2 : 1)
      }).set("forceDie", true).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      await target.addSkills("gzxinghuo");
      await game.delayx();
    },
    derivation: "gzxinghuo"
  },
  gzxinghuo: {
    trigger: { source: "damageBegin1" },
    forced: true,
    filter(event2) {
      return event2.hasNature("fire");
    },
    async content(event2, trigger, player2) {
      trigger.num++;
    }
  },
  //南华老仙
  gzgongxiu: {
    audio: "gongxiu",
    trigger: { player: "phaseDrawBegin2" },
    preHidden: true,
    filter(event2, player2) {
      return !event2.numFixed && event2.num > 0 && player2.maxHp > 0;
    },
    async content(event2, trigger, player2) {
      trigger.num--;
      player2.addTempSkill("gzgongxiu2", "phaseDrawAfter");
    }
  },
  gzgongxiu2: {
    trigger: { player: "phaseDrawEnd" },
    forced: true,
    charlotte: true,
    popup: false,
    async content(event2, trigger, player2) {
      const choiceList = [`令至多${get.cnNumber(player2.maxHp)}名角色各摸一张牌`, `令至多${get.cnNumber(player2.maxHp)}名角色各弃置一张牌`];
      const index = typeof player2.storage.gzgongxiu !== "number" ? (await player2.chooseControl({ choiceList }).forResult()).index : 1 - player2.storage.gzgongxiu;
      player2.storage.gzgongxiu = index;
      const result2 = await player2.chooseTarget({
        forced: true,
        selectTarget: [1, player2.maxHp],
        prompt: `选择至多${get.cnNumber(player2.maxHp)}名角色各${index ? "弃置" : "摸"}一张牌`,
        ai: (target) => {
          const evt = _status.event;
          return evt.goon * get.attitude(evt.player, target);
        }
      }).set("goon", index ? -1 : 1).forResult();
      if (result2.bool) {
        const targets = result2.targets.sortBySeat();
        player2.line(targets, "green");
        if (index === 0) {
          await game.asyncDraw(targets);
        } else {
          for (const target of targets) {
            await target.chooseToDiscard({ position: "he", forced: true });
          }
          return;
        }
      }
      await game.delayx();
    }
  },
  gzjinghe: {
    audio: "jinghe",
    enable: "phaseUse",
    filter(event2, player2) {
      return player2.maxHp > 0 && player2.hasCards("h") && !player2.hasSkill("gzjinghe_clear");
    },
    selectCard() {
      const max = _status.event.player.maxHp;
      if (ui.selected.targets.length) {
        return [ui.selected.targets.length, max];
      }
      return [1, max];
    },
    selectTarget() {
      return ui.selected.cards.length;
    },
    filterTarget(card, player2, target) {
      return !target.isUnseen();
    },
    filterCard(card) {
      if (ui.selected.cards.length) {
        const name = get.name(card);
        for (const selectedCard of ui.selected.cards) {
          if (get.name(selectedCard) === name) {
            return false;
          }
        }
      }
      return true;
    },
    position: "h",
    check(card) {
      const player2 = _status.event.player;
      if (game.countPlayer((current) => {
        return get.attitude(player2, current) > 0 && !current.isUnseen();
      }) > ui.selected.cards.length) {
        return get.position(card) === "e" ? 2 : 1;
      }
      return 0;
    },
    complexCard: true,
    discard: false,
    lose: false,
    delay: false,
    multitarget: true,
    multiline: true,
    async content(event2, trigger, player2) {
      const showCardsEvent = player2.showCards(event2.cards, `${get.translation(player2)}发动了【经合】`);
      const skills = lib.skill.gzjinghe.derivation.randomGets(event2.targets.length);
      player2.addTempSkill("gzjinghe_clear", { player: "phaseBegin" });
      event2.targets.sortBySeat();
      await showCardsEvent;
      for (const target of event2.targets) {
        const { control: skill } = await target.chooseControl({
          controls: [...skills, "cancel2"],
          choiceList: skills.map((skill2) => `<div class="skill">【${get.translation(lib.translate[`${skill2}_ab`] || get.translation(skill2).slice(0, 2))}】</div><div>${get.skillInfoTranslation(skill2, player2, false)}</div>`),
          prompt: "选择获得一个技能"
        }).set("displayIndex", false).forResult();
        if (skill !== "cancel2") {
          skills.remove(skill);
          const addSkillEvent = target.addAdditionalSkills(`gzjinghe_${player2.playerid}`, skill);
          target.popup(skill);
          await addSkillEvent;
        }
        if (target !== game.me && !target.isOnline2()) {
          await game.delayx();
        }
      }
    },
    ai: {
      threaten: 3,
      order: 10,
      result: {
        target: 1
      }
    },
    derivation: ["leiji", "nhyinbing", "nhhuoqi", "nhguizhu", "nhxianshou", "nhlundao", "nhguanyue", "nhyanzheng"],
    subSkill: {
      clear: {
        onremove(player2) {
          game.countPlayer((current) => {
            current.removeAdditionalSkills(`gzjinghe_${player2.playerid}`);
          });
        }
      }
    }
  },
  //孙綝
  gzshilu: {
    audio: "zyshilu",
    preHidden: true,
    trigger: { global: "dieAfter" },
    prompt2(event2, player2) {
      return `将其的所有武将牌${player2 === event2.source ? "及武将牌库里的两张随机武将牌" : ""}置于武将牌上作为“戮”`;
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      const list = [];
      const target = trigger.player;
      if (target.name1 && target.name1.indexOf("gz_shibing") !== 0 && _status.characterlist.includes(target.name1)) {
        list.push(target.name1);
      }
      if (target.name2 && target.name2.indexOf("gz_shibing") !== 0 && _status.characterlist.includes(target.name1)) {
        list.push(target.name2);
      }
      _status.characterlist.removeArray(list);
      if (player2 === trigger.source) {
        list.addArray(_status.characterlist.randomRemove(2));
      }
      if (list.length) {
        player2.markAuto("gzshilu", list);
        game.log(player2, "将", `#g${get.translation(list)}`, "置于武将牌上作为", "#y“戮”");
        game.broadcastAll(
          (player3, list2) => {
            const cards2 = [];
            for (const name of list2) {
              let cardname = `huashen_card_${name}`;
              lib.card[cardname] = {
                fullimage: true,
                image: `character:${name}`
              };
              lib.translate[cardname] = get.rawName2(name);
              cards2.push(game.createCard(cardname, "", ""));
            }
            player3.$draw(cards2, "nobroadcast");
          },
          player2,
          list
        );
      }
    },
    marktext: "戮",
    intro: {
      content: "character",
      onunmark(storage, player2) {
        if (storage && storage.length) {
          _status.characterlist.addArray(storage);
          storage.length = 0;
        }
      },
      mark(dialog, storage, player2) {
        if (storage && storage.length) {
          dialog.addSmall([storage, "character"]);
        } else {
          return "没有“戮”";
        }
      }
      // content:function(storage,player){
      // 	return '共有'+get.cnNumber(storage.length)+'张“戮”';
      // },
    },
    group: "gzshilu_zhiheng",
    subSkill: {
      zhiheng: {
        audio: "gzshilu",
        trigger: { player: "phaseZhunbeiBegin" },
        filter(event2, player2) {
          return player2.getStorage("gzshilu").length > 0 && player2.hasCards("he");
        },
        direct: true,
        async content(event2, trigger, player2) {
          const num = Math.min(player2.getStorage("gzshilu").length, player2.countCards("he"));
          const result2 = await player2.chooseToDiscard({
            position: "he",
            prompt: get.prompt("gzshilu"),
            prompt2: `弃置至多${get.cnNumber(num)}张牌并摸等量的牌`,
            selectCard: [1, num]
          }).set("logSkill", "gzshilu").forResult();
          if (!result2.bool || !result2.cards?.length) {
            return;
          }
          await player2.draw(result2.cards.length);
        }
      }
    }
  },
  gzxiongnve: {
    audio: "zyxiongnve",
    trigger: { player: "phaseUseBegin" },
    filter(event2, player2) {
      return player2.getStorage("gzshilu").length > 0;
    },
    async cost(event2, trigger, player2) {
      const result2 = await player2.chooseButton({
        createDialog: [get.prompt(event2.skill), [player2.storage.gzshilu, "character"]],
        ai: (button) => {
          if (!_status.event.goon) {
            return 0;
          }
          const name = button.link;
          let group = get.is.double(name, true);
          if (!group) {
            group = [lib.character[name][1]];
          }
          for (const i of group) {
            if (game.hasPlayer((current) => {
              return player2.inRange(current) && current.identity === i;
            })) {
              return 1 + Math.random();
            }
          }
          return 0;
        }
      }).set(
        "goon",
        player2.countCards("hs", (card) => {
          return get.tag(card, "damage") && player2.hasValueTarget(card);
        }) > 1
      ).forResult();
      event2.result = {
        bool: result2.bool,
        cost_data: result2.links
      };
    },
    async content(event2, trigger, player2) {
      const characters = event2.cost_data;
      lib.skill.gzxiongnve.throwCharacter(player2, characters);
      await game.delayx();
      const character = characters[0];
      let group = get.is.double(character, true);
      if (!group) {
        group = [lib.character[character][1]];
      }
      const str = get.translation(group);
      const result2 = await player2.chooseControl({
        prompt: "选择获得一项效果",
        choiceList: [`本回合对${str}势力的角色造成的伤害+1`, `本回合对${str}势力的角色造成伤害后，获得对方的一张牌`, `本回合对${str}势力的角色使用牌没有次数限制`],
        ai: () => {
          const player3 = _status.event.player;
          if (player3.countCards("hs", (card) => get.name(card) === "sha" && player3.hasValueTarget(card)) > player3.getCardUsable("sha")) {
            return 0;
          }
          return get.rand(1, 2);
        }
      }).forResult();
      const skill = `gzxiongnve_effect${result2.index}`;
      player2.markAuto(skill, group);
      player2.addTempSkill(skill);
      game.log(player2, `本回合对${get.translation(group)}势力的角色`, `#g${lib.skill[skill].promptx}`);
    },
    group: "gzxiongnve_end",
    throwCharacter(player2, list) {
      player2.unmarkAuto("gzshilu", list);
      _status.characterlist.addArray(list);
      game.log(player2, "从", "#y“戮”", "中移去了", `#g${get.translation(list)}`);
      game.broadcastAll(
        (player3, list2) => {
          const cards2 = [];
          for (const character of list2) {
            let cardname = `huashen_card_${character}`;
            lib.card[cardname] = {
              fullimage: true,
              image: `character:${character}`
            };
            lib.translate[cardname] = get.rawName2(character);
            cards2.push(game.createCard(cardname, "", ""));
          }
          player3.$throw(cards2, 1e3, "nobroadcast");
        },
        player2,
        list
      );
    },
    subSkill: {
      effect0: {
        promptx: "造成的伤害+1",
        charlotte: true,
        onremove: true,
        audio: "zyxiongnve",
        intro: {
          content: "对$势力的角色造成的伤害+1"
        },
        trigger: { source: "damageBegin1" },
        forced: true,
        filter(event2, player2) {
          return player2.getStorage("gzxiongnve_effect0").includes(event2.player.identity);
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          trigger.num++;
        }
      },
      effect1: {
        promptx: "造成伤害后，获得对方的一张牌",
        charlotte: true,
        onremove: true,
        audio: "zyxiongnve",
        intro: {
          content: "对$势力的角色造成伤害后，获得对方的一张牌"
        },
        trigger: { source: "damageEnd" },
        forced: true,
        filter(event2, player2) {
          return player2.getStorage("gzxiongnve_effect1").includes(event2.player.identity) && event2.player.hasGainableCards(player2, "he");
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          await player2.gainPlayerCard({
            target: trigger.player,
            forced: true,
            position: "he"
          });
        }
      },
      effect2: {
        promptx: "使用牌没有次数限制",
        charlotte: true,
        onremove: true,
        intro: {
          content: "对$势力的角色使用牌没有次数限制"
        },
        mod: {
          cardUsableTarget(card, player2, target) {
            if (player2.getStorage("gzxiongnve_effect2").includes(target.identity)) {
              return true;
            }
          }
        }
      },
      effect3: {
        charlotte: true,
        audio: "zyxiongnve",
        mark: true,
        intro: {
          content: "其他角色对你造成伤害时，此伤害-1"
        },
        trigger: { player: "damageBegin3" },
        filter(event2, player2) {
          return event2.source && event2.source !== player2;
        },
        forced: true,
        logTarget: "source",
        async content(event2, trigger, player2) {
          trigger.num--;
        },
        ai: {
          effect: {
            target(card, player2, target) {
              if (target !== player2) {
                if (player2.hasSkillTag("jueqing", false, target)) {
                  return;
                }
                const num = get.tag(card, "damage");
                if (num) {
                  if (num > 1) {
                    return 0.5;
                  }
                  return 0;
                }
              }
            }
          }
        }
      },
      end: {
        trigger: { player: "phaseUseEnd" },
        direct: true,
        filter(event2, player2) {
          return player2.getStorage("gzshilu").length > 1;
        },
        async content(event2, trigger, player2) {
          const result2 = await player2.chooseButton({
            createDialog: ["是否移去两张“戮”获得减伤？", [player2.storage.gzshilu, "character"]],
            selectButton: 2,
            ai: (button) => {
              const name = button.link;
              let group = get.is.double(name, true);
              if (!group) {
                group = [lib.character[name][1]];
              }
              for (const i of group) {
                if (game.hasPlayer((current) => {
                  return current.identity === i;
                })) {
                  return 0;
                }
              }
              return 1;
            }
          }).forResult();
          if (!result2.bool) {
            return;
          }
          player2.logSkill("gzxiongnve");
          lib.skill.gzxiongnve.throwCharacter(player2, result2.links);
          player2.addTempSkill("gzxiongnve_effect3", { player: "phaseBegin" });
          await game.delayx();
        }
      }
    }
  },
  //邓芝
  gzjianliang: {
    audio: 2,
    trigger: { player: "phaseDrawBegin2" },
    frequent: true,
    preHidden: true,
    filter(event2, player2) {
      return player2.isMinHandcard();
    },
    logTarget(event2, player2) {
      if (player2.identity === "unknown") {
        let group = "shu";
        if (!player2.wontYe("shu")) {
          group = null;
        }
        return game.filterPlayer((current) => current === player2 || current.identity === group);
      }
      return game.filterPlayer((target) => target.isFriendOf(player2));
    },
    async content(event2, trigger, player2) {
      const list = game.filterPlayer((current) => current.isFriendOf(player2));
      if (list.length === 1) {
        await list[0].draw();
        return;
      }
      await game.asyncDraw(list);
      await game.delayx();
    }
  },
  gzweimeng: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    filterTarget(card, player2, target) {
      return target !== player2 && target.hasGainableCards(player2, "h");
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      const gainResult = await player2.gainPlayerCard({
        target,
        position: "h",
        forced: true,
        selectButton: event2.name === "gzweimeng" ? [1, player2.hp] : 1
      }).forResult();
      if (gainResult.bool && target.isIn()) {
        const num = gainResult.cards.length;
        const cards2 = player2.getCards("he");
        if (cards2.length) {
          let giveCards = cards2;
          if (cards2.length > num) {
            const result2 = await player2.chooseCard({
              position: "he",
              forced: true,
              prompt: `选择交给${get.translation(target)}${get.cnNumber(num)}张牌`,
              selectCard: num
            }).forResult();
            giveCards = result2.cards;
          }
          await player2.give(giveCards, target);
        }
      }
      if (target.isIn() && event2.name === "gzweimeng") {
        const result2 = await player2.chooseBool({
          prompt: `纵横：是否令${get.translation(target)}获得【危盟】？`,
          ai: () => {
            const evt = _status.event.getParent();
            return get.attitude(evt.player, evt.target) > 0;
          }
        }).forResult();
        if (result2.bool) {
          target.addTempSkill("gzweimeng_zongheng", { player: "phaseEnd" });
          game.log(player2, "发起了", "#y纵横", "，令", target, "获得了技能", "#g【危盟】");
        }
      }
    },
    derivation: "gzweimeng_zongheng",
    subSkill: {
      zongheng: {
        inherit: "gzweimeng",
        ai: {
          order: 6,
          tag: {
            lose: 1,
            loseCard: 1,
            gain: 1
          },
          result: {
            target: -1
          }
        }
      }
    },
    ai: {
      order: 6,
      tag: {
        lose: 1,
        loseCard: 1,
        gain: 1
      },
      result: {
        target(player2, target) {
          return -Math.pow(Math.min(player2.hp, target.countCards("h")), 2) / 4;
        }
      }
    }
  },
  //邹氏
  huoshui: {
    audio: 2,
    forced: true,
    global: "huoshui_mingzhi",
    trigger: { player: "useCardToTargeted" },
    preHidden: true,
    filter(event2, player2) {
      return (event2.card.name === "sha" || event2.card.name === "wanjian") && event2.target.isUnseen(2) && event2.target.isEnemyOf(player2);
    },
    logTarget: "target",
    async content(event2, trigger, player2) {
      const target = trigger.target;
      target.addTempSkill("huoshui_norespond");
      target.markAuto("huoshui_norespond", [trigger.card]);
    }
  },
  huoshui_norespond: {
    charlotte: true,
    trigger: { global: "useCardEnd" },
    onremove: true,
    forced: true,
    popup: false,
    silent: true,
    firstDo: true,
    filter(event2, player2) {
      return player2.getStorage("huoshui_norespond").includes(event2.card);
    },
    async content(event2, trigger, player2) {
      player2.unmarkAuto("huoshui_norespond", [trigger.card]);
      if (!player2.storage.huoshui_norespond.length) {
        player2.removeSkill("huoshui_norespond");
      }
    },
    mod: {
      cardEnabled(card) {
        if (card.name === "shan") {
          return false;
        }
      },
      cardRespondable(card) {
        if (card.name === "shan") {
          return false;
        }
      }
    }
  },
  huoshui_mingzhi: {
    ai: {
      nomingzhi: true,
      skillTagFilter(player2) {
        if (_status.currentPhase && _status.currentPhase !== player2 && _status.currentPhase.hasSkill("huoshui")) {
          return true;
        }
        return false;
      }
    }
  },
  qingcheng: {
    audio: 2
  },
  qingcheng_ai: {
    ai: {
      effect: {
        target(card) {
          if (get.tag(card, "damage")) {
            return 2;
          }
        }
      }
    }
  },
  //朱灵
  gzjuejue: {
    audio: 2,
    trigger: { player: "phaseDiscardBegin" },
    check(event2, player2) {
      return player2.hp > 2 && player2.needsToDiscard() > 0 && game.countPlayer((current) => {
        return get.attitude(current, player2) <= 0;
      }) > game.countPlayer() / 2;
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      player2.addTempSkill("gzjuejue_effect");
      await player2.loseHp();
    },
    subSkill: {
      effect: {
        trigger: { player: "phaseDiscardAfter" },
        forced: true,
        charlotte: true,
        popup: false,
        filter(event2, player2) {
          return player2.getHistory("lose", (evt) => evt.type === "discard" && evt.cards2 && evt.cards2.length > 0 && evt.getParent("phaseDiscard") === event2).length > 0;
        },
        async content(event2, trigger, player2) {
          event2.num = 0;
          for (const evt of player2.getHistory("lose")) {
            if (evt.type === "discard" && evt.getParent("phaseDiscard") === trigger) {
              event2.num += evt.cards2.length;
            }
          }
          event2.targets = game.filterPlayer((current) => current !== player2).sortBySeat();
          player2.line(event2.targets, "green");
          while (event2.targets.length) {
            const target = event2.targets.shift();
            event2.target = target;
            if (!target.isIn()) {
              continue;
            }
            target.addTempClass("target");
            const result2 = await target.chooseCard({
              position: "h",
              selectCard: event2.num,
              prompt: `将${get.cnNumber(event2.num)}张牌置入弃牌堆，或受到1点伤害`,
              ai: (card) => {
                const evt = _status.event.getParent();
                if (get.damageEffect(evt.target, evt.player, evt.target) >= 0) {
                  return 0;
                }
                return 8 / Math.sqrt(evt.num) + evt.target.getDamagedHp() - get.value(card);
              }
            }).forResult();
            if (result2.bool) {
              const lose = target.lose({
                cards: result2.cards,
                position: ui.discardPile,
                visible: true
              });
              target.$throw(result2.cards, 1e3);
              game.log(target, "将", result2.cards, "置入了弃牌堆");
              await lose;
            } else {
              await target.damage();
            }
            await game.delayx();
          }
        }
      }
    },
    ai: {
      noDieAfter2: true,
      skillTagFilter(player2, tag, target) {
        return target.isFriendOf(player2);
      }
    }
  },
  gzfangyuan: {
    audio: 2,
    trigger: { player: "phaseJieshuBegin" },
    zhenfa: "siege",
    locked: false,
    filter(event2, player2) {
      return game.countPlayer() >= 4 && game.hasPlayer((current) => {
        return player2.sieged(current) && player2.canUse("sha", current, false);
      });
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      const list = game.filterPlayer((current) => {
        return player2.sieged(current) && player2.canUse("sha", current, false);
      });
      const forced = player2.hasSkill("gzfangyuan");
      if (forced) {
        if (list.length === 1) {
          event2.result = { bool: true, targets: list };
          return;
        }
      }
      const next = player2.chooseTarget({
        selectTarget: 1,
        prompt: forced ? "方圆：视为对一名围攻你的角色使用【杀】" : get.prompt("gzfangyuan"),
        prompt2: forced ? void 0 : "视为对一名围攻你的角色使用【杀】",
        forced,
        filterTarget: (_card, _player, target) => _status.event.list.includes(target),
        ai: (target) => {
          const player3 = _status.event.player;
          return get.effect(target, { name: "sha", isCard: true }, player3, player3);
        }
      });
      next.set("list", list);
      if (forced) {
        next.setHiddenSkill("gzfangyuan");
      }
      event2.result = await next.forResult();
    },
    async content(event2, trigger, player2) {
      await player2.useCard({
        card: { name: "sha", isCard: true },
        targets: event2.targets,
        skill: "gzfangyuan",
        addCount: false
      });
    },
    global: "gzfangyuan_siege",
    subSkill: {
      siege: {
        mod: {
          maxHandcard(player2, num) {
            const next = player2.getNext();
            const prev = player2.getPrevious();
            const siege = [];
            if (player2.siege(next)) {
              siege.push(next.getNext());
            }
            if (player2.siege(prev)) {
              siege.push(prev.getPrevious());
            }
            if (siege.length) {
              siege.push(player2);
              num += siege.filter((source) => {
                return source.hasSkill("gzfangyuan");
              }).length;
            }
            if (player2.sieged()) {
              if (next.hasSkill("gzfangyuan")) {
                num--;
              }
              if (prev.hasSkill("gzfangyuan")) {
                num--;
              }
            }
            return num;
          }
        }
      }
    }
  },
  //彭羕
  daming: {
    audio: 2,
    trigger: { global: "phaseUseBegin" },
    preHidden: true,
    filter(event2, player2) {
      if (!player2.isFriendOf(event2.player) || !game.hasPlayer((current) => {
        return !current.isLinked();
      })) {
        return false;
      }
      if (_status.connectMode && player2.hasSkill("daming")) {
        return player2.hasCards("h");
      }
      return player2.hasCards("h", (card) => {
        return get.type2(card, player2) === "trick";
      });
    },
    async cost(event2, trigger, player2) {
      const turnPlayer = trigger.player;
      const goon = get.recoverEffect(turnPlayer, player2, player2) > 0 || game.hasPlayer((current) => {
        const card = { name: "sha", nature: "thunder", isCard: true };
        return current !== player2 && current !== turnPlayer && turnPlayer.canUse(card, current, false) && get.effect(current, card, turnPlayer, player2) > 0;
      });
      event2.result = await player2.chooseCardTarget({
        prompt: get.prompt(event2.skill),
        prompt2: "弃置一张锦囊牌并选择要横置的角色",
        filterCard(card, player3) {
          return get.type2(card, player3) === "trick" && lib.filter.cardDiscardable(card, player3, "daming");
        },
        filterTarget(card, player3, target) {
          return !target.isLinked();
        },
        ai1(card) {
          if (_status.event.goon) {
            return 7 - get.value(card);
          }
          return 0;
        },
        ai2(target) {
          const player3 = _status.event.player;
          return (target.identity !== "unknown" && !game.hasPlayer((current) => {
            return current !== target && current.isFriendOf(target) && current.isLinked();
          }) ? 3 : 1) * (-get.attitude(target, player3, player3) + 1);
        }
      }).set("goon", goon).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      await player2.discard({ cards: event2.cards });
      if (!target.isLinked()) {
        await target.link();
      }
      let map = {};
      const sides = [];
      const playerMap = _status.connectMode ? lib.playerOL : game.playerMap;
      for (const current of game.players) {
        if (current.identity === "unknown") {
          continue;
        }
        let added = false;
        for (const side of sides) {
          if (current.isFriendOf(playerMap[side])) {
            added = true;
            map[side].push(current);
            break;
          }
        }
        if (!added) {
          map[current.playerid] = [current];
          sides.push(current.playerid);
        }
      }
      let num = 0;
      for (const side in map) {
        if (map[side].some((current) => current.isLinked())) {
          num++;
        }
      }
      if (num > 0) {
        await player2.draw(num);
      }
      const turnPlayer = trigger.player;
      if (!turnPlayer.isIn()) {
        return;
      }
      const sha = game.filterPlayer((current) => current !== turnPlayer && current !== player2 && turnPlayer.canUse({ name: "sha", nature: "thunder", isCard: true }, current, false));
      let shaTarget;
      if (sha.length) {
        const result2 = await player2.chooseTarget({
          prompt: `请选择${get.translation(turnPlayer)}使用雷【杀】的目标`,
          prompt2: "或点「取消」令其回复1点体力",
          filterTarget: (card, player3, target2) => _status.event.list.includes(target2),
          ai: (target2) => {
            const player3 = _status.event.player;
            return get.effect(target2, { name: "sha", nature: "thunder", isCard: true }, _status.event.getTrigger().player, player3) - _status.event.goon;
          }
        }).set("goon", get.recoverEffect(turnPlayer, player2, player2)).set("list", sha).forResult();
        if (result2.bool) {
          shaTarget = result2.targets[0];
        }
      } else if (!turnPlayer.isDamaged()) {
        return;
      }
      if (shaTarget) {
        if (player2 === turnPlayer) {
          player2.line(shaTarget);
        } else {
          player2.line2([turnPlayer, shaTarget]);
          await game.delay(0.5);
        }
        let use = turnPlayer.useCard({ card: { name: "sha", nature: "thunder", isCard: true }, targets: [shaTarget], addCount: false });
        use.animate = false;
        await use;
      } else {
        player2.line(turnPlayer);
        await turnPlayer.recover();
      }
    }
  },
  xiaoni: {
    audio: 2,
    trigger: {
      player: "useCard",
      target: "useCardToTargeted"
    },
    forced: true,
    filter(event2, player2) {
      const type2 = get.type2(event2.card);
      if (type2 !== "basic" && type2 !== "trick") {
        return false;
      }
      const list = game.filterPlayer((current) => {
        return current !== player2 && current.isFriendOf(player2);
      });
      if (!list.length) {
        return false;
      }
      const hs = player2.countCards("h");
      for (const i of list) {
        if (i.countCards("h") > hs) {
          return false;
        }
      }
      return true;
    },
    check: () => false,
    preHidden: true,
    async content(event2, trigger, player2) {
      if (trigger.name === "useCard") {
        trigger.directHit.addArray(game.players);
      } else {
        trigger.directHit.add(player2);
      }
    },
    global: "xiaoni_ai",
    ai: {
      halfneg: true,
      directHit_ai: true,
      skillTagFilter(player2, tag, arg) {
        if (tag === "halfneg") {
          return true;
        }
        if (!arg?.card) {
          return false;
        }
        const type2 = get.type2(arg.card);
        if (type2 !== "basic" && type2 !== "trick") {
          return false;
        }
        const list = game.filterPlayer((current) => {
          return current !== player2 && current.isFriendOf(player2);
        });
        if (!list.length) {
          return false;
        }
        const cards2 = [arg.card];
        if (arg.card.cards) {
          cards2.addArray(arg.card.cards);
        }
        cards2.addArray(ui.selected.cards);
        const hhs = (card) => {
          return !cards2.includes(card);
        };
        const hs = player2.countCards("h", hhs);
        for (const i of list) {
          if (i.countCards("h", hhs) > hs) {
            return false;
          }
        }
        return true;
      }
    },
    subSkill: {
      ai: {
        ai: {
          directHit_ai: true,
          skillTagFilter(playerx, tag, arg) {
            if (!arg?.card) {
              return false;
            }
            const type2 = get.type2(arg.card);
            if (type2 !== "basic" && type2 !== "trick") {
              return false;
            }
            let player2;
            if (arg.target && arg.target.hasSkill("xiaoni")) {
              player2 = arg.target;
            } else {
              return false;
            }
            const list = game.filterPlayer((current) => {
              return current !== player2 && current.isFriendOf(player2);
            });
            if (!list.length) {
              return false;
            }
            const cards2 = [arg.card];
            if (arg.card.cards) {
              cards2.addArray(arg.card.cards);
            }
            cards2.addArray(ui.selected.cards);
            const hhs = (card) => {
              return !cards2.includes(card);
            };
            const hs = player2.countCards("h", hhs);
            for (const i of list) {
              if (i.countCards("h", hhs) > hs) {
                return false;
              }
            }
            return true;
          }
        }
      }
    }
  },
  //刘巴
  gztongduo: {
    audio: 2,
    trigger: { global: "phaseJieshuBegin" },
    preHidden: true,
    filter(event2, player2) {
      if (player2 !== event2.player && !player2.hasSkill("gztongduo") || !event2.player.isFriendOf(player2)) {
        return false;
      }
      return event2.player.getHistory("lose", (evt) => {
        return evt.type === "discard" && evt.cards2.length > 0 && evt.getParent("phaseDiscard").player === event2.player;
      }).length > 0;
    },
    async cost(event2, trigger, player2) {
      let num = 0;
      trigger.player.getHistory("lose", (evt) => {
        if (evt.type === "discard" && evt.getParent("phaseDiscard").player === trigger.player) {
          num += evt.cards2.length;
        }
      });
      num = Math.min(3, num);
      const next = trigger.player.chooseBool({ prompt: `是否发动【统度】摸${get.cnNumber(num)}张牌？` });
      if (player2 === trigger.player) {
        next.setHiddenSkill("gztongduo");
      }
      const result2 = await next.forResult();
      event2.result = { bool: result2.bool, targets: [trigger.player], cost_data: num };
    },
    async content(event2, trigger, player2) {
      await event2.targets[0].draw(event2.cost_data);
    }
  },
  qingyin: {
    audio: 2,
    enable: "phaseUse",
    limited: true,
    delay: false,
    filter(event2, player2) {
      let isFriend;
      if (player2.identity === "unknown") {
        let group = "shu";
        if (!player2.wontYe("shu")) {
          group = null;
        }
        isFriend = (current) => current === player2 || current.identity === group;
      } else {
        isFriend = (target) => target.isFriendOf(player2);
      }
      return game.hasPlayer((current) => {
        return isFriend(current) && current.isDamaged();
      });
    },
    selectTarget: -1,
    filterTarget(card, player2, target) {
      if (player2 === target) {
        return true;
      }
      if (player2.identity === "unknown") {
        if (!player2.wontYe("shu")) {
          return false;
        }
        return target.identity === "shu";
      }
      return target.isFriendOf(player2);
    },
    selectCard: [0, 1],
    filterCard: () => false,
    multitarget: true,
    multiline: true,
    skillAnimation: true,
    animationColor: "orange",
    async content(event2, trigger, player2) {
      player2.awakenSkill("qingyin");
      for (const target of event2.targets) {
        if (target.isDamaged()) {
          await target.recover(target.maxHp - target.hp);
        }
      }
      const charactersToRemove = [];
      if (lib.character[player2.name1][3].includes("qingyin")) {
        charactersToRemove.push(0);
      }
      if (lib.character[player2.name2][3].includes("qingyin")) {
        charactersToRemove.push(1);
      }
      for (const index of charactersToRemove) {
        await player2.removeCharacter(index);
      }
    },
    ai: {
      order(item, player2) {
        let isFriend;
        if (player2.identity === "unknown") {
          let group = "shu";
          if (!player2.wontYe("shu")) {
            group = null;
          }
          isFriend = (current) => current === player2 || current.identity === group;
        } else {
          isFriend = (target) => target.isFriendOf(player2);
        }
        const targets = game.filterPlayer((current) => {
          return isFriend(current);
        });
        let num = 0;
        let max = 0;
        for (const target of targets) {
          const damage = target.maxHp - target.hp;
          num += damage;
          max += target.maxHp;
        }
        return num / max >= 1 / Math.max(1.6, game.roundNumber) ? 1 : -1;
      },
      result: {
        player: 1
      }
    }
  },
  //苏飞
  gzlianpian: {
    audio: 2,
    trigger: { global: "phaseJieshuBegin" },
    direct: true,
    preHidden: true,
    filter(event2, player2) {
      if (player2 !== event2.player && !player2.hasSkill("gzlianpian")) {
        return false;
      }
      let num = 0;
      game.getGlobalHistory("cardMove", (evt) => {
        if (evt.name === "lose" && evt.type === "discard" && evt.getParent(2).player === event2.player) {
          num += evt.cards2.length;
        }
      });
      if (num <= player2.hp) {
        return false;
      }
      if (player2 === event2.player) {
        return game.hasPlayer((current) => {
          return current.isFriendOf(player2) && current.countCards("h") < current.maxHp;
        });
      }
      return player2.hasDiscardableCards(event2.player, "he") || player2.isDamaged();
    },
    async content(event2, trigger, player2) {
      if (player2 === trigger.player) {
        const result2 = await player2.chooseTarget({
          prompt: get.prompt("gzlianpian"),
          prompt2: "令一名己方角色将手牌摸至手牌上限",
          filterTarget: (card, player3, target) => {
            return target.isFriendOf(player3) && target.maxHp > target.countCards("h");
          },
          ai: (target) => {
            let att = get.attitude(_status.event.player, target);
            if (target.hasSkillTag("nogain")) {
              att /= 6;
            }
            if (att > 2) {
              return Math.min(5, target.maxHp) - target.countCards("h");
            }
            return att / 3;
          }
        }).setHiddenSkill(event2.name).forResult();
        if (result2.bool) {
          const [target] = result2.targets;
          player2.logSkill("gzlianpian", target);
          await target.draw(Math.min(5, target.maxHp - target.countCards("h")));
        }
      } else {
        let addIndex = 0;
        const list = [];
        const target = trigger.player;
        const str = get.translation(player2);
        event2.target = target;
        if (player2.hasDiscardableCards(target, "he")) {
          list.push(`弃置${str}的一张牌`);
        } else {
          addIndex++;
        }
        event2.addIndex = addIndex;
        if (player2.isDamaged()) {
          list.push(`令${str}回复1点体力`);
        }
        const result2 = await target.chooseControl({
          controls: ["cancel2"],
          choiceList: list,
          ai: () => {
            const evt = _status.event.getParent();
            if (get.attitude(evt.target, evt.player) > 0) {
              return 1 - evt.addIndex;
            }
            return evt.addIndex;
          },
          prompt: `是否对${str}发动【连翩】？`
        }).forResult();
        if (result2.control === "cancel2") {
          return;
        }
        player2.logSkill("gzlianpian", target, false);
        target.line(player2, "green");
        if (result2.index + addIndex === 0) {
          await target.discardPlayerCard({ position: "he", target: player2, forced: true });
        } else {
          await player2.recover();
        }
        await game.delayx();
      }
    }
  },
  //冯熙
  gzyusui: {
    audio: "yusui",
    trigger: { target: "useCardToTargeted" },
    filter(event2, player2) {
      return event2.player !== player2 && event2.player.isIn() && event2.player.isEnemyOf(player2) && get.color(event2.card) === "black";
    },
    logTarget: "player",
    check(event2, player2) {
      const target = event2.player;
      if (player2.hp < 3 || get.attitude(player2, target) > -3) {
        return false;
      }
      if (player2.hp < target.hp) {
        return true;
      }
      if (Math.min(target.maxHp, target.countCards("h")) > 3) {
        return true;
      }
      return false;
    },
    usable: 1,
    preHidden: true,
    async content(event2, trigger, player2) {
      const target = trigger.player;
      const loseHpEvent = player2.loseHp();
      event2.target = target;
      await loseHpEvent;
      if (!player2.isAlive()) {
        return;
      }
      let addIndex = 0;
      const list = [];
      if (target.maxHp > 0 && target.hasCards("h")) {
        list.push(`令其弃置${get.cnNumber(target.maxHp)}张手牌`);
      } else {
        addIndex++;
      }
      if (target.hp > player2.hp) {
        list.push(`令其失去${get.cnNumber(target.hp - player2.hp)}点体力`);
      }
      if (!list.length) {
        return;
      }
      let result2;
      if (list.length === 1) {
        result2 = { index: 0 };
      } else {
        result2 = await player2.chooseControl({
          choiceList: list,
          prompt: `令${get.translation(target)}执行一项`,
          ai: () => {
            const player3 = _status.event.player;
            const target2 = _status.event.getParent().target;
            return target2.hp - player3.hp > Math.min(target2.maxHp, target2.countCards("h")) / 2 ? 1 : 0;
          }
        }).forResult();
      }
      if (result2.index + addIndex === 0) {
        await target.chooseToDiscard({
          selectCard: target.maxHp,
          forced: true,
          position: "h"
        });
      } else {
        await target.loseHp(target.hp - player2.hp);
      }
    }
  },
  gzboyan: {
    audio: "boyan",
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return game.hasPlayer((target) => lib.skill.gzboyan.filterTarget(null, player2, target));
    },
    filterTarget(card, player2, target) {
      return target !== player2 && target.countCards("h") < target.maxHp;
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      await target.draw(Math.min(5, target.maxHp - target.countCards("h")));
      target.addTempSkill("gzboyan_block");
      if (!target.isIn()) {
        return;
      }
      const result2 = await player2.chooseBool({
        prompt: `纵横：是否令${get.translation(target)}获得【驳言】？`,
        ai: () => {
          const evt = _status.event.getParent();
          return get.attitude(evt.player, evt.target) > 0;
        }
      }).forResult();
      if (result2.bool) {
        target.addTempSkill("gzboyan_zongheng", { player: "phaseEnd" });
        game.log(player2, "发起了", "#y纵横", "，令", target, "获得了技能", "#g【驳言】");
      }
    },
    derivation: "gzboyan_zongheng",
    subSkill: {
      zongheng: {
        enable: "phaseUse",
        usable: 1,
        filterTarget: lib.filter.notMe,
        async content(event2, trigger, player2) {
          const { target } = event2;
          target.addTempSkill("gzboyan_block");
        },
        ai: {
          order: 4,
          result: {
            target(player2, target) {
              if (target.hasCards("h", "shan") && !target.hasSkillTag("respondShan", true, null, true) && player2.hasCards("h", (card) => {
                return get.tag(card, "respondShan") && get.effect(target, card, player2, player2) > 0 && player2.getUseValue(card) > 0;
              })) {
                return -target.countCards("h");
              }
              return -0.5;
            }
          }
        }
      },
      block: {
        mark: true,
        intro: { content: "不能使用或打出手牌" },
        charlotte: true,
        mod: {
          cardEnabled2(card) {
            if (get.position(card) === "h") {
              return false;
            }
          }
        }
      }
    },
    ai: {
      order: (item, player2) => {
        if (game.hasPlayer((cur) => {
          if (player2 === cur || get.attitude(player2, cur) <= 0) {
            return false;
          }
          return Math.min(5, cur.maxHp) - cur.countCards("h") > 2;
        })) {
          return get.order({ name: "nanman" }, player2) - 0.1;
        }
        return 10;
      },
      result: {
        target(player2, target) {
          if (get.attitude(player2, target) > 0) {
            return Math.min(5, target.maxHp - target.countCards("h"));
          }
          if (target.maxHp - target.countCards("h") === 1 && target.hasCards("h", "shan") && !target.hasSkillTag("respondShan", true, null, true) && player2.hasCards("h", (card) => {
            return get.tag(card, "respondShan") && get.effect(target, card, player2, player2) > 0 && player2.getUseValue(card, null, true) > 0;
          })) {
            return -2;
          }
        }
      }
    }
  },
  //文钦
  gzjinfa: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return player2.hasCards("he") && game.hasPlayer((current) => {
        return current !== player2 && current.hasCards("he");
      });
    },
    filterCard: true,
    position: "he",
    filterTarget(card, player2, target) {
      return target !== player2 && target.hasCards("he");
    },
    check(card) {
      return 6 - get.value(card);
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      const result2 = await target.chooseCard({
        position: "he",
        prompt: `交给${get.translation(player2)}一张装备牌，或令其获得你的一张牌`,
        filterCard: { type: "equip" },
        ai: (card) => {
          if (_status.event.goon && get.suit(card) === "spade") {
            return 8 - get.value(card);
          }
          return 5 - get.value(card);
        }
      }).set("goon", target.canUse("sha", player2, false) && get.effect(player2, { name: "sha" }, target, target) > 0).forResult();
      if (!result2.bool) {
        await player2.gainPlayerCard({
          target,
          position: "he",
          forced: true
        });
        return;
      }
      await target.give(result2.cards, player2);
      if (result2.cards && result2.cards.length && target.isIn() && player2.isIn() && get.suit(result2.cards[0], target) === "spade" && target.canUse("sha", player2, false)) {
        await target.useCard({
          card: { name: "sha", isCard: true },
          targets: [player2],
          addCount: false
        });
      }
    },
    ai: {
      order: 6,
      result: {
        player(player2, target) {
          if (target.hasCards("e", (card) => get.suit(card) === "spade" && get.value(card) < 8) && target.canUse("sha", player2, false)) {
            return get.effect(player2, { name: "sha" }, target, player2);
          }
          return 0;
        },
        target(player2, target) {
          const es = target.getCards("e").sort((a, b) => {
            return get.value(b, target) - get.value(a, target);
          });
          if (es.length) {
            return -Math.min(2, get.value(es[0]));
          }
          return -2;
        }
      }
    }
  },
  //诸葛恪
  gzduwu: {
    limited: true,
    audio: 2,
    enable: "phaseUse",
    delay: false,
    filter(event2, player2) {
      let isEnemy;
      if (player2.identity === "unknown") {
        if (!player2.wontYe("wu")) {
          isEnemy = (current) => {
            return current !== player2;
          };
        } else {
          isEnemy = (current) => {
            return current !== player2 && current.identity !== "wu";
          };
        }
      } else {
        isEnemy = (target) => {
          return target.isEnemyOf(player2);
        };
      }
      return game.hasPlayer((current) => {
        return isEnemy(current) && player2.inRange(current);
      });
    },
    filterTarget(card, player2, target) {
      if (player2 === target || !player2.inRange(target)) {
        return false;
      }
      if (player2.identity === "unknown") {
        if (!player2.wontYe("wu")) {
          return true;
        }
        return target.identity !== "wu";
      }
      return target.isEnemyOf(player2);
    },
    selectTarget: -1,
    filterCard: () => false,
    selectCard: [0, 1],
    multitarget: true,
    multiline: true,
    async content(event2, trigger, player2) {
      player2.awakenSkill("gzduwu");
      player2.addSkill("gzduwu_count");
      event2.targets.sortBySeat();
      const players = event2.targets.slice();
      await game.delayx();
      const { junling, targets } = await player2.chooseJunlingFor(players[0]).set("prompt", "为所有目标角色选择军令牌").forResult();
      event2.junling = junling;
      event2.targets = targets;
      for (const current of players) {
        event2.current = current;
        if (current.isAlive()) {
          const result2 = await current.chooseJunlingControl(player2, junling, targets).set("prompt", "黩武").set("choiceList", ["执行该军令", "不执行该军令并受到1点伤害"]).set("ai", () => {
            const evt = _status.event.getParent(2);
            const junlingEff = get.junlingEffect(evt.player, evt.junling, evt.current, evt.targets, evt.current);
            const damageEff = get.damageEffect(evt.current, evt.player, evt.current);
            const attitudeSelf = get.attitude(evt.current, evt.current);
            const drawEff = get.effect(evt.player, { name: "draw" }, evt.player, evt.current);
            return junlingEff > damageEff / attitudeSelf + drawEff ? 0 : 1;
          }).forResult();
          if (result2.index === 0) {
            await current.carryOutJunling(player2, junling, targets);
          } else {
            await player2.draw();
            await current.damage();
          }
        }
        await game.delayx();
      }
      const list = player2.getStorage("gzduwu_count").filter((target) => target.isAlive());
      const next = list.length ? player2.loseHp() : null;
      player2.removeSkill("gzduwu_count");
      if (next) {
        await next;
      }
    },
    animationColor: "wood",
    ai: {
      order: 2,
      result: {
        player(player2) {
          if (game.countPlayer((current) => {
            return !current.isFriendOf(player2) && !player2.inRange(current);
          }) <= Math.min(2, Math.max(0, game.roundNumber - 1))) {
            return 1;
          }
          if (player2.hp === 1) {
            return 1;
          }
          return 0;
        }
      }
    },
    subSkill: {
      count: {
        sub: true,
        trigger: { global: "dyingBegin" },
        silent: true,
        charlotte: true,
        filter(event2, player2) {
          return event2.getParent("gzduwu").player === player2;
        },
        async content(event2, trigger, player2) {
          player2.markAuto("gzduwu_count", [trigger.player]);
        }
      }
    }
  },
  //黄祖
  gzxishe: {
    audio: 2,
    trigger: { global: "phaseZhunbeiBegin" },
    direct: true,
    preHidden: true,
    filter(event2, player2) {
      return event2.player !== player2 && event2.player.isIn() && player2.hasCards("e") && player2.canUse("sha", event2.player, false);
    },
    async content(event2, trigger, player2) {
      while (true) {
        const result2 = await player2.chooseCard({
          position: "e",
          prompt: get.prompt("gzxishe", trigger.player),
          prompt2: `将装备区内的一张牌当做${player2.hp > trigger.player.hp ? "不可响应的" : ""}【杀】对其使用`,
          filterCard: (card, player3) => player3.canUse(
            {
              name: "sha",
              cards: [card]
            },
            _status.event.target,
            false
          ),
          ai: (card) => {
            const evt = _status.event;
            const eff = get.effect(
              evt.target,
              {
                name: "sha",
                cards: [card]
              },
              evt.player,
              evt.player
            );
            if (eff <= 0) {
              return 0;
            }
            const val = get.value(card);
            if (get.attitude(evt.player, evt.target) < -2 && evt.target.hp <= Math.min(2, evt.player.countCards("e"), evt.player.hp - 1)) {
              return 2 / Math.max(1, val);
            }
            return eff - val;
          }
        }).set("target", trigger.player).setHiddenSkill(event2.name).forResult();
        if (!result2.bool) {
          return;
        }
        let next = player2.useCard({ card: { name: "sha" }, cards: result2.cards, skill: "gzxishe", targets: [trigger.player], addCount: false });
        if (player2.hp > trigger.player.hp) {
          next.oncard = () => {
            _status.event.directHit.add(trigger.player);
          };
        }
        await next;
        if (trigger.player.isDead()) {
          player2.mayChangeVice(null, "hidden");
          return;
        }
        if (!lib.skill.gzxishe.filter(trigger, player2)) {
          return;
        }
      }
    },
    ai: {
      directHit_ai: true,
      skillTagFilter(player2, tag, arg) {
        if (_status.event.getParent().name === "gzxishe" && arg.card && arg.card.name === "sha" && arg.target && arg.target === _status.event.target && player2.hp > arg.target.hp) {
          return true;
        }
        return false;
      }
    }
  },
  //公孙渊
  gzhuaiyi: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    delay: false,
    filter(event2, player2) {
      return player2.hasCards("h");
    },
    async content(event2, trigger, player2) {
      await player2.showHandcards();
      let control;
      if (!player2.hasCards("h", { color: "red" })) {
        control = "黑色";
      } else if (!player2.hasCards("h", { color: "black" })) {
        control = "红色";
      } else {
        const result3 = await player2.chooseControl({
          controls: ["红色", "黑色"],
          ai: () => {
            const player3 = _status.event.player;
            const num2 = player3.maxHp - player3.getExpansions("gzhuaiyi").length;
            if (player3.countCards("h", { color: "red" }) <= num2 && player3.countCards("h", { color: "black" }) > num2) {
              return "红色";
            }
            return "黑色";
          }
        }).forResult();
        control = result3.control;
      }
      const cards2 = player2.getCards("h", { color: control === "红色" ? "red" : "black" });
      await player2.discard({ cards: cards2 });
      const num = cards2.length;
      const result2 = await player2.chooseTarget({
        prompt: `请选择至多${get.cnNumber(num)}名有牌的其他角色，获得这些角色的各一张牌。`,
        selectTarget: [1, num],
        filterTarget: (card, player3, target) => target !== player3 && target.hasCards("he"),
        ai: (target) => -get.attitude(_status.event.player, target) + 0.5
      }).forResult();
      if (!result2.bool || !result2.targets) {
        return;
      }
      player2.line(result2.targets, "green");
      const targets = result2.targets.sort(lib.sort.seat);
      if (!player2.isAlive() || !targets.length) {
        return;
      }
      while (player2.isAlive() && targets.length) {
        const result3 = await player2.gainPlayerCard({ target: targets.shift(), position: "he", forced: true }).forResult();
        if (result3.bool && result3.cards && result3.cards.length) {
          cards2.addArray(result3.cards);
        }
      }
      if (targets.length) {
        return;
      }
      const handcards = player2.getCards("h");
      const expansionCards = cards2.filter((card) => get.type(card) === "equip" && handcards.includes(card));
      if (expansionCards.length) {
        await player2.addToExpansion({ cards: expansionCards, source: player2, animate: "give", gaintag: ["gzhuaiyi"] });
      }
    },
    ai: {
      order: 10,
      result: {
        player(player2, target) {
          const num = player2.maxHp - player2.getExpansions("gzhuaiyi").length;
          if (player2.countCards("h", { color: "red" }) <= num) {
            return 1;
          }
          if (player2.countCards("h", { color: "black" }) <= num) {
            return 1;
          }
          return 0;
        }
      }
    },
    marktext: "异",
    intro: { content: "expansion", markcount: "expansion" },
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    }
  },
  gzzisui: {
    audio: 2,
    trigger: { player: "phaseDrawBegin2" },
    forced: true,
    filter(event2, player2) {
      return !event2.numFixed && player2.getExpansions("gzhuaiyi").length > 0;
    },
    async content(event2, trigger, player2) {
      trigger.num += player2.getExpansions("gzhuaiyi").length;
    },
    group: "gzzisui_die",
    subSkill: {
      die: {
        audio: "gzzisui",
        trigger: { player: "phaseJieshuBegin" },
        forced: true,
        filter(event2, player2) {
          return player2.getExpansions("gzhuaiyi").length > player2.maxHp;
        },
        async content(event2, trigger, player2) {
          await player2.die();
        }
      }
    }
  },
  //潘濬
  gzcongcha: {
    audio: 2,
    trigger: { player: "phaseZhunbeiBegin" },
    filter(event2, player2) {
      return game.hasPlayer((current) => current !== player2 && current.isUnseen());
    },
    preHidden: "gzcongcha_draw",
    prompt2: "选择一名武将牌均暗置的其他角色",
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2(event2.skill),
        filterTarget: (_card, player3, target) => target !== player3 && target.isUnseen(),
        ai: (target) => {
          if (get.attitude(_status.event.player, target) > 0) {
            return Math.random() + Math.sqrt(target.hp);
          }
          return Math.random() + Math.sqrt(Math.max(1, 4 - target.hp));
        }
      }).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      player2.storage.gzcongcha2 = target;
      player2.addTempSkill("gzcongcha2", { player: "phaseBegin" });
      target.addSkill("gzcongcha_ai");
      await game.delayx();
    },
    subfrequent: ["draw"],
    group: "gzcongcha_draw",
    subSkill: {
      draw: {
        audio: "gzcongcha",
        trigger: { player: "phaseDrawBegin2" },
        frequent: true,
        filter(event2, player2) {
          return !event2.numFixed && !game.hasPlayer((current) => current.isUnseen());
        },
        prompt: "是否发动【聪察】多摸两张牌？",
        async content(event2, trigger, player2) {
          trigger.num += 2;
        }
      }
    }
  },
  gzcongcha_ai: {
    charlotte: true,
    ai: {
      mingzhi_yes: true,
      mingzhi_no: true,
      skillTagFilter(player2, tag) {
        if (_status.brawl) {
          return false;
        }
        const group = lib.character[player2.name1][1];
        if (tag === "mingzhi_yes") {
          if (group !== "ye" && player2.wontYe(group) && game.hasPlayer((current) => current.storage.gzcongcha2 === player2 && current.identity === group)) {
            return true;
          }
          return false;
        }
        if (group === "ye" && !player2.wontYe(group)) {
          return true;
        }
        return game.hasPlayer((current) => current.storage.gzcongcha2 === player2 && current.identity !== group);
      }
    }
  },
  gzcongcha2: {
    trigger: { global: "showCharacterAfter" },
    forced: true,
    charlotte: true,
    onremove: true,
    filter(event2, player2) {
      return event2.player === player2.storage.gzcongcha2;
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      player2.removeSkill("gzcongcha2");
      trigger.player.removeSkill("gzcongcha_ai");
      if (player2.isFriendOf(trigger.player)) {
        await game.asyncDraw([player2, trigger.player].sortBySeat(_status.currentPhase), 2);
      } else {
        await trigger.player.loseHp();
      }
      await game.delayx();
    },
    mark: "character",
    intro: { content: "已指定$为目标" }
  },
  //司马昭
  gzzhaoxin: {
    audio: 2,
    trigger: { player: "damageEnd" },
    filter(event2, player2) {
      return player2.hasCards("h");
    },
    check: () => false,
    preHidden: true,
    async content(event2, trigger, player2) {
      await player2.showHandcards();
      const handcardCount = player2.countCards("h");
      if (!game.hasPlayer((current) => current !== player2 && current.countCards("h") <= handcardCount)) {
        return;
      }
      const result2 = await player2.chooseTarget({
        forced: true,
        prompt: "请选择要交换手牌的目标角色",
        filterTarget: (_card, player3, target2) => target2 !== player3 && target2.countCards("h") <= player3.countCards("h")
      }).forResult();
      if (!result2.bool) {
        return;
      }
      const target = result2.targets[0];
      player2.line(target, "green");
      await player2.swapHandcards(target);
    }
  },
  gzsuzhi: {
    audio: 2,
    derivation: "gzfankui",
    mod: {
      targetInRange(card, player2, target) {
        if (player2 === _status.currentPhase && player2.countMark("gzsuzhi_count") < 3 && get.type2(card) === "trick") {
          return true;
        }
      }
    },
    trigger: { player: "phaseJieshuBegin" },
    forced: true,
    filter(event2, player2) {
      return player2.countMark("gzsuzhi_count") < 3;
    },
    async content(event2, trigger, player2) {
      await player2.addTempSkills("gzfankui", { player: "phaseBegin" });
    },
    group: ["gzsuzhi_damage", "gzsuzhi_draw", "gzsuzhi_gain"],
    preHidden: ["gzsuzhi_damage", "gzsuzhi_draw", "gzsuzhi_gain"],
    subSkill: {
      damage: {
        audio: "gzsuzhi",
        trigger: { source: "damageBegin1" },
        forced: true,
        filter(event2, player2) {
          return player2 === _status.currentPhase && player2.countMark("gzsuzhi_count") < 3 && event2.card && (event2.card.name === "sha" || event2.card.name === "juedou") && event2.getParent().type === "card";
        },
        async content(event2, trigger, player2) {
          trigger.num++;
          player2.addTempSkill("gzsuzhi_count");
          player2.addMark("gzsuzhi_count", 1, false);
        }
      },
      draw: {
        audio: "gzsuzhi",
        trigger: { player: "useCard" },
        forced: true,
        filter(event2, player2) {
          return player2 === _status.currentPhase && player2.countMark("gzsuzhi_count") < 3 && event2.card.isCard && get.type2(event2.card) === "trick";
        },
        async content(event2, trigger, player2) {
          const draw = player2.draw();
          player2.addTempSkill("gzsuzhi_count");
          player2.addMark("gzsuzhi_count", 1, false);
          await draw;
        }
      },
      gain: {
        audio: "gzsuzhi",
        trigger: { global: "loseAfter" },
        forced: true,
        filter(event2, player2) {
          if (player2 !== _status.currentPhase || event2.type !== "discard" || player2 === event2.player || player2.countMark("gzsuzhi_count") >= 3) {
            return false;
          }
          return event2.player.hasGainableCards(player2, "he");
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          player2.addTempSkill("gzsuzhi_count");
          player2.addMark("gzsuzhi_count", 1, false);
          if (trigger.delay === false) {
            await game.delay();
          }
          await player2.gainPlayerCard({
            target: trigger.player,
            position: "he",
            forced: true
          });
        }
      },
      count: {
        onremove: true
      }
    }
  },
  gzfankui: {
    audio: 2,
    inherit: "fankui"
  },
  //夏侯霸
  gzbaolie: {
    audio: 2,
    mod: {
      targetInRange(card, player2, target) {
        if (card.name === "sha" && target.hp >= player2.hp) {
          return true;
        }
      },
      cardUsableTarget(card, player2, target) {
        if (card.name === "sha" && target.hp >= player2.hp) {
          return true;
        }
      }
    },
    trigger: { player: "phaseUseBegin" },
    forced: true,
    preHidden: true,
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        return current.isEnemyOf(player2) && player2.inRangeOf(current);
      });
    },
    logTarget(event2, player2) {
      return game.filterPlayer((current) => {
        return current.isEnemyOf(player2) && player2.inRangeOf(current);
      });
    },
    check: () => false,
    async content(event2, trigger, player2) {
      event2.targets = game.filterPlayer((current) => {
        return current.isEnemyOf(player2) && player2.inRangeOf(current);
      }).sortBySeat();
      while (event2.targets.length) {
        const target = event2.targets.shift();
        if (!target.isIn()) {
          continue;
        }
        event2.target = target;
        const result2 = await target.chooseToUse({
          filterCard: function(card, player3, event3) {
            if (get.name(card) !== "sha") {
              return false;
            }
            return lib.filter.filterCard.apply(this, arguments);
          },
          prompt: `豹烈：对${get.translation(player2)}使用一张杀，或令其弃置你的一张牌`,
          complexTarget: true,
          filterTarget: function(card, player3, target2) {
            if (target2 !== _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) {
              return false;
            }
            return lib.filter.filterTarget.apply(this, arguments);
          }
        }).set("targetRequired", true).set("complexSelect", true).set("sourcex", player2).forResult();
        if (result2.bool === false && target.hasCards("he")) {
          await player2.discardPlayerCard({
            target,
            position: "he",
            forced: true
          });
        }
      }
    }
  },
  //许攸
  gzchenglve: {
    audio: 2,
    trigger: { global: "useCardAfter" },
    filter(event2, player2) {
      return event2.targets.length > 1 && event2.player.isIn() && event2.player.isFriendOf(player2);
    },
    logTarget: "player",
    check(event2, player2) {
      return get.attitude(player2, event2.player) > 0;
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      const draw = trigger.player.draw();
      if (!player2.hasHistory("damage", (evt) => evt.card === trigger.card) || !game.hasPlayer(canGainMark)) {
        await draw;
        return;
      }
      const choice = player2.chooseTarget({
        prompt: "是否令一名武将牌均明置过的己方角色获得“阴阳鱼”标记？",
        filterTarget(_card, _player, current) {
          return canGainMark2(current);
          function canGainMark2(current2) {
            if (current2.hasMark("yinyang_mark") || !current2.isFriendOf(player2)) {
              return false;
            }
            const shownNames = new Set(game.getAllGlobalHistory("everything", (evt) => evt.name === "showCharacter" && evt.player === current2).flatMap((evt) => evt.toShow));
            return get.nameList(current2).filter((name) => !name.startsWith("gz_shibing")).every((name) => shownNames.has(name));
          }
        },
        ai: (target2) => get.attitude(_status.event.player, target2) * Math.sqrt(1 + target2.needsToDiscard())
      });
      await draw;
      const result2 = await choice.forResult();
      if (!result2.bool) {
        return;
      }
      const target = result2.targets[0];
      player2.line(target, "green");
      target.addMark("yinyang_mark", 1, false);
      await game.delayx();
      function canGainMark(current) {
        if (current.hasMark("yinyang_mark") || !current.isFriendOf(player2)) {
          return false;
        }
        const shownNames = new Set(game.getAllGlobalHistory("everything", (evt) => evt.name === "showCharacter" && evt.player === current).flatMap((evt) => evt.toShow));
        return get.nameList(current).filter((name) => !name.startsWith("gz_shibing")).every((name) => shownNames.has(name));
      }
    }
  },
  gzshicai: {
    audio: 2,
    trigger: { player: "damageEnd" },
    forced: true,
    preHidden: true,
    filter(event2, player2) {
      return event2.num === 1 || player2.hasCards("he");
    },
    check(event2, player2) {
      return event2.num === 1;
    },
    async content(event2, trigger, player2) {
      if (trigger.num === 1) {
        await player2.draw();
      } else {
        await player2.chooseToDiscard({ forced: true, position: "he", selectCard: 2 });
      }
    }
  },
  gzzhuhai: {
    audio: "zhuhai",
    audioname: ["gz_re_xushu"],
    trigger: { global: "phaseJieshuBegin" },
    direct: true,
    preHidden: true,
    filter(event2, player2) {
      return event2.player.isAlive() && event2.player.getStat("damage") && lib.filter.targetEnabled({ name: "sha" }, player2, event2.player) && (player2.hasSha() || _status.connectMode && player2.hasCards("h"));
    },
    async content(event2, trigger, player2) {
      let next = player2.chooseToUse({
        filterCard: function(card, player3, event3) {
          if (get.name(card) !== "sha") {
            return false;
          }
          return lib.filter.filterCard.apply(this, arguments);
        },
        prompt: `诛害：是否对${get.translation(trigger.player)}使用一张杀？`,
        filterTarget: function(card, player3, target) {
          if (target !== _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) {
            return false;
          }
          return lib.filter.targetEnabled.apply(this, arguments);
        }
      }).set("logSkill", "gzzhuhai").set("complexSelect", true).set("sourcex", trigger.player).setHiddenSkill(event2.name);
      player2.addTempSkill("gzzhuhai2");
      next.oncard = (card, player3) => {
        try {
          if (trigger.player.getHistory("sourceDamage", (evt) => {
            return evt.player.isFriendOf(player3);
          }).length) {
            player3.addTempSkill("gzzhuhai2");
            card.gzzhuhai_tag = true;
          }
        } catch (e) {
          alert("发生了一个导致【诛害】无法正常触发无视防具效果的错误。请关闭十周年UI/手杀UI等扩展以解决");
        }
      };
      await next;
    },
    ai: {
      unequip_ai: true,
      skillTagFilter(player2, tag, arg) {
        const evt = _status.event.getParent();
        if (evt.name !== "gzzhuhai" || !arg || !arg.target) {
          return false;
        }
        if (!arg.target.getHistory("sourceDamage", (evt2) => {
          return evt2.player.isFriendOf(player2);
        }).length) {
          return false;
        }
        return true;
      }
    }
  },
  gzzhuhai2: {
    trigger: { player: "shaMiss" },
    forced: true,
    popup: false,
    filter(event2, player2) {
      return event2.card.gzzhuhai_tag === true && event2.target.hasCards("he");
    },
    async content(event2, trigger, player2) {
      player2.line(trigger.target);
      await trigger.target.chooseToDiscard({ position: "he", forced: true });
    },
    ai: {
      unequip: true,
      skillTagFilter(player2, tag, arg) {
        if (!arg || !arg.card || !arg.card.gzzhuhai_tag) {
          return false;
        }
      }
    }
  },
  quanjin: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    onChooseToUse(event2) {
      if (!game.online) {
        event2.set(
          "quanjin_list",
          game.filterPlayer((i) => i !== event2.player && i.getHistory("damage").length)
        );
      }
    },
    filter(event2, player2) {
      return event2.quanjin_list && event2.quanjin_list.length > 0 && player2.hasCards("h");
    },
    filterCard: true,
    filterTarget(card, player2, target) {
      return _status.event.quanjin_list.includes(target);
    },
    discard: false,
    lose: false,
    delay: false,
    check(card) {
      const evt = _status.event;
      if (evt.quanjin_list.some((target) => {
        return get.attitude(evt.player, target) > 0;
      })) {
        return 8 - get.value(card);
      }
      return 6.5 - get.value(card);
    },
    async content(event2, trigger, player2) {
      const { target, cards: cards2 } = event2;
      await player2.give(cards2, target);
      const junlingResult = await player2.chooseJunlingFor(target).forResult();
      event2.junling = junlingResult.junling;
      event2.targets = junlingResult.targets;
      const result2 = await target.chooseJunlingControl(player2, event2.junling, event2.targets).set("prompt", "劝进").set("choiceList", [`执行该军令，然后${get.translation(player2)}摸一张牌`, "不执行该军令，然后其将手牌摸至与全场最多相同"]).set("ai", () => {
        const evt = _status.event.getParent(2);
        const player3 = evt.target;
        const source = evt.player;
        const { junling, targets } = evt;
        let num2 = 0;
        game.countPlayer((current) => {
          const num22 = current.countCards("h");
          if (num22 > num2) {
            num2 = num22;
          }
        });
        num2 = Math.max(0, num2 - source.countCards("h"));
        if (num2 > 1) {
          if (get.attitude(player3, target) > 0) {
            return get.junlingEffect(source, junling, player3, targets, player3) > num2;
          }
          return get.junlingEffect(source, junling, player3, targets, player3) > -num2;
        }
        if (get.attitude(player3, target) > 0) {
          return get.junlingEffect(source, junling, player3, targets, player3) > 0;
        }
        return get.junlingEffect(source, junling, player3, targets, player3) > 1;
      }).forResult();
      if (result2.index === 0) {
        await target.carryOutJunling(player2, event2.junling, event2.targets);
        await player2.draw();
        return;
      }
      let num = 0;
      game.countPlayer((current) => {
        const num2 = current.countCards("h");
        if (num2 > num) {
          num = num2;
        }
      });
      num -= player2.countCards("h");
      if (num > 0) {
        await player2.draw(Math.min(num, 5));
      }
    },
    ai: {
      order: 1,
      result: {
        player(player2, target) {
          if (get.attitude(player2, target) > 0) {
            return 3.3;
          }
          let num = 0;
          game.countPlayer((current) => {
            let num2 = current.countCards("h");
            if (player2 === current) {
              num2--;
            }
            if (target === current) {
              num2++;
            }
            if (num2 > num) {
              num = num2;
            }
          });
          num = Math.max(0, num - player2.countCards("h"));
          if (!num) {
            return 0;
          }
          if (num > 1) {
            return 2;
          }
          if (ui.selected.cards.length && get.value(ui.selected.cards[0]) > 5) {
            return 0;
          }
          return 1;
        }
      }
    }
  },
  zaoyun: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      const num = player2.countCards("h");
      return game.hasPlayer((current) => {
        if (current.isEnemyOf(player2)) {
          const dist = get.distance(player2, current);
          return dist > 1 && dist <= num;
        }
      });
    },
    selectCard() {
      const list = [];
      const player2 = _status.event.player;
      if (ui.selected.targets.length) {
        return get.distance(player2, ui.selected.targets[0]) - 1;
      }
      game.countPlayer((current) => {
        if (current.isEnemyOf(player2)) {
          const dist = get.distance(player2, current);
          if (dist > 1) {
            list.push(dist - 1);
          }
        }
      });
      list.sort();
      return [list[0], list[list.length - 1]];
    },
    filterCard: true,
    filterTarget(card, player2, target) {
      return target.isEnemyOf(player2) && get.distance(player2, target) === ui.selected.cards.length + 1;
    },
    check(card) {
      const player2 = _status.event.player;
      if (ui.selected.cards.length && game.hasPlayer((current) => {
        return current.isEnemyOf(player2) && get.distance(player2, current) === ui.selected.cards.length + 1 && get.damageEffect(current, player2, player2) > 0;
      })) {
        return 0;
      }
      return 7 - ui.selected.cards.length * 2 - get.value(card);
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      const next = target.damage({ nocard: true });
      if (!player2.storage.zaoyun2) {
        player2.storage.zaoyun2 = [];
      }
      player2.storage.zaoyun2.push(target);
      player2.addTempSkill("zaoyun2");
      await next;
    },
    ai: {
      order: 5,
      result: {
        target(player2, target) {
          return get.damageEffect(target, player2, target);
        }
      }
    }
  },
  zaoyun2: {
    onremove: true,
    charlotte: true,
    mod: {
      globalFrom(player2, target) {
        if (player2.getStorage("zaoyun2").includes(target)) {
          return -Infinity;
        }
      }
    }
  },
  gzzhidao: {
    audio: 2,
    trigger: { player: "phaseUseBegin" },
    forced: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      const result2 = await player2.chooseTarget({
        prompt: "请选择【雉盗】的目标",
        prompt2: "本回合内只能对自己和该角色使用牌，且第一次对其造成伤害时摸一张牌",
        filterTarget: lib.filter.notMe,
        forced: true,
        ai: (target2) => {
          const currentPlayer = _status.event.player;
          return (1 - get.sgn(get.attitude(currentPlayer, target2))) * Math.max(1, get.distance(currentPlayer, target2));
        }
      }).forResult();
      if (!result2.bool) {
        return;
      }
      const target = result2.targets[0];
      player2.line(target, "green");
      game.log(player2, "选择了", target);
      player2.storage.gzzhidao2 = target;
      player2.addTempSkill("gzzhidao2");
    }
  },
  gzzhidao2: {
    mod: {
      playerEnabled(card, player2, target) {
        if (target !== player2 && target !== player2.storage.gzzhidao2) {
          return false;
        }
      },
      globalFrom(from, to) {
        if (to === from.storage.gzzhidao2) {
          return -Infinity;
        }
      }
    },
    audio: "gzzhidao",
    trigger: { source: "damageSource" },
    forced: true,
    charlotte: true,
    filter(event2, player2) {
      return event2.player === player2.storage.gzzhidao2 && player2.getHistory("sourceDamage", (evt) => {
        return evt.player === event2.player;
      }).indexOf(event2) === 0 && event2.player.hasGainableCards(player2, "hej");
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      await player2.gainPlayerCard({
        target: trigger.player,
        position: "hej",
        forced: true
      });
    }
  },
  gzyjili: {
    audio: 2,
    forced: true,
    preHidden: ["gzyjili_remove"],
    trigger: { target: "useCardToTargeted" },
    filter(event2, player2) {
      if (get.color(event2.card) !== "red" || event2.targets.length !== 1) {
        return false;
      }
      const type2 = get.type(event2.card);
      return type2 === "basic" || type2 === "trick";
    },
    check() {
      return false;
    },
    async content(event2, trigger, player2) {
      player2.addTempSkill("gzyjili2");
      let evt = trigger.getParent();
      if (!evt.gzyjili) {
        evt.gzyjili = [];
      }
      evt.gzyjili.add(player2);
    },
    group: "gzyjili_remove",
    subSkill: {
      remove: {
        audio: "gzyjili",
        trigger: { player: "damageBegin2" },
        forced: true,
        filter(event2, player2) {
          let evt = false;
          for (const i of lib.phaseName) {
            evt = event2.getParent(i);
            if (evt && evt.player) {
              break;
            }
          }
          return evt && evt.player && player2.getHistory("damage", (evtx) => {
            return evtx.getParent(evt.name) === evt;
          }).length === 1;
        },
        async content(event2, trigger, player2) {
          trigger.cancel();
          await player2.removeCharacter(get.character(player2.name1, 3).includes("gzyjili") ? 0 : 1);
        }
      }
    }
  },
  gzyjili2: {
    trigger: { global: "useCardAfter" },
    charlotte: true,
    popup: false,
    forced: true,
    filter(event2, player2) {
      return event2.gzyjili && event2.gzyjili.includes(player2) && !event2.addedTarget && event2.player && event2.player.isAlive() && event2.player.canUse(
        {
          name: event2.card.name,
          nature: event2.card.nature,
          isCard: true
        },
        player2
      );
    },
    async content(event2, trigger, player2) {
      await trigger.player.useCard({
        card: {
          name: trigger.card.name,
          nature: trigger.card.nature,
          isCard: true
        },
        targets: [player2],
        addCount: false
      });
    }
  },
  donggui: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        return lib.skill.donggui.filterTarget(null, player2, current);
      });
    },
    filterTarget(card, player2, target) {
      return target !== player2 && !target.isUnseen(2) && player2.canUse("diaohulishan", target);
    },
    async content(event2, trigger, player2) {
      const target = event2.target;
      const result2 = await player2.chooseButton({
        createDialog: [`暗置${get.translation(target)}的一张武将牌`, [[target.name1, target.name2], "character"]],
        forced: true,
        filterButton: (button) => !get.is.jun(button.link)
      }).forResult();
      const target1 = target.getNext();
      const target2 = target.getPrevious();
      const shouldDraw = !(target1 === target2 || target.inline(target1) || target.inline(target2) || target1.inline(target2));
      target.hideCharacter(result2.links[0] === target.name1 ? 0 : 1);
      target.addTempSkill("donggui2");
      await player2.useCard({ card: { name: "diaohulishan", isCard: true }, targets: [target] });
      if (shouldDraw && target1.inline(target2)) {
        await player2.draw(
          game.countPlayer((current) => {
            return current.inline(target1);
          })
        );
      }
    },
    ai: {
      order: 2,
      result: {
        player(player2, target) {
          const target1 = target.getNext();
          const target2 = target.getPrevious();
          if (target1 === target2 || target.inline(target1) || target.inline(target2) || target1.inline(target2) || !target1.isFriendOf(target2)) {
            return 0;
          }
          const num = game.countPlayer((current) => {
            return current !== target1 && current !== target2 && (current.inline(target1) || current.inline(target2));
          });
          return 2 + num;
        }
      }
    }
  },
  donggui2: { ai: { nomingzhi: true } },
  fengyang: {
    audio: 2,
    zhenfa: "inline",
    trigger: { player: "phaseJieshuBegin" },
    filter(event2, player2) {
      const bool = player2.hasSkill("fengyang");
      return game.hasPlayer((current) => {
        return current !== player2 && current.inline(player2);
      }) && game.hasPlayer((current) => {
        return (current === player2 || bool) && current.inline(player2) && current.hasCards("e");
      });
    },
    direct: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      const list = game.filterPlayer((current) => {
        return current.inline(player2);
      }).sortBySeat();
      for (const target of list) {
        if (target !== player2 && !player2.hasSkill("fengyang")) {
          continue;
        }
        if (!target.hasCards("e")) {
          continue;
        }
        event2.target = target;
        let next = target.chooseToDiscard({
          selectCard: 1,
          position: "e",
          prompt: get.prompt("fengyang"),
          prompt2: "弃置装备区内的一张牌并摸两张牌",
          ai: (card) => 5.5 - get.value(card)
        });
        next.logSkill = "fengyang";
        if (player2 === target) {
          next.setHiddenSkill("fengyang");
        }
        const result2 = await next.forResult();
        if (result2.bool) {
          await target.draw(2);
        }
      }
    }
  },
  fengyang_old: {
    audio: "fengyang",
    zhenfa: "inline",
    global: "fengyang_old_nogain",
    subSkill: {
      nogain: {
        mod: {
          canBeDiscarded(card, player2, target) {
            if (get.position(card) === "e" && player2.identity !== target.identity && game.hasPlayer((current) => {
              return current.hasSkill("fengyang_old") && (current === target || target.inline(current));
            })) {
              return false;
            }
          },
          canBeGained(card, player2, target) {
            if (get.position(card) === "e" && player2.identity !== target.identity && game.hasPlayer((current) => {
              return current.hasSkill("fengyang_old") && (current === target || target.inline(current));
            })) {
              return false;
            }
          }
        }
      }
    }
  },
  gzrekuangcai: {
    audio: "gzkuangcai",
    forced: true,
    preHidden: true,
    trigger: { player: "phaseDiscardBegin" },
    filter(event2, player2) {
      return !player2.getHistory("useCard").length || !player2.getHistory("sourceDamage").length;
    },
    check(event2, player2) {
      return !player2.getHistory("useCard").length;
    },
    async content(event2, trigger, player2) {
      lib.skill.rekuangcai.change(player2, player2.getHistory("useCard").length ? -1 : 1);
    },
    mod: {
      targetInRange(card, player2) {
        if (player2 === _status.currentPhase) {
          return true;
        }
      },
      cardUsable(card, player2) {
        if (player2 === _status.currentPhase) {
          return Infinity;
        }
      }
    }
  },
  gzkuangcai: {
    audio: 2,
    trigger: { player: "useCard1" },
    forced: true,
    firstDo: true,
    noHidden: true,
    preHidden: ["gzkuangcai_discard"],
    filter(event2, player2) {
      return player2 === _status.currentPhase && get.type(event2.card) === "trick";
    },
    async content(event2, trigger, player2) {
      trigger.nowuxie = true;
    },
    mod: {
      targetInRange(card, player2) {
        if (player2 === _status.currentPhase) {
          return true;
        }
      },
      cardUsable(card, player2) {
        if (player2 === _status.currentPhase) {
          return Infinity;
        }
      }
    },
    ai: {
      unequip: true,
      skillTagFilter(player2) {
        return player2 === _status.currentPhase;
      }
    },
    group: "gzkuangcai_discard",
    subSkill: {
      discard: {
        audio: "gzkuangcai",
        trigger: { player: "phaseDiscardBegin" },
        forced: true,
        filter(event2, player2) {
          const use = player2.getHistory("useCard").length;
          const damage = player2.getStat("damage") || 0;
          if (use && !damage) {
            return true;
          }
          if (damage >= use) {
            return true;
          }
          return false;
        },
        check(event2, player2) {
          const use = player2.getHistory("useCard").length;
          const damage = player2.getStat("damage") || 0;
          if (use && !damage) {
            return false;
          }
          return true;
        },
        async content(event2, trigger, player2) {
          const use = player2.getHistory("useCard").length;
          const damage = player2.getStat("damage") || 0;
          if (use && !damage) {
            player2.addTempSkill("gzkuangcai_less");
          } else {
            const next = player2.drawTo(player2.maxHp);
            player2.addTempSkill("gzkuangcai_more");
            await next;
          }
        }
      },
      more: {
        mod: {
          maxHandcard(player2, num) {
            return num + 2;
          }
        },
        charlotte: true
      },
      less: {
        mod: {
          maxHandcard(player2, num) {
            return num - 2;
          }
        },
        charlotte: true
      }
    }
  },
  gzshejian: {
    audio: 2,
    preHidden: true,
    trigger: { target: "useCardToTargeted" },
    filter(event2, player2) {
      if (player2 === event2.player || event2.targets.length !== 1 || !event2.player.isIn()) {
        return false;
      }
      if (!event2.player.hasCards("he") && _status.event.dying) {
        return false;
      }
      const hs = player2.getCards("h");
      if (hs.length === 0) {
        return false;
      }
      return hs.every((i) => lib.filter.cardDiscardable(i, player2, "gzshejian"));
    },
    check(event2, player2) {
      const target = event2.player;
      if (get.damageEffect(target, player2, player2) <= 0) {
        return false;
      }
      if (target.hp <= (player2.hasSkill("gzcongjian") ? 2 : 1) && !target.getEquip("huxinjing") && !game.hasPlayer((current) => {
        return current !== target && !current.isFriendOf(player2);
      })) {
        return true;
      }
      if (player2.hasSkill("lirang") && player2.hasFriend()) {
        return true;
      }
      if ((event2.card.name === "guohe" || event2.card.name === "shunshou" || event2.card.name === "zhujinqiyuan") && player2.countCards("h") === 1) {
        return true;
      }
      if (player2.countCards("h") < 3 && !player2.hasCards("h", (card) => {
        return get.value(card, player2) > 5;
      })) {
        return true;
      }
      if (player2.hp <= event2.getParent().baseDamage) {
        if (get.tag(event2.card, "respondSha")) {
          if (!player2.hasCards("h", { name: "sha" })) {
            return true;
          }
        } else if (get.tag(event2.card, "respondShan")) {
          if (!player2.hasCards("h", { name: "shan" })) {
            return true;
          }
        } else if (get.tag(event2.card, "damage")) {
          if (event2.card.name === "shuiyanqijunx") {
            return !player2.hasCards("e");
          }
          return true;
        }
      }
      return false;
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      const hs = player2.getCards("h");
      const target = trigger.player;
      const { cards: cards2 } = await player2.modedDiscard(hs).forResult();
      if (!target?.isIn()) {
        return;
      }
      const choiceList = [`弃置${get.translation(target)}${get.cnNumber(cards2.length)}张牌`, `对${get.translation(target)}造成1点伤害`];
      const choice = [0, 1];
      if (_status.event.dying) {
        choice.remove(1);
      }
      if (!cards2?.length || target.countCards("he") < cards2.length) {
        choice.remove(0);
      }
      if (!choice.length) {
        return;
      }
      const result2 = choice.length > 1 ? await player2.chooseControl().set("choiceList", choiceList).set("ai", () => 1).forResult() : {
        index: choice[0]
      };
      if (result2.index === 0) {
        await player2.discardPlayerCard({ target, selectButton: cards2.length, forced: true, position: "he" });
      } else {
        await target.damage();
      }
    }
  },
  gzpozhen: {
    audio: 2,
    trigger: { global: "phaseBegin" },
    limited: true,
    preHidden: true,
    filter(event2, player2) {
      return player2 !== event2.player;
    },
    logTarget: "player",
    skillAnimation: true,
    animationColor: "orange",
    check(event2, player2) {
      const target = event2.player;
      if (get.attitude(player2, target) >= -3) {
        return false;
      }
      if (event2.player.hasJudge("lebu") && !game.hasPlayer((current) => get.attitude(current, target) > 0 && current.hasWuxie())) {
        return false;
      }
      const num = Math.min(
        target.getCardUsable("sha"),
        target.countCards("h", (card) => get.name(card, target) === "sha" && target.hasValueTarget(card))
      ) + target.countCards("h", (card) => get.name(card, target) !== "sha" && target.hasValueTarget(card));
      return num >= Math.max(2, target.hp);
    },
    async content(event2, trigger, player2) {
      player2.awakenSkill("gzpozhen");
      const target = trigger.player;
      target.addTempSkill("gzpozhen2");
      const list = game.filterPlayer((current) => {
        return current !== target && (current.inline(target) || current === target.getNext().getNext() && current.siege(target.getNext()) || current === target.getPrevious().getPrevious() && current.siege(target.getPrevious()));
      });
      if (!list.length) {
        return;
      }
      list.add(target);
      list.sortBySeat(target);
      for (const current of list) {
        if (!current.hasDiscardableCards(player2, "he")) {
          continue;
        }
        let discardEvent = player2.discardPlayerCard({ target: current, position: "he", forced: true });
        discardEvent.boolline = true;
        await discardEvent;
      }
    }
  },
  gzpozhen2: {
    mod: {
      cardEnabled2(card) {
        if (get.position(card) === "h") {
          return false;
        }
      },
      cardRecastable(card) {
        if (get.position(card) === "h") {
          return false;
        }
      }
    }
  },
  gzjiancai: {
    audio: 2,
    viceSkill: true,
    trigger: { global: "damageBegin4" },
    preHidden: true,
    init(player2, skill) {
      if (player2.checkViceSkill(skill) && !player2.viceChanged) {
        player2.removeMaxHp();
      }
    },
    filter(event2, player2) {
      return event2.player.isFriendOf(player2) && event2.num >= event2.player.hp;
    },
    check(event2, player2) {
      if (get.attitude(player2, event2.player) < 3) {
        return false;
      }
      if (event2.num >= 1 || player2.storage.gzpozhen) {
        return true;
      }
      if (player2.countCards("h", (card) => {
        const mod2 = game.checkMod(card, player2, "unchanged", "cardEnabled2", player2);
        if (mod2 !== "unchanged") {
          return mod2;
        }
        const mod = game.checkMod(card, player2, event2.player, "unchanged", "cardSavable", player2);
        if (mod !== "unchanged") {
          return mod;
        }
        let savable = get.info(card).savable;
        if (typeof savable === "function") {
          savable = savable(card, player2, event2.player);
        }
        return savable;
      }) >= 1 + event2.num - event2.player.hp) {
        return false;
      }
      return true;
    },
    logTarget: "player",
    skillAnimation: true,
    animationColor: "orange",
    async content(event2, trigger, player2) {
      trigger.cancel();
      await player2.changeVice();
    },
    group: "gzjiancai_add",
    subSkill: {
      add: {
        trigger: { global: "changeViceBegin" },
        logTarget: "player",
        forced: true,
        locked: false,
        prompt(event2, player2) {
          return `${get.translation(event2.player)}即将变更副将，是否发动【荐才】，令其此次变更副将时增加两张可选武将牌？`;
        },
        filter(event2, player2) {
          return event2.player.isFriendOf(player2);
        },
        async content(event2, trigger, player2) {
          trigger.num += 2;
        }
      }
    }
  },
  gzxingzhao: {
    audio: 2,
    getNum() {
      const list = [];
      const players = game.filterPlayer();
      for (const target of players) {
        if (target.isUnseen() || target.isHealthy()) {
          continue;
        }
        let add = true;
        for (const i of list) {
          if (i.isFriendOf(target)) {
            add = false;
            break;
          }
        }
        if (add) {
          list.add(target);
        }
      }
      return list.length;
    },
    mod: {
      maxHandcard(player2, num) {
        return num + (lib.skill.gzxingzhao.getNum() > 2 ? 4 : 0);
      }
    },
    group: ["gzxingzhao_xunxun", "gzxingzhao_use", "gzxingzhao_lose"],
    preHidden: ["gzxingzhao_xunxun", "gzxingzhao_use", "gzxingzhao_lose"],
    subfrequent: ["use"],
    subSkill: {
      xunxun: {
        audio: 2,
        name: "恂恂",
        description: "摸牌阶段，你可以观看牌堆顶的四张牌，然后将其中的两张牌置于牌堆顶，并将其余的牌以任意顺序置于牌堆底。",
        trigger: { player: "phaseDrawBegin1" },
        filter(event2, player2) {
          return lib.skill.gzxingzhao.getNum() > 0;
        },
        async content(event2, trigger, player2) {
          const cards2 = get.cards(4);
          const ordering = game.cardsGotoOrdering(cards2);
          const choice = player2.chooseToMove({
            prompt: "恂恂：将两张牌置于牌堆顶",
            forced: true,
            list: [["牌堆顶", cards2], ["牌堆底"]],
            processAI: (list) => {
              const cards3 = list[0][1].slice(0).sort((a, b) => get.value(b) - get.value(a));
              return [cards3, cards3.splice(2)];
            }
          });
          choice.set("filterMove", (from, to, moved) => {
            if (to === 1 && moved[1].length >= 2) {
              return false;
            }
            return true;
          });
          choice.set("filterOk", (moved) => moved[1].length === 2);
          await ordering;
          const result2 = await choice.forResult();
          const top = result2.moved[0];
          const bottom = result2.moved[1];
          top.reverse();
          const moveToPile = game.cardsGotoPile(top.concat(bottom), ["top_cards", top], (event3, card) => {
            if (event3.top_cards.includes(card)) {
              return ui.cardPile.firstChild;
            }
            return null;
          });
          game.updateRoundNumber();
          const delay = game.delayx();
          await moveToPile;
          await delay;
        }
      },
      use: {
        audio: "gzxingzhao",
        trigger: {
          player: ["useCard", "damageEnd"]
        },
        forced: true,
        filter(event2, player2) {
          return (event2.name === "damage" || get.type(event2.card) === "equip") && lib.skill.gzxingzhao.getNum() > 1 && !player2.isMaxHandcard();
        },
        frequent: true,
        async content(event2, trigger, player2) {
          await player2.draw();
        }
      },
      draw: {
        audio: "gzxingzhao",
        trigger: { player: "damageEnd" },
        forced: true,
        filter(event2, player2) {
          return lib.skill.gzxingzhao.getNum() > 1 && event2.source && event2.source.isAlive() && event2.source.countCards("h") !== player2.countCards("h");
        },
        logTarget(event2, player2) {
          const target = event2.source;
          return target.countCards("h") > player2.countCards("h") ? player2 : target;
        },
        check(event2, player2) {
          return get.attitude(player2, lib.skill.gzxingzhao_draw.logTarget(event2, player2)) > 0;
        },
        async content(event2, trigger, player2) {
          await lib.skill.gzxingzhao_draw.logTarget(trigger, player2).draw();
        }
      },
      skip: {
        audio: "gzxingzhao",
        trigger: { player: "phaseDiscardBefore" },
        forced: true,
        filter() {
          return lib.skill.gzxingzhao.getNum() > 2;
        },
        async content(event2, trigger, player2) {
          trigger.cancel();
          game.log(player2, "跳过了", "#y弃牌阶段");
        }
      },
      lose: {
        audio: "gzxingzhao",
        trigger: {
          player: "loseAfter",
          global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"]
        },
        filter(event2, player2) {
          const evt = event2.getl(player2);
          return evt && evt.player === player2 && evt.es && evt.es.length > 0 && lib.skill.gzxingzhao.getNum() > 3;
        },
        forced: true,
        async content(event2, trigger, player2) {
          await player2.draw();
        }
      }
    },
    ai: {
      threaten: 3,
      effect: {
        target_use(card, player2, target, current) {
          if (lib.skill.gzxingzhao.getNum() > 3 && get.type(card) === "equip" && !get.cardtag(card, "gifts")) {
            return [1, 2];
          }
        }
      },
      reverseEquip: true,
      skillTagFilter() {
        return lib.skill.gzxingzhao.getNum() > 3;
      }
    }
  },
  gzwenji: {
    audio: 2,
    trigger: { player: "phaseUseBegin" },
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        return current !== player2 && current.hasCards("he");
      });
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2(event2.skill),
        filterTarget: (card, player3, target) => target !== player3 && target.hasCards("he"),
        ai: (target) => {
          const att = get.attitude(_status.event.player, target);
          if (target.identity === "unknown" && att <= 0) {
            return 20;
          }
          if (att > 0) {
            return Math.sqrt(att) / 10;
          }
          return 5 - att;
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const cardResult = await target.chooseCard({ position: "he", forced: true, prompt: `问计：将一张牌交给${get.translation(player2)}` }).forResult();
      if (cardResult.bool) {
        const giveEvent = target.give(cardResult.cards, player2);
        giveEvent.gaintag.add("gzwenji");
        await giveEvent;
      }
      if (target.identity === "unknown" || target.isFriendOf(player2)) {
        player2.addTempSkill("gzwenji_respond");
        return;
      }
      if (!target.isIn() || !player2.hasCards("he", (card) => !card.hasGaintag("gzwenji"))) {
        return;
      }
      const result2 = await player2.chooseCard({
        position: "he",
        prompt: `交给${get.translation(target)}一张其他牌，或令其摸一张牌`,
        filterCard: (card) => !card.hasGaintag("gzwenji"),
        ai: (card) => 5 - get.value(card)
      }).forResult();
      if (result2.bool) {
        player2.give(result2.cards, target);
        player2.removeGaintag("gzwenji");
      } else {
        await target.draw();
      }
    },
    subSkill: {
      respond: {
        onremove(player2) {
          player2.removeGaintag("gzwenji");
        },
        mod: {
          targetInRange(card, player2, target) {
            if (!card.cards) {
              return;
            }
            for (const i of card.cards) {
              if (i.hasGaintag("gzwenji")) {
                return true;
              }
            }
          },
          cardUsable(card, player2, target) {
            if (!card.cards) {
              return;
            }
            for (const i of card.cards) {
              if (i.hasGaintag("gzwenji")) {
                return Infinity;
              }
            }
          }
        },
        trigger: { player: "useCard" },
        forced: true,
        charlotte: true,
        audio: "gzwenji",
        filter(event2, player2) {
          return player2.getHistory("lose", (evt) => {
            if ((evt.relatedEvent || evt.getParent()) !== event2) {
              return false;
            }
            for (const i in evt.gaintag_map) {
              if (evt.gaintag_map[i].includes("gzwenji")) {
                return true;
              }
            }
            return false;
          }).length > 0;
        },
        async content(event2, trigger, player2) {
          trigger.directHit.addArray(
            game.filterPlayer((current) => {
              return current !== player2;
            })
          );
          if (trigger.addCount !== false) {
            trigger.addCount = false;
            let stat = player2.getStat();
            if (stat && stat.card && stat.card[trigger.card.name]) {
              stat.card[trigger.card.name]--;
            }
          }
        },
        ai: {
          directHit_ai: true,
          skillTagFilter(player2, tag, arg) {
            return arg.card && arg.card.cards && arg.card.cards.filter((card) => card.hasGaintag("gzwenji")).length > 0;
          }
        }
      }
    }
  },
  gztunjiang: {
    audio: 2,
    trigger: { player: "phaseJieshuBegin" },
    frequent: true,
    preHidden: true,
    filter(event2, player2) {
      if (!player2.getHistory("useCard", (evt) => {
        return evt.isPhaseUsing();
      }).length) {
        return false;
      }
      return player2.getHistory("useCard", (evt) => {
        if (evt.targets && evt.targets.length && evt.isPhaseUsing()) {
          const targets = evt.targets.slice(0);
          while (targets.includes(player2)) {
            targets.remove(player2);
          }
          return targets.length > 0;
        }
        return false;
      }).length === 0;
    },
    async content(event2, trigger, player2) {
      await player2.draw(game.countGroup());
    }
  },
  gzbushi: {
    audio: 2,
    trigger: { player: "damageEnd" },
    frequent: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      let count = trigger.num;
      while (true) {
        count--;
        await player2.draw();
        if (count <= 0) {
          return;
        }
        const result2 = await player2.chooseBool({ prompt: get.prompt2("gzbushi") }).set("frequentSkill", "gzbushi").forResult();
        if (!result2.bool) {
          return;
        }
      }
    },
    group: "gzbushi_draw",
    subSkill: {
      draw: {
        trigger: { source: "damageSource" },
        direct: true,
        noHidden: true,
        filter(event2, player2) {
          return event2.player.isEnemyOf(player2) && event2.player.isIn();
        },
        async content(event2, trigger, player2) {
          const target = trigger.player;
          const result2 = await target.chooseBool({
            prompt: `是否对${get.translation(player2)}发动【布施】？`,
            prompt2: "你摸一张牌，然后其摸一张牌"
          }).forResult();
          if (!result2.bool) {
            return;
          }
          player2.logSkill("gzbushi", target);
          await game.asyncDraw([target, player2]);
          await game.delayx();
        }
      }
    }
  },
  gzbushi_old: {
    audio: 2,
    trigger: {
      player: "damageEnd",
      source: "damageSource"
    },
    forced: true,
    filter(event2, player2, name) {
      if (name === "damageSource" && player2 === event2.player) {
        return false;
      }
      return game.hasPlayer((current) => {
        return current.isFriendOf(event2.player);
      });
    },
    check(event2, player2) {
      return player2.isFriendOf(event2.player);
    },
    async content(event2, trigger, player2) {
      const target = trigger.player;
      let count = event2.triggername === "damageSource" ? 1 : trigger.num;
      while (true) {
        count--;
        const friends = game.filterPlayer((current) => current.isFriendOf(target));
        if (!friends.length) {
          return;
        }
        let chosenTarget;
        if (friends.length === 1) {
          chosenTarget = friends[0];
        } else {
          const result2 = await player2.chooseTarget({
            prompt: `布施：令一名与${player2 === target ? "你" : get.translation(target)}势力相同的角色摸一张牌`,
            forced: true,
            filterTarget: (_card, _player, current) => current.isFriendOf(target)
          }).forResult();
          if (!result2.bool) {
            return;
          }
          chosenTarget = result2.targets[0];
        }
        player2.line(chosenTarget, "green");
        await chosenTarget.draw();
        if (!count) {
          return;
        }
      }
    }
  },
  gzmidao: {
    audio: 2,
    trigger: { global: "useCardToPlayered" },
    direct: true,
    //noHidden:true,
    filter(event2, player2) {
      const target = event2.player;
      return event2.isFirstTarget && target.isFriendOf(player2) && target.isPhaseUsing() && (target === player2 || player2.hasSkill("gzmidao")) && ["basic", "trick"].includes(get.type(event2.card)) && get.tag(event2.card, "damage") > 0 && event2.cards && event2.cards.length && !target.hasSkill("gzmidao2");
    },
    preHidden: true,
    content: [
      (event2, trigger, player2) => {
        const next = trigger.player.chooseBool({
          prompt: `是否对${get.translation(player2)}发动【米道】？`,
          prompt2: `令该角色修改${get.translation(trigger.card)}的花色和伤害属性`,
          ai: () => false
        });
        if (player2 === next.player) {
          next.setHiddenSkill(event2.name);
        }
      },
      (event2, trigger, player2, result2) => {
        if (!result2.bool) {
          event2.finish();
          return;
        }
        player2.logSkill("gzmidao");
        trigger.player.addTempSkill("gzmidao2");
        if (player2 !== trigger.player) {
          trigger.player.line(player2, "green");
        }
      },
      (event2, trigger, player2) => {
        if (player2.isUnderControl()) {
          game.swapPlayerAuto(player2);
        }
        const switchToAuto = () => {
          _status.imchoosing = false;
          const listn = ["普通"].concat(lib.inpile_nature);
          event2._result = {
            bool: true,
            suit: lib.suit.randomGet(),
            nature: listn.randomGet()
          };
          if (event2.dialog) {
            event2.dialog.close();
          }
          if (event2.control) {
            event2.control.close();
          }
        };
        const chooseButton = (player3, card) => {
          let event3 = _status.event;
          player3 = player3 || event3.player;
          if (!event3._result) {
            event3._result = {};
          }
          const dialog = ui.create.dialog(`米道：请修改${card}的花色和属性`, "forcebutton", "hidden");
          event3.dialog = dialog;
          dialog.addText("花色");
          let table = document.createElement("div");
          table.classList.add("add-setting");
          table.style.margin = "0";
          table.style.width = "100%";
          table.style.position = "relative";
          const listi = ["spade", "heart", "club", "diamond"];
          for (const suit of listi) {
            let td = ui.create.div(".shadowed.reduce_radius.pointerdiv.tdnode");
            td.link = suit;
            table.appendChild(td);
            td.innerHTML = `<span>${get.translation(suit)}</span>`;
            td.addEventListener(lib.config.touchscreen ? "touchend" : "click", (clickEvent) => {
              if (_status.dragged) {
                return;
              }
              if (_status.justdragged) {
                return;
              }
              _status.tempNoButton = true;
              setTimeout(() => {
                _status.tempNoButton = false;
              }, 500);
              const node = clickEvent.currentTarget;
              const link = node.link;
              const current = node.parentNode.querySelector(".bluebg");
              if (current) {
                current.classList.remove("bluebg");
              }
              node.classList.add("bluebg");
              event3._result.suit = link;
            });
          }
          dialog.content.appendChild(table);
          dialog.addText("属性");
          let table2 = document.createElement("div");
          table2.classList.add("add-setting");
          table2.style.margin = "0";
          table2.style.width = "100%";
          table2.style.position = "relative";
          const listn = ["普通"].concat(lib.inpile_nature);
          for (const nature of listn) {
            let td = ui.create.div(".shadowed.reduce_radius.pointerdiv.tdnode");
            td.link = nature;
            table2.appendChild(td);
            td.innerHTML = `<span>${get.translation(nature)}</span>`;
            td.addEventListener(lib.config.touchscreen ? "touchend" : "click", (clickEvent) => {
              if (_status.dragged) {
                return;
              }
              if (_status.justdragged) {
                return;
              }
              _status.tempNoButton = true;
              setTimeout(() => {
                _status.tempNoButton = false;
              }, 500);
              const node = clickEvent.currentTarget;
              const link = node.link;
              const current = node.parentNode.querySelector(".bluebg");
              if (current) {
                current.classList.remove("bluebg");
              }
              node.classList.add("bluebg");
              event3._result.nature = link;
            });
          }
          dialog.content.appendChild(table2);
          dialog.add("　　");
          event3.dialog.open();
          event3.switchToAuto = () => {
            event3._result = {
              bool: true,
              nature: listn.randomGet(),
              suit: listi.randomGet()
            };
            event3.dialog.close();
            event3.control.close();
            game.resume();
            _status.imchoosing = false;
          };
          event3.control = ui.create.control("ok", "cancel2", (link) => {
            let result2 = event3._result;
            if (link === "cancel2") {
              result2.bool = false;
            } else {
              if (!result2.nature || !result2.suit) {
                return;
              }
              result2.bool = true;
            }
            event3.dialog.close();
            event3.control.close();
            game.resume();
            _status.imchoosing = false;
          });
          for (const button of event3.dialog.buttons) {
            button.classList.add("selectable");
          }
          game.pause();
          game.countChoose();
        };
        if (event2.isMine()) {
          chooseButton(player2, get.translation(trigger.card));
        } else if (event2.isOnline()) {
          event2.player.send(chooseButton, event2.player, get.translation(trigger.card));
          event2.player.wait();
          game.pause();
        } else {
          switchToAuto();
        }
      },
      (event2, trigger, player2, result2) => {
        const map = event2.result || result2;
        if (!map.bool) {
          return;
        }
        game.log(player2, "将", trigger.card, "的花色属性修改为了", `#g${get.translation(map.suit + 2)}`, `#y${get.translation(map.nature)}`);
        trigger.card.suit = map.suit;
        if (map.nature === "普通") {
          delete trigger.card.nature;
        } else {
          trigger.card.nature = map.nature;
        }
        trigger.player.storage.gzmidao2 = [trigger.card, map.nature];
        player2.popup(`${get.translation(map.suit + 2)}${get.translation(map.nature)}`, "thunder");
      }
    ]
  },
  gzmidao2: {
    charlotte: true,
    trigger: { global: "damageBefore" },
    forced: true,
    firstDo: true,
    popup: false,
    onremove: true,
    filter(event2, player2) {
      return player2.storage.gzmidao2 && event2.card === player2.storage.gzmidao2[0];
    },
    async content(event2, trigger, player2) {
      const nature = player2.storage.gzmidao2[1];
      if (nature === "普通") {
        delete trigger.nature;
      } else {
        trigger.nature = nature;
      }
    }
  },
  gzbiluan: {
    audio: 2,
    mod: {
      globalTo(from, to, distance) {
        return distance + to.countCards("e");
      }
    }
  },
  gzrelixia: {
    audio: "gzlixia",
    trigger: { global: "phaseZhunbeiBegin" },
    noHidden: true,
    forced: true,
    filter(event2, player2) {
      return player2 !== event2.player && !event2.player.isFriendOf(player2) && !player2.inRangeOf(event2.player);
    },
    logTarget: "player",
    async content(event2, trigger, player2) {
      const target = trigger.player;
      event2.target = target;
      if (!player2.hasDiscardableCards(target, "e")) {
        await player2.draw();
        return;
      }
      const str = get.translation(player2);
      const result2 = await target.chooseControl({
        prompt: `${str}发动了【礼下】，请选择一项`,
        choiceList: [`令${str}摸一张牌`, `弃置${str}装备区内的一张牌并失去1点体力`],
        ai: () => {
          const player3 = _status.event.player;
          const target2 = _status.event.getParent().player;
          if (player3.hp <= 1 || get.attitude(player3, target2) >= 0) {
            return 0;
          }
          if (target2.hasCards("e", (card) => get.value(card, target2) >= 7 - player3.hp)) {
            return 1;
          }
          const dist = get.distance(player3, target2, "attack");
          if (dist > 1 && dist - target2.countCards("e") <= 1) {
            return true;
          }
          return 0;
        }
      }).forResult();
      if (result2.index === 0) {
        await player2.draw();
        return;
      }
      const discard = target.discardPlayerCard({ target: player2, position: "e", forced: true });
      const loseHp = target.loseHp();
      await discard;
      await loseHp;
    }
  },
  gzlixia: {
    audio: 2,
    trigger: { global: "phaseZhunbeiBegin" },
    noHidden: true,
    filter(event2, player2) {
      return player2 !== event2.player && !event2.player.isFriendOf(player2) && player2.hasDiscardableCards(event2.player, "e");
    },
    async cost(event2, trigger, player2) {
      const target = trigger.player;
      event2.result = await target.chooseBool({
        prompt: `是否对${get.translation(player2)}发动【礼下】？`,
        prompt2: "弃置其装备区内的一张牌，然后选择一项：①弃置两张牌。②失去1点体力。③令其摸两张牌。",
        ai: () => {
          const player3 = _status.event.player;
          const target2 = _status.event.getParent().player;
          if (get.attitude(player3, target2) > 0) {
            return target2.hasCards("e", (card) => get.value(card, target2) < 3);
          }
          if (target2.hasCards("e", (card) => get.value(card, target2) >= 7)) {
            return true;
          }
          const dist = get.distance(player3, target2, "attack");
          return dist > 1 && dist - target2.countCards("e") <= 1;
        }
      }).forResult();
    },
    async content(event2, trigger, player2) {
      const target = trigger.player;
      target.line(player2, "green");
      await target.discardPlayerCard({ target: player2, position: "e", forced: true });
      const list = ["失去1点体力", `令${get.translation(player2)}摸两张牌`];
      let addIndex = 0;
      if (target.countCards("h", (card) => lib.filter.cardDiscardable(card, target, "gzlixia")) > 1) {
        list.unshift("弃置两张牌");
      } else {
        addIndex++;
      }
      const { index } = await target.chooseControl({
        choiceList: list,
        ai: () => {
          let num = 2;
          const player3 = _status.event.player;
          const target2 = _status.event.getParent().player;
          if (get.attitude(player3, target2) < 0) {
            if (player3.countCards("he", (card) => lib.filter.cardDiscardable(card, player3, "gzlixia") && get.value(card, player3) < 5) > 1) {
              num = 0;
            } else if (player3.hp + player3.countCards("h", "tao") > 3 && !player3.hasJudge("lebu")) {
              num = 1;
            }
          }
          return num - addIndex;
        }
      }).forResult();
      switch (index + addIndex) {
        case 0:
          await target.chooseToDiscard({ selectCard: 2, position: "h", forced: true });
          break;
        case 1:
          await target.loseHp();
          break;
        case 2:
          await player2.draw(2);
          break;
      }
    }
  },
  yigui: {
    audio: 2,
    hiddenCard(player2, name) {
      const storage = player2.storage.yigui;
      if (name === "shan" || name === "wuxie" || !storage || !storage.character.length || storage.used.includes(name) || !lib.inpile.includes(name)) {
        return false;
      }
      return true;
    },
    init(player2, skill) {
      if (!player2.storage.skill) {
        player2.storage[skill] = {
          character: [],
          used: []
        };
      }
    },
    enable: "chooseToUse",
    filter(event2, player2) {
      if (event2.type === "wuxie" || event2.type === "respondShan") {
        return false;
      }
      const storage = player2.storage.yigui;
      if (!storage || !storage.character.length) {
        return false;
      }
      if (event2.type === "dying") {
        if ((!event2.filterCard({ name: "tao" }, player2, event2) || storage.used.includes("tao")) && (!event2.filterCard({ name: "jiu" }, player2, event2) || storage.used.includes("jiu"))) {
          return false;
        }
        const target = event2.dying;
        if (target.identity === "unknown" || target.identity === "ye") {
          return true;
        }
        for (const item of storage.character) {
          const group = lib.character[item][1];
          if (group === "ye" || target.identity === group) {
            return true;
          }
          const double = get.is.double(item, true);
          if (double && double.includes(target.identity)) {
            return true;
          }
        }
        return false;
      } else {
        return true;
      }
    },
    chooseButton: {
      select: 2,
      dialog(event2, player2) {
        const dialog = ui.create.dialog("役鬼", "hidden");
        dialog.add([player2.storage.yigui.character, "character"]);
        const list = lib.inpile;
        const list2 = [];
        for (const item of list) {
          const name = item;
          if (name === "shan" || name === "wuxie") {
            continue;
          }
          const type2 = get.type(name);
          if (name === "sha") {
            list2.push(["基本", "", "sha"]);
            list2.push(["基本", "", "sha", "fire"]);
            list2.push(["基本", "", "sha", "thunder"]);
          } else if (type2 === "basic") {
            list2.push(["基本", "", item]);
          } else if (type2 === "trick") {
            list2.push(["锦囊", "", item]);
          }
        }
        dialog.add([list2, "vcard"]);
        return dialog;
      },
      check(button) {
        if (ui.selected.buttons.length) {
          const evt = _status.event.getParent("chooseToUse");
          const name = button.link[2];
          const group = lib.character[ui.selected.buttons[0].link][1];
          const double = get.is.double(ui.selected.buttons[0].link, true);
          const player2 = _status.event.player;
          if (evt.type === "dying") {
            if (evt.dying !== player2 && get.effect(evt.dying, { name }, player2, player2) <= 0) {
              return 0;
            }
            if (name === "jiu") {
              return 2.1;
            }
            return 2;
          }
          if (!["tao", "juedou", "guohe", "shunshou", "wuzhong", "xietianzi", "yuanjiao", "taoyuan", "wugu", "wanjian", "nanman", "huoshaolianying"].includes(name)) {
            return 0;
          }
          if (["taoyuan", "wugu", "wanjian", "nanman", "huoshaolianying"].includes(name)) {
            const list = game.filterPlayer((current) => {
              return (group === "ye" || current.identity === "unknown" || current.identity === "ye" || current.identity === group || double && double.includes(current.identity)) && player2.canUse({ name }, current);
            });
            let num = 0;
            for (const item of list) {
              num += get.effect(item, { name }, player2, player2);
            }
            if (num <= 0) {
              return 0;
            }
            if (list.length > 1) {
              return (1.7 + Math.random()) * Math.max(num, 1);
            }
          }
        }
        return 1 + Math.random();
      },
      filter(button, player2) {
        const evt = _status.event.getParent("chooseToUse");
        if (!ui.selected.buttons.length) {
          if (typeof button.link !== "string") {
            return false;
          }
          if (evt.type === "dying") {
            if (evt.dying.identity === "unknown" || evt.dying.identity === "ye") {
              return true;
            }
            const double = get.is.double(button.link, true);
            return evt.dying.identity === lib.character[button.link][1] || lib.character[button.link][1] === "ye" || double && double.includes(evt.dying.identity);
          }
          return true;
        } else {
          if (typeof ui.selected.buttons[0].link !== "string") {
            return false;
          }
          if (typeof button.link !== "object") {
            return false;
          }
          const name = button.link[2];
          if (player2.storage.yigui.used.includes(name)) {
            return false;
          }
          let card = { name };
          if (button.link[3]) {
            card.nature = button.link[3];
          }
          const info = get.info(card);
          const group = lib.character[ui.selected.buttons[0].link][1];
          const double = get.is.double(ui.selected.buttons[0].link, true);
          if (evt.type === "dying") {
            return evt.filterCard(card, player2, evt);
          }
          if (!lib.filter.filterCard(card, player2, evt)) {
            return false;
          } else if (evt.filterCard && !evt.filterCard(card, player2, evt)) {
            return false;
          }
          if (info.changeTarget) {
            const list = game.filterPlayer((current) => {
              return player2.canUse(card, current);
            });
            for (const item of list) {
              let giveup = false;
              const targets = [item];
              info.changeTarget(player2, targets);
              for (const item2 of targets) {
                if (group !== "ye" && item2.identity !== "unknown" && item2.identity !== "ye" && item2.identity !== group && (!double || !double.includes(item2.identity))) {
                  giveup = true;
                  break;
                }
              }
              if (giveup) {
                continue;
              }
              if (giveup === false) {
                return true;
              }
            }
            return false;
          } else {
            return game.hasPlayer((current) => {
              return evt.filterTarget(card, player2, current) && (group === "ye" || current.identity === "unknown" || current.identity === "ye" || current.identity === group || double && double.includes(current.identity));
            });
          }
        }
      },
      backup(links, player2) {
        const name = links[1][2];
        const nature = links[1][3] || null;
        const character = links[0];
        const group = lib.character[character][1];
        const next = {
          character,
          group,
          filterCard() {
            return false;
          },
          selectCard: -1,
          complexCard: true,
          check() {
            return 1;
          },
          popname: true,
          audio: "yigui",
          viewAs: {
            name,
            nature,
            isCard: true
          },
          filterTarget(card, player3, target) {
            const xx = lib.skill.yigui_backup;
            const evt = _status.event;
            const group2 = xx.group;
            const double = get.is.double(xx.character, true);
            const info = get.info(card);
            if (!(info.singleCard && ui.selected.targets.length) && group2 !== "ye" && target.identity !== "unknown" && target.identity !== "ye" && target.identity !== group2 && (!double || !double.includes(target.identity))) {
              return false;
            }
            if (info.changeTarget) {
              const targets = [target];
              info.changeTarget(player3, targets);
              for (const item of targets) {
                if (group2 !== "ye" && item.identity !== "unknown" && item.identity !== "ye" && item.identity !== group2 && (!double || !double.includes(item.identity))) {
                  return false;
                }
              }
            }
            if (evt._backup && evt._backup.filterTarget) {
              return evt._backup.filterTarget(card, player3, target);
            }
            return lib.filter.filterTarget(card, player3, target);
          },
          onuse(result2, player3) {
            player3.logSkill("yigui");
            const character2 = lib.skill.yigui_backup.character;
            player3.flashAvatar("yigui", character2);
            player3.storage.yigui.character.remove(character2);
            _status.characterlist.add(character2);
            game.log(player3, "从「魂」中移除了", `#g${get.translation(character2)}`);
            player3.syncStorage("yigui");
            player3.updateMarks("yigui");
            player3.storage.yigui.used.add(result2.card.name);
          }
        };
        return next;
      },
      prompt(links, player2) {
        const name = links[1][2];
        const character = links[0];
        const nature = links[1][3];
        return `移除「${get.translation(character)}」并视为使用${get.translation(nature) || ""}${get.translation(name)}`;
      }
    },
    group: ["yigui_init", "yigui_refrain"],
    ai: {
      order() {
        return 1 + 10 * Math.random();
      },
      result: {
        player: 1
      }
    },
    mark: true,
    marktext: "魂",
    intro: {
      onunmark(storage, player2) {
        _status.characterlist.addArray(storage.character);
        storage.character = [];
      },
      mark(dialog, storage, player2) {
        if (storage && storage.character.length) {
          if (player2.isUnderControl(true)) {
            dialog.addSmall([storage.character, "character"]);
          } else {
            return `共有${get.cnNumber(storage.character.length)}张“魂”`;
          }
        } else {
          return "没有魂";
        }
      },
      content(storage, player2) {
        return `共有${get.cnNumber(storage.character.length)}张“魂”`;
      },
      markcount(storage, player2) {
        if (storage && storage.character) {
          return storage.character.length;
        }
        return 0;
      }
    }
  },
  yigui_init: {
    audio: "yigui",
    trigger: {
      player: "showCharacterAfter"
    },
    forced: true,
    filter(event2, player2) {
      return event2.toShow.some((name) => {
        return get.character(name, 3).includes("yigui");
      }) && !player2.storage.yigui_init;
    },
    async content(event2, trigger, player2) {
      player2.storage.yigui_init = true;
      const list = _status.characterlist.randomGets(2);
      if (list.length) {
        _status.characterlist.removeArray(list);
        player2.storage.yigui.character.addArray(list);
        lib.skill.gzhuashen.drawCharacter(player2, list);
        player2.syncStorage("yigui");
        player2.updateMarks("yigui");
        game.log(player2, `获得了${get.cnNumber(list.length)}张「魂」`);
      }
    }
  },
  yigui_refrain: {
    trigger: { global: "phaseBefore" },
    forced: true,
    silent: true,
    popup: false,
    async content(event2, trigger, player2) {
      player2.storage.yigui.used = [];
    }
  },
  yigui_shan: {
    enable: "chooseToUse",
    filter(event2, player2) {
      if (event2.type !== "respondShan") {
        return false;
      }
      const storage = player2.storage.yigui;
      if (!storage || !storage.character.length || storage.used.includes("shan")) {
        return false;
      }
      return event2.filterCard({ name: "shan" }, player2, event2);
    },
    chooseButton: {
      dialog(event2, player2) {
        const dialog = ui.create.dialog("役鬼", "hidden");
        dialog.add([player2.storage.yigui.character, "character"]);
        return dialog;
      },
      check(button) {
        return 1 / (1 + game.countPlayer((current) => {
          return current.identity === button.link;
        }));
      },
      backup(links, player2) {
        const character = links[0];
        const next = {
          character,
          filterCard() {
            return false;
          },
          selectCard: -1,
          complexCard: true,
          check() {
            return 1;
          },
          popname: true,
          audio: "yigui",
          viewAs: {
            name: "shan",
            isCard: true
          },
          onuse(result2, player3) {
            player3.logSkill("yigui");
            const character2 = lib.skill.yigui_shan_backup.character;
            player3.flashAvatar("yigui", character2);
            player3.storage.yigui.character.remove(character2);
            _status.characterlist.add(character2);
            game.log(player3, "从「魂」中移除了", `#g${get.translation(character2)}`);
            player3.syncStorage("yigui");
            player3.updateMarks("yigui");
            player3.storage.yigui.used.add(result2.card.name);
          }
        };
        return next;
      }
    },
    ai: {
      respondShan: true,
      skillTagFilter(player2) {
        const storage = player2.storage.yigui;
        if (!storage || !storage.character.length || storage.used.includes("shan")) {
          return false;
        }
      },
      order: 0.1,
      result: {
        player: 1
      }
    }
  },
  yigui_wuxie: {
    enable: "chooseToUse",
    filter(event2, player2) {
      if (event2.type !== "wuxie") {
        return false;
      }
      const storage = player2.storage.yigui;
      if (!storage || !storage.character.length || storage.used.includes("wuxie")) {
        return false;
      }
      return event2.filterCard({ name: "wuxie" }, player2, event2);
    },
    chooseButton: {
      dialog(event2, player2) {
        const dialog = ui.create.dialog("役鬼", "hidden");
        dialog.add([player2.storage.yigui.character, "character"]);
        return dialog;
      },
      check(button) {
        return 1 / (1 + game.countPlayer((current) => {
          return current.identity === button.link;
        }));
      },
      backup(links, player2) {
        const character = links[0];
        const next = {
          character,
          filterCard() {
            return false;
          },
          selectCard: -1,
          complexCard: true,
          check() {
            return 1;
          },
          popname: true,
          audio: "yigui",
          viewAs: {
            name: "wuxie",
            isCard: true
          },
          onuse(result2, player3) {
            player3.logSkill("yigui");
            const character2 = lib.skill.yigui_wuxie_backup.character;
            player3.flashAvatar("yigui", character2);
            player3.storage.yigui.character.remove(character2);
            _status.characterlist.add(character2);
            game.log(player3, "从「魂」中移除了", `#g${get.translation(character2)}`);
            player3.syncStorage("yigui");
            player3.updateMarks("yigui");
            player3.storage.yigui.used.add(result2.card.name);
          }
        };
        return next;
      }
    },
    ai: {
      order: 0.1,
      result: {
        player: 1
      }
    }
  },
  yigui_gzshan: {
    enable: "chooseToUse",
    filter(event2, player2) {
      if (event2.type !== "respondShan" || !event2.filterCard({ name: "shan" }, player2, event2) || !lib.inpile.includes("shan")) {
        return false;
      }
      const storage = player2.storage.yigui;
      const target = event2.getParent().player;
      if (!storage || !target || !storage.character.length || storage.used.includes("shan")) {
        return false;
      }
      const identity = target.identity;
      return ["unknown", "ye"].includes(identity) || storage.character.some((i) => {
        if (lib.character[i][1] === "ye") {
          return true;
        }
        const double = get.is.double(i, true);
        const groups = double ? double : [lib.character[i][1]];
        return groups.includes(identity);
      });
    },
    chooseButton: {
      dialog(event2, player2) {
        const dialog = ui.create.dialog("役鬼", "hidden");
        dialog.add([player2.storage.yigui.character, "character"]);
        return dialog;
      },
      filter(button, player2) {
        const evt = _status.event.getParent("chooseToUse");
        const target = evt.getParent().player;
        const identity = target.identity;
        if (["unknown", "ye"].includes(identity)) {
          return true;
        }
        if (lib.character[button.link][1] === "ye") {
          return true;
        }
        const double = get.is.double(button.link, true);
        const groups = double ? double : [lib.character[button.link][1]];
        return groups.includes(identity);
      },
      check(button) {
        return 1 / (1 + game.countPlayer((current) => {
          return current.identity === lib.character[button.link][1];
        }));
      },
      backup(links, player2) {
        const character = links[0];
        const next = {
          character,
          filterCard: () => false,
          selectCard: -1,
          complexCard: true,
          check: () => 1,
          popname: true,
          audio: "yigui",
          viewAs: { name: "shan", isCard: true },
          onuse(result2, player3) {
            player3.logSkill("yigui");
            const character2 = lib.skill.yigui_gzshan_backup.character;
            player3.flashAvatar("yigui", character2);
            player3.storage.yigui.character.remove(character2);
            _status.characterlist.add(character2);
            game.log(player3, "从「魂」中移除了", `#g${get.translation(character2)}`);
            player3.syncStorage("yigui");
            player3.updateMarks("yigui");
            player3.storage.yigui.used.add(result2.card.name);
          }
        };
        return next;
      }
    },
    ai: {
      respondShan: true,
      skillTagFilter(player2, tag, arg) {
        if (arg === "respond" || !lib.inpile.includes("shan")) {
          return false;
        }
        const storage = player2.storage.yigui;
        if (!storage || !storage.character.length || storage.used.includes("shan")) {
          return false;
        }
      },
      order: 0.1,
      result: { player: 1 }
    }
  },
  yigui_gzwuxie: {
    hiddenWuxie(player2, info) {
      if (!lib.inpile.includes("wuxie")) {
        return false;
      }
      const storage = player2.storage.yigui;
      if (!storage || !storage.character || !storage.character.length || storage.used && storage.used.includes("wuxie")) {
        return false;
      }
      if (_status.connectMode) {
        return true;
      }
      const target = info.target;
      if (!target) {
        return false;
      }
      const identity = target.identity;
      return ["unknown", "ye"].includes(identity) || storage.character.some((i) => {
        if (lib.character[i][1] === "ye") {
          return true;
        }
        const double = get.is.double(i, true);
        return (double ? double : [lib.character[i][1]]).includes(identity);
      });
    },
    enable: "chooseToUse",
    filter(event2, player2) {
      if (event2.type !== "wuxie" || !lib.inpile.includes("wuxie")) {
        return false;
      }
      const storage = player2.storage.yigui;
      if (!storage || !storage.character || !storage.character.length || storage.used && storage.used.includes("wuxie")) {
        return false;
      }
      const info = event2.info_map;
      const target = info.target;
      const identity = target.identity;
      return ["unknown", "ye"].includes(identity) || storage.character.some((i) => {
        if (lib.character[i][1] === "ye") {
          return true;
        }
        const double = get.is.double(i, true);
        return (double ? double : [lib.character[i][1]]).includes(identity);
      });
    },
    chooseButton: {
      dialog(event2, player2) {
        const dialog = ui.create.dialog("役鬼", "hidden");
        dialog.add([player2.storage.yigui.character, "character"]);
        return dialog;
      },
      filter(button, player2) {
        const evt = get.event().getParent("chooseToUse");
        const info = evt.info_map;
        const target = info.target;
        const identity = target.identity;
        if (["unknown", "ye"].includes(identity)) {
          return true;
        }
        if (lib.character[button.link][1] === "ye") {
          return true;
        }
        const double = get.is.double(button.link, true);
        return (double ? double : [lib.character[button.link][1]]).includes(identity);
      },
      check(button) {
        return 1 + Math.random();
      },
      backup(links, player2) {
        return {
          character: links[0],
          filterCard: () => false,
          selectCard: -1,
          complexCard: true,
          check: () => 1,
          popname: true,
          audio: "yigui",
          viewAs: { name: "wuxie", isCard: true },
          onuse(result2, player3) {
            player3.logSkill("yigui");
            const character = lib.skill.yigui_gzwuxie_backup.character;
            player3.flashAvatar("yigui", character);
            player3.storage.yigui.character.remove(character);
            _status.characterlist.add(character);
            game.log(player3, "从「魂」中移除了", `#g${get.translation(character)}`);
            player3.syncStorage("yigui");
            player3.updateMarks("yigui");
            player3.storage.yigui.used.add(result2.card.name);
          }
        };
      }
    },
    ai: {
      order: 0.1,
      result: { player: 1 }
    }
  },
  jihun: {
    trigger: {
      player: "damageEnd",
      global: "dyingAfter"
    },
    audio: 2,
    frequent: true,
    preHidden: true,
    filter(event2, player2) {
      return event2.name === "damage" || event2.player.isAlive() && !event2.player.isFriendOf(player2);
    },
    async content(event2, trigger, player2) {
      const list = _status.characterlist.randomGets(1);
      if (list.length) {
        _status.characterlist.removeArray(list);
        player2.storage.yigui.character.addArray(list);
        lib.skill.gzhuashen.drawCharacter(player2, list);
        player2.syncStorage("yigui");
        player2.updateMarks("yigui");
        game.log(player2, `获得了${get.cnNumber(list.length)}张「魂」`);
      }
    }
  },
  gzbuyi: {
    trigger: { global: "dyingAfter" },
    usable: 1,
    filter(event2, player2) {
      if (!(event2.player && event2.player.isAlive() && event2.source && event2.source.isAlive())) {
        return false;
      }
      return event2.player.isFriendOf(player2) && event2.reason && event2.reason.name === "damage";
    },
    check(event2, player2) {
      return get.attitude(player2, event2.player) > 0;
    },
    logTarget: "source",
    preHidden: true,
    async content(event2, trigger, player2) {
      const { junling, targets } = await player2.chooseJunlingFor(trigger.source).forResult();
      event2.junling = junling;
      event2.targets = targets;
      const choiceList = ["执行该军令", `令${get.translation(trigger.player)}${trigger.player === trigger.source ? "（你）" : ""}回复1点体力`];
      const result2 = await trigger.source.chooseJunlingControl(player2, junling, targets).set("prompt", "补益").set("choiceList", choiceList).set("ai", () => {
        if (get.recoverEffect(trigger.player, player2, _status.event.player) > 0) {
          return 1;
        }
        return get.attitude(trigger.source, trigger.player) < 0 && get.junlingEffect(player2, junling, trigger.source, targets, trigger.source) >= -2 ? 1 : 0;
      }).forResult();
      if (result2.index === 0) {
        await trigger.source.carryOutJunling(player2, event2.junling, event2.targets);
      } else {
        await trigger.player.recover({ source: player2 });
      }
    },
    audio: ["buyi", 2]
  },
  keshou: {
    audio: 2,
    trigger: { player: "damageBegin3" },
    filter(event2, player2) {
      return event2.num > 0;
    },
    direct: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      const check = player2.countCards("h", { color: "red" }) > 1 || player2.countCards("h", { color: "black" }) > 1;
      const result2 = await player2.chooseCard({
        prompt: get.prompt("keshou"),
        prompt2: "弃置两张颜色相同的牌，令即将受到的伤害-1",
        position: "he",
        selectCard: 2,
        filterCard(card) {
          if (ui.selected.cards.length) {
            return get.color(card) === get.color(ui.selected.cards[0]);
          }
          return true;
        },
        complexCard: true,
        ai(card) {
          if (!_status.event.check) {
            return 0;
          }
          const player3 = _status.event.player;
          if (player3.hp === 1) {
            if (!player3.hasCards("h", (card2) => get.tag(card2, "save")) && !player3.hasSkillTag("save", true)) {
              return 10 - get.value(card);
            }
            return 7 - get.value(card);
          }
          return 6 - get.value(card);
        }
      }).set("check", check).setHiddenSkill(event2.name).forResult();
      let logged = false;
      if (result2.cards) {
        logged = true;
        player2.logSkill("keshou");
        await player2.discard({ cards: result2.cards });
        trigger.num--;
      }
      if (!player2.isUnseen() && !game.hasPlayer((current) => {
        return current !== player2 && current.isFriendOf(player2);
      })) {
        if (!logged) {
          player2.logSkill("keshou");
        }
        const judgeResult = await player2.judge({
          judge: (card) => get.color(card) === "red" ? 1 : 0
        }).forResult();
        if (judgeResult.judge > 0) {
          await player2.draw();
        }
      } else {
        return;
      }
    }
  },
  zhuwei: {
    audio: 2,
    trigger: { player: "judgeEnd" },
    filter(event2) {
      if (get.owner(event2.result.card)) {
        return false;
      }
      if (event2.nogain && event2.nogain(event2.result.card)) {
        return false;
      }
      return true;
    },
    frequent: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      const gain = player2.gain({ cards: [trigger.result.card], animate: "gain2" });
      const choose = player2.chooseBool({
        prompt: `是否令${get.translation(_status.currentPhase)}本回合的手牌上限和使用【杀】的次数上限+1？`,
        ai() {
          return get.attitude(player2, _status.currentPhase) > 0;
        }
      });
      await gain;
      const result2 = await choose.forResult();
      if (result2.bool) {
        let target = _status.currentPhase;
        if (!target.hasSkill("zhuwei_eff")) {
          target.addTempSkill("zhuwei_eff");
          target.storage.zhuwei_eff = 1;
        } else {
          target.storage.zhuwei_eff++;
        }
        target.updateMarks();
      }
    },
    subSkill: {
      eff: {
        sub: true,
        mod: {
          cardUsable(card, player2, num) {
            if (card.name === "sha") {
              return num + player2.storage.zhuwei_eff;
            }
          },
          maxHandcard(player2, num) {
            return num + player2.storage.zhuwei_eff;
          }
        },
        mark: true,
        charlotte: true,
        intro: {
          content(storage) {
            if (storage) {
              return `使用【杀】的次数上限+${storage}，手牌上限+${storage}`;
            }
          }
        }
      }
    }
  },
  gzweidi: {
    init(player2) {
      player2.storage.gzweidi = [];
    },
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return player2.storage.gzweidi.length > 0;
    },
    filterTarget(card, player2, target) {
      return target !== player2 && player2.storage.gzweidi.includes(target);
    },
    async content(event2, trigger, player2) {
      const target = event2.target;
      const { junling, targets } = await player2.chooseJunlingFor(target).forResult();
      const choiceList = ["执行该军令"];
      if (target !== player2) {
        choiceList.push(`令${get.translation(player2)}获得你所有手牌，然后交给你等量的牌`);
      } else {
        choiceList.push("不执行该军令");
      }
      const { index } = await target.chooseJunlingControl(player2, junling, targets).set("prompt", "伪帝").set("choiceList", choiceList).set("ai", () => {
        if (get.attitude(target, player2) >= 0) {
          return get.junlingEffect(player2, junling, target, targets, target) >= 0 ? 0 : 1;
        }
        return get.junlingEffect(player2, junling, target, targets, target) >= -1 ? 0 : 1;
      }).forResult();
      if (index === 0) {
        await target.carryOutJunling(player2, junling, targets);
        return;
      }
      if (target === player2) {
        return;
      }
      const num = target.countCards("h");
      if (!num) {
        return;
      }
      await player2.gain({ cards: target.getCards("h"), source: target, animate: "giveAuto" });
      const { cards: cards2 } = await player2.chooseCard({
        prompt: `交给${get.translation(target)}${get.cnNumber(num)}张牌`,
        position: "he",
        selectCard: num,
        forced: true,
        ai: (card) => -get.value(card)
      }).forResult();
      if (cards2) {
        await player2.give(cards2, target);
      }
    },
    group: ["gzweidi_ft", "gzweidi_ftc"],
    ai: {
      order: 3,
      result: {
        player: 1
      }
    },
    subSkill: {
      ft: {
        sub: true,
        trigger: { global: "gainBefore" },
        silent: true,
        filter(event2, player2) {
          if (player2 === event2.player || player2.storage.gzweidi.includes(event2.player) || _status.currentPhase !== player2) {
            return false;
          }
          if (!event2.cards.length) {
            return false;
          }
          if (event2.getParent().name === "draw") {
            return true;
          }
          for (const card of event2.cards) {
            if (get.position(card) === "c" || !get.position(card) && card.original === "c") {
              return true;
            }
          }
          return false;
        },
        async content(event2, trigger, player2) {
          player2.storage.gzweidi.push(trigger.player);
        }
      },
      ftc: {
        sub: true,
        trigger: { global: "phaseAfter" },
        silent: true,
        filter(event2, player2) {
          return event2.player === player2;
        },
        async content(event2, trigger, player2) {
          player2.storage.gzweidi = [];
        }
      }
    },
    audio: ["weidi", 2]
  },
  gzyongsi: {
    audio: "yongsi1",
    init(player2, skill) {
      player2.addExtraEquip(skill, "yuxi", true, (player3) => lib.card.yuxi && !game.hasPlayer((current) => current.getEquip("yuxi")));
    },
    onremove(player2, skill) {
      player2.removeExtraEquip(skill);
    },
    group: ["gzyongsi_eff1", "gzyongsi_eff2", "gzyongsi_eff3"],
    preHidden: ["gzyongsi_eff3"],
    ai: {
      threaten(player2, target) {
        if (game.hasPlayer((current) => {
          return current !== target && current.getEquip("yuxi");
        })) {
          return 0.5;
        }
        return 2;
      },
      forceMajor: true,
      skillTagFilter() {
        return !game.hasPlayer((current) => {
          return current.getEquip("yuxi");
        });
      }
    },
    subSkill: {
      eff1: {
        sub: true,
        equipSkill: true,
        noHidden: true,
        trigger: { player: "phaseDrawBegin2" },
        //priority:8,
        forced: true,
        filter(event2, player2) {
          if (event2.numFixed || player2.isDisabled(5)) {
            return false;
          }
          return !game.hasPlayer((current) => {
            return current.getEquips("yuxi").length > 0;
          });
        },
        async content(event2, trigger, player2) {
          trigger.num++;
        },
        audio: ["yongsi1", 2]
      },
      eff2: {
        sub: true,
        trigger: { player: "phaseUseBegin" },
        //priority:8,
        forced: true,
        noHidden: true,
        equipSkill: true,
        filter(event2, player2) {
          if (player2.isDisabled(5)) {
            return false;
          }
          return game.hasPlayer((current) => {
            return player2.canUse("zhibi", current);
          }) && !game.hasPlayer((current) => {
            return current.getEquips("yuxi").length > 0;
          });
        },
        async content(event2, trigger, player2) {
          await player2.chooseUseTarget({ prompt: "玉玺（庸肆）：选择知己知彼的目标", card: { name: "zhibi" } });
        },
        audio: ["yongsi1", 2]
      },
      eff3: {
        sub: true,
        trigger: { global: "useCardToTargeted" },
        //priority:16,
        forced: true,
        filter(event2, player2) {
          return event2.target && event2.target === player2 && event2.card && event2.card.name === "zhibi";
        },
        check() {
          return false;
        },
        async content(event2, trigger, player2) {
          await player2.showHandcards();
        }
      }
    }
  },
  gzfudi: {
    trigger: { global: "damageEnd" },
    preHidden: true,
    audio: 2,
    logTarget: "source",
    filter(event2, player2) {
      return event2.source && event2.source.isAlive() && event2.source !== player2 && event2.player === player2 && player2.hasCards("h") && event2.num > 0;
    },
    async cost(event2, trigger, player2) {
      const players = game.filterPlayer((current) => {
        return current.isFriendOf(trigger.source) && current.hp >= player2.hp && !game.hasPlayer((current2) => {
          return current2.hp > current.hp && current2.isFriendOf(trigger.source);
        });
      });
      let check = true;
      if (!players.length) {
        check = false;
      } else if (get.attitude(player2, trigger.source) >= 0) {
        check = false;
      }
      event2.result = await player2.chooseCard({
        prompt: get.prompt(event2.skill, trigger.source),
        prompt2: "交给其一张手牌，然后对其势力中体力值最大且不小于你的一名角色造成1点伤害",
        ai: (card) => {
          if (!_status.event.aicheck) {
            return 0;
          }
          return 9 - get.value(card);
        }
      }).set("aicheck", check).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      await player2.give(event2.cards, trigger.source);
      const list = game.filterPlayer((current) => {
        return current.hp >= player2.hp && current.isFriendOf(trigger.source) && !game.hasPlayer((current2) => {
          return current2.hp > current.hp && current2.isFriendOf(trigger.source);
        });
      });
      if (!list.length) {
        return;
      }
      let target = list[0];
      if (list.length > 1) {
        const result2 = await player2.chooseTarget({
          forced: true,
          prompt: `对${get.translation(trigger.source)}势力中体力值最大的一名角色造成1点伤害`,
          filterTarget: (card, player3, target2) => _status.event.list.includes(target2),
          ai: (target2) => get.damageEffect(target2, player2, player2)
        }).set("list", list).forResult();
        if (!result2.bool || !result2.targets.length) {
          return;
        }
        target = result2.targets[0];
      }
      player2.line(target);
      await target.damage();
    },
    ai: {
      maixie: true,
      maixie_defend: true,
      effect: {
        target(card, player2, target) {
          if (get.tag(card, "damage") && target.hp > 1) {
            if (player2.hasSkillTag("jueqing", false, target)) {
              return [1, -2];
            }
            if (!target.hasCards("h")) {
              return [1, -1];
            }
            if (game.countPlayer((current) => {
              return current.isFriendOf(player2) && current.hp >= target.hp - 1;
            })) {
              return [1, 0, 0, -2];
            }
          }
        }
      }
    }
  },
  gzcongjian: {
    trigger: {
      player: "damageBegin3",
      source: "damageBegin1"
    },
    forced: true,
    preHidden: true,
    audio: "drlt_congjian",
    filter(event2, player2, name) {
      if (event2.num <= 0) {
        return false;
      }
      if (name === "damageBegin1" && _status.currentPhase !== player2) {
        return true;
      }
      if (name === "damageBegin3" && _status.currentPhase === player2) {
        return true;
      }
      return false;
    },
    check(event2, player2) {
      return _status.currentPhase !== player2;
    },
    async content(event2, trigger, player2) {
      trigger.num++;
    }
  },
  jianan: {
    audio: 1,
    unique: true,
    forceunique: true,
    derivation: ["wuziliangjiangdao", "new_retuxi", "qiaobian", "gz_xiaoguo", "gz_jieyue", "gz_duanliang"],
    lordSkill: true,
    global: ["wuziliangjiangdao", "g_jianan"],
    init(player2) {
      player2.markSkill("wuziliangjiangdao");
    }
  },
  g_jianan: {
    trigger: {
      player: ["phaseZhunbeiBegin", "phaseBefore", "dieBegin"]
    },
    audio: "wuziliangjiangdao",
    forceaudio: true,
    filter(event2, player2, name) {
      if (name !== "phaseZhunbeiBegin") {
        return get.is.jun(player2) && player2.identity === "wei";
      }
      return this.filter2.apply(this, arguments);
    },
    filter2(event2, player2) {
      if (!get.zhu(player2, "jianan")) {
        return false;
      }
      if (!player2.hasCards("he")) {
        return false;
      }
      return !player2.isUnseen();
    },
    direct: true,
    async content(event2, trigger, player2) {
      if (event2.triggername !== "phaseZhunbeiBegin") {
        await event2.trigger("jiananUpdate");
        return;
      }
      const skills = ["new_retuxi", "qiaobian", "gz_xiaoguo", "gz_jieyue", "gz_duanliang"];
      game.countPlayer((current) => {
        if (current.hasSkill("new_retuxi")) {
          skills.remove("new_retuxi");
        }
        if (current.hasSkill("qiaobian")) {
          skills.remove("qiaobian");
        }
        if (current.hasSkill("gz_xiaoguo")) {
          skills.remove("gz_xiaoguo");
        }
        if (current.hasSkill("gz_jieyue")) {
          skills.remove("gz_jieyue");
        }
        if (current.hasSkill("gz_duanliang")) {
          skills.remove("gz_duanliang");
        }
      });
      if (!skills.length) {
        return;
      }
      const str = skills.map((skill) => `【${get.translation(skill)}】`).join("、");
      let next = player2.chooseToDiscard({
        position: "he",
        prompt: "是否发动【五子良将纛】？",
        prompt2: get.translation(`弃置一张牌并暗置一张武将牌，获得以下技能中的一个直到下回合开始：${str}`),
        ai: (card) => {
          const skills2 = _status.event.skills;
          const player3 = _status.event.player;
          let rank = 0;
          if (skills2.includes("new_retuxi") && game.countPlayer((current) => get.attitude(player3, current) < 0 && current.hasGainableCards(player3, "h")) > 1) {
            rank = 4;
          }
          if (skills2.includes("gz_jieyue") && player3.countCards("h", (card2) => get.value(card2) < 7) > 1) {
            rank = 5;
          }
          if (skills2.includes("qiaobian") && player3.countCards("h") > 4) {
            rank = 6;
          }
          if (get.guozhanRank(player3.name1, player3) < rank && !player3.isUnseen(0) || get.guozhanRank(player3.name2, player3) < rank && !player3.isUnseen(1)) {
            return rank + 1 - get.value(card);
          }
          return -1;
        }
      });
      next.logSkill = "g_jianan";
      next.skills = skills;
      const discardResult = await next.forResult();
      if (!discardResult.bool) {
        return;
      }
      const list = ["主将", "副将"];
      if (player2.isUnseen(0) || get.is.jun(player2)) {
        list.remove("主将");
      }
      if (player2.isUnseen(1)) {
        list.remove("副将");
      }
      if (list.length) {
        const control = list.length === 1 ? list[0] : (await player2.chooseControl({
          controls: list,
          prompt: "请选择暗置一张武将牌",
          ai: () => get.guozhanRank(player2.name1, player2) < get.guozhanRank(player2.name2, player2) ? "主将" : "副将"
        }).forResult()).control;
        if (!control) {
          return;
        }
        await player2.hideCharacter(control === "主将" ? 0 : 1);
      }
      const { control: link } = await player2.chooseControl({
        controls: skills,
        prompt: "选择获得其中的一个技能直到君主的回合开始",
        ai: () => {
          if (skills.includes("qiaobian") && player2.countCards("h") > 3) {
            return "qiaobian";
          }
          if (skills.includes("gz_jieyue") && player2.hasCards("h", (card) => get.value(card) < 7)) {
            return "gz_jieyue";
          }
          if (skills.includes("new_retuxi")) {
            return "new_retuxi";
          }
          return skills.randomGet();
        }
      }).forResult();
      player2.addTempSkill(link, "jiananUpdate");
      player2.addTempSkill("jianan_eff", "jiananUpdate");
      game.log(player2, "获得了技能", `#g【${get.translation(link)}】`);
      const map = {
        new_retuxi: "jianan_tuxi",
        qiaobian: "jianan_qiaobian",
        gz_xiaoguo: "jianan_xiaoguo",
        gz_jieyue: "jianan_jieyue",
        gz_duanliang: "jianan_duanliang"
      };
      const mapSkills = map[link];
      game.broadcastAll(
        (link2, mapSkills2) => {
          let info = lib.skill[link2];
          if (!info.audioname2) {
            info.audioname2 = {};
          }
          info.audioname2[player2.name1] = mapSkills2;
          info.audioname2[player2.name2] = mapSkills2;
        },
        link,
        mapSkills
      );
    }
  },
  jianan_eff: {
    ai: { nomingzhi: true }
  },
  jianan_tuxi: { audio: 2 },
  jianan_qiaobian: { audio: 2 },
  jianan_xiaoguo: { audio: 2 },
  jianan_jieyue: { audio: 2 },
  jianan_duanliang: { audio: 2 },
  huibian: {
    enable: "phaseUse",
    audio: 2,
    usable: 1,
    filter(event2, player2) {
      return game.countPlayer((current) => {
        return current.identity === "wei";
      }) > 1 && game.hasPlayer((current) => {
        return current.isDamaged() && current.identity === "wei";
      });
    },
    filterTarget(card, player2, target) {
      if (ui.selected.targets.length) {
        return target.isDamaged() && target.identity === "wei";
      }
      return target.identity === "wei";
    },
    selectTarget: 2,
    multitarget: true,
    targetprompt: ["受伤摸牌", "回复体力"],
    async content(event2, trigger, player2) {
      const {
        targets: [target1, target2]
      } = event2;
      await target1.damage({ source: player2 });
      if (target1.isAlive()) {
        await target1.draw(2);
      }
      await target2.recover();
    },
    ai: {
      threaten: 1.2,
      order: 9,
      result: {
        target(player2, target) {
          if (ui.selected.targets.length) {
            return 1;
          }
          if (get.damageEffect(target, player2, player2) > 0) {
            return 2;
          }
          if (target.hp > 2) {
            return 1;
          }
          if (target.hp === 1) {
            return -1;
          }
          return 0.1;
        }
      }
    }
  },
  gzzongyu: {
    audio: 2,
    derivation: "liulongcanjia",
    unique: true,
    forceunique: true,
    group: "gzzongyu_others",
    global: "gzzongyu_player",
    ai: {
      threaten: 1.2
    },
    subSkill: {
      others: {
        trigger: { global: "equipAfter" },
        filter(event2, player2) {
          if (event2.player === player2 || !player2.hasCards("e", { subtype: ["equip3", "equip4"] })) {
            return false;
          }
          return event2.card.name === "liulongcanjia";
        },
        async cost(event2, trigger, player2) {
          const target = trigger.player;
          event2.result = await player2.chooseBool({
            prompt: `是否发动【总御】，与${get.translation(target)}交换装备区内坐骑牌？`,
            ai: () => {
              const { player: player3, target: target2 } = get.event();
              if (get.attitude(player3, target2) <= 0) {
                return player3.countCards("e", { subtype: ["equip4", "equip4"] }) < 2;
              }
              return true;
            }
          }).set("target", target).setHiddenSkill("gzzongyu").forResult();
          event2.result.targets = [target];
        },
        async content(event2, trigger, player2) {
          const target = trigger.player;
          const cards1 = player2.getCards("e", { subtype: ["equip3", "equip4"] });
          const cards2 = trigger.player.getCards("e", { name: "liulongcanjia" });
          let next = game.createEvent("swapEquip");
          next.player = player2;
          next.target = target;
          next.cards1 = cards1;
          next.cards2 = cards2;
          next.setContent(async (event3, trigger2, player3) => {
            const { target: target2, cards1: cards12, cards2: cards22 } = event3;
            game.log(player3, "和", target2, "交换了装备区中的坐骑牌");
            await game.loseAsync({
              player: player3,
              target: target2,
              cards1: cards12,
              cards2: cards22
            }).setContent("swapHandcardsx");
            for (const i of cards22) {
              if (get.position(i, true) === "o") {
                await player3.equip(i);
              }
            }
            for (const i of cards12) {
              if (get.position(i, true) === "o") {
                await target2.equip(i);
              }
            }
          });
          await next;
        }
      },
      player: {
        audio: "gzzongyu",
        forceaudio: true,
        trigger: { player: "equipAfter" },
        forced: true,
        filter(event2, player2) {
          if (!player2.hasSkill("gzzongyu", null, null, false)) {
            return false;
          }
          if (!["equip3", "equip4"].includes(get.subtype(event2.card))) {
            return false;
          }
          for (const item of ui.discardPile.childNodes) {
            if (item.name === "liulongcanjia") {
              return true;
            }
          }
          return game.hasPlayer((current) => {
            return current !== player2 && current.hasCards("ej", "liulongcanjia");
          });
        },
        async content(event2, trigger, player2) {
          const list = [];
          for (const card2 of ui.discardPile.childNodes) {
            if (card2.name === "liulongcanjia") {
              list.add(card2);
            }
          }
          game.countPlayer((current) => {
            if (current !== player2) {
              const cards2 = current.getCards("ej", "liulongcanjia");
              if (cards2.length) {
                list.addArray(cards2);
              }
            }
          });
          if (!list.length) {
            return;
          }
          const card = list.randomGet();
          const owner = get.owner(card);
          if (owner) {
            player2.line(owner, "green");
            owner.$give(card, player2);
          } else {
            player2.$gain(card, "log");
          }
          await player2.equip(card);
        }
      }
    }
  },
  wuziliangjiangdao: {
    audio: 2,
    nopop: true,
    unique: true,
    forceunique: true,
    mark: true,
    intro: {
      content() {
        return get.translation("wuziliangjiangdao_info");
      }
    }
  },
  gzzhengbi: {
    audio: "zhengbi",
    trigger: { player: "phaseUseBegin" },
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        return current !== player2 && current.identity === "unknown";
      }) || player2.hasCards("h", { type: "basic" });
    },
    check(event2, player2) {
      if (player2.hasCards("h", (card) => {
        return get.value(card) < 7;
      })) {
        if (player2.isUnseen()) {
          return Math.random() > 0.7;
        }
        return true;
      }
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      const choices = [];
      if (game.hasPlayer((current) => current.isUnseen())) {
        choices.push("选择一名未确定势力的角色");
      }
      if (game.hasPlayer((current) => {
        return current !== player2 && !current.isUnseen();
      }) && player2.hasCards("h", { type: "basic" })) {
        choices.push("将一张基本牌交给一名已确定势力的角色");
      }
      let index;
      if (choices.length === 1) {
        index = choices[0] === "选择一名未确定势力的角色" ? 0 : 1;
      } else {
        const result3 = await player2.chooseControl({
          ai: () => {
            if (choices.length > 1) {
              const player3 = _status.event.player;
              let identity;
              if (!game.hasPlayer((current) => {
                return !current.isUnseen() && current.getEquip("yuxi") || current.hasSkill("gzyongsi") && !game.hasPlayer((current2) => current2.getEquips("yuxi").length > 0);
              }) && game.hasPlayer((current) => current !== player3 && current.isUnseen())) {
                for (let i = 0; i < game.players; i++) {
                  if (game.players[i].isMajor()) {
                    identity = game.players[i].identity;
                    break;
                  }
                }
              }
              if (!player3.isUnseen() && player3.identity !== identity && get.population(player3.identity) + 1 >= get.population(identity)) {
                return 0;
              }
              return 1;
            }
            return 0;
          },
          prompt: "征辟：请选择一项",
          choiceList: choices
        }).forResult();
        index = result3.index;
      }
      let result2;
      if (index === 0) {
        result2 = await player2.chooseTarget({
          prompt: "请选择一名未确定势力的角色",
          filterTarget: (card, player3, target2) => target2 !== player3 && target2.identity === "unknown",
          forced: true
        }).forResult();
      } else {
        result2 = await player2.chooseCardTarget({
          prompt: "请将一张基本牌交给一名已确定势力的其他角色",
          position: "h",
          forced: true,
          filterCard(card) {
            return get.type(card) === "basic";
          },
          filterTarget(card, player3, target2) {
            return target2 !== player3 && target2.identity !== "unknown";
          },
          ai1(card) {
            return 5 - get.value(card);
          },
          ai2(target2) {
            const player3 = _status.event.player;
            const att = get.attitude(player3, target2);
            if (att > 0) {
              return 0;
            }
            return -(att - 1) / target2.countCards("h");
          }
        }).forResult();
      }
      const target = result2.targets[0];
      player2.line(result2.targets, "green");
      if (result2.cards.length) {
        await player2.give(result2.cards, target);
      } else {
        player2.storage.gzzhengbi_eff1 = target;
        player2.addTempSkill("gzzhengbi_eff1", "phaseUseAfter");
        return;
      }
      const returnChoices = [];
      if (target.hasCards("he", { type: ["trick", "delay", "equip"] })) {
        returnChoices.push("一张非基本牌");
      }
      if (target.countCards("h", { type: "basic" }) > 1) {
        returnChoices.push("两张基本牌");
      }
      if (!returnChoices.length) {
        if (target.hasCards("h")) {
          await target.give(target.getCards("h"), player2);
        }
        return;
      }
      const controlResult = await target.chooseControl({
        controls: returnChoices,
        ai: (event3, player3) => {
          if (returnChoices.length > 1) {
            if (player3.hasCards("he", { type: ["trick", "delay", "equip"] })) {
              return 0;
            }
            return 1;
          }
          return 0;
        },
        prompt: `征辟：交给${get.translation(player2)}…</div>`
      }).forResult();
      const check = controlResult.control === "一张非基本牌";
      const cardResult = await target.chooseCard({
        position: "he",
        selectCard: check ? 1 : 2,
        filterCard: { type: check ? ["trick", "delay", "equip"] : "basic" },
        forced: true
      }).forResult();
      if (cardResult.cards) {
        await target.give(cardResult.cards, player2);
      }
    },
    subSkill: {
      eff1: {
        audio: "zhengbi",
        sub: true,
        onremove: true,
        trigger: { player: "phaseUseEnd" },
        forced: true,
        charlotte: true,
        filter(event2, player2) {
          const target = player2.storage.gzzhengbi_eff1;
          return target && !target.isUnseen() && target.hasGainableCards(player2, "he");
        },
        logTarget(event2, player2) {
          return player2.storage.gzzhengbi_eff1;
        },
        async content(event2, trigger, player2) {
          let num = 0;
          const target = player2.storage.gzzhengbi_eff1;
          if (target.hasGainableCards(player2, "h")) {
            num++;
          }
          if (target.hasGainableCards(player2, "e")) {
            num++;
          }
          if (num) {
            await player2.gainPlayerCard({
              target,
              selectButton: num,
              position: "he",
              forced: true,
              filterButton: (button) => !ui.selected.buttons.some((selected) => get.position(button.link) === get.position(selected.link))
            });
          }
        }
      }
    }
  },
  gzfengying: {
    audio: "fengying",
    limited: true,
    enable: "phaseUse",
    position: "h",
    filterCard: true,
    selectCard: -1,
    filter(event2, player2) {
      return !player2.storage.gzfengying && player2.hasCards("h");
    },
    filterTarget(card, player2, target) {
      return target === player2;
    },
    selectTarget: -1,
    discard: false,
    lose: false,
    async content(event2, trigger, player2) {
      const { cards: cards2, target } = event2;
      player2.awakenSkill("gzfengying");
      player2.storage.gzfengying = true;
      await player2.useCard({ card: { name: "xietianzi" }, cards: cards2, targets: [target] });
      const list = game.filterPlayer((current) => current.isFriendOf(player2) && current.countCards("h") < current.maxHp);
      list.sort(lib.sort.seat);
      player2.line(list, "thunder");
      await game.asyncDraw(list, (current) => current.maxHp - current.countCards("h"));
    },
    skillAnimation: "epic",
    animationColor: "gray",
    ai: {
      order: 0.1,
      result: {
        player(player2) {
          let value = 0;
          const cards2 = player2.getCards("h");
          if (cards2.length >= 4) {
            return 0;
          }
          for (const card of cards2) {
            value += Math.max(0, get.value(card, player2, "raw"));
          }
          const targets = game.filterPlayer((current) => current.isFriendOf(player2) && current !== player2);
          let eff = 0;
          for (const target of targets) {
            if (target.countCards("h") >= target.maxHp) {
              continue;
            }
            eff++;
          }
          return 5 * eff - value;
        }
      }
    }
  },
  junling4_eff: {
    mod: {
      cardEnabled2(card) {
        if (get.position(card) === "h") {
          return false;
        }
      }
    },
    mark: true,
    marktext: "令",
    intro: {
      content: "不能使用或打出手牌"
    }
  },
  junling5_eff: {
    trigger: { player: "recoverBefore" },
    priority: 44,
    forced: true,
    silent: true,
    popup: false,
    async content(event2, trigger, player2) {
      trigger.cancel();
    },
    mark: true,
    marktext: "令",
    intro: {
      content: "不能回复体力"
    },
    ai: {
      effect: {
        target(card, player2, target) {
          if (get.tag(card, "recover")) {
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  gzjieyue: {
    trigger: { player: "phaseZhunbeiBegin" },
    filter(event2, player2) {
      return player2.hasCards("h") && game.hasPlayer((current) => {
        return current !== player2 && current.identity !== "wei";
      });
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCardTarget({
        prompt: get.prompt2(event2.skill),
        position: "h",
        filterCard: true,
        filterTarget(card, player3, target) {
          return target.identity !== "wei" && target !== player3;
        },
        ai1(card, player3, target) {
          if (get.attitude(player3, target) > 0) {
            return 11 - get.value(card);
          }
          return 7 - get.value(card);
        },
        ai2(target) {
          const att = get.attitude(get.event().player, target);
          if (att < 0) {
            return -att;
          }
          return 1;
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const giveEvent = player2.give(event2.cards[0], target);
      const junlingEvent = player2.chooseJunlingFor(target);
      await giveEvent;
      const { junling, targets } = await junlingEvent.forResult();
      const choiceList = [`执行该军令，然后${get.translation(player2)}摸一张牌`, `令${get.translation(player2)}摸牌阶段额外摸三张牌`];
      const result2 = await target.chooseJunlingControl(player2, junling, targets).set("prompt", "节钺").set("choiceList", choiceList).set("ai", () => {
        if (get.attitude(target, player2) > 0) {
          return get.junlingEffect(player2, junling, target, targets, target) > 1 ? 0 : 1;
        }
        return get.junlingEffect(player2, junling, target, targets, target) >= -1 ? 0 : 1;
      }).forResult();
      if (result2.index !== 0) {
        player2.addTempSkill("gzjieyue_eff");
        return;
      }
      const carryOutEvent = target.carryOutJunling(player2, junling, targets);
      const drawEvent = player2.draw();
      await carryOutEvent;
      await drawEvent;
    },
    ai: { threaten: 2 },
    subSkill: {
      eff: {
        sub: true,
        trigger: { player: "phaseDrawBegin2" },
        filter(event2, player2) {
          return !event2.numFixed;
        },
        forced: true,
        popup: false,
        async content(event2, trigger, player2) {
          trigger.num += 3;
        }
      }
    },
    audio: ["jieyue", 2],
    audioname2: { gz_jun_caocao: "jianan_jieyue" }
  },
  jianglue: {
    limited: true,
    audio: 2,
    enable: "phaseUse",
    prepare(cards2, player2) {
      const targets = game.filterPlayer((current) => {
        return current.isFriendOf(player2) || current.isUnseen();
      });
      player2.line(targets, "fire");
    },
    async content(event2, trigger, player2) {
      player2.awakenSkill(event2.name);
      player2.addTempSkill("jianglue_count");
      const { junling, targets } = await player2.chooseJunlingFor(player2).set("prompt", "选择一张军令牌，令与你势力相同的其他角色选择是否执行").forResult();
      const players = game.filterPlayer((current) => {
        if (current === player2) {
          return false;
        }
        return current.isFriendOf(player2) || player2.identity !== "ye" && current.isUnseen();
      }).sort(lib.sort.seat);
      const filterName = (name) => {
        return lib.character[name][1] === player2.identity && !get.is.double(name);
      };
      const list = [player2];
      for (const current of players) {
        if (!current.isAlive()) {
          continue;
        }
        let showCharacter = false;
        let choiceList = ["执行该军令，增加1点体力上限，然后回复1点体力", "不执行该军令"];
        const ai = () => {
          if (junling === "junling6" && (current.countCards("h") > 3 || current.countCards("e") > 2)) {
            return 1;
          }
          return junling === "junling5" ? 1 : 0;
        };
        let choose;
        if (current.isFriendOf(player2)) {
          choose = current.chooseJunlingControl(player2, junling, targets).set("prompt", "将略").set("choiceList", choiceList).set("ai", ai);
        } else if ((filterName(current.name1) || filterName(current.name2)) && current.wontYe(player2.identity)) {
          showCharacter = true;
          choiceList[0] = `明置一张武将牌以${choiceList[0]}`;
          choiceList[1] = `不明置武将牌且${choiceList[1]}`;
          choose = current.chooseJunlingControl(player2, junling, targets).set("prompt", "将略").set("choiceList", choiceList).set("ai", ai);
        } else {
          choose = current.chooseJunlingControl(player2, junling, targets).set("prompt", "将略").set("controls", ["ok"]);
        }
        const result2 = await choose.forResult();
        if (result2.index !== 0 || result2.control === "ok") {
          continue;
        }
        if (showCharacter) {
          const names = [];
          if (filterName(current.name1)) {
            names.push("主将");
          }
          if (filterName(current.name2)) {
            names.push("副将");
          }
          let index;
          if (names.length > 1) {
            const selection = await current.chooseControl({
              controls: ["主将", "副将"],
              prompt: "选择并展示一张武将牌，然后执行军令",
              ai: () => {
                const player3 = _status.event.player;
                if (get.character(player3.name1, 3).includes("gzxuanhuo")) {
                  return 0;
                }
                if (get.character(player3.name2, 3).includes("gzxuanhuo")) {
                  return 1;
                }
                return Math.random() > 0.5 ? 0 : 1;
              }
            }).forResult();
            index = selection.index;
          } else {
            index = names[0] === "主将" ? 0 : 1;
          }
          current.showCharacter(index);
        }
        await current.carryOutJunling(player2, junling, targets);
        list.push(current);
      }
      player2.storage.jianglue_count = 0;
      for (const current of list) {
        if (!current.isAlive()) {
          continue;
        }
        await current.gainMaxHp({ forced: true });
        await current.recover();
      }
      if (player2.storage.jianglue_count > 0) {
        await player2.draw(player2.storage.jianglue_count);
      }
    },
    marktext: "略",
    skillAnimation: "epic",
    animationColor: "soil",
    ai: {
      order: 10,
      result: {
        player(player2) {
          if (player2.isUnseen() && player2.wontYe()) {
            if (get.population(player2.group) >= game.players.length / 4) {
              return 1;
            }
            return Math.random() > 0.7 ? 1 : 0;
          } else {
            return 1;
          }
        }
      }
    },
    subSkill: {
      count: {
        sub: true,
        trigger: { global: "recoverAfter" },
        silent: true,
        filter(event2) {
          return event2.getParent("jianglue");
        },
        async content(event2, trigger, player2) {
          player2.storage.jianglue_count++;
        }
      }
    }
  },
  gzxuanhuo: {
    audio: "xinxuanhuo",
    global: "gzxuanhuo_others",
    derivation: ["fz_wusheng", "fz_new_paoxiao", "fz_new_longdan", "fz_new_tieji", "fz_liegong", "fz_xinkuanggu"],
    ai: {
      threaten(player2, target) {
        if (game.hasPlayer((current) => current !== target && current.isFriendOf(target))) {
          return 1.5;
        }
        return 0.5;
      }
    },
    subSkill: {
      others: {
        audio: "xinxuanhuo",
        forceaudio: true,
        enable: "phaseUse",
        usable: 1,
        filter(event2, player2) {
          return !player2.isUnseen() && player2.hasCards("h") && game.hasPlayer((current) => current !== player2 && current.hasSkill("gzxuanhuo") && player2.isFriendOf(current));
        },
        prompt: "弃置一张手牌，然后获得以下技能中的一个：〖武圣〗〖咆哮〗〖龙胆〗〖铁骑〗〖烈弓〗〖狂骨〗",
        position: "h",
        filterCard: true,
        check(card) {
          const player2 = _status.event.player;
          const shas = player2.countCards("h", (cardx) => cardx !== card && cardx.name === "sha" && player2.hasUseTarget(cardx));
          const count = player2.getCardUsable("sha");
          const val = (get.name(card) === "sha" ? 2 : 1) * get.value(card);
          if (!shas || count - shas > 1) {
            return (player2.needsToDiscard() ? 7 : 1) - val;
          }
          return 7 - val;
        },
        async content(event2, trigger, player2) {
          const list = ["gz_wusheng", "gz_paoxiao", "gz_longdan", "gz_tieji", "liegong", "xinkuanggu"];
          const result2 = await player2.chooseControl({
            controls: list,
            prompt: "选择并获得一项技能直到回合结束",
            ai: () => {
              const res = get.event().res;
              if (list.includes(res)) {
                return res;
              }
              return 0;
            }
          }).set(
            "res",
            (() => {
              const shas = player2.mayHaveSha(player2, "use", null, "count");
              const count = player2.getCardUsable("sha");
              if (shas > count) {
                return "gzpaoxiao";
              }
              if (shas < count) {
                return "new_rewusheng";
              }
              if (!shas) {
                return "xinkuanggu";
              }
              return ["new_longdan", "new_tieji", "liegong"].randomGet();
            })()
          ).forResult();
          player2.popup(result2.control);
          const map = {
            gz_wusheng: "fz_wusheng",
            gz_paoxiao: "fz_new_paoxiao",
            gz_longdan: "fz_new_longdan",
            gz_tieji: "fz_new_tieji",
            liegong: "fz_liegong",
            xinkuanggu: "fz_xinkuanggu"
          };
          player2.addTempSkill(map[result2.control]);
          game.log(player2, "获得了技能", `#g【${get.translation(result2.control)}】`);
          await game.delay();
        },
        // forceaudio:true,
        // audio:['xuanhuo',2],
        ai: {
          order: 8,
          result: { player: 1 }
        }
      }
      //used:{},
    }
    // audio:['xuanhuo',2],
  },
  fz_new_paoxiao: {
    audio: true,
    inherit: "gz_paoxiao"
  },
  fz_new_tieji: {
    audio: true,
    inherit: "gz_tieji"
  },
  fz_wusheng: {
    audio: true,
    inherit: "gz_wusheng"
  },
  fz_liegong: {
    audio: true,
    inherit: "liegong"
  },
  fz_xinkuanggu: {
    audio: true,
    inherit: "xinkuanggu"
  },
  fz_new_longdan: {
    audio: true,
    group: ["fz_new_longdan_sha", "fz_new_longdan_shan", "fz_new_longdan_draw", "fz_new_longdan_shamiss", "fz_new_longdan_shanafter"],
    subSkill: {
      shanafter: {
        sub: true,
        audio: "fz_new_longdan",
        trigger: {
          player: "useCard"
        },
        //priority:1,
        filter(event2, player2) {
          return event2.skill === "fz_new_longdan_shan" && event2.getParent(2).name === "sha";
        },
        direct: true,
        async content(event2, trigger, player2) {
          const result2 = await player2.chooseTarget({
            prompt: "是否发动【龙胆】令一名其他角色回复1点体力？",
            filterTarget: (card, player3, target) => target !== _status.event.source && target !== player3 && target.isDamaged(),
            ai: (target) => get.attitude(_status.event.player, target)
          }).set("source", trigger.getParent(2).player).forResult();
          if (result2.bool && result2.targets && result2.targets.length) {
            player2.logSkill("fz_new_longdan", result2.targets[0]);
            await result2.targets[0].recover();
          }
        }
      },
      shamiss: {
        sub: true,
        audio: "fz_new_longdan",
        trigger: {
          player: "shaMiss"
        },
        direct: true,
        filter(event2, player2) {
          return event2.skill === "fz_new_longdan_sha";
        },
        async content(event2, trigger, player2) {
          const result2 = await player2.chooseTarget({
            prompt: "是否发动【龙胆】对一名其他角色造成1点伤害？",
            filterTarget: (card, player3, target) => target !== _status.event.target && target !== player3,
            ai: (target) => -get.attitude(_status.event.player, target)
          }).set("target", trigger.target).forResult();
          if (result2.bool && result2.targets && result2.targets.length) {
            player2.logSkill("fz_new_longdan", result2.targets[0]);
            await result2.targets[0].damage();
          }
        }
      },
      draw: {
        trigger: {
          player: ["useCard", "respond"]
        },
        audio: "fz_new_longdan",
        forced: true,
        locked: false,
        filter(event2, player2) {
          if (!get.zhu(player2, "shouyue")) {
            return false;
          }
          return event2.skill === "fz_new_longdan_sha" || event2.skill === "fz_new_longdan_shan";
        },
        async content(event2, trigger, player2) {
          await player2.draw();
        },
        sub: true
      },
      sha: {
        audio: "fz_new_longdan",
        enable: ["chooseToUse", "chooseToRespond"],
        filterCard: {
          name: "shan"
        },
        viewAs: {
          name: "sha"
        },
        viewAsFilter(player2) {
          if (!player2.hasCards("hs", "shan")) {
            return false;
          }
        },
        prompt: "将一张闪当杀使用或打出",
        position: "hs",
        check() {
          return 1;
        },
        ai: {
          effect: {
            target(card, player2, target, current) {
              if (get.tag(card, "respondSha") && current < 0) {
                return 0.6;
              }
            }
          },
          respondSha: true,
          skillTagFilter(player2) {
            if (!player2.hasCards("hs", "shan")) {
              return false;
            }
          },
          order() {
            return get.order({ name: "sha" }) + 0.1;
          }
        },
        sub: true
      },
      shan: {
        audio: "fz_new_longdan",
        enable: ["chooseToRespond", "chooseToUse"],
        filterCard: {
          name: "sha"
        },
        viewAs: {
          name: "shan"
        },
        position: "hs",
        prompt: "将一张杀当闪使用或打出",
        check() {
          return 1;
        },
        viewAsFilter(player2) {
          if (!player2.hasCards("hs", "sha")) {
            return false;
          }
        },
        ai: {
          respondShan: true,
          skillTagFilter(player2) {
            if (!player2.hasCards("hs", "sha")) {
              return false;
            }
          },
          effect: {
            target(card, player2, target, current) {
              if (get.tag(card, "respondShan") && current < 0) {
                return 0.6;
              }
            }
          }
        },
        sub: true
      }
    }
  },
  gzenyuan: {
    locked: true,
    audio: "xinenyuan",
    group: ["gzenyuan_gain", "gzenyuan_damage"],
    preHidden: true,
    ai: {
      maixie_defend: true,
      effect: {
        target(card, player2, target) {
          if (player2.hasSkillTag("jueqing", false, target)) {
            return [1, -1.5];
          }
          if (!target.hasFriend()) {
            return;
          }
          if (get.tag(card, "damage")) {
            return [1, 0, 0, -0.7];
          }
        }
      }
    },
    subSkill: {
      gain: {
        audio: "xinenyuan",
        trigger: { target: "useCardToTargeted" },
        forced: true,
        filter(event2, player2) {
          return event2.card.name === "tao" && event2.player !== player2;
        },
        logTarget: "player",
        async content(event2, trigger, player2) {
          await trigger.player.draw();
        }
      },
      damage: {
        audio: "xinenyuan",
        trigger: { player: "damageEnd" },
        forced: true,
        filter(event2, player2) {
          return event2.source && event2.source !== player2 && event2.num > 0;
        },
        async content(event2, trigger, player2) {
          player2.logSkill("enyuan_damage", trigger.source);
          const result2 = await trigger.source.chooseCard({
            prompt: `交给${get.translation(player2)}一张手牌，或失去1点体力`,
            position: "h",
            ai: (card) => {
              if (get.attitude(_status.event.player, _status.event.getParent().player) > 0) {
                return 11 - get.value(card);
              }
              return 7 - get.value(card);
            }
          }).forResult();
          if (result2.bool) {
            await trigger.source.give(result2.cards[0], player2, "giveAuto");
          } else {
            await trigger.source.loseHp();
          }
        }
      }
    }
  },
  gzjushou: {
    audio: "xinjushou",
    trigger: {
      player: "phaseJieshuBegin"
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      const list = [];
      const players = game.filterPlayer();
      for (const target of players) {
        if (target.isUnseen()) {
          continue;
        }
        let add = true;
        for (const i of list) {
          if (i.isFriendOf(target)) {
            add = false;
            break;
          }
        }
        if (add) {
          list.add(target);
        }
      }
      const num = list.length;
      const draw = player2.draw(num);
      const turnOver = num > 2 ? player2.turnOver() : null;
      await draw;
      if (turnOver) {
        await turnOver;
      }
      const result2 = await player2.chooseCard({
        position: "h",
        forced: true,
        prompt: "弃置一张手牌，若以此法弃置的是装备牌，则你改为使用之",
        filterCard: lib.filter.cardDiscardable,
        ai(card) {
          if (get.type(card) === "equip") {
            return 5 - get.value(card);
          }
          return -get.value(card);
        }
      }).forResult();
      if (result2.bool && result2.cards.length) {
        const card = result2.cards[0];
        if (get.type(card) === "equip" && player2.hasUseTarget(card)) {
          await player2.chooseUseTarget({ card, forced: true, nopopup: true });
        } else {
          await player2.discard({ cards: [card] });
        }
      }
    }
  },
  new_duanliang: {
    subSkill: {
      off: {
        sub: true
      }
    },
    mod: {
      targetInRange(card, player2, target) {
        if (card.name === "bingliang") {
          return true;
        }
      }
    },
    locked: false,
    audio: "duanliang1",
    audioname2: { gz_jun_caocao: "jianan_duanliang" },
    enable: "chooseToUse",
    filterCard(card) {
      if (get.type(card) !== "basic" && get.type(card) !== "equip") {
        return false;
      }
      return get.color(card) === "black";
    },
    filter(event2, player2) {
      if (player2.hasSkill("new_duanliang_off")) {
        return false;
      }
      return player2.hasCards("hes", { type: ["basic", "equip"], color: "black" });
    },
    position: "hes",
    viewAs: {
      name: "bingliang"
    },
    onuse(result2, player2) {
      if (get.distance(player2, result2.targets[0]) > 2) {
        player2.addTempSkill("new_duanliang_off");
      }
    },
    prompt: "将一黑色的基本牌或装备牌当兵粮寸断使用",
    check(card) {
      return 6 - get.value(card);
    },
    ai: {
      order: 9,
      basic: {
        order: 1,
        useful: 1,
        value: 4
      },
      result: {
        target(player2, target) {
          if (target.hasJudge("caomu")) {
            return 0;
          }
          return -1.5 / Math.sqrt(target.countCards("h") + 1);
        }
      },
      tag: {
        skip: "phaseDraw"
      }
    }
  },
  new_shushen: {
    audio: "shushen",
    trigger: {
      player: "recoverAfter"
    },
    direct: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      let num = trigger.num || 1;
      while (num > 0) {
        const result2 = await player2.chooseTarget({
          prompt: get.prompt2("new_shushen"),
          filterTarget: (_card, player3, target2) => target2 !== player3,
          ai: (target2) => get.attitude(_status.event.player, target2)
        }).setHiddenSkill("new_shushen").forResult();
        if (!result2.bool) {
          return;
        }
        const target = result2.targets[0];
        player2.logSkill("new_shushen", result2.targets);
        await target.draw();
        num--;
      }
    },
    ai: {
      threaten: 0.8,
      expose: 0.1
    }
  },
  new_luanji: {
    audio: "luanji",
    enable: "phaseUse",
    viewAs: {
      name: "wanjian"
    },
    filterCard(card, player2) {
      if (!player2.storage.new_luanji) {
        return true;
      }
      return !player2.storage.new_luanji.includes(get.suit(card));
    },
    selectCard: 2,
    position: "hs",
    filter(event2, player2) {
      return player2.countCards("hs", (card) => {
        return !player2.storage.new_luanji || !player2.storage.new_luanji.includes(get.suit(card));
      }) > 1;
    },
    check(card) {
      const player2 = _status.event.player;
      const targets = game.filterPlayer((current) => {
        return player2.canUse("wanjian", current);
      });
      let num = 0;
      for (const item of targets) {
        let eff = get.sgn(get.effect(item, { name: "wanjian" }, player2, player2));
        if (item.hp === 1) {
          eff *= 1.5;
        }
        num += eff;
      }
      if (!player2.needsToDiscard(-1)) {
        if (targets.length >= 7) {
          if (num < 2) {
            return 0;
          }
        } else if (targets.length >= 5) {
          if (num < 1.5) {
            return 0;
          }
        }
      }
      return 6 - get.value(card);
    },
    group: ["new_luanji_count", "new_luanji_reset", "new_luanji_respond"],
    subSkill: {
      reset: {
        trigger: {
          player: "phaseAfter"
        },
        silent: true,
        filter(event2, player2) {
          return player2.storage.new_luanji ? true : false;
        },
        async content(event2, trigger, player2) {
          delete player2.storage.new_luanji;
        },
        sub: true,
        forced: true,
        popup: false
      },
      count: {
        trigger: {
          player: "useCard"
        },
        silent: true,
        filter(event2) {
          return event2.skill === "new_luanji";
        },
        async content(event2, trigger, player2) {
          if (!player2.storage.new_luanji) {
            player2.storage.new_luanji = [];
          }
          for (const item of trigger.cards) {
            player2.storage.new_luanji.add(get.suit(item));
          }
        },
        sub: true,
        forced: true,
        popup: false
      },
      respond: {
        trigger: {
          global: "respond"
        },
        silent: true,
        filter(event2) {
          if (event2.player.isUnseen()) {
            return false;
          }
          return event2.getParent(2).skill === "new_luanji" && event2.player.isFriendOf(_status.currentPhase);
        },
        async content(event2, trigger, player2) {
          await trigger.player.draw();
        },
        sub: true,
        forced: true,
        popup: false
      }
    }
  },
  new_qingcheng: {
    audio: "qingcheng",
    enable: "phaseUse",
    filter(event2, player2) {
      return player2.hasCards("he", { color: "black" }) && game.hasPlayer((current) => {
        return current !== player2 && !current.isUnseen(2);
      });
    },
    filterCard: {
      color: "black"
    },
    position: "he",
    filterTarget(card, player2, target) {
      if (target === player2) {
        return false;
      }
      return !target.isUnseen(2);
    },
    check(card) {
      return 6 - get.value(card, _status.event.player);
    },
    async content(event2, trigger, player2) {
      let target = event2.target;
      let done = false;
      while (true) {
        let control = "副将";
        if (!get.is.jun(target)) {
          let choice = "主将";
          const skills = lib.character[target.name2][3];
          for (const skill of skills) {
            const info = get.info(skill);
            if (info && info.ai && info.ai.maixie) {
              choice = "副将";
              break;
            }
          }
          if (get.character(target.name, 3).includes("buqu")) {
            choice = "主将";
          } else if (get.character(target.name2, 3).includes("buqu")) {
            choice = "副将";
          }
          const result3 = await player2.chooseControl({
            controls: ["主将", "副将"],
            prompt: `暗置${get.translation(target)}的一张武将牌`,
            ai: () => _status.event.choice
          }).set("choice", choice).forResult();
          control = result3.control;
        }
        const hideEvent = target.hideCharacter(control === "主将" ? 0 : 1);
        target.addTempSkill("qingcheng_ai");
        if (get.type(event2.cards[0]) !== "equip" || done) {
          await hideEvent;
          return;
        }
        const chooseEvent = player2.chooseTarget({
          prompt: "是否暗置一名武将牌均为明置的角色的一张武将牌？",
          filterTarget: (card, player3, target2) => target2 !== player3 && !target2.isUnseen(2),
          ai: (target2) => -get.attitude(_status.event.player, target2)
        });
        await hideEvent;
        const result2 = await chooseEvent.forResult();
        if (!result2.bool || !result2.targets?.length) {
          return;
        }
        player2.line(result2.targets[0], "green");
        done = true;
        target = result2.targets[0];
        event2.target = target;
      }
    },
    ai: {
      order: 8,
      result: {
        target(player2, target) {
          if (target.hp <= 0) {
            return -5;
          }
          if (player2.getStat().skill.new_qingcheng) {
            return 0;
          }
          if (!target.hasSkillTag("maixie")) {
            return 0;
          }
          if (get.attitude(player2, target) >= 0) {
            return 0;
          }
          if (player2.hasCard((card) => {
            return get.tag(card, "damage") && player2.canUse(card, target, true, true);
          })) {
            if (target.maxHp > 3) {
              return -0.5;
            }
            return -1;
          }
          return 0;
        }
      }
    }
  },
  new_kongcheng: {
    group: ["new_kongcheng_gain", "new_kongcheng_got"],
    subSkill: {
      gain: {
        audio: "kongcheng",
        trigger: {
          player: "gainBefore"
        },
        filter(event2, player2) {
          return event2.source && event2.source !== player2 && player2 !== _status.currentPhase && !event2.bySelf && !player2.hasCards("h");
        },
        async content(event2, trigger, player2) {
          trigger.name = "addToExpansion";
          trigger.setContent("addToExpansion");
          trigger.gaintag = ["new_kongcheng"];
          trigger.untrigger();
          trigger.trigger("addToExpansionBefore");
        },
        sub: true,
        forced: true
      },
      got: {
        trigger: {
          player: "phaseDrawBegin1"
        },
        filter(event2, player2) {
          return player2.getExpansions("new_kongcheng").length > 0;
        },
        async content(event2, trigger, player2) {
          await player2.gain({ cards: player2.getExpansions("new_kongcheng"), animate: "draw" });
        },
        sub: true,
        forced: true
      }
    },
    audio: "kongcheng",
    trigger: {
      target: "useCardToTarget"
    },
    forced: true,
    check(event2, player2) {
      return get.effect(event2.target, event2.card, event2.player, player2) < 0;
    },
    filter(event2, player2) {
      return !player2.hasCards("h") && (event2.card.name === "sha" || event2.card.name === "juedou");
    },
    async content(event2, trigger, player2) {
      trigger.getParent().targets.remove(player2);
    },
    ai: {
      effect: {
        target(card, player2, target, current) {
          if (!target.hasCards("h") && (card.name === "sha" || card.name === "juedou")) {
            return "zeroplayertarget";
          }
        }
      }
    },
    intro: {
      markcount: "expansion",
      mark(dialog, storage, player2) {
        const content = player2.getExpansions("new_kongcheng");
        if (content && content.length) {
          if (player2 === game.me || player2.isUnderControl()) {
            dialog.addAuto(content);
          } else {
            return `共有${get.cnNumber(content.length)}张牌`;
          }
        }
      },
      content(storage, player2) {
        const content = player2.getExpansions("new_kongcheng");
        if (content && content.length) {
          if (player2 === game.me || player2.isUnderControl()) {
            return get.translation(content);
          }
          return `共有${get.cnNumber(content.length)}张牌`;
        }
      }
    },
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    }
  },
  new_keji: {
    audio: "keji",
    forced: true,
    trigger: {
      player: "phaseDiscardBegin"
    },
    filter(event2, player2) {
      const list = [];
      player2.getHistory("useCard", (evt) => {
        if (evt.isPhaseUsing(player2)) {
          const color = get.color(evt.card);
          if (color !== "nocolor") {
            list.add(color);
          }
        }
      });
      return list.length <= 1;
    },
    check(event2, player2) {
      return player2.needsToDiscard();
    },
    async content(event2, trigger, player2) {
      player2.addTempSkill("keji_add", "phaseAfter");
    }
  },
  keji_add: {
    charlotte: true,
    mod: {
      maxHandcard(player2, num) {
        return num + 4;
      }
    }
  },
  new_mouduan: {
    trigger: {
      player: "phaseJieshuBegin"
    },
    //priority:2,
    audio: "botu",
    filter(event2, player2) {
      const history = player2.getHistory("useCard");
      const suits = [];
      const types = [];
      for (const item of history) {
        const suit = get.suit(item.card);
        if (suit) {
          suits.add(suit);
        }
        types.add(get.type(item.card));
      }
      return suits.length >= 4 || types.length >= 3;
    },
    check(event2, player2) {
      return player2.canMoveCard(true);
    },
    async content(event2, trigger, player2) {
      await player2.moveCard();
    }
  },
  new_longdan: {
    audio: "longdan_sha",
    audioname2: { gz_jun_liubei: "shouyue_longdan" },
    group: ["new_longdan_sha", "new_longdan_shan", "new_longdan_draw", "new_longdan_shamiss", "new_longdan_shanafter"],
    subSkill: {
      shanafter: {
        sub: true,
        audio: "longdan_sha",
        audioname2: { gz_jun_liubei: "shouyue_longdan" },
        trigger: {
          player: "useCard"
        },
        //priority:1,
        filter(event2, player2) {
          return event2.skill === "new_longdan_shan" && event2.getParent(2).name === "sha";
        },
        direct: true,
        async content(event2, trigger, player2) {
          const result2 = await player2.chooseTarget({
            prompt: "是否发动【龙胆】令一名其他角色回复1点体力？",
            filterTarget: (card, player3, target) => target !== _status.event.source && target !== player3 && target.isDamaged(),
            ai: (target) => get.attitude(_status.event.player, target)
          }).set("source", trigger.getParent(2).player).forResult();
          if (result2.bool && result2.targets && result2.targets.length) {
            player2.logSkill("new_longdan", result2.targets[0]);
            await result2.targets[0].recover();
          }
        }
      },
      shamiss: {
        sub: true,
        audio: "longdan_sha",
        audioname2: { gz_jun_liubei: "shouyue_longdan" },
        trigger: {
          player: "shaMiss"
        },
        direct: true,
        filter(event2, player2) {
          return event2.skill === "new_longdan_sha";
        },
        async content(event2, trigger, player2) {
          const result2 = await player2.chooseTarget({
            prompt: "是否发动【龙胆】对一名其他角色造成1点伤害？",
            filterTarget: (card, player3, target) => target !== _status.event.target && target !== player3,
            ai: (target) => -get.attitude(_status.event.player, target)
          }).set("target", trigger.target).forResult();
          if (result2.bool && result2.targets && result2.targets.length) {
            player2.logSkill("new_longdan", result2.targets[0]);
            await result2.targets[0].damage();
          }
        }
      },
      draw: {
        trigger: {
          player: ["useCard", "respond"]
        },
        audio: "longdan_sha",
        audioname2: { gz_jun_liubei: "shouyue_longdan" },
        forced: true,
        locked: false,
        filter(event2, player2) {
          if (!get.zhu(player2, "shouyue")) {
            return false;
          }
          return event2.skill === "new_longdan_sha" || event2.skill === "new_longdan_shan";
        },
        async content(event2, trigger, player2) {
          await player2.draw();
        },
        sub: true
      },
      sha: {
        audio: "longdan_sha",
        audioname2: { gz_jun_liubei: "shouyue_longdan" },
        enable: ["chooseToUse", "chooseToRespond"],
        filterCard: {
          name: "shan"
        },
        viewAs: {
          name: "sha"
        },
        position: "hs",
        viewAsFilter(player2) {
          if (!player2.hasCards("hs", "shan")) {
            return false;
          }
        },
        prompt: "将一张闪当杀使用或打出",
        check() {
          return 1;
        },
        ai: {
          effect: {
            target(card, player2, target, current) {
              if (get.tag(card, "respondSha") && current < 0) {
                return 0.6;
              }
            }
          },
          respondSha: true,
          skillTagFilter(player2) {
            if (!player2.hasCards("hs", "shan")) {
              return false;
            }
          },
          order() {
            return get.order({ name: "sha" }) + 0.1;
          }
        },
        sub: true
      },
      shan: {
        audio: "longdan_sha",
        audioname2: { gz_jun_liubei: "shouyue_longdan" },
        enable: ["chooseToRespond", "chooseToUse"],
        filterCard: {
          name: "sha"
        },
        viewAs: {
          name: "shan"
        },
        position: "hs",
        prompt: "将一张杀当闪使用或打出",
        check() {
          return 1;
        },
        viewAsFilter(player2) {
          if (!player2.hasCards("hs", "sha")) {
            return false;
          }
        },
        ai: {
          respondShan: true,
          skillTagFilter(player2) {
            if (!player2.hasCards("hs", "sha")) {
              return false;
            }
          },
          effect: {
            target(card, player2, target, current) {
              if (get.tag(card, "respondShan") && current < 0) {
                return 0.6;
              }
            }
          }
        },
        sub: true
      }
    }
  },
  gzpaoxiao: {
    audio: "paoxiao",
    audioname2: { gz_jun_liubei: "shouyue_paoxiao" },
    trigger: {
      player: "useCard"
    },
    filter(event2, player2) {
      if (_status.currentPhase !== player2) {
        return false;
      }
      if (event2.card.name !== "sha") {
        return false;
      }
      const history = player2.getHistory("useCard", (evt) => {
        return evt.card.name === "sha";
      });
      return history && history.indexOf(event2) === 1;
    },
    forced: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      await player2.draw();
    },
    mod: {
      cardUsable(card, player2, num) {
        if (card.name === "sha") {
          return Infinity;
        }
      }
    },
    ai: {
      unequip: true,
      skillTagFilter(player2, tag, arg) {
        if (!get.zhu(player2, "shouyue")) {
          return false;
        }
        if (arg && arg.name === "sha") {
          return true;
        }
        return false;
      }
    }
  },
  new_kurou: {
    audio: "rekurou",
    enable: "phaseUse",
    usable: 1,
    filterCard: true,
    check(card) {
      return 8 - get.value(card);
    },
    position: "he",
    async content(event2, trigger, player2) {
      const loseEvent = player2.loseHp();
      const drawEvent = player2.draw(3);
      player2.addTempSkill("kurou_effect", "phaseAfter");
      await loseEvent;
      await drawEvent;
    },
    ai: {
      order: 8,
      result: {
        player(player2) {
          if (player2.hp <= 2) {
            return !player2.hasCards("h") ? 1 : 0;
          }
          if (player2.hasCards("h", { name: "sha", color: "red" })) {
            return 1;
          }
          return player2.countCards("h") <= player2.hp ? 1 : 0;
        }
      }
    }
  },
  kurou_effect: {
    mod: {
      cardUsable(card, player2, num) {
        if (card.name === "sha") {
          return num + 1;
        }
      }
    }
  },
  new_chuli: {
    audio: "chulao",
    enable: "phaseUse",
    usable: 1,
    filterTarget(card, player2, target) {
      if (player2 === target) {
        return false;
      }
      for (const item of ui.selected.targets) {
        if (item.isFriendOf(target)) {
          return false;
        }
      }
      return target.hasCards("he");
    },
    filter(event2, player2) {
      return player2.hasCards("he");
    },
    filterCard: true,
    position: "he",
    selectTarget: [1, 3],
    check(card) {
      if (get.suit(card) === "spade") {
        return 8 - get.value(card);
      }
      return 5 - get.value(card);
    },
    async contentBefore(event2, trigger, player2) {
      const { cards: cards2 } = event2;
      let evt = event2.getParent();
      evt.draw = [];
      if (get.suit(cards2[0]) === "spade") {
        evt.draw.push(player2);
      }
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      const result2 = await player2.discardPlayerCard({ target, position: "he", forced: true }).forResult();
      if (result2.bool) {
        if (get.suit(result2.cards[0]) === "spade") {
          event2.getParent().draw.push(target);
        }
      }
    },
    async contentAfter(event2, trigger, player2) {
      const list = event2.getParent().draw;
      if (!list.length) {
        return;
      } else {
        await game.asyncDraw(list);
      }
      await game.delay();
    },
    ai: {
      result: {
        target: -1
      },
      tag: {
        discard: 1,
        lose: 1,
        loseCard: 1
      },
      threaten: 1.2,
      order: 3
    }
  },
  baka_hunshang: {
    skillAnimation: true,
    animationColor: "wood",
    audio: "hunzi",
    preHidden: true,
    derivation: ["baka_yingzi", "baka_yinghun"],
    viceSkill: true,
    init(player2) {
      if (player2.checkViceSkill("baka_hunshang") && !player2.viceChanged) {
        player2.removeMaxHp();
      }
    },
    trigger: {
      player: "phaseZhunbeiBegin"
    },
    filter(event2, player2) {
      return player2.hp <= 1;
    },
    forced: true,
    locked: false,
    //priority:3,
    async content(event2, trigger, player2) {
      await player2.addTempSkills(["baka_yingzi", "baka_yinghun"]);
    },
    ai: {
      threaten(player2, target) {
        if (target.hp === 1) {
          return 2;
        }
        return 0.5;
      },
      maixie: true,
      effect: {
        target(card, player2, target) {
          if (!target.hasFriend()) {
            return;
          }
          if (get.tag(card, "damage") === 1 && target.hp === 2 && !target.isTurnedOver() && _status.currentPhase !== target && get.distance(_status.currentPhase, target, "absolute") <= 3) {
            return [0.5, 1];
          }
        }
      }
    }
  },
  baka_yinghun: {
    inherit: "yinghun",
    audio: "yinghun_sunce"
  },
  baka_yingzi: {
    mod: {
      maxHandcardBase(player2, num) {
        return player2.maxHp;
      }
    },
    audio: "reyingzi_sunce",
    trigger: {
      player: "phaseDrawBegin2"
    },
    frequent: true,
    filter(event2) {
      return !event2.numFixed;
    },
    async content(event2, trigger, player2) {
      trigger.num++;
    },
    ai: {
      threaten: 1.3
    }
  },
  gzyiji: {
    audio: "yiji",
    trigger: {
      player: "damageEnd"
    },
    frequent: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      const ordering = game.cardsGotoOrdering(get.cards(2));
      const cards2 = ordering.cards;
      event2.cards = cards2;
      await ordering;
      if (_status.connectMode) {
        game.broadcastAll(() => {
          _status.noclearcountdown = true;
        });
      }
      let givenMap = {};
      while (cards2.length) {
        const links = cards2.length > 1 ? (await player2.chooseCardButton({
          prompt: "遗计：请选择要分配的牌",
          forced: true,
          cards: cards2,
          select: [1, cards2.length],
          ai: () => ui.selected.buttons.length === 0 ? 1 : 0
        }).forResult()).links : cards2.slice();
        cards2.removeArray(links);
        const toGive = links.slice();
        const next = player2.chooseTarget({
          prompt: `选择一名角色获得${get.translation(links)}`,
          forced: true,
          ai: (target) => {
            const att = get.attitude(_status.event.player, target);
            if (_status.event.enemy) {
              return -att;
            }
            return att > 0 ? att / (1 + target.countCards("h")) : att / 100;
          }
        }).set("enemy", get.value(toGive[0], player2, "raw") < 0);
        const result2 = await next.forResult();
        if (result2.targets.length) {
          let id = result2.targets[0].playerid;
          if (!givenMap[id]) {
            givenMap[id] = [];
          }
          givenMap[id].addArray(toGive);
        }
      }
      if (_status.connectMode) {
        game.broadcastAll(() => {
          delete _status.noclearcountdown;
          game.stopCountChoose();
        });
      }
      const list = [];
      for (const id in givenMap) {
        const source = (_status.connectMode ? lib.playerOL : game.playerMap)[id];
        player2.line(source, "green");
        list.push([source, givenMap[id]]);
      }
      await game.loseAsync({
        gain_list: list,
        giver: player2,
        animate: "draw"
      }).setContent("gaincardMultiple");
    },
    ai: {
      maixie: true,
      maixie_hp: true,
      effect: {
        target(card, player2, target) {
          if (get.tag(card, "damage")) {
            if (player2.hasSkillTag("jueqing", false, target)) {
              return [1, -2];
            }
            if (!target.hasFriend()) {
              return;
            }
            let num = 1;
            if (get.attitude(player2, target) > 0) {
              if (player2.needsToDiscard()) {
                num = 0.7;
              } else {
                num = 0.5;
              }
            }
            if (target.hp >= 4) {
              return [1, num * 2];
            }
            if (target.hp === 3) {
              return [1, num * 1.5];
            }
            if (target.hp === 2) {
              return [1, num * 0.5];
            }
          }
        }
      }
    }
  },
  gzjieming: {
    audio: "jieming",
    trigger: {
      player: "damageEnd"
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt(event2.skill),
        prompt2: "令一名角色将手牌补至X张（X为其体力上限且至多为5）",
        filterTarget: () => true,
        ai: (target) => {
          const att = get.attitude(_status.event.player, target);
          if (att > 2) {
            return Math.max(0, Math.min(5, target.maxHp) - target.countCards("h"));
          }
          return att / 3;
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      for (const target of event2.targets) {
        const num = Math.min(5, target.maxHp) - target.countCards("h");
        if (num > 0) {
          await target.draw(num);
        }
      }
    },
    ai: {
      maixie: true,
      maixie_hp: true,
      effect: {
        target(card, player2, target, current) {
          if (get.tag(card, "damage") && target.hp > 1) {
            if (player2.hasSkillTag("jueqing", false, target)) {
              return [1, -2];
            }
            let max = 0;
            const players = game.filterPlayer();
            for (const current2 of players) {
              if (get.attitude(target, current2) > 0) {
                max = Math.max(Math.min(5, current2.hp) - current2.countCards("h"), max);
              }
            }
            switch (max) {
              case 0:
                return 2;
              case 1:
                return 1.5;
              case 2:
                return [1, 2];
              default:
                return [0, max];
            }
          }
          if ((card.name === "tao" || card.name === "caoyao") && target.hp > 1 && target.countCards("h") <= target.hp) {
            return [0, 0];
          }
        }
      }
    }
  },
  gzfangzhu: {
    audio: "fangzhu",
    trigger: {
      player: "damageEnd"
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt2(event2.skill),
        filterTarget: (_card, player3, target) => player3 !== target,
        ai(target) {
          if (target.hasSkillTag("noturn")) {
            return 0;
          }
          const player3 = _status.event.player;
          const attitude = get.attitude(player3, target);
          if (attitude === 0) {
            return 0;
          }
          if (attitude > 0) {
            if (target.isTurnedOver()) {
              return 1e3 - target.countCards("h");
            }
            return -1;
          }
          if (target.isTurnedOver() || player3.getDamagedHp() >= 3) {
            return -1;
          }
          return target.countCards("h") + 1;
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const num = player2.getDamagedHp();
      if (num > 0) {
        const result2 = await target.chooseToDiscard({
          position: "he",
          selectCard: num,
          prompt: `放逐：弃置${get.cnNumber(num)}张牌并失去1点体力`,
          prompt2: `或者点击“取消”不弃牌，改为摸${get.cnNumber(num)}张牌并叠置`,
          ai(card) {
            const player3 = _status.event.player;
            if (player3.isTurnedOver()) {
              return -1;
            }
            return player3.hp * player3.hp - Math.max(1, get.value(card));
          }
        }).forResult();
        if (result2.bool) {
          await target.loseHp();
        } else {
          await target.draw(num);
          await target.turnOver();
        }
        return;
      }
      await target.turnOver();
    },
    ai: {
      maixie: true,
      maixie_hp: true,
      effect: {
        target(card, player2, target) {
          if (get.tag(card, "damage")) {
            if (player2.hasSkillTag("jueqing", false, target)) {
              return [1, -2];
            }
            if (target.hp <= 1) {
              return;
            }
            if (!target.hasFriend()) {
              return;
            }
            let hastarget = false;
            let turnfriend = false;
            const players = game.filterPlayer();
            for (const current of players) {
              if (get.attitude(target, current) < 0 && !current.isTurnedOver()) {
                hastarget = true;
              }
              if (get.attitude(target, current) > 0 && current.isTurnedOver()) {
                hastarget = true;
                turnfriend = true;
              }
            }
            if (get.attitude(player2, target) > 0 && !hastarget) {
              return;
            }
            if (turnfriend || target.hp === target.maxHp) {
              return [0.5, 1];
            }
            if (target.hp > 1) {
              return [1, 0.5];
            }
          }
        }
      }
    }
  },
  fengyin_main: {
    init(player2, skill) {
      player2.addSkillBlocker(skill);
    },
    onremove(player2, skill) {
      player2.removeSkillBlocker(skill);
    },
    charlotte: true,
    skillBlocker(skill, player2) {
      return lib.character[player2.name1][3].includes(skill) && !lib.skill[skill].charlotte && !get.is.locked(skill, player2);
    },
    mark: true,
    marktext: "主",
    intro: {
      content(storage, player2, skill) {
        const list = player2.getSkills(null, null, false).filter((i) => {
          return lib.skill.fengyin_main.skillBlocker(i, player2);
        });
        if (list.length) {
          return `失效技能：${get.translation(list)}`;
        }
        return "无失效技能";
      }
    }
  },
  fengyin_vice: {
    init(player2, skill) {
      player2.addSkillBlocker(skill);
    },
    onremove(player2, skill) {
      player2.removeSkillBlocker(skill);
    },
    charlotte: true,
    skillBlocker(skill, player2) {
      return lib.character[player2.name2][3].includes(skill) && !lib.skill[skill].charlotte && !get.is.locked(skill, player2);
    },
    mark: true,
    marktext: "副",
    intro: {
      content(storage, player2, skill) {
        const list = player2.getSkills(null, null, false).filter((i) => {
          return lib.skill.fengyin_vice.skillBlocker(i, player2);
        });
        if (list.length) {
          return `失效技能：${get.translation(list)}`;
        }
        return "无失效技能";
      }
    }
  },
  new_tieji: {
    audio: "retieji",
    audioname2: { gz_jun_liubei: "shouyue_tieji" },
    trigger: {
      player: "useCardToPlayered"
    },
    check(event2, player2) {
      return get.attitude(player2, event2.target) < 0;
    },
    filter(event2) {
      return event2.card.name === "sha";
    },
    logTarget: "target",
    async content(event2, trigger, player2) {
      const target = trigger.target;
      if (get.zhu(player2, "shouyue")) {
        if (!target.isUnseen(0)) {
          target.addTempSkill("fengyin_main");
        }
        if (!target.isUnseen(1)) {
          target.addTempSkill("fengyin_vice");
        }
      } else {
        const controls = [];
        if (!target.isUnseen(0) && !target.hasSkill("fengyin_main")) {
          controls.push("主将");
        }
        if (!target.isUnseen(1) && !target.hasSkill("fengyin_vice")) {
          controls.push("副将");
        }
        if (controls.length) {
          const control = controls.length === 1 ? controls[0] : (await player2.chooseControl({
            controls,
            prompt: `请选择一个武将牌，令${get.translation(target)}该武将牌上的非锁定技全部失效。`,
            ai: () => {
              for (const skill of lib.character[target.name2][3]) {
                const info = get.info(skill);
                if (info?.ai?.maixie) {
                  return "副将";
                }
              }
              return "主将";
            }
          }).forResult()).control;
          if (control) {
            player2.popup(control, "fire");
            target.addTempSkill(control === "主将" ? "fengyin_main" : "fengyin_vice");
          }
        }
      }
      const judgeResult = await player2.judge({ judge: () => 0 }).forResult();
      const suit = get.suit(judgeResult.card);
      const num = target.countCards("h", "shan");
      const result2 = await target.chooseToDiscard({
        prompt: `请弃置一张${get.translation(suit)}牌，否则不能使用闪抵消此杀`,
        position: "he",
        filterCard: (card) => get.suit(card) === _status.event.suit,
        ai: (card) => {
          const num2 = _status.event.num;
          if (num2 === 0) {
            return 0;
          }
          if (card.name === "shan") {
            return num2 > 1 ? 2 : 0;
          }
          return 8 - get.value(card);
        }
      }).set("num", num).set("suit", suit).forResult();
      if (result2 && !result2.bool) {
        trigger.getParent().directHit.add(target);
      }
    }
  },
  hmkyuanyu: {
    audio: "zongkui",
    trigger: {
      player: "damageBegin4"
    },
    forced: true,
    preHidden: true,
    check(event2, player2) {
      return true;
    },
    filter(event2, player2) {
      if (event2.num <= 0 || !event2.source) {
        return false;
      }
      const n1 = player2.getNext();
      const p1 = player2.getPrevious();
      if (event2.source !== n1 && event2.source !== p1) {
        return true;
      }
    },
    async content(event2, trigger, player2) {
      trigger.cancel();
    },
    ai: {
      effect: {
        target(card, player2, target) {
          if (player2.hasSkillTag("jueqing", false, target)) {
            return;
          }
          if (player2 === target.getNext() || player2 === target.getPrevious()) {
            return;
          }
          if (get.tag(card, "damage")) {
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  hmkguishu: {
    audio: "bmcanshi",
    enable: "phaseUse",
    filter(event2, player2) {
      return player2.hasCards("hs", { suit: "spade" });
    },
    init(player2) {
      if (!player2.storage.hmkguishu) {
        player2.storage.hmkguishu = 0;
      }
    },
    chooseButton: {
      dialog(event2, player2) {
        const list = ["yuanjiao", "zhibi"].map((name) => ["锦囊", "", name]);
        return ui.create.dialog("鬼术", [list, "vcard"]);
      },
      filter(button, player2) {
        const name = button.link[2];
        if (player2.storage.hmkguishu === 1 && name === "yuanjiao") {
          return false;
        }
        if (player2.storage.hmkguishu === 2 && name === "zhibi") {
          return false;
        }
        return lib.filter.filterCard({ name }, player2, _status.event.getParent());
      },
      check(button) {
        const player2 = _status.event.player;
        if (button.link === "yuanjiao") {
          return 3;
        }
        if (button.link === "zhibi") {
          if (player2.countCards("hs", { suit: "spade" }) > 2) {
            return 1;
          }
          return 0;
        }
      },
      backup(links, player2) {
        return {
          audio: "bmcanshi",
          filterCard(card, player3) {
            return get.suit(card) === "spade";
          },
          position: "hs",
          selectCard: 1,
          popname: true,
          ai(card) {
            return 6 - get.value(card);
          },
          viewAs: { name: links[0][2] },
          onuse(result2, player3) {
            player3.logSkill("hmkguishu");
            if (result2.card.name === "yuanjiao") {
              player3.storage.hmkguishu = 1;
            } else {
              player3.storage.hmkguishu = 2;
            }
          }
        };
      },
      prompt(links, player2) {
        return `将一张手牌当作${get.translation(links[0][2])}使用`;
      }
    },
    ai: {
      order: 4,
      result: {
        player(player2) {
          return 2;
        }
      },
      threaten: 1.6
    }
  },
  _mingzhisuodingji: {
    mode: ["guozhan"],
    enable: "phaseUse",
    filter(event2, player2) {
      if (player2.hasSkillTag("nomingzhi", false, null, true)) {
        return false;
      }
      let bool = false;
      const skillm = lib.character[player2.name1][3];
      const skillv = lib.character[player2.name2][3];
      if (player2.isUnseen(0)) {
        for (const skillName of skillm) {
          if (get.is.locked(skillName)) {
            bool = true;
          }
        }
      }
      if (player2.isUnseen(1)) {
        for (const skillName of skillv) {
          if (get.is.locked(skillName)) {
            bool = true;
          }
        }
      }
      return bool;
    },
    popup: false,
    async content(event2, trigger, player2) {
      const choice = [];
      const skillm = lib.character[player2.name1][3];
      const skillv = lib.character[player2.name2][3];
      if (player2.isUnseen(0)) {
        for (const skillName of skillm) {
          if (get.is.locked(skillName) && !choice.includes("明置主将")) {
            choice.push("明置主将");
          }
        }
      }
      if (player2.isUnseen(1)) {
        for (const skillName of skillv) {
          if (get.is.locked(skillName) && !choice.includes("明置副将")) {
            choice.push("明置副将");
          }
        }
      }
      if (choice.length === 2) {
        choice.push("全部明置");
      }
      const result2 = await player2.chooseControl({ controls: choice }).forResult();
      if (result2.control) {
        switch (result2.control) {
          case "取消":
            break;
          case "明置主将":
            player2.showCharacter(0);
            break;
          case "明置副将":
            player2.showCharacter(1);
            break;
          case "全部明置":
            player2.showCharacter(2);
            break;
        }
      }
    },
    ai: {
      order: 11,
      result: {
        player: -99
      }
    }
  },
  /*----分界线----*/
  _viewnext: {
    trigger: {
      global: "gameDrawBefore"
    },
    silent: true,
    popup: false,
    forced: true,
    filter() {
      if (_status.connectMode && !lib.configOL.viewnext) {
        return false;
      } else if (!_status.connectMode && !get.config("viewnext")) {
        return false;
      }
      return game.players.length > 1;
    },
    async content(event2, trigger, player2) {
      const target = player2.getNext();
      await player2.viewCharacter(target, 1);
    }
  },
  _aozhan_judge: {
    trigger: {
      player: "phaseBefore"
    },
    forced: true,
    priority: 22,
    filter(event2, player2) {
      if (get.mode() !== "guozhan") {
        return false;
      }
      if (getGuozhanAozhanMode() == "off") {
        return false;
      }
      if (_status._aozhan) {
        return false;
      }
      if (game.players.length > 4) {
        return false;
      }
      if (game.players.length > 3 && game.players.length + game.dead.length <= 7) {
        return false;
      }
      for (let i = 0; i < game.players.length; i++) {
        for (let j = i + 1; j < game.players.length; j++) {
          if (game.players[i].isFriendOf(game.players[j])) {
            return false;
          }
        }
      }
      return true;
    },
    async content(event2, trigger, player2) {
      let color = get.groupnature(player2.group, "raw");
      if (player2.isUnseen()) {
        color = "fire";
      }
      player2.$fullscreenpop("鏖战模式", color);
      const config = _status.connectMode ? lib.configOL.aozhan : get.config("aozhan");
      const mode = config === true ? "normal" : config === false || config == "off" || config == "disabled" ? "off" : config || "off";
      game.broadcastAll(function(mode2) {
        const getAozhanBox = () => {
          if (!ui.aozhan) ui.aozhan = ui.create.div("", ui.window);
          ui.aozhan.classList.remove("touchinfo", "left");
          ui.aozhan.classList.add("gz-aozhan-box");
          const currentLeft = ui.aozhan.style.left;
          const currentTop = ui.aozhan.style.top;
          ui.aozhan.style.cssText = "position:absolute;z-index:12;left:24px;top:118px;box-sizing:border-box;width:270px;height:auto;min-height:0;padding:0;color:#f5e9cf;text-align:left;line-height:1.45;font-size:14px;font-family:xinwei,serif;text-shadow:0 1px 2px #000,0 0 4px #000;white-space:normal;overflow:visible;pointer-events:auto;cursor:move;user-select:none;touch-action:none;background:transparent;border:0;box-shadow:none;";
          if (currentLeft) ui.aozhan.style.left = currentLeft;
          if (currentTop) ui.aozhan.style.top = currentTop;
          if (!ui.aozhan._gzAozhanDraggable) {
            ui.aozhan._gzAozhanDraggable = true;
            let dragInfo = null;
            const setPosition = (left, top) => {
              const maxLeft = Math.max(0, ui.window.offsetWidth - ui.aozhan.offsetWidth - 4);
              const maxTop = Math.max(0, ui.window.offsetHeight - ui.aozhan.offsetHeight - 4);
              ui.aozhan.style.transition = "none";
              ui.aozhan.style.animation = "none";
              ui.aozhan.style.transform = "none";
              ui.aozhan.style.left = `${Math.max(4, Math.min(maxLeft, left))}px`;
              ui.aozhan.style.top = `${Math.max(4, Math.min(maxTop, top))}px`;
            };
            const saved = (() => {
              try {
                return JSON.parse(localStorage.getItem("jiubian_aozhan_box_position") || "null");
              } catch (e) {
                return null;
              }
            })();
            requestAnimationFrame(() => {
              if (saved && typeof saved.left == "number" && typeof saved.top == "number") {
                setPosition(saved.left, saved.top);
              }
            });
            const stopDrag = () => {
              document.removeEventListener("pointermove", onMove);
              document.removeEventListener("pointerup", onUp);
              document.removeEventListener("pointercancel", stopDrag);
            };
            const onMove = (e) => {
              if (!dragInfo) return;
              setPosition(dragInfo.left + e.clientX - dragInfo.x, dragInfo.top + e.clientY - dragInfo.y);
              e.preventDefault();
              e.stopPropagation();
            };
            const onUp = (e) => {
              if (!dragInfo) return;
              dragInfo = null;
              stopDrag();
              ui.aozhan.releasePointerCapture?.(e.pointerId);
              try {
                localStorage.setItem(
                  "jiubian_aozhan_box_position",
                  JSON.stringify({ left: parseFloat(ui.aozhan.style.left) || 0, top: parseFloat(ui.aozhan.style.top) || 0 })
                );
              } catch (e2) {
              }
              e.preventDefault();
              e.stopPropagation();
            };
            ui.aozhan.addEventListener("pointerdown", (e) => {
              if (e.button && e.button != 0) return;
              ui.aozhan.setPointerCapture?.(e.pointerId);
              ui.aozhan.style.transition = "none";
              ui.aozhan.style.animation = "none";
              ui.aozhan.style.transform = "none";
              dragInfo = {
                x: e.clientX,
                y: e.clientY,
                left: parseFloat(ui.aozhan.style.left) || ui.aozhan.offsetLeft,
                top: parseFloat(ui.aozhan.style.top) || ui.aozhan.offsetTop
              };
              document.addEventListener("pointermove", onMove);
              document.addEventListener("pointerup", onUp);
              document.addEventListener("pointercancel", stopDrag);
              e.preventDefault();
              e.stopPropagation();
            });
          }
          return ui.aozhan;
        };
        const setInfo = (name) => {
          if (ui.gzAozhanRefresh) clearInterval(ui.gzAozhanRefresh);
          delete ui.gzAozhanRefresh;
          if (ui.gzAozhanMask) ui.gzAozhanMask.delete();
          if (ui.gzAozhanEventInfo) ui.gzAozhanEventInfo.delete();
          const node = getAozhanBox();
          const title = name ? get.translation(name) : "未翻开";
          const info = name ? lib.translate[name + "_info"] || "" : "";
          ui.aozhan.style.display = "";
          ui.aozhan.style.visibility = "";
          node.innerHTML = '<div style="position:static;margin:0 0 6px 0;font-weight:bold;color:#ffe0a0;text-align:center;line-height:1.35;">场景牌：' + title + "</div>" + (info ? '<div style="position:static;margin-top:5px;font-size:13px;line-height:1.45;white-space:normal;">' + info + "</div>" : "");
        };
        _status._aozhan = true;
        _status._aozhanMode = mode2;
        getAozhanBox().innerHTML = '<div style="position:static;margin:0;font-weight:bold;color:#ffe0a0;text-align:center;line-height:1.35;">' + (mode2 == "jiubian" ? "九变鏖战" : "鏖战模式") + "</div>";
        if (mode2 == "jiubian" || _status.gzAozhanCurrentEvent) {
          setInfo(_status.gzAozhanCurrentEvent);
        }
        if (ui.time3) {
          ui.time3.style.display = "none";
        }
        ui.aozhanInfo = ui.create.system(mode2 == "jiubian" ? "九变鏖战" : "鏖战模式", null, true);
        lib.setPopped(
          ui.aozhanInfo,
          () => {
            var uiintro = ui.create.dialog("hidden");
            uiintro.add(mode2 == "jiubian" ? "九变鏖战" : "鏖战模式");
            var list = ["当游戏中仅剩四名或更少角色时（七人以下游戏时改为三名或更少），若此时全场没有超过一名势力相同的角色，则从一个新的回合开始，游戏进入鏖战模式直至游戏结束。"];
            if (mode2 == "jiubian") {
              list.push("在九变鏖战下，任何角色均不是非转化的【桃】的合法目标。【桃】可以被当做【酒】使用或打出。");
              list.push("每轮开始时，翻开一张鏖战事件牌并执行对应效果。事件牌堆全部翻开后，重新洗混。");
            } else {
              list.push("在鏖战模式下，【桃】只能当做【杀】或【闪】使用或打出，不能用来回复体力。");
            }
            list.push("进入鏖战模式后，即使之后有两名或者更多势力相同的角色出现，仍然不会取消鏖战模式。");
            var intro = '<ul style="text-align:left;margin-top:0;width:450px">';
            for (var i = 0; i < list.length; i++) {
              intro += "<li>" + list[i];
            }
            intro += "</ul>";
            uiintro.add(`<div class="text center">${intro}</div>`);
            let ul = uiintro.querySelector("ul");
            if (ul) {
              ul.style.width = "180px";
            }
            uiintro.add(ui.create.div(".placeholder"));
            return uiintro;
          },
          250
        );
        game.playBackgroundMusic();
        if (mode2 == "jiubian") {
          lib.init.sheet(`
						.card[data-card-name = "tao"]>.image {
							background-image: url(${lib.assetURL}image/card/jiu.png) !important;
						}
					`);
        }
      }, mode);
      game.addGlobalSkill(mode == "jiubian" ? "aozhan_jiubian" : "aozhan");
      if (mode == "jiubian") {
        lib.skill._aozhan_event_round.initEvents();
      }
    }
  },
  _aozhan_event_round: {
    ruleSkill: true,
    trigger: { global: "roundStart" },
    forced: true,
    popup: false,
    filter(event2) {
      return isJiubianAozhan() && !event2._aozhan_event_round_effected;
    },
    initEvents: initGuozhanAozhanEvents,
    drawEvent: drawGuozhanAozhanEvent,
    isEvent: isGuozhanAozhanEvent,
    getTreasureCards: getGuozhanAozhanTreasureCards,
    async content(event2, trigger, player2) {
      if (trigger._aozhan_event_round_effected) return;
      trigger._aozhan_event_round_effected = true;
      const name = lib.skill._aozhan_event_round.drawEvent();
      if (!name) {
        return;
      }
      game.log("鏖战事件", "#y" + get.translation(name));
      game.broadcastAll((name2) => {
        const eventInfo = lib.translate[name2 + "_info"] || "";
        const getAozhanBox = () => {
          if (!ui.aozhan) ui.aozhan = ui.create.div("", ui.window);
          ui.aozhan.classList.remove("touchinfo", "left");
          ui.aozhan.classList.add("gz-aozhan-box");
          const currentLeft = ui.aozhan.style.left;
          const currentTop = ui.aozhan.style.top;
          ui.aozhan.style.cssText = "position:absolute;z-index:12;left:24px;top:118px;box-sizing:border-box;width:270px;height:auto;min-height:0;padding:0;color:#f5e9cf;text-align:left;line-height:1.45;font-size:14px;font-family:xinwei,serif;text-shadow:0 1px 2px #000,0 0 4px #000;white-space:normal;overflow:visible;pointer-events:auto;cursor:move;user-select:none;touch-action:none;background:transparent;border:0;box-shadow:none;";
          if (currentLeft) ui.aozhan.style.left = currentLeft;
          if (currentTop) ui.aozhan.style.top = currentTop;
          if (!ui.aozhan._gzAozhanDraggable) {
            ui.aozhan._gzAozhanDraggable = true;
            let dragInfo = null;
            const setPosition = (left, top) => {
              const maxLeft = Math.max(0, ui.window.offsetWidth - ui.aozhan.offsetWidth - 4);
              const maxTop = Math.max(0, ui.window.offsetHeight - ui.aozhan.offsetHeight - 4);
              ui.aozhan.style.transition = "none";
              ui.aozhan.style.animation = "none";
              ui.aozhan.style.transform = "none";
              ui.aozhan.style.left = `${Math.max(4, Math.min(maxLeft, left))}px`;
              ui.aozhan.style.top = `${Math.max(4, Math.min(maxTop, top))}px`;
            };
            const saved = (() => {
              try {
                return JSON.parse(localStorage.getItem("jiubian_aozhan_box_position") || "null");
              } catch (e) {
                return null;
              }
            })();
            requestAnimationFrame(() => {
              if (saved && typeof saved.left == "number" && typeof saved.top == "number") {
                setPosition(saved.left, saved.top);
              }
            });
            const stopDrag = () => {
              document.removeEventListener("pointermove", onMove);
              document.removeEventListener("pointerup", onUp);
              document.removeEventListener("pointercancel", stopDrag);
            };
            const onMove = (e) => {
              if (!dragInfo) return;
              setPosition(dragInfo.left + e.clientX - dragInfo.x, dragInfo.top + e.clientY - dragInfo.y);
              e.preventDefault();
              e.stopPropagation();
            };
            const onUp = (e) => {
              if (!dragInfo) return;
              dragInfo = null;
              stopDrag();
              ui.aozhan.releasePointerCapture?.(e.pointerId);
              try {
                localStorage.setItem("jiubian_aozhan_box_position", JSON.stringify({ left: parseFloat(ui.aozhan.style.left) || 0, top: parseFloat(ui.aozhan.style.top) || 0 }));
              } catch (e2) {
              }
              e.preventDefault();
              e.stopPropagation();
            };
            ui.aozhan.addEventListener("pointerdown", (e) => {
              if (e.button && e.button != 0) return;
              ui.aozhan.setPointerCapture?.(e.pointerId);
              ui.aozhan.style.transition = "none";
              ui.aozhan.style.animation = "none";
              ui.aozhan.style.transform = "none";
              dragInfo = {
                x: e.clientX,
                y: e.clientY,
                left: parseFloat(ui.aozhan.style.left) || ui.aozhan.offsetLeft,
                top: parseFloat(ui.aozhan.style.top) || ui.aozhan.offsetTop
              };
              document.addEventListener("pointermove", onMove);
              document.addEventListener("pointerup", onUp);
              document.addEventListener("pointercancel", stopDrag);
              e.preventDefault();
              e.stopPropagation();
            });
          }
          return ui.aozhan;
        };
        const setInfo = (name3) => {
          if (ui.gzAozhanRefresh) clearInterval(ui.gzAozhanRefresh);
          delete ui.gzAozhanRefresh;
          if (ui.gzAozhanMask) ui.gzAozhanMask.delete();
          if (ui.gzAozhanEventInfo) ui.gzAozhanEventInfo.delete();
          const node = getAozhanBox();
          ui.aozhan.style.display = "";
          ui.aozhan.style.visibility = "";
          node.innerHTML = '<div style="position:static;margin:0 0 6px 0;font-weight:bold;color:#ffe0a0;text-align:center;line-height:1.35;">场景牌：' + get.translation(name3) + "</div>" + (eventInfo ? '<div style="position:static;margin-top:5px;font-size:13px;line-height:1.45;white-space:normal;">' + eventInfo + "</div>" : "");
        };
        if (ui.aozhanInfo) {
          ui.aozhanInfo.innerHTML = get.translation(name2);
        }
        if (ui.aozhan) {
          ui.aozhan.style.display = "";
        }
        setInfo(name2);
      }, name);
      await game.delayx();
      if (name == "_aozhan_event_luoshi") {
        const targets = game.filterPlayer((current) => current.isAlive() && !current.isUnseen());
        for (const target of targets) {
          await target.changeVice().set("repeat", true);
        }
      }
    }
  },
  _aozhan_event_bujinzetui_effect: {
    ruleSkill: true,
    trigger: { global: "phaseJieshuBegin" },
    forced: true,
    filter(event2, player2) {
      return lib.skill._aozhan_event_round.isEvent("_aozhan_event_bujinzetui") && event2.player.isAlive() && !event2.player.hasHistory("sourceDamage") && !event2._aozhan_event_bujinzetui_effected;
    },
    async content(event2, trigger, player2) {
      if (trigger._aozhan_event_bujinzetui_effected) return;
      trigger._aozhan_event_bujinzetui_effected = true;
      await trigger.player.loseHp();
    }
  },
  _aozhan_event_shengzheweiwang_effect: {
    ruleSkill: true,
    trigger: { global: "dieAfter" },
    forced: true,
    filter(event2, player2) {
      return lib.skill._aozhan_event_round.isEvent("_aozhan_event_shengzheweiwang") && event2.source && event2.source.isAlive() && !event2._aozhan_event_shengzheweiwang_effected;
    },
    async content(event2, trigger, player2) {
      if (trigger._aozhan_event_shengzheweiwang_effected) return;
      trigger._aozhan_event_shengzheweiwang_effected = true;
      trigger.source.addMark("_aozhan_event_shengzheweiwang_mark", 1, false);
      game.log(trigger.source, "的摸牌阶段摸牌数", "#g+3");
    }
  },
  _aozhan_event_shengzheweiwang_draw: {
    ruleSkill: true,
    trigger: { player: "phaseDrawBegin2" },
    forced: true,
    filter(event2, player2) {
      return !event2.numFixed && player2.countMark("_aozhan_event_shengzheweiwang_mark") > 0 && !event2._aozhan_event_shengzheweiwang_draw_effected;
    },
    async content(event2, trigger, player2) {
      if (trigger._aozhan_event_shengzheweiwang_draw_effected) return;
      trigger._aozhan_event_shengzheweiwang_draw_effected = true;
      trigger.num += 3 * player2.countMark("_aozhan_event_shengzheweiwang_mark");
    }
  },
  _aozhan_event_jili_effect: {
    ruleSkill: true,
    mod: {
      cardUsable(card) {
        if (lib.skill._aozhan_event_round.isEvent("_aozhan_event_jili") && card.name == "sha") {
          return Infinity;
        }
      },
      targetInRange(card) {
        if (lib.skill._aozhan_event_round.isEvent("_aozhan_event_jili") && card.name == "sha") {
          return true;
        }
      }
    }
  },
  _aozhan_event_huoqi_effect: {
    ruleSkill: true,
    trigger: { global: "damageBegin1" },
    forced: true,
    filter() {
      return lib.skill._aozhan_event_round.isEvent("_aozhan_event_huoqi");
    },
    async content(event2, trigger, player2) {
      if (trigger._aozhan_event_huoqi_effected) return;
      trigger._aozhan_event_huoqi_effected = true;
      trigger.num++;
    },
    ai: {
      effect: {
        target(card) {
          if (lib.skill._aozhan_event_round.isEvent("_aozhan_event_huoqi") && get.tag(card, "damage")) {
            return [1, -1];
          }
        }
      }
    }
  },
  _aozhan_event_jianli_effect: {
    ruleSkill: true,
    trigger: { player: "phaseDrawBegin1" },
    filter(event2, player2) {
      return lib.skill._aozhan_event_round.isEvent("_aozhan_event_jianli") && lib.skill._aozhan_event_round.getTreasureCards().length > 0 && !event2._aozhan_event_jianli_effected;
    },
    async cost(event2, trigger, player2) {
      trigger._aozhan_event_jianli_effected = true;
      event2.result = await player2.chooseBool({ prompt: "是否跳过摸牌阶段，获得弃牌堆中至多两张奇珍牌？" }).set("ai", () => true).forResult();
    },
    async content(event2, trigger, player2) {
      if (trigger._aozhan_event_jianli_done) return;
      trigger._aozhan_event_jianli_done = true;
      trigger.cancel();
      game.log(player2, "跳过了", "#y摸牌阶段");
      const cards2 = lib.skill._aozhan_event_round.getTreasureCards();
      if (!cards2.length) {
        return;
      }
      const result2 = await player2.chooseCardButton({ prompt: "贱礼：获得弃牌堆中至多两张奇珍牌", cards: cards2, select: [1, Math.min(2, cards2.length)] }).set("ai", (button) => get.value(button.link)).forResult();
      if (result2.bool) {
        await player2.gain({ cards: result2.links, animate: "gain2" });
      }
    }
  },
  _guozhan_marks: {
    ruleSkill: true,
    enable: "phaseUse",
    filter(event2, player2) {
      return ["yexinjia", "xianqu", "yinyang", "zhulianbihe"].some((mark) => player2.hasMark(`${mark}_mark`));
    },
    chooseButton: {
      dialog(event2, player2) {
        return ui.create.dialog("###国战标记###弃置一枚对应的标记，发动其对应的效果");
      },
      chooseControl(event2, player2) {
        const list = [];
        const bool = player2.hasMark("yexinjia_mark");
        if (bool || player2.hasMark("xianqu_mark")) {
          list.push("先驱");
        }
        if (bool || player2.hasMark("zhulianbihe_mark")) {
          list.push("珠联(摸牌)");
          if (event2.filterCard({ name: "tao", isCard: true }, player2, event2)) {
            list.push("珠联(桃)");
          }
        }
        if (bool || player2.hasMark("yinyang_mark")) {
          list.push("阴阳鱼");
        }
        list.push("cancel2");
        return list;
      },
      check() {
        const player2 = get.player();
        const bool = player2.hasMark("yexinjia_mark");
        const evt = get.event().getParent();
        if ((bool || player2.hasMark("xianqu_mark")) && !player2.hasSkillTag("keepXianqu", false, null, true) && 4 - player2.countCards("h") > 1) {
          return "先驱";
        }
        if (bool || player2.hasMark("zhulianbihe_mark")) {
          if (evt.filterCard({ name: "tao", isCard: true }, player2, evt) && get.effect_use(player2, { name: "tao" }, player2) > 0) {
            return "珠联(桃)";
          }
          if (player2.getHandcardLimit() - player2.countCards("h") > 1 && !game.hasPlayer((current) => {
            return current !== player2 && current.isFriendOf(player2) && current.hp + current.countCards("h", "shan") <= 2;
          })) {
            return "珠联(摸牌)";
          }
        }
        if (player2.hasMark("yinyang_mark") && player2.getHandcardLimit() - player2.countCards("h") > 0) {
          return "阴阳鱼";
        }
        return "cancel2";
      },
      backup(result2, player2) {
        switch (result2.control) {
          case "珠联(桃)":
            return get.copy(lib.skill._zhulianbihe_mark_tao);
          case "珠联(摸牌)":
            return {
              async content(event2, trigger, player3) {
                await player3.draw(2);
                player3.removeMark(player3.hasMark("zhulianbihe_mark") ? "zhulianbihe_mark" : "yexinjia_mark", 1);
              }
            };
          case "阴阳鱼":
            return {
              async content(event2, trigger, player3) {
                await player3.draw();
                player3.removeMark(player3.hasMark("yinyang_mark") ? "yinyang_mark" : "yexinjia_mark", 1);
              }
            };
          case "先驱":
            return { content: lib.skill.xianqu_mark.content };
        }
      }
    },
    ai: {
      order: 1,
      result: { player: 1 }
    }
  },
  xianqu_mark: {
    intro: { content: "◇出牌阶段，你可以弃置此标记，然后将手牌摸至四张并观看一名其他角色的一张武将牌。" },
    async content(event2, trigger, player2) {
      player2.removeMark(player2.hasMark("xianqu_mark") ? "xianqu_mark" : "yexinjia_mark", 1);
      await player2.drawTo(4);
      if (game.hasPlayer((current) => {
        return current !== player2 && current.isUnseen(2);
      })) {
        let result2 = await player2.chooseTarget({
          prompt: "是否观看一名其他角色的一张暗置武将牌？",
          filterTarget: (card, player3, target) => {
            return target !== player3 && target.isUnseen(2);
          },
          ai: (target) => {
            const player3 = get.player();
            if (target.isUnseen()) {
              const next = player3.getNext();
              if (target !== next) {
                return 10;
              }
              return 9;
            }
            return -get.attitude(player3, target);
          }
        }).forResult();
        if (result2?.bool && result2?.targets?.length) {
          const [target] = result2.targets;
          const controls = [];
          if (target.isUnseen(0)) {
            controls.push("主将");
          }
          if (target.isUnseen(1)) {
            controls.push("副将");
          }
          if (!controls.length) {
            return;
          }
          player2.line(target, "green");
          result2 = controls.length === 1 ? { control: controls[0] } : await player2.chooseControl({ controls }).forResult();
          if (!result2?.control) {
            return;
          }
          await player2.viewCharacter(target, result2.control === "主将" ? 0 : 1);
        } else {
          player2.removeSkill("xianqu_mark");
        }
      }
    }
  },
  zhulianbihe_mark: {
    intro: { content: "◇出牌阶段，你可以弃置此标记，然后摸两张牌。<br>◇你可以将此标记当做【桃】使用。" }
  },
  yinyang_mark: {
    intro: { content: "◇出牌阶段，你可以弃置此标记，然后摸一张牌。<br>◇弃牌阶段，你可以弃置此标记，然后本回合手牌上限+2。" }
  },
  _zhulianbihe_mark_tao: {
    ruleSkill: true,
    enable: "chooseToUse",
    viewAsFilter(player2) {
      return ["yexinjia_mark", "zhulianbihe_mark"].some((mark) => player2.hasMark(mark));
    },
    viewAs: {
      name: "tao",
      isCard: true
    },
    filterCard: () => false,
    selectCard: -1,
    async precontent(event2, trigger, player2) {
      player2.removeMark(player2.hasMark("zhulianbihe_mark") ? "zhulianbihe_mark" : "yexinjia_mark", 1);
    }
  },
  _yinyang_mark_add: {
    ruleSkill: true,
    trigger: { player: "phaseDiscardBegin" },
    filter(event2, player2) {
      return ["yexinjia_mark", "yinyang_mark"].some((mark) => player2.hasMark(mark)) && player2.needsToDiscard();
    },
    prompt(event2, player2) {
      return `是否弃置一枚【${player2.hasMark("yinyang_mark") ? "阴阳鱼" : "野心家"}】标记，使本回合的手牌上限+2？`;
    },
    async content(event2, trigger, player2) {
      player2.addTempSkill("yinyang_add", "phaseAfter");
      player2.removeMark(player2.hasMark("yinyang_mark") ? "yinyang_mark" : "yexinjia_mark", 1);
    }
  },
  yinyang_add: {
    charlotte: true,
    mod: {
      maxHandcard(player2, num) {
        return num + 2;
      }
    }
  },
  yexinjia_mark: {
    intro: {
      content: "◇你可以弃置此标记，并发动【先驱】标记或【珠联璧合】标记或【阴阳鱼】标记的效果。"
    }
  },
  yexinjia_friend: {
    marktext: "盟",
    intro: {
      name: "结盟",
      content: "已经与$结成联盟"
    }
  },
  /*----分界线----*/
  _lianheng: {
    mode: ["guozhan"],
    enable: "phaseUse",
    usable: 1,
    prompt: "将至多三张可合纵的牌交给一名与你势力不同的角色，或未确定势力的角色，若你交给与你势力不同的角色，则你摸等量的牌",
    filter(event2, player2) {
      return player2.hasCard((card) => card.hasTag("lianheng") || card.hasGaintag("_lianheng"), "h");
    },
    filterCard(card) {
      if (get.itemtype(card) !== "card") {
        return false;
      }
      return card.hasTag("lianheng") || card.hasGaintag("_lianheng");
    },
    filterTarget(card, player2, target) {
      if (target === player2) {
        return false;
      }
      if (player2.isUnseen()) {
        return target.isUnseen();
      }
      return !target.isFriendOf(player2);
    },
    check(card) {
      if (card.name === "tao") {
        return 0;
      }
      return 7 - get.value(card);
    },
    selectCard: [1, 3],
    discard: false,
    lose: false,
    delay: false,
    async content(event2, trigger, player2) {
      const { cards: cards2, target } = event2;
      await player2.give(cards2, target);
      if (!target.isUnseen()) {
        await player2.draw(cards2.length);
      }
    },
    ai: {
      basic: {
        order: 8
      },
      result: {
        player(player2, target) {
          const huoshao = ui.selected.cards.some((card) => card.name === "huoshaolianying");
          if (huoshao && player2.inline(target.getNext())) {
            return -3;
          }
          if (target.isUnseen()) {
            return 0;
          }
          if (player2.isMajor()) {
            return 0;
          }
          if (!player2.isMajor() && huoshao && player2.getNext().isMajor()) {
            return -2;
          }
          if (!player2.isMajor() && huoshao && player2.getNext().isMajor() && player2.getNext().getNext().isMajor()) {
            return -3;
          }
          if (!player2.isMajor() && huoshao && !target.isMajor() && target.getNext().isMajor() && target.getNext().getNext().isMajor()) {
            return 3;
          }
          if (!player2.isMajor() && huoshao && !target.isMajor() && target.getNext().isMajor()) {
            return 1.5;
          }
          return 1;
        },
        target(player2, target) {
          if (target.isUnseen()) {
            return 0;
          }
          return 1;
        }
      }
    }
  },
  qianhuan: {
    group: ["qianhuan_add", "qianhuan_use"],
    intro: {
      content: "expansion",
      markcount: "expansion"
    },
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (!cards2.length) {
        return;
      }
      player2.loseToDiscardpile({ cards: cards2 });
    },
    ai: {
      threaten: 1.8
    },
    audio: 2,
    preHidden: true,
    subSkill: {
      add: {
        audio: "qianhuan",
        trigger: { global: "damageEnd" },
        filter(event2, player2) {
          const suits = [];
          for (const card of player2.getExpansions("qianhuan")) {
            suits.add(get.suit(card));
          }
          if (suits.length >= lib.suit.length) {
            return false;
          }
          return player2.isFriendOf(event2.player) && player2.hasCard((card) => {
            if (_status.connectMode && get.position(card) === "h") {
              return true;
            }
            return !suits.includes(get.suit(card));
          }, "he");
        },
        async cost(event2, trigger, player2) {
          const suits = [];
          for (const card of player2.getExpansions("qianhuan")) {
            suits.add(get.suit(card));
          }
          event2.result = await player2.chooseCard({
            position: "he",
            prompt: get.prompt2("qianhuan"),
            filterCard: (card) => !get.event().suits.includes(get.suit(card)),
            ai: (card) => 9 - get.value(card)
          }).set("suits", suits).setHiddenSkill("qianhuan").forResult();
        },
        async content(event2, trigger, player2) {
          const card = event2.cards[0];
          await player2.addToExpansion({
            cards: [card],
            source: player2,
            animate: "give",
            gaintag: ["qianhuan"]
          });
        }
      },
      use: {
        audio: "qianhuan",
        trigger: { global: "useCardToTarget" },
        filter(event2, player2) {
          if (!["basic", "trick"].includes(get.type(event2.card, "trick"))) {
            return false;
          }
          return event2.target && player2.isFriendOf(event2.target) && event2.targets.length === 1 && player2.getExpansions("qianhuan").length;
        },
        logTarget: "player",
        async cost(event2, trigger, player2) {
          let goon = get.effect(trigger.target, trigger.card, trigger.player, player2) < 0;
          if (goon) {
            if (["tiesuo", "diaohulishan", "lianjunshengyan", "zhibi", "chiling", "lulitongxin"].includes(trigger.card.name)) {
              goon = false;
            } else if (trigger.card.name === "sha") {
              if (trigger.target.mayHaveShan(player2, "use") || trigger.target.hp >= 3) {
                goon = false;
              }
            } else if (trigger.card.name === "guohe") {
              if (trigger.target.countCards("he") >= 3 || !trigger.target.hasCards("h")) {
                goon = false;
              }
            } else if (trigger.card.name === "shuiyanqijunx") {
              if (trigger.target.countCards("e") <= 1 || trigger.target.hp >= 3) {
                goon = false;
              }
            } else if (get.tag(trigger.card, "damage") && trigger.target.hp >= 3) {
              goon = false;
            }
          }
          const result2 = await player2.chooseButton({
            createDialog: [get.prompt("qianhuan"), `<div class="text center">移去一张“千幻”牌令${get.translation(trigger.player)}对${get.translation(trigger.target)}的${get.translation(trigger.card)}失效</div>`, player2.getExpansions("qianhuan")],
            ai: () => _status.event.goon ? 1 : 0
          }).set("goon", goon).forResult();
          event2.result = {
            bool: result2.bool,
            cost_data: result2.links
          };
        },
        async content(event2, trigger, player2) {
          trigger.getParent().targets.remove(trigger.target);
          await player2.loseToDiscardpile({ cards: event2.cost_data });
        }
      }
    }
  },
  gzsanyao: {
    audio: "sanyao",
    inherit: "sanyao",
    filterTarget(card, player2, target) {
      return target.hp > player2.hp || target.countCards("h") > player2.countCards("h");
    }
  },
  gzzhiman: {
    audio: "zhiman",
    inherit: "zhiman",
    preHidden: true,
    async content(event2, trigger, player2) {
      const gainEvent = trigger.player.hasGainableCards(player2, "ej") ? player2.gainPlayerCard({ target: trigger.player, position: "ej", forced: true }) : null;
      trigger.cancel();
      const changeEvent = player2.isFriendOf(trigger.player) ? trigger.player.mayChangeVice() : null;
      await gainEvent;
      await changeEvent;
    }
  },
  gzdiancai: {
    audio: "diancai",
    trigger: {
      global: "phaseUseEnd"
    },
    filter(event2, player2) {
      if (_status.currentPhase === player2) {
        return false;
      }
      let num = 0;
      player2.getHistory("lose", (evt) => {
        if (evt.cards2 && evt.getParent("phaseUse") === event2) {
          num += evt.cards2.length;
        }
      });
      return num >= player2.hp;
    },
    preHidden: true,
    async content(event2, trigger, player2) {
      const num = player2.maxHp - player2.countCards("h");
      if (num > 0) {
        await player2.draw(num);
      }
      await player2.mayChangeVice();
    }
  },
  xuanlve: {
    audio: 2,
    audioname2: { boss_lvbu3: "olxuanfeng" },
    trigger: {
      player: "loseAfter",
      global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"]
    },
    preHidden: true,
    filter(event2, player2) {
      const evt = event2.getl(player2);
      return evt && evt.es && evt.es.length > 0;
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseTarget({
        prompt: get.prompt(event2.skill),
        prompt2: "弃置一名其他角色的一张牌",
        filterTarget: (card, player3, target) => {
          return target !== player3 && target.countDiscardableCards(player3, "he");
        },
        ai: (target) => {
          const player3 = get.player();
          return get.effect(target, { name: "guohe_copy2" }, player3, player3);
        }
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      await player2.discardPlayerCard({ target: event2.targets[0], position: "he", forced: true });
    },
    ai: {
      noe: true,
      reverseEquip: true,
      effect: {
        target(card, player2, target, current) {
          if (get.type(card) === "equip") {
            return [1, 1];
          }
        }
      }
    }
  },
  lianzi: {
    enable: "phaseUse",
    usable: 1,
    audio: 2,
    derivation: "gz_zhiheng",
    filterCard: true,
    check(card) {
      if (get.type(card) === "equip") {
        return 0;
      }
      const player2 = _status.event.player;
      const num = game.countPlayer((current) => {
        if (current.identity === "wu") {
          return current.countCards("e");
        }
      }) + player2.getExpansions("yuanjiangfenghuotu").length;
      if (num >= 5) {
        return 8 - get.value(card);
      }
      if (num >= 3) {
        return 7 - get.value(card);
      }
      if (num >= 2) {
        return 3 - get.value(card);
      }
      return 0;
    },
    async content(event2, trigger, player2) {
      const num = game.countPlayer((current) => {
        if (current.identity === "wu") {
          return current.countCards("e");
        }
      }) + player2.getExpansions("yuanjiangfenghuotu").length;
      if (!num) {
        return;
      }
      const shown = get.cards(num);
      await player2.showCards(shown, get.translation("lianzi"));
      const list = [];
      const discards = [];
      const type2 = get.type(event2.cards[0], "trick");
      for (const card of shown) {
        if (get.type(card, "trick") === type2) {
          list.push(card);
        } else {
          discards.push(card);
        }
      }
      const shouldChangeSkills = list.length >= 3 && player2.hasStockSkill("lianzi");
      await game.cardsDiscard(discards);
      if (list.length) {
        await player2.gain({ cards: list, animate: "gain2" });
        if (shouldChangeSkills) {
          await player2.changeSkills(["gz_zhiheng"], ["lianzi"]);
        }
      }
    },
    ai: {
      order: 7,
      result: {
        player: 1
      }
    }
  },
  jubao: {
    mod: {
      canBeGained(card, source, player2) {
        if (source !== player2 && get.position(card) === "e" && get.subtype(card) === "equip5") {
          return false;
        }
      }
    },
    trigger: { player: "phaseJieshuBegin" },
    audio: 2,
    derivation: "dinglanyemingzhu",
    forced: true,
    unique: true,
    filter(event2, player2) {
      if (game.hasPlayer((current) => current.hasCards("ej", (card) => card.name === "dinglanyemingzhu"))) {
        return true;
      }
      for (const card of ui.discardPile.childNodes) {
        if (card.name === "dinglanyemingzhu") {
          return true;
        }
      }
      return false;
    },
    async content(event2, trigger, player2) {
      await player2.draw();
      const target = game.findPlayer((current) => current !== player2 && current.hasCards("e", "dinglanyemingzhu"));
      if (!target || !target.hasGainableCards(player2, "he")) {
        return;
      }
      player2.line(target, "green");
      await player2.gainPlayerCard({ target, forced: true });
    },
    ai: {
      threaten: 1.5
    }
  },
  jiahe: {
    audio: true,
    unique: true,
    forceunique: true,
    lordSkill: true,
    mark: true,
    derivation: ["yuanjiangfenghuotu", "jiahe_reyingzi", "jiahe_haoshi", "jiahe_shelie", "jiahe_duoshi"],
    global: ["yuanjiangfenghuotu", "jiahe_damage", "jiahe_put", "jiahe_skill"],
    init(player2) {
      player2.markSkill("yuanjiangfenghuotu");
    }
  },
  jiahe_damage: {
    audio: ["yuanjiangfenghuotu3.mp3", "yuanjiangfenghuotu4.mp3"],
    forceaudio: true,
    ai: {
      threaten: 2
    },
    trigger: { player: "damageEnd" },
    forced: true,
    filter(event2, player2) {
      return event2.card && (event2.card.name === "sha" || get.type(event2.card, "trick") === "trick") && player2.getExpansions("yuanjiangfenghuotu").length > 0;
    },
    async content(event2, trigger, player2) {
      const result2 = await player2.chooseCardButton({
        prompt: "将一张“烽火”置入弃牌堆",
        cards: player2.getExpansions("yuanjiangfenghuotu"),
        forced: true
      }).forResult();
      if (result2.bool) {
        await player2.loseToDiscardpile({ cards: [result2.links[0]] });
      }
    }
  },
  jiahe_put: {
    enable: "phaseUse",
    audio: ["yuanjiangfenghuotu", 2],
    forceaudio: true,
    filter(event2, player2) {
      const zhu = get.zhu(player2, "jiahe");
      if (zhu) {
        return player2.hasCards("he", { type: "equip" });
      }
      return false;
    },
    filterCard: { type: "equip" },
    position: "he",
    usable: 1,
    check(card) {
      const zhu = get.zhu(_status.event.player, "jiahe");
      if (!zhu) {
        return 0;
      }
      const num = 7 - get.value(card);
      if (get.position(card) === "h") {
        if (zhu.getExpansions("huangjintianbingfu").length >= 5) {
          return num - 3;
        }
        return num + 3;
      } else {
        const player2 = _status.event.player;
        const zhu2 = get.zhu(player2, "jiahe");
        if (player2.hasCards("h", (card2) => {
          return get.type(card2) === "equip" && get.subtype(card2) === "sub" && player2.hasValueTarget(card2);
        })) {
          return num + 4;
        }
        if (zhu2.getExpansions("yuanjiangfenghuotu").length >= 5 && !player2.hasSkillTag("noe")) {
          return num - 5;
        }
      }
      return num;
    },
    discard: false,
    lose: false,
    delay: false,
    prepare(cards2, player2) {
      const zhu = get.zhu(player2, "jiahe");
      player2.line(zhu);
    },
    async content(event2, trigger, player2) {
      const zhu = get.zhu(player2, "jiahe");
      const next = zhu.addToExpansion({ cards: event2.cards, source: player2, animate: "give" });
      next.gaintag.add("yuanjiangfenghuotu");
      await next;
    },
    ai: {
      order(item, player2) {
        if (player2.hasSkillTag("noe") || !player2.hasCards("h", (card) => {
          return get.type(card) === "equip" && !player2.canEquip(card) && player2.hasValueTarget(card);
        })) {
          return 1;
        }
        return 10;
      },
      result: {
        player: 1
      }
    }
  },
  jiahe_skill: {
    trigger: { player: "phaseZhunbeiBegin" },
    direct: true,
    audio: "jiahe_put",
    forceaudio: true,
    filter(event2, player2) {
      const zhu = get.zhu(player2, "jiahe");
      if (zhu && zhu.getExpansions("yuanjiangfenghuotu").length) {
        return true;
      }
      return false;
    },
    async content(event2, trigger, player2) {
      const zhu = get.zhu(player2, "jiahe");
      const num = zhu.getExpansions("yuanjiangfenghuotu").length;
      const skillMap = {
        reyingzi: "jiahe_reyingzi",
        haoshi: "jiahe_haoshi",
        shelie: "jiahe_shelie",
        gz_duoshi: "jiahe_duoshi"
      };
      let done = false;
      while (true) {
        const controls = [];
        if (num >= 1 && !(player2.hasSkill("reyingzi") || player2.hasSkill("jiahe_reyingzi"))) {
          controls.push("reyingzi");
        }
        if (num >= 2 && !(player2.hasSkill("haoshi") || player2.hasSkill("jiahe_haoshi"))) {
          controls.push("haoshi");
        }
        if (num >= 3 && !(player2.hasSkill("shelie") || player2.hasSkill("jiahe_shelie"))) {
          controls.push("shelie");
        }
        if (num >= 4 && !(player2.hasSkill("gz_duoshi") || player2.hasSkill("jiahe_duoshi"))) {
          controls.push("gz_duoshi");
        }
        if (!controls.length) {
          return;
        }
        let prompt2 = "你可以获得下列一项技能直到回合结束";
        if (controls.length >= 5) {
          prompt2 += done ? " (2/2)" : " (1/2)";
        }
        controls.push("cancel2");
        const choose = player2.chooseControl({
          controls,
          prompt: get.translation("yuanjiangfenghuotu"),
          prompt2,
          ai(_event, player3) {
            const controls2 = _status.event.controls;
            if (controls2.includes("haoshi")) {
              const handSize = player3.countCards("h");
              if (player3.hasSkill("reyingzi") ? handSize === 0 : handSize <= 1) {
                return "haoshi";
              }
            }
            for (const skill of ["shelie", "reyingzi", "gz_duoshi"]) {
              if (controls2.includes(skill)) {
                return skill;
              }
            }
            return controls2.randomGet();
          }
        });
        choose.set("centerprompt2", true);
        const result2 = await choose.forResult();
        if (result2.control === "cancel2") {
          return;
        }
        const addition = player2.addTempSkills(skillMap[result2.control]);
        if (!done) {
          player2.logSkill("jiahe_put");
        }
        await addition;
        if (num >= 5 && !done) {
          done = true;
          continue;
        }
        return;
      }
    }
  },
  jiahe_reyingzi: {
    audio: 2,
    inherit: "reyingzi"
  },
  jiahe_haoshi: {
    audio: 2,
    inherit: "haoshi"
  },
  jiahe_shelie: {
    audio: 2,
    inherit: "shelie"
  },
  jiahe_duoshi: {
    audio: 2,
    inherit: "gz_duoshi"
  },
  yuanjiangfenghuotu: {
    audio: 4,
    unique: true,
    forceunique: true,
    nopop: true,
    mark: true,
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    },
    intro: {
      content: "expansion",
      markcount: "expansion",
      mark(dialog, storage, player2) {
        const content = player2.getExpansions("yuanjiangfenghuotu");
        if (content && content.length) {
          dialog.addSmall(content);
        }
        dialog.addText('<ul style="margin-top:5px;padding-left:22px;"><li>每名吴势力角色的出牌阶段限一次，该角色可以将一张装备牌置于“缘江烽火图”上，称之为“烽火”。<li>根据“烽火”的数量，所有吴势力角色可于其准备阶段选择并获得其中一个技能直到回合结束：一张及以上~英姿；两张及以上~好施；三张及以上~涉猎；四张及以上~度势；五张及以上~可额外选择一项。<li>锁定技，当你受到【杀】或锦囊牌造成的伤害后，你将一张“烽火”置入弃牌堆。', false);
      }
    }
  },
  gzqice: {
    enable: "phaseUse",
    usable: 1,
    audio: "qice",
    filter(event2, player2) {
      const hs = player2.getCards("h");
      if (!hs.length) {
        return false;
      }
      for (const item of hs) {
        const mod2 = game.checkMod(item, player2, "unchanged", "cardEnabled2", player2);
        if (mod2 === false) {
          return false;
        }
      }
      return true;
    },
    group: "gzqice_change",
    subSkill: {
      change: {
        trigger: { player: "useCardAfter" },
        filter(event2, player2) {
          return event2.skill === "gzqice_backup";
        },
        silent: true,
        async content(event2, trigger, player2) {
          const changeEvent = player2.mayChangeVice();
          event2.skill = "gzqice";
          const triggerEvent = event2.trigger("skillAfter");
          await changeEvent;
          await triggerEvent;
        }
      }
    },
    chooseButton: {
      dialog() {
        const list = lib.inpile;
        const list2 = [];
        for (const item of list) {
          if (item !== "wuxie" && get.type(item) === "trick") {
            list2.push(["锦囊", "", item]);
          }
        }
        return ui.create.dialog(get.translation("gzqice"), [list2, "vcard"]);
      },
      filter(button, player2) {
        const card = { name: button.link[2] };
        const info = get.info(card);
        const num = player2.countCards("h");
        if (get.select(info.selectTarget)[1] === -1) {
          if (game.countPlayer((current) => {
            return player2.canUse(card, current);
          }) > num) {
            return false;
          }
        } else if (info.changeTarget) {
          let giveup = true;
          const list = game.filterPlayer((current) => {
            return player2.canUse(card, current);
          });
          for (const item of list) {
            const targets = [item];
            info.changeTarget(player2, targets);
            if (targets.length <= num) {
              giveup = false;
              break;
            }
          }
          if (giveup) {
            return false;
          }
        }
        return lib.filter.filterCard(card, player2, _status.event.getParent());
      },
      check(button) {
        if (["chiling", "xietianzi", "tiesuo", "lulitongxin", "diaohulishan", "jiedao"].includes(button.link[2])) {
          return 0;
        }
        return _status.event.player.getUseValue(button.link[2]);
      },
      backup(links, player2) {
        return {
          filterCard: true,
          audio: "qice",
          selectCard: -1,
          position: "h",
          selectTarget() {
            let select = get.select(get.info(get.card()).selectTarget);
            const nh = _status.event.player.countCards("h");
            if (select[1] > nh) {
              select[1] = nh;
            }
            return select;
          },
          filterTarget(card, player3, target) {
            const info = get.info(card);
            if (info.changeTarget) {
              const targets = [target];
              info.changeTarget(player3, targets);
              if (targets.length > player3.countCards("h")) {
                return false;
              }
            }
            return lib.filter.filterTarget(card, player3, target);
          },
          popname: true,
          viewAs: { name: links[0][2] },
          ai1() {
            return 1;
          }
        };
      },
      prompt(links, player2) {
        return `将全部手牌当作${get.translation(links[0][2])}使用`;
      }
    },
    ai: {
      order: 1,
      result: {
        player(player2) {
          let num = 0;
          const cards2 = player2.getCards("h");
          if (cards2.length >= 3 && player2.hp >= 3) {
            return 0;
          }
          for (const item of cards2) {
            num += Math.max(0, get.value(item, player2, "raw"));
          }
          return 16 - num;
        }
      },
      threaten: 1.6
    }
  },
  gzyuejian: {
    trigger: { global: "phaseDiscardBegin" },
    audio: "yuejian",
    preHidden: true,
    filter(event2, player2) {
      if (player2.isFriendOf(event2.player)) {
        return event2.player.getHistory("useCard", (evt) => {
          if (evt.targets) {
            const targets = evt.targets.slice(0);
            while (targets.includes(event2.player)) {
              targets.remove(event2.player);
            }
            return targets.length !== 0;
          }
          return false;
        }) === 0;
      }
      return false;
    },
    async content(event2, trigger, player2) {
      trigger.player.addTempSkill("gzyuejian_num");
    },
    logTarget: "player",
    forced: true,
    subSkill: {
      num: {
        mod: {
          maxHandcardBase(player2, num) {
            return player2.maxHp;
          }
        }
      }
    }
  },
  gzxinsheng: {
    trigger: { player: "damageEnd" },
    // frequent:true,
    async content(event2, trigger, player2) {
      game.log(player2, "获得了一张", "#g化身");
      lib.skill.gzhuashen.addCharacter(player2, _status.characterlist.randomGet(), true);
      game.delayx();
    }
  },
  gzhuashen: {
    unique: true,
    group: ["gzhuashen_add", "gzhuashen_swap", "gzhuashen_remove", "gzhuashen_disallow", "gzhuashen_flash"],
    init(player2) {
      player2.storage.gzhuashen = [];
      player2.storage.gzhuashen_removing = [];
      player2.storage.gzhuashen_trigger = [];
      player2.storage.gzhuashen_map = {};
    },
    onremove(player2) {
      delete player2.storage.gzhuashen;
      delete player2.storage.gzhuashen_removing;
      delete player2.storage.gzhuashen_trigger;
      delete player2.storage.gzhuashen_map;
    },
    ondisable: true,
    mark: true,
    intro: {
      mark(dialog, storage, player2) {
        if (!storage || !storage.length) {
          return "没有化身";
        }
        if (!player2.isUnderControl(true)) {
          return `共有${get.cnNumber(storage.length)}张“化身”`;
        }
        dialog.addSmall([storage, "character"]);
        const skills = [];
        for (const name in player2.storage.gzhuashen_map) {
          skills.addArray(player2.storage.gzhuashen_map[name]);
        }
        dialog.addText(`可用技能：${skills.length ? get.translation(skills) : "无"}`);
      },
      content(storage, player2) {
        if (!player2.isUnderControl(true)) {
          return `共有${get.cnNumber(storage.length)}张“化身”`;
        }
        const skills = [];
        for (const name in player2.storage.gzhuashen_map) {
          skills.addArray(player2.storage.gzhuashen_map[name]);
        }
        return `${get.translation(storage)}；可用技能：${skills.length ? get.translation(skills) : "无"}`;
      }
    },
    filterSkill(name) {
      return lib.character[name][3].filter((skill) => {
        const info = lib.skill[skill];
        return !(info.unique || info.limited || info.mainSkill || info.viceSkill || get.is.locked(skill));
      });
    },
    addCharacter(player2, name, show) {
      const skills = lib.skill.gzhuashen.filterSkill(name);
      if (skills.length) {
        player2.storage.gzhuashen_map[name] = skills;
        for (const skill of skills) {
          player2.addAdditionalSkill("hidden:gzhuashen", skill, true);
        }
      }
      player2.storage.gzhuashen.add(name);
      player2.updateMarks("gzhuashen");
      _status.characterlist.remove(name);
      if (show) {
        lib.skill.gzhuashen.drawCharacter(player2, [name]);
      }
    },
    drawCharacter(player2, list) {
      game.broadcastAll(
        (player3, list2) => {
          if (!player3.isUnderControl(true)) {
            return;
          }
          const cards2 = [];
          for (const name of list2) {
            let cardname = `huashen_card_${name}`;
            lib.card[cardname] = {
              fullimage: true,
              image: `character:${name}`
            };
            lib.translate[cardname] = get.rawName2(name);
            cards2.push(game.createCard(cardname, "", ""));
          }
          player3.$draw(cards2, "nobroadcast");
        },
        player2,
        list
      );
    },
    removeCharacter(player2, name) {
      const skills = lib.skill.gzhuashen.filterSkill(name);
      if (skills.length) {
        delete player2.storage.gzhuashen_map[name];
        for (const skill of skills) {
          let remove = true;
          for (const source in player2.storage.gzhuashen_map) {
            if (source !== name && game.expandSkills(player2.storage.gzhuashen_map[source].slice(0)).includes(skill)) {
              remove = false;
              break;
            }
          }
          if (remove) {
            player2.removeAdditionalSkill("hidden:gzhuashen", skill);
            player2.storage.gzhuashen_removing.remove(skill);
          }
        }
      }
      player2.storage.gzhuashen.remove(name);
      player2.updateMarks("gzhuashen");
      _status.characterlist.add(name);
    },
    getSkillSources(player2, skill) {
      if (player2.getStockSkills().includes(skill)) {
        return [];
      }
      const sources = [];
      for (const name in player2.storage.gzhuashen_map) {
        if (game.expandSkills(player2.storage.gzhuashen_map[name].slice(0)).includes(skill)) {
          sources.push(name);
        }
      }
      return sources;
    },
    subfrequent: ["add"],
    subSkill: {
      add: {
        trigger: { player: "phaseBeginStart" },
        frequent: true,
        filter(event2, player2) {
          return player2.storage.gzhuashen.length < 2;
        },
        async content(event2, trigger, player2) {
          const list = _status.characterlist.randomGets(5);
          if (!list.length) {
            return;
          }
          const result2 = await player2.chooseButton({
            selectButton: [1, 2],
            ai: (button) => get.rank(button.link, true),
            createDialog: ["选择至多两张武将牌作为“化身”", [list, "character"]]
          }).forResult();
          if (!result2.bool) {
            return;
          }
          for (const name of result2.links) {
            lib.skill.gzhuashen.addCharacter(player2, name);
          }
          lib.skill.gzhuashen.drawCharacter(player2, result2.links.slice(0));
          game.delayx();
          player2.addTempSkill("gzhuashen_triggered");
          game.log(player2, `获得了${get.cnNumber(result2.links.length)}张`, "#g化身");
        }
      },
      swap: {
        trigger: { player: "phaseBeginStart" },
        direct: true,
        filter(event2, player2) {
          if (player2.hasSkill("gzhuashen_triggered")) {
            return false;
          }
          return player2.storage.gzhuashen.length >= 2;
        },
        async content(event2, trigger, player2) {
          const list = player2.storage.gzhuashen.slice(0);
          if (!list.length) {
            return;
          }
          const result2 = await player2.chooseButton({
            ai: () => Math.random() - 0.3,
            createDialog: ["是否替换一张“化身”？", [list, "character"]]
          }).forResult();
          if (!result2.bool) {
            return;
          }
          player2.logSkill("gzhuashen");
          game.log(player2, "替换了一张", "#g化身");
          lib.skill.gzhuashen.addCharacter(player2, _status.characterlist.randomGet(), true);
          lib.skill.gzhuashen.removeCharacter(player2, result2.links[0]);
          game.delayx();
        }
      },
      triggered: {},
      flash: {
        hookTrigger: {
          log(player2, skill) {
            const sources = lib.skill.gzhuashen.getSkillSources(player2, skill);
            if (sources.length) {
              player2.flashAvatar("gzhuashen", sources.randomGet());
              player2.storage.gzhuashen_removing.add(skill);
            }
          }
        },
        trigger: { player: ["useSkillBegin", "useCard", "respond"] },
        silent: true,
        filter(event2, player2) {
          return event2.skill && lib.skill.gzhuashen.getSkillSources(player2, event2.skill).length > 0;
        },
        async content(event2, trigger, player2) {
          lib.skill.gzhuashen_flash.hookTrigger.log(player2, trigger.skill);
        }
      },
      clear: {
        trigger: { player: "phaseAfter" },
        silent: true,
        async content(event2, trigger, player2) {
          player2.storage.gzhuashen_trigger.length = 0;
        }
      },
      disallow: {
        hookTrigger: {
          block(event2, player2, name, skill) {
            for (const info of player2.storage.gzhuashen_trigger) {
              if (info[0] === event2 && info[1] === name && lib.skill.gzhuashen.getSkillSources(player2, skill).length > 0) {
                return true;
              }
            }
            return false;
          }
        }
      },
      remove: {
        trigger: {
          player: ["useSkillAfter", "useCardAfter", "respondAfter", "triggerAfter", "skillAfter"]
        },
        hookTrigger: {
          after(event2, player2) {
            if (event2._direct && !player2.storage.gzhuashen_removing.includes(event2.skill)) {
              return false;
            }
            if (lib.skill[event2.skill].silent) {
              return false;
            }
            return lib.skill.gzhuashen.getSkillSources(player2, event2.skill).length > 0;
          }
        },
        silent: true,
        filter(event2, player2) {
          return event2.skill && lib.skill.gzhuashen.getSkillSources(player2, event2.skill).length > 0;
        },
        async content(event2, trigger, player2) {
          if (trigger.name === "trigger") {
            player2.storage.gzhuashen_trigger.push([trigger._trigger, trigger.triggername]);
          }
          const sources = lib.skill.gzhuashen.getSkillSources(player2, trigger.skill);
          let name = sources[0];
          if (sources.length !== 1) {
            const result2 = await player2.chooseButton({
              forced: true,
              createDialog: ["移除一张“化身”牌", [sources, "character"]]
            }).forResult();
            name = result2?.links[0];
          }
          lib.skill.gzhuashen.removeCharacter(player2, name);
          game.log(player2, "移除了化身牌", `#g${get.translation(name)}`);
        }
      }
    },
    ai: {
      nofrequent: true,
      skillTagFilter(player2, tag, arg) {
        if (arg && player2.storage.gzhuashen) {
          if (lib.skill.gzhuashen.getSkillSources(player2, arg).length > 0) {
            return true;
          }
        }
        return false;
      }
    }
  },
  gzxiongsuan: {
    limited: true,
    audio: "xiongsuan",
    enable: "phaseUse",
    filterCard: true,
    filter(event2, player2) {
      return player2.hasCards("h");
    },
    filterTarget(card, player2, target) {
      return target.isFriendOf(player2);
    },
    check(card) {
      return 7 - get.value(card);
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      player2.awakenSkill("gzxiongsuan");
      await target.damage({ nocard: true });
      await player2.draw(3);
      const skills = target.getOriginalSkills().filter((skill) => lib.skill[skill].limited && target.awakenedSkills.includes(skill));
      if (skills.length === 1) {
        target.storage.gzxiongsuan_restore = skills[0];
        target.addTempSkill("gzxiongsuan_restore");
        return;
      }
      if (skills.length === 0) {
        return;
      }
      const result2 = await player2.chooseControl({
        controls: skills,
        prompt: "选择一个限定技在回合结束后重置之"
      }).forResult();
      target.storage.gzxiongsuan_restore = result2.control;
      target.addTempSkill("gzxiongsuan_restore");
    },
    subSkill: {
      restore: {
        trigger: { global: "phaseEnd" },
        forced: true,
        popup: false,
        charlotte: true,
        onremove: true,
        async content(event2, trigger, player2) {
          player2.restoreSkill(player2.storage.gzxiongsuan_restore);
        }
      }
    },
    ai: {
      order: 4,
      damage: true,
      result: {
        target(player2, target) {
          if (target.hp > 1 && target.getOriginalSkills().some((skill) => lib.skill[skill].limited && target.awakenedSkills.includes(skill))) {
            return 8;
          }
          if (target !== player2) {
            return 0;
          }
          if (get.damageEffect(target, player2, player2) >= 0) {
            return 10;
          }
          if (target.hp >= 4) {
            return 5;
          }
          if (target.hp === 3 && player2.countCards("h") <= 2 && game.hasPlayer((current) => current.hp <= 1 && get.attitude(player2, current) < 0)) {
            return 3;
          }
          return 0;
        }
      }
    }
  },
  gzsuishi: {
    audio: "suishi",
    preHidden: ["gzsuishi2"],
    trigger: { global: "dying" },
    forced: true,
    logAudio: () => "suishi1.mp3",
    check() {
      return false;
    },
    filter(event2, player2) {
      return event2.player !== player2 && event2.parent.name === "damage" && event2.parent.source && event2.parent.source.isFriendOf(player2);
    },
    async content(event2, trigger, player2) {
      await player2.draw();
    },
    group: "gzsuishi2"
  },
  gzsuishi2: {
    audio: "suishi2.mp3",
    trigger: { global: "dieAfter" },
    forced: true,
    filter(event2, player2) {
      return event2.player.isFriendOf(player2);
    },
    async content(event2, trigger, player2) {
      await player2.loseHp();
    }
  },
  hongfa_respond: {
    audio: ["huangjintianbingfu", 2],
    forceaudio: true,
    trigger: { player: "chooseToRespondBegin" },
    direct: true,
    filter(event2, player2) {
      if (event2.responded) {
        return false;
      }
      if (!event2.filterCard({ name: "sha" })) {
        return false;
      }
      const zhu = get.zhu(player2, "hongfa");
      if (zhu && zhu.getExpansions("huangjintianbingfu").length > 0) {
        return true;
      }
      return false;
    },
    async content(event2, trigger, player2) {
      const zhu = get.zhu(player2, "hongfa");
      const result2 = await player2.chooseCardButton({
        prompt: get.prompt("huangjintianbingfu"),
        cards: zhu.getExpansions("huangjintianbingfu"),
        ai: () => _status.event.goon ? 1 : 0
      }).set("goon", !player2.hasCards("h", "sha")).forResult();
      if (!result2.bool) {
        return;
      }
      const card = result2.links[0];
      trigger.untrigger();
      trigger.responded = true;
      trigger.result = { bool: true, card: { name: "sha" }, cards: [card] };
      player2.logSkill("hongfa_respond", get.zhu(player2, "hongfa"));
    }
  },
  hongfa_use: {
    audio: ["huangjintianbingfu", 2],
    forceaudio: true,
    enable: "chooseToUse",
    filter(event2, player2) {
      if (!event2.filterCard({ name: "sha" }, player2)) {
        return false;
      }
      const zhu = get.zhu(player2, "hongfa");
      if (zhu && zhu.getExpansions("huangjintianbingfu").length > 0) {
        return true;
      }
      return false;
    },
    chooseButton: {
      dialog(event2, player2) {
        const zhu = get.zhu(player2, "hongfa");
        return ui.create.dialog("黄巾天兵符", zhu.getExpansions("huangjintianbingfu"), "hidden");
      },
      backup(links, player2) {
        return {
          filterCard() {
            return false;
          },
          selectCard: -1,
          viewAs: { name: "sha", cards: links },
          cards: links,
          async precontent(event2, trigger, player3) {
            const cards2 = lib.skill.hongfa_use_backup.cards;
            event2.result.cards = cards2;
            player3.logSkill("hongfa_use", event2.result.targets);
          }
        };
      },
      prompt(links, player2) {
        return "选择杀的目标";
      }
    },
    ai: {
      respondSha: true,
      skillTagFilter(player2) {
        const zhu = get.zhu(player2, "hongfa");
        if (zhu && zhu.getExpansions("huangjintianbingfu").length > 0) {
          return true;
        }
        return false;
      },
      order() {
        return get.order({ name: "sha" }) - 0.1;
      },
      result: {
        player(player2) {
          if (player2.hasCards("h", "sha")) {
            return 0;
          }
          return 1;
        }
      }
    }
  },
  hongfa: {
    audio: 3,
    locked: false,
    derivation: "huangjintianbingfu",
    unique: true,
    forceunique: true,
    lordSkill: true,
    trigger: { player: "phaseZhunbeiBegin" },
    forced: true,
    init(player2) {
      player2.markSkill("huangjintianbingfu");
    },
    filter(event2, player2) {
      return player2.getExpansions("huangjintianbingfu").length === 0 && get.population("qun") > 0;
    },
    async content(event2, trigger, player2) {
      const cards2 = get.cards(get.population("qun"));
      await player2.addToExpansion({ cards: cards2, animate: "gain2", gaintag: ["huangjintianbingfu"] });
    },
    ai: {
      threaten: 2
    },
    group: "hongfa_hp",
    global: ["huangjintianbingfu", "hongfa_use", "hongfa_respond"],
    subSkill: {
      hp: {
        audio: "huangjintianbingfu3.mp3",
        trigger: { player: "loseHpBefore" },
        filter(event2, player2) {
          return player2.getExpansions("huangjintianbingfu").length > 0;
        },
        async cost(event2, trigger, player2) {
          const result2 = await player2.chooseCardButton({
            prompt: get.prompt("hongfa"),
            cards: player2.getExpansions("huangjintianbingfu"),
            ai: () => 1
          }).forResult();
          event2.result = { bool: result2.bool, cards: result2.links };
        },
        async content(event2, trigger, player2) {
          const next = player2.loseToDiscardpile({ cards: event2.cards });
          trigger.cancel();
          await next;
        }
      }
    }
  },
  wendao: {
    audio: 2,
    derivation: "taipingyaoshu",
    unique: true,
    forceunique: true,
    enable: "phaseUse",
    usable: 1,
    filterCard(card) {
      return get.name(card) !== "taipingyaoshu" && get.color(card) === "red";
    },
    position: "he",
    check(card) {
      return 6 - get.value(card);
    },
    onChooseToUse(event2) {
      if (game.online) {
        return;
      }
      event2.set(
        "wendao",
        (() => {
          for (const item of ui.discardPile.childNodes) {
            if (item.name === "taipingyaoshu") {
              return true;
            }
          }
          return game.hasPlayer((current) => {
            return current.hasCards("ej", "taipingyaoshu");
          });
        })()
      );
    },
    filter(event2, player2) {
      return event2.wendao === true;
    },
    async content(event2, trigger, player2) {
      const list = [];
      for (const card2 of ui.discardPile.childNodes) {
        if (card2.name === "taipingyaoshu") {
          list.add(card2);
        }
      }
      game.countPlayer((current) => {
        const cards2 = current.getCards("ej", "taipingyaoshu");
        if (cards2.length) {
          list.addArray(cards2);
        }
      });
      if (!list.length) {
        return;
      }
      const card = list.randomGet();
      const owner = get.owner(card);
      if (owner) {
        const next = player2.gain({ cards: [card], source: owner, animate: "give", bySelf: true });
        player2.line(owner, "green");
        await next;
      } else {
        await player2.gain({ cards: [card], animate: "gain2" });
      }
    },
    ai: {
      order: 8.5,
      result: {
        player: 1
      }
    }
  },
  huangjintianbingfu: {
    audio: 3,
    unique: true,
    forceunique: true,
    nopop: true,
    mark: true,
    onremove(player2, skill) {
      const cards2 = player2.getExpansions(skill);
      if (cards2.length) {
        player2.loseToDiscardpile({ cards: cards2 });
      }
    },
    intro: {
      content: "expansion",
      markcount: "expansion",
      mark(dialog, storage, player2) {
        const content = player2.getExpansions("huangjintianbingfu");
        if (content && content.length) {
          dialog.addSmall(content);
        }
        dialog.addText('<ul style="margin-top:5px;padding-left:22px;"><li>锁定技，当你计算群势力角色数时，每一张“天兵”均可视为一名群势力角色。<li>每当你失去体力时，你可改为将一张“天兵”置入弃牌堆。<li>与你势力相同的角色可将一张“天兵”当【杀】使用或打出。', false);
      }
    }
  },
  wuxin: {
    trigger: { player: "phaseDrawBegin1" },
    audio: 2,
    filter(event2, player2) {
      return get.population("qun") > 0;
    },
    async content(event2, trigger, player2) {
      let num = get.population("qun");
      if (player2.hasSkill("hongfa", null, null, false)) {
        num += player2.getExpansions("huangjintianbingfu").length;
      }
      const cards2 = get.cards(num, true);
      await game.cardsGotoOrdering(cards2);
      const next = player2.chooseToMove("悟心：将卡牌以任意顺序置于牌堆顶");
      next.set("list", [["牌堆顶", cards2]]);
      next.set("processAI", (list) => {
        const cards3 = list[0][1].slice(0);
        cards3.sort((a, b) => {
          return get.value(b) - get.value(a);
        });
        return [cards3];
      });
      const result2 = await next.forResult();
      if (result2.bool) {
        const list = result2.moved[0].slice(0);
        await game.cardsGotoPile(list.reverse(), "insert");
        game.updateRoundNumber();
      }
    }
  },
  zhangwu: {
    audio: 2,
    derivation: "feilongduofeng",
    unique: true,
    forceunique: true,
    ai: {
      threaten: 2
    },
    trigger: {
      global: ["loseAfter", "cardsDiscardAfter", "equipAfter"]
    },
    forced: true,
    filter(event2, player2) {
      if (event2.name === "equip") {
        if (player2 === event2.player) {
          return false;
        }
        if (event2.cards.some((card) => card.name === "feilongduofeng" && event2.player.getCards("e").includes(card))) {
          return true;
        }
        return event2.player.hasHistory("lose", (evt) => {
          if (evt.position !== ui.discardPile || evt.getParent().name !== "equip") {
            return false;
          }
          if (evt.cards.some((card) => card.name === "feilongduofeng" && get.position(card, true) === "d")) {
            return true;
          }
          return false;
        });
      }
      if (event2.name === "lose" && (event2.position !== ui.discardPile || event2.getParent().name === "equip")) {
        return false;
      }
      if (event2.cards.some((card) => card.name === "feilongduofeng" && get.position(card, true) === "d")) {
        return true;
      }
      return false;
    },
    logTarget(event2, player2) {
      if (event2.name === "equip" && event2.cards.some((card) => card.name === "feilongduofeng" && event2.player.getCards("e").includes(card))) {
        return event2.player;
      }
      return [];
    },
    async content(event2, trigger, player2) {
      await game.delayx();
      const cards2 = [];
      if (trigger.name === "equip") {
        for (const card of trigger.cards) {
          if (card.name === "feilongduofeng" && trigger.player.getCards("e").includes(card)) {
            cards2.push(card);
          }
        }
        trigger.player.getHistory("lose", (evt) => {
          if (evt.position !== ui.discardPile || evt.getParent() !== trigger) {
            return false;
          }
          for (const card of evt.cards) {
            if (card.name === "feilongduofeng" && get.position(card, true) === "d") {
              cards2.push(card);
            }
          }
          return false;
        });
      }
      if (["lose", "cardsDiscard"].includes(trigger.name)) {
        for (const card of trigger.cards) {
          if (card.name === "feilongduofeng" && get.position(card, true) === "d") {
            cards2.push(card);
          }
        }
      }
      if (!cards2.length) {
        return;
      }
      const owner = get.owner(cards2[0]);
      if (owner) {
        await player2.gain({ cards: cards2, animate: "give", source: owner, bySelf: true });
      } else {
        await player2.gain({ cards: cards2, animate: "gain2" });
      }
    },
    group: "zhangwu_draw",
    subSkill: {
      draw: {
        audio: "zhangwu",
        trigger: {
          player: "loseEnd",
          global: ["equipEnd", "addJudgeEnd", "gainEnd", "loseAsyncEnd", "addToExpansionEnd"]
        },
        filter(event2, player2) {
          if (event2.getParent().name === "useCard") {
            return false;
          }
          const evt = event2.getl(player2);
          return evt && evt.player === player2 && evt.cards2.filter((i) => {
            return i.name === "feilongduofeng" && get.owner(i) !== player2;
          }).length > 0;
        },
        forced: true,
        async content(event2, trigger, player2) {
          const cards2 = [];
          const evt = trigger.getl(player2);
          cards2.addArray(
            evt.cards2.filter((i) => {
              return i.name === "feilongduofeng" && get.owner(i) !== player2;
            })
          );
          await player2.showCards(cards2, `${get.translation(player2)}发动了【章武】`);
          for (const i of cards2) {
            const owner = get.owner(i);
            if (owner) {
              await owner.lose({ cards: [i], position: ui.cardPile }).set("_triggered", null);
            } else {
              await game.cardsGotoPile(i);
            }
          }
          await player2.draw(2);
        }
      }
    }
  },
  shouyue: {
    audio: true,
    unique: true,
    forceunique: true,
    global: "wuhujiangdaqi",
    derivation: ["wuhujiangdaqi", "gz_wusheng", "gz_paoxiao", "gz_longdan", "gz_tieji", "gz_liegong"],
    mark: true,
    lordSkill: true,
    init(player2) {
      player2.markSkill("wuhujiangdaqi");
    }
  },
  shouyue_wusheng: { audio: 2 },
  shouyue_paoxiao: { audio: 2 },
  shouyue_longdan: { audio: 2 },
  shouyue_tieji: { audio: 2 },
  shouyue_liegong: { audio: 2 },
  wuhujiangdaqi: {
    unique: true,
    forceunique: true,
    nopop: true,
    mark: true,
    intro: {
      content: '@<div style="margin-top:-5px"><div class="skill">【武圣】</div><div class="skillinfo">将“红色牌”改为“任意牌”</div><div class="skill">【咆哮】</div><div class="skillinfo">增加描述“你使用的【杀】无视其他角色的防具”</div><div class="skill">【龙胆】</div><div class="skillinfo">增加描述“你每发动一次‘龙胆’便摸一张牌”</div><div class="skill">【铁骑】</div><div class="skillinfo">将“一张明置的武将牌”改为“所有明置的武将牌”</div><div class="skill">【烈弓】</div><div class="skillinfo">增加描述“你的攻击范围+1”</div></div>'
    }
  },
  jizhao: {
    derivation: "rerende",
    unique: true,
    audio: 2,
    enable: "chooseToUse",
    mark: true,
    skillAnimation: true,
    animationColor: "fire",
    init(player2) {
      player2.storage.jizhao = false;
    },
    filter(event2, player2) {
      if (player2.storage.jizhao) {
        return false;
      }
      if (event2.type !== "dying") {
        return false;
      }
      return player2 === event2.dying;
    },
    async content(event2, trigger, player2) {
      player2.awakenSkill("jizhao");
      player2.storage.jizhao = true;
      const num = player2.maxHp - player2.countCards("h");
      if (num > 0) {
        await player2.draw(num);
      }
      if (player2.hp < 2) {
        await player2.recover(2 - player2.hp);
      }
      player2.removeSkill("wuhujiangdaqi");
      await player2.changeSkills(["rerende"], ["shouyue"]);
    },
    ai: {
      order: 1,
      skillTagFilter(player2, arg, target) {
        if (player2 !== target || player2.storage.jizhao) {
          return false;
        }
      },
      save: true,
      result: {
        player: 10
      }
    },
    intro: {
      content: "limited"
    }
  },
  gzshoucheng: {
    inherit: "shoucheng",
    audio: "shoucheng",
    preHidden: true,
    filter(event2, player2) {
      return game.hasPlayer((current) => {
        if (current === _status.currentPhase || !current.isFriendOf(player2)) {
          return false;
        }
        const evt = event2.getl(current);
        return evt && evt.hs && evt.hs.length && !current.hasCards("h");
      });
    },
    async content(event2, trigger, player2) {
      const list = game.filterPlayer((current) => {
        if (current === _status.currentPhase || !current.isFriendOf(player2)) {
          return false;
        }
        const evt = trigger.getl(current);
        return evt && evt.hs && evt.hs.length;
      }).sortBySeat(_status.currentPhase);
      for (const target of list) {
        event2.target = target;
        if (!target.isAlive() || target.hasCards("h")) {
          continue;
        }
        const result2 = await player2.chooseBool({
          prompt: get.prompt2("gzshoucheng", target),
          ai: () => get.attitude(_status.event.player, _status.event.getParent().target) > 0
        }).setHiddenSkill(event2.name).forResult();
        if (result2.bool) {
          player2.logSkill(event2.name, target);
          await target.draw();
        }
      }
    }
  },
  gzyicheng: {
    audio: "yicheng",
    trigger: {
      global: ["useCardToPlayered", "useCardToTargeted"]
    },
    preHidden: true,
    //frequent:true,
    filter(event2, player2) {
      if (event2.card.name !== "sha") {
        return false;
      }
      if (event2.name === "useCardToPlayered" && !event2.isFirstTarget) {
        return false;
      }
      const target = lib.skill.gzyicheng.logTarget(event2, player2);
      if (target === player2) {
        return true;
      }
      return target.inline(player2) && target.isAlive() && player2.hasSkill("gzyicheng");
    },
    logTarget(event2, player2) {
      return event2.name === "useCardToPlayered" ? event2.player : event2.target;
    },
    async cost(event2, trigger, player2) {
      const target = lib.skill.gzyicheng.logTarget(trigger, player2);
      event2.result = await target.chooseBool({
        prompt: get.prompt(event2.skill),
        prompt2: "摸一张牌，然后弃置一张牌"
      }).set("frequentSkill", event2.skill).forResult();
      event2.result.targets = [target];
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      await target.draw();
      await target.chooseToDiscard({ position: "he", forced: true });
    }
  },
  gzhuyuan: {
    audio: "huyuan",
    trigger: { player: "phaseJieshuBegin" },
    preHidden: true,
    filter(event2, player2) {
      return player2.hasCards("he");
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCardTarget({
        filterCard: true,
        position: "he",
        filterTarget(card, player3, target) {
          if (player3 === target) {
            return false;
          }
          const selectedCard = ui.selected.cards[0];
          if (get.type(selectedCard) !== "equip") {
            return true;
          }
          return target.canEquip(selectedCard);
        },
        prompt: get.prompt2(event2.skill),
        complexSelect: true,
        ai1(card) {
          if (!_status.event.goon) {
            return false;
          }
          if (get.type(card) !== "equip") {
            return 0;
          }
          return 7.5 - get.value(card);
        },
        ai2(target) {
          if (!_status.event.goon) {
            return false;
          }
          const player3 = _status.event.player;
          const card = ui.selected.cards[0];
          return get.effect(target, card, player3, player3);
        },
        goon: game.hasPlayer((current) => {
          return get.effect(current, { name: "guohe_copy", position: "ej" }, player2, player2) > 0;
        })
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const card = event2.cards[0];
      if (get.type(card) !== "equip") {
        await player2.give(card, target);
        return;
      }
      player2.$give(card, target, false);
      const delay = game.delayx();
      const equipEvent = target.equip(card);
      await delay;
      await equipEvent;
      if (game.hasPlayer((current) => {
        return current.hasCard((card2) => {
          return lib.filter.canBeDiscarded(card2, player2, current);
        }, "ej");
      })) {
        const result2 = await player2.chooseTarget({
          prompt: "是否弃置场上的一张牌？",
          filterTarget: (card2, player3, target2) => target2.hasCard((card3) => {
            return lib.filter.canBeDiscarded(card3, player3, target2);
          }, "ej"),
          ai: (target2) => {
            const player3 = _status.event.player;
            return get.effect(target2, { name: "guohe_copy", position: "ej" }, player3, player3);
          }
        }).forResult();
        if (result2.bool) {
          const discardTarget = result2.targets[0];
          player2.line(discardTarget, "thunder");
          await player2.discardPlayerCard({ target: discardTarget, forced: true, position: "ej" });
        }
      }
    }
  },
  huyuan: {
    audio: 2,
    trigger: { player: "phaseJieshuBegin" },
    preHidden: true,
    filter(event2, player2) {
      return player2.hasCards("he", { type: "equip" });
    },
    async cost(event2, trigger, player2) {
      event2.result = await player2.chooseCardTarget({
        filterCard(card) {
          return get.type(card) === "equip";
        },
        position: "he",
        filterTarget(card, player3, target) {
          return target.canEquip(card);
        },
        ai1(card) {
          return 6 - get.value(card);
        },
        ai2(target) {
          return get.attitude(_status.event.player, target) - 3;
        },
        prompt: get.prompt2(event2.skill)
      }).setHiddenSkill(event2.skill).forResult();
    },
    async content(event2, trigger, player2) {
      const target = event2.targets[0];
      const equipEvent = target.equip(event2.cards[0]);
      let delay;
      if (target !== player2) {
        player2.$give(event2.cards, target, false);
        delay = game.delay(2);
      }
      const chooseEvent = player2.chooseTarget({
        prompt: "弃置一名角色的一张牌",
        filterTarget: (card, player3, target2) => {
          const source = _status.event.source;
          return get.distance(source, target2) <= 1 && source !== target2 && target2.hasCards("he");
        },
        ai: (target2) => {
          const player3 = _status.event.player;
          return get.effect(target2, { name: "guohe_copy2" }, player3, player3);
        }
      }).set("source", target);
      await equipEvent;
      if (delay) {
        await delay;
      }
      const result2 = await chooseEvent.forResult();
      if (result2.bool && result2.targets.length) {
        target.line(result2.targets, "green");
        await player2.discardPlayerCard({ target: result2.targets[0], forced: true, position: "he" });
      }
    }
  },
  heyi: {
    zhenfa: "inline",
    global: "heyi_distance"
  },
  heyi_distance: {
    mod: {
      globalTo(from, to, distance) {
        if (game.hasPlayer((current) => {
          return current.hasSkill("heyi") && current.inline(to);
        })) {
          return distance + 1;
        }
      }
    }
  },
  tianfu: {
    init(player2) {
      player2.checkMainSkill("tianfu");
    },
    mainSkill: true,
    inherit: "kanpo",
    zhenfa: "inline",
    viewAsFilter(player2) {
      return _status.currentPhase && _status.currentPhase.inline(player2) && !player2.hasSkill("kanpo") && player2.hasCards("h", { color: "black" });
    }
  },
  yizhi: {
    init(player2) {
      if (player2.checkViceSkill("yizhi") && !player2.viceChanged) {
        player2.removeMaxHp();
      }
    },
    viceSkill: true,
    inherit: "guanxing",
    filter(event2, player2) {
      return !player2.hasSkill("guanxing");
    }
  },
  gzshangyi: {
    audio: "shangyi",
    enable: "phaseUse",
    usable: 1,
    filter(event2, player2) {
      return player2.hasCards("h");
    },
    filterTarget(card, player2, target) {
      return player2 !== target && (target.hasCards("h") || target.isUnseen(2));
    },
    async content(event2, trigger, player2) {
      const { target } = event2;
      await target.viewHandcards(player2);
      let index;
      if (!target.hasCards("h")) {
        index = 1;
      } else if (!target.isUnseen(2)) {
        index = 0;
      } else {
        ({ index } = await player2.chooseControl({
          choiceList: [`观看${get.translation(target)}的手牌并可以弃置其中的一张黑色牌`, `观看${get.translation(target)}的所有暗置的武将牌`]
        }).forResult());
      }
      if (index === 0) {
        await player2.discardPlayerCard({
          target,
          position: "h",
          filterButton: (button) => get.color(button.link) === "black",
          visible: true
        });
      } else {
        await player2.viewCharacter(target, 2);
      }
    },
    ai: {
      order: 11,
      result: {
        target(player2, target) {
          return -target.countCards("h");
        }
      },
      threaten: 1.1
    }
  },
  niaoxiang: {
    zhenfa: "siege",
    audio: "zniaoxiang",
    global: "niaoxiang_sha",
    preHidden: true,
    trigger: { global: "useCardToPlayered" },
    filter(event2, player2) {
      if (event2.card.name !== "sha") {
        return false;
      }
      return player2.siege(event2.target) && event2.player.siege(event2.target);
    },
    forced: true,
    locked: false,
    forceaudio: true,
    logTarget: "target",
    async content(event2, trigger, player2) {
      let id = trigger.target.playerid;
      let map = trigger.getParent().customArgs;
      if (!map[id]) {
        map[id] = {};
      }
      if (typeof map[id].shanRequired === "number") {
        map[id].shanRequired++;
      } else {
        map[id].shanRequired = 2;
      }
    }
  },
  fengshi: {
    audio: "zfengshi",
    zhenfa: "siege",
    trigger: { global: "useCardToPlayered" },
    filter(event2, player2) {
      if (event2.card.name !== "sha") {
        return false;
      }
      return player2.siege(event2.target) && event2.player.siege(event2.target) && event2.target.hasCards("e");
    },
    logTarget: "target",
    async content(event2, trigger, player2) {
      await trigger.target.chooseToDiscard({ position: "e", forced: true });
    }
  },
  gzguixiu: {
    unique: true,
    audio: "guixiu",
    trigger: { player: ["showCharacterAfter", "removeCharacterBefore"] },
    filter(event2, player2) {
      if (event2.name === "removeCharacter" || event2.name === "changeVice") {
        return get.character(event2.toRemove, 3).includes("gzguixiu") && player2.isDamaged();
      }
      return event2.toShow.some((name) => {
        return get.character(name, 3).includes("gzguixiu");
      });
    },
    async content(event2, trigger, player2) {
      if (trigger.name === "showCharacter") {
        await player2.draw(2);
      } else {
        await player2.recover();
      }
    }
  },
  gzcunsi: {
    derivation: "gzyongjue",
    enable: "phaseUse",
    audio: "cunsi",
    filter(event2, player2) {
      return player2.checkMainSkill("gzcunsi", false) || player2.checkViceSkill("gzcunsi", false);
    },
    unique: true,
    forceunique: true,
    filterTarget: true,
    skillAnimation: true,
    animationColor: "orange",
    async content(event2, trigger, player2) {
      const { target } = event2;
      if (player2.checkMainSkill("gzcunsi", false)) {
        await player2.removeCharacter(0);
      } else {
        await player2.removeCharacter(1);
      }
      await target.addSkills("gzyongjue");
      if (target !== player2) {
        await target.draw(2);
      }
    },
    ai: {
      order: 9,
      result: {
        player(player2, target) {
          let num = 0;
          if (player2.isDamaged() && target.isFriendOf(player2)) {
            num++;
            if (target.hasSkill("kanpo")) {
              num += 0.5;
            }
            if (target.hasSkill("liegong")) {
              num += 0.5;
            }
            if (target.hasSkill("tieji")) {
              num += 0.5;
            }
            if (target.hasSkill("gzrende")) {
              num += 1.2;
            }
            if (target.hasSkill("longdan")) {
              num += 1.2;
            }
            if (target.hasSkill("paoxiao")) {
              num += 1.2;
            }
            if (target.hasSkill("zhangwu")) {
              num += 1.5;
            }
            if (target !== player2) {
              num += 0.5;
            }
          }
          return num;
        }
      }
    }
  },
  gzyongjue: {
    audio: "yongjue",
    trigger: { global: "useCardAfter" },
    filter(event2, player2) {
      if (event2 === event2.player.getHistory("useCard")[0] && event2.card.name === "sha" && _status.currentPhase === event2.player && event2.player.isFriendOf(player2)) {
        for (const item of event2.cards) {
          if (get.position(item, true) === "o") {
            return true;
          }
        }
      }
      return false;
    },
    mark: true,
    intro: {
      content: "若与你势力相同的一名角色于其回合内使用的第一张牌为【杀】，则该角色可以在此【杀】结算完成后获得之"
    },
    async content(event2, trigger, player2) {
      const cards2 = trigger.cards.filter((card) => get.position(card, true) === "o");
      await trigger.player.gain({ cards: cards2, animate: "gain2" });
    },
    global: "gzyongjue_ai"
  },
  gzyongjue_ai: {
    ai: {
      presha: true,
      skillTagFilter(player2) {
        if (!game.hasPlayer((current) => {
          return current.isFriendOf(player2) && current.hasSkill("gzyongjue");
        })) {
          return false;
        }
      }
    }
  },
  baoling: {
    trigger: { player: "phaseUseEnd" },
    init(player2) {
      player2.checkMainSkill("baoling");
    },
    mainSkill: true,
    forced: true,
    preHidden: true,
    filter(event2, player2) {
      return player2.hasViceCharacter();
    },
    check(event2, player2) {
      return player2.hp <= 1 || get.guozhanRank(player2.name2, player2) <= 3;
    },
    async content(event2, trigger, player2) {
      await player2.removeCharacter(1);
      const removeSkillsEvent = player2.removeSkills("baoling");
      const gainMaxHpEvent = player2.gainMaxHp({ num: 3, forced: true });
      await removeSkillsEvent;
      await gainMaxHpEvent;
      const recoverEvent = player2.recover(3);
      const addSkillsEvent = player2.addSkills("benghuai");
      await recoverEvent;
      await addSkillsEvent;
    },
    derivation: "benghuai"
  },
  gzmingshi: {
    audio: "mingshi",
    trigger: { player: "damageBegin3" },
    forced: true,
    preHidden: true,
    filter(event2, player2) {
      return event2.num > 0 && event2.source && event2.source.isUnseen(2);
    },
    async content(event2, trigger, player2) {
      trigger.num--;
    },
    ai: {
      effect: {
        target(card, player2, target) {
          if (player2.hasSkillTag("jueqing", false, target)) {
            return;
          }
          if (!player2.isUnseen(2)) {
            return;
          }
          const num = get.tag(card, "damage");
          if (num) {
            if (num > 1) {
              return 0.5;
            }
            return 0;
          }
        }
      }
    }
  },
  hunshang: {
    init(player2) {
      if (player2.checkViceSkill("hunshang") && !player2.viceChanged) {
        player2.removeMaxHp();
      }
    },
    viceSkill: true,
    group: ["hunshang_yingzi", "hunshang_yinghun"]
  },
  reyingzi_sunce: { audio: 2 },
  yinghun_sunce: { audio: 2 },
  hunshang_yingzi: {
    inherit: "yingzi",
    audio: "reyingzi_sunce",
    filter(event2, player2) {
      return player2.hp <= 1 && !player2.hasSkill("yingzi");
    }
  },
  hunshang_yinghun: {
    inherit: "yinghun",
    audio: "yinghun_sunce",
    filter(event2, player2) {
      return player2.hp <= 1 && player2.isDamaged() && !player2.hasSkill("yinghun");
    }
  },
  yingyang: {
    audio: 2,
    trigger: { player: "compare", target: "compare" },
    filter(event2) {
      return !event2.iwhile;
    },
    preHidden: true,
    async cost(event2, trigger, player2) {
      const result2 = await player2.chooseControl({
        controls: ["点数+3", "点数-3", "cancel2"],
        prompt: get.prompt2(event2.skill),
        ai: () => _status.event.small ? 1 : 0
      }).set("small", trigger.small).forResult();
      event2.result = { bool: result2.index !== 2, cost_data: result2.index };
    },
    async content(event2, trigger, player2) {
      const increase = event2.cost_data === 0;
      game.log(player2, `拼点牌点数${increase ? "+3" : "-3"}`);
      let key = player2 === trigger.player ? "num1" : "num2";
      if (increase) {
        trigger[key] = Math.min(13, trigger[key] + 3);
      } else {
        trigger[key] = Math.max(1, trigger[key] - 3);
      }
    }
  },
  gzqianxi: {
    audio: "qianxi",
    trigger: { player: "phaseZhunbeiBegin" },
    async content(event2, trigger, player2) {
      const judgeResult = await player2.judge().forResult();
      const color = judgeResult.color;
      const result2 = await player2.chooseTarget({
        filterTarget: (_card, chooser, target) => chooser !== target && get.distance(chooser, target) <= 1,
        forced: true,
        ai: (target) => -get.attitude(get.player(), target)
      }).forResult();
      if (result2.bool && result2.targets.length) {
        let target = result2.targets[0];
        target.storage.qianxi2 = color;
        target.addSkill("qianxi2");
        player2.line(result2.targets, "green");
        game.addVideo("storage", target, ["qianxi2", color]);
      }
    }
  },
  gzduanchang: {
    audio: "duanchang",
    trigger: { player: "die" },
    forced: true,
    forceDie: true,
    filter(event2, player2) {
      return event2.source && event2.source.isIn() && event2.source !== player2 && (event2.source.hasMainCharacter() || event2.source.hasViceCharacter());
    },
    async content(event2, trigger, player2) {
      const source = trigger.source;
      let control;
      if (!source.hasViceCharacter()) {
        control = "主将";
      } else if (!source.hasMainCharacter()) {
        control = "副将";
      } else {
        let rank = get.guozhanRank(source.name1, source) - get.guozhanRank(source.name2, source);
        if (rank === 0) {
          rank = Math.random() > 0.5 ? 1 : -1;
        }
        const choice = rank * get.attitude(player2, source) > 0 ? "副将" : "主将";
        const result2 = await player2.chooseControl({
          controls: ["主将", "副将"],
          prompt: `令${get.translation(source)}失去一张武将牌的所有技能`,
          ai: () => _status.event.choice
        }).set("forceDie", true).set("choice", choice).forResult();
        control = result2.control;
      }
      let skills;
      if (control === "主将") {
        source.showCharacter(0);
        game.broadcastAll((player3) => {
          player3.node.avatar.classList.add("disabled");
        }, source);
        skills = lib.character[source.name][3];
        game.log(source, "失去了主将技能");
      } else {
        source.showCharacter(1);
        game.broadcastAll((player3) => {
          player3.node.avatar2.classList.add("disabled");
        }, source);
        skills = lib.character[source.name2][3];
        game.log(source, "失去了副将技能");
      }
      const list = skills.filter((skill) => {
        const info = get.info(skill);
        return info && !info.charlotte && !info.persevereSkill;
      });
      const next = list.length ? source.removeSkills(list) : null;
      player2.line(source, "green");
      if (next) {
        await next;
      }
    },
    logTarget: "source",
    ai: {
      threaten(player2, target) {
        if (target.hp === 1) {
          return 0.2;
        }
        return 1.5;
      },
      effect: {
        target(card, player2, target, current) {
          if (!target.hasFriend()) {
            return;
          }
          if (target.hp <= 1 && get.tag(card, "damage")) {
            return [1, 0, 0, -2];
          }
        }
      }
    }
  },
  gzweimu: {
    audio: "weimu",
    trigger: { target: "useCardToTarget", player: "addJudgeBefore" },
    forced: true,
    priority: 15,
    preHidden: true,
    check(event2, player2) {
      return event2.name === "addJudge" || event2.card.name !== "chiling" && get.effect(event2.target, event2.card, event2.player, player2) < 0;
    },
    filter(event2, player2) {
      if (event2.name === "addJudge") {
        return get.color(event2.card) === "black";
      }
      return get.type(event2.card, null, false) === "trick" && get.color(event2.card) === "black";
    },
    async content(event2, trigger, player2) {
      if (trigger.name === "addJudge") {
        trigger.cancel();
        const owner = get.owner(trigger.card);
        const next = owner && owner.getCards("hej").includes(trigger.card) ? owner.lose({ cards: [trigger.card], position: ui.discardPile }) : game.cardsDiscard(trigger.card);
        game.log(trigger.card, "进入了弃牌堆");
        await next;
      } else {
        trigger.getParent().targets.remove(player2);
      }
    },
    ai: {
      effect: {
        target(card, player2, target, current) {
          if (get.type(card, "trick") === "trick" && get.color(card) === "black") {
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  gzqianxun: {
    audio: "qianxun",
    trigger: {
      target: "useCardToTarget",
      player: "addJudgeBefore"
    },
    forced: true,
    preHidden: true,
    priority: 15,
    check(event2, player2) {
      return event2.name === "addJudge" || get.effect(event2.target, event2.card, event2.player, player2) < 0;
    },
    filter(event2, player2) {
      return event2.card.name === (event2.name === "addJudge" ? "lebu" : "shunshou");
    },
    async content(event2, trigger, player2) {
      if (trigger.name === "addJudge") {
        trigger.cancel();
        const owner = get.owner(trigger.card);
        const next = owner && owner.getCards("hej").includes(trigger.card) ? owner.lose({ cards: [trigger.card], position: ui.discardPile }) : game.cardsDiscard(trigger.card);
        game.log(trigger.card, "进入了弃牌堆");
        await next;
      } else {
        trigger.getParent().targets.remove(player2);
      }
    },
    ai: {
      effect: {
        target(card, player2, target, current) {
          if (card.name === "shunshou" || card.name === "lebu") {
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  gzkongcheng: {
    audio: "kongcheng",
    trigger: { target: "useCardToTarget" },
    forced: true,
    priority: 15,
    check(event2, player2) {
      return get.effect(event2.target, event2.card, event2.player, player2) < 0;
    },
    filter(event2, player2) {
      return !player2.hasCards("h") && (event2.card.name === "sha" || event2.card.name === "juedou");
    },
    async content(event2, trigger, player2) {
      trigger.getParent().targets.remove(player2);
    },
    ai: {
      effect: {
        target(card, player2, target, current) {
          if (!target.hasCards("h") && (card.name === "sha" || card.name === "juedou")) {
            return "zeroplayertarget";
          }
        }
      }
    }
  },
  gzxiaoji: {
    inherit: "xiaoji",
    audio: "xiaoji",
    preHidden: true,
    getIndex(event2, player2) {
      const evt = event2.getl(player2);
      if (evt && evt.player === player2 && evt.es && evt.es.length) {
        return 1;
      }
      return false;
    },
    async content(event2, trigger, player2) {
      await player2.draw(player2 === _status.currentPhase ? 1 : 3);
    }
  },
  gzrende: {
    audio: "rende",
    group: ["gzrende1"],
    enable: "phaseUse",
    filterCard: true,
    selectCard: [1, Infinity],
    allowChooseAll: true,
    discard: false,
    prepare: "give",
    filterTarget(card, player2, target) {
      return player2 !== target;
    },
    check(card) {
      if (ui.selected.cards.length > 2) {
        return 0;
      }
      if (ui.selected.cards.length && ui.selected.cards[0].name === "du") {
        return 0;
      }
      if (!ui.selected.cards.length && card.name === "du") {
        return 20;
      }
      const player2 = get.owner(card);
      if (player2.hp === player2.maxHp || player2.storage.gzrende < 0 || player2.countCards("h") + player2.storage.gzrende <= 2) {
        if (ui.selected.cards.length) {
          return -1;
        }
        const players = game.filterPlayer();
        for (const item of players) {
          if (item.hasSkill("haoshi") && !item.isTurnedOver() && !item.hasJudge("lebu") && get.attitude(player2, item) >= 3 && get.attitude(item, player2) >= 3) {
            return 11 - get.value(card);
          }
        }
        if (player2.countCards("h") > player2.hp) {
          return 10 - get.value(card);
        }
        if (player2.countCards("h") > 2) {
          return 6 - get.value(card);
        }
        return -1;
      }
      return 10 - get.value(card);
    },
    async content(event2, trigger, player2) {
      const { target, cards: cards2 } = event2;
      const gainEvent = target.gain({ cards: cards2, source: player2 });
      let recoverEvent;
      if (typeof player2.storage.gzrende !== "number") {
        player2.storage.gzrende = 0;
      }
      if (player2.storage.gzrende >= 0) {
        player2.storage.gzrende += cards2.length;
        if (player2.storage.gzrende >= 3) {
          recoverEvent = player2.recover();
          player2.storage.gzrende = -1;
        }
      }
      await gainEvent;
      if (recoverEvent) {
        await recoverEvent;
      }
    },
    ai: {
      order(skill, player2) {
        if (player2.hp === player2.maxHp || player2.storage.gzrende < 0 || player2.countCards("h") + player2.storage.gzrende <= 2) {
          return 1;
        }
        return 10;
      },
      result: {
        target(player2, target) {
          if (ui.selected.cards.length && ui.selected.cards[0].name === "du") {
            return -10;
          }
          if (target.hasJudge("lebu")) {
            return 0;
          }
          const nh = target.countCards("h");
          const np = player2.countCards("h");
          if (player2.hp === player2.maxHp || player2.storage.gzrende < 0 || player2.countCards("h") + player2.storage.gzrende <= 2) {
            if (nh >= np - 1 && np <= player2.hp && !target.hasSkill("haoshi")) {
              return 0;
            }
          }
          return Math.max(1, 5 - nh);
        }
      },
      effect: {
        target_use(card, player2, target) {
          if (player2 === target && get.type(card) === "equip") {
            if (player2.hasCards("e", { subtype: get.subtype(card) })) {
              const players = game.filterPlayer();
              for (const item of players) {
                if (item !== player2 && get.attitude(player2, item) > 0) {
                  return 0;
                }
              }
            }
          }
        }
      },
      threaten: 0.8
    }
  },
  gzrende1: {
    trigger: { player: "phaseUseBegin" },
    silent: true,
    async content(event2, trigger, player2) {
      player2.storage.gzrende = 0;
    }
  },
  duoshi: {
    audio: 2,
    enable: "chooseToUse",
    viewAs: { name: "yiyi" },
    usable: 4,
    filterCard: { color: "red" },
    position: "hs",
    viewAsFilter(player2) {
      return player2.hasCards("hs", { color: "red" });
    },
    check(card) {
      return 5 - get.value(card);
    }
  },
  gzxiaoguo: {
    inherit: "xiaoguo",
    audio: "xiaoguo",
    preHidden: true,
    async content(event2, trigger, player2) {
      let nono = Math.abs(get.attitude(player2, trigger.player)) < 3;
      if (get.damageEffect(trigger.player, player2, player2) <= 0) {
        nono = true;
      }
      const discardResult = await player2.chooseToDiscard({
        prompt: get.prompt2("gzxiaoguo", trigger.player),
        filterCard: { type: "basic" },
        ai: (card) => {
          if (_status.event.nono) {
            return 0;
          }
          return 8 - get.useful(card);
        }
      }).set("logSkill", ["gzxiaoguo", trigger.player]).set("nono", nono).setHiddenSkill("gzxiaoguo").forResult();
      if (!discardResult.bool) {
        return;
      }
      nono = get.damageEffect(trigger.player, player2, trigger.player) >= 0;
      const targetDiscardResult = await trigger.player.chooseToDiscard({
        prompt: "弃置一张装备牌，或受到1点伤害",
        position: "he",
        filterCard: { type: "equip" },
        ai: (card) => {
          if (_status.event.nono) {
            return 0;
          }
          if (_status.event.player.hp === 1) {
            return 10 - get.value(card);
          }
          return 9 - get.value(card);
        }
      }).set("nono", nono).forResult();
      if (!targetDiscardResult.bool) {
        await trigger.player.damage();
      }
    }
  },
  _mingzhi1: {
    trigger: { player: "phaseBeginStart" },
    //priority:19,
    ruleSkill: true,
    forced: true,
    popup: false,
    filter(event2, player2) {
      return player2.isUnseen(2) && !player2.hasSkillTag("nomingzhi", false, null, true);
    },
    async content(event2, trigger, player2) {
      const junzhu = _status.connectMode ? lib.configOL.junzhu : get.config("junzhu");
      if (player2.phaseNumber === 1 && player2.isUnseen(0) && junzhu) {
        const name = player2.name1;
        if (name.indexOf("gz_") === 0 && (lib.junList.includes(name.slice(3)) || get.character(name)?.junName)) {
          const junzhu_name = get.character(name).junName ?? `gz_jun_${name.slice(3)}`;
          const group = lib.character[junzhu_name][1];
          const notChange = game.hasPlayer((current) => get.is.jun(current) && current.identity === group);
          const result2 = notChange ? {
            bool: false
          } : await player2.chooseBool({ prompt: `是否将主武将牌替换为“${get.translation(junzhu_name)}”？` }).set("createDialog", [`是否替换主武将牌为君主武将“${get.translation(junzhu_name)}”`, [[junzhu_name], "character"]]).forResult();
          if (result2.bool) {
            const maxHp = player2.maxHp;
            player2.reinit(name, junzhu_name, 4);
            const map = {
              gz_jun_liubei: "shouyue",
              gz_jun_zhangjiao: "hongfa",
              gz_jun_sunquan: "jiahe",
              gz_jun_caocao: "jianan",
              gz_jun_jin_simayi: "smyyingshi"
            };
            game.trySkillAudio(map[junzhu_name], player2);
            await player2.showCharacter(0);
            const yelist = game.filterPlayer((current) => {
              if (current === player2) {
                return current.identity !== group;
              }
              if (current.identity !== "ye") {
                return false;
              }
              return current.group === group;
            });
            if (yelist.length > 0) {
              let next = game.createEvent("changeGroupInGuozhan", false);
              next.player = player2;
              next.targets = yelist;
              next.fromGroups = yelist.map((current) => current.identity);
              next.toGroup = group;
              next.setContent("emptyEvent");
              player2.line(yelist, "green");
              if (yelist.includes(player2)) {
                game.log(player2, "变回了", `<span data-nature=${get.groupnature(group, "raw")}m>${get.translation(group + 2)}</span>身份`);
              }
              game.log(
                yelist.filter((current) => current !== player2),
                "失去了野心家身份"
              );
              game.broadcastAll(
                (list, group2) => {
                  for (const item of list) {
                    item.identity = group2;
                    item.group = group2;
                    item.setIdentity();
                  }
                },
                yelist,
                group
              );
              await next;
            }
            game.tryResult();
            if (player2.maxHp > maxHp) {
              await player2.recover(player2.maxHp - maxHp);
            }
          }
        }
      }
      let choice = 1;
      for (const item of player2.hiddenSkills) {
        if (lib.skill[item].ai) {
          const mingzhi = lib.skill[item].ai.mingzhi;
          if (mingzhi === false) {
            choice = 0;
            break;
          }
          if (typeof mingzhi === "function" && mingzhi(trigger, player2) === false) {
            choice = 0;
            break;
          }
        }
      }
      let control;
      if (player2.isUnseen()) {
        const group = lib.character[player2.name1][1];
        const result2 = await player2.chooseControl({
          controls: ["bumingzhi", `明置${get.translation(player2.name1)}`, `明置${get.translation(player2.name2)}`, "tongshimingzhi"],
          ai: (event3, player3) => {
            if (player3.hasSkillTag("mingzhi_yes")) {
              return get.rand(1, 2);
            }
            if (player3.hasSkillTag("mingzhi_no")) {
              return 0;
            }
            const popu = get.population(lib.character[player3.name1][1]);
            if (popu >= 2 || popu === 1 && game.players.length <= 4) {
              return Math.random() < 0.5 ? 3 : Math.random() < 0.5 ? 2 : 1;
            }
            if (choice === 0) {
              return 0;
            }
            if (get.population(group) > 0 && player3.wontYe()) {
              return Math.random() < 0.2 ? Math.random() < 0.5 ? 3 : Math.random() < 0.5 ? 2 : 1 : 0;
            }
            let nming = 0;
            for (const item of game.players) {
              if (item !== player3 && item.identity !== "unknown") {
                nming++;
              }
            }
            if (nming === game.players.length - 1) {
              return Math.random() < 0.5 ? Math.random() < 0.5 ? 3 : Math.random() < 0.5 ? 2 : 1 : 0;
            }
            return Math.random() < 0.1 * nming / game.players.length ? Math.random() < 0.5 ? 3 : Math.random() < 0.5 ? 2 : 1 : 0;
          }
        }).forResult();
        control = result2.control;
      } else {
        if (Math.random() < 0.5) {
          choice = 0;
        }
        if (player2.isUnseen(0)) {
          const result2 = await player2.chooseControl({ controls: ["bumingzhi", `明置${get.translation(player2.name1)}`] }).set("choice", choice).forResult();
          control = result2.control;
        } else if (player2.isUnseen(1)) {
          const result2 = await player2.chooseControl({ controls: ["bumingzhi", `明置${get.translation(player2.name2)}`] }).set("choice", choice).forResult();
          control = result2.control;
        } else {
          return;
        }
      }
      switch (control) {
        case `明置${get.translation(player2.name1)}`:
          await player2.showCharacter(0);
          break;
        case `明置${get.translation(player2.name2)}`:
          await player2.showCharacter(1);
          break;
        case "tongshimingzhi":
          await player2.showCharacter(2);
          break;
      }
    }
  },
  _mingzhi2: {
    trigger: { player: "triggerHidden" },
    forced: true,
    forceDie: true,
    popup: false,
    priority: 10,
    async content(event2, trigger, player2) {
      const { skill } = trigger;
      if (get.info(skill).silent) {
        event2.finish();
      } else {
        event2.skillHidden = true;
        const bool1 = game.expandSkills(lib.character[player2.name1][3]).includes(skill);
        const bool2 = game.expandSkills(lib.character[player2.name2][3]).includes(skill);
        const info = get.info(skill);
        const isLockedCost = get.is.locked(skill, player2) && typeof info?.cost === "function";
        const choice = (() => {
          const yes = !info?.check || info?.check?.(trigger._trigger, player2, trigger.triggername, trigger.indexedData);
          if (!yes) {
            return false;
          }
          if (["gbwuhun", "gbbaonu"].includes(skill) && trigger._trigger?.name === "damage" && trigger._trigger.player === player2 && trigger._trigger.num > 0) return true;
          if (player2.hasSkillTag("mingzhi_no")) {
            return false;
          }
          if (player2.hasSkillTag("mingzhi_yes")) {
            return true;
          }
          if (player2.identity !== "unknown") {
            return true;
          }
          if (Math.random() < 0.5) {
            return true;
          }
          if (info?.ai?.mingzhi === true) {
            return true;
          }
          if (info?.ai?.maixie) {
            return true;
          }
          const group = lib.character[player2.name1][1];
          const popu = get.population(lib.character[player2.name1][1]);
          if (popu >= 2 || popu === 1 && game.players.length <= 4) {
            return true;
          }
          if (get.population(group) > 0 && player2.wontYe()) {
            return Math.random() < 0.2 ? true : false;
          }
          let nming = 0;
          for (const item of game.players) {
            if (item !== player2 && item.identity !== "unknown") {
              nming++;
            }
          }
          if (nming === game.players.length - 1) {
            return Math.random() < 0.5 ? true : false;
          }
          return Math.random() < 0.1 * nming / game.players.length ? true : false;
        })();
        if (bool1 && bool2) {
          event2.name1 = player2.name1;
          event2.name2 = player2.name2;
          const result2 = await player2.chooseButton({
            createDialog: [`明置：请选择你要明置以发动【${get.translation(skill)}】的角色`, [[event2.name1, event2.name2], "character"]],
            ai: (button) => {
              const { player: player3, choice: choice2 } = get.event();
              if (!choice2) {
                return 0;
              }
              return 1;
            }
          }).set("choice", choice).forResult();
          if (result2?.links?.length) {
            const index = event2.name1 === result2.links[0] ? 0 : 1;
            await player2.showCharacter(index);
            if (!isLockedCost) {
              trigger.revealed = true;
            }
          } else {
            trigger.untrigger();
            trigger.cancelled = true;
          }
        } else {
          event2.name1 = bool1 ? player2.name1 : player2.name2;
          const result2 = await player2.chooseBool({ prompt: `是否明置${get.translation(event2.name1)}以发动【${get.translation(skill)}】？` }).set("choice", choice).forResult();
          if (result2?.bool) {
            const index = bool1 ? 0 : 1;
            await player2.showCharacter(index);
            if (!isLockedCost) {
              trigger.revealed = true;
            }
          } else {
            trigger.untrigger();
            trigger.cancelled = true;
          }
        }
      }
    }
  },
  _mingzhiSelectGroup: {
    trigger: { player: "showCharacterBegin" },
    forced: true,
    forceDie: true,
    popup: false,
    priority: 11,
    async content(event2, trigger, player2) {
      const checkChange = (name) => lib.selectGroup.includes(lib.character[name][1]);
      if (trigger.toShow?.every((name) => !checkChange(name))) {
        return;
      }
      if (!lib.selectGroup.includes(player2.identity) && !get.nameList(player2).every((name) => checkChange(name))) {
        return;
      }
      const groups = ["wei", "shu", "wu", "qun", "jin"];
      if (_status.bannedGroup) {
        groups.remove(_status.bannedGroup?.slice(6));
      }
      const willBeYe = groups.filter((group) => {
        if (_status.yeidentity && _status.yeidentity.includes(group)) {
          return true;
        }
        if (get.zhu(player2, null, group)) {
          return false;
        }
        const num = player2.identity === group ? 0 : 1;
        return get.totalPopulation(group) + num > (_status.separatism ? Math.max(get.population() / 2 - 1, 1) : get.population() / 2);
      });
      if (willBeYe?.length) {
        groups.removeArray(willBeYe);
        groups.add("ye");
      }
      if (!groups?.length) {
        return;
      }
      const { control: newGroup } = await player2.chooseControl({
        controls: groups,
        prompt: "请选择一个新的势力",
        ai: (event3, player3) => {
          const { groups: groups2 } = get.event();
          const getn = (group) => {
            const targets = game.filterPlayer((current) => current.identity === group);
            if (!targets.length || group === "ye") {
              return 1 + Math.random();
            }
            return targets.reduce((sum, current) => sum + current.hp, 0) / targets.length + Math.random();
          };
          return groups2.maxBy(getn);
        }
      }).set("groups", groups).forResult();
      if (newGroup !== player2.identity) {
        let next = game.createEvent("changeGroupInGuozhan", false);
        next.player = player2;
        next.targets = [player2];
        next.fromGroups = [player2.identity];
        next.toGroup = newGroup;
        next.setContent("emptyEvent");
        game.log(player2, "变更了势力为", `<span data-nature=${get.groupnature(newGroup, "raw")}m>${get.translation(newGroup)}</span>`);
        game.broadcastAll(
          (player3, group) => {
            player3.identity = group;
            player3.group = group;
            player3.setIdentity();
          },
          player2,
          newGroup
        );
        await next;
        game.tryResult();
      }
    }
  },
  _zhenfazhaohuan: {
    enable: "phaseUse",
    usable: 1,
    getConfig(player2, target) {
      if (!guozhanZhenfaEnabled()) {
        return false;
      }
      if (target === player2 || !target.isUnseen()) {
        return false;
      }
      let config = {};
      const skills = player2.getSkills();
      for (const skill of skills) {
        let info = get.info(skill).zhenfa;
        if (info) {
          config[info] = true;
        }
      }
      if (config.inline) {
        const next = target.getNext();
        const previous = target.getPrevious();
        if (next === player2 || previous === player2 || next && next.inline(player2) || previous && previous.inline(player2)) {
          return true;
        }
      }
      if (config.siege) {
        if (target === player2.getNext().getNext() || target === player2.getPrevious().getPrevious()) {
          return true;
        }
      }
      return false;
    },
    filter(event2, player2) {
      if (player2.identity === "ye" || player2.identity === "unknown" || !player2.wontYe(player2.identity)) {
        return false;
      }
      if (player2.hasSkill("undist")) {
        return false;
      }
      return game.hasPlayer((current) => {
        return lib.skill._zhenfazhaohuan.getConfig(player2, current);
      });
    },
    async content(event2, trigger, player2) {
      const targets = game.filterPlayer((current) => {
        return current.isUnseen();
      }).sortBySeat();
      for (const target of targets) {
        if (!target.wontYe(player2.identity) || !lib.skill._zhenfazhaohuan.getConfig(player2, target)) {
          continue;
        }
        player2.line(target, "green");
        const list = [];
        if (target.getGuozhanGroup(0) === player2.identity) {
          list.push(`明置${get.translation(target.name1)}`);
        }
        if (target.getGuozhanGroup(1) === player2.identity) {
          list.push(`明置${get.translation(target.name2)}`);
        }
        if (!list.length) {
          continue;
        }
        const { control } = await target.chooseControl({
          controls: [...list, "cancel2"],
          prompt: `是否响应${get.translation(player2)}发起的阵法召唤？`,
          ai: () => Math.random() < 0.5 ? 0 : 1
        }).forResult();
        if (control !== "cancel2") {
          target.showCharacter(control === `明置${get.translation(target.name1)}` ? 0 : 1);
        }
      }
      await game.delay();
    },
    ai: {
      order: 5,
      result: {
        player: 1
      }
    }
  },
  // OL国战曹植 by WeiqiaoCode
  gz_ol_jiushi: {
    preHidden: true,
    group: ["gz_ol_jiushi_use", "gz_ol_jiushi_recast"],
    subSkill: {
      use: {
        trigger: {
          player: "showCharacterEnd"
        },
        filter(event2, player2) {
          const current = _status.currentPhase;
          if (!current?.isIn()) {
            return false;
          }
          const card = new lib.element.VCard({ name: "jiu", isCard: true });
          return current.hasUseTarget(card);
        },
        async cost(event2, trigger, player2) {
          const current = _status.currentPhase;
          const result2 = await player2.chooseBool({ prompt: `酒诗：是否令${get.translation(current)}视为使用一张【酒】？`, ai: () => true }).forResult();
          event2.result = {
            bool: result2.bool
          };
        },
        async content(event2, trigger, player2) {
          const current = _status.currentPhase;
          if (current?.isIn()) {
            await current.chooseUseTarget({ card: new lib.element.VCard({ name: "jiu", isCard: true }), forced: true });
          }
        }
      },
      recast: {
        trigger: {
          player: "damageEnd"
        },
        filter(event2, player2) {
          return !player2.isUnseen(0) && !player2.isUnseen(1) && player2.hasCards("he", (card) => get.suit(card) === "club" && player2.canRecast(card));
        },
        async cost(event2, trigger, player2) {
          const result2 = await player2.chooseCard({
            position: "he",
            selectCard: [1, Infinity],
            prompt: "酒诗：是否重铸任意张梅花牌并暗置曹植？",
            filterCard: (card, player3) => {
              return get.suit(card) === "club" && player3.canRecast(card);
            },
            ai: (card) => 6 - get.value(card)
          }).forResult();
          event2.result = {
            bool: result2.bool,
            cards: result2.cards
          };
        },
        async content(event2, trigger, player2) {
          await player2.recast(event2.cards);
          if (player2.name1 === "gz_ol_caozhi" && !player2.isUnseen(0)) {
            await player2.hideCharacter(0);
          } else if (player2.name2 === "gz_ol_caozhi" && !player2.isUnseen(1)) {
            await player2.hideCharacter(1);
          }
        }
      }
    }
  },
  gz_ol_zongpei: {
    preHidden: true,
    usable: 1,
    trigger: {
      global: ["loseAfter", "cardsDiscardAfter", "loseAsyncAfter"]
    },
    filter(event2, player2) {
      return lib.skill.gz_ol_zongpei.getCards(event2, player2).length > 0;
    },
    async cost(event2, trigger, player2) {
      const cards2 = lib.skill.gz_ol_zongpei.getCards(trigger, player2);
      const result2 = await player2.chooseBool({ prompt: `纵辔：是否获得${get.translation(cards2)}？`, ai: () => true }).forResult();
      event2.result = {
        bool: result2.bool
      };
    },
    async content(event2, trigger, player2) {
      const cards2 = lib.skill.gz_ol_zongpei.getCards(trigger, player2);
      if (cards2.length) {
        await player2.gain({
          cards: cards2,
          animate: "gain2"
        });
      }
    },
    isZongpeiCard(card) {
      if (get.type(card, "trick") === "trick") {
        return true;
      }
      return ["equip3", "equip4"].includes(get.subtype(card, false));
    },
    getCards(event2, player2) {
      if (event2.getParent().name === "useCard") {
        return [];
      }
      let cards2 = [];
      if (event2.name === "lose") {
        if (event2.player === player2 || event2.type === "use" || event2.position !== ui.discardPile) {
          return [];
        }
        cards2 = event2.cards2 || event2.cards || [];
      } else if (event2.name === "loseAsync") {
        for (const current of game.players.concat(game.dead)) {
          if (current === player2) {
            continue;
          }
          const evt = event2.getl(current);
          if (evt?.cards2?.length) {
            cards2.addArray(evt.cards2);
          }
        }
      } else if (event2.name === "cardsDiscard") {
        const parent = event2.getParent();
        const related = parent.name === "orderingDiscard" ? parent.relatedEvent : parent;
        const source = related?.player || event2.discarder;
        if (!source || source === player2 || related?.name === "useCard" || event2.type === "use") {
          return [];
        }
        cards2 = event2.cards || [];
      }
      return cards2.filter((card) => get.position(card, true) === "d" && lib.skill.gz_ol_zongpei.isZongpeiCard(card)).toUniqued();
    }
  },
  // OL国战孙峻 by WeiqiaoCode
  gz_ol_suchao: {
    enable: "phaseUse",
    usable: 1,
    selectTarget: [1, 3],
    multitarget: true,
    filter(event2, player2) {
      return game.hasPlayer((current) => current !== player2 && current.countCards("h") > player2.countCards("h"));
    },
    filterTarget(card, player2, target) {
      return target !== player2 && target.countCards("h") > player2.countCards("h");
    },
    async content(event2, trigger, player2) {
      const targets = event2.targets.slice(0).filter((target) => target.isIn());
      if (!targets.length) {
        return;
      }
      player2.addTempSkill("gz_ol_suchao_after", "phaseUseAfter");
      player2.markAuto("gz_ol_suchao_after", targets);
      await game.doAsyncInOrder(targets, async (target) => {
        await target.damage({ source: player2 });
      });
    },
    ai: {
      order: 7,
      result: {
        target(player2, target) {
          return get.damageEffect(target, player2, player2);
        }
      }
    },
    subSkill: {
      after: {
        charlotte: true,
        trigger: {
          player: "phaseUseEnd"
        },
        forced: true,
        popup: false,
        filter(event2, player2) {
          return player2.getStorage("gz_ol_suchao_after").some((target) => target?.isIn());
        },
        async content(event2, trigger, player2) {
          const targets = player2.getStorage("gz_ol_suchao_after").filter((target) => target?.isIn()).toUniqued();
          player2.unmarkAuto("gz_ol_suchao_after", targets);
          await game.doAsyncInOrder(targets, async (target) => {
            if (!target.isIn()) {
              return;
            }
            await target.recover();
            if (!target.isIn() || !player2.isIn()) {
              return;
            }
            const next = target.chooseToUse({
              filterCard: function(card, player3, event3) {
                return get.name(card) === "sha" && lib.filter.filterCard.apply(this, arguments);
              },
              prompt: `肃朝：是否对${get.translation(player2)}使用一张【杀】？`
            });
            next.set("targetRequired", true);
            next.set("complexSelect", true);
            next.set("complexTarget", true);
            next.set("filterTarget", function(card, player3, target2) {
              if (target2 !== _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) {
                return false;
              }
              return lib.filter.targetEnabled.apply(this, arguments);
            });
            next.set("sourcex", player2);
            next.set("addCount", false);
            await next;
          });
        }
      }
    }
  },
  gz_ol_zhulian: {
    forced: true,
    trigger: {
      global: "damageBegin1"
    },
    filter(event2, player2) {
      if (_status.currentPhase !== player2 || !event2.player?.isIn()) {
        return false;
      }
      return lib.skill.gz_ol_zhulian.hasTaoRecord(event2.player);
    },
    async content(event2, trigger, player2) {
      trigger.num++;
    },
    hasTaoRecord(target) {
      if (target.hasHistory("useCard", (evt) => evt.card?.name === "tao") || game.getGlobalHistory("useCard", (evt) => evt.card?.name === "tao" && evt.targets?.includes(target)).length) {
        return true;
      }
      return false;
    }
  },
  // OL国战蹇硕 by WeiqiaoCode
  gz_ol_shantong: {
    preHidden: true,
    trigger: {
      global: "phaseZhunbeiBegin"
    },
    filter(event2, player2) {
      const target = event2.player;
      return target?.isIn() && target.isFriendOf(player2) && !target.isUnseen(0) && !target.isUnseen(1);
    },
    async cost(event2, trigger, player2) {
      const target = trigger.player;
      const controls = ["主将", "副将"].filter((control, index) => !get.is.jun(target["name" + (index + 1)]));
      if (!controls.length) {
        return;
      }
      const next = target.chooseControl(...controls, "cancel2");
      next.set("prompt", "擅统：是否暗置一张武将牌，令此回合使用的下一张牌无距离和次数限制？");
      next.set("ai", () => {
        const controls2 = get.event().controls;
        return controls2.includes("副将") ? "副将" : controls2[0];
      });
      const result2 = await next.forResult();
      if (controls.includes(result2.control)) {
        event2.result = {
          bool: true,
          cost_data: result2.control === "主将" ? 0 : 1
        };
      }
    },
    async content(event2, trigger, player2) {
      let target = trigger.player;
      const index = event2.cost_data;
      const name = index == 0 ? target.name1 : target.name2;
      if (get.is.jun(name) || target.isUnseen(index)) {
        return;
      }
      await target.hideCharacter(index);
      if (!target.isUnseen(index)) {
        return;
      }
      target.storage.gz_ol_shantong_effect = true;
      target.storage.gz_ol_shantong_watch = {
        source: player2,
        name
      };
      target.addTempSkill("gz_ol_shantong_effect", "phaseAfter");
      target.addTempSkill("gz_ol_shantong_watch", "phaseAfter");
    },
    subSkill: {
      effect: {
        charlotte: true,
        onremove: true,
        trigger: {
          player: "useCardAfter"
        },
        forced: true,
        popup: false,
        filter(event2, player2) {
          return !!player2.storage.gz_ol_shantong_effect;
        },
        async content(event2, trigger, player2) {
          player2.removeSkill("gz_ol_shantong_effect");
        },
        mod: {
          cardUsable(card, player2) {
            if (player2.storage.gz_ol_shantong_effect) {
              return Infinity;
            }
          },
          targetInRange(card, player2) {
            if (player2.storage.gz_ol_shantong_effect) {
              return true;
            }
          }
        }
      },
      watch: {
        charlotte: true,
        onremove: true,
        trigger: {
          player: "showCharacterEnd"
        },
        forced: true,
        popup: false,
        filter(event2, player2) {
          const info = player2.storage.gz_ol_shantong_watch;
          return !!info && event2.toShow?.includes(info.name);
        },
        async content(event2, trigger, player2) {
          const info = player2.storage.gz_ol_shantong_watch;
          const source = info?.source;
          player2.removeSkill("gz_ol_shantong_watch");
          if (!source?.isIn() || !player2.isIn()) {
            return;
          }
          await player2.damage({ source });
          const cards2 = player2.getCards("h");
          if (cards2.length && source.isIn() && player2.isIn()) {
            await source.gain({
              cards: cards2,
              source: player2,
              animate: "giveAuto"
            });
          }
        }
      }
    }
  },
  gz_ol_qiuchou: {
    forced: true,
    forceDie: true,
    preHidden: true,
    trigger: {
      player: "dieAfter",
      source: "dieAfter"
    },
    filter(event2, player2) {
      if (event2.player === player2) {
        return event2.source && event2.source.isFriendOf(player2);
      }
      return event2.source === player2;
    },
    async content(event2, trigger, player2) {
      const target = trigger.player === player2 ? trigger.source : player2;
      if (target?.isIn()) {
        await target.changeVice(true);
      }
    },
    ai: {
      noDieAfter: true,
      noDieAfter2: true,
      skillTagFilter(player2, tag, target) {
        if (tag === "noDieAfter") {
          return target?.isFriendOf(player2);
        }
        return true;
      }
    }
  },
  ushio_huanxin: {
    trigger: {
      player: ["damageEnd", "useCardAfter"],
      source: "damageSource"
    },
    frequent: true,
    preHidden: true,
    filter(event2, player2, name) {
      if (name === "useCardAfter") {
        return get.type(event2.card) === "equip";
      }
      if (name === "damageEnd") {
        return true;
      }
      return event2.getParent().name === "sha";
    },
    async content(event2, trigger, player2) {
      await player2.judge().set("callback", async (event3, trigger2, player3) => {
        const card = event3.judgeResult.card;
        if (card && get.position(card, true) === "o") {
          const gainEvent = player3.gain({ cards: [card], animate: "gain2" });
          const discardEvent = player3.chooseToDiscard({ forced: true, position: "he" });
          await gainEvent;
          await discardEvent;
        }
      });
    }
  },
  ushio_xilv: {
    trigger: { player: "judgeEnd" },
    forced: true,
    preHidden: true,
    async content(event2, trigger, player2) {
      player2.addTempSkill("ushio_xilv2", { player: "phaseJieshu" });
      player2.addMark("ushio_xilv2", 1, false);
    }
  },
  ushio_xilv2: {
    onremove: true,
    charlotte: true,
    mod: {
      maxHandcard(player2, num) {
        return num + player2.countMark("ushio_xilv2");
      }
    },
    intro: {
      content: "手牌上限+#"
    }
  },
  tuqiong_range: {
    charlotte: true,
    onremove: true,
    mod: {
      targetInRange(card, player2, target) {
        if (player2.getStorage("tuqiong_range").includes(target)) {
          return true;
        }
      }
    }
  },
  yangsuiqiang_skill: {
    equipSkill: true,
    forced: true,
    trigger: { source: "damageSource" },
    filter(event2, player2) {
      return event2.card?.name == "sha" && event2.player?.isIn();
    },
    async content(event2, trigger, player2) {
      await trigger.player.damage({ nature: "fire", nosource: true });
    }
  },
  dunjiatianshu_skill: {
    equipSkill: true,
    audio: true,
    enable: "phaseUse",
    usable: 2,
    async content(event2, trigger, player2) {
      await player2.changeVice().set("repeat", true);
    },
    ai: {
      order: 8,
      result: {
        player(player2) {
          return get.guozhanRank(player2.name2, player2) <= 3 ? 1 : 0.2;
        }
      }
    }
  },
  huohuanyi_prevent: {
    equipSkill: true,
    forced: true,
    trigger: { player: "damageBegin4" },
    filter(event2, player2) {
      return event2.hasNature();
    },
    async content(event2, trigger, player2) {
      trigger.cancel();
    }
  },
  huohuanyi_damage: {
    equipSkill: true,
    ai: {
      effect: {
        target(card, player2, target) {
          if (card.name != "sha" || !target.countCards("h") || get.attitude(target, player2) >= 0) {
            return;
          }
          const hasTengjia = player2.getEquips("tengjia").length > 0 && !player2.hasSkillTag("unequip2");
          const cannotSave = player2.hp <= 1 && !player2.countCards("hs", (card2) => get.tag(card2, "save")) && !player2.hasSkillTag("save", true);
          if (hasTengjia || cannotSave) {
            return [0, 0, 0, -1];
          }
        }
      }
    },
    trigger: { target: "useCardToTargeted" },
    filter(event2, player2) {
      return event2.card?.name == "sha" && event2.player?.isIn() && player2.countCards("h") > 0;
    },
    async content(event2, trigger, player2) {
      const result2 = await player2.chooseToDiscard({ position: "h", prompt: `是否弃置一张手牌，对${get.translation(trigger.player)}造成1点火焰伤害？` }).set("ai", (card) => {
        if (get.damageEffect(trigger.player, player2, player2, "fire") <= 0) {
          return 0;
        }
        return 6 - get.value(card);
      }).forResult();
      if (result2.bool) {
        await trigger.player.damage({ nature: "fire" });
      }
    }
  },
  zhanshejian_skill: {
    equipSkill: true,
    forced: true,
    trigger: { source: "damageSource" },
    filter(event2, player2) {
      return event2.card?.name == "sha";
    },
    async content(event2, trigger, player2) {
      if (player2.isDamaged()) {
        await player2.recover();
      }
      if (trigger.player?.isIn() && (get.is.jun(trigger.player.name1) || trigger.player.identity == "ye")) {
        await trigger.player.die(player2);
      }
    }
  },
  baiqilin_skill: {
    equipSkill: true,
    forced: true,
    trigger: { player: "useCardAfter" },
    filter(event2, player2) {
      return event2.card?.name == "baiqilin";
    },
    async content(event2, trigger, player2) {
      const hp = player2.hp;
      const targets = game.filterPlayer((current) => current.isIn() && current != player2 && current.hp > hp).sortBySeat();
      for (const target of targets) {
        if (target.isIn()) {
          await target.damage({ nature: "thunder", nosource: true });
        }
      }
    }
  },
  yingwubei_skill: {
    equipSkill: true,
    audio: true,
    enable: "chooseToUse",
    usable: 9,
    hiddenCard(player2, name) {
      return name == "jiu" && player2.hasCard((card) => card.name == "yingwubei", "e");
    },
    filter(event2, player2) {
      if (!player2.hasCard((card) => card.name == "yingwubei", "e")) return false;
      return event2.filterCard(get.autoViewAs({ name: "jiu", isCard: true }, "unsure"), player2, event2);
    },
    viewAs(cards2, player2) {
      return { name: "jiu", isCard: true };
    },
    filterCard: () => false,
    selectCard: -1,
    prompt: "将牌堆顶的牌当【酒】使用",
    log: false,
    async precontent(event2, trigger, player2) {
      player2.logSkill("yingwubei_skill");
      const cards2 = get.cards();
      event2.result.card = get.autoViewAs({ name: "jiu", isCard: true }, cards2);
      event2.result.cards = cards2;
      game.cardsGotoOrdering(cards2);
    },
    ai: {
      order: 4,
      result: {
        player(player2) {
          return player2.hp <= 1 ? 1 : 0.4;
        }
      }
    }
  },
  jiuzhouding_skill: {
    equipSkill: true,
    forced: true,
    trigger: { player: "equipAfter" },
    filter(event2, player2) {
      return _status.mode == "jiubian" && !_status.overing && player2.hasCard((card) => card.name == "jiuzhouding", "e") && player2.countCards("e", (card) => isJiubianQizhen(card)) >= 4;
    },
    async content(event2, trigger, player2) {
      game.broadcastAll((id) => {
        game.winner_id = id;
      }, player2.playerid);
      game.log(player2, "因", "#y九州鼎", "达成胜利条件");
      game.checkResult();
    }
  },
  tianlu_skill: {
    equipSkill: true,
    charlotte: true,
    forced: true,
    silent: true,
    trigger: {
      player: ["equipAfter", "showCharacterEnd", "changeGroupAfter"],
      global: ["gameStart", "showCharacterEnd", "changeGroupAfter", "dieAfter", "phaseBefore"]
    },
    lordSkillMap: {
      wei: "jianan",
      shu: "shouyue",
      wu: "jiahe",
      qun: "hongfa",
      jin: "gz_jiaping"
    },
    lordMarkMap: {
      jianan: "wuziliangjiangdao",
      shouyue: "wuhujiangdaqi",
      jiahe: "yuanjiangfenghuotu",
      hongfa: "huangjintianbingfu",
      gz_jiaping: "bahuangsishiling"
    },
    getLordSkill(player2) {
      if (_status.mode != "jiubian" || !player2?.isIn?.() || !player2.hasCard((card) => card.name == "tianlu", "e")) {
        return null;
      }
      const group = player2.identity;
      if (!group || group == "unknown" || group == "ye") {
        return null;
      }
      const skill = lib.skill.tianlu_skill.lordSkillMap[group];
      if (!skill || !lib.skill[skill]) {
        return null;
      }
      if (game.hasPlayer((current) => current != player2 && get.is.jun(current) && !current.isUnseen() && current.isFriendOf(player2))) {
        return null;
      }
      return skill;
    },
    isTianluZhu(player2, skill, group) {
      if (!skill || group && player2.identity != group) {
        return false;
      }
      return lib.skill.tianlu_skill.getLordSkill(player2) == skill;
    },
    clear(player2) {
      const skill = player2.storage.tianlu_skill;
      if (skill) {
        player2.removeAdditionalSkill("tianlu_skill");
        const mark = lib.skill.tianlu_skill.lordMarkMap[skill];
        if (mark) {
          player2.unmarkSkill(mark);
        }
        delete player2.storage.tianlu_skill;
      }
    },
    onremove(player2) {
      lib.skill.tianlu_skill.clear(player2);
    },
    filter(event2, player2) {
      return _status.mode == "jiubian";
    },
    async content(event2, trigger, player2) {
      const skill = lib.skill.tianlu_skill.getLordSkill(player2);
      const oldSkill = player2.storage.tianlu_skill;
      if (oldSkill == skill) {
        return;
      }
      if (oldSkill) {
        await player2.removeAdditionalSkills("tianlu_skill");
        const mark = lib.skill.tianlu_skill.lordMarkMap[oldSkill];
        if (mark) {
          player2.unmarkSkill(mark);
        }
        delete player2.storage.tianlu_skill;
      }
      if (skill) {
        player2.storage.tianlu_skill = skill;
        await player2.addAdditionalSkills("tianlu_skill", skill);
      }
    }
  },
  _jiubian_tianlu_cleanup: {
    trigger: { global: ["loseAfter", "equipAfter", "dieAfter", "phaseBefore"] },
    forced: true,
    silent: true,
    filter(event2, player2) {
      return _status.mode == "jiubian" && player2.storage.tianlu_skill && !player2.hasCard((card) => card.name == "tianlu", "e");
    },
    async content(event2, trigger, player2) {
      lib.skill.tianlu_skill.clear(player2);
    }
  },
  _jiuzhouding_place: {
    trigger: { global: ["gameStart", "washCard"] },
    forced: true,
    silent: true,
    filter(event2, player2) {
      return isJiubianCardRuleActive() && Array.from(ui.cardPile.childNodes).some((card) => card.name == "jiuzhouding");
    },
    async content(event2, trigger, player2) {
      syncJiubianQizhenTags();
      const cards2 = Array.from(ui.cardPile.childNodes).filter((card) => card.name == "jiuzhouding");
      if (cards2.length) {
        await game.cardsDiscard(cards2);
      }
      syncJiubianQizhenTags();
    }
  },
  _jiubian_qizhen_viewer: {
    trigger: { global: "gameStart" },
    forced: true,
    silent: true,
    filter(event2, player2) {
      return _status.mode == "jiubian" || get.mode() == "guozhan" && jiubianQizhenNames.some((name) => lib.card[name]) || ui.gzQizhenButton || ui.gzQizhenFloatButton;
    },
    async content(event2, trigger, player2) {
      if (_status.mode != "jiubian" && !(get.mode() == "guozhan" && jiubianQizhenNames.some((name) => lib.card[name]))) {
        if (ui.gzQizhenButton?.close) {
          ui.gzQizhenButton.close();
        } else {
          ui.gzQizhenButton?.remove?.();
        }
        ui.gzQizhenFloatButton?.remove?.();
        delete ui.gzQizhenButton;
        delete ui.gzQizhenFloatButton;
        return;
      }
      syncJiubianQizhenTags();
      const openQizhen = () => {
        syncJiubianQizhenTags();
        const cards2 = Array.from(ui.discardPile.childNodes).filter((card) => isJiubianQizhen(card));
        const dialog = ui.create.dialog("弃牌堆中的奇珍牌", "peaceDialog");
        if (cards2.length) {
          dialog.add(cards2, true);
          for (const button of dialog.buttons) {
            lib.setIntro(button);
            button.oncontextmenu = ui.click.rightplayer;
          }
        } else {
          dialog.addText("弃牌堆中没有奇珍牌");
        }
        const closeButton = ui.create.div("", dialog);
        closeButton.innerHTML = "X";
        closeButton.style.cssText = "position:absolute;right:10px;top:8px;z-index:10;width:30px;height:30px;border-radius:15px;background:rgba(20,20,20,0.72);border:1px solid rgba(255,255,255,0.45);color:#fff;font:bold 22px/30px sans-serif;text-align:center;text-shadow:0 1px 2px #000;cursor:pointer;pointer-events:auto;";
        closeButton.listen((e) => {
          e.stopPropagation();
          dialog.close();
        });
        dialog._close = dialog.close;
        dialog.hide = dialog.close = function(...args) {
          closeButton.remove();
          if (_status.jiubianQizhenDialog == dialog) {
            delete _status.jiubianQizhenDialog;
          }
          return dialog._close(...args);
        };
        if (_status.jiubianQizhenDialog) {
          _status.jiubianQizhenDialog.close();
        }
        _status.jiubianQizhenDialog = dialog;
        dialog.open();
      };
      if (ui.gzQizhenButton) {
        if (ui.gzQizhenButton.close) {
          ui.gzQizhenButton.close();
        } else {
          ui.gzQizhenButton.remove?.();
        }
        delete ui.gzQizhenButton;
      }
      if (!ui.gzQizhenFloatButton && ui.window) {
        ui.gzQizhenFloatButton = ui.create.div("", ui.window);
        ui.gzQizhenFloatButton.innerHTML = "奇珍";
        ui.gzQizhenFloatButton.style.cssText = "position:absolute;z-index:999;padding:7px 12px;border:1px solid rgba(255,224,160,0.95);border-radius:4px;background:rgba(35,25,12,0.9);box-shadow:0 0 8px rgba(0,0,0,0.45);color:#ffe0a0;font-weight:bold;font-size:16px;line-height:1.1;text-shadow:0 1px 2px #000;pointer-events:auto;cursor:move;user-select:none;touch-action:none;";
        const setFloatPosition = (left, top) => {
          const maxLeft = Math.max(0, ui.window.offsetWidth - ui.gzQizhenFloatButton.offsetWidth - 4);
          const maxTop = Math.max(0, ui.window.offsetHeight - ui.gzQizhenFloatButton.offsetHeight - 4);
          ui.gzQizhenFloatButton.style.transition = "none";
          ui.gzQizhenFloatButton.style.animation = "none";
          ui.gzQizhenFloatButton.style.transform = "none";
          ui.gzQizhenFloatButton.style.left = `${Math.max(4, Math.min(maxLeft, left))}px`;
          ui.gzQizhenFloatButton.style.top = `${Math.max(4, Math.min(maxTop, top))}px`;
          ui.gzQizhenFloatButton.style.right = "auto";
        };
        const savedPosition = (() => {
          try {
            return JSON.parse(localStorage.getItem("jiubian_qizhen_float_position") || "null");
          } catch (e) {
            return null;
          }
        })();
        requestAnimationFrame(() => {
          if (savedPosition && typeof savedPosition.left == "number" && typeof savedPosition.top == "number") {
            setFloatPosition(savedPosition.left, savedPosition.top);
          } else {
            setFloatPosition(ui.window.offsetWidth - ui.gzQizhenFloatButton.offsetWidth - 12, 142);
          }
        });
        let dragInfo = null;
        const saveFloatPosition = () => {
          localStorage.setItem(
            "jiubian_qizhen_float_position",
            JSON.stringify({
              left: parseFloat(ui.gzQizhenFloatButton.style.left) || 0,
              top: parseFloat(ui.gzQizhenFloatButton.style.top) || 0
            })
          );
        };
        const stopDrag = () => {
          document.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerup", onUp);
          document.removeEventListener("pointercancel", stopDrag);
        };
        const onMove = (e) => {
          if (!dragInfo) return;
          const dx = e.clientX - dragInfo.x;
          const dy = e.clientY - dragInfo.y;
          if (Math.abs(dx) + Math.abs(dy) > 4) {
            dragInfo.moved = true;
          }
          setFloatPosition(dragInfo.left + dx, dragInfo.top + dy);
          e.preventDefault();
          e.stopPropagation();
        };
        const onUp = (e) => {
          if (!dragInfo) return;
          const moved = dragInfo.moved;
          dragInfo = null;
          stopDrag();
          ui.gzQizhenFloatButton.releasePointerCapture?.(e.pointerId);
          saveFloatPosition();
          if (!moved) {
            openQizhen();
          }
          e.preventDefault();
          e.stopPropagation();
        };
        ui.gzQizhenFloatButton.addEventListener("pointerdown", (e) => {
          if (e.button && e.button != 0) return;
          ui.gzQizhenFloatButton.setPointerCapture?.(e.pointerId);
          ui.gzQizhenFloatButton.style.transition = "none";
          ui.gzQizhenFloatButton.style.animation = "none";
          ui.gzQizhenFloatButton.style.transform = "none";
          dragInfo = {
            x: e.clientX,
            y: e.clientY,
            left: parseFloat(ui.gzQizhenFloatButton.style.left) || ui.gzQizhenFloatButton.offsetLeft,
            top: parseFloat(ui.gzQizhenFloatButton.style.top) || ui.gzQizhenFloatButton.offsetTop,
            moved: false
          };
          document.addEventListener("pointermove", onMove);
          document.addEventListener("pointerup", onUp);
          document.addEventListener("pointercancel", stopDrag);
          e.preventDefault();
          e.stopPropagation();
        });
      }
    }
  },
  _jiubian_lveshan_mod: {
    mod: {
      cardname(card, player2) {
        if (isJiubianCardRuleActive() && card.name == "lveshan") {
          return "shan";
        }
      }
    }
  },
  _jiubian_lveshan_gain: {
    trigger: { player: "useCardAfter" },
    direct: true,
    isLveshanCard(card) {
      if (!card) return false;
      if (card.name == "lveshan" || card.viewAs == "lveshan") return true;
      if (Array.isArray(card.cards)) {
        return card.cards.some((cardx) => lib.skill._jiubian_lveshan_gain.isLveshanCard(cardx));
      }
      return false;
    },
    filter(event2, player2) {
      const respondTo = Array.isArray(event2.respondTo) ? event2.respondTo : [];
      const source = respondTo[0];
      const card = respondTo[1];
      return isJiubianCardRuleActive() && Array.isArray(event2.cards) && event2.cards.some((cardx) => lib.skill._jiubian_lveshan_gain.isLveshanCard(cardx)) && card?.name == "sha" && source?.isIn?.() && source.countCards("e", (cardx) => isJiubianQizhen(cardx)) > 0;
    },
    async content(event2, trigger, player2) {
      const respondTo = trigger.respondTo;
      const source = respondTo[0];
      const isQizhen = (card) => get.cardtag(card, "qizhen") || get.cardtag(card, "gz_qizhen");
      const cards2 = source.getCards("e", (card) => isQizhen(card));
      if (!cards2.length) {
        return;
      }
      const result2 = await player2.chooseBool({ prompt: `是否获得${get.translation(source)}装备区内的一张奇珍牌？` }).set("ai", () => true).forResult();
      if (!result2.bool || !source?.isIn?.()) {
        return;
      }
      const currentCards = source.getCards("e", (card) => isQizhen(card));
      if (!currentCards.length) {
        return;
      }
      if (currentCards.length == 1) {
        await player2.gain({ cards: [currentCards[0]], source, animate: "giveAuto" });
        return;
      }
      await player2.gainPlayerCard({ target: source, position: "e", forced: true }).set("filterButton", (button) => currentCards.includes(button.link) || isQizhen(button.link));
    }
  },
  _gz_jiubian_qizhen_rule: {
    trigger: { player: "damageEnd" },
    forced: true,
    silent: true,
    priority: -10,
    filter(event2, player2) {
      return isJiubianCardRuleActive() && event2.source?.isIn() && event2.card?.name == "sha" && player2.countCards("e", (card) => isJiubianQizhen(card)) > 0;
    },
    async content(event2, trigger, player2) {
      const source = trigger.source;
      const isQizhen = (card) => get.cardtag(card, "qizhen") || get.cardtag(card, "gz_qizhen");
      const cards2 = player2.getCards("e", (card) => isQizhen(card));
      if (!source?.isIn() || !cards2.length) {
        return;
      }
      const result2 = await source.chooseBool({ prompt: `是否获得${get.translation(player2)}装备区内的一张奇珍牌？` }).set("ai", () => true).forResult();
      if (!result2.bool) {
        return;
      }
      const currentCards = player2.getCards("e", (card) => isQizhen(card));
      if (!currentCards.length) {
        return;
      }
      await source.gainPlayerCard({ target: player2, position: "e", forced: true }).set("filterButton", (button) => isQizhen(button.link));
    }
  }
};
const translate = {
  junling: "军令",
  junling1: "军令一",
  junling1_bg: "令",
  junling1_info: "若被执行，执行者对发起者指定的一名角色造成1点伤害。",
  junling2: "军令二",
  junling2_bg: "令",
  junling2_info: "若被执行，执行者摸一张牌，然后依次交给发起者两张牌。",
  junling3: "军令三",
  junling3_bg: "令",
  junling3_info: "若被执行，执行者失去1点体力。",
  junling4: "军令四",
  junling4_bg: "令",
  junling4_info: "若被执行，直到回合结束，执行者不能使用或打出手牌且非锁定技全部失效。",
  junling4_eff: "军令四",
  junling5: "军令五",
  junling5_bg: "令",
  junling5_info: "若被执行，执行者将武将牌叠置，且不能回复体力直到回合结束。",
  junling5_eff: "军令五",
  junling6: "军令六",
  junling6_bg: "令",
  junling6_info: "若被执行，执行者选择一张手牌和一张装备区内牌（若有），然后弃置其余的牌。",
  duoduo: "咄咄逼人",
  duoduo_info: "出牌阶段，对一名确定势力的角色使用。目标角色可以变更副将，然后你对其造成1点伤害。",
  qiaoqu: "巧取豪夺",
  qiaoqu_info: "出牌阶段，对至多两名其他角色使用。目标角色依次展示所有手牌，然后你获得其所有因此展示的装备牌。",
  fendao: "分道扬镳",
  fendao_info: "此牌可被重铸。出牌阶段，对一名与你势力相同的其他角色使用。你摸六张牌并交给目标角色三张手牌，然后你成为野心家。",
  tuqiong: "图穷匕见",
  tuqiong_info: "出牌阶段，对一名其他角色使用。你选择弃牌堆中一张奇珍牌，目标角色使用之；目标角色本回合视为在你的攻击范围内。",
  gouwei: "狗尾续貂",
  gouwei_info: "出牌阶段，对所有角色使用。每名目标角色依次选择并使用弃牌堆中的一张奇珍牌；若弃牌堆中没有奇珍牌，其改为摸一张牌。",
  lveshan: "掠闪",
  lveshan_info: "抵消以你为目标的【杀】；然后你可以获得此【杀】使用者装备区内的一张奇珍牌。",
  yangsuiqiang: "阳燧枪",
  yangsuiqiang_skill: "阳燧枪",
  yangsuiqiang_info: "锁定技，当你使用【杀】对目标角色造成伤害后，其再受到1点无来源火焰伤害。",
  dunjiatianshu: "遁甲天书",
  dunjiatianshu_skill: "遁甲天书",
  dunjiatianshu_info: "出牌阶段限两次，你可以变更副将。",
  huohuanyi: "火浣衣",
  huohuanyi_prevent: "火浣衣",
  huohuanyi_damage: "火浣衣",
  huohuanyi_info: "锁定技，防止你受到的属性伤害。当你成为【杀】的目标后，你可以弃置一张手牌，对使用者造成1点火焰伤害。",
  zhanshejian: "斩蛇剑",
  zhanshejian_skill: "斩蛇剑",
  zhanshejian_info: "你使用【杀】对目标角色造成伤害后，你回复1点体力，若其为君主或野心家，杀死该角色。",
  baiqilin: "白麒麟",
  baiqilin_skill: "白麒麟",
  baiqilin_info: "其他角色计算与你的距离+2。你使用此牌时，对所有体力值大于你的角色依次造成1点雷电伤害。",
  yingwubei: "鹦鹉杯",
  yingwubei_skill: "鹦鹉杯",
  yingwubei_info: "每回合限九次，你可以将牌堆顶的牌当【酒】使用。",
  jiuzhouding: "九州鼎",
  jiuzhouding_skill: "九州鼎",
  jiuzhouding_info: "分发手牌前或洗牌后，将此牌从牌堆内置于弃牌堆。锁定技，若你装备区内有四张或以上奇珍牌，你当前阵营获得游戏胜利。",
  tianlu: "天禄",
  tianlu_skill: "天禄",
  tianlu_info: "你计算与其他角色的距离-3。若场上没有与你势力相同的君主，你视为拥有你势力的君主技。"
};
const jiubianExtra = [
  ["spade", 10, "duoduo"],
  ["spade", 11, "duoduo"],
  ["club", 12, "duoduo"],
  ["club", 13, "duoduo"],
  ["club", 1, "tuqiong"],
  ["club", 2, "tuqiong"],
  ["club", 11, "tuqiong"],
  ["spade", 12, "wuxie"],
  ["spade", 13, "wuxie"],
  ["diamond", 13, "wuxie", null, ["guo"]],
  ["spade", 1, "zhanshejian"],
  ["spade", 2, "baiqilin"],
  ["diamond", 11, "yangsuiqiang"],
  ["diamond", 12, "huohuanyi"],
  ["spade", 3, "dunjiatianshu"],
  ["club", 3, "tianlu"],
  ["heart", 9, "yingwubei"],
  ["heart", 13, "jiuzhouding"],
  ["heart", 8, "lveshan"],
  ["heart", 10, "lveshan"],
  ["heart", 11, "lveshan"],
  ["heart", 12, "lveshan"],
  ["heart", 4, "tao"],
  ["heart", 5, "tao"],
  ["heart", 6, "tao"],
  ["heart", 7, "sha", "fire"],
  ["diamond", 3, "sha", "fire"],
  ["diamond", 4, "sha", "fire"],
  ["diamond", 5, "tao"],
  ["diamond", 6, "shan"],
  ["diamond", 7, "shan"],
  ["diamond", 8, "shan"],
  ["diamond", 9, "sha"],
  ["club", 4, "sha"],
  ["club", 5, "sha"],
  ["club", 6, "sha"],
  ["club", 7, "sha"],
  ["club", 8, "sha", "thunder"],
  ["club", 9, "jiu"],
  ["club", 10, "sha"],
  ["spade", 4, "sha"],
  ["spade", 5, "sha"],
  ["spade", 6, "sha", "thunder"],
  ["spade", 7, "sha", "thunder"],
  ["spade", 8, "sha", "thunder"],
  ["spade", 9, "jiu"],
  ["diamond", 1, "gouwei"],
  ["diamond", 2, "gouwei"],
  ["heart", 2, "fendao"],
  ["heart", 1, "qiaoqu"],
  ["heart", 3, "qiaoqu"],
  ["diamond", 10, "qiaoqu"]
];
const type = "card";
const cardNames = ["duoduo", "qiaoqu", "fendao", "tuqiong", "gouwei", "lveshan", "zhanshejian", "yangsuiqiang", "huohuanyi", "baiqilin", "tianlu", "yingwubei", "dunjiatianshu", "jiuzhouding"];
const skillNames = ["yangsuiqiang_skill", "dunjiatianshu_skill", "huohuanyi_prevent", "huohuanyi_damage", "zhanshejian_skill", "baiqilin_skill", "yingwubei_skill", "jiuzhouding_skill", "tianlu_skill"];
const ruleSkillNames = ["_jiuzhouding_place", "_jiubian_qizhen_viewer", "_jiubian_lveshan_mod", "_jiubian_lveshan_gain", "_gz_jiubian_qizhen_rule"];
const pick = (source, names) => {
  const result2 = {};
  for (const name of names) {
    if (source[name]) {
      result2[name] = source[name];
    }
  }
  return result2;
};
const jiubian = {
  name: "jiubian",
  connect: true,
  card: pick(cards, cardNames),
  skill: {
    ...pick(cards, skillNames),
    ...pick(guozhanSkills, ruleSkillNames)
  },
  translate: {
    jiubian: "九变篇",
    ...pick(
      translate,
      cardNames.concat(
        cardNames.map((name) => `${name}_info`),
        skillNames,
        skillNames.map((name) => `${name}_info`)
      )
    ),
    jiubian_cardsInfo: "<li>此包为国战九变篇补充牌，共52张，须与国战标准版牌堆（108张）混合使用。<br><li>不能与势备篇牌堆同时使用。<br><li>此包中的8张装备牌均带有“奇珍”规则。<br><li>武将皮肤感谢B站UP主星河依旧长明0929提供。"
  },
  list: jiubianExtra,
  help: {
    九变篇: '<div style="margin:10px">奇珍</div><ul style="margin-top:0"><li>此扩展包中的8张装备牌均有奇珍标记。<br><li>装备区里拥有奇珍牌的角色受到【杀】造成的伤害后，伤害来源可以获得其装备区内的一张奇珍牌。<br><li>奇珍牌进入弃牌堆时仍属于弃牌堆，洗牌时正常洗入新牌堆。</ul>'
  }
};
export {
  jiubian as default,
  type
};
