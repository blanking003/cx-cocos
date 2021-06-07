
#pragma once

#include "cocos/base/Value.h"

typedef std::function<void(int v1, std::string v2)> DataCallback;

class NativeIntfClass
{
public:
    virtual std::string call(std::string fname, cc::ValueVector params, const DataCallback& callback){ return nullptr; };
};

