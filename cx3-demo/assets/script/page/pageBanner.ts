import {_decorator, Component, Node, PageView, UITransform} from 'cc';
const {ccclass} = _decorator;

@ccclass('pageBanner')
class pageBanner extends Component 
{
    data: any;

    start () 
    {
        cx.gn(this, "spClose").setTouchCallback(this, cx.closePage);

        this.scheduleOnce(this.loadBanner, 0.5);

        cx.script.pageView.initAutoScroll(this, "viewBanner", 2, true, this.onBannerClick); //自动循环滚动
    }

    loadBanner ()
    {
        var data = [
            {id:1, img: "banner1"},
            {id:2, img: "banner2"},
            {id:3, img: "banner3"}
        ];

        var pageView: PageView = cx.gn(this, "viewBanner").getComponent(PageView)!;
        pageView.removeAllPages();
        for (var i in data)
        {
            var node: Node = new Node();
            node.pro().dataIndex = i;
            node.addComponent(UITransform).setContentSize(pageView.node.getContentSize());
            pageView.addPage(node);
            cx.res.setImageFromRes(node, data[i].img);
        }

        this.data = data;
    }

    onBannerClick (page: Node)
    {
        cx.hint("banner id: " + this.data[page.pro().dataIndex].id);
    }
}

