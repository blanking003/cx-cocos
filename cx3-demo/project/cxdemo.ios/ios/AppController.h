#import <UIKit/UIKit.h>

#import "ViewController.h"

@interface AppController : NSObject <UIApplicationDelegate>

@property (strong, nonatomic) ViewController* rootViewController;        //cocos root view
@property (strong, nonatomic) UINavigationController* appViewController; //app root view

@property (nonatomic) bool isFullScreen;

+ (AppController *)ins;

- (void) pushViewController:(UIViewController*)vc animated:(BOOL)animated;
- (void) addView:(UIView*)view;
- (void) removeLaunchImage;

@end


