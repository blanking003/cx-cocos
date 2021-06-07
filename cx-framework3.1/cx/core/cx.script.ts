import * as cc from 'cc';

export default
{
	pageView:
	{
		initAutoScroll(page: cc.Component, viewName: string, autoScrollSeconds: number, loop: boolean, callback?: Function)
		{
			var script: any = page.getComponent("cxui.pageView") || page.addComponent("cxui.pageView");
			script.initAutoScroll.apply(script, arguments);
		}
	},

	scrollView:
	{
		//添加增量加载数据功能
		initDeltaInsert (page: cc.Component, viewName: string, queryHandler: Function)
		{
			var script: any = page.getComponent("cxui.scrollView") || page.addComponent("cxui.scrollView");
			script.initDeltaInsert.apply(script, arguments);
		},

		//增量加载数据完成时调用
		overDeltaInsert (page: cc.Component, noMoreData: boolean)
		{
			var script: any = page.getComponent("cxui.scrollView");
			script && script.overDeltaInsert.call(script, noMoreData);
		},

		//添加下拉刷新功能
		initDropRefresh (page: cc.Component, viewName: string, refreshHandler: Function)
		{
			var script: any = page.getComponent("cxui.scrollView") || page.addComponent("cxui.scrollView");
			script.initDropRefresh.apply(script, arguments);
		},

		//下拉刷新结束时调用
		overDropRefresh (page: cc.Component)
		{
			var script: any = page.getComponent("cxui.scrollView");
			script && script.overDropRefresh.call(script);
		}
	},

	nativeMask:
	{
		init (page: cc.Component, node: Node, x: number, y: number, width: number, height: number): string
		{
			var script: any = page.getComponent("cxui.nativeMask") || page.addComponent("cxui.nativeMask");
			return script.init.apply(script, arguments);
		}
	}
}

