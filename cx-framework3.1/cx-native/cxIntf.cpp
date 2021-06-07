
#include "cxIntf.h"

DataCallback CxIntf::m_cxCallback = NULL;

static CxIntf* s_sharedCxIntf = nullptr;
CxIntf* CxIntf::ins()
{
	if (!s_sharedCxIntf)
		s_sharedCxIntf = new CxIntf();
	return s_sharedCxIntf;
}

std::string CxIntf::call(std::string fname, cc::ValueVector params, const DataCallback& callback)
{
    if (fname == "encode" || fname == "decode" || fname == "md5")
        return params.at(0).asString();
    return "";
}




