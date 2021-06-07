package cx3.blank.sdk;

import cx.NativeIntf;
import cx.NativeParams;
import cx3.blank.sdk.system.SystemIntf;
import cx3.blank.sdk.video.VideoIntf;

public class JsIntf
{
	public static void init()
	{
		NativeIntf.setJsIntf(JsIntf::call);
	}
	
	public static String call(NativeParams params)
	{
		String classname = params.classname;
		if (classname.equals("system"))
			return SystemIntf.ins().call(params);
		
		if (classname.equals("video"))
			return VideoIntf.ins().call(params);
		
		return "";
	}
}
