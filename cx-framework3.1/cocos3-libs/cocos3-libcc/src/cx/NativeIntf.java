package cx;

import com.cocos.lib.CocosHelper;
import com.cocos.lib.CocosJavascriptJavaBridge;

import cx.mask.MaskIntf;
import cx.sys.SysIntf;

public class NativeIntf
{
	public interface JsInterface
	{
		String call(NativeParams params);
	}
	
	private static JsInterface jsInterface = null;
	public static void setJsIntf(JsInterface jsInterface)
	{
		NativeIntf.jsInterface = jsInterface;
	}
	
	public static String call(String classname, String fname, String params)
	{
		NativeParams nativeParams = new NativeParams(classname, fname, params.split("#@#"));
		if (classname.equals("cx.sys"))
			return SysIntf.ins().call(nativeParams);

		if (classname.equals("cx.mask"))
			return MaskIntf.ins().call(nativeParams);

		if (jsInterface != null)
			return jsInterface.call(nativeParams);

		return "";
	}
	
	public static void callJs(final String classname, final int v1, final String v2)
	{
		CocosHelper.runOnGameThread(new Runnable()
		{
			@Override
			public void run()
			{
				CocosJavascriptJavaBridge.evalString("cx.native.androidCallback('" + classname + "'," + v1 + ",'" + v2 + "')");
			}
		});
	}
	
//	CocosActivity.app.runOnUiThread(new Runnable()
//	{
//		@Override
//		public void run()
//		{
//
//		}
//	});
}
