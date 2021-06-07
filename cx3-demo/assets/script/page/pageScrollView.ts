import {_decorator, Component, Node, Label, color} from 'cc';
const {ccclass} = _decorator;

@ccclass('pageScrollView')
class pageScrollView extends Component 
{
    dataCount: number = 0;
    isRefresh: boolean = false;

	start () 
    {
        cx.gn(this, "spClose").setTouchCallback(this, cx.closePage);

        cx.script.scrollView.initDeltaInsert(this, "view", this.queryData);   //设置增量新增数据到view的能力
        cx.script.scrollView.initDropRefresh(this, "view", this.refreshData); //设置下拉刷新能力

        this.queryData();
    }

    refreshData ()
    {
        this.dataCount = 0;
        this.isRefresh = true;
        this.queryData();
    }

    queryData ()
    {
        //模拟从服务器取数据，0.5秒后获得数据
        cx.log("queryData " + this.dataCount);
        this.scheduleOnce(this.queryDataOk, 0.5);
    }

    queryDataOk ()
    {
        cx.log("queryDataOk...");
        if (this.isRefresh)
        {
            this.isRefresh = false;
            cx.gn(this, "content").removeAllChildren();
        }

        for (var i = 0; i < 20; i++)
            this.createPanel();

        cx.script.scrollView.overDeltaInsert(this, this.dataCount > 200);  //结束新增能力，模拟总数量200个
        cx.script.scrollView.overDropRefresh(this);                        //结束本次下拉刷新
    }


    createPanel ()
    {
        var node = new Node();
        node.addComponent(Label).string = ++this.dataCount + "";
        node.getComponent(Label)!.color = color("555555");

        var panel = cx.createPanel("ffffffff", cx.sw, 100);
        panel.addChild(node);

        cx.gn(this, "content").addChild(panel);
    }
}

