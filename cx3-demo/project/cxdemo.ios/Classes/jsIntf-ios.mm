#include "cxCreator.h"

//#include <AMapFoundationKit/AMapFoundationKit.h>
//#include "amapLocationIntf.h"
#include "systemIntf.h"
#include "videoIntf.h"


void vendorSdkInit(std::string classname);

NativeIntfClass* createAppNativeClass(std::string classname)
{
    vendorSdkInit(classname);
    
//    if (classname == "amapLocation")
//        return AmapLocationIntf::ins();
    
    if (classname == "system")
        return SystemIntf::ins();
    
    if (classname == "video")
        return VideoIntf::ins();
    
    return nullptr;
}

static bool vendorSdkInited = false;
void vendorSdkInit(std::string classname)
{
    if (vendorSdkInited)
        return;
    vendorSdkInited = true;
    
    //[AMapServices sharedServices].apiKey = @"33492236ca1ace0d029c93755fa4d6d0";
}




