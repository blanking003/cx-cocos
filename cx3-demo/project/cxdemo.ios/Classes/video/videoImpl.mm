
#import "videoImpl.h"

#import <AVKit/AVKit.h>
#import "AppController.h"
#import "videoIntf.h"

@implementation VideoView
{
    UIViewController* contentController;
    
    //contentController 包含以下内容
    AVPlayerViewController* moviePlayer;
    UIView* tapView;
    UIView* actionView;
    
    //actionView 包含以下内容
    UILabel* lblTimelen;
    UILabel* lblTimelenTotal;
    UIButton* btnPause;
    UIButton* btnResume;
    UIButton* btnClose;
    UISlider* slider;
    
    bool defaultShowBar; //默认是否显示控制栏，默认false
    bool sliderTouchDown;
    bool seekDisabled;
    
    int currTime;
    int priorTime;
    bool playing;
    
    NSTimer* timer;
}

-(id) initWithFrame:(CGRect)frame
{
    [super initWithFrame:frame];
    
    CGRect rect = CGRectMake(0, 0, frame.size.width, frame.size.height);
    
    moviePlayer = [[AVPlayerViewController alloc] init];
    moviePlayer.showsPlaybackControls = NO;
    moviePlayer.view.frame = rect;
    
    contentController = [[UIViewController alloc] init];
    contentController.view.frame = rect;
    [contentController addChildViewController:moviePlayer];
    [contentController.view addSubview:moviePlayer.view];
    [self addSubview:contentController.view];

    self.userInteractionEnabled = false;
    
    moviePlayer.view.backgroundColor = [UIColor colorWithRed:0.01f green:0.01f blue:0.01f alpha:1.0f];
    
    return self;
}

-(void) setPosition:(float)left top:(float)top
{
    [self setCenter: CGPointMake(left + self.bounds.size.width/2, top + self.bounds.size.height/2)];
}

-(void) setFullScreen:(bool)value
{
    if (value)
    {
        [AppController.ins addView:contentController.view];
        [AppController.ins.rootViewController setBarHideStatus:true];
        if (!defaultShowBar)
            [self showBar:true];
        
        //获取视频宽度尺寸
        CGSize videoSize = CGSizeZero;
        NSArray *array = moviePlayer.player.currentItem.tracks;
        for (AVPlayerItemTrack* track in array)
        {
            if ([track.assetTrack.mediaType isEqualToString:AVMediaTypeVideo])
            {
                videoSize = track.assetTrack.naturalSize;
                break;
            }
        }
        
        //如果宽大于高，自动横屏
        CGSize screen = UIScreen.mainScreen.bounds.size;
        if (videoSize.width > videoSize.height)
        {
            [self updateViewSize:CGRectMake(0,0, screen.height, screen.width)];
            contentController.view.center = CGPointMake(screen.width/2, screen.height/2);
            CGAffineTransform transform = CGAffineTransformIdentity;
            transform = CGAffineTransformRotate(transform, M_PI_2);
            contentController.view.transform = transform;
        }
        else
        {
            [self updateViewSize:UIScreen.mainScreen.bounds];
            contentController.view.center = CGPointMake(screen.width/2, screen.height/2);
        }
    }
    else
    {
        [AppController.ins.rootViewController setBarHideStatus:false];
        CGAffineTransform transform = CGAffineTransformIdentity;
        transform = CGAffineTransformRotate(transform, 0);
        contentController.view.transform = transform;
        [self addSubview:contentController.view];
        [self updateViewSize:CGRectMake(0, 0, self.frame.size.width, self.frame.size.height)];
        contentController.view.center = CGPointMake(self.frame.size.width/2, self.frame.size.height/2);
        if (!defaultShowBar)
            [self showBar:false];
    }
}

-(void) updateViewSize:(CGRect)rect
{
    contentController.view.frame = rect;
    moviePlayer.view.frame = CGRectMake(0, 0, rect.size.width, rect.size.height);
    tapView.frame = CGRectMake(0, 0, rect.size.width, rect.size.height);
    actionView.frame = CGRectMake(0, rect.size.height-40, rect.size.width, 40);
    
    int d = rect.size.width*0.1f;
    btnClose.frame = CGRectMake(d-40, 0, 40, 40);
    btnPause.frame = CGRectMake(rect.size.width-d, 0, 40, 40);
    btnResume.frame = CGRectMake(rect.size.width-d, 0, 40, 40);
    lblTimelen.frame = CGRectMake(d, 0, 60, 40);
    lblTimelenTotal.frame = CGRectMake(rect.size.width-d-60, 0, 60, 40);
    slider.frame = CGRectMake(d+70, 15, rect.size.width-d-70 - d-70, 10);
}

