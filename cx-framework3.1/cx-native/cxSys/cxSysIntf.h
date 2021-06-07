
#pragma once

#include "cxDefine.h"
#include "cocos/bindings/event/EventDispatcher.h"

class CxSysIntf : public NativeIntfClass
{
public:
    static CxSysIntf* ins();

    virtual std::string call(std::string fname, cc::ValueVector params, const DataCallback& callback) override;

    static DataCallback m_cxSysCallback;

private:
    
    void restartForUpdate(cc::CustomEvent evt);
    
    

};

