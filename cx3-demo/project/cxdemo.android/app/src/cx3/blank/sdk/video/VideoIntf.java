package cx3.blank.sdk.video;

import android.view.View;
import android.widget.FrameLayout;

import com.cocos.lib.CocosActivity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import cx.NativeParams;
import cx.mask.MaskIntf;

public class VideoIntf
{
	private static VideoIntf s_sharedVideoIntf = null;
	public static VideoIntf ins()
	{
		if (s_sharedVideoIntf == null)
			s_sharedVideoIntf = new VideoIntf();
		return s_sharedVideoIntf;
	}
	
	private Map<String, VideoView> videoMap = new HashMap();
	private Map<String, ArrayList<NativeParams>> taskMap = new HashMap();
	
	//创建video是在UI线程，线程未完成时立即调用其他方法就取不到video，因此用队列处理请求，每一个video一个任务队列
	public String call(NativeParams params)
	{
		String videoName = params.at(0).asString();
		ArrayList<NativeParams> taskList = taskMap.get(videoName);
		if (taskList == null)
		{
			taskList = new ArrayList();
			taskMap.put(videoName, taskList);
		}
		taskList.add(params);
		executeTask(taskList);
		return "";
	}
	
	private void executeTask(ArrayList<NativeParams> taskList)
	{
		if (taskList.size() == 0)
			return;
		CocosActivity.app.runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{
				while (taskList.size() > 0)
				{
					NativeParams params = taskList.remove(0);
					callInternal(params);
				}
			}
		});
	}
	
	public String callInternal(NativeParams params)
	{
		String fname = params.fname;
		
		//删除指定maskView中的所有videoView
		if (fname.equals("removeInMask"))
		{
			String maskName = params.at(0).asString();
			removeInMask(maskName);
			return "";
		}
		
		String videoName = params.at(0).asString();
		if (fname.equals("createInMask"))
		{
			String maskName = params.at(1).asString();
			float rectX = params.at(2).asFloat();
			float rectY = params.at(3).asFloat();
			float rectW = params.at(4).asFloat();
			float rectH = params.at(5).asFloat();
			createInMask(videoName, maskName, rectX, rectY, rectW, rectH);
			return "";
		}
		
		else if (fname.equals("create"))
		{
			float rectX = params.at(1).asFloat();
			float rectY = params.at(2).asFloat();
			float rectW = params.at(3).asFloat();
			float rectH = params.at(4).asFloat();
			create(videoName, rectX, rectY, rectW, rectH);
			return "";
		}
		
		VideoView videoView = videoMap.get(videoName);
		if (videoView == null)
			return "";
		
		if (fname.equals("play"))
			videoView.play(params.at(1).asString());
		
		else if (fname.equals("setRoundRadius"))
			videoView.setRoundRadius(params.at(1).asInt());
		
		else if (fname.equals("setPosition"))
			videoView.setPosition(Math.round(params.at(1).asFloat()), Math.round(params.at(2).asFloat()));
		
		else if (fname.equals("setFullScreen"))
			videoView.setFullScreen(params.at(1).asBool());
		
		else if (fname.equals("pause"))
		{
			videoView.pausePlay();
			if (params.at(1).asBool())
				videoView.setVisibility(View.INVISIBLE);
		}
		
		else if (fname.equals("resume"))
		{
			videoView.startPlay();
			if (videoView.getVisibility() == View.INVISIBLE)
				videoView.setVisibility(View.VISIBLE);
		}
		
		else if (fname.equals("seekToTime"))
			videoView.seekTo(params.at(1).asInt()); //seconds
		
		else if (fname.equals("lockSeek"))
			videoView.lockSeek(params.at(1).asBool());
		
		else if (fname.equals("showBar"))
			videoView.showBar(params.at(1).asBool());
		
		else if (fname.equals("removeVideo"))
		{
			videoMap.remove(videoName);
			taskMap.remove(videoName);
			videoView.close();
		}
		
		return "";
	}
	
	public void createInMask(String videoName, String maskName, final float rectX, final float rectY, final float rectW, final float rectH)
	{
		if (videoMap.get(videoName) != null)
			return;
		
		FrameLayout.LayoutParams lParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);
		lParams.leftMargin = Math.round(rectX);
		lParams.topMargin = Math.round(rectY);
		lParams.width = Math.round(rectW);
		lParams.height = Math.round(rectH);
		
		VideoView videoView = new VideoView(lParams);
		if (maskName != null)
			MaskIntf.ins().addNativeView(maskName, videoView, videoName, lParams);
		else
			CocosActivity.app.getFrameLayout().addView(videoView, 0, lParams);
		
		videoMap.put(videoName, videoView);
	}
	
	public void create(String videoName, float rectX, float rectY, float rectW, float rectH)
	{
		createInMask(videoName, null, rectX, rectY, rectW, rectH);
	}
	
	public void removeInMask(final String maskName)
	{
		for (Iterator<Entry<String, VideoView>> it = videoMap.entrySet().iterator(); it.hasNext(); )
		{
			Entry<String, VideoView> item = it.next();
			String videoName = item.getKey();
			VideoView videoView = item.getValue();
			it.remove();
			taskMap.remove(videoName);
			videoView.close();
		}
	}
	
}
