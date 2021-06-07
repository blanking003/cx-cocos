
export default 
{
	//在str前补充0，补充至长度len
	prefix: function(str: string | number, len?: number): string
	{
		if (len == undefined)
			len = 2;
		var ret = str + '';
		while (ret.length < len)
			ret = "0" + ret;
		return ret;
	},

	formatTime: function(time: Date, format?: string): string
	{
		var s = (format || "%Y-%m-%d %X").replace("%Y", time.getFullYear()+"");
		s = s.replace("%m", this.prefix(time.getMonth()+1));
		s = s.replace("%d", this.prefix(time.getDate()));
		s = s.replace("%X", this.prefix(time.getHours())+":"+this.prefix(time.getMinutes())+":"+this.prefix(time.getSeconds()));
		s = s.replace("%x", this.prefix(time.getHours())+""+this.prefix(time.getMinutes())+""+this.prefix(time.getSeconds()));
		return s;
	},

    getCurrSecond(ms?:boolean): number
	{
		return Math.floor(new Date().getTime()*(ms ? 1 : 0.001));
	},

	strToSecond: function(stime: string): number
	{
		return Date.parse(stime.replace(/[^0-9: ]/mg, '/')).valueOf()*0.001;
	},
	secondToStr: function(second: number, format?: string): string
	{
		var date = new Date();
		date.setTime(second * 1000);
		return this.formatTime(date, format);
	},
	getCurrDate: function(format?: string): string
	{
		return this.formatTime(new Date(), format || "%Y-%m-%d");
	},
	getCurrTime: function(format?: string): string
	{
		return this.formatTime(new Date(), format);
	},
	getDiffDate: function(diff: number, format?: string): string
	{
		return this.secondToStr(this.getCurrSecond() + diff, format || "%Y-%m-%d");
	},
	getDiffTime: function(diff: number, format?: string): string
	{
		return this.secondToStr(this.getCurrSecond() + diff, format);
	},

	//对象相关
	getObject: function(arr: any[], key: string, value: any): any
	{
		for (var i in arr)
		{
			var same = true;
			for (var j=1; j<arguments.length-1; j+=2)
				if (arr[i][arguments[j]] != arguments[j+1])
				{
					same = false;
					break;
				}
			if (same)
				return arr[i];
		}
		return null;
	},

	getObjects: function(arr: any[]): any[]
	{
		var data = [], same;
		for (var i in arr)
		{
			same = true;
			for (var j=1; j<arguments.length-1; j+=2)
				if (arr[i][arguments[j]] != arguments[j+1])
				{
					same = false;
					break;
				}
			if (same)
				data.push(arr[i]);
		}
		return data;
	},
	getObjectIndex: function(arr: any[]): number
	{
		for (var i in arr)
		{
			var same = true;
			for (var j=1; j<arguments.length-1; j+=2)
				if (arr[i][arguments[j]] != arguments[j+1])
				{
					same = false;
					break;
				}
			if (same)
				return +i;
		}
		return -1;
	},
	getObjectValues: function(obj: any): any
	{
		var s = "";
		for (var i in obj)
			if (i.charAt(0) != "$")
				s += "," + obj[i];
		return s && s.substr(1);
	},

	copyObject: function(obj: any): any
	{
		var ret: any;
		if (Array.isArray(obj))
		{
			ret = [];
			for (var i in obj)
				ret.push(this.copyObject(obj[i]));
		}
		else if (typeof obj == "object")
		{
			ret = {};
			for (var i in obj)
				ret[i] = this.copyObject(obj[i]);
		}
		else 
			ret = obj;
		return ret;
	},
	updateObject: function(obj: any, newObj: any)
	{
		if (newObj)
			for (var i in obj)
				if (newObj[i] != undefined)
					obj[i] = newObj[i];
	},
	extendObject: function(obj: any, newObj: any, ignoreExist?: boolean)
	{
		for (var i in newObj)
			if (!ignoreExist || ignoreExist && obj[i] != undefined)
				obj[i] = newObj[i];
	},
	updateObjectValue: function(arr: any[], key: string, newValue: any)
	{
		for (var i in arr)
			arr[i][key] = newValue;
	},
	dict2Object: function(dictList: any[]): any
	{
		var o, obj: any = {};
		for (var i in dictList)
		{
			o = dictList[i];
			obj[o.dict_field] = obj[o.dict_field] || {obj:{}, list:[]};
			obj[o.dict_field].obj[o.dict_code+""] = o.dict_value;
			obj[o.dict_field].list.push({id:o.dict_code, name:o.dict_value});
		}
		return obj;
	},

	//数据类型相关
	isInteger: function(num: string, min?: number | undefined, max?: number | undefined): boolean
	{
		if (min == undefined)
			min = -2147483648;
		if (max == undefined)
			max = 2147483647;
		var exp = /^-?\d+$/;
		return exp.test(num) && (min == undefined || +num>=min) && (max == undefined || +num<max);
	},
	isNumber: function(num: string, min?: number | undefined, max?: number | undefined): boolean
	{
		var exp = /^(([1-9]\d*)|\d)(\.\d{1,6})?$/;
		return exp.test(num) && (min == undefined || +num>=min) && (max == undefined || +num<max);
	},
	isNumber2: function(num: string, min?: number | undefined, max?: number | undefined): boolean
	{
		var exp = /^(([0-9]\d*)|\d)(\.\d{1,6})?$/;
		return exp.test(num) && (min == undefined || +num>=min) && (max == undefined || +num<max);
	},
	isCurrency: function(num: string, min?: number | undefined, max?: number | undefined): boolean
	{
		var exp = /^(([1-9]\d*)|\d)(\.\d{1,2})?$/;
		return exp.test(num) && (min == undefined || +num>=min) && (max == undefined || +num<max);
	},
	isCurrency4: function(num: string, min?: number | undefined, max?: number | undefined): boolean
	{
		var exp = /^(([1-9]\d*)|\d)(\.\d{1,4})?$/;
		return exp.test(num) && (min == undefined || +num>=min) && (max == undefined || +num<max);
	},
	isIdCard:function(value: string): boolean
	{
		if (value.length != 18)
			return false;
		var IDCARD_18 = /^\d{17}[0-9|x|X]$/;
		if (!value.match(IDCARD_18))
			return false;
		if (+value.substr(6,4)<1900 || +value.substr(6,4)>2100 ||
			+value.substr(10,2)>12 || +value.substr(10,2)<1 ||
			+value.substr(12,2)>31 || +value.substr(12,2)<1)
			return false;
		var Wi = new Array(7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2,1);
		var Ai = new Array('1','0','X','9','8','7','6','5','4','3','2');
		if (value.charAt(17) == 'x')
			value = value.replace("x","X");
		var strSum = 0;
		for (var i=0; i<value.length-1; i++)
			strSum = strSum + +value.charAt(i)*Wi[i];
		return value.charAt(17) == Ai[strSum%11];
	},

	//字符函数
	formatFloat: function(value: number): number
	{
		return Math.round(value*100)/100;
	},
	encode: function(content: string, key?: string): string
	{
		return cx.os.native ? cx.native.ins("cx").call("encode", [content, key || ""]) : content;
	},
	decode: function(content: string, key?: string): string
	{
		return cx.os.native ? cx.native.ins("cx").call("decode", [content, key || ""]) : content;
	},
	md5: function(content: string, key?: string): string
	{
		return cx.os.native ? cx.native.ins("cx").call("md5", [content, key || ""]) : content;
	},
	randomRange: function(min: number, max: number): number
	{
		if (min >= max)
			return min;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	randomArray: function(arr: any[])
	{
		var len = arr.length;
		for (var i=0; i<arr.length; i++)
		{
			var r = this.randomRange(0, len-1);
			var t = arr[i];
			arr[i] = arr[r];
			arr[r] = t;
		}
		return arr;
	},
	//删除str中的指定字符
	strDelete: function(str: string | undefined, c?: string): string
	{
		if (!str)
			return "";
		c = c ? c : '"';
		while (str.indexOf(c) >= 0)
			str = str.replace(c, "");
		return str;
	},
	//按len长度截断str，之后显示为...
	strTruncate: function(str: string | undefined, len: number): string
	{
		if (!str || str.length <= len)
			return str || "";
		return str.substr(0, len-1) + "...";
	}
}