-(void) createBarView
{
    if (actionView)
        return;
    
    //点击层
    tapView = [[UIView alloc] init];
    tapView.backgroundColor = [UIColor colorWithRed:1.0 green:0 blue:0 alpha:0.0f];
    tapView.userInteractionEnabled = YES;
    [tapView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(movieClick)]];
    
    //操作栏
    actionView = [[UIView alloc] init];
    actionView.backgroundColor = [UIColor colorWithRed:0 green:0 blue:0 alpha:0.6f];
    
    //进度条
    slider = [[UISlider alloc] init];
    slider.minimumTrackTintColor = [UIColor whiteColor];
    slider.maximumTrackTintColor = [UIColor grayColor];
    slider.minimumValue  = 1;
    slider.maximumValue  = 10000;
    slider.enabled = !seekDisabled;
    [slider addTarget:self action:@selector(onSliderValueChanged) forControlEvents:UIControlEventValueChanged];
    [slider addTarget:self action:@selector(onSliderTouchDown) forControlEvents:UIControlEventTouchDown];
    [slider addTarget:self action:@selector(onSliderTouchUp) forControlEvents:UIControlEventTouchUpInside];
    [slider addTarget:self action:@selector(onSliderTouchUp) forControlEvents:UIControlEventTouchUpOutside];

    //当前播放时间
    lblTimelen = [[UILabel alloc] init];
    lblTimelen.text = @"";
    lblTimelen.font = [UIFont fontWithName:@"Helvetica-Bold" size:14];
    lblTimelen.textColor = [UIColor colorWithRed:200/255.0 green:200/255.0 blue:200/255.0 alpha:1];
    lblTimelen.textAlignment = NSTextAlignmentRight;
    
    //总时长
    lblTimelenTotal = [[UILabel alloc] init];
    lblTimelenTotal.text = @"00:00";
    lblTimelenTotal.font = [UIFont fontWithName:@"Helvetica-Bold" size:14];
    lblTimelenTotal.textColor = [UIColor colorWithRed:200/255.0 green:200/255.0 blue:200/255.0 alpha:1];
    lblTimelenTotal.textAlignment = NSTextAlignmentLeft;
    
    //关闭按钮
    btnClose = [self createButton:@"statics/video_stop.png"];
    [btnClose addTarget:self action:@selector(closeClick) forControlEvents:UIControlEventTouchUpInside];
    
    //暂停按钮
    btnPause = [self createButton:@"statics/video_pause.png"];
    [btnPause addTarget:self action:@selector(pause) forControlEvents:UIControlEventTouchUpInside];
    
    //继续按钮
    btnResume = [self createButton:@"statics/video_play.png"];
    [btnResume addTarget:self action:@selector(resume) forControlEvents:UIControlEventTouchUpInside];
    btnResume.hidden = YES;
    
    [actionView addSubview:slider];
    [actionView addSubview:lblTimelen];
    [actionView addSubview:lblTimelenTotal];
    [actionView addSubview:btnClose];
    [actionView addSubview:btnPause];
    [actionView addSubview:btnResume];
    
    [contentController.view addSubview:tapView];
    [contentController.view addSubview:actionView];
    
    [self updateViewSize:CGRectMake(0, 0, self.frame.size.width, self.frame.size.height)];
}

-(void) play:(NSString*)url listenProgress:(bool)listenProgress;
{
    currTime = 0;
    playing = true;
    
    if (moviePlayer.player)
        [moviePlayer.player release];
    
    if ([[url substringToIndex:4] caseInsensitiveCompare:@"http"] == NSOrderedSame)
    {
        moviePlayer.player = [AVPlayer playerWithURL:[NSURL URLWithString:url]];
    }
    else //from statics
    {
        NSString* fileName = [url substringToIndex:url.length-4];
        NSString* filePath = [[NSBundle mainBundle] pathForResource:[NSString stringWithFormat:@"statics/%@", fileName] ofType:@".mp4"];
        moviePlayer.player = [AVPlayer playerWithURL:[NSURL fileURLWithPath:filePath]];
    }
    [moviePlayer.player play];
    
    if (listenProgress)
        timer = [NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(updateClock:) userInfo:nil repeats:YES];
}

-(void) seekToTime:(int)seconds
{
    if (moviePlayer)
        [moviePlayer.player seekToTime:CMTimeMake(seconds*10000, 10000) toleranceBefore:kCMTimeZero toleranceAfter:kCMTimeZero];
}

-(void) onSliderTouchDown
{
    sliderTouchDown = true;
}

-(void) onSliderTouchUp
{
    sliderTouchDown = false;
}

