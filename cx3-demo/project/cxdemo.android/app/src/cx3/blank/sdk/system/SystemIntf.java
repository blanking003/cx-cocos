package cx3.blank.sdk.system;

import android.Manifest;
import android.content.Intent;
import android.net.Uri;

import com.cocos.lib.CocosActivity;

import cx.NativeParams;
import cx3.blank.demo.PermsissionClass;

public class SystemIntf
{
	private static SystemIntf s_sharedSystemIntf = null;
	public static SystemIntf ins()
	{
		if (s_sharedSystemIntf == null)
			s_sharedSystemIntf = new SystemIntf();
		return s_sharedSystemIntf;
	}
	
	public String call(NativeParams params)
	{
		String fname = params.fname;
		if (fname.equals("callPhone"))
			checkPermission(fname, params);
		
		return "";
	}
	
	private final int permissionRequestCode = PermsissionClass.makeRequestCode();
	private final String[] permissions = {
			Manifest.permission.CALL_PHONE
	};
	private void checkPermission(String fname, NativeParams params)
	{
		PermsissionClass.checkPermission(CocosActivity.app, new PermsissionClass.PermsissionInterface()
		{
			@Override
			public void checkPermissionCallback(int requestCode, boolean granted)
			{
				if (granted)
				{
					if (fname.equals("callPhone"))
						callPhone(params.at(0).asString());
				}
			}
		}, permissionRequestCode, permissions);
	}
	
	private void callPhone(String phone)
	{
		Intent intent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + phone));
		try
		{
			CocosActivity.app.startActivity(intent);
		}
		catch (SecurityException e)
		{
		
		}
	}
}
