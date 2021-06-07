
import {_decorator, Component, Node, PageView, EventTouch} from 'cc';
const {ccclass} = _decorator;

@ccclass('cxui.pageView')
class CxuiPageView extends Component 
{
	page!: Component;
	pageView!: PageView;
	loop: boolean = false;
	callback?: Function;
	slideEventDisabled?: boolean;
	autoScrollDisabled: number = 0;
	cancelClickCallback!: boolean;

	//添加自动滚动及循环滚动能力
	//autoScrollSeconds: 自动滚动间隔秒
	//loop: 是否循环滚动
	initAutoScroll (page: Component, viewName: string, autoScrollSeconds: number, loop: boolean, callback?: Function)
	{
		var view: Node = cx.gn(page, viewName);
		this.page = page;
		this.pageView = view.getComponent(PageView)!;
		this.loop = loop;
		this.callback = callback;
		
		if (autoScrollSeconds > 0)
		{
			this.schedule(this.autoScroll, autoScrollSeconds);
			view.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
			view.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
			view.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
			view.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
		}

		if (loop)
		{
			view.on(PageView.EventType.SCROLL_ENDED, this.onScrollEnded, this);
		}
		
		this.slideEventDisabled = this.node.slideEventDisabled;
	}

	onTouchStart (event: EventTouch)
	{
		this.autoScrollDisabled = 2;
		this.node.slideEventDisabled = true;
		this.cancelClickCallback = false;
	}

	onTouchMove (event: EventTouch)
	{
		this.cancelClickCallback = this.cancelClickCallback || (Math.abs(event.getLocation().x - event.getStartLocation().x) > 15 || Math.abs(event.getLocation().y - event.getStartLocation().y) > 15);
	}

	onTouchEnd ()
	{
		this.onTouchCancel();
		!this.cancelClickCallback && this.callback && this.callback.call(this.page, this.pageView.getPages()[this.pageView.getCurrentPageIndex()]);
	}

	onTouchCancel ()
	{
		this.autoScrollDisabled = 1; //有操作干扰，忽略一次自动滚动
		this.node.slideEventDisabled = this.slideEventDisabled;
	}

	autoScroll ()
	{
		if (this.autoScrollDisabled)
		{
			if (this.autoScrollDisabled == 1)
				this.autoScrollDisabled = 0;
			return;
		}
			
		var pages = this.pageView.getPages();
		if (pages.length > 1)
		{
			var currentIndex = this.pageView.getCurrentPageIndex();
			if (currentIndex < pages.length - 1)
				this.pageView.scrollToPage(currentIndex + 1, 1.5);
		}
	}

	onScrollEnded ()
	{
		var pages = this.pageView.getPages();
		var currentIndex = this.pageView.getCurrentPageIndex();
		if (currentIndex == pages.length - 1)
		{
			var first = pages[0];
			this.pageView.removePage(first);
			this.pageView.addPage(first);
		}
		else if (currentIndex == 0)
		{
			var last = pages[pages.length - 1];
			last.active = false;
			this.pageView.removePage(last);
			this.pageView.insertPage(last, 0);
			this.pageView.scrollToPage(1, 0);
			last.active = true;
		}
	}
}
