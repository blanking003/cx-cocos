
#pragma once

#include "cxDefine.h"

class VideoIntf : public NativeIntfClass
{
public:
    static VideoIntf* ins();

    virtual std::string call(std::string fname, cc::ValueVector params, const DataCallback& callback) override;
    
    void callJs(int state, std::string value);
    
private:
    
    DataCallback dataCallback;
    
    void createInMask(std::string videoName, std::string maskName, float rectX, float rectY, float rectW, float rectH);
    void create(std::string videoName, float rectX, float rectY, float rectW, float rectH);
    void setRoundRadius(std::string videoName, float radius);
    void setPosition(std::string videoName, float rectX, float rectY);
    void removeVideo(std::string videoName);
    void removeInMask(std::string maskName);
    void play(std::string videoName, std::string url, const DataCallback& callback);
    void setFullScreen(std::string videoName, bool value);
    void pause(std::string videoName, bool hide);
    void resume(std::string videoName);
    void seekToTime(std::string videoName, int seconds);
    void lockSeek(std::string videoName, bool value);
    void showBar(std::string videoName, bool value);

};

