package cx.mask;

import android.graphics.Point;
import android.view.View;
import android.widget.FrameLayout;

import com.cocos.lib.CocosActivity;

import cx.sys.SysIntf;

public class MaskView
{
	public FrameLayout view;
	public FrameLayout contentView;
	private int viewWidth;
	private int viewHeight;
	
	public MaskView()
	{
	
	}
	
	public void initFrame(final int rectX, final int rectY, final int rectW, final int rectH)
	{
		FrameLayout.LayoutParams lParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);
		lParams.leftMargin = rectX;
		lParams.topMargin = rectY;
		lParams.width = rectW;
		lParams.height = rectH;
		view = new FrameLayout(CocosActivity.app);
		CocosActivity.app.getFrameLayout().addView(view, lParams);
		// view.setBackgroundColor(Color.parseColor("#500000ff"));
		
		Point screenSize = SysIntf.getScreenSize();
		FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);
		params.leftMargin = -rectX;
		params.topMargin = -rectY;
		params.width = screenSize.x;
		params.height = screenSize.y;
		contentView = new FrameLayout(CocosActivity.app);
		view.addView(contentView, params);
		// contentView.setBackgroundColor(Color.parseColor("#50ff0000"));
	}
	
	public void setMaskSize(int width, int height)
	{
		this.viewWidth = width;
		this.viewHeight = height;
		FrameLayout.LayoutParams lParams = (FrameLayout.LayoutParams) view.getLayoutParams();
		lParams.width = viewWidth;
		lParams.height = viewHeight;
		view.setLayoutParams(lParams);
	}
	
	public void setMaskVisible(final boolean value)
	{
		view.setVisibility(value ? View.VISIBLE : View.INVISIBLE);
	}
	
	public void remove()
	{
		CocosActivity.app.getFrameLayout().removeView(view);
	}
	
}
