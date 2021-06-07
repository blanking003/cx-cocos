import {_decorator, Component} from 'cc';
const {ccclass} = _decorator;

@ccclass('pageChild')
class PageChild extends Component 
{
	start () 
	{
        // 关闭页面的两种方式：
        cx.gn(this, "spClose").setTouchCallback(this, cx.closePage);
		cx.gn(this, "spClosePage").setTouchCallback(this, this.close);

        cx.gn(this, "spAlert").setTouchCallback(this, () => { cx.alert("pageChild alert"); });

        //cx.showPage可以直接放在setTouchCallback里
        cx.gn(this, "spShowPage").setTouchCallback(this, cx.showPage, "ui/pageChild");
    }

    close ()
    {
        //do something
        cx.closePage(this);
    }
}

