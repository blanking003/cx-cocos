import * as cc from 'cc';

import res from "./cx.res";
import sys from "./cx.sys";
import native from "./cx.native";

export default class ui 
{
	static sw: number = 0;
	static sh: number = 0;

	static mainScene: cc.Component;
	static rootNode: RootNode;
	static uid: number = 0;

    // 在页面组件脚本中，设置页面的以下参数可以改变出入场动画
	// initPx: cx.sw,
	// initPy: 0,
	// moveInAction: null,
	// moveOutAction: null,
	// nextInAction: null,
	// nextOutAction: null,

    static defaultInitPx: number = 0;
    static defaultInitPy: number = 0;
    static defaultMoveInAction: cc.Tween<any>;
    static defaultMoveOutAction: cc.Tween<any>;
    static defaultNextInAction: cc.Tween<any>;
    static defaultNextOutAction: cc.Tween<any>;
    static touchLockTimelen = 250; //ms
    static touchPriorSecond = 0;

	static androidKeyBackHandler: any;

	static init (mainScene: cc.Component)
	{
		var size = cc.view.getCanvasSize();
		if (Math.ceil(size.height) < sys.config.designSizeMinHeight)
			cc.view.setDesignResolutionSize(cc.view.getDesignResolutionSize().width, cc.view.getDesignResolutionSize().height, cc.ResolutionPolicy.FIXED_HEIGHT);
		else if (Math.ceil(size.width) < sys.config.designSizeMinWidth)
			cc.view.setDesignResolutionSize(cc.view.getDesignResolutionSize().width, cc.view.getDesignResolutionSize().height, cc.ResolutionPolicy.FIXED_WIDTH);
		size = cc.view.getVisibleSize();

		this.sw = Math.round(size.width);
		this.sh = Math.round(size.height);
		
		this.defaultInitPx = this.sw;
		this.defaultInitPy = 0;
		this.defaultMoveInAction = cc.tween(this.rootNode).delay(0.1).to(0.55, {position:cc.v3(0, undefined)}, {easing: "expoOut"});
		this.defaultMoveOutAction = cc.tween().to(0.55, {position:cc.v3(ui.sw)}, {easing: "expoOut"});
		this.defaultNextInAction = cc.tween().delay(0.1).to(0.55, {position:cc.v3(-this.sw*0.3, undefined)}, {easing:"expoOut"});
		this.defaultNextOutAction = cc.tween().to(0.55, {position:cc.v3(0)}, {easing:"expoOut"});

		this.mainScene = mainScene;
		this.rootNode = new RootNode();
		mainScene.node.addChild(this.rootNode);
		this.addPage(this.rootNode, sys.config.startPage, undefined, !sys.config.autoRemoveLaunchImage ? undefined : this.removeLaunchImage);
		cc.assetManager.loadBundle("cx.prefab");
	}

	static removeLaunchImage ()
	{
		sys.os.native && native.ins("cx.sys").call("removeLaunchImage", []);
	}

	//将节点放入map
	static makeNodeMap (node: any)
	{
		node._nodeMap = {};
		var f = function(e: any)
		{
			node._nodeMap[e.name] = e;
			for (var i in e.children)
				f(e.children[i]);
		};
		f(node);
	}

	//从map取出节点
	static gn (pageOrNode: any, name: string)
	{
		var node = (pageOrNode instanceof cc.Component) && pageOrNode.node ? pageOrNode.node : pageOrNode;
		return node && node._nodeMap && node._nodeMap[name];
	}

