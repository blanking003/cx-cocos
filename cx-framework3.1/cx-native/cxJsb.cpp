#include "cxJsb.hpp"
#include "cocos/bindings/manual/jsb_conversions.h"
#include "cocos/bindings/manual/jsb_global.h"
#include "platform/FileUtils.h"
#include "cxCreator.h"

se::Object* __jsb_NativeCreator_proto = nullptr;
se::Class* __jsb_NativeCreator_class = nullptr;

//***********************************
//NativeCreator
//***********************************
static bool js_cx_NativeCreator_createNativeClass(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 1) {
        std::string arg0;
        ok &= seval_to_std_string(args[0], &arg0);
        SE_PRECONDITION2(ok, false, "js_cx_NativeCreator_createNativeClass : Error processing arguments");
        NativeIntfClass* result = NativeCreator::createNativeClass(arg0);
        ok &= native_ptr_to_seval<NativeIntfClass>((NativeIntfClass*)result, &s.rval());
        SE_PRECONDITION2(ok, false, "js_cx_NativeCreator_createNativeClass : Error processing arguments");
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 1);
    return false;
}
SE_BIND_FUNC(js_cx_NativeCreator_createNativeClass)

static bool js_NativeCreator_finalize(se::State& s)
{
    // SE_LOGD("jsbindings: finalizing JS object %p (NativeCreator)", s.nativeThisObject());
    auto iter = se::NonRefNativePtrCreatedByCtorMap::find(s.nativeThisObject());
    if (iter != se::NonRefNativePtrCreatedByCtorMap::end())
    {
        se::NonRefNativePtrCreatedByCtorMap::erase(iter);
        NativeCreator* cobj = (NativeCreator*)s.nativeThisObject();
        delete cobj;
    }
    return true;
}
SE_BIND_FINALIZE_FUNC(js_NativeCreator_finalize)

bool js_register_cx_NativeCreator(se::Object* obj)
{
    auto cls = se::Class::create("NativeCreator", obj, nullptr, nullptr);

    cls->defineStaticFunction("createNativeClass", _SE(js_cx_NativeCreator_createNativeClass));
    cls->defineFinalizeFunction(_SE(js_NativeCreator_finalize));
    cls->install();
    JSBClassType::registerClass<NativeCreator>(cls);

    __jsb_NativeCreator_proto = cls->getProto();
    __jsb_NativeCreator_class = cls;

    se::ScriptEngine::getInstance()->clearException();
    return true;
}

//***********************************
//NativeIntfClass
//***********************************

se::Object* __jsb_NativeIntfClass_proto = nullptr;
se::Class* __jsb_NativeIntfClass_class = nullptr;

static bool js_cx_NativeIntfClass_call(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    std::string arg0;
    cc::ValueVector arg1;
    std::function<void (int, std::string)> arg2 = nullptr;
    
    if (argc >= 1)
    {
        ok &= seval_to_std_string(args[0], &arg0);
    }
    
    if (argc >= 2)
    {
        ok &= seval_to_std_string(args[0], &arg0);
        ok &= seval_to_ccvaluevector(args[1], &arg1);
    }
        
    if (ok && argc == 3)
    {
        if (args[2].isObject() && args[2].toObject()->isFunction())
        {
            se::Value jsThis(s.thisObject());
            se::Value jsFunc(args[2]);
            //https://docs.cocos.com/creator/manual/zh/advanced-topics/JSB2.0-learning.html
            //如果当前类是一个单例类，或者永远只有一个实例的类，我们不能用 se::Object::attachObject 去关联, 必须使用 se::Object::root
            //jsThis.toObject()->attachObject(jsFunc.toObject());
            jsFunc.toObject()->root();
            jsThis.toObject()->root();
            
            auto lambda = [=](int larg0, std::string larg1) -> void
            {
                se::ScriptEngine::getInstance()->clearException();
                se::AutoHandleScope hs;
                CC_UNUSED bool ok = true;
                se::ValueArray args;
                args.resize(2);
                ok &= int32_to_seval(larg0, &args[0]);
                ok &= std_string_to_seval(larg1, &args[1]);
                se::Value rval;
                se::Object* thisObj = jsThis.isObject() ? jsThis.toObject() : nullptr;
                se::Object* funcObj = jsFunc.toObject();
                bool succeed = funcObj->call(args, thisObj, &rval);
                if (!succeed)
                {
                    se::ScriptEngine::getInstance()->clearException();
                }
            };
            arg2 = lambda;
        }
    }
        
    SE_PRECONDITION2(ok, false, "js_cx_NativeIntfClass_func : Error processing arguments");
    
    if (ok)
    {
        NativeIntfClass* cobj = (NativeIntfClass*)s.nativeThisObject();
        std::string result = cobj->call(arg0, arg1, arg2);
        std_string_to_seval(result, &s.rval());
        return true;
    }
    return false;
}
SE_BIND_FUNC(js_cx_NativeIntfClass_call)

