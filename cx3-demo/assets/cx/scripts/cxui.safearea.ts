
import {_decorator, Component, Widget, UITransform, CCInteger} from 'cc';
const {ccclass, property} = _decorator;

@ccclass('cxui.safearea')
class CxuiSafearea extends Component 
{
	@property
	private safeHeight = 170;

	@property
	private safeWidgetTop = 0;

	@property
	private safeWidgetBottom = 0;

	onLoad ()
	{
		if (cx.os.native && !cx.os.android && cx.sh/cx.sw > 1.8)
		{
			if (this.safeHeight)
			{
				var uiTransform = this.node.getComponent(UITransform);
				uiTransform?.setContentSize(uiTransform.width, this.safeHeight);
			}

			if (this.safeWidgetTop || this.safeWidgetBottom)
			{
				var widget = this.node.getComponent(Widget);
				if (widget)
				{
					widget.top = this.safeWidgetTop;
					widget.bottom = this.safeWidgetBottom;
				}
			}
		}
	}
}
