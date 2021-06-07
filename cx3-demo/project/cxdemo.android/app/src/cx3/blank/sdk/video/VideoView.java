package cx3.blank.sdk.video;

import android.app.Activity;
import android.app.Service;
import android.content.pm.ActivityInfo;
import android.content.res.AssetFileDescriptor;
import android.graphics.Canvas;
import android.graphics.Point;
import android.graphics.Rect;
import android.graphics.RectF;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.opengl.GLSurfaceView;
import android.view.SurfaceHolder;
import android.widget.FrameLayout;
import android.widget.MediaController;

import com.cocos.lib.CocosActivity;

import cx.sys.SysIntf;

public class VideoView extends GLSurfaceView implements SurfaceHolder.Callback,
		MediaController.MediaPlayerControl,
		MediaPlayer.OnPreparedListener,
		MediaPlayer.OnErrorListener
{
	public static final int CB_COMPLETED = 1;
    public static final int CB_ERROR = 2;
	
	private Rect layoutRect = new Rect();
	private String url = null;
	private boolean isFullScreen = false;
	private boolean isMute = false;
	private boolean paused = false;
	private boolean lockSeek = false;
	private int roundRadius = 0;
	
	private Activity activity;
	private MediaPlayer mediaPlayer;
	private MediaController controller;
	private VideoViewInterface videoViewInterface = null;
	private int mCurrentBufferPercentage = 0;
	private static final String assetRoot = "@assets/";
	
	public VideoView(FrameLayout.LayoutParams lParams)
	{
		super(CocosActivity.app, null);
		this.activity = CocosActivity.app;
		
		layoutRect.left = lParams.leftMargin;
		layoutRect.top = lParams.topMargin;
		layoutRect.right = lParams.width;
		layoutRect.bottom = lParams.height;
		
		getHolder().addCallback(this);
		setKeepScreenOn(true);
		setFocusable(true);
		setFocusableInTouchMode(true);
		
		mediaPlayer = new MediaPlayer();
		mediaPlayer.setOnPreparedListener(this);
		mediaPlayer.setOnBufferingUpdateListener(bufferingUpdateListener);
		mediaPlayer.setOnCompletionListener(completionListener);
		
		mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
		mediaPlayer.setScreenOnWhilePlaying(true);
		
		//todo: controller ui
		controller = new MediaController(CocosActivity.app);
		controller.setAnchorView((FrameLayout)this.getParent());
		
		//todo: video mask
//		setWillNotDraw(false);
	}
	
//    @Override
//    public void draw(Canvas canvas)
//    {
//		canvas.clipRect(new RectF(50, 50, 100, 100));
//    	super.draw(canvas);
//    }
	
	public void setPlayCallback(VideoViewInterface videoViewInterface)
    {
        this.videoViewInterface = videoViewInterface;
    }
    
    public interface VideoViewInterface
    {
        void callback(int flag, String value);
    }
    
    public void play(String url)
    {
        try
        {
            if (this.url != null)
            {
                mediaPlayer.pause();
                mediaPlayer.reset();
            }
            this.url = url;
            if (url.startsWith(assetRoot))
            {
                AssetFileDescriptor assetFileDescriptor = activity.getAssets().openFd(url.substring(assetRoot.length()));
                mediaPlayer.setDataSource(assetFileDescriptor.getFileDescriptor(), assetFileDescriptor.getStartOffset(), assetFileDescriptor.getLength());
            }
            /*
            else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && url.charAt(0) == '/')
            {
                Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileProvider", new File(url));
                mediaPlayer.setDataSource(activity, uri);
            }
            */
			else if (url.startsWith("http"))
				mediaPlayer.setDataSource(activity, Uri.parse(url));
			else
			{
				AssetFileDescriptor assetFileDescriptor = activity.getAssets().openFd(url);
				mediaPlayer.setDataSource(assetFileDescriptor.getFileDescriptor(), assetFileDescriptor.getStartOffset(), assetFileDescriptor.getLength());
			}

			mediaPlayer.prepareAsync();
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}
	
	public void close()
	{
		if (mediaPlayer != null)
		{
			mediaPlayer.stop();
			mediaPlayer.reset();
			mediaPlayer.release();
			mediaPlayer = null;
		}
		FrameLayout parent = (FrameLayout)getParent();
		parent.removeView(this);
	}
	
	
	public void setFullScreen(boolean fullScreen)
	{
		if (isFullScreen == fullScreen)
			return;
		isFullScreen = fullScreen;
		updateLayout();
	}
	
	public void updateLayout()
	{
		if (isFullScreen)
		{
			Point screenSize = SysIntf.getScreenSize();
			FrameLayout.LayoutParams lParams = (FrameLayout.LayoutParams) this.getLayoutParams();
			lParams.leftMargin = 0;
			lParams.topMargin = 0;
			lParams.width = screenSize.y;
			lParams.height = screenSize.x;
			this.setLayoutParams(lParams);
//			CocosActivity.app.getFrameLayout().addView(this, lParams);
//			CocosActivity.app.setRequestedOrientation(params.fullScreen ? ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
			CocosActivity.app.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
		}
		else
		{
			FrameLayout.LayoutParams layoutParams = (FrameLayout.LayoutParams) this.getLayoutParams();
			layoutParams.leftMargin = this.layoutRect.left;
			layoutParams.topMargin = this.layoutRect.top;
			layoutParams.width = this.layoutRect.right;
			layoutParams.height = this.layoutRect.bottom;
			this.setLayoutParams(layoutParams);
		}
	}
	
	public void setPosition(int x, int y)
	{
		layoutRect.left = x;
		layoutRect.top = y;
		if (!isFullScreen)
		{
			FrameLayout.LayoutParams layoutParams = (FrameLayout.LayoutParams) this.getLayoutParams();
			layoutParams.leftMargin = x;
			layoutParams.topMargin = y;
			this.setLayoutParams(layoutParams);
		}
	}
	
	public void setRoundRadius(int radius)
	{
		this.roundRadius = radius;
	}
	
	public void seekToTime(int seconds)
	{
	
	}
	
	public void lockSeek(boolean value)
	{
		this.lockSeek = value;
	}
	
	public void showBar(boolean value)
	{
//		playerBar = new MediaPlayerBar(this);
	}
	
	public void setMute(boolean mute)
    {
        if (this.isMute == mute)
            return;
        this.isMute = mute;
        if (mediaPlayer == null)
            return;
        if (mute)
            mediaPlayer.setVolume(0, 0);
        else
        {
            AudioManager audioManager = (AudioManager)activity.getSystemService(Service.AUDIO_SERVICE);
            int current = audioManager.getStreamVolume( AudioManager.STREAM_MUSIC );
            mediaPlayer.setVolume(current, current);
        }
    }
    
    public void startPlay()
    {
        this.paused = false;
        if (mediaPlayer != null)
            mediaPlayer.start();
    }
    
    public void pausePlay()
    {
        this.paused = true;
        if (mediaPlayer != null)
			mediaPlayer.pause();
    }
    
    @Override
    public void start()
    {
        if (mediaPlayer != null)
            mediaPlayer.start();
    }
    
    public void stop()
    {
        if (mediaPlayer != null)
            mediaPlayer.stop();
    }
    
    @Override
    public void pause()
    {
        if (mediaPlayer != null)
            mediaPlayer.pause();
    }
    
    @Override
    public int getDuration()
    {
        return mediaPlayer != null ? mediaPlayer.getDuration() : 0;
    }
    
    @Override
    public int getCurrentPosition()
    {
        return mediaPlayer != null ? mediaPlayer.getCurrentPosition() : 0;
    }
    
    @Override
    public void seekTo(int pos)
    {
        if (mediaPlayer != null)
            mediaPlayer.seekTo(pos);
    }
    
    @Override
    public boolean isPlaying()
    {
        return mediaPlayer != null && mediaPlayer.isPlaying();
    }
    
    @Override
    public int getBufferPercentage()
    {
        return mCurrentBufferPercentage;
    }
    
    @Override
    public boolean canPause()
    {
        return true;
    }
    
    @Override
    public boolean canSeekBackward()
    {
        return !lockSeek;
    }
    
    @Override
    public boolean canSeekForward()
    {
        return !lockSeek;
    }
    
    @Override
    public int getAudioSessionId()
    {
        return mediaPlayer.getAudioSessionId();
    }
    
    @Override
    public void onPrepared(MediaPlayer mediaPlayer)
    {
        if (mediaPlayer != null)
        {
            this.updateLayout();
            mediaPlayer.start();
        }
    }
    
    @Override
    public boolean onError(MediaPlayer mediaPlayer, int what, int extra)
    {
        if (videoViewInterface != null)
            videoViewInterface.callback(CB_ERROR, null);
        return false;
    }
    
    private MediaPlayer.OnBufferingUpdateListener bufferingUpdateListener = new MediaPlayer.OnBufferingUpdateListener()
    {
        public void onBufferingUpdate(MediaPlayer mp, int percent)
        {
            mCurrentBufferPercentage = percent;
        }
    };
    
    private MediaPlayer.OnCompletionListener completionListener = new MediaPlayer.OnCompletionListener()
    {
        public void onCompletion(MediaPlayer mp)
        {
            if (videoViewInterface != null)
                videoViewInterface.callback(CB_COMPLETED, null);
        }
    };
    
    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int w, int h)
    {
        if (mediaPlayer != null)
            mediaPlayer.setDisplay(holder);
    }
    
    @Override
    public void surfaceCreated(SurfaceHolder holder)
    {
        //返回至前台时继续播放
        if (mediaPlayer != null)
        {
            mediaPlayer.setDisplay(holder);
            if (!paused)
                mediaPlayer.start();
        }
    }
    
    @Override
    public void surfaceDestroyed(SurfaceHolder holder)
    {
        if (mediaPlayer == null)
            return;
        //切换至后台时暂停
        if (mediaPlayer.isPlaying())
            mediaPlayer.pause();
    }
    
}