-(void) onSliderValueChanged
{
    int value = round(slider.value);
    int total = round(moviePlayer.player.currentItem.duration.value/moviePlayer.player.currentItem.duration.timescale);
    int curr = round((double)value/10000.0f*(double)total);
    int delta = priorTime - curr;
    if (delta >= 1 || delta <= -1)
    {
        priorTime = curr;
        [self seekToTime:curr];
        lblTimelen.text = [self formatTime:curr];
    }
}

-(void) updateClock:(NSTimer *)timer
{
    if (!playing)
        return;
    int total = round(moviePlayer.player.currentItem.duration.value/moviePlayer.player.currentItem.duration.timescale);
    if (total <= 0)
        return;
    int curr = round(moviePlayer.player.currentTime.value/moviePlayer.player.currentTime.timescale);
    //NSLog(@"%lld, %d, %d", moviePlayer.player.currentTime.value, moviePlayer.player.currentTime.timescale, curr);
    if (actionView != NULL && !sliderTouchDown)
    {
        lblTimelen.text = [self formatTime:curr];
        if ([lblTimelenTotal.text isEqualToString:@"00:00"])
            lblTimelenTotal.text = [self formatTime:total];
        [slider setValue:round((double)curr/(double)total*10000.0f)];
    }
    if (curr > currTime)
        currTime = curr;
    
    VideoIntf::ins()->callJs(8, std::to_string(currTime));
    
    if (curr >= total)
        [self videoFinished];
}

-(NSString*) formatTime:(double)d
{
    int c = (int)d;
    int c_m = c/60;
    int c_s = c%60;
    return [NSString stringWithFormat:@"%s%d:%s%d", c_m < 10 ? "0" : "" , c_m, c_s < 10 ? "0" : "", c_s];
}

-(void) showBar:(bool)value
{
    [self createBarView];
    [actionView setHidden:!value];
}

-(void) lockSeek:(bool)value
{
    seekDisabled = !value;
    if (slider)
        slider.enabled = !value;
}

-(void) pause
{
    if (playing)
    {
        playing = false;
        if (actionView)
        {
            btnPause.hidden = true;
            btnResume.hidden = false;
        }
        if (moviePlayer)
            [moviePlayer.player pause];
    }
}

-(void) resume
{
    if (!playing)
    {
        playing = true;
        if (actionView)
        {
            btnPause.hidden = false;
            btnResume.hidden = true;
        }
        if (moviePlayer)
        {
            int total = round(moviePlayer.player.currentItem.duration.value/moviePlayer.player.currentItem.duration.timescale);
            int curr = round(moviePlayer.player.currentTime.value/moviePlayer.player.currentTime.timescale);
            if (total > 0 && curr >= total)
                [self seekToTime:0];
            [moviePlayer.player play];
        }
    }
}

-(void) movieClick
{
    if (actionView)
        [actionView setHidden:!actionView.isHidden];
}

-(void) closeClick
{
    [self setFullScreen:false];
}

-(void) close
{
    [timer invalidate];
    timer = nil;
    playing = false;
    
    [moviePlayer.player pause];
    [moviePlayer.view removeFromSuperview];
    [self removeFromSuperview];
}

-(void) videoFinished
{
    playing = false;
    if (actionView)
    {
        [actionView setHidden:false];
        [btnPause setHidden:true];
        [btnResume setHidden:false];
    }
    currTime = (int)moviePlayer.player.currentTime.value/moviePlayer.player.currentTime.timescale;
    VideoIntf::ins()->callJs(3, std::to_string(currTime));
}

-(UIButton*)createButton:(NSString*)img
{
    UIButton* btn = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    btn.contentVerticalAlignment = UIControlContentVerticalAlignmentCenter;
    
    UIImage *image = [UIImage imageNamed:img];
    [btn setImage:image forState:UIControlStateNormal];
    [btn setImageEdgeInsets:UIEdgeInsetsMake(0, 0, 0, 0)];
    
    return btn;
}

-(void) playStateChange
{
//    MPMoviePlaybackState state = [moviePlayer playbackState];
//    switch (state)
//    {
//        case MPMoviePlaybackStatePaused:
//            //mediaPlayerIntf->mediaCallback(1, 0);
//            break;
//        case MPMoviePlaybackStateStopped:
//            //mediaPlayerIntf->mediaCallback(2, 0);
//            break;
//        case MPMoviePlaybackStatePlaying:
//            if (currTime > [moviePlayer currentPlaybackTime])
//            {
//                [moviePlayer setCurrentPlaybackTime:currTime];
//                currTime = (int)[moviePlayer currentPlaybackTime];
//            }
//            //mediaPlayerIntf->mediaCallback(0, 0);
//            break;
//        case MPMoviePlaybackStateInterrupted:
//            break;
//        case MPMoviePlaybackStateSeekingBackward:
//            break;
//        case MPMoviePlaybackStateSeekingForward:
//            break;
//        default:
//            break;
//    }
}


@end
