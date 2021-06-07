import * as cc from 'cc';

cc.Node.prototype.pro = function()
{
	if (!this._pro)
		this._pro = {};
	return this._pro;
};

cc.Node.prototype.getWidth = function()
{
	return (this.getComponent(cc.UITransform) || this.addComponent(cc.UITransform)).width;
};

cc.Node.prototype.getHeight = function()
{
	return (this.getComponent(cc.UITransform) || this.addComponent(cc.UITransform)).height;
};

cc.Node.prototype.getContentSize = function()
{
	return (this.getComponent(cc.UITransform) || this.addComponent(cc.UITransform)).contentSize;
};

cc.Node.prototype.setTouchCallback = function(target:any, callback?:Function, ...params:any)
{
	if (!callback)
	{
		this.off(cc.Node.EventType.TOUCH_END);
		return;
	}
	this.on(cc.Node.EventType.TOUCH_END, (event: cc.EventTouch) =>
	{
		if (Math.abs(event.getLocation().x - event.getStartLocation().x) > 15 || Math.abs(event.getLocation().y - event.getStartLocation().y) > 15)
			return;
		if (cx.touchLockTimelen < 0)
			return;
		var t = cx.utils.getCurrSecond(true);
		if (t - cx.touchPriorSecond >= cx.touchLockTimelen)
		{
			cx.touchPriorSecond = t;
			cx.touchLockTimelen = 250;
			callback && callback.apply(target, params != undefined ? [this].concat(params) : params);
		}
	});
};

var prototype: any = cc.ScrollView.prototype;
prototype.startAutoScroll = prototype._startAutoScroll;

//将ScrollView的content最小高度设置为ScrollView的高度，且初始位置定位到顶部
prototype._adjustContentOutOfBoundaryOrigin = prototype._adjustContentOutOfBoundary;
prototype._adjustContentOutOfBoundary = function() 
{
	////blank
	var that: any = this;
	if (!that._content)
		return;
	var contentTransform = that._content.getComponent(cc.UITransform);
	if (contentTransform.contentSize.height < that.view.contentSize.height)
	{
		that.view.getComponent(cc.Widget)?.updateAlignment();
		contentTransform.setContentSize(contentTransform.contentSize.width, that.view.contentSize.height);
	}

	this._adjustContentOutOfBoundaryOrigin();
};

//下拉刷新时，顶部回弹到cx_refreshTopGap位置 cx_refreshTopGap=120
prototype._flattenVectorByDirection = function(vector: cc.Vec3) 
{
	const result = vector;
	result.x = this.horizontal ? result.x : 0;
	result.y = this.vertical ? result.y : 0;
	
	////blank
	var that: any = this;
	if (that.cx_refreshTopGap && result.y > that.cx_refreshTopGap)
		result.y -= that.cx_refreshTopGap;

	return result;
};

//PageView指示器优先按Page.dataIndex值指示，且page数量为1时不显示
cc.PageViewIndicator.prototype._changedState = function () 
{
	var that: any = this;
	var indicators = that._indicators;
	if (indicators.length === 0) 
		return;
	var page = that._pageView.getPages()[that._pageView.curPageIdx];
	var dataIndex = page && page.pro().dataIndex;
	var idx = dataIndex != undefined ? dataIndex : that._pageView.curPageIdx;
	if (idx >= indicators.length) return;
	var uiComp;
	for (var i = 0; i < indicators.length; ++i) 
	{
		var node = indicators[i];
		uiComp = node._uiProps.uiComp;
		if (uiComp) 
			uiComp.color = cc.color(uiComp.color.r, uiComp.color.g, uiComp.color.b, i != idx ? 255/2 : 255);
	}
};


