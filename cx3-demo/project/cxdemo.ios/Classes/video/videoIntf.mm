
#include "videoIntf.h"

#include "videoImpl.h"
#include "cxMaskIntf.h"
#include "AppController.h"

static VideoIntf* s_sharedVideoIntf = nullptr;
VideoIntf* VideoIntf::ins()
{
    if (!s_sharedVideoIntf)
    {
        s_sharedVideoIntf = new VideoIntf();
        s_sharedVideoIntf->dataCallback = nullptr;
    }
    return s_sharedVideoIntf;
}

std::unordered_map<std::string, VideoView*> m_videoList;
VideoView* getVideoView(std::string name)
{
    auto itr = m_videoList.find(name);
    if (itr != m_videoList.end())
        return itr->second;
    return nullptr;
}

std::string VideoIntf::call(std::string fname, cc::ValueVector params, const DataCallback& callback)
{
    //在指定的maskView中创建videoView
    if (fname == "createInMask")
    {
        std::string videoName = params.at(0).asString();
        std::string maskName = params.at(1).asString();
        float rectX = params.at(2).asFloat();
        float rectY = params.at(3).asFloat();
        float rectW = params.at(4).asFloat();
        float rectH = params.at(5).asFloat();
        createInMask(videoName, maskName, rectX, rectY, rectW, rectH);
    }
    
    else if (fname == "create")
    {
        std::string videoName = params.at(0).asString();
        float rectX = params.at(1).asFloat();
        float rectY = params.at(2).asFloat();
        float rectW = params.at(3).asFloat();
        float rectH = params.at(4).asFloat();
        create(videoName, rectX, rectY, rectW, rectH);
    }
    
    else if (fname == "setRoundRadius")
    {
        std::string videoName = params.at(0).asString();
        float radius = params.at(1).asFloat();
        setRoundRadius(videoName, radius);
    }
    
    else if (fname == "setPosition")
    {
        std::string videoName = params.at(0).asString();
        float rectX = params.at(1).asFloat();
        float rectY = params.at(2).asFloat();
        setPosition(videoName, rectX, rectY);
    }
    
    //删除指定的videoView
    else if (fname == "removeVideo")
    {
        std::string videoName = params.at(0).asString();
        removeVideo(videoName);
    }
    
    //删除指定maskView中的所有videoView
    else if (fname == "removeInMask")
    {
        std::string maskName = params.at(0).asString();
        removeInMask(maskName);
    }
    
    else if (fname == "play")
    {
        std::string videoName = params.at(0).asString();
        std::string url = params.at(1).asString();
        play(videoName, url, callback);
    }
    
    else if (fname == "setFullScreen")
    {
        std::string videoName = params.at(0).asString();
        bool value = params.at(1).asBool();
        setFullScreen(videoName, value);
    }
    
    else if (fname == "pause")
    {
        std::string videoName = params.at(0).asString();
        pause(videoName, params.at(1).asBool());
    }
    
    else if (fname == "resume")
    {
        std::string videoName = params.at(0).asString();
        resume(videoName);
    }
    
    else if (fname == "seekToTime")
    {
        std::string videoName = params.at(0).asString();
        int seconds = params.at(1).asInt();
        seekToTime(videoName, seconds);
    }
    
    else if (fname == "lockSeek")
    {
        std::string videoName = params.at(0).asString();
        bool value = params.at(1).asBool();
        lockSeek(videoName, value);
    }
    
    else if (fname == "showBar")
    {
        std::string videoName = params.at(0).asString();
        bool value = params.at(1).asBool();
        showBar(videoName, value);
    }
    
    return "";
}

void VideoIntf::callJs(int state, std::string value)
{
    if (dataCallback)
        dataCallback(state, value);
}

void VideoIntf::createInMask(std::string videoName, std::string maskName, float rectX, float rectY, float rectW, float rectH)
{
    if (!getVideoView(videoName))
    {
        VideoView* videoView = [[VideoView alloc] initWithFrame:CGRectMake(rectX, rectY, rectW, rectH)];
        videoView.backgroundColor = [UIColor colorWithRed:0 green:0 blue:255 alpha:1];
        CxMaskIntf::ins()->addNativeView(maskName, videoView);
        m_videoList.emplace(videoName, videoView);
    }
}

void VideoIntf::create(std::string videoName, float rectX, float rectY, float rectW, float rectH)
{
    if (!getVideoView(videoName))
    {
        VideoView* videoView = [[VideoView alloc] initWithFrame:CGRectMake(rectX, rectY, rectW, rectH)];
        [AppController.ins addView:videoView];
        m_videoList.emplace(videoName, videoView);
    }
}

void VideoIntf::setRoundRadius(std::string videoName, float radius)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
    {
        UIBezierPath* round =[UIBezierPath bezierPathWithRoundedRect:videoView.bounds cornerRadius:radius];
        CAShapeLayer* maskLayer = [CAShapeLayer layer];
        maskLayer.path = [round CGPath];
        maskLayer.fillRule = kCAFillRuleNonZero;
        videoView.layer.mask = maskLayer;
    }
}

void VideoIntf::setPosition(std::string videoName, float rectX, float rectY)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
        [videoView setPosition:rectX top:rectY];
}

void VideoIntf::removeVideo(std::string videoName)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
    {
        [videoView close];
        m_videoList.erase(videoName);
    }
}

void VideoIntf::removeInMask(std::string maskName)
{
    if (maskName.empty())
        return;
    for (auto itr = m_videoList.begin(); itr != m_videoList.end();)
    {
        auto videoView = itr->second;
        if (CxMaskIntf::ins()->hasNativeView(maskName, videoView))
        {
            [videoView close];
            m_videoList.erase(itr++);
        }
        else
            ++itr;
    }
}

void VideoIntf::play(std::string videoName, std::string url, const DataCallback& callback)
{
    dataCallback = callback;
    auto videoView = getVideoView(videoName);
    if (videoView)
    {
        [videoView play:[NSString stringWithUTF8String:url.c_str()]  listenProgress:!!callback];
    }
}

void VideoIntf::setFullScreen(std::string videoName, bool value)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
        [videoView setFullScreen:value];
}

void VideoIntf::pause(std::string videoName, bool hide)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
    {
        [videoView pause];
        if (hide)
            [videoView setHidden:true];
    }
}

void VideoIntf::resume(std::string videoName)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
    {
        [videoView resume];
        if (videoView.isHidden)
            [videoView setHidden:false];
    }
}

void VideoIntf::seekToTime(std::string videoName, int seconds)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
        [videoView seekToTime:seconds];
}

void VideoIntf::lockSeek(std::string videoName, bool value)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
        [videoView lockSeek:value];
}

void VideoIntf::showBar(std::string videoName, bool value)
{
    auto videoView = getVideoView(videoName);
    if (videoView)
        [videoView showBar:value];
}


