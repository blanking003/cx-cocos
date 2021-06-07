package cx.sys;

import android.graphics.Point;
import android.view.Display;
import android.view.View;

import com.cocos.lib.CocosActivity;

import cx.NativeParams;

public class SysIntf
{
	private static SysIntf s_sharedSysIntf = null;
	public static SysIntf ins()
	{
		if (s_sharedSysIntf == null)
			s_sharedSysIntf = new SysIntf();
		return s_sharedSysIntf;
	}
	
	private static Point screenSize = null;
	public static Point getScreenSize()
	{
		if (screenSize != null)
			return screenSize;
		Display display = CocosActivity.app.getWindowManager().getDefaultDisplay();
		screenSize = new Point();
		display.getRealSize(screenSize);
		return screenSize;
	}
	
	public String call(NativeParams params)
	{
		String fname = params.fname;
		if (fname.equals("moveTaskToBack"))
			this.moveTaskToBack();
		
		else if (fname.equals("getPackageName"))
			return this.getPackageName();
		
		else if (fname.equals("getVersionCode"))
			return this.getVersionCode();
		
		else if (fname.equals("getVersionName"))
			return this.getVersionName();
		
		else if (fname.equals("removeLaunchImage"))
			this.removeLaunchImage();
		
		return "";
	}
	
	public void moveTaskToBack()
	{
		CocosActivity.app.moveTaskToBack(false);
	}
	
	public String getPackageName()
	{
		try
		{
			String packName = CocosActivity.app.getPackageName();
			return String.valueOf(CocosActivity.app.getPackageManager().getPackageInfo(packName, 0).packageName);
		}
		catch (Exception e)
		{
			return "";
		}
	}
	
	public String getVersionCode()
	{
		try
		{
			String packName = CocosActivity.app.getPackageName();
			return String.valueOf(CocosActivity.app.getPackageManager().getPackageInfo(packName, 0).versionCode);
		}
		catch (Exception e)
		{
			return "";
		}
	}
	
	public String getVersionName()
	{
		try
		{
			String packName = CocosActivity.app.getPackageName();
			return CocosActivity.app.getPackageManager().getPackageInfo(packName, 0).versionName;
		}
		catch (Exception e)
		{
			return "";
		}
	}
	
	public void removeLaunchImage()
	{
		View view = CocosActivity.app.getFrameLayout().findViewWithTag("launchImage");
		if (view != null)
		{
			CocosActivity.app.runOnUiThread(new Runnable()
			{
				@Override
				public void run()
				{
					CocosActivity.app.getFrameLayout().removeView(view);
				}
			});
		}
	}
}