    static hint (content: string)
	{
		res.loadBundleRes("cx.prefab/cx.hint", (asset: any) =>
		{
			var page = cc.instantiate(asset.data);
			page.name = "cx.hint";
			ui.makeNodeMap(page);
			var lblHint: cc.Node = ui.gn(page, "lblHint");
			var priorHint;
			for (var i in ui.mainScene.node.children)
			{
				var n = ui.mainScene.node.children[i];
				if (n.name == "cx.hint")
				{
					n.name = "cx.hint.prior";
					priorHint = n;
					break;
				}
			}
			lblHint.getComponent(cc.Label)!.color = cc.color(sys.config.hintFontColor);
			lblHint.getComponent(cc.Label)!.fontSize = sys.config.hintFontSize;
			lblHint.getComponent(cc.LabelOutline)!.width = sys.config.hintFontOutlineWidth;
			lblHint.getComponent(cc.LabelOutline)!.color = cc.color(sys.config.hintFontOutlineColor);
			lblHint.getComponent(cc.Label)!.string = content;
			lblHint.setScale(0.5, 0.5);
			if (priorHint)
				lblHint.setPosition(lblHint.getPosition().x, Math.min(-30, ui.gn(priorHint, "lblHint").getPosition().y - 50));
			ui.mainScene.node.addChild(page);
			cc.tween(lblHint).to(0.1, {scale:cc.v3(1,1,1)}).by(1.5, {position:cc.v3(undefined,30)}).by(0.2, {position: cc.v3(undefined, 20)}).call(()=>{page.destroy();}).start();
			cc.tween(lblHint.getComponent(cc.UIOpacity)).delay(1.5).to(0.2, {opacity: 0}).start();
		});
	}

	static alert (content: string, callback?: Function, labelOk?: string)
	{
		ui.setAndroidBackHandler(true);
		res.loadBundleRes("cx.prefab/cx.alert", function(asset: any)
		{
			var page = cc.instantiate(asset.data);
			page.name = "cx.alert";
			page.content = content;
			page.callback = callback;
			ui.makeNodeMap(page);
			page.on(cc.Node.EventType.TOUCH_START, (event: cc.EventTouch) =>
			{
				event.propagationStopped = true;
			});

			if (labelOk)
				ui.gn(page, "lblOk").getComponent(cc.Label).string = labelOk;

			var lblContent: cc.Node = ui.gn(page, "lblContent");
			lblContent.getComponent(cc.Label)!.string = content;
			lblContent.getComponent(cc.Label)!.updateRenderData(true); //更新Label高度
			var contentHeight = Math.max(400, lblContent.getComponent(cc.UITransform)!.height + 140);
			var nodeContent: cc.Node = ui.gn(page, "nodeContent");
			nodeContent.getComponent(cc.UITransform)!.height = contentHeight;
			nodeContent.setScale(1.2, 1.2);
			ui.mainScene.node.addChild(page);
			
			cc.tween(nodeContent).to(0.15, {scale:cc.v3(1,1,1)}).start();
			cc.tween(ui.gn(page, "mask").getComponent(cc.UIOpacity)).to(0.15, {opacity:90}).start();
			ui.setNativeMaskMask((ui.sw-600)/2, (ui.sh+contentHeight)/2, 600, contentHeight, 14);
			ui.gn(page, "spOk").setTouchCallback(page, function()
			{
				ui.clearNativeMaskMask();
				ui.setAndroidBackHandler();
				page.destroy();
				callback && callback();
			});
		});
	}

	static confirm (content: string, callback?: Function, labelOk?: string, labelCancel?: string)
	{
		ui.setAndroidBackHandler(true);
		res.loadBundleRes("cx.prefab/cx.confirm", function(asset: any)
		{
			var page = cc.instantiate(asset.data);
			page.name = "cx.confirm";
			page.content = content;
			page.callback = callback;
			ui.makeNodeMap(page);
			page.on(cc.Node.EventType.TOUCH_START, (event: cc.EventTouch) =>
			{
				event.propagationStopped = true;
			});

			if (labelOk)
				ui.gn(page, "lblOk").getComponent(cc.Label).string = labelOk;

			if (labelCancel)
				ui.gn(page, "lblCancel").getComponent(cc.Label).string = labelCancel;

			var lblContent = ui.gn(page, "lblContent");
			lblContent.getComponent(cc.Label)!.string = content;
			lblContent.getComponent(cc.Label)!.updateRenderData(true); //更新Label高度
			ui.gn(page, "nodeContent").getComponent(cc.UITransform)!.height = Math.max(400, lblContent.getComponent(cc.UITransform)!.height + 140);
			ui.mainScene.node.addChild(page);

			var nodeContent = ui.gn(page, "nodeContent");
			nodeContent.setScale(1.2, 1.2);
			cc.tween(nodeContent).to(0.15, {scale:cc.v3(1, 1, 1)}).start();
			cc.tween(ui.gn(page, "mask").getComponent(cc.UIOpacity)).to(0.15, {opacity:90}).start();
			ui.gn(page, "spOk").setTouchCallback(page, function()
			{
				ui.setAndroidBackHandler();
				page.destroy();
				callback && callback(true);
			});
			ui.gn(page, "spCancel").setTouchCallback(page, function()
			{
				ui.setAndroidBackHandler();
				page.destroy();
				callback && callback(false);
			});
		});
	}

