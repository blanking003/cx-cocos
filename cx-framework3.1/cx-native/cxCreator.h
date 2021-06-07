
#pragma once

#include "cxDefine.h"

#if CC_PLATFORM != CC_PLATFORM_ANDROID
extern NativeIntfClass* createAppNativeClass(std::string classname);
#endif

class NativeCreator
{
public:
	static NativeIntfClass* createNativeClass(std::string classname);
};

