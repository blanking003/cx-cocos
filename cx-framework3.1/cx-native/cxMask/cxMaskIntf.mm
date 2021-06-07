
#include "cxMaskIntf.h"

#include "AppController.h"
#include "cxMaskView.h"

std::unordered_map<std::string, CxMaskView*> m_maskViewList;
CxMaskView* getMaskView(std::string name)
{
    auto itr = m_maskViewList.find(name);
    if (itr != m_maskViewList.end())
        return itr->second;
    return nullptr;
}

static CxMaskIntf* s_sharedCxMaskIntf = nullptr;
CxMaskIntf* CxMaskIntf::ins()
{
    if (!s_sharedCxMaskIntf)
        s_sharedCxMaskIntf = new CxMaskIntf();
    return s_sharedCxMaskIntf;
}

std::string CxMaskIntf::call(std::string fname, cc::ValueVector params, const DataCallback& callback)
{
    if (fname == "createMask")
    {
        std::string name = params.at(0).asString();
        float rectX = params.at(1).asFloat();
        float rectY = params.at(2).asFloat();
        float rectW = params.at(3).asFloat();
        float rectH = params.at(4).asFloat();
        
        if (getMaskView(name))
            return "";
        
        CxMaskView* maskView = [[CxMaskView alloc] initWithFrame:CGRectMake(rectX, rectY, rectW, rectH)];
        //maskView.contentView.backgroundColor = [UIColor colorWithRed:100 green:0 blue:0 alpha:0.4];
        [[AppController ins] addView:maskView];
        
        m_maskViewList.emplace(name, maskView);
    }
    
    else if (fname == "setMaskVisible")
    {
        std::string name = params.at(0).asString();
        bool visible = params.at(1).asBool();
        
        auto maskView = getMaskView(name);
        if (maskView)
           [maskView setHidden:!visible];
    }
    
    else if (fname == "setMaskSize")
    {
        std::string name = params.at(0).asString();
        float rectW = params.at(1).asFloat();
        float rectH = params.at(2).asFloat();
        
        auto maskView = getMaskView(name);
        if (maskView)
            maskView.frame = CGRectMake(maskView.frame.origin.x, maskView.frame.origin.y, rectW, rectH);
    }
    
    else if (fname == "setMaskMask")
    {
        std::string name = params.at(0).asString();
        auto maskView = getMaskView(name);
        if (maskView)
        {
            float maskX = params.at(1).asFloat();
            float maskY = params.at(2).asFloat();
            float maskW = params.at(3).asFloat();
            float maskH = params.at(4).asFloat();
            float radius = params.at(5).asFloat();
            UIBezierPath* path = [UIBezierPath bezierPathWithRect:maskView.contentView.bounds];
            UIBezierPath* round = [UIBezierPath bezierPathWithRoundedRect:CGRectMake(maskX, maskY, maskW, maskH) cornerRadius:radius];
            CAShapeLayer* maskLayer = [CAShapeLayer layer];
            [path appendPath:round];
            maskLayer.path = [path CGPath];
            maskLayer.fillRule = kCAFillRuleEvenOdd;
            maskView.contentView.layer.mask = maskLayer;
        }
    }
    
    else if (fname == "clearMaskMask")
    {
        std::string name = params.at(0).asString();
        auto maskView = getMaskView(name);
        if (maskView)
            maskView.contentView.layer.mask = nil;
    }
    
    else if (fname == "removeMask")
    {
        std::string name = params.at(0).asString();
        auto maskView = getMaskView(name);
        if (maskView)
        {
            [maskView removeFromSuperview];
            m_maskViewList.erase(name);
        }
    }

    return "";
}

void CxMaskIntf::addNativeView(std::string maskName, void* view)
{
    auto maskView = getMaskView(maskName);
    if (maskView)
       [maskView.contentView addSubview:(UIView*)view];
}

bool CxMaskIntf::hasNativeView(std::string maskName, void* view)
{
    auto maskView = getMaskView(maskName);
    if (maskView)
    {
        for (UIView* subview in maskView.contentView.subviews)
        {
            if (subview == view)
                return true;
        }
    }
    return false;
}
