import * as cc from 'cc';
import res from './cx.res';
import ui from './cx.ui';

export default class picker 
{
	//dataList数组对象属性包括: 
	//data:数据列表，[""或{}]，如果是{}，需指定显示字段display
	//index: 默认初始定位index
	//suffix: 在数据后加上该字串
	//ex: (callback, [{data:["a", "b"], index:0, suffix:""}, {...}])
	//ex: (callback, [{data:[{id:"a", name:"b"}], display:"name", index:0, suffix:"年"}, {...}])
	static create (page: cc.Component, callback: Function | undefined, dataList: any[])
	{
		return new OptionPicker(page, callback, dataList);
	}

	//创建年月日选择，默认值：yearData:当前年，year:当前年，monthData:所有月，month:当前月，dayData:1~31天，dy:当前天
	//ex: (this, callback)
	static createYearMonthDay (page: cc.Component, callback: Function | undefined, yearData?: any[], year?: number, monthData?: any[], month?: number, dayData?: any[], day?: number)
	{
		var d = new Date();
		yearData = yearData ? yearData : this.year();
		monthData = monthData ? monthData : this.month();
		dayData = dayData ? dayData : this.day();
		var yearIndex = yearData.indexOf(year ? year : d.getFullYear());
		var monthIndex = monthData.indexOf(month ? month : (d.getMonth() + 1));
		var dayIndex = dayData.indexOf(day ? day : d.getDate());
		return new OptionPickerYearMonthDay(page, callback, [
			{data: yearData, index: yearIndex, suffix: "年"},
			{data: monthData, index: monthIndex, suffix: "月"},
			{data: dayData, index: dayIndex, suffix: "日"}]);
	}

	//创建年月选择，默认值：yearData:当前年，year:当前年，monthData:所有月，month:当前月
	//返回值，选中年、月值：callback（2016, 7）----非索引，以下年月日相关的，都是如此
	//ex: (callback, cx.picker.year(-3, 0), null, cx.picker.month(1, 0), null)
	static createYearMonth (page: cc.Component, callback: Function | undefined, yearData?: any[], year?: number, monthData?: any[], month?: number)
	{
		var d = new Date();
		yearData = yearData ? yearData : this.year();
		monthData = monthData ? monthData : this.month();
		var yearIndex = yearData.indexOf(year ? year : d.getFullYear());
		var monthIndex = monthData.indexOf(month ? month : (d.getMonth() + 1));
		return new OptionPicker(page, callback, [
			{data: yearData, index: yearIndex, suffix: "年"}, 
			{data: monthData, index: monthIndex, suffix: "月"}]);
	}

	//创建月日选择, 默认值：monthData:所有月，month:当前月，dayData:1~31天，day:当前天
	static createMonthDay (page: cc.Component, callback: Function | undefined, monthData?: any[], month?: number, dayData?: any[], day?: number)
	{
		var d = new Date();
		monthData = monthData ? monthData : this.month();
		dayData = dayData ? dayData : this.day();
		var dayIndex = dayData.indexOf(day ? day : d.getDate());
		var monthIndex = monthData.indexOf(month ? month : (d.getMonth() + 1));
		return new OptionPickerMonthDay(page, callback, [
			{data: monthData, index: monthIndex, suffix: "月"}, 
			{data: dayData, index: dayIndex, suffix: "日"}]);
	}

	//创建时分选择
	static createHourMinute (page: cc.Component, callback: Function | undefined, hourData?: any[], hour?: number, minuteData?: any[], minute?: number)
	{
		hourData = hourData ? hourData : this.number(0, 23);
		minuteData = minuteData ? minuteData : this.number(0, 59);
		var hourIndex = hourData.indexOf(hour ? hour : 0);
		var minuIndex = minuteData.indexOf(minute ? minute : 0);
		return new OptionPicker(page, callback, [
			{data: hourData, index: hourIndex, suffix: "时"},
			{data: minuteData, index: minuIndex, suffix: "分"}]);
	}

	//生成from至to之间的数值数组，label为后缀，默认值：label:undefined
	//ex: (10, 100, "万")
	static number (from?: number, to?: number, label?: string): any[]
	{
		var d = [];
		if (from != undefined && to != undefined)
			for (var i = from; i <= to; i++)
				d.push(label ? i + "" + label : i);
		return d;
	}

