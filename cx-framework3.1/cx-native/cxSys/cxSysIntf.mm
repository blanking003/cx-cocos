
#include "cxSysIntf.h"

#include "AppController.h"
#include "platform/Application.h"
#include "cocos/bindings/event/CustomEventTypes.h"

DataCallback CxSysIntf::m_cxSysCallback = NULL;

static CxSysIntf* s_sharedCxSysIntf = nullptr;
CxSysIntf* CxSysIntf::ins()
{
    if (!s_sharedCxSysIntf)
        s_sharedCxSysIntf = new CxSysIntf();
    return s_sharedCxSysIntf;
}

std::string CxSysIntf::call(std::string fname, cc::ValueVector params, const DataCallback& callback)
{
    if (fname == "getStoragePath")
    {
        #if (CC_PLATFORM == CC_PLATFORM_MAC_IOS)
        return "";
        #endif
        return call("getPackageName", params, callback);
    }
        
    if (fname == "getPackageName")
    {
        NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
        NSString* packageName = [infoDictionary objectForKey:@"CFBundleIdentifier"];
        return [packageName UTF8String];
    }
    
    if (fname == "getVersionCode")
    {
        return [[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"] UTF8String];
    }
    
    if (fname == "getVersionName")
    {
        return [[[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"] UTF8String];
    }
    
    
    if (fname == "removeLaunchImage")
    {
        [[AppController ins] removeLaunchImage];
        return "";
    }
    
    //只供在main.js中，且是ios时调用这个方法
    if (fname == "restartForUpdate")
    {
        //ios弹出网络授权时，应用会进入后台，点击后回到前台，侦听回到前台时重启
        cc::EventDispatcher::addCustomEventListener(EVENT_COME_TO_FOREGROUND, CC_CALLBACK_1(CxSysIntf::restartForUpdate, this));
        return "";
    }
    
    return "";
}

void CxSysIntf::restartForUpdate(cc::CustomEvent evt)
{
    if (evt.name == EVENT_COME_TO_FOREGROUND)
    {
        cc::EventDispatcher::removeAllCustomEventListeners(EVENT_COME_TO_FOREGROUND);
        cc::Application::getInstance()->restart();
    }
}
