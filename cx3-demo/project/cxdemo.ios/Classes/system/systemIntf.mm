
#include "systemIntf.h"
#include "AppController.h"

static SystemIntf* s_sharedSystemIntf = nullptr;
SystemIntf* SystemIntf::ins()
{
	if (!s_sharedSystemIntf)
		s_sharedSystemIntf = new SystemIntf();
	return s_sharedSystemIntf;
}

std::string SystemIntf::call(std::string fname, cc::ValueVector params, const DataCallback& callback)
{
    // callPhone(std::string num);
    if (fname == "callPhone")
    {
        NSString* strNum = [[NSString alloc] initWithUTF8String:params.at(0).asString().c_str()];
        NSMutableString* msNum = [[NSMutableString alloc] initWithFormat:@"tel:%@", strNum];
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString: msNum] options:@{} completionHandler:nil];
    }
    
    return "";
}