	//生成form至to之间的年数组，默认值：from:undefined -- 当前年
	//ex: (2010, 2016)
	//ex: (-3, 0) //当前年-3 至 当前年
	static year (from?: number, to?: number): any[]
	{
		from = from || 0;
		to = to || 0;
		var y = new Date().getFullYear();
		if (Math.abs(from) < 1000) from += y;
		if (Math.abs(to) < 1000) to += y;
		return this.number(from, to);
	}

	//生成from至to之间的月数组，from=0则为当前月，to=0则为当前月，默认值：from=1，to=12
	//ex: (1, 0)、(0, 12)、()
	static month (from?: number, to?: number): any[]
	{
		from = from == undefined ? 1 : (from == 0 ? new Date().getMonth() + 1 : from);
		to = to == undefined ? 12 : (to == 0 ? new Date().getMonth() + 1 : to);
		return this.number(from, to);
	}

	//生成from至to之间的月数组，默认值：from=1，to=31
	//ex: (1, 15)
	static day (from?: number, to?: number): any[]
	{
		return this.number(from ? from : 1, to ? to : 31);
	}
};

//选择器ScrollView
class OptionPickerScrollView
{
	itemHeight = 80;
	scrollView!: cc.ScrollView;
	checkValidHandler?: Function;
	tweenAdjust?: cc.Tween<any>;
	lastY?: number;

	constructor (view: cc.Node, data:[], defaultIndex: number, displayProperty:string, labelSuffix?: string)
	{
		var width = view.getWidth();
		var height = this.itemHeight = 80;
		this.scrollView = view.getComponent(cc.ScrollView)!;
		this.scrollView.content!.getComponent(cc.UITransform)?.setContentSize(view.getContentSize());
		
		var node = new cc.Node();
		node.addComponent(cc.UITransform).setContentSize(width, height*2);
		this.scrollView.content!.addChild(node);

		for (var i in data)
		{
			var text = displayProperty ? data[i][displayProperty] : data[i];
			var itemNode = new cc.Node();
			itemNode.addComponent(cc.UITransform).setContentSize(width, height);
			itemNode.addChild(ui.createLabelNode(labelSuffix ? text + labelSuffix : text, 32, "000000"));
			this.scrollView.content!.addChild(itemNode);
		}

		node = new cc.Node();
		node.addComponent(cc.UITransform).setContentSize(width, height*2);
		this.scrollView.content!.addChild(node);

		this.scrollView.content!.getComponent(cc.Layout)!.updateLayout();
		this.setIndex(defaultIndex);

		view.on(cc.ScrollView.EventType.SCROLL_ENDED, this.onScrollEnded, this);
		view.on(cc.ScrollView.EventType.SCROLLING, this.onScrolling, this);
		view.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
	}

	getIndex (): number
	{
		return Math.round(this.scrollView.getScrollOffset().y / this.itemHeight);
	}

	setIndex (index: number)
	{
		this.scrollView.content!.setPosition(this.scrollView.content!.getPosition().x, index * this.itemHeight + this.scrollView.node.getHeight());
	}

	getPosition (index: number): number
	{
		return index * this.itemHeight;
	}

	onScrollEnded (scrollView: cc.ScrollView)
	{
		//如果在滚动中又按下，isAutoScrolling=true
		//自动滚动结束，或无自动滚动，isAutoScrolling=false
		if (scrollView.isAutoScrolling())
			return;

		var p = Math.round(scrollView.getScrollOffset().y / this.itemHeight) + 1;
		if (this.checkValidHandler && !this.checkValidHandler(this))
			return;

		//滚动停止时没有在label上，则调整位置
		var py = (p - 1) * this.itemHeight;
		if (Math.abs(scrollView.getScrollOffset().y - py) < 1)
			scrollView.content!.setPosition(scrollView.content!.getPosition().x, py + scrollView.node.getHeight());
		else
			this.tweenAdjust = cc.tween(scrollView.content).to(0.5, {position:cc.v3(undefined, py + scrollView.node.getHeight())}).start();
	}

	onScrolling (scrollView: cc.ScrollView)
	{
		if (scrollView.isAutoScrolling())
		{
			if (this.lastY != undefined && Math.abs(scrollView.getScrollOffset().y - this.lastY) < 1)
			{
				this.lastY = undefined;
					scrollView.stopAutoScroll();
			}
			else
				this.lastY = scrollView.getScrollOffset().y;
		}
	}

