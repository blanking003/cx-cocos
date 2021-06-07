#include "AppController.h"
#import "ViewController.h"
#include "platform/ios/View.h"

#include "service/SDKWrapper.h"
#include "Game.h"

@implementation AppController

Game* game = nullptr;
@synthesize window;

#pragma mark -
#pragma mark Application lifecycle

static AppController* s_sharedAppController;

+ (AppController*)ins
{
    return s_sharedAppController;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    s_sharedAppController = self;
    
    [[SDKWrapper shared] application:application didFinishLaunchingWithOptions:launchOptions];
    CGRect bounds = [[UIScreen mainScreen] bounds];
    self.window = [[UIWindow alloc] initWithFrame: bounds];
    
    /*
    appViewController: UINavigationController作为整个app的根视图
    如需打开一个全屏的原生视图控制器vc就可以这样:
        [AppController.ins pushViewController:vc animated:YES]; //默认就有右移退出功能
      
    如需打开一个原生与cocos融合的界面，可以使用:
        [AppController.ins addSubview:view];
    */

    self.rootViewController = [[ViewController alloc] initWithNibName:nil bundle:nil];
    // self.rootViewController.wantsFullScreenLayout = YES;
    // [self.window setRootViewController: self.rootViewController];
    
    self.appViewController = [[UINavigationController alloc] initWithRootViewController:self.rootViewController];
    self.appViewController.navigationBarHidden = YES;
    self.appViewController.view = [[View alloc] initWithFrame:bounds];
    self.appViewController.view.contentScaleFactor = UIScreen.mainScreen.scale;
    self.appViewController.view.multipleTouchEnabled = false;   //是否隐藏系统栏
    [self.window setRootViewController: self.appViewController];
    [self.window makeKeyAndVisible];
    
    //添加图片铺满全屏，LaunchScreen.storyboard中相应设置LaunchImage的content mode缩放方式为Aspect fill，这样图片就看起来没变
    UIImageView *backgroundView = [[UIImageView alloc] initWithFrame: bounds];
    backgroundView.contentMode = UIViewContentModeScaleAspectFill;
    backgroundView.image = [UIImage imageNamed:@"LaunchImage.png"];
    [self.appViewController.view addSubview:backgroundView];
    
    //设置系统状态栏是否可见
    //无效：[[UIApplication sharedApplication] setStatusBarHidden: YES];
    //在RootViewController.prefersStatusBarHidden方法中设置
    
    /* updateViewSize方法不存在了
    [[NSNotificationCenter defaultCenter] addObserver:self
        selector:@selector(statusBarOrientationChanged:)
        name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
    */
    
    game = new Game(bounds.size.width, bounds.size.height);
    game->init();

    return YES;
}

- (void) removeLaunchImage
{
    for (UIView* subview in self.appViewController.view.subviews)
    {
        if ([subview isKindOfClass:[UIImageView class]])
            [subview removeFromSuperview];
    }
}

/*
- (void)statusBarOrientationChanged:(NSNotification *)notification
{
    CGRect bounds = [UIScreen mainScreen].bounds;
    float scale = [[UIScreen mainScreen] scale];
    float width = bounds.size.width * scale;
    float height = bounds.size.height * scale;
    game->updateViewSize(width, height);
}
*/

-(UIInterfaceOrientationMask)application:(UIApplication*)application supportedInterfaceOrientationsForWindow:(UIWindow*)window
{
    if (self.isFullScreen)
    {
        [self setBarHideStatus:TRUE];
        return UIInterfaceOrientationMaskLandscapeLeft | UIInterfaceOrientationMaskLandscapeRight;
    }
    else
    {
        [self setBarHideStatus:FALSE];
        return UIInterfaceOrientationMaskPortrait;
    }
}

- (void)setBarHideStatus:(bool)status
{
    [self.rootViewController setBarHideStatus:status];
}

- (void)pushViewController:(UIViewController*)vc animated:(BOOL)animated
{
    [self.appViewController pushViewController:vc animated:animated];
}

- (void)addView:(UIView*)view
{
    [self.appViewController.view addSubview:view];
}

- (void)applicationWillResignActive:(UIApplication *)application {
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
    [[SDKWrapper shared] applicationWillResignActive:application];
    game->onPause();
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    /*
     Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
     */
     [[SDKWrapper shared] applicationDidBecomeActive:application];
    game->onResume();
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
     If your application supports background execution, called instead of applicationWillTerminate: when the user quits.
     */
    [[SDKWrapper shared] applicationDidEnterBackground:application];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    /*
     Called as part of  transition from the background to the inactive state: here you can undo many of the changes made on entering the background.
     */
    [[SDKWrapper shared] applicationWillEnterForeground:application];
}

- (void)applicationWillTerminate:(UIApplication *)application {
    [[SDKWrapper shared] applicationWillTerminate:application];
    delete game;
    game = nullptr;
}

#pragma mark -
#pragma mark Memory management

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    [[SDKWrapper shared] applicationDidReceiveMemoryWarning:application];
    cc::EventDispatcher::dispatchMemoryWarningEvent();
}

@end
