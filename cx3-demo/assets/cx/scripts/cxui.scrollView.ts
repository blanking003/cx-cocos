
import {_decorator, Component, Node, ScrollView, UITransform, Sprite, tween, v3} from 'cc';
const {ccclass} = _decorator;

@ccclass('cxui.scrollView')
class CxuiScrollView extends Component 
{
	page!: Component;
	view!: Node;
	queryHandler?: Function;
	emptyNode!: Node;

	refreshPage!: Component;
	refreshView!: Node;
	refreshScrollView!: ScrollView;
	refreshHandler?: Function;
	refreshNode!: Node;
	inRefresh: boolean = false;
	waitRefresh: boolean = false;

	//添加增量加载数据功能
	initDeltaInsert (page: Component, viewName: string, queryHandler: Function)
	{
		this.page = page;
		this.view = cx.gn(page, viewName);
		this.queryHandler = queryHandler;
		
		this.view.on("scrolling", this.viewScrolling, this);

		this.emptyNode = new Node();
		this.emptyNode.addComponent(UITransform).height = this.view.getComponent(UITransform)!.height/2;
		this.emptyNode.active = false;
		var scrollView: ScrollView = this.view.getComponent(ScrollView)!;
		scrollView.content!.addChild(this.emptyNode);
		this.emptyNode.setSiblingIndex(1000000);
		return this;
	}

	overDeltaInsert (noMoreData: boolean)
	{
		if (!this.page)
			return;
		this.emptyNode.active = false;
		if (noMoreData)
			this.view.off("scrolling", this.viewScrolling, this);
	}

	viewScrolling (view: ScrollView)
	{
		if (!this.emptyNode.active && view.node.getHeight()/2 < view.content!.getPosition().y && 
			view.content!.getHeight()/2 - view.content!.getPosition().y < view.node.getHeight()/2)
        {
            this.emptyNode.active = true;
            this.queryHandler && this.queryHandler.call(this.page);
		}
	}

	//添加下拉刷新功能
	initDropRefresh (page: Component, viewName: string, refreshHandler: Function)
	{
		this.refreshPage = page;
		this.refreshView = cx.gn(page, viewName);
		this.refreshScrollView = this.refreshView.getComponent(ScrollView) as ScrollView;
		this.refreshHandler = refreshHandler;

		this.refreshView.on("scrolling", this.viewRefreshScrolling, this);
		this.refreshView.on("touch-up", this.viewRefreshTouchUp, this);

		var refreshNode = new Node();
		refreshNode.addComponent(UITransform);
		refreshNode.setPosition(0, this.refreshView.getComponent(UITransform)!.height*2);

		var labelNode: Node = cx.createLabelNode("下拉刷新", 28, "777777");
		refreshNode.addChild(labelNode);
		refreshNode.pro().labelNode = labelNode;

		var imageNode = new Node();
		cx.res.setImageFromBundle(imageNode, "cx.prefab/s_loading", Sprite.SizeMode.TRIMMED);
		imageNode.setScale(0.6, 0.6);
		refreshNode.addChild(imageNode);
		refreshNode.pro().imageNode = imageNode;

		this.refreshNode = refreshNode;
		this.refreshScrollView.content!.parent!.addChild(refreshNode);
		this.refreshNode.setSiblingIndex(-1000000);
		return this;
	}

	viewRefreshScrolling (view: ScrollView)
	{
		if (this.inRefresh || view.node.getHeight()/2 <= view.content!.getPosition().y)
			return;

		var delta = view.node.getHeight()/2 - view.content!.getPosition().y;
		this.waitRefresh = delta > 150;
		this.refreshNode.setPosition(0, view.content!.getPosition().y + 60);
		this.refreshNode.pro().imageNode.active = this.inRefresh || delta > 150;
		this.refreshNode.pro().labelNode.active = !this.refreshNode.pro().imageNode.active;
	}

	viewRefreshTouchUp (view: ScrollView)
	{
		if (this.waitRefresh)
		{
			view.cx_refreshTopGap = 120;
			this.inRefresh = true;
			this.waitRefresh = false;
			view.node.pauseSystemEvents(true);
			tween(this.refreshNode).to(0.1, {position:v3(0, view.node.getHeight()/2-60)}).delay(0.1).call(()=>
			{
				this.refreshHandler && this.refreshHandler.call(this.refreshPage);
			}).start();
			if (this.refreshNode.pro().loadingTween)
				this.refreshNode.pro().loadingTween.start();
			else
				this.refreshNode.pro().loadingTween = tween(this.refreshNode.pro().imageNode).repeatForever(tween().by(0, {angle:-30}).delay(0.07)).start();
		}
	}

	overDropRefresh ()
	{
		if (!this.inRefresh)
			return;
		this.inRefresh = false;
		this.refreshScrollView.cx_refreshTopGap = 0;
		this.refreshScrollView.startAutoScroll(v3(0,120,0), 0.5, true);
		this.refreshView.resumeSystemEvents(true);
		this.refreshNode.pro().loadingTween.stop();
		this.refreshNode.pro().imageNode.angle = 0;
	}
}
