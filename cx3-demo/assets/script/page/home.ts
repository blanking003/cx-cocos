import {_decorator, Component, Node, Sprite, Label} from 'cc';
const {ccclass} = _decorator;

@ccclass('home')
class Home extends Component 
{
	start () 
	{
		cx.log("Home start...");
		cx.gn(this, "spShowPage").setTouchCallback(this, this.showPage, "ui/pageChild");
		cx.gn(this, "spHint").setTouchCallback(this, this.hint);
		cx.gn(this, "spAlert").setTouchCallback(this, this.alert);
		cx.gn(this, "spConfirm").setTouchCallback(this, this.confirm);
		cx.gn(this, "spShowLoading").setTouchCallback(this, this.showLoading);
		cx.gn(this, "spRemoveLoading").setTouchCallback(this, this.removeLoading);
		cx.gn(this, "spPageScrollView").setTouchCallback(this, this.showPage, "ui/pageScrollView");
		cx.gn(this, "spPageBanner").setTouchCallback(this, this.showPage, "ui/pageBanner");
		cx.gn(this, "spPicker").setTouchCallback(this, this.showPage, "ui/pagePicker");
		cx.gn(this, "spLoadRemoteImage").setTouchCallback(this, this.loadRemoteImage);
		cx.gn(this, "spNative1").setTouchCallback(this, this.callNative1);
		cx.gn(this, "spNative2").setTouchCallback(this, this.callNative2);
		cx.gn(this, "spVideo").setTouchCallback(this, this.showPage, "ui/pageVideo");

		this.scheduleOnce(cx.removeLaunchImage, 0.3);
	}
	
	showPage (sender: Node, page:string)
	{
		cx.showPage(page);
	}

	hint ()
	{
		cx.hint("cx.hint(content)");
	}

	alert ()
	{
		cx.alert("cx.alert(content, callback, labelOk)");
	}

	confirm ()
	{
		cx.confirm("cx.confirm(content, callback, labelOk, labelCancel)", cx.hint);
	}

	showLoading (sender: Node)
	{
		sender.getChildByName("label")!.getComponent(Label)!.string = "";
		cx.showLoading(this, sender);
		//在查询服务中，一般使用延迟0.5秒执行:
		//cx.showLoading(this, sender, 0.5);
	}

	removeLoading ()
	{
		cx.gn(this, "spShowLoading").getChildByName("label")!.getComponent(Label)!.string = "cx.showLoading";
		cx.removeLoading(cx.gn(this, "spShowLoading"));
	}

	loadRemoteImage ()
	{
		if (cx.os.native)
		{
			var url = "https://www.cocos.com/wp-content/themes/cocos/image/logo.png";
			//从远程取图片, localPath: 保存到本地路径，并优先从该路径取图片
			cx.res.setImageFromRemote(cx.gn(this, "spLoadRemoteImage"), url, cx.sys.cachePath + "cocos_logo.png", Sprite.SizeMode.TRIMMED);
		}
		else
			cx.hint("only for native!");

		// 从resources目录取图片:
		// cx.res.setImageFromRes(cx.gn(this, "spLoadRemoteImage"), "xx", Sprite.SizeMode.CUSTOM, callback);

		// 从bundle目录取图片
		// cx.res.setImageFromBundle(cx.gn(this, "spLoadRemoteImage"), "cx.prefab/s_loading", Sprite.SizeMode.CUSTOM, callback);

		// 上传图片:
		// cx.serv.upload("http://localhost:7300/cxserv/app/system/uploadFile", cx.sys.cachePath + "a1.png");
	}

	callNative1 ()
	{
		if (cx.os.native)
		{
			// ex: cx.native.ins("接口名").call("函数名", [参数], this.callNativeCallback.bind(this));
			// 回调函数：callNativeCallback (number, string)

			var ret = cx.native.ins("cx.sys").call("getPackageName", []);
			cx.hint("native return: " + ret);
		}
		else
			cx.hint("only for native!");
	}

	callNative2 ()
	{
		if (cx.os.ios || cx.os.android)
			cx.native.ins("system").call("callPhone", ["10000"]);
		else
			cx.hint("only for ios or android!");
	}

	// location ()
	// {
	// 	if (cx.os.ios || cx.os.android)
	// 	{
	// 		cx.showLoading(this, this.node, 0.5);
	// 		cx.native.ins("amapLocation").call("location", [true], this.locationCallback.bind(this));
	// 	}
	// 	else
	// 		cx.hint("only for ios or android!");
	// }

	// locationCallback (succ: number, info: string)
	// {
	// 	cx.removeLoading(this.node);
	// 	if (succ)
	// 	{
	// 		var obj = JSON.parse(info);
	// 		var s = "";
	// 		for (var i in obj)
	// 			s += i + ": " + obj[i] + "\n";
	// 		cx.alert(s);
	// 	}
	// 	else
	// 		cx.alert("location failure: " + info);
	// }
}

