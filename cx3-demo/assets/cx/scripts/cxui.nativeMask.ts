
import {_decorator, Component, Node, Rect} from 'cc';
const {ccclass} = _decorator;

@ccclass('cxui.nativeMask')
class CxuiNativeMask extends Component 
{
	maskName?: string;
	maskRect?: Rect;
	monitorNode?: Node;
	monitorNodePriorX?: number;
	init (page: Component, node: Node, x: number, y: number, width: number, height: number): string
	{
		if (!cx.os.native)
			return "";
		this.maskName = "cxNativeMask" + (++cx.uid);
		this.maskRect = cx.convertToDeviceSize(node, x, y, width, height);
		cx.native.ins("cx.mask").call("createMask", [this.maskName, this.maskRect.x, this.maskRect.y, this.maskRect.width, this.maskRect.height]);
		return this.maskName;
	}

	onEnable ()
	{
		this.maskName && cx.native.ins("cx.mask").call("setMaskVisible", [this.maskName, true]);
	}

	onDisable ()
	{
		this.maskName && cx.native.ins("cx.mask").call("setMaskVisible", [this.maskName, false]);
	}

	onDestroy ()
	{
		this.maskName && cx.native.ins("cx.mask").call("removeMask", [this.maskName]);
	}

	//设置监控节点，mask的宽度将随着node的x位置改变，不遮挡住node
	//todo: 目前仅实现横向不遮挡，对于底部上升的纵向node未处理
	setMonitorNode (node: Node)
	{
		this.monitorNode = node;
		this.monitorNodePriorX = node.getPosition().x;
	}

	setMaskSize (width: number, height: number)
	{
		this.maskName && cx.native.ins("cx.mask").call("setMaskSize", [this.maskName, width, height]);
	}

	setMaskMask (x: number, y: number, width: number, height: number, radius: number)
	{
		this.maskName && cx.native.ins("cx.mask").call("setMaskMask", [this.maskName, x, y, width, height, radius]);
	}

	clearMaskMask ()
	{
		this.maskName && cx.native.ins("cx.mask").call("clearMaskMask", [this.maskName]);
	}

	update ()
	{
		if (!this.maskName)
			return;
		if (this.monitorNode)
		{
			if (!this.monitorNode.active)
			{
				this.monitorNode = undefined;
				return;
			}
			if (this.monitorNodePriorX == this.monitorNode.getPosition().x)
				return;
			this.monitorNodePriorX = this.monitorNode.getPosition().x;
			var p = cx.convertToDeviceSize(undefined, this.monitorNodePriorX, 0);
			var width = Math.min(this.maskRect!.width, Math.max(0, p.x - this.maskRect!.x));
			this.setMaskSize(width, this.maskRect!.height);
		}
	}
}