	static showLoading (page: cc.Component, parentNode: any, delayShowSeconds: number = 0)
	{
		if (parentNode._loadingInDelay || parentNode.getChildByName("cx.loadingNode"))
			return;
		var createLoading = function(dt?: number)
		{
			if (dt && !parentNode._loadingInDelay)
				return;
			var imageNode = new cc.Node();
			imageNode.name = "cx.loadingNode";
			imageNode.setScale(0.45, 0.45);
			res.setImageFromBundle(imageNode, "cx.prefab/s_loading", cc.Sprite.SizeMode.TRIMMED);
			parentNode.addChild(imageNode);
			cc.tween(imageNode).repeatForever(cc.tween().by(0, {angle: -30}).delay(0.07)).start();
		};
		parentNode._loadingEnabled = true;
		if (delayShowSeconds > 0)
		{
			parentNode._loadingInDelay = true;
			page.scheduleOnce(createLoading, delayShowSeconds);
		}
		else
			createLoading();
	}

	static removeLoading (parentNode: any)
	{
		var loadingNode = parentNode.getChildByName("cx.loadingNode");
		if (loadingNode)
			loadingNode.removeFromParent();
		if (parentNode._loadingInDelay)
			delete parentNode._loadingInDelay;
	}

	static getTopPage (fromLast?: number): any
	{
		fromLast = fromLast || 0;
		var match = 0;
		for (var i = this.rootNode.children.length - 1; i>=0; i--)
		{
			var page = this.rootNode.children[i];
			if (page.active && !page.ignoreTopPage)
			{
				if (++match > -fromLast)
					return page;
			}
		}
	}

	static addPage (parent:cc.Node, prefab:string, scripts?:string[], callbackOrParams?:any, runAction?:boolean)
	{
		ui.touchLockTimelen = -1;
		res.loadBundleRes(prefab, (asset: any) =>
		{
			var p = prefab.indexOf("/");
			var script = p ? prefab.substr(prefab.lastIndexOf("/") + 1) : prefab; //script = page1(.ts)
			scripts = scripts || [script];
			var node = cc.instantiate(asset.data);
			var cxuiPageScript = node.addComponent("cxui.page");
			for (var i in scripts)
				if (cc.js.getClassByName(scripts[i]))
					node.addComponent(scripts[i]);
			node.mainComponent = script && node.getComponent(script);
			parent.addChild(node);
			if (callbackOrParams != null)
			{
				if (typeof callbackOrParams == "function")
					callbackOrParams(node);
				else if (node.mainComponent)
					node.mainComponent.contextParams = callbackOrParams;
			}
			if (runAction)
				cxuiPageScript.runActionShow();
			ui.touchLockTimelen = 500;
		});
	}

	static showPage (prefab:string, scripts?:string[], callbackOrParams?:any)
	{
		if (arguments.length == 1 || typeof arguments[0] == "string")
			ui.addPage(ui.rootNode, prefab, scripts, callbackOrParams, true);
		else //for touchCallback
			ui.addPage(ui.rootNode, arguments[1], undefined, undefined, true);
	}

	static closePage (sender: any)
	{
		var node: any = sender instanceof cc.Component ? sender.node : (this instanceof cc.Component ? this.node : sender);
		node.getComponent("cxui.page").runActionClose();
	}

	//设置android返回键处理函数
	static setAndroidBackHandler(handler?: any)
	{
		if (sys.os.android)
			this.androidKeyBackHandler = handler;
	}

	static setNativeMaskMask (x: number, y: number, width: number, height: number, radius: number)
	{
		if (!sys.os.native)
			return;
		var mask = ui.getTopPage();
		mask = mask && mask.getComponent("cxui.nativeMask");
		if (mask)
		{
			var rect = ui.convertToDeviceSize(undefined, x, y, width, height);
			mask.setMaskMask(rect.x, rect.y, rect.width, rect.height, radius);
		}
	}

