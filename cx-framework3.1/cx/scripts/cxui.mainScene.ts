
import {_decorator, Component, setDisplayStats} from 'cc';
const {ccclass} = _decorator;

@ccclass('cxui.MainScene')
class CxuiMainScene extends Component 
{
	onLoad () 
	{
		setDisplayStats(false);
		cx.init(this);
	}
}
