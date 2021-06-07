
#pragma once

#include "cxDefine.h"

class CxMaskIntf : public NativeIntfClass
{
public:
    static CxMaskIntf* ins();

    virtual std::string call(std::string fname, cc::ValueVector params, const DataCallback& callback) override;
    
    void addNativeView(std::string maskName, void* view);
    bool hasNativeView(std::string maskName, void* view);
    
private:
    

};

