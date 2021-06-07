#import <Cocoa/Cocoa.h>

#import "ViewController.h"

@interface AppController : NSObject <NSApplicationDelegate>
{
}

@property (strong, nonatomic) ViewController* viewController;

+ (AppController *)ins;
- (void) removeLaunchImage;

@end

