import {_decorator, Component, Node, color, Label} from 'cc';
const {ccclass} = _decorator;

@ccclass('start')
class Start extends Component 
{
	tabs!: any[];
	onLoad () 
	{
		console.log("Start onLoad...");

		this.node.slideEventDisabled = true;
		this.node.pageActionDisabled = true;
		this.node.androidBackHandler = "closeApp";

		this.tabs = [
			{name: "ui/home"},
			{name: "ui/mine"}
		];

		cx.gn(this, "tabHome").setTouchCallback(this, this.showTab, 0);
		cx.gn(this, "tabMine").setTouchCallback(this, this.showTab, 1);

		this.showTab(undefined, 0);
	}

	showTab (sender: any, index: any)
	{
		for (var i in this.tabs)
		{
			var tab: any = this.tabs[i];
			if (tab.page)
				tab.page.active = i == index;
			else if (i == index)
			{
				tab.page = {};
				cx.addPage(cx.gn(this, "layerPage"), tab.name, undefined, (page:Node) => { this.tabs[index].page = page; });
			}
		}
		var children = cx.gn(this, "layerTab").children;
		for (var i in children)
		{
			var child:Node = children[i];
			child.getChildByName("img")!.active = i == index;
			child.getChildByName("imgGray")!.active = i != index;
			child.getChildByName("label")!.getComponent(Label)!.color = color(i == index ? "22A1FF" : "777777");
		}
	}
}
