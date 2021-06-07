package cx3.blank.demo;

import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PermsissionClass
{
	private static int mapMngRequestCode = 100;
	private static Map<Integer, PermsissionReq> mapReq = new HashMap<>();
	
	public interface PermsissionInterface
	{
		void checkPermissionCallback(int requestCode, boolean granted);
	}
	
	public static int makeRequestCode()
	{
		return ++mapMngRequestCode;
	}
	
	///////检查是否有权限并申请
	public static void checkPermission(Context context, PermsissionInterface intf, int requestCode, String[] permissions)
	{
		PermsissionReq req = mapReq.get(requestCode);
		if (req != null)
		{
			intf.checkPermissionCallback(requestCode, req.granted);
			return;
		}
		if (Build.VERSION.SDK_INT < 23)
		{
			intf.checkPermissionCallback(requestCode, true);
			return;
		}
		try
		{
			List<String> needRequestPermissonList = new ArrayList<>();
			for (String perm : permissions)
			{
				if (context.getApplicationInfo().targetSdkVersion >= 23)
				{
					Method checkSelfMethod = context.getClass().getMethod("checkSelfPermission", String.class);
					Method shouldShowRequestPermissionRationaleMethod = context.getClass().getMethod("shouldShowRequestPermissionRationale", String.class);
					if ((Integer) checkSelfMethod.invoke(context, perm) != PackageManager.PERMISSION_GRANTED || (Boolean) shouldShowRequestPermissionRationaleMethod.invoke(context, perm))
						needRequestPermissonList.add(perm);
				}
//				else
//				{
//					if (PermissionChecker.checkSelfPermission(context, perm) != PackageManager.PERMISSION_GRANTED)
//						needRequestPermissonList.add(perm);
//				}
			}
			
			if (needRequestPermissonList.size() == 0)
			{
				intf.checkPermissionCallback(requestCode, true);
				return;
			}
			
			req = new PermsissionReq();
			req.intf = intf;
			req.granted = false;
			mapReq.put(requestCode, req);
			
			String[] array = needRequestPermissonList.toArray(new String[needRequestPermissonList.size()]);
			Method method = context.getClass().getMethod("requestPermissions", new Class[]{String[].class, int.class});
			method.invoke(context, array, requestCode);
			
		} catch (Throwable e)
		{
		}
	}
	
	public static void onRequestPermissionsResult(int requestCode, String[] permissions, int[] paramArrayOfInt)
	{
		boolean granted = true;
		for (int result : paramArrayOfInt)
		{
			if (result != PackageManager.PERMISSION_GRANTED)
			{
				granted = false;
				break;
			}
		}
		PermsissionReq req = mapReq.get(requestCode);
		if (req != null)
		{
			req.granted = granted;
			req.intf.checkPermissionCallback(requestCode, granted);
		}
	}
	
}

class PermsissionReq
{
	public PermsissionClass.PermsissionInterface intf;
	public boolean granted;
}