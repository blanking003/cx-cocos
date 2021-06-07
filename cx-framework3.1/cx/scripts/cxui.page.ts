
import {_decorator, Component, Node, EventTouch, Tween, tween} from 'cc';
const {ccclass} = _decorator;

@ccclass('cxui.page')
class CxuiPage extends Component 
{
	onLoad () 
	{
		cx.makeNodeMap(this.node);
		this.node.on(Node.EventType.TOUCH_START, (event: EventTouch) =>
		{
			event.propagationStopped = true;
		});
	}

	/* 在page的onLoad事件中可修改以下属性，变更默认的进出动画
		this.initPx: 初始位置
		this.initPy: 初始位置
		this.moveInAction: 进入动画
		this.nextInAction: 进入时，上一页面的动画
		this.moveOutAction: 关闭动画
		this.nextOutAction: 关闭时，上一页面的动画
	*/
	public initPx?: number;
	public initPy?: number;
	public moveInAction?: Tween<any>;
	public nextInAction?: Tween<any>;
	public moveOutAction?: Tween<any>;
	public nextOutAction?: Tween<any>;
	runActionShow ()
	{
		if (cx.os.android)
			this.node.androidBackHandler = "closePage";
		if (cx.config.pageActionDisabled || this.node.pageActionDisabled)
			return;
		var x = this.initPx != undefined ? this.initPx : cx.defaultInitPx;
		var y = this.initPy != undefined ? this.initPy : cx.defaultInitPy;
		this.node.setPosition(x, y);
		tween(this.node).then(this.moveInAction || cx.defaultMoveInAction).start();
		
		var priorPage = cx.getTopPage(-1);
		if (priorPage)
		{
			tween(priorPage).then(this.nextInAction || cx.defaultNextInAction).start();
			var priorMask: any = priorPage.getComponent("cxui.nativeMask");
			if (priorMask)
				priorMask.setMonitorNode(this.node);
		}
	}

	runActionClose ()
	{
		var priorPage = cx.getTopPage(-1);
		if (priorPage && priorPage.mainComponent && priorPage.mainComponent.onChildPageClosed)
			priorPage.mainComponent.onChildPageClosed.call(priorPage.mainComponent, this.node.mainComponent);
		if (cx.config.pageActionDisabled || this.node.pageActionDisabled)
		{
			this.node.destroy();
			return;
		}
		tween(this.node).then(this.moveOutAction || cx.defaultMoveOutAction).call(()=>{this.node.destroy();}).start();
		if (priorPage)
		{
			tween(priorPage).then(this.nextOutAction || cx.defaultNextOutAction).start();
			// var priorMask = priorPage.getComponent("cxui.nativeMask");
			// if (priorMask)
			// 	priorMask.setMonitorNode();
		}
	}
}
