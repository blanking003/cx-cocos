#include "cxCreator.h"
#include "cxIntf.h"

#if CC_PLATFORM == CC_PLATFORM_MAC_IOS
#include "cxMask/cxMaskIntf.h"
#endif

#if CC_PLATFORM != CC_PLATFORM_ANDROID
#include "cxSys/cxSysIntf.h"
#endif

NativeIntfClass* NativeCreator::createNativeClass(std::string classname)
{
    if (classname == "cx")
        return CxIntf::ins();
    
#if CC_PLATFORM == CC_PLATFORM_MAC_IOS

    if (classname == "cx.mask")
        return CxMaskIntf::ins();
    
#endif
    
    
#if CC_PLATFORM != CC_PLATFORM_ANDROID
    
    if (classname == "cx.sys")
        return CxSysIntf::ins();
    
    return createAppNativeClass(classname);
    
#endif
    
    return nullptr;
}