	onTouchStart ()
	{
		if (this.tweenAdjust)
		{
			this.tweenAdjust.stop();
			this.tweenAdjust = undefined;
		}
	}
}

//选择器界面
class OptionPicker 
{
	callback?: Function;
	dataList!: any[];
	viewList!: any[];
	node?: cc.Node;
	page!: cc.Component;

	constructor (page: cc.Component, callback: Function | undefined, dataList: any[])
	{
		this.page = page;
		this.callback = callback;
		this.dataList = [];
		this.viewList = [];

		res.loadBundleRes(["cx.prefab/cx.picker", "cx.prefab/cx.pickerScrollView"], (assets: any[]) =>
		{
			var node = this.node = cc.instantiate(assets[0].data);
			ui.makeNodeMap(node);
			ui.setAndroidBackHandler(this.close.bind(this));
			ui.gn(node, "spCancel").setTouchCallback(this, this.close, 0);
			ui.gn(node, "layerMask").setTouchCallback(this, this.close, 0);
			ui.gn(node, "spOk").setTouchCallback(this, this.close, 1);

			ui.mainScene.node.addChild(node);
			node.getComponent(cc.Widget).updateAlignment();
			cc.tween(node).by(0.55, {position: cc.v3(undefined, 480)}, {easing: "expoOut"}).start();
			cc.tween(ui.gn(node, "layerMask").getComponent(cc.UIOpacity)).to(0.25, {opacity: 100}).start();

			var viewParent = ui.gn(node, "layerBox");
			var viewWidth = ui.sw / dataList.length;
			for (var i in dataList)
			{
				var obj = dataList[i];
				this.dataList.push(obj.data);

				var view: cc.Node = cc.instantiate(assets[1].data);
				view.getComponent(cc.UITransform)?.setContentSize(viewWidth, view.getHeight());
				viewParent.addChild(view);

				var pickerView: OptionPickerScrollView = new OptionPickerScrollView(view, obj.data, obj.index, obj.display, obj.suffix);
				if (this.checkValidHandler)
					pickerView.checkValidHandler = this.checkValidHandler.bind(this);
				this.viewList.push(pickerView);
			}
			
		});
	}

	close (sender: cc.Node, flag: any)
	{
		if (flag && this.callback)
		{
			var params = [];
			for (var i in this.viewList)
			{
				var index = this.viewList[i].getIndex();
				params.push({index: index, value: this.dataList[i][index]});
			}
			this.callback.apply(this.page, params);
		}
		ui.gn(this.node, "layerMask").setTouchCallback();
		cc.tween(this.node).by(0.55, {position: cc.v3(0, -480)}, {easing: "expoOut"}).call(()=>{this.node?.destroy();}).start();
		cc.tween(ui.gn(this.node, "layerMask").getComponent(cc.UIOpacity)).to(0.25, {opacity: 0}).start();
		ui.setAndroidBackHandler();
	}

	checkValidHandler (scrollView: cc.ScrollView): boolean
	{
		return true;
	}
}

class OptionPickerMonthDay extends OptionPicker
{
	checkValidHandler (scrollView: cc.ScrollView)
	{
		var month = this.dataList[0][this.viewList[0].getIndex()];
		var dayIndex = this.viewList[1].getIndex();
		var day = this.dataList[1][dayIndex];
		var c = new Date(new Date().getFullYear(), month, 0).getDate();
		var d = c - day;
		if (d < 0)
		{
			var p = this.viewList[1].getPosition(dayIndex + d);
			this.viewList[1].view.scrollToOffset(cc.v2(0, p), 0.4);
			return scrollView != this.viewList[1];
		}
		return true;
	}
}

class OptionPickerYearMonthDay extends OptionPicker
{
	checkValidHandler (scrollView: cc.ScrollView)
	{
		var year = this.dataList[0][this.viewList[0].getIndex()];
		var month = this.dataList[1][this.viewList[1].getIndex()];
		var dayIndex = this.viewList[2].getIndex();
		var day = this.dataList[2][dayIndex];
		var c = new Date(year, month, 0).getDate();
		var d = c - day;
		if (d < 0)
		{
			var p = this.viewList[2].getPosition(dayIndex + d);
			this.viewList[2].view.scrollToOffset(cc.v2(0, p), 0.4);
			return scrollView != this.viewList[2];
		}
		return true;
	}
}
