#import "ViewController.h"
#include "cocos/bindings/event/EventDispatcher.h"
#include "cocos/platform/Device.h"

//namespace {
//    cc::Device::Orientation _lastOrientation;
//}

@interface ViewController ()

@end

@implementation ViewController

////blank begin
// 下面这个执行不到了，连同removeLaunchImage改到AppController.mm去
//- (void)viewWillAppear:(BOOL)animated
//{
//    [super viewWillAppear:animated];
//
//    UIImageView *backgroundView = [[UIImageView alloc] initWithFrame: bounds];
//    backgroundView.contentMode = UIViewContentModeScaleAspectFill;
//    backgroundView.image = [UIImage imageNamed:@"LaunchImage.png"];
//    [self.view addSubview:backView];
//}

//- (void) removeLaunchImage
//{
//    for (UIView* subview in self.view.subviews)
//    {
//        if([subview isKindOfClass:[UIImageView class]])
//            [subview removeFromSuperview];
//    }
//}

//禁止竖横转屏动画
-(void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator
{
    [super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    [coordinator animateAlongsideTransition:^(id<UIViewControllerTransitionCoordinatorContext> _Nonnull context)
    {
        
    } completion:^(id<UIViewControllerTransitionCoordinatorContext> _Nonnull context)
    {
        [CATransaction commit];
    }];
}

- (void) setBarHideStatus:(bool)hide
{
    self->barHideStatus = hide;
    [self setNeedsStatusBarAppearanceUpdate];
}

- (BOOL) prefersStatusBarHidden
{
    return self->barHideStatus;
}

- (BOOL) prefersHomeIndicatorAutoHidden
{
    return YES;
}

/*
- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator
{
    cc::Device::Orientation orientation = _lastOrientation;
    // reference: https://developer.apple.com/documentation/uikit/uiinterfaceorientation?language=objc
    // UIInterfaceOrientationLandscapeRight = UIDeviceOrientationLandscapeLeft
    // UIInterfaceOrientationLandscapeLeft = UIDeviceOrientationLandscapeRight
    switch ([UIDevice currentDevice].orientation) {
        case UIDeviceOrientationPortrait:
            orientation = cc::Device::Orientation::PORTRAIT;
            break;
        case UIDeviceOrientationLandscapeRight:
            orientation = cc::Device::Orientation::LANDSCAPE_LEFT;
            break;
        case UIDeviceOrientationPortraitUpsideDown:
            orientation = cc::Device::Orientation::PORTRAIT_UPSIDE_DOWN;
            break;
        case UIDeviceOrientationLandscapeLeft:
            orientation = cc::Device::Orientation::LANDSCAPE_RIGHT;
            break;
        default:
            break;
    }
    if (_lastOrientation != orientation)
    {
        cc::EventDispatcher::dispatchOrientationChangeEvent((int) orientation);
        _lastOrientation = orientation;
    }
}
*/
////blank end

@end
