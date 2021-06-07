#pragma once

#include "cocos/bindings/jswrapper/SeApi.h"

extern se::Object* __jsb_NativeCreator_proto;
extern se::Class* __jsb_NativeCreator_class;

bool js_register_NativeCreator(se::Object* obj);
bool register_all_cx(se::Object* obj);
SE_DECLARE_FUNC(js_cx_NativeCreator_createNativeClass);

