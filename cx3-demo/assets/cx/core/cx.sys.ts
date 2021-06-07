import * as cc from 'cc';

class config
{
	[key: string]:any
}

(function()
{
	//creator3.0
	if (!cc.sys.OS)
	{
		cc.sys.OS = {OSX:cc.sys.OS_OSX, IOS:cc.sys.OS_IOS, ANDROID:cc.sys.OS_ANDROID, WINDOWS:cc.sys.OS_WINDOWS};
	}
	else if (cc.sys.os == cc.sys.OS.ANDROID)
		cc.sys.OS_ANDROID = cc.sys.OS.ANDROID;
})();

export default class sys 
{
	static version: string = "v1.0.0";
	static userPath: string = "__user";
	static cachePath: string = "__cache";

	static os =
	{
		native: cc.sys.isNative, //mac or ios or android

		mac: cc.sys.isNative && cc.sys.os == cc.sys.OS.OSX,
		ios: cc.sys.isNative && cc.sys.os == cc.sys.OS.IOS,
		android: cc.sys.isNative && cc.sys.os == cc.sys.OS.ANDROID,

		wxgame: cc.sys.platform == "WECHAT_GAME",
		wxpub: cc.sys.platform != "WECHAT_GAME" && cc.sys.browserType == "wechat",
		web: cc.sys.isBrowser
	}

	static config: config =
	{
		debug: false,
		startPage: "ui/start",        //开始页
		autoRemoveLaunchImage: true,  //自动移除启动屏

		designSizeMinWidth: 0,        //最小设计宽度
		designSizeMinHeight: 750,     //最小设计高度
		
		slideEventDisabled: false,    //禁止子页面右划
		pageActionDisabled: false,    //禁止页面显示和退出动画
		androidkeyDisabled: false,    //禁止android返回键

		hintFontSize: 36,                //cx.hint 文字尺寸
		hintFontColor: "ff0000",         //cx.hint 文字颜色
		hintFontOutlineWidth: 1,         //cx.hint 文字描边宽度
		hintFontOutlineColor: "777777",  //cx.hint 文字描边颜色

		safeLayerTitleHeight: 170,             //ios刘海屏标题栏高度
		safeLayerTitleName: "layerSafeTitle",  //ios刘海屏标题栏名称
		safeLayerTabHeight: 162,               //ios刘海屏底栏高度
		safeLayerTabName: "layerSafeTab",      //ios刘海屏底栏名称
	}

	static init()
	{
		for (var i in cc.game.appConfig)
			this.config[i] = cc.game.appConfig[i];

		cc.game.config.debugMode = this.config.debug ? 1 : 3;

		if (this.os.native)
		{
			var path = jsb.fileUtils.getWritablePath();
			if (this.os.mac && typeof cxnative != "undefined")
				path += "_cxcache/" + cxnative.NativeCreator.createNativeClass("cx.sys").call("getPackageName", []) + "/";
			this.userPath = path + this.userPath + "/";
			this.cachePath = path + this.cachePath + "/";
		}
	}
}

