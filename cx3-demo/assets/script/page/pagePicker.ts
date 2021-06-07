import {_decorator, Component, Node, Label} from 'cc';
const {ccclass} = _decorator;

@ccclass('pagePicker')
class PagePicker extends Component 
{
    start () 
    {
        cx.gn(this, "spClose").setTouchCallback(this, cx.closePage);
        cx.gn(this, "spYearMonth").setTouchCallback(this, this.showPicker);
        cx.gn(this, "spMonthDay").setTouchCallback(this, this.showPicker);
        cx.gn(this, "spYearMonthDay").setTouchCallback(this, this.showPicker);
        cx.gn(this, "spHourMinute").setTouchCallback(this, this.showPicker);
        cx.gn(this, "spString").setTouchCallback(this, this.showPicker);
        cx.gn(this, "spObject").setTouchCallback(this, this.showPicker);
    }

    showPicker (sender: Node)
    {
        switch (sender.name)
        {
            case "spYearMonth": cx.picker.createYearMonth(this, this.pickerCallback, cx.picker.year(-1, 1)); break;
            case "spMonthDay": cx.picker.createMonthDay(this, this.pickerCallback, cx.picker.month(1), 2, null, 28); break;
            case "spYearMonthDay": cx.picker.createYearMonthDay(this, this.pickerCallback, cx.picker.year(-3, 0)); break;
            case "spHourMinute": cx.picker.createHourMinute(this, this.pickerCallback); break;
            case "spString": cx.picker.create(this, this.pickerCallback, [{data:["A", "B"], index:1}]); break;
            case "spObject": cx.picker.create(this, this.pickerCallback, [{data:[{id:1, name:"A"}, {id:2, name:"B"}], display:"name", index:1}]); break;
        }
    }

    pickerCallback ()
    {
        var s = "\n";
        for (var i in arguments)
            s += JSON.stringify(arguments[i]) + "\n";
        cx.gn(this, "lblSelected").getComponent(Label)!.string = s;
    }
}