	static clearNativeMaskMask ()
	{
		if (!sys.os.native)
			return;
		var mask = ui.getTopPage();
		mask = mask && mask.getComponent("cxui.nativeMask");
		if (mask)
			mask.clearMaskMask();
	}

	static createPanel (color4: string, width: number, height: number): cc.Node
	{
		var panel = new cc.Node();
		panel.addComponent(cc.UITransform).setContentSize(width, height);
		panel.addComponent(cc.Sprite).color = cc.color(color4 || "ffffffff");
		res.setImageFromBundle(panel, "cx.prefab/s_color");
		return panel;
	}

	static createLabelNode (text: string, fontSize: number, fontColor: string): cc.Node
	{
		var node = new cc.Node();
		var label = node.addComponent(cc.Label);
		label.string = text;
		label.fontSize = fontSize;
		label.color = cc.color(fontColor);
		return node;
	}

	//将一个node节点中相对于节点左下角的坐标转换为屏幕坐标
	static convertToDeviceSize (node:cc.Node | undefined, x:number, y:number, width?:number, height?:number): cc.Rect
	{
		let frameSize = cc.view.getFrameSize();
		width = width ? frameSize.width * width / this.sw : 0;
		height = height ? frameSize.height * height / this.sh : 0;
		let r: cc.Vec3 | undefined = node ? node.getComponent(cc.UITransform)?.convertToWorldSpaceAR(cc.v3(x, y, 0)) : cc.v3(x, y, 0);
		if (r)
		{
			x = frameSize.width * r.x / this.sw;
			y = frameSize.height * (this.sh - r.y) / this.sh;
		}
		return new cc.Rect(x, y, width, height);
	}
}

class RootNode extends cc.Node
{
	constructor ()
	{
		super();
		// this.setPosition(0, -ui.sh/2);
		// this.addComponent(cc.UITransform)?.setAnchorPoint(0.5, 0.5);
		this.addComponent(cc.UITransform).setContentSize(ui.sw, ui.sh);
		var widget = this.addComponent(cc.Widget);
		widget.isAlignTop = widget.isAlignBottom = true; widget.isAlignLeft = widget.isAlignRight = true;
			
		//if (sys.os.android)
		//	cc.systemEvent.on(cc.SystemEventType.KEY_UP, this.onAndroidKeyUp, this);
		if (!sys.config.slideEventDisabled)
			this.addSlideEvent();
	}

	onBackPressed()
	//onAndroidKeyUp (event: cc.EventKeyboard)
	{
		// console.log(".................event..." + event.keyCode + "," + cc.macro.KEY.back);
		//if (event.keyCode == cc.macro.KEY.back || event.keyCode == cc.macro.KEY.backspace || event.keyCode == cc.macro.KEY.escape)
		{
			if (ui.androidKeyBackHandler)
			{
				if (typeof ui.androidKeyBackHandler == "function")
					ui.androidKeyBackHandler();
				return;
			}
			var topPage = ui.getTopPage();
			var handler = topPage.androidBackHandler;
			if (handler)
			{
				if (handler == "closePage")
					ui.closePage(topPage);
				else if (handler == "closeApp")
					native.ins("cx.sys").call("moveTaskToBack");
				else
					handler();
			}
		}
	}

	slideState = 0;
	slideShadow: cc.Node | undefined;
	slidePage: cc.Node | undefined;
	slideRelatePage: cc.Node | undefined;
	slideMoveDeltaX = 0;