static bool js_NativeIntfClass_finalize(se::State& s)
{
    // SE_LOGD("jsbindings: finalizing JS object %p (NativeCreator)", s.nativeThisObject());
    auto iter = se::NonRefNativePtrCreatedByCtorMap::find(s.nativeThisObject());
    if (iter != se::NonRefNativePtrCreatedByCtorMap::end())
    {
        se::NonRefNativePtrCreatedByCtorMap::erase(iter);
        NativeIntfClass* cobj = (NativeIntfClass*)s.nativeThisObject();
        delete cobj;
    }
    return true;
}
SE_BIND_FINALIZE_FUNC(js_NativeIntfClass_finalize)

bool js_register_cx_NativeIntfClass(se::Object* obj)
{
    auto cls = se::Class::create("NativeIntfClass", obj, nullptr, nullptr);

    cls->defineFunction("call", _SE(js_cx_NativeIntfClass_call));
    cls->defineFinalizeFunction(_SE(js_NativeIntfClass_finalize));
    cls->install();
    JSBClassType::registerClass<NativeIntfClass>(cls);

    __jsb_NativeIntfClass_proto = cls->getProto();
    __jsb_NativeIntfClass_class = cls;
    
    se::ScriptEngine::getInstance()->clearException();
    return true;
}

//***********************************
//NativeUtils
//***********************************

se::Object* __jsb_NativeUtils_proto = nullptr;
se::Class* __jsb_NativeUtils_class = nullptr;

static bool js_cx_NativeUtils_writeDataToFile(se::State& s)
{
    const auto& args = s.args();
    size_t argc = args.size();
    CC_UNUSED bool ok = true;
    if (argc == 2) {
        cc::Data arg0;
        std::string arg1;
        ok &= seval_to_Data(args[0], &arg0);
        ok &= seval_to_std_string(args[1], &arg1);
        SE_PRECONDITION2(ok, false, "js_engine_FileUtils_writeDataToFile : Error processing arguments");
        bool result = cc::FileUtils::getInstance()->writeDataToFile(arg0, arg1);
        ok &= boolean_to_seval(result, &s.rval());
        SE_PRECONDITION2(ok, false, "js_engine_FileUtils_writeDataToFile : Error processing result");
        return true;
    }
    SE_REPORT_ERROR("wrong number of arguments: %d, was expecting %d", (int)argc, 2);
    return false;
}
SE_BIND_FUNC(js_cx_NativeUtils_writeDataToFile)

bool js_register_cx_NativeUtils(se::Object* obj)
{
    auto cls = se::Class::create("NativeUtils", obj, nullptr, nullptr);

    cls->defineStaticFunction("writeDataToFile", _SE(js_cx_NativeUtils_writeDataToFile));
    cls->install();
    
    __jsb_NativeUtils_proto = cls->getProto();
    __jsb_NativeUtils_class = cls;
    
    se::ScriptEngine::getInstance()->clearException();
    return true;
}

//***********************************
//register
//***********************************

bool register_all_cx(se::Object* obj)
{
    // Get the ns
    se::Value nsVal;
    if (!obj->getProperty("cxnative", &nsVal))
    {
        se::HandleObject jsobj(se::Object::createPlainObject());
        nsVal.setObject(jsobj);
        obj->setProperty("cxnative", nsVal);
    }
    se::Object* ns = nsVal.toObject();

    js_register_cx_NativeCreator(ns);
    js_register_cx_NativeIntfClass(ns);
    js_register_cx_NativeUtils(ns);
    return true;
}
