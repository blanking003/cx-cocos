
#pragma once

#include "cocos/base/Value.h"
#include "cxDefine.h"

class CxIntf : public NativeIntfClass
{
public:
    static CxIntf* ins();

    virtual std::string call(std::string fname, cc::ValueVector params, const DataCallback& callback) override;

    static DataCallback m_cxCallback;
    
private:
    

};

