
#pragma once

#include "cxDefine.h"

class SystemIntf : public NativeIntfClass
{
public:
    static SystemIntf* ins();
    virtual std::string call(std::string fname, cc::ValueVector params, const DataCallback& callback) override;
    
private:
    
    DataCallback dataCallback;
};

