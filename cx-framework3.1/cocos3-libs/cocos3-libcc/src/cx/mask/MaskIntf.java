package cx.mask;

import android.view.View;
import android.widget.FrameLayout;

import com.cocos.lib.CocosActivity;

import java.util.HashMap;

import cx.NativeParams;

public class MaskIntf
{
	private static MaskIntf s_sharedMaskIntf = null;
	public static MaskIntf ins()
	{
		if (s_sharedMaskIntf == null)
			s_sharedMaskIntf = new MaskIntf();
		return s_sharedMaskIntf;
	}
	
	public String call(NativeParams params)
	{
		CocosActivity.app.runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{
				callInternal(params);
			}
		});
		return "";
	}
	
	public String callInternal(NativeParams params)
	{
		String fname = params.fname;
		String maskName = params.at(0).asString();
		if (fname.equals("createMask"))
		{
			float rectX = params.at(1).asFloat();
			float rectY = params.at(2).asFloat();
			float rectW = params.at(3).asFloat();
			float rectH = params.at(4).asFloat();
			this.createMask(maskName, rectX, rectY, rectW, rectH);
		}
		
		else if (fname.equals("setMaskVisible"))
		{
			boolean visible = params.at(1).asBool();
			this.setMaskVisible(maskName, visible);
		}
		
		else if (fname.equals("setMaskSize"))
		{
			float rectW = params.at(1).asFloat();
			float rectH = params.at(2).asFloat();
			this.setMaskSize(maskName, rectW, rectH);
		}
		
		else if (fname.equals("setMaskMask"))
		{
			float maskX = params.at(1).asFloat();
			float maskY = params.at(2).asFloat();
			float maskW = params.at(3).asFloat();
			float maskH = params.at(4).asFloat();
			float radius = params.at(5).asFloat();
			this.setMaskMask(maskName, maskX, maskY, maskW, maskH, radius);
		}
		
		else if (fname.equals("clearMaskMask"))
		{
			this.clearMaskMask(maskName);
		}
		
		else if (fname.equals("removeMask"))
		{
			this.removeMask(maskName);
		}
		
		return "";
	}
	
	private HashMap<String, MaskView> maskMap = new HashMap<>();
	public void createMask(String maskName, float rectX, float rectY, float rectW, float rectH)
	{
		if (!maskMap.containsKey(maskName))
		{
			MaskView maskView = new MaskView();
			maskView.initFrame(Math.round(rectX), Math.round(rectY), Math.round(rectW), Math.round(rectH));
			maskMap.put(maskName, maskView);
		}
	}
	
	public void addNativeView(String maskName, View view, String viewTag, FrameLayout.LayoutParams params)
	{
		MaskView maskView = maskMap.get(maskName);
		if (maskView != null)
		{
			view.setTag(viewTag);
			maskView.contentView.addView(view, params);
		}
	}
	
	public boolean hasNativeView(String maskName, String viewTag)
	{
		MaskView maskView = maskMap.get(maskName);
		if (maskView != null)
		{
			int count = maskView.contentView.getChildCount();
			for (int i=0; i<count; i++)
				if (viewTag.equals(maskView.contentView.getChildAt(i).getTag()))
					return true;
		}
		return false;
	}
	
	public void setMaskVisible(String maskName, boolean value)
	{
		MaskView maskView = maskMap.get(maskName);
		if (maskView != null)
			maskView.setMaskVisible(value);
	}
	
	public void setMaskSize(String maskName, float width, float height)
	{
		MaskView maskView = maskMap.get(maskName);
		if (maskView != null)
			maskView.setMaskSize(Math.round(width), Math.round(height));
	}
	
	public void removeMask(String maskName)
	{
		MaskView maskView = maskMap.get(maskName);
		if (maskView != null)
		{
			maskView.remove();
			maskMap.remove(maskView);
		}
	}
	
	public void setMaskMask(String maskName, float maskX, float maskY, float maskW, float maskH, float radius)
	{
		MaskView maskView = maskMap.get(maskName);
		if (maskView != null)
		{
		
		}
	}
	
	public void clearMaskMask(String maskName)
	{
		MaskView maskView = maskMap.get(maskName);
		if (maskView != null)
		{
		
		}
	}
	
}
