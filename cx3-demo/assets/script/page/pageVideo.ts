import {_decorator, Node, Component, Label} from 'cc';
const {ccclass} = _decorator;

@ccclass('pageVideo')
class PageVideo extends Component 
{
    maskName?: string;
	videoName?: string;
    videoNodeList!: any[];

	start () 
	{
		cx.gn(this, "spClose").setTouchCallback(this, cx.closePage);
		cx.gn(this, "spShowPage").setTouchCallback(this, this.showPage);
		cx.gn(this, "spAlert").setTouchCallback(this, this.alert);

        if (!cx.os.ios && !cx.os.android)
        {
            cx.gn(this, "lblVideo").getComponent(Label)!.string = "please run on iOS or android.";
            return;
        }

		cx.gn(this, "nodeVideo").setTouchCallback(this, this.setVideoFullScreen);

        //创建一个mask遮罩（扣除标题栏的全屏区域）
        var titleSize = cx.gn(this, "layerTitle").getContentSize();
        this.maskName = cx.script.nativeMask.init(this, undefined, 0, cx.sh-titleSize.height, cx.sw, cx.sh-titleSize.height);
		var node = cx.gn(this, "nodeVideo");
		var rect = cx.convertToDeviceSize(node, 0, 0, node.getWidth(), node.getHeight());
		var intf = cx.native.ins("video");

        //在遮罩中创建一个video
		this.videoName = node.name;
		intf.call("createInMask", [this.videoName, this.maskName, rect.x, rect.y, rect.width, rect.height]);
		intf.call("setRoundRadius", [this.videoName, 18]);
		intf.call("play", [this.videoName, "1.mp4"], this.videoCallback.bind(this)); //statics/1.mp4
		// intf.call("play", [this.videoName, "http://vjs.zencdn.net/v/oceans.mp4"], this.videoCallback.bind(this));
	   
		// 所有方法
		// intf.call("create", [this.videoName, rect.x, rect.y, rect.width, rect.height]);  //创建视频
		// intf.call("createInMask", [this.videoName, maskName, rect.x, rect.y, rect.width, rect.height]);  //在遮罩中创建视频
		// intf.call("setRoundRadius", [this.videoName, radius]);  //设置圆角遮罩
		// intf.call("play", [this.videoName, url, callback]);//播放
		// intf.call("pause", [this.videoName, true]);        //暂停播放并隐藏
		// intf.call("resume", [this.videoName]);             //继续播放
		// intf.call("removeVideo", [this.videoName]);        //关闭并移除
		// intf.call("removeInMask", [maskName]);             //关闭所有mask中的video
		// intf.call("seekToTime", [this.videoName, 0]);      //跳到x秒处，默认值 0
		// intf.call("lockSeek", [this.videoName, true]);     //禁止拉动进度条，默认值 false
		// intf.call("showBar", [this.videoName, true]);      //显示控制栏，默认值 false
		// intf.call("setFullScreen", [this.videoName, true]);//全屏播放，默认值 false
		// intf.call("setPosition", [this.videoName, x, y]);  //设置位置
		
		this.videoNodeList = this.videoNodeList || [];
		this.videoNodeList.push(node);
	}

	showPage ()
	{
		this.videoName && cx.native.ins("video").call("pause", [this.videoName, !!cx.os.android]);
		cx.showPage("ui/pageChild");
	} 

	alert ()
	{
		cx.alert("这是一个显示在原生视频层之上效果的cocos界面（android暂未实现）");
	} 

	setVideoFullScreen (sender: Node)
	{
		cx.native.ins("video").call("setFullScreen", [sender.name, true]);
	}

	videoCallback (state: number, value: string)
	{
		cx.log("video state:" + state + ", value: " + value);
		cx.gn(this, "lblVideo")!.getComponent(Label)!.string = "state:" + state + " value: " + value;
	}

	update ()
	{
		for (var i in this.videoNodeList)
		{
			var node = this.videoNodeList[i];
			var leftTop = cx.convertToDeviceSize(node, 0, 0);
			if (node.priorX != Math.round(leftTop.x) || node.priorY != Math.round(leftTop.y))
			{
				node.priorX = Math.round(leftTop.x);
				node.priorY = Math.round(leftTop.y);
				cx.native.ins("video").call("setPosition", [this.videoName, leftTop.x, leftTop.y]);
			}
		}
	}

	onChildPageClosed(childPage: any)
	{
		this.videoName && cx.native.ins("video").call("resume", [this.videoName]);
	}

	onDestroy ()
	{
		this.maskName && cx.native.ins("video").call("removeInMask", [this.maskName]);
	}
}

