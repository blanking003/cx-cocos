import sys from './cx.sys';

export default class native
{
	static androidIntf: any = {};
	static undefinedIns = {call:function(){return "";}};

	static ins (name: string): any
	{
		if (!sys.os.native)
			return this.undefinedIns;

		//非android使用jsb c++
		if (!sys.os.android || name == "cx")
			return typeof cxnative != "undefined" && cxnative.NativeCreator.createNativeClass(name) || this.undefinedIns;

		//android使用jsb.reflection
		if (!jsb.reflection)
		{
			console.log("!!!!! error: jsb.reflection is undefined !!!!!");
			return this.undefinedIns;
		}
		
		var intf = this.androidIntf[name];
		if (!intf)
		{
			intf = this.androidIntf[name] = {};
			intf.name = name,
			intf.call = (function(fname: string, params: any[], callback?: Function)
			{
				intf.callback = callback;
				return jsb.reflection.callStaticMethod("cx/NativeIntf", "call", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;", 
					intf.name, fname, params && params.join("#@#") || "");
			}).bind(intf);
		}
		return intf;
	}

	static androidCallback (name: string, v1: number, v2: string)
	{
		var intf = native.androidIntf[name];
		intf && intf.callback && intf.callback(v1, v2);
	}
}