	addSlideEvent ()
	{
		this.on(cc.Node.EventType.TOUCH_START, (event: cc.EventTouch) =>
		{
			if (event.getLocationX() > ui.sw/2)
				return;
			this.slideState = 0;
			var slidePage = ui.getTopPage();
			if (slidePage && slidePage.slideEventDisabled)
				return;
			this.slidePage = slidePage;
			this.slideRelatePage = ui.getTopPage(-1);
			// console.log("slide start...", this.slidePage && this.slidePage.name, this.slideRelatePage && this.slideRelatePage.name);
		}, this, true);

		this.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.EventTouch) =>
		{
			if (!this.slidePage || !this.slidePage.active || this.slidePage.slideEventDisabled)
				return;
			var delta = event.getUIDelta();
			if (this.slideState < 2)
			{
				if (Math.abs(delta.x) > 0.05 || Math.abs(delta.y) > 0.05)
				{
					if (Math.abs(delta.x) > Math.abs(delta.y) && Math.abs(event.getLocation().y - event.getStartLocation().y) < 35)
					{
						if (event.getLocation().x - event.getStartLocation().x >= 20)
						{
							this.slideState++;
							if (!this.slideShadow)
							{
								var node: cc.Node = this.slideShadow = new cc.Node();
								node.name = "cx.slideShadow";
								node.ignoreTopPage = true;
								this.addChild(node);
								node.setSiblingIndex(10000000 - 1000);

								var imgNode = new cc.Node();
								res.setImageFromBundle(imgNode, "cx.prefab/s_shadow", cc.Sprite.SizeMode.CUSTOM, (sprite: cc.Sprite) =>
								{
									imgNode.getComponent(cc.UITransform)!.setContentSize(sprite.spriteFrame!.width, sprite.spriteFrame!.height);
									imgNode.setScale(1, ui.sh / sprite.spriteFrame!.height);
									imgNode.setPosition(-ui.sw/2-sprite.spriteFrame!.width/2, 0);
									node.addChild(imgNode);
								});
							}
						}
					}
					else
						this.slideState = 3;
				}
			}

			if (this.slideState == 2)
			{
				// console.log("slide move..." + delta.x);
				event.propagationStopped = true;
				this.slideMoveDeltaX = delta.x;
				var p = this.slidePage.getPosition();
				p.x = Math.max(p.x + this.slideMoveDeltaX, 0);
				this.slidePage.setPosition(p);
				this.slideShadow?.setPosition(p);
				if (this.slideRelatePage)
				{
					p = this.slideRelatePage.getPosition();
					p.x += this.slideMoveDeltaX * (this.slideRelatePage.nextInPercentX != undefined ? this.slideRelatePage.nextInPercentX : 0.3);
					if (p.x > 0)
						p.x = 0;
					this.slideRelatePage.setPosition(p);
				}
			}
		}, this, true);

		let touchEnd = (event: cc.EventTouch) =>
		{
			if (!this.slidePage || !this.slidePage.active || this.slidePage.slideEventDisabled)
				return;

			if (this.slideState == 2)
			{
				event.propagationStopped = true;
				if (this.slideMoveDeltaX > 19 || this.slidePage.getPosition().x > ui.sw * 0.33)
				{
					ui.closePage.call(null, this.slidePage);
					this.slideShadow && cc.tween(this.slideShadow).to(0.55, {position: cc.v3(ui.sw + 12, undefined)}, {easing: "expoOut"}).start();
				}
				else
				{
					ui.defaultNextOutAction.clone(this.slidePage).start();
					if (this.slideRelatePage)
					{
						var tx = -ui.sw * (this.slideRelatePage.nextInPercentX != undefined ? this.slideRelatePage.nextInPercentX : 0.3);
						cc.tween(this.slideRelatePage).to(0.55, {position: cc.v3(tx, undefined)}, {easing: "expoOut"}).start();
					}
					this.slideShadow && ui.defaultNextOutAction.clone(this.slideShadow).start();
				}
				this.slidePage = undefined;
			}
			this.slideState = 0;
		};

		this.on(cc.Node.EventType.TOUCH_END, touchEnd, this, true);
		this.on(cc.Node.EventType.TOUCH_CANCEL, touchEnd, this, true);

		// this.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.EventTouch) =>
		// {
		// 	if (this.slideState == 2)
		// 	{
		// 		event.propagationStopped = true;
		// 		if (this.slidePage)
		// 		{
		// 			ui.defaultNextOutAction.clone(this.slidePage).start();
		// 			this.slideShadow && ui.defaultNextOutAction.clone(this.slideShadow).start();
		// 			this.slidePage = undefined;
		// 		}
		// 	}
		// 	this.slideState = 0;
		// }, this, true);
	}
}